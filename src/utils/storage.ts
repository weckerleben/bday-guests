import { Guest, GuestStatus, Pricing } from '../types';
import { syncService } from './sync';

const STORAGE_KEYS = {
  GUEST_STATUSES: 'bday-guest-statuses',
  PRICING: 'bday-pricing',
  LAST_SYNC: 'bday-last-sync',
} as const;

let syncInProgress = false;

export const storage = {
  getGuestStatuses: (): GuestStatus[] => {
    const data = localStorage.getItem(STORAGE_KEYS.GUEST_STATUSES);
    return data ? JSON.parse(data) : [];
  },

  saveGuestStatuses: async (statuses: GuestStatus[]): Promise<void> => {
    // Guardar en localStorage inmediatamente
    localStorage.setItem(STORAGE_KEYS.GUEST_STATUSES, JSON.stringify(statuses));
    
    // Sincronizar con la nube en segundo plano (no bloquea la UI)
    if (syncService.isConfigured() && !syncInProgress) {
      syncInProgress = true;
      // Fire-and-forget: no esperamos a que termine
      (async () => {
        try {
          const pricing = storage.getPricing();
          const result = await syncService.save({
            guestStatuses: statuses,
            pricing,
            lastUpdated: Date.now(),
          });
          if (result.success) {
            localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
          } else {
            console.error('Error syncing guest statuses:', result.error);
          }
        } catch (error) {
          console.error('Error syncing guest statuses:', error);
        } finally {
          syncInProgress = false;
        }
      })();
    }
  },

  getPricing: (): Pricing | null => {
    const data = localStorage.getItem(STORAGE_KEYS.PRICING);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    
    // Migración: convertir estructura antigua a nueva
    if (parsed.adultComboPrice !== undefined) {
      // Estructura antigua, convertir a nueva
      const migrated: Pricing = {
        items: [
          { id: '1', name: 'Combo Adulto', price: parsed.adultComboPrice || 33000, type: 'perPerson', personType: 'adult' },
          { id: '2', name: 'Combo Niño', price: parsed.childComboPrice || 39000, type: 'perPerson', personType: 'child' },
          { id: '3', name: 'Alquiler', price: parsed.rent || 2700000, type: 'fixed' },
          { id: '4', name: 'Mesa Dulces', price: parsed.sweetTable || 485000, type: 'fixed' },
        ],
      };
      // Guardar la versión migrada
      localStorage.setItem(STORAGE_KEYS.PRICING, JSON.stringify(migrated));
      return migrated;
    }
    
    // Estructura nueva
    return parsed;
  },

  savePricing: async (pricing: Pricing): Promise<void> => {
    // Guardar en localStorage inmediatamente
    localStorage.setItem(STORAGE_KEYS.PRICING, JSON.stringify(pricing));
    
    // Sincronizar con la nube en segundo plano (no bloquea la UI)
    if (syncService.isConfigured() && !syncInProgress) {
      syncInProgress = true;
      // Fire-and-forget: no esperamos a que termine
      (async () => {
        try {
          const guestStatuses = storage.getGuestStatuses();
          const result = await syncService.save({
            guestStatuses,
            pricing,
            lastUpdated: Date.now(),
          });
          if (result.success) {
            localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
          } else {
            console.error('Error syncing pricing:', result.error);
          }
        } catch (error) {
          console.error('Error syncing pricing:', error);
        } finally {
          syncInProgress = false;
        }
      })();
    }
  },

  async syncFromCloud(forceUpdate: boolean = false): Promise<{ success: boolean; error?: string }> {
    if (!syncService.isConfigured()) {
      return { success: false, error: 'Sincronización no configurada' };
    }

    try {
      const result = await syncService.load();
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      if (result.data) {
        const localLastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
        const localTimestamp = localLastSync ? parseInt(localLastSync) : 0;
        
        // Si forceUpdate es true (al cargar la página) o los datos de la nube son más recientes, actualizar local
        if (forceUpdate || result.data.lastUpdated > localTimestamp) {
          // Migración: si hay datos antiguos con 'guests', convertirlos a 'guestStatuses'
          if (result.data.guests && !result.data.guestStatuses) {
            const oldGuests = result.data.guests as Guest[];
            const migratedStatuses: GuestStatus[] = oldGuests.map((g) => ({
              id: g.id,
              status: g.status,
              confirmedAdults: g.confirmedAdults,
              confirmedChildren: g.confirmedChildren,
              confirmedBabies: g.confirmedBabies,
            }));
            localStorage.setItem(STORAGE_KEYS.GUEST_STATUSES, JSON.stringify(migratedStatuses));
          } else if (result.data.guestStatuses) {
            localStorage.setItem(STORAGE_KEYS.GUEST_STATUSES, JSON.stringify(result.data.guestStatuses));
          }
          if (result.data.pricing) {
            localStorage.setItem(STORAGE_KEYS.PRICING, JSON.stringify(result.data.pricing));
          }
          localStorage.setItem(STORAGE_KEYS.LAST_SYNC, result.data.lastUpdated.toString());
          return { success: true };
        }
      }
      return { success: false, error: 'No hay datos nuevos en la nube' };
    } catch (error) {
      console.error('Error syncing from cloud:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  },

  async syncToCloud(): Promise<{ success: boolean; error?: string }> {
    if (!syncService.isConfigured()) {
      return { success: false, error: 'Sincronización no configurada' };
    }

    try {
      const guestStatuses = storage.getGuestStatuses();
      const pricing = storage.getPricing();
      const result = await syncService.save({
        guestStatuses,
        pricing,
        lastUpdated: Date.now(),
      });
      if (result.success) {
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
      }
      return result;
    } catch (error) {
      console.error('Error syncing to cloud:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  },
};
