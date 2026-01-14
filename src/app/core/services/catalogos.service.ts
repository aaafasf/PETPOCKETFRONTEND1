import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CatalogosService {
  private api = '/api'; // Ajusta si usas proxy o base diferente

  constructor(private http: HttpClient) {}

  getEspecies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/especies`);
  }
  getRazas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/razas`);
  }
  getTamanos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/tamanos`);
  }
  getSexos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/sexos`);
  }
  getColores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/colores`);
  }
  getEstadosMascota(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/estados-mascota`);
  }

  // --- Métodos CRUD para catálogos ---
  addEspecie(data: any) {
    return this.http.post(`${this.api}/especies`, data);
  }
  updateEspecie(id: number, data: any) {
    return this.http.put(`${this.api}/especies/${id}`, data);
  }
  setEspecieActiva(id: number, activo: boolean) {
    return this.http.patch(`${this.api}/especies/${id}/activo`, { activo });
  }

  addRaza(data: any) {
    return this.http.post(`${this.api}/razas`, data);
  }
  updateRaza(id: number, data: any) {
    return this.http.put(`${this.api}/razas/${id}`, data);
  }
  setRazaActiva(id: number, activo: boolean) {
    return this.http.patch(`${this.api}/razas/${id}/activo`, { activo });
  }

  addTamano(data: any) {
    return this.http.post(`${this.api}/tamanos`, data);
  }
  updateTamano(id: number, data: any) {
    return this.http.put(`${this.api}/tamanos/${id}`, data);
  }
  setTamanoActiva(id: number, activo: boolean) {
    return this.http.patch(`${this.api}/tamanos/${id}/activo`, { activo });
  }

  addSexo(data: any) {
    return this.http.post(`${this.api}/sexos`, data);
  }
  updateSexo(id: number, data: any) {
    return this.http.put(`${this.api}/sexos/${id}`, data);
  }
  setSexoActiva(id: number, activo: boolean) {
    return this.http.patch(`${this.api}/sexos/${id}/activo`, { activo });
  }

  addColor(data: any) {
    return this.http.post(`${this.api}/colores`, data);
  }
  updateColor(id: number, data: any) {
    return this.http.put(`${this.api}/colores/${id}`, data);
  }
  setColorActiva(id: number, activo: boolean) {
    return this.http.patch(`${this.api}/colores/${id}/activo`, { activo });
  }

  addEstadoMascota(data: any) {
    return this.http.post(`${this.api}/estados-mascota`, data);
  }
  updateEstadoMascota(id: number, data: any) {
    return this.http.put(`${this.api}/estados-mascota/${id}`, data);
  }
  setEstadoMascotaActiva(id: number, activo: boolean) {
    return this.http.patch(`${this.api}/estados-mascota/${id}/activo`, { activo });
  }
}
