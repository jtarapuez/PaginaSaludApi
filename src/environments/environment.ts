// Ambiente de DESARROLLO (local)
const apiUrl = 'http://localhost:8080/api';

export const environment = {
  production: false,
  staging: false,
  environmentName: 'Development',
  
  apiUrl,
  mapTilesUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  
  enableConsoleLogging: true,
  enableAnalytics: false,
  enableErrorReporting: false,
  
  mapConfig: {
    zoom: 7,
    center: [-1.831239, -78.183406],
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
  appTitle: 'IESS Salud - Desarrollo',
  version: '1.0.0-dev'
}; 