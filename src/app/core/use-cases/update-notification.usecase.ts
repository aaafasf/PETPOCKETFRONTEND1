// core/use-cases/update-notification.usecase.ts
import { NotificationRepository } from "../repositories/notifications.repository";

export class UpdateNotificationUseCase {
  constructor(private repo: NotificationRepository) {}
  execute(id: number, data: { mensaje?: string; fechaProgramada?: string }) {
    return this.repo.update(id, {
      mensaje: data.mensaje,
      fechaProgramada: data.fechaProgramada,
      updateNotificacion: new Date().toISOString(),
    });
  }
}