export interface SyncData {
  guestStatuses?: unknown[];
  additionalGuests?: unknown[]; // Familias añadidas dinámicamente
  guests?: unknown[]; // Para compatibilidad con datos antiguos
  pricing: unknown | null;
  lastUpdated: number;
}

const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b';

// Leer de variables de entorno (Vite requiere prefijo VITE_)
const getApiKey = (): string | null => {
  return import.meta.env.VITE_JSONBIN_API_KEY || null;
};

const getBinId = (): string | null => {
  return import.meta.env.VITE_JSONBIN_BIN_ID || null;
};

export const syncService = {
  getBinId,

  getApiKey,

  isConfigured: (): boolean => {
    return !!(getBinId() && getApiKey());
  },

  async save(data: SyncData): Promise<{ success: boolean; error?: string }> {
    const currentBinId = getBinId();
    const currentApiKey = getApiKey();

    if (!currentBinId || !currentApiKey) {
      return { success: false, error: 'Configuración incompleta' };
    }

    try {
      const response = await fetch(`${JSONBIN_API_URL}/${currentBinId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': currentApiKey,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          return { 
            success: false, 
            error: 'API Key no autorizada. Verifica que la API Key tenga acceso a este Bin o que el Bin haya sido creado con esta misma API Key.' 
          };
        }
        const errorText = await response.text();
        return { 
          success: false, 
          error: `Error ${response.status}: ${errorText || 'Error desconocido'}` 
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving to cloud:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error de conexión' 
      };
    }
  },

  async load(): Promise<{ data: SyncData | null; error?: string }> {
    const currentBinId = getBinId();
    const currentApiKey = getApiKey();

    if (!currentBinId || !currentApiKey) {
      return { data: null, error: 'Configuración incompleta' };
    }

    try {
      const response = await fetch(`${JSONBIN_API_URL}/${currentBinId}/latest`, {
        method: 'GET',
        headers: {
          'X-Master-Key': currentApiKey,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Bin no existe aún
          return { data: null, error: 'Bin no encontrado. Verifica que el Bin ID sea correcto.' };
        }
        if (response.status === 401) {
          return { 
            data: null, 
            error: 'API Key no autorizada. Verifica que la API Key tenga acceso a este Bin o que el Bin haya sido creado con esta misma API Key.' 
          };
        }
        const errorText = await response.text();
        return { 
          data: null, 
          error: `Error ${response.status}: ${errorText || 'Error desconocido'}` 
        };
      }

      const result = await response.json();
      return { data: result.record as SyncData };
    } catch (error) {
      console.error('Error loading from cloud:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Error de conexión' 
      };
    }
  },

  async createBin(data: SyncData): Promise<string | null> {
    const currentApiKey = getApiKey();

    if (!currentApiKey) {
      return null;
    }

    try {
      const response = await fetch(JSONBIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': currentApiKey,
          'X-Bin-Name': 'bday-guests-data',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const newBinId = result.metadata?.id;
      
      if (newBinId) {
        console.log('Bin creado. Añade este Bin ID a tu archivo .env:', newBinId);
        return newBinId;
      }

      return null;
    } catch (error) {
      console.error('Error creating bin:', error);
      return null;
    }
  },
};
