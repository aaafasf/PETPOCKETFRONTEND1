import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroments';

export interface MascotaDto {
  idMascota: number;
  nombreMascota: string;
  especie: string;
  raza?: string;
  idPropietario: number;
  propietario?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MascotaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<MascotaDto[]> {
    return this.http.get<MascotaDto[]>(`${this.apiUrl}/mascota/lista`);
  }

  getByPropietario(idCliente: number): Observable<MascotaDto[]> {
    return this.http.get<MascotaDto[]>(`${this.apiUrl}/mascota/propietario/${idCliente}`);
  }
}