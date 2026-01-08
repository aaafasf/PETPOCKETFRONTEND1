import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notificacion {
  id?: number;
  idNotificacion?: number; // Campo que viene del backend
  titulo?: string;
  mensaje: string;
  fecha?: Date | string;
  leida: boolean;
  tipo?: 'vacuna' | 'control' | 'recordatorio' | 'general';
  fechaProgramada?: Date | string;
  idUsuario?: number;
  idMascota?: number;
  // Campos adicionales que puede devolver el backend
  estadoNotificacion?: string;
  createNotificacion?: string;
  updateNotificacion?: string;
  nameUsers?: string;
  emailUser?: string;
  noLeida?: boolean;
}

export interface CrearNotificacionRequest {
  titulo: string;
  mensaje: string;
  tipo: 'vacuna' | 'control' | 'recordatorio' | 'general';
  fechaProgramada?: string;
  idMascota?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificacionesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/notificacion';

  // ==================== READ (Consultas) ====================

  // Obtener todas las notificaciones
  obtenerTodasNotificaciones(): Observable<Notificacion[]> {
    const params = new HttpParams().set('t', Date.now().toString());
    return this.http.get<Notificacion[]>(`${this.apiUrl}/lista`, {
      params,
      headers: { 'Cache-Control': 'no-cache' },
    });
  }

  // Obtener notificaciones de un usuario
  obtenerNotificacionesUsuario(idUsuario: number, soloNoLeidas?: boolean): Observable<Notificacion[]> {
    let params = new HttpParams().set('idUsuario', idUsuario.toString());
    if (soloNoLeidas) {
      params = params.set('leida', 'false');
    }
    params = params.set('t', Date.now().toString());
    return this.http.get<Notificacion[]>(`${this.apiUrl}/usuario/${idUsuario}`, {
      params,
      headers: { 'Cache-Control': 'no-cache' },
    });
  }

  // Obtener detalle de una notificación
  obtenerDetalleNotificacion(idNotificacion: number): Observable<Notificacion> {
    return this.http.get<Notificacion>(`${this.apiUrl}/detalle/${idNotificacion}`);
  }

  // Obtener notificaciones no leídas
  obtenerNoLeidas(idUsuario?: number): Observable<Notificacion[]> {
    let params = new HttpParams().set('leida', 'false');
    if (idUsuario) {
      params = params.set('idUsuario', idUsuario.toString());
    }
    params = params.set('t', Date.now().toString());
    return this.http.get<Notificacion[]>(`${this.apiUrl}/no-leidas`, {
      params,
      headers: { 'Cache-Control': 'no-cache' },
    });
  }

  // ==================== CREATE (Crear) ====================

  // Crear nueva notificación/recordatorio
  crearNotificacion(datos: CrearNotificacionRequest): Observable<Notificacion> {
    return this.http.post<Notificacion>(`${this.apiUrl}/crear`, datos);
  }

  // ==================== UPDATE (Actualizar) ====================

  // Marcar notificación como leída
  marcarComoLeida(idNotificacion: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/marcar-leida/${idNotificacion}`, {});
  }

  // Actualizar notificación
  actualizarNotificacion(idNotificacion: number, datos: Partial<Notificacion>): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar/${idNotificacion}`, datos);
  }

  // ==================== DELETE (Eliminar) ====================

  // Eliminar una notificación
  eliminarNotificacion(idNotificacion: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${idNotificacion}`);
  }

  // Limpiar historial de notificaciones (eliminar todas las leídas)
  limpiarHistorial(idUsuario?: number): Observable<any> {
    let url = `${this.apiUrl}/limpiar-historial`;
    if (idUsuario) {
      url += `/${idUsuario}`;
    }
    return this.http.delete(url);
  }
}

