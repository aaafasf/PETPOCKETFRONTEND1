import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../enviroments/enviroments';

export interface MascotaDto {
  idMascota?: number;
  nombreMascota: string;
  especie: string;
  raza?: string;
  edad?: number;
  sexo?: string;
  idPropietario: number;
  pesoKg?: number;
  color?: string;
  alergias?: string[];
  esterilizado?: boolean;
  observaciones?: string;
  propietario?: any;
  detallesMongo?: any;
}
// 👉 Para CREAR mascota (POST)
export interface MascotaCreateDto {
  nombreMascota: string;
  especie: string;
  raza?: string;
  edad?: number;
  sexo?: string;
  idPropietario: number;
}

// 👉 Para ACTUALIZAR mascota (PUT)
export interface MascotaUpdateDto {
  nombreMascota: string;
  especie: string;
  raza?: string;
  edad?: number;
  sexo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MascotaService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getAll(): Observable<MascotaDto[]> {
    const url = `${this.apiUrl}/api/mascota/lista?t=${Date.now()}`;
    // Defensive: if the first response is an empty array (possible caching/304 issue), retry once.
    return this.http.get<any>(url, { observe: 'response' as 'response' }).pipe(
      switchMap(resp => {
        const body = resp.body;
        if (Array.isArray(body) && body.length > 0) {
          return of(body as MascotaDto[]);
        }
        // retry once with a new timestamp
        const retryUrl = `${this.apiUrl}/api/mascota/lista?t=${Date.now()}&retry=1`;
        console.debug('MascotaService.getAll: empty response, retrying', { url, status: resp.status, headers: resp.headers?.keys ? resp.headers.keys() : [] });
        return this.http.get<MascotaDto[]>(retryUrl);
      })
    );
  }

  getById(id: number): Observable<MascotaDto> {
    return this.http.get<MascotaDto>(`${this.apiUrl}/api/mascota/${id}`);
  }

  getByPropietario(idPropietario: number): Observable<MascotaDto[]> {
    const url = `${this.apiUrl}/api/mascota/propietario/${idPropietario}?t=${Date.now()}`;
    return this.http.get<any>(url, { observe: 'response' as 'response' }).pipe(
      switchMap(resp => {
        const body = resp.body;
        if (Array.isArray(body) && body.length > 0) {
          return of(body as MascotaDto[]);
        }
        const retryUrl = `${this.apiUrl}/api/mascota/propietario/${idPropietario}?t=${Date.now()}&retry=1`;
        console.debug('MascotaService.getByPropietario: empty response, retrying', { url, status: resp.status, headers: resp.headers?.keys ? resp.headers.keys() : [] });
        return this.http.get<MascotaDto[]>(retryUrl);
      })
    );
  }

  create(mascota: any): Observable<any> {
    const body: any = { ...mascota };
    // Backend expects `idCliente` (SQL) while frontend uses `idPropietario`.
    if (body.idPropietario !== undefined && body.idPropietario !== null) {
      body.idCliente = Number(body.idPropietario);
      // keep idPropietario as router/validation expects it
    }
    return this.http.post(`${this.apiUrl}/api/mascota/crear`, body);
  }

  update(id: number, mascota: any): Observable<any> {
    const body: any = { ...mascota };
    if (body.idPropietario !== undefined && body.idPropietario !== null) {
      body.idCliente = Number(body.idPropietario);
      // keep idPropietario for validation
    }
    return this.http.put(`${this.apiUrl}/api/mascota/actualizar/${id}`, body);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/mascota/eliminar/${id}`);
  }
}