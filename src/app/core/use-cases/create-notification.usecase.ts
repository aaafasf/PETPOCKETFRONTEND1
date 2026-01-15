import { NotificationRepository } from "../repositories/notifications.repository";
import { AppNotification } from "../interfaces/notification.interface";

export class CreateNotificationUseCase {
  constructor(private repo: NotificationRepository) {}
  execute(data: Partial<AppNotification>) {
    return this.repo.create({
      ...data,
      tipo: data.tipo ?? 'general',
      estadoNotificacion: 'pendiente',
      createNotificacion: new Date().toISOString(),
    });
  }
}