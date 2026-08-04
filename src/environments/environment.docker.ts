// Ambiente DOCKER (nginx sirve el front y hace proxy de /api al backend)
const apiUrl = '/api';

export const environment = {
  production: true,
  staging: false,
  environmentName: 'Docker',

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

  geocoding: {
    nominatimUrl: 'https://nominatim.openstreetmap.org/search',
    userAgent: 'PaginaSalud-IESS/1.0',
    countryCode: 'ec'
  },

  appTitle: 'IESS Salud - Docker',
  version: '1.0.0-docker'
};
