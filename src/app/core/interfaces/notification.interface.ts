export interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'recordatorio' | 'campaña';
  servicio?: string; // Ej: "Vacuna", "Cirugía"
  destinatario: string; // Puede ser cliente o "Masivo"
  fechaProgramada: Date;
  estado: 'pendiente' | 'enviado';
}

export type NotificationState = 'pendiente' | 'leida' | 'cancelada';

export interface AppNotification {
  idNotificacion: number;
  idUsuario: number;
  mensaje: string;
  tipo?: string;
  estadoNotificacion: 'pendiente' | 'leida';
  createNotificacion: string;
  updateNotificacion?: string;
  fechaProgramada?: string;
  idMascota?: number;
}