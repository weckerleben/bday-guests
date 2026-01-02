/**
 * Configuración de la aplicación
 * Centraliza todas las constantes configurables para facilitar su modificación
 */

/**
 * Intervalo de sincronización automática en minutos
 * La aplicación sincronizará automáticamente desde la nube cada X minutos
 * después del último sync exitoso
 */
export const AUTO_SYNC_INTERVAL_MINUTES = 1;

/**
 * Intervalo de verificación en milisegundos
 * Cada cuánto tiempo se verifica si es necesario sincronizar
 * (recomendado: 1 minuto para no sobrecargar)
 */
export const AUTO_SYNC_CHECK_INTERVAL_MS = 60 * 1000; // 1 minuto

