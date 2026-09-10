/**
 * Copyright 2026 INSTITUTO ECUATORIANO DE SEGURIDAD SOCIAL - ECUADOR.
 * Todos los derechos reservados.
 */

/**
 * Variables de entorno de producción.
 *
 * @author Juan Pablo Tarapuez
 * @version Revision: 1.0
 */
// Ambiente de PRODUCCIÓN
const apiUrl = 'https://api.iess.gob.ec/api';

export const environment = {
  production: true,
  staging: false,
  environmentName: 'Production',
  
  apiUrl,
  mapTilesUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  
  // Configuraciones específicas de producción
  enableConsoleLogging: false, // Deshabilitar logs en producción
  enableAnalytics: true,       // Habilitar analytics
  enableErrorReporting: true,  // Reportar errores para monitoreo
  
  // Configuraciones del mapa
  mapConfig: {
    zoom: 7,
    center: [-1.831239, -78.183406], // Ecuador
    maxZoom: 19
  },
  
  unidadesMedicasDataUrl: `${apiUrl}/unidades-medicas`,

  geocoding: {
    nominatimUrl: 'https://nominatim.openstreetmap.org/search',
    userAgent: 'salud-geolocalizacion-ui-IESS/1.0',
    countryCode: 'ec'
  },
  
  // Configuraciones de la aplicación
  appTitle: 'IESS Salud',
  version: '1.0.0'
}; 