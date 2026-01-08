// core/use-cases/schedule-reminder.usecase.ts
import { NotificationRepository } from "../repositories/notifications.repository";

export class ScheduleReminderUseCase {
  constructor(private repo: NotificationRepository) {}
  execute(input: { idUsuario: number; mensaje: string; fechaProgramada: string; idMascota?: number }) {
    return this.repo.create({
      idUsuario: input.idUsuario,
      idMascota: input.idMascota,
      mensaje: input.mensaje,
      tipo: 'recordatorio',
      estadoNotificacion: 'pendiente',
      createNotificacion: new Date().toISOString(),
      fechaProgramada: input.fechaProgramada,
    });
  }
}