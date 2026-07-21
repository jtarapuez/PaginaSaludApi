import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, shareReplay } from 'rxjs';
import { ProvinciaUnidades, UnidadMedica } from '../models/unidades-medicas.model';
import { UnidadesMedicasFiltros } from '../models/unidades-medicas-filtros.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UnidadesMedicasService {
  private readonly CACHE_SIZE = 1;
  private unidadesMedicasCache$: Observable<ProvinciaUnidades[]> | null = null;

  constructor(private http: HttpClient) { }

  getUnidadesMedicas(filtros?: UnidadesMedicasFiltros): Observable<ProvinciaUnidades[]> {
    const params = this.buildParams(filtros);
    const tieneFiltros = params.keys().length > 0;

    if (!tieneFiltros && this.unidadesMedicasCache$) {
      return this.unidadesMedicasCache$;
    }

    const request$ = this.http
      .get<ProvinciaUnidades[]>(environment.unidadesMedicasDataUrl, { params })
      .pipe(
        catchError((error) => {
          if (environment.enableConsoleLogging) {
            console.warn('API no disponible, usando JSON local como fallback', error);
          }
          if (tieneFiltros && filtros) {
            return this.getFallbackData().pipe(
              map((data) => this.filtrarEnCliente(data, filtros))
            );
          }
          return this.getFallbackData();
        })
      );

    if (!tieneFiltros) {
      this.unidadesMedicasCache$ = request$.pipe(shareReplay(this.CACHE_SIZE));
      return this.unidadesMedicasCache$;
    }

    return request$;
  }

  clearCache(): void {
    this.unidadesMedicasCache$ = null;
  }

  private buildParams(filtros?: UnidadesMedicasFiltros): HttpParams {
    let params = new HttpParams();

    if (filtros?.provincia?.trim()) {
      params = params.set('provincia', filtros.provincia.trim());
    }
    if (filtros?.nivel != null) {
      params = params.set('nivel', filtros.nivel.toString());
    }
    if (filtros?.q?.trim()) {
      params = params.set('q', filtros.q.trim());
    }

    return params;
  }

  private getFallbackData(): Observable<ProvinciaUnidades[]> {
    return this.http.get<ProvinciaUnidades[]>(
      environment.unidadesMedicasFallbackUrl ?? 'assets/data/unidades-medicas.json'
    );
  }

  private filtrarEnCliente(
    data: ProvinciaUnidades[],
    filtros: UnidadesMedicasFiltros
  ): ProvinciaUnidades[] {
    let resultados = [...data];

    if (filtros.provincia?.trim()) {
      const provincia = filtros.provincia.trim();
      resultados = resultados.filter(
        (p) => this.normalizarTexto(p.provincia) === this.normalizarTexto(provincia)
      );
    }

    if (filtros.nivel != null) {
      resultados = resultados
        .map((provincia) => ({
          ...provincia,
          unidades: provincia.unidades.filter((u) => u.nivel === filtros.nivel)
        }))
        .filter((provincia) => provincia.unidades.length > 0);
    }

    if (filtros.q?.trim()) {
      const termino = this.normalizarTexto(filtros.q.trim());
      resultados = resultados
        .map((provincia) => ({
          ...provincia,
          unidades: provincia.unidades.filter((u) => this.coincideBusqueda(u, termino))
        }))
        .filter((provincia) => provincia.unidades.length > 0);
    }

    return resultados;
  }

  private coincideBusqueda(unidad: UnidadMedica, termino: string): boolean {
    return (
      this.normalizarTexto(unidad.nombre).includes(termino) ||
      this.normalizarTexto(unidad.siglas).includes(termino) ||
      this.normalizarTexto(unidad.direccion).includes(termino)
    );
  }

  private normalizarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
