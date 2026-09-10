/**
 * Copyright 2026 INSTITUTO ECUATORIANO DE SEGURIDAD SOCIAL - ECUADOR.
 * Todos los derechos reservados.
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { ProvinciaUnidades } from '../models/unidades-medicas.model';
import { UnidadesMedicasFiltros } from '../models/unidades-medicas-filtros.model';
import { environment } from '../../../environments/environment';

/**
 * Servicio HTTP para consultar unidades médicas agrupadas por provincia.
 *
 * @author Juan Pablo Tarapuez
 * @version Revision: 1.0
 */
@Injectable({
  providedIn: 'root'
})
export class UnidadesMedicasService {
  private readonly CACHE_SIZE = 1;
  private unidadesMedicasCache$: Observable<ProvinciaUnidades[]> | null = null;

  constructor(private readonly http: HttpClient) { }

  /**
   * Obtiene el listado de unidades; cachea la consulta cuando no hay filtros.
   */
  getUnidadesMedicas(filtros?: UnidadesMedicasFiltros): Observable<ProvinciaUnidades[]> {
    const params = this.buildParams(filtros);
    const tieneFiltros = params.keys().length > 0;

    if (!tieneFiltros && this.unidadesMedicasCache$) {
      return this.unidadesMedicasCache$;
    }

    const request$ = this.http.get<ProvinciaUnidades[]>(
      environment.unidadesMedicasDataUrl,
      { params }
    );

    if (!tieneFiltros) {
      this.unidadesMedicasCache$ = request$.pipe(shareReplay(this.CACHE_SIZE));
      return this.unidadesMedicasCache$;
    }

    return request$;
  }

  /**
   * Invalida la caché en memoria del listado sin filtros.
   */
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
}
