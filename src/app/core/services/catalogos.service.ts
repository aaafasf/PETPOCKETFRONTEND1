import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CatalogosService {

  private api = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  /* ===================== ESPECIES ===================== */

  getEspecies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/especies`);
  }

  addEspecie(data: any) {
    return this.http.post(`${this.api}/especies`, data);
  }

  updateEspecie(id: number, data: any) {
    return this.http.put(`${this.api}/especies/${id}`, data);
  }

  setEspecieActiva(id: number, activo: boolean) {
    return this.http.patch(`${this.api}/especies/${id}`, { activo });
  }

  /* ===================== RAZAS ===================== */

  getRazas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/razas`);
  }

  addRaza(data: any) {
    return this.http.post(`${this.api}/razas`, data);
  }

  updateRaza(id: number, data: any) {
    return this.http.put(`${this.api}/razas/${id}`, data);
  }

  setRazaActiva(id: number, activo: boolean) {
    return this.http.patch(`${this.api}/razas/${id}`, { activo });
  }

  /* ===================== SEXOS ===================== */

  getSexos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/sexos`);
  }

  addSexo(data: any) {
    return this.http.post(`${this.api}/sexos`, data);
  }

  updateSexo(id: number, data: any) {
    return this.http.put(`${this.api}/sexos/${id}`, data);
  }

  setSexoActiva(id: number, activo: boolean) {
    return this.http.patch(`${this.api}/sexos/${id}`, { activo });
  }

  /* ===================== TAMAÑOS ===================== */

  getTamanos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/tamanos`);
  }

  addTamano(data: any) {
    return this.http.post(`${this.api}/tamanos`, data);
  }

  updateTamano(id: number, data: any) {
    return this.http.put(`${this.api}/tamanos/${id}`, data);
  }

  setTamanoActiva(id: number, activo: boolean) {
    return this.http.patch(`${this.api}/tamanos/${id}`, { activo });
  }

  /* ===================== COLORES ===================== */

  getColores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/colores`);
  }

  addColor(data: any) {
    return this.http.post(`${this.api}/colores`, data);
  }

  updateColor(id: number, data: any) {
    return this.http.put(`${this.api}/colores/${id}`, data);
  }

  setColorActiva(id: number, activo: boolean) {
    return this.http.patch(`${this.api}/colores/${id}`, { activo });
  }

  /* ===================== ESTADOS MASCOTA ===================== */

  getEstadosMascota(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/estados-mascota`);
  }

  addEstadoMascota(data: any) {
    return this.http.post(`${this.api}/estados-mascota`, data);
  }

  updateEstadoMascota(id: number, data: any) {
    return this.http.put(`${this.api}/estados-mascota/${id}`, data);
  }

  setEstadoMascotaActiva(id: number, activo: boolean) {
    return this.http.patch(`${this.api}/estados-mascota/${id}`, { activo });
  }

  
desactivarEspecie(id: number) {
  return this.http.put(`${this.api}/especies/${id}/desactivar`, {});
}
}
