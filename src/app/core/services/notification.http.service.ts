import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { NotificationRepository } from '../repositories/notifications.repository';
import { AppNotification } from '../interfaces/notification.interface';

@Injectable({
  providedIn: 'root',
})
export class NotificationHttpService implements NotificationRepository {
  private base = 'http://localhost:3000/notificacion';

  constructor(private http: HttpClient) {}

  // Obtener todas las notificaciones
  async getAll(): Promise<AppNotification[]> {
  const res = await firstValueFrom(
    this.http.get<any>(`${this.base}/lista`) // Usamos any para inspeccionar
  );
  console.log('Datos recibidos del servidor:', res); // <--- MIRA ESTO EN LA CONSOLA F12
  
  // Si el backend envía { success: true, data: [...] }, 
  // entonces debes retornar res.data en lugar de res.
  return Array.isArray(res) ? res : (res.data ?? []); 
}

  // Obtener notificaciones por usuario (con estado opcional)
  async getByUser(idUsuario: number, estado?: string): Promise<AppNotification[]> {
    let params = new HttpParams();
    if (estado) {
      params = params.set('estado', estado);
    }

    const res = await firstValueFrom(
      this.http.get<AppNotification[]>(`${this.base}/usuario/${idUsuario}`, { params })
    );
    return res ?? [];
  }

  // Obtener no leídas por usuario
  async getUnreadByUser(idUsuario: number): Promise<AppNotification[]> {
    const res = await firstValueFrom(
      this.http.get<AppNotification[]>(`${this.base}/usuario/${idUsuario}/no-leidas`)
    );
    return res ?? [];
  }

  // Crear nueva notificación
  async create(data: Partial<AppNotification>): Promise<number> {
    const res = await firstValueFrom(
      this.http.post<{ idNotificacion: number }>(`${this.base}/crear`, data)
    );
    return res.idNotificacion;
  }

  // Crear notificaciones masivas
  async createBulk(payload: { mensaje: string; tipo?: string; usuarios: number[] }): Promise<number> {
    const res = await firstValueFrom(
      this.http.post<{ count: number }>(`${this.base}/crear-masiva`, payload)
    );
    return res.count;
  }

  // Marcar notificación como leída
  async markRead(id: number): Promise<void> {
    await firstValueFrom(this.http.put(`${this.base}/marcar-leida/${id}`, {}));
  }

  // Marcar todas las notificaciones de un usuario como leídas
  async markAllRead(idUsuario: number): Promise<void> {
    await firstValueFrom(this.http.put(`${this.base}/marcar-todas-leidas/${idUsuario}`, {}));
  }

  // Eliminar notificación
  async delete(id: number): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.base}/eliminar/${id}`));
  }

  // Obtener estadísticas
  async stats(): Promise<{ totalNotificaciones: number; pendientes: number; leidas: number; usuariosConNotificaciones: number }> {
    const res = await firstValueFrom(
      this.http.get<{ totalNotificaciones: number; pendientes: number; leidas: number; usuariosConNotificaciones: number }>(
        `${this.base}/estadisticas`
      )
    );
    return res;
  }

  async update(id: number, data: Partial<AppNotification>): Promise<void> {
    await firstValueFrom(
      this.http.put(`${this.base}/actualizar/${id}`, data)
    );
  }

  
}