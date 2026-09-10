/**
 * Copyright 2026 INSTITUTO ECUATORIANO DE SEGURIDAD SOCIAL - ECUADOR.
 * Todos los derechos reservados.
 */

/**
 * Unidad médica expuesta en el mapa de geolocalización.
 *
 * @author Juan Pablo Tarapuez
 * @version Revision: 1.0
 */
export interface UnidadMedica {
  nombre: string;
  nivel: number;
  latitud: number;
  longitud: number;
  descripcion: string;
  telefono: string;
  sitio_web: string;
  siglas: string;
  direccion: string;
}

/**
 * Agrupación de unidades médicas por provincia.
 *
 * @author Juan Pablo Tarapuez
 * @version Revision: 1.0
 */
export interface ProvinciaUnidades {
  provincia: string;
  unidades: UnidadMedica[];
}
