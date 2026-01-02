import { useState, useEffect } from 'react';
import { Guest, Pricing, GuestStatus } from './types';
import { storage } from './utils/storage';
import { syncService } from './utils/sync';
import { loadBaseGuests } from './utils/guestsLoader';
import { mergeGuestsWithStatuses } from './utils/guestsMerger';
import { PricingConfig } from './components/PricingConfig';
import { GuestManagement } from './components/GuestManagement';
import { SummaryView } from './components/SummaryView';
import { SyncConfig } from './components/SyncConfig';
import { SkeletonLoader } from './components/SkeletonLoader';
import './App.css';

function App() {
  const [baseGuests] = useState(() => loadBaseGuests());
  const [guests, setGuests] = useState<Guest[]>([]);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [activeTab, setActiveTab] = useState<'guests' | 'pricing' | 'summary' | 'sync'>('guests');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sincronizar desde la nube al cargar la página si está configurado
    // Esto siempre trae los datos más recientes del bin
    const syncOnLoad = async () => {
      setIsLoading(true);
      try {
        if (syncService.isConfigured()) {
          // forceUpdate: true para siempre traer datos del bin al recargar
          const result = await storage.syncFromCloud(true);
          if (result.success) {
            // Recargar datos después de sincronizar
            loadData();
          } else {
            // Si hay error, aún así cargar datos locales
            console.warn('Error al sincronizar desde la nube:', result.error);
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
  }, []);

  const loadData = () => {
    const savedStatuses = storage.getGuestStatuses();
    const savedPricing = storage.getPricing();
    const mergedGuests = mergeGuestsWithStatuses(baseGuests, savedStatuses);
    setGuests(mergedGuests);
    setPricing(savedPricing);
  };

  const handleSyncComplete = () => {
    loadData();
    setRefreshKey((k) => k + 1);
  };

  const handleGuestsChange = async (newGuests: Guest[]) => {
    // Extraer solo los estados de los invitados
    const statuses: GuestStatus[] = newGuests.map((guest) => ({
      id: guest.id,
      status: guest.status,
      confirmedAdults: guest.confirmedAdults,
      confirmedChildren: guest.confirmedChildren,
      confirmedBabies: guest.confirmedBabies,
    }));
    
    // Guardar y actualizar UI inmediatamente (la sincronización es en segundo plano)
    storage.saveGuestStatuses(statuses);
    // Actualizar la vista combinando base con estados
    const mergedGuests = mergeGuestsWithStatuses(baseGuests, statuses);
    setGuests(mergedGuests);
  };

  const handlePricingChange = async (newPricing: Pricing) => {
    setPricing(newPricing);
    // Guardar inmediatamente (la sincronización es en segundo plano)
    storage.savePricing(newPricing);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎉 Gestión de Invitados - Cumpleaños</h1>
        <nav className="tabs" role="tablist" aria-label="Navegación principal">
          <button
            role="tab"
            aria-selected={activeTab === 'guests'}
            aria-controls="guests-panel"
            id="guests-tab"
            className={activeTab === 'guests' ? 'active' : ''}
            onClick={() => setActiveTab('guests')}
          >
            Invitados
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'pricing'}
            aria-controls="pricing-panel"
            id="pricing-tab"
            className={activeTab === 'pricing' ? 'active' : ''}
            onClick={() => setActiveTab('pricing')}
          >
            Precios
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'summary'}
            aria-controls="summary-panel"
            id="summary-tab"
            className={activeTab === 'summary' ? 'active' : ''}
            onClick={() => setActiveTab('summary')}
          >
            Resumen
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'sync'}
            aria-controls="sync-panel"
            id="sync-tab"
            className={activeTab === 'sync' ? 'active' : ''}
            onClick={() => setActiveTab('sync')}
          >
            🔄 Sincronizar
          </button>
        </nav>
      </header>

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
                <GuestManagement key={refreshKey} guests={guests} onGuestsChange={handleGuestsChange} />
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
