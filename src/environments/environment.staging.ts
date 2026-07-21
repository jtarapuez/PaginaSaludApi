// Ambiente de PREPRODUCCIÓN (staging)
const apiUrl = 'https://api-staging.iess.gob.ec/api';

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
  unidadesMedicasFallbackUrl: 'assets/data/unidades-medicas.json',

  geocoding: {
    nominatimUrl: 'https://nominatim.openstreetmap.org/search',
    userAgent: 'PaginaSalud-IESS/1.0',
    countryCode: 'ec'
  },
  
  // Configuraciones de la aplicación
  appTitle: 'IESS Salud - Staging',
  version: '1.0.0-staging'
}; 