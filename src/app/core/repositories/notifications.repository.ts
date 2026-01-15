import { AppNotification } from "../interfaces/notification.interface";

export interface NotificationRepository {
  getAll(): Promise<AppNotification[]>;
  getByUser(idUsuario: number, estado?: string): Promise<AppNotification[]>;
  create(data: Partial<AppNotification>): Promise<number>; // returns id
  update(id: number, data: Partial<AppNotification>): Promise<void>;
  delete(id: number): Promise<void>;
  markRead(id: number): Promise<void>;
  markAllRead(idUsuario: number): Promise<void>;
  createBulk(payload: { mensaje: string; tipo?: string; usuarios: number[] }): Promise<number>;
  stats(): Promise<{ totalNotificaciones: number; pendientes: number; leidas: number; usuariosConNotificaciones: number }>;
}
