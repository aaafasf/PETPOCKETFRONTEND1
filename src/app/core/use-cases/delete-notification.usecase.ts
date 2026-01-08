// core/use-cases/delete-notification.usecase.ts
import { NotificationRepository } from "../repositories/notifications.repository";

export class DeleteNotificationUseCase {
  constructor(private repo: NotificationRepository) {}
  execute(id: number) { return this.repo.delete(id); }
  markRead(id: number) { return this.repo.markRead(id); }
  markAllRead(idUsuario: number) { return this.repo.markAllRead(idUsuario); }
}
