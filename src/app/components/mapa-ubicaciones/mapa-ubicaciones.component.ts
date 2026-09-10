/**
 * Copyright 2026 INSTITUTO ECUATORIANO DE SEGURIDAD SOCIAL - ECUADOR.
 * Todos los derechos reservados.
 */
import { Component, OnInit, AfterViewInit, OnDestroy, NgZone, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { UnidadesMedicasService } from '../../core/services/unidades-medicas.service';
import { ProvinciaUnidades, UnidadMedica } from '../../core/models/unidades-medicas.model';
import { UnidadesMedicasFiltros } from '../../core/models/unidades-medicas-filtros.model';
import { environment } from '../../../environments/environment';
import * as L from 'leaflet';

type OrigenUbicacion = 'gps' | 'manual' | 'geocoded';

/**
 * Mapa Leaflet de unidades médicas con filtros, geolocalización y rutas.
 *
 * @author Juan Pablo Tarapuez
 * @version Revision: 1.0
 */
@Component({
  selector: 'app-mapa-ubicaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mapa-ubicaciones.component.html',
  styleUrls: ['./mapa-ubicaciones.component.scss']
})
export class MapaUbicacionesComponent implements OnInit, AfterViewInit, OnDestroy {
  // Datos originales
  provinciasUnidades: ProvinciaUnidades[] = [];
  // Datos filtrados
  provinciasFiltradas: ProvinciaUnidades[] = [];
  
  // Filtros
  provinciaSeleccionada: string = '';
  nivelSeleccionado: number | null = null;
  terminoBusqueda: string = '';
  
  // Lista de provincias para el filtro
  provincias: string[] = [];
  // Lista de niveles para el filtro
  niveles: number[] = [1, 2, 3];
  
  // Control de acordeón
  provinciasExpandidas = {} as Record<string, boolean>;
  
  // Bandera para controlar si se ha aplicado algún filtro
  filtroAplicado: boolean = false;
  cargandoUnidades: boolean = false;
  errorCargaUnidades: string = '';
  private busquedaTimeout?: ReturnType<typeof setTimeout>;
  
  // Mapa de Leaflet
  public map?: L.Map;
  public markers: L.Marker[] = [];
  private userLocationMarker: L.Marker | null = null;
  private tileLayer: L.TileLayer | null = null;
  mostrarMapa: boolean = true;
  
  // Ubicación del usuario
  userLocation: {lat: number, lng: number} | null = null;
  origenUbicacion: OrigenUbicacion | null = null;
  obteniendoUbicacion = false;
  mostrarModalUbicacionPc = false;
  modoMarcarUbicacion = false;
  estadoPermisoUbicacion: PermissionState | 'no-soportado' = 'prompt';
  mensajeErrorUbicacion = '';
  mensajeUbicacionInline = '';

  esDispositivoMovil = false;
  unidadDestinoActiva: UnidadMedica | null = null;
  infoRutaMovil: { destino: string; distancia: string; duracion?: string; aproximada?: boolean } | null = null;
  mostrarModalGoogleMaps = false;
  private destinoGoogleMapsPendiente: { lat: number; lng: number; usarRuta: boolean } | null = null;

  private mediaQueryList?: MediaQueryList;
  private mediaQueryChangeHandler?: (event: MediaQueryListEvent) => void;

  // Destino pendiente si el usuario pidió ruta antes de tener ubicación
  private destinoPendiente: { lat: number; lng: number } | null = null;

  private mapRevealObserver?: IntersectionObserver;
  private rutaLayer: L.Polyline | null = null;
  private mapClickUbicacionHandler?: (event: L.LeafletMouseEvent) => void;
  private readonly destroyRef = inject(DestroyRef);
  
  // Iconos personalizados
  private userLocationIcon?: L.Icon | L.DivIcon;
  private hospitalIcon?: L.Icon;
  
  constructor(
    private readonly unidadesMedicasService: UnidadesMedicasService,
    private readonly ngZone: NgZone
  ) {}

  private configurarIconosLeaflet(): void {
    try {
      // Configurar iconos por defecto de Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'assets/images/leaflet/marker-icon.png',
        iconUrl: 'assets/images/leaflet/marker-icon.png',
        shadowUrl: 'assets/images/leaflet/marker-shadow.png',
      });

      // Icono personalizado para la ubicación del usuario (persona con FontAwesome)
      this.userLocationIcon = L.divIcon({
        html: `
          <div style="
            width: 32px; 
            height: 32px; 
            background: #4285f4; 
            border: 3px solid white; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 3px 10px rgba(0,0,0,0.4);
            animation: pulse 2s infinite;
          ">
            <i class="fas fa-user" style="color: white; font-size: 16px;"></i>
          </div>
        `,
        className: 'user-location-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });

      // Icono personalizado para hospitales
      this.hospitalIcon = L.icon({
        iconUrl: 'assets/images/leaflet/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'assets/images/leaflet/marker-shadow.png',
        className: 'hospital-icon'
      });

    } catch (error) {
      console.log('Error configurando iconos Leaflet:', error);
    }
  }

  /**
   * Carga unidades médicas y configura detección de dispositivo.
   */
  ngOnInit(): void {
    this.configurarDeteccionDispositivo();

    // Fix para iconos de Leaflet
    this.configurarIconosLeaflet();
    
    this.unidadesMedicasService.getUnidadesMedicas().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data: ProvinciaUnidades[]) => {
        this.procesarDatosIniciales(data);
      },
      error: (error: unknown) => {
        console.error('Error al cargar las unidades médicas:', error);
        this.errorCargaUnidades = 'No se pudieron cargar las unidades médicas.';
      }
    });
  }

  private procesarDatosIniciales(data: ProvinciaUnidades[]): void {
    if (environment.enableConsoleLogging) {
      console.log('Datos de unidades médicas:', data);
    }
    this.provinciasUnidades = data;
    this.provincias = data.map((p) => p.provincia);
    this.provincias.forEach((provincia) => {
      this.provinciasExpandidas[provincia] = true;
    });

    setTimeout(() => {
      this.inicializarMapa();
    }, 500);
  }
  
  /**
   * Recalcula el tamaño del mapa cuando el contenedor es visible.
   */
  ngAfterViewInit(): void {
    const content = document.querySelector('.mapa-content-reveal');
    if (!content) {
      return;
    }

    this.mapRevealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && this.map) {
          setTimeout(() => this.map?.invalidateSize(), 900);
        }
      });
    }, { threshold: 0.15 });

    this.mapRevealObserver.observe(content);
  }

  /**
   * Libera mapa, observadores y temporizadores.
   */
  ngOnDestroy(): void {
    this.mapRevealObserver?.disconnect();
    if (this.busquedaTimeout) {
      clearTimeout(this.busquedaTimeout);
    }
    if (this.mediaQueryList && this.mediaQueryChangeHandler) {
      this.mediaQueryList.removeEventListener('change', this.mediaQueryChangeHandler);
    }
    this.desactivarModoMarcarUbicacion();
    this.limpiarRuta();
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }
  
  /**
   * Crea la instancia Leaflet y solicita geolocalización.
   */
  inicializarMapa(): void {
    console.log('Iniciando inicialización del mapa...');
    
    // Verificar si L está disponible
    if (typeof L === 'undefined') {
      console.error('Leaflet no está disponible');
      return;
    }
    
    // Si ya existe una instancia del mapa, la eliminamos
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }

    const mapElement = document.getElementById('mapa-ubicaciones');
    if (!mapElement) {
      console.error('Elemento del mapa no encontrado');
      return;
    }

    console.log('Elemento del mapa encontrado, creando mapa...');

    try {
      this.map = L.map('mapa-ubicaciones', {
        center: [-1.831239, -78.183406], // Centro de Ecuador
        zoom: 7,
        zoomControl: true,
        attributionControl: true
      });
      
      console.log('Mapa creado exitosamente');
      
      // Configuración básica de tiles
      this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      });
      
      if (this.map && this.tileLayer) {
        this.tileLayer.addTo(this.map);
        console.log('Tiles agregados al mapa');
      }
      
      // Forzar el resize del mapa
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          console.log('Mapa invalidado');
        }
      }, 100);
      
      // Cargar marcadores
      this.cargarMarcadores();
      
    } catch (error) {
      console.error('Error al crear el mapa:', error);
    }
  }

  // Método simplificado para cargar marcadores
  private cargarMarcadores(): void {
    if (!this.map || !this.provinciasUnidades.length) return;

    console.log('Cargando marcadores...');
    
    let totalMarcadores = 0;
    
    this.provinciasUnidades.forEach(provincia => {
      provincia.unidades.forEach(unidad => {
        try {
          const marker = L.marker([unidad.latitud, unidad.longitud], {
            icon: this.hospitalIcon
          }).bindPopup(this.crearContenidoPopup(unidad));
          
          if (this.map) {
            marker.addTo(this.map);
            this.markers.push(marker);
            totalMarcadores++;
          }
        } catch (error) {
          console.error('Error creando marcador:', error, unidad);
        }
      });
    });
    
    console.log(`${totalMarcadores} marcadores cargados exitosamente.`);
  }

  private crearContenidoPopup(unidad: UnidadMedica): string {
    const distanciaTexto = this.userLocation ? 
      `<p><strong>Distancia:</strong> ${this.calcularDistancia(
        this.userLocation.lat, 
        this.userLocation.lng, 
        unidad.latitud, 
        unidad.longitud
      ).toFixed(2)} km</p>` : '';

    return `
      <div class="popup-content">
        <h3>${unidad.siglas}</h3>
        <p><strong>${unidad.nombre}</strong></p>
        <p><strong>Dirección:</strong> ${unidad.direccion}</p>
        <p><strong>Nivel:</strong> ${unidad.nivel}</p>
        <p><strong>Teléfono:</strong> ${unidad.telefono}</p>
        ${distanciaTexto}
        <br>
        <button onclick="window.open('https://www.google.com/maps/search/?api=1&query=${unidad.latitud},${unidad.longitud}', '_blank')" 
                style="background: #4285f4; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
          🗺️ Ver en Google Maps
        </button>
      </div>
    `;
  }

  async solicitarUbicacionUsuario(): Promise<void> {
    this.desactivarModoMarcarUbicacion();
    this.mostrarModalUbicacionPc = false;
    this.mensajeUbicacionInline = '';
    this.mensajeErrorUbicacion = '';

    if (!navigator.geolocation) {
      this.estadoPermisoUbicacion = 'no-soportado';
      this.mensajeUbicacionInline = this.esDispositivoMovil
        ? 'Su navegador no soporta ubicación GPS.'
        : 'Su navegador no soporta ubicación.';
      return;
    }

    await this.actualizarEstadoPermiso();

    if (this.estadoPermisoUbicacion === 'denied') {
      this.mostrarModalPermisoDenegado();
      return;
    }

    // Sin modal: Chrome muestra su propio popup "Permitir ubicación" si aún no hay permiso
    this.obteniendoUbicacion = true;

    navigator.geolocation.getCurrentPosition(
      (position) => this.procesarUbicacionGps(position),
      (error) => void this.manejarErrorGeolocalizacion(error),
      {
        enableHighAccuracy: this.esDispositivoMovil,
        timeout: this.esDispositivoMovil ? 20000 : 15000,
        maximumAge: 0
      }
    );
  }

  /**
   * Solicita de nuevo el permiso de geolocalización.
   */
  reintentarGeolocalizacion(): void {
    this.cerrarModalUbicacionPc();
    void this.solicitarUbicacionUsuario();
  }

  private async actualizarEstadoPermiso(): Promise<void> {
    if (!navigator.permissions?.query) {
      return;
    }

    try {
      const resultado = await navigator.permissions.query({ name: 'geolocation' });
      this.estadoPermisoUbicacion = resultado.state;
    } catch {
      this.estadoPermisoUbicacion = 'prompt';
    }
  }

  private procesarUbicacionGps(position: GeolocationPosition): void {
    this.ngZone.run(() => {
      this.obteniendoUbicacion = false;
      this.mostrarModalUbicacionPc = false;
      this.mensajeErrorUbicacion = '';
      this.mensajeUbicacionInline = '';
      this.origenUbicacion = 'gps';
      this.aplicarUbicacionUsuario(position.coords.latitude, position.coords.longitude);
    });
  }

  private async manejarErrorGeolocalizacion(error: GeolocationPositionError): Promise<void> {
    console.error('Error obteniendo la ubicación:', error);
    await this.actualizarEstadoPermiso();

    if (error.code === error.PERMISSION_DENIED || this.estadoPermisoUbicacion === 'denied') {
      this.ngZone.run(() => {
        this.obteniendoUbicacion = false;
        this.mostrarModalPermisoDenegado();
      });
      return;
    }

    // Permiso OK pero el dispositivo no entrega GPS (código 2)
    this.ngZone.run(() => {
      this.obteniendoUbicacion = false;

      if (this.esDispositivoMovil) {
        this.mensajeUbicacionInline =
          'No se pudo obtener su ubicación. Verifique que el GPS esté activo en Ajustes → Ubicación de su celular e intente de nuevo.';
        return;
      }

      this.mensajeUbicacionInline =
        'Chrome tiene permiso, pero este dispositivo no entregó su ubicación GPS.';
      this.activarModoMarcarUbicacion(true);
    });
  }

  private mostrarModalPermisoDenegado(): void {
    this.estadoPermisoUbicacion = 'denied';
    this.mensajeErrorUbicacion = this.esDispositivoMovil
      ? 'Ubicación bloqueada o desactivada. iPhone: Ajustes → Privacidad → Servicios de ubicación → Safari o Chrome → «Al usar la app» o «Permitir». Android: Ajustes → Ubicación (activar) y en el navegador elija «Permitir» cuando se le solicite. Luego pulse «Mi ubicación» de nuevo.'
      : 'Para permitir la ubicación solo en este sitio: clic en el ícono junto a la URL → Ubicación → activar → luego pulse «Mi ubicación» y elija Permitir.';
    this.mostrarModalUbicacionPc = true;
  }

  /**
   * Activa el modo para marcar la ubicación en el mapa (PC).
   */
  activarModoMarcarUbicacion(preservarMensaje = false): void {
    this.mostrarModalUbicacionPc = false;
    if (!preservarMensaje) {
      this.mensajeUbicacionInline = '';
    }
    this.obteniendoUbicacion = false;

    this.ejecutarCuandoMapaListo(() => {
      if (!this.map) {
        return;
      }

      this.desactivarModoMarcarUbicacion();
      this.modoMarcarUbicacion = true;
      this.map.getContainer().style.cursor = 'crosshair';

      this.mapClickUbicacionHandler = (event: L.LeafletMouseEvent) => {
        this.ngZone.run(() => {
          this.desactivarModoMarcarUbicacion();
          this.origenUbicacion = 'manual';
          this.aplicarUbicacionUsuario(event.latlng.lat, event.latlng.lng);
        });
      };

      this.map.on('click', this.mapClickUbicacionHandler);
    });
  }

  /**
   * Cancela el modo de marcado de ubicación.
   */
  cancelarModoMarcarUbicacion(): void {
    this.desactivarModoMarcarUbicacion();
  }

  private desactivarModoMarcarUbicacion(): void {
    this.modoMarcarUbicacion = false;

    if (this.map) {
      this.map.getContainer().style.cursor = '';
      if (this.mapClickUbicacionHandler) {
        this.map.off('click', this.mapClickUbicacionHandler);
        this.mapClickUbicacionHandler = undefined;
      }
    }
  }

  /**
   * Cierra el modal de ubicación en PC.
   */
  cerrarModalUbicacionPc(): void {
    this.mostrarModalUbicacionPc = false;
    this.obteniendoUbicacion = false;
  }

  private configurarDeteccionDispositivo(): void {
    this.mediaQueryList = window.matchMedia('(max-width: 768px)');
    this.esDispositivoMovil = this.mediaQueryList.matches;

    this.mediaQueryChangeHandler = (event: MediaQueryListEvent) => {
      this.ngZone.run(() => {
        this.esDispositivoMovil = event.matches;
      });
    };

    this.mediaQueryList.addEventListener('change', this.mediaQueryChangeHandler);
  }

  private aplicarUbicacionUsuario(lat: number, lng: number): void {
    this.userLocation = { lat, lng };
    this.ejecutarCuandoMapaListo(() => {
      const hayRutaPendiente = !!this.destinoPendiente;
      this.mostrarUbicacionUsuarioEnMapa(!hayRutaPendiente);
      this.actualizarMarcadoresConDistancia();
      if (this.destinoPendiente) {
        const destino = this.destinoPendiente;
        this.destinoPendiente = null;
        void this.dibujarRutaEnMapa(destino.lat, destino.lng, this.unidadDestinoActiva ?? undefined);
      }
    });
  }

  private ejecutarCuandoMapaListo(callback: () => void): void {
    if (this.map) {
      callback();
      return;
    }

    let intentos = 0;
    const intervalo = setInterval(() => {
      intentos++;
      if (this.map) {
        clearInterval(intervalo);
        callback();
      } else if (intentos >= 50) {
        clearInterval(intervalo);
        console.error('El mapa no estuvo listo para mostrar la ubicación.');
      }
    }, 100);
  }

  /**
   * Dibuja o actualiza el marcador de la ubicación del usuario.
   */
  mostrarUbicacionUsuarioEnMapa(abrirPopup = true): void {
    if (!this.map || !this.userLocation) return;

    // Remover marcador anterior si existe
    if (this.userLocationMarker) {
      this.map.removeLayer(this.userLocationMarker);
    }

    // Crear nuevo marcador para la ubicación del usuario con icono personalizado
    this.userLocationMarker = L.marker([this.userLocation.lat, this.userLocation.lng], {
      icon: this.userLocationIcon
    });
    
    if (this.map) {
      this.userLocationMarker.addTo(this.map);
    }

    const tituloUbicacion = this.obtenerTituloUbicacion();
    const notaUbicacion = this.obtenerNotaUbicacion();

    this.userLocationMarker.bindPopup(`
      <div style="text-align: center;">
        <strong>${tituloUbicacion}</strong>
        <br>
        <small>Lat: ${this.userLocation.lat.toFixed(6)}</small>
        <br>
        <small>Lng: ${this.userLocation.lng.toFixed(6)}</small>
        ${notaUbicacion}
      </div>
    `);

    if (abrirPopup) {
      this.userLocationMarker.openPopup();
    }

    // Centrar el mapa en la ubicación del usuario
    const zoom = this.origenUbicacion === 'geocoded' ? 15 : 12;
    this.map.setView([this.userLocation.lat, this.userLocation.lng], zoom);
  }

  private actualizarMarcadoresConDistancia(): void {
    if (!this.userLocation) return;
    
    // Actualizar todos los marcadores con distancia
    this.markers.forEach((marker, index) => {
      const latLng = marker.getLatLng();
      
      // Buscar la unidad correspondiente
      let unidadEncontrada: UnidadMedica | null = null;
      
      for (const provincia of this.provinciasUnidades) {
        for (const unidad of provincia.unidades) {
          if (Math.abs(unidad.latitud - latLng.lat) < 0.0001 && 
              Math.abs(unidad.longitud - latLng.lng) < 0.0001) {
            unidadEncontrada = unidad;
            break;
          }
        }
        if (unidadEncontrada) break;
      }
      
      if (unidadEncontrada) {
        marker.setPopupContent(this.crearContenidoPopup(unidadEncontrada));
      }
    });
  }

  /**
   * Calcula la distancia en kilómetros entre dos coordenadas.
   */
  calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distancia en kilómetros
    return d;
  }

  /**
   * Convierte grados a radianes.
   */
  deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  /**
   * Recalcula distancias en los popups de los marcadores.
   */
  actualizarDistanciasEnMarcadores(): void {
    // Delegado a actualizarMarcadoresConDistancia()
    this.actualizarMarcadoresConDistancia();
  }

  /**
   * Muestra u oculta el mapa.
   */
  toggleMapa(): void {
    this.mostrarMapa = !this.mostrarMapa;
    
    if (this.mostrarMapa) {
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        } else {
          this.inicializarMapa();
        }
      }, 100);
    }
  }

  /**
   * Pinta los marcadores de las unidades filtradas o del listado completo.
   */
  mostrarMarcadoresEnMapa(): void {
    if (!this.map) return;
    
    // Limpiar marcadores existentes
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
    
    // Determinar qué datos mostrar
    const datosAMostrar = this.filtroAplicado ? this.provinciasFiltradas : this.provinciasUnidades;
    
    datosAMostrar.forEach(provincia => {
      provincia.unidades.forEach(unidad => {
        try {
          const marker = L.marker([unidad.latitud, unidad.longitud], {
            icon: this.hospitalIcon
          }).bindPopup(this.crearContenidoPopup(unidad));
          
          if (this.map) {
            marker.addTo(this.map);
            this.markers.push(marker);
          }
        } catch (error) {
          console.error('Error creando marcador para:', unidad.nombre, error);
        }
      });
    });
  }

  /**
   * Total de unidades en el listado filtrado.
   */
  getTotalUnidades(): number {
    return this.provinciasFiltradas.reduce((total, provincia) => total + provincia.unidades.length, 0);
  }

  /**
   * Expande o contrae el acordeón de una provincia.
   */
  toggleProvincia(provincia: string): void {
    this.provinciasExpandidas[provincia] = !this.provinciasExpandidas[provincia];
  }

  /**
   * Aplica el filtro por provincia.
   */
  filtrarPorProvincia(): void {
    this.aplicarFiltros();
  }

  /**
   * Aplica el filtro por nivel de atención.
   */
  filtrarPorNivel(): void {
    this.aplicarFiltros();
  }

  /**
   * Busca unidades por nombre con debounce.
   */
  buscarPorNombre(): void {
    if (this.busquedaTimeout) {
      clearTimeout(this.busquedaTimeout);
    }

    this.busquedaTimeout = setTimeout(() => {
      if (!this.tieneFiltrosActivos()) {
        this.filtroAplicado = false;
        this.provinciasFiltradas = [];
        this.mostrarMarcadoresEnMapa();
        return;
      }
      this.aplicarFiltros();
    }, 350);
  }

  /**
   * Restablece filtros y recarga el listado completo.
   */
  limpiarFiltros(): void {
    this.provinciaSeleccionada = '';
    this.nivelSeleccionado = null;
    this.terminoBusqueda = '';
    this.filtroAplicado = false;
    this.provinciasFiltradas = [];
    this.errorCargaUnidades = '';
    this.unidadDestinoActiva = null;
    this.cerrarInfoRuta();

    this.provincias.forEach((provincia) => {
      this.provinciasExpandidas[provincia] = true;
    });

    this.mostrarMarcadoresEnMapa();
  }

  private tieneFiltrosActivos(): boolean {
    return !!(
      this.provinciaSeleccionada ||
      this.nivelSeleccionado !== null ||
      this.terminoBusqueda.trim()
    );
  }

  private obtenerFiltrosActivos(): UnidadesMedicasFiltros {
    return {
      provincia: this.provinciaSeleccionada || undefined,
      nivel: this.nivelSeleccionado,
      q: this.terminoBusqueda.trim() || undefined
    };
  }

  private aplicarFiltros(): void {
    if (!this.tieneFiltrosActivos()) {
      this.filtroAplicado = false;
      this.provinciasFiltradas = [];
      this.mostrarMarcadoresEnMapa();
      return;
    }

    this.cargandoUnidades = true;
    this.errorCargaUnidades = '';
    this.filtroAplicado = true;

    this.unidadesMedicasService.getUnidadesMedicas(this.obtenerFiltrosActivos()).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => {
        this.provinciasFiltradas = data;
        this.cargandoUnidades = false;
        this.provincias.forEach((provincia) => {
          this.provinciasExpandidas[provincia] = true;
        });
        this.mostrarMarcadoresEnMapa();
      },
      error: (error) => {
        console.error('Error al filtrar unidades médicas:', error);
        this.cargandoUnidades = false;
        this.errorCargaUnidades = 'No se pudieron aplicar los filtros.';
      }
    });
  }

  /**
   * Centra el mapa en una unidad y opcionalmente abre su popup.
   */
  centrarEnUnidad(
    latitud: number,
    longitud: number,
    nombre: string,
    unidad?: UnidadMedica,
    abrirPopup = false
  ): void {
    if (!this.map) return;

    this.map.closePopup();
    this.map.setView([latitud, longitud], 15);

    if (!abrirPopup) {
      return;
    }

    const marcador = this.markers.find(marker => {
      const lat = marker.getLatLng().lat;
      const lng = marker.getLatLng().lng;
      return Math.abs(lat - latitud) < 0.0001 && Math.abs(lng - longitud) < 0.0001;
    });

    if (marcador) {
      marcador.openPopup();
    }
  }

  /**
   * Inicia la ruta hacia una unidad (mapa móvil o Google Maps en PC).
   */
  mostrarRuta(latitudDestino: number, longitudDestino: number, unidad?: UnidadMedica): void {
    if (unidad) {
      this.unidadDestinoActiva = unidad;
    } else {
      const encontrada = this.buscarUnidadPorCoordenadas(latitudDestino, longitudDestino);
      if (encontrada) {
        this.unidadDestinoActiva = encontrada;
      }
    }

    this.centrarEnUnidad(latitudDestino, longitudDestino, unidad?.nombre ?? '', unidad);

    if (this.esDispositivoMovil) {
      this.mostrarRutaEnMapaMovil(latitudDestino, longitudDestino, unidad);
      return;
    }

    this.mostrarInstruccionesGoogleMaps(latitudDestino, longitudDestino);
  }

  private mostrarRutaEnMapaMovil(
    latitudDestino: number,
    longitudDestino: number,
    unidad?: UnidadMedica
  ): void {
    this.mensajeUbicacionInline = '';
    this.map?.closePopup();

    if (!this.userLocation) {
      this.destinoPendiente = { lat: latitudDestino, lng: longitudDestino };
      this.mensajeUbicacionInline =
        'Pulse «Mi ubicación» para ver la distancia y la ruta en el mapa.';
      return;
    }

    void this.dibujarRutaEnMapa(latitudDestino, longitudDestino, unidad);
  }

  /**
   * Oculta la información de ruta en el mapa.
   */
  cerrarInfoRuta(): void {
    this.limpiarRuta();
  }

  /**
   * Abre Google Maps para la unidad destino activa.
   */
  abrirUbicacionEnGoogleMaps(): void {
    if (!this.unidadDestinoActiva) {
      this.mensajeUbicacionInline =
        'Primero busque una unidad médica y elija una de la lista (icono de mapa o ruta).';
      return;
    }

    this.mensajeUbicacionInline = '';
    this.mostrarInstruccionesGoogleMaps(
      this.unidadDestinoActiva.latitud,
      this.unidadDestinoActiva.longitud
    );
  }

  /**
   * Prepara la apertura de Google Maps (modal en PC).
   */
  mostrarInstruccionesGoogleMaps(latitudDestino: number, longitudDestino: number): void {
    const usarRuta = this.esDispositivoMovil;
    this.destinoGoogleMapsPendiente = { lat: latitudDestino, lng: longitudDestino, usarRuta };

    if (this.esDispositivoMovil) {
      this.confirmarAbrirGoogleMaps();
      return;
    }

    this.mostrarModalGoogleMaps = true;
  }

  /**
   * Confirma y abre Google Maps en una pestaña nueva.
   */
  confirmarAbrirGoogleMaps(): void {
    if (!this.destinoGoogleMapsPendiente) {
      return;
    }

    const { lat, lng, usarRuta } = this.destinoGoogleMapsPendiente;
    this.cerrarModalGoogleMaps();

    const googleMapsUrl = usarRuta
      ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
      : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(googleMapsUrl, '_blank');
  }

  /**
   * Cierra el modal de Google Maps.
   */
  cerrarModalGoogleMaps(): void {
    this.mostrarModalGoogleMaps = false;
    this.destinoGoogleMapsPendiente = null;
  }

  private buscarUnidadPorCoordenadas(latitud: number, longitud: number): UnidadMedica | null {
    for (const provincia of this.provinciasUnidades) {
      for (const unidad of provincia.unidades) {
        if (
          Math.abs(unidad.latitud - latitud) < 0.0001 &&
          Math.abs(unidad.longitud - longitud) < 0.0001
        ) {
          return unidad;
        }
      }
    }
    return null;
  }

  private limpiarRuta(): void {
    if (this.rutaLayer && this.map) {
      this.map.removeLayer(this.rutaLayer);
      this.rutaLayer = null;
    }
    this.infoRutaMovil = null;
  }

  private formatearDistancia(metros: number): string {
    if (metros >= 1000) {
      return `${(metros / 1000).toFixed(1)} km`;
    }
    return `${Math.round(metros)} m`;
  }

  private formatearDuracion(segundos: number): string {
    const minutos = Math.max(1, Math.round(segundos / 60));
    return `~${minutos} min`;
  }

  private actualizarInfoRutaMovil(
    unidad: UnidadMedica | undefined,
    distanciaMetros: number,
    duracionSegundos?: number,
    aproximada = false
  ): void {
    if (!this.esDispositivoMovil) {
      return;
    }

    const etiquetaDestino = unidad?.siglas ?? this.unidadDestinoActiva?.siglas ?? 'Destino';
    this.infoRutaMovil = {
      destino: etiquetaDestino,
      distancia: this.formatearDistancia(distanciaMetros),
      duracion: duracionSegundos ? this.formatearDuracion(duracionSegundos) : undefined,
      aproximada
    };
  }

  private async dibujarRutaEnMapa(
    latitudDestino: number,
    longitudDestino: number,
    unidad?: UnidadMedica
  ): Promise<void> {
    if (!this.map || !this.userLocation) {
      return;
    }

    this.map.closePopup();
    this.limpiarRuta();

    const origen = this.userLocation;
    const url = `https://router.project-osrm.org/route/v1/driving/${origen.lng},${origen.lat};${longitudDestino},${latitudDestino}?overview=full&geometries=geojson`;

    try {
      const respuesta = await fetch(url);
      const datos = await respuesta.json();

      if (datos?.routes?.[0]?.geometry?.coordinates?.length) {
        const ruta = datos.routes[0];
        const coordenadas = ruta.geometry.coordinates.map(
          (punto: number[]) => [punto[1], punto[0]] as [number, number]
        );

        this.ngZone.run(() => {
          if (!this.map) {
            return;
          }

          this.rutaLayer = L.polyline(coordenadas, {
            color: '#2563eb',
            weight: 5,
            opacity: 0.85
          }).addTo(this.map);

          const etiqueta = this.obtenerEtiquetaRuta();
          this.rutaLayer.bindPopup(`<strong>${etiqueta}</strong>`);
          this.map.fitBounds(this.rutaLayer.getBounds(), { padding: [40, 40] });
          this.actualizarInfoRutaMovil(unidad, ruta.distance, ruta.duration);
        });
        return;
      }
    } catch (error) {
      console.warn('No se pudo obtener ruta OSRM, usando línea directa:', error);
    }

    this.dibujarRutaLineaRecta(latitudDestino, longitudDestino, unidad);
  }

  private dibujarRutaLineaRecta(
    latitudDestino: number,
    longitudDestino: number,
    unidad?: UnidadMedica
  ): void {
    if (!this.map || !this.userLocation) {
      return;
    }

    this.ngZone.run(() => {
      this.rutaLayer = L.polyline(
        [
          [this.userLocation!.lat, this.userLocation!.lng],
          [latitudDestino, longitudDestino]
        ],
        {
          color: '#f59e0b',
          weight: 4,
          opacity: 0.9,
          dashArray: '10, 10'
        }
      ).addTo(this.map!);

      this.rutaLayer.bindPopup('<strong>Ruta aproximada en línea recta</strong>');
      this.map!.fitBounds(this.rutaLayer.getBounds(), { padding: [40, 40] });

      const distanciaKm = this.calcularDistancia(
        this.userLocation!.lat,
        this.userLocation!.lng,
        latitudDestino,
        longitudDestino
      );
      this.actualizarInfoRutaMovil(unidad, distanciaKm * 1000, undefined, true);
    });
  }

  private obtenerTituloUbicacion(): string {
    if (this.origenUbicacion === 'manual') {
      return '📍 Ubicación indicada por usted';
    }
    if (this.origenUbicacion === 'geocoded') {
      return '📍 Ubicación por dirección';
    }
    return '📍 Tu ubicación actual';
  }

  private obtenerNotaUbicacion(): string {
    if (this.origenUbicacion === 'manual') {
      return '<br><small style="color:#b45309;">Punto seleccionado en el mapa</small>';
    }
    if (this.origenUbicacion === 'geocoded') {
      return '<br><small style="color:#1d4ed8;">Obtenida por búsqueda de dirección</small>';
    }
    return '<br><small style="color:#15803d;">Obtenida del navegador</small>';
  }

  private obtenerEtiquetaRuta(): string {
    if (this.origenUbicacion === 'manual') {
      return 'Ruta desde punto indicado';
    }
    if (this.origenUbicacion === 'geocoded') {
      return 'Ruta desde dirección indicada';
    }
    return 'Ruta sugerida';
  }

  /**
   * Abre el marcador telefónico de la unidad.
   */
  llamarUnidad(telefono: string): void {
    window.location.href = `tel:${telefono}`;
  }
} 