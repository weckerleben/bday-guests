import { useState, useEffect } from 'react';
import SyncIcon from '@mui/icons-material/Sync';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { syncService } from '../utils/sync';

interface SyncStatusIndicatorProps {
  onSyncStateChange?: (isSyncing: boolean) => void;
}

export const SyncStatusIndicator = ({ onSyncStateChange }: SyncStatusIndicatorProps) => {
  const [lastSync, setLastSync] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<'success' | 'error' | 'syncing' | 'not-configured'>('not-configured');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      const isConfigured = syncService.isConfigured();
      
      if (!isConfigured) {
        setSyncStatus('not-configured');
        setLastSync('');
        return;
      }

      const lastSyncTime = localStorage.getItem('bday-last-sync');
      if (lastSyncTime) {
        const date = new Date(parseInt(lastSyncTime));
        const fullDate = date.toLocaleString('es-ES', { 
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        setLastSync(fullDate);
        setSyncStatus('success');
      } else {
        setLastSync('Nunca');
        setSyncStatus('success');
      }
    };

    updateStatus();
    
    // Actualizar cada 5 segundos
    const interval = setInterval(updateStatus, 5000);
    
    // Escuchar eventos de sincronización
    const handleSyncStart = () => {
      setIsSyncing(true);
      setSyncStatus('syncing');
      if (onSyncStateChange) {
        onSyncStateChange(true);
      }
    };

    const handleSyncSuccess = () => {
      setIsSyncing(false);
      setSyncStatus('success');
      updateStatus();
      if (onSyncStateChange) {
        onSyncStateChange(false);
      }
    };

    const handleSyncError = () => {
      setIsSyncing(false);
      setSyncStatus('error');
      if (onSyncStateChange) {
        onSyncStateChange(false);
      }
    };

    window.addEventListener('sync-start', handleSyncStart);
    window.addEventListener('sync-success', handleSyncSuccess);
    window.addEventListener('sync-error', handleSyncError);

    return () => {
      clearInterval(interval);
      window.removeEventListener('sync-start', handleSyncStart);
      window.removeEventListener('sync-success', handleSyncSuccess);
      window.removeEventListener('sync-error', handleSyncError);
    };
  }, [onSyncStateChange]);

  if (syncStatus === 'not-configured') {
    return null; // No mostrar si no está configurado
  }

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'syncing':
        return '#667eea';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = () => {
    if (syncStatus === 'syncing') {
      return <SyncIcon style={{ fontSize: '1rem', animation: 'spin 1s linear infinite' }} />;
    }
    if (syncStatus === 'error') {
      return <ErrorIcon style={{ fontSize: '1rem' }} />;
    }
    return <CheckCircleIcon style={{ fontSize: '1rem' }} />;
  };

  // Formatear hora más corta para móvil
  const getShortTime = () => {
    if (!lastSync || lastSync === 'Nunca') return '';
    try {
      // lastSync ya viene formateado como "02/01/2026, 16:52:42"
      // Extraer solo la hora
      const timeMatch = lastSync.match(/(\d{2}:\d{2})/);
      return timeMatch ? timeMatch[1] : '';
    } catch {
      return '';
    }
  };

  return (
    <div className="sync-status-container">
      {/* Versión desktop: completa */}
      <div
        className="sync-status-desktop"
        style={{
          display: 'none',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: syncStatus === 'error' 
            ? 'rgba(254, 226, 226, 0.95)' 
            : syncStatus === 'syncing' 
            ? 'rgba(239, 246, 255, 0.95)' 
            : 'rgba(240, 253, 244, 0.95)',
          borderRadius: '6px',
          border: `1px solid ${getStatusColor()}`,
          fontSize: '0.85rem',
          color: syncStatus === 'error' ? '#991b1b' : syncStatus === 'syncing' ? '#1e40af' : '#166534',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          whiteSpace: 'nowrap',
        }}
        title={syncStatus === 'syncing' ? 'Sincronizando...' : syncStatus === 'error' ? 'Error en sincronización' : `Última sincronización: ${lastSync}`}
      >
        {getStatusIcon()}
        <span style={{ fontWeight: '500' }}>
          {syncStatus === 'syncing' ? 'Sincronizando...' : syncStatus === 'error' ? 'Error' : 'Sincronizado'}
        </span>
        {syncStatus !== 'syncing' && lastSync && (
          <span style={{ opacity: 0.8, fontSize: '0.75rem' }}>
            {lastSync}
          </span>
        )}
      </div>
      
      {/* Versión móvil: compacta */}
      <div
        className="sync-status-mobile"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.4rem 0.6rem',
          background: syncStatus === 'error' 
            ? 'rgba(254, 226, 226, 0.95)' 
            : syncStatus === 'syncing' 
            ? 'rgba(239, 246, 255, 0.95)' 
            : 'rgba(240, 253, 244, 0.95)',
          borderRadius: '6px',
          border: `1px solid ${getStatusColor()}`,
          fontSize: '0.75rem',
          color: syncStatus === 'error' ? '#991b1b' : syncStatus === 'syncing' ? '#1e40af' : '#166534',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
        title={syncStatus === 'syncing' ? 'Sincronizando...' : syncStatus === 'error' ? 'Error en sincronización' : `Última sincronización: ${lastSync}`}
      >
        {getStatusIcon()}
        {syncStatus === 'syncing' ? (
          <span style={{ fontWeight: '500' }}>Sync...</span>
        ) : syncStatus === 'error' ? (
          <span style={{ fontWeight: '500' }}>Error</span>
        ) : (
          <span style={{ opacity: 0.9, fontSize: '0.7rem' }}>
            {getShortTime()}
          </span>
        )}
      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (min-width: 769px) {
          .sync-status-desktop {
            display: flex !important;
          }
          .sync-status-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

