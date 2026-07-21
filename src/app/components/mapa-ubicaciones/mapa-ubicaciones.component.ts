import { Component, OnInit, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { UnidadesMedicasService } from '../../core/services/unidades-medicas.service';
import { ProvinciaUnidades, UnidadMedica } from '../../core/models/unidades-medicas.model';
import { UnidadesMedicasFiltros } from '../../core/models/unidades-medicas-filtros.model';
import { environment } from '../../../environments/environment';
import * as L from 'leaflet';

type OrigenUbicacion = 'gps' | 'manual' | 'geocoded';

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
  mostrarModalGoogleMaps = false;
  private destinoGoogleMapsPendiente: { lat: number; lng: number; usarRuta: boolean } | null = null;

  private mediaQueryList?: MediaQueryList;
  private mediaQueryChangeHandler?: (event: MediaQueryListEvent) => void;

  // Destino pendiente si el usuario pidió ruta antes de tener ubicación
  private destinoPendiente: { lat: number; lng: number } | null = null;

  private mapRevealObserver?: IntersectionObserver;
  private rutaLayer: L.Polyline | null = null;
  private mapClickUbicacionHandler?: (event: L.LeafletMouseEvent) => void;
  
  // Iconos personalizados
  private userLocationIcon?: L.Icon | L.DivIcon;
  private hospitalIcon?: L.Icon;
  
  constructor(
    private unidadesMedicasService: UnidadesMedicasService,
    private ngZone: NgZone
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

  ngOnInit(): void {
    this.configurarDeteccionDispositivo();

    // Fix para iconos de Leaflet
    this.configurarIconosLeaflet();
    
    this.unidadesMedicasService.getUnidadesMedicas().subscribe({
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
  
  // Método para inicializar el mapa
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
      this.mostrarUbicacionUsuarioEnMapa();
      this.actualizarMarcadoresConDistancia();
      if (this.destinoPendiente) {
        const destino = this.destinoPendiente;
        this.destinoPendiente = null;
        this.dibujarRutaEnMapa(destino.lat, destino.lng);
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

  mostrarUbicacionUsuarioEnMapa(): void {
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

    const tituloUbicacion = this.origenUbicacion === 'manual'
      ? '📍 Ubicación indicada por usted'
      : this.origenUbicacion === 'geocoded'
        ? '📍 Ubicación por dirección'
        : '📍 Tu ubicación actual';

    const notaUbicacion = this.origenUbicacion === 'manual'
      ? '<br><small style="color:#b45309;">Punto seleccionado en el mapa</small>'
      : this.origenUbicacion === 'geocoded'
        ? '<br><small style="color:#1d4ed8;">Obtenida por búsqueda de dirección</small>'
        : '<br><small style="color:#15803d;">Obtenida del navegador</small>';

    this.userLocationMarker.bindPopup(`
      <div style="text-align: center;">
        <strong>${tituloUbicacion}</strong>
        <br>
        <small>Lat: ${this.userLocation.lat.toFixed(6)}</small>
        <br>
        <small>Lng: ${this.userLocation.lng.toFixed(6)}</small>
        ${notaUbicacion}
      </div>
    `).openPopup();

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

  deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  actualizarDistanciasEnMarcadores(): void {
    // Delegado a actualizarMarcadoresConDistancia()
    this.actualizarMarcadoresConDistancia();
  }

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

  getTotalUnidades(): number {
    return this.provinciasFiltradas.reduce((total, provincia) => total + provincia.unidades.length, 0);
  }

  toggleProvincia(provincia: string): void {
    this.provinciasExpandidas[provincia] = !this.provinciasExpandidas[provincia];
  }

  filtrarPorProvincia(): void {
    this.aplicarFiltros();
  }

  filtrarPorNivel(): void {
    this.aplicarFiltros();
  }

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

  limpiarFiltros(): void {
    this.provinciaSeleccionada = '';
    this.nivelSeleccionado = null;
    this.terminoBusqueda = '';
    this.filtroAplicado = false;
    this.provinciasFiltradas = [];
    this.errorCargaUnidades = '';

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

    this.unidadesMedicasService.getUnidadesMedicas(this.obtenerFiltrosActivos()).subscribe({
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

  centrarEnUnidad(latitud: number, longitud: number, nombre: string, unidad?: UnidadMedica): void {
    if (unidad) {
      this.unidadDestinoActiva = unidad;
    } else {
      const encontrada = this.buscarUnidadPorCoordenadas(latitud, longitud);
      if (encontrada) {
        this.unidadDestinoActiva = encontrada;
      }
    }

    if (!this.map) return;
    
    this.map.setView([latitud, longitud], 15);
    
    // Buscar el marcador correspondiente y abrir su popup
    const marcador = this.markers.find(marker => {
      const lat = marker.getLatLng().lat;
      const lng = marker.getLatLng().lng;
      return Math.abs(lat - latitud) < 0.0001 && Math.abs(lng - longitud) < 0.0001;
    });
    
    if (marcador) {
      marcador.openPopup();
    }
  }

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
    this.mostrarInstruccionesGoogleMaps(latitudDestino, longitudDestino);
  }

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

  mostrarInstruccionesGoogleMaps(latitudDestino: number, longitudDestino: number): void {
    const usarRuta = this.esDispositivoMovil;
    this.destinoGoogleMapsPendiente = { lat: latitudDestino, lng: longitudDestino, usarRuta };

    if (this.esDispositivoMovil) {
      this.confirmarAbrirGoogleMaps();
      return;
    }

    this.mostrarModalGoogleMaps = true;
  }

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
  }

  private async dibujarRutaEnMapa(latitudDestino: number, longitudDestino: number): Promise<void> {
    if (!this.map || !this.userLocation) {
      return;
    }

    this.limpiarRuta();

    const origen = this.userLocation;
    const url = `https://router.project-osrm.org/route/v1/driving/${origen.lng},${origen.lat};${longitudDestino},${latitudDestino}?overview=full&geometries=geojson`;

    try {
      const respuesta = await fetch(url);
      const datos = await respuesta.json();

      if (datos?.routes?.[0]?.geometry?.coordinates?.length) {
        const coordenadas = datos.routes[0].geometry.coordinates.map(
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

          const etiqueta = this.origenUbicacion === 'manual'
            ? 'Ruta desde punto indicado'
            : this.origenUbicacion === 'geocoded'
              ? 'Ruta desde dirección indicada'
              : 'Ruta sugerida';
          this.rutaLayer.bindPopup(`<strong>${etiqueta}</strong>`);
          this.map.fitBounds(this.rutaLayer.getBounds(), { padding: [40, 40] });
        });
        return;
      }
    } catch (error) {
      console.warn('No se pudo obtener ruta OSRM, usando línea directa:', error);
    }

    this.dibujarRutaLineaRecta(latitudDestino, longitudDestino);
  }

  private dibujarRutaLineaRecta(latitudDestino: number, longitudDestino: number): void {
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
    });
  }

  llamarUnidad(telefono: string): void {
    window.location.href = `tel:${telefono}`;
  }
} 