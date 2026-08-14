// Ambiente de CALIDAD (staging)
// Simulación LAN 2026-08-06 — servidor QA: Windows 192.168.12.64
// QA institucional (cuando DNTSI confirme): https://api-staging.iess.gob.ec/api
const apiUrl = 'http://192.168.12.64:8080/api';

export const environment = {
  production: false,
  staging: true,
  environmentName: 'Staging',
  
  apiUrl,
  mapTilesUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  
  // Configuraciones específicas de staging
  enableConsoleLogging: true, // Mantener logs para debugging
  enableAnalytics: true,      // Habilitar analytics para pruebas
  enableErrorReporting: true, // Reportar errores para monitoreo
  
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
  appTitle: 'salud-geolocalizacion-ui - Calidad (simulación LAN)',
  version: '1.0.0-staging'
};