import { useState, useEffect } from 'react';
import CakeIcon from '@mui/icons-material/Cake';
import SyncIcon from '@mui/icons-material/Sync';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Guest, Pricing, GuestStatus } from './types';
import { storage } from './utils/storage';
import { syncService } from './utils/sync';
import { loadBaseGuests } from './utils/guestsLoader';
import { mergeGuestsWithStatuses } from './utils/guestsMerger';
import { PricingConfig } from './components/PricingConfig';
import { GuestManagement } from './components/GuestManagement';
import { SummaryView } from './components/SummaryView';
import { SyncConfig } from './components/SyncConfig';
import { SyncStatusIndicator } from './components/SyncStatusIndicator';
import { SkeletonLoader } from './components/SkeletonLoader';
import { Toast } from './components/Toast';
import { AUTO_SYNC_INTERVAL_MINUTES, AUTO_SYNC_CHECK_INTERVAL_MS } from './config';
import './App.css';

const ACTIVE_TAB_KEY = 'bday-active-tab';

function App() {
  const [baseGuests] = useState(() => loadBaseGuests());
  const [guests, setGuests] = useState<Guest[]>([]);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [activeTab, setActiveTab] = useState<'guests' | 'pricing' | 'summary' | 'sync'>(() => {
    const saved = localStorage.getItem(ACTIVE_TAB_KEY);
    return (saved as 'guests' | 'pricing' | 'summary' | 'sync') || 'guests';
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Sincronizar desde la nube al cargar la página si está configurado
    // Esto siempre trae los datos más recientes del bin
    const syncOnLoad = async () => {
      setIsLoading(true);
      try {
        if (syncService.isConfigured()) {
          window.dispatchEvent(new Event('sync-start'));
          // forceUpdate: true para siempre traer datos del bin al recargar
          const result = await storage.syncFromCloud(true);
          if (result.success) {
            // Recargar datos después de sincronizar
            window.dispatchEvent(new Event('sync-success'));
            loadData();
          } else {
            // Si hay error, aún así cargar datos locales
            console.warn('Error al sincronizar desde la nube:', result.error);
            window.dispatchEvent(new Event('sync-error'));
            loadData();
          }
        } else {
          // Si no está configurado, solo cargar datos locales
          loadData();
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    syncOnLoad();

    // Sincronización automática cada 15 minutos después del último sync
    const checkAndSync = async () => {
      if (!syncService.isConfigured()) {
        return;
      }

      const lastSyncTime = localStorage.getItem('bday-last-sync');
      if (!lastSyncTime) {
        // Si nunca se ha sincronizado, no hacer nada automáticamente
        return;
      }

      const lastSync = parseInt(lastSyncTime);
      const now = Date.now();
      const syncIntervalMs = AUTO_SYNC_INTERVAL_MINUTES * 60 * 1000; // Convertir minutos a milisegundos

      // Si han pasado los minutos configurados desde el último sync, sincronizar
      if (now - lastSync >= syncIntervalMs) {
        window.dispatchEvent(new Event('sync-start'));
        const result = await storage.syncFromCloud(false); // false: solo sincronizar si hay cambios
        if (result.success) {
          window.dispatchEvent(new Event('sync-success'));
          loadData();
        } else {
          // Solo mostrar error si no es el caso de "no hay datos nuevos" (que es normal)
          if (result.error && result.error !== 'No hay datos nuevos en la nube') {
            window.dispatchEvent(new Event('sync-error'));
            setSyncError(`Error al sincronizar: ${result.error}`);
            setTimeout(() => setSyncError(null), 5000);
          } else {
            // Si no hay datos nuevos, simplemente actualizar el timestamp para no volver a intentar inmediatamente
            // No es un error, es una situación normal
            window.dispatchEvent(new Event('sync-success'));
          }
        }
      }
    };

    // Verificar periódicamente si es necesario sincronizar
    const interval = setInterval(checkAndSync, AUTO_SYNC_CHECK_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadData = () => {
    const savedStatuses = storage.getGuestStatuses();
    const savedAdditionalGuests = storage.getAdditionalGuests();
    const savedPricing = storage.getPricing();
    const mergedGuests = mergeGuestsWithStatuses(baseGuests, savedAdditionalGuests, savedStatuses);
    setGuests(mergedGuests);
    setPricing(savedPricing);
  };

  const handleSyncComplete = () => {
    loadData();
    setRefreshKey((k) => k + 1);
  };

  const handleGuestsChange = async (newGuests: Guest[]) => {
    // Separar invitados base de los adicionales
    const baseGuestIds = new Set(baseGuests.map(g => g.id));
    const additionalGuests = newGuests
      .filter(g => !baseGuestIds.has(g.id))
      .map(({ status, confirmedAdults, confirmedChildren, confirmedBabies, ...rest }) => rest);
    
    // Extraer solo los estados de los invitados que todavía existen
    // Si un invitado fue eliminado, no estará en newGuests, así que su estado tampoco estará aquí
    const statuses: GuestStatus[] = newGuests.map((guest) => ({
      id: guest.id,
      status: guest.status,
      confirmedAdults: guest.confirmedAdults,
      confirmedChildren: guest.confirmedChildren,
      confirmedBabies: guest.confirmedBabies,
    }));
    
    // Guardar y sincronizar todo junto (evita condiciones de carrera)
    // Nota: statuses solo contiene los invitados que todavía existen, así que los eliminados
    // se quitarán automáticamente del bin cuando se sincronice
    storage.syncAll(statuses, additionalGuests, (error) => {
      if (error) {
        setSyncError(`Error al sincronizar: ${error}`);
        setTimeout(() => setSyncError(null), 5000);
      }
    });
    // Actualizar la vista combinando base con estados
    const mergedGuests = mergeGuestsWithStatuses(baseGuests, additionalGuests, statuses);
    setGuests(mergedGuests);
  };

  const handlePricingChange = async (newPricing: Pricing) => {
    setPricing(newPricing);
    // Guardar inmediatamente (la sincronización es en segundo plano)
    storage.savePricing(newPricing, (error) => {
      if (error) {
        setSyncError(`Error al sincronizar: ${error}`);
        setTimeout(() => setSyncError(null), 5000);
      }
    });
  };

  const handleTabChange = (tab: 'guests' | 'pricing' | 'summary' | 'sync') => {
    setActiveTab(tab);
    localStorage.setItem(ACTIVE_TAB_KEY, tab);
    setIsMobileMenuOpen(false); // Cerrar menú al cambiar de tab
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
            <button
              className="mobile-menu-button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Abrir menú"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <CakeIcon />
              <span className="title-desktop">Gestión de Invitados</span>
              <span className="title-mobile">Gestión de Cumpleaños</span>
            </h1>
          </div>
          <SyncStatusIndicator />
        </div>
        <nav className="tabs tabs-desktop" role="tablist" aria-label="Navegación principal" style={{ marginTop: '1rem' }}>
          <button
            role="tab"
            aria-selected={activeTab === 'guests'}
            aria-controls="guests-panel"
            id="guests-tab"
            className={activeTab === 'guests' ? 'active' : ''}
            onClick={() => handleTabChange('guests')}
          >
            Invitados
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'pricing'}
            aria-controls="pricing-panel"
            id="pricing-tab"
            className={activeTab === 'pricing' ? 'active' : ''}
            onClick={() => handleTabChange('pricing')}
          >
            Precios
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'summary'}
            aria-controls="summary-panel"
            id="summary-tab"
            className={activeTab === 'summary' ? 'active' : ''}
            onClick={() => handleTabChange('summary')}
          >
            Resumen
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'sync'}
            aria-controls="sync-panel"
            id="sync-tab"
            className={activeTab === 'sync' ? 'active' : ''}
            onClick={() => handleTabChange('sync')}
          >
            <SyncIcon style={{ fontSize: '1rem', marginRight: '0.25rem' }} /> Sincronizar
          </button>
        </nav>
      </header>

      {/* Mobile Menu Drawer */}
      <div 
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden={!isMobileMenuOpen}
      />
      <nav 
        className={`mobile-menu-drawer ${isMobileMenuOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Menú de navegación móvil"
      >
        <div className="mobile-menu-header">
          <h2>Menú</h2>
        </div>
        <div className="mobile-menu-tabs">
          <button
            role="tab"
            aria-selected={activeTab === 'guests'}
            className={activeTab === 'guests' ? 'active' : ''}
            onClick={() => handleTabChange('guests')}
          >
            Invitados
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'pricing'}
            className={activeTab === 'pricing' ? 'active' : ''}
            onClick={() => handleTabChange('pricing')}
          >
            Precios
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'summary'}
            className={activeTab === 'summary' ? 'active' : ''}
            onClick={() => handleTabChange('summary')}
          >
            Resumen
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'sync'}
            className={activeTab === 'sync' ? 'active' : ''}
            onClick={() => handleTabChange('sync')}
          >
            <SyncIcon style={{ fontSize: '1rem', marginRight: '0.25rem' }} /> Sincronizar
          </button>
        </div>
      </nav>

      {syncError && (
        <Toast
          message={syncError}
          type="error"
          onClose={() => setSyncError(null)}
          duration={5000}
        />
      )}
      <main className="app-main">
        {isLoading ? (
          <div>
            {activeTab === 'guests' && (
              <div className="guests-grid">
                <div className="card">
                  <div className="skeleton-title"></div>
                  <SkeletonLoader type="table" rows={5} />
                </div>
                <div className="card">
                  <div className="skeleton-title"></div>
                  <SkeletonLoader type="table" rows={3} />
                </div>
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                  <div className="skeleton-title"></div>
                  <SkeletonLoader type="table" rows={2} />
                </div>
              </div>
            )}
            {activeTab === 'pricing' && (
              <div className="card">
                <SkeletonLoader type="table" rows={4} />
              </div>
            )}
            {activeTab === 'summary' && (
              <div>
                <div className="card">
                  <SkeletonLoader type="stat" />
                </div>
                <div className="card">
                  <SkeletonLoader type="table" rows={3} />
                </div>
              </div>
            )}
            {activeTab === 'sync' && (
              <div className="card">
                <SkeletonLoader type="card" rows={2} />
              </div>
            )}
          </div>
        ) : (
          <>
            {activeTab === 'guests' && (
              <div role="tabpanel" id="guests-panel" aria-labelledby="guests-tab">
                <GuestManagement 
                  key={refreshKey} 
                  guests={guests} 
                  baseGuestIds={new Set(baseGuests.map(g => g.id))}
                  onGuestsChange={handleGuestsChange} 
                />
              </div>
            )}
            {activeTab === 'pricing' && (
              <div role="tabpanel" id="pricing-panel" aria-labelledby="pricing-tab">
                <PricingConfig pricing={pricing} onPricingChange={handlePricingChange} />
              </div>
            )}
            {activeTab === 'summary' && (
              <div role="tabpanel" id="summary-panel" aria-labelledby="summary-tab">
                <SummaryView guests={guests} pricing={pricing} />
              </div>
            )}
            {activeTab === 'sync' && (
              <div role="tabpanel" id="sync-panel" aria-labelledby="sync-tab">
                <SyncConfig onSyncComplete={handleSyncComplete} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
