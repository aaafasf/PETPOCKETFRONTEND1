import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notificacion {
  id?: number;
  idNotificacion?: number;
  titulo?: string;
  mensaje: string;
  fecha?: Date | string;
  leida?: boolean;
  tipo?: 'vacuna' | 'control' | 'recordatorio' | 'general';
  fechaProgramada?: Date | string;
  idUsuario?: number;
  idMascota?: number;
  // Campos adicionales del backend
  estadoNotificacion?: string;
  createNotificacion?: string;
  updateNotificacion?: string;
  nameUsers?: string;
  emailUser?: string;
  nameMascota?: string;
  noLeida?: boolean;
  enviada?: boolean;
  usuarioEnvia?: string;
  emailEnvia?: string;
}

export interface CrearNotificacionRequest {
  titulo: string;
  mensaje: string;
  tipo: 'vacuna' | 'control' | 'recordatorio' | 'general';
  idUsuario?: number;
  idMascota?: number;
  fechaProgramada?: string;
  tipoRecordatorio?: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificacionesService { 
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/notificaciones';

  // ==================== READ (Consultas) ====================

  // Obtener todas las notificaciones
  obtenerTodasNotificaciones(): Observable<Notificacion[]> {
    const params = new HttpParams().set('t', Date.now().toString());
    return this.http.get<Notificacion[]>(`${this.apiUrl}/lista-completa`, {
      params
    });
  }

  // Obtener todas las notificaciones (sin caché)
  obtenerTodasNotificacionesFrescas(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.apiUrl}/lista`, {
      params: new HttpParams().set('_t', Date.now().toString())
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
      params
    });
  }

  // Obtener detalle de una notificación
  obtenerDetalleNotificacion(idNotificacion: number): Observable<Notificacion> {
    return this.http.get<Notificacion>(`${this.apiUrl}/${idNotificacion}`);
  }

  // Obtener notificaciones no leídas
  obtenerNoLeidas(idUsuario?: number): Observable<Notificacion[]> {
    let params = new HttpParams().set('leida', 'false');
    if (idUsuario) {
      params = params.set('idUsuario', idUsuario.toString());
    }
    params = params.set('t', Date.now().toString());
    return this.http.get<Notificacion[]>(`${this.apiUrl}/no-leidas`, {
      params
    });
  }

  // ==================== CREATE (Crear) ====================

  // Crear nueva notificación/recordatorio
  crearNotificacion(datos: CrearNotificacionRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/crear`, datos);
  }

  // Crear alerta programada
  crearAlertaProgramada(datos: CrearNotificacionRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/alerta-programada`, datos);
  }

  // ==================== UPDATE (Actualizar) ====================

  // Marcar notificación como leída
  marcarComoLeida(idNotificacion: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/marcar-leida/${idNotificacion}`, {});
  }

  // Actualizar notificación
  actualizarNotificacion(idNotificacion: number, datos: Partial<Notificacion>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idNotificacion}`, datos);
  }

  // Actualizar estado de la notificación
  actualizarEstado(idNotificacion: number, estado: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${idNotificacion}/estado`, { estado });
  }

  // ==================== DELETE (Eliminar) ====================

  // Eliminar una notificación
  eliminarNotificacion(idNotificacion: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idNotificacion}`);
  }

  // Limpiar historial de notificaciones (eliminar todas las leídas)
  limpiarHistorial(idUsuario?: number): Observable<any> {
    let url = `${this.apiUrl}/limpiar-historial`;
    if (idUsuario) {
      url += `/${idUsuario}`;
    }
    return this.http.delete(url);
  }

  // Obtener estadísticas
  obtenerEstadisticas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/estadisticas`);
  }
}

