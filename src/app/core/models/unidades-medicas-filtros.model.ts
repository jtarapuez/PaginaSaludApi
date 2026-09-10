/**
 * Copyright 2026 INSTITUTO ECUATORIANO DE SEGURIDAD SOCIAL - ECUADOR.
 * Todos los derechos reservados.
 */

/**
 * Filtros opcionales para la consulta de unidades médicas.
 *
 * @author Juan Pablo Tarapuez
 * @version Revision: 1.0
 */
export interface UnidadesMedicasFiltros {
  provincia?: string;
  nivel?: number | null;
  q?: string;
}
