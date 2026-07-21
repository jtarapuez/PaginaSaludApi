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

export interface ProvinciaUnidades {
  provincia: string;
  unidades: UnidadMedica[];
} 