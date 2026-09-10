/**
 * Copyright 2026 INSTITUTO ECUATORIANO DE SEGURIDAD SOCIAL - ECUADOR.
 * Todos los derechos reservados.
 */
import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Rutas de prerender en el servidor.
 *
 * @author Juan Pablo Tarapuez
 * @version Revision: 1.0
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
