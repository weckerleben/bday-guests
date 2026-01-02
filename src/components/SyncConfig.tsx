import { useState, useEffect } from 'react';
import SyncIcon from '@mui/icons-material/Sync';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import SaveIcon from '@mui/icons-material/Save';
import { syncService } from '../utils/sync';
import { storage } from '../utils/storage';

interface SyncConfigProps {
  onSyncComplete: () => void;
}

export const SyncConfig = ({ onSyncComplete }: SyncConfigProps) => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [lastSync, setLastSync] = useState<string>('');

  useEffect(() => {
    const checkConfig = () => {
      const configured = syncService.isConfigured();
      const apiKey = syncService.getApiKey();
      const binId = syncService.getBinId();
      
      // Debug: mostrar qué se está detectando
      console.log('Sync config check:', {
        configured,
        hasApiKey: !!apiKey,
        hasBinId: !!binId,
        apiKeyLength: apiKey?.length || 0,
        binIdLength: binId?.length || 0,
      });
      
      setIsConfigured(configured);
      if (configured) {
        updateLastSyncTime();
      }
    };
    
    checkConfig();
    
    // Revisar periódicamente por si se cargan las variables después
    const interval = setInterval(checkConfig, 2000);
    return () => clearInterval(interval);
  }, []);

  const updateLastSyncTime = () => {
    const lastSyncTime = localStorage.getItem('bday-last-sync');
    if (lastSyncTime) {
      const date = new Date(parseInt(lastSyncTime));
      setLastSync(date.toLocaleString('es-ES'));
    } else {
      setLastSync('Nunca');
    }
  };

  const handleSyncFromCloud = async () => {
    setIsSyncing(true);
    setSyncStatus('Sincronizando desde la nube...');
    window.dispatchEvent(new Event('sync-start'));

    const result = await storage.syncFromCloud();
    if (result.success) {
      setSyncStatus('Datos sincronizados desde la nube');
      updateLastSyncTime();
      window.dispatchEvent(new Event('sync-success'));
      onSyncComplete();
    } else {
      setSyncStatus(result.error || 'Error al sincronizar desde la nube');
      window.dispatchEvent(new Event('sync-error'));
    }

    setIsSyncing(false);
  };

  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    setSyncStatus('Sincronizando a la nube...');
    window.dispatchEvent(new Event('sync-start'));

    const result = await storage.syncToCloud();
    if (result.success) {
      setSyncStatus('Datos sincronizados a la nube');
      updateLastSyncTime();
      window.dispatchEvent(new Event('sync-success'));
    } else {
      setSyncStatus(result.error || 'Error al sincronizar a la nube');
      window.dispatchEvent(new Event('sync-error'));
    }

    setIsSyncing(false);
  };

  if (!isConfigured) {
    const apiKey = syncService.getApiKey();
    const binId = syncService.getBinId();
    
    return (
      <div className="card">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SyncIcon /> Sincronización en la Nube
        </h2>
        <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '6px', borderLeft: '4px solid #f59e0b' }}>
          <p style={{ color: '#92400e', fontWeight: '500', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <WarningIcon /> Sincronización no configurada
          </p>
          <p style={{ color: '#78350f', fontSize: '0.9rem' }}>
            Para habilitar la sincronización, configura las variables de entorno en el archivo <code>.env</code>:
          </p>
          <pre style={{ 
            background: '#fff', 
            padding: '0.75rem', 
            borderRadius: '4px', 
            marginTop: '0.5rem',
            fontSize: '0.85rem',
            overflow: 'auto'
          }}>
{`VITE_JSONBIN_API_KEY=tu_api_key_aqui
VITE_JSONBIN_BIN_ID=tu_bin_id_aqui`}
          </pre>
          <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fff', borderRadius: '4px', fontSize: '0.85rem' }}>
            <p style={{ color: '#78350f', fontWeight: '500', marginBottom: '0.5rem' }}>Estado actual:</p>
            <p style={{ color: '#78350f', margin: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              API Key: {apiKey ? (
                <>
                  <CheckCircleIcon style={{ fontSize: '1rem' }} /> Detectada ({apiKey.length} caracteres)
                </>
              ) : (
                <>
                  <CloseIcon style={{ fontSize: '1rem' }} /> No detectada
                </>
              )}
            </p>
            <p style={{ color: '#78350f', margin: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Bin ID: {binId ? (
                <>
                  <CheckCircleIcon style={{ fontSize: '1rem' }} /> Detectado ({binId.length} caracteres)
                </>
              ) : (
                <>
                  <CloseIcon style={{ fontSize: '1rem' }} /> No detectado
                </>
              )}
            </p>
          </div>
          <p style={{ color: '#78350f', fontSize: '0.85rem', marginTop: '0.75rem' }}>
            1. Crea una cuenta en <a href="https://jsonbin.io" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>jsonbin.io</a> y obtén tu API Key<br/>
            2. Crea un bin o usa uno existente y copia su ID<br/>
            3. Añade estas variables al archivo <code>.env</code> en la raíz del proyecto<br/>
            4. <strong>Reinicia el servidor de desarrollo</strong> (<code>npm run dev</code>) - ¡Esto es importante!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <SyncIcon /> Sincronización en la Nube
      </h2>
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ color: '#10b981', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircleIcon /> Sincronización configurada
        </p>
        <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.5rem' }}>
          Bin ID: <code style={{ background: '#f3f4f6', padding: '0.2rem 0.4rem', borderRadius: '3px' }}>{syncService.getBinId()}</code>
        </p>
        {lastSync && (
          <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Última sincronización: {lastSync}
          </p>
        )}
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem', fontStyle: 'italic' }}>
          La sincronización ocurre al cargar la página y después de cada cambio (crear, editar, eliminar)
        </p>
      </div>
      <div className="actions">
        <button
          className="button button-primary"
          onClick={handleSyncFromCloud}
          disabled={isSyncing}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
        >
          {isSyncing ? (
            <>
              <SyncIcon style={{ fontSize: '1.2rem' }} /> Sincronizando...
            </>
          ) : (
            <>
              <DownloadIcon style={{ fontSize: '1.2rem' }} /> Sincronizar desde la nube
            </>
          )}
        </button>
        <button
          className="button button-success"
          onClick={handleSyncToCloud}
          disabled={isSyncing}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
        >
          {isSyncing ? (
            <>
              <SyncIcon style={{ fontSize: '1.2rem' }} /> Sincronizando...
            </>
          ) : (
            <>
              <UploadIcon style={{ fontSize: '1.2rem' }} /> Sincronizar a la nube
            </>
          )}
        </button>
      </div>
      {syncStatus && (
        <p style={{ marginTop: '1rem', color: syncStatus.includes('Error') ? '#ef4444' : '#10b981' }}>
          {syncStatus}
        </p>
      )}
      
      <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SaveIcon /> Backup de Datos
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>
          Exporta todos tus datos (estados de invitados y precios) como archivo JSON para hacer un respaldo.
        </p>
        <button
          className="button"
          onClick={() => {
            const data = storage.exportData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bday-guests-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
        >
          <DownloadIcon style={{ fontSize: '1.2rem' }} /> Exportar Datos (JSON)
        </button>
      </div>
    </div>
  );
};
