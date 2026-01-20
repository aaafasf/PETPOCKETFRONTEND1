import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.http.get<MascotaDto[]>(`${this.apiUrl}/api/mascota/lista`);
  }

  getById(id: number): Observable<MascotaDto> {
    return this.http.get<MascotaDto>(`${this.apiUrl}/api/mascota/${id}`);
  }

  getByPropietario(idCliente: number): Observable<MascotaDto[]> {
    return this.http.get<MascotaDto[]>(`${this.apiUrl}/api/mascota/propietario/${idCliente}`);
  }

  create(mascota: MascotaCreateDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/mascota/crear`, mascota);
  }

  update(id: number, mascota: MascotaUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/mascota/actualizar/${id}`, mascota);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/mascota/eliminar/${id}`);
  }
}