// core/use-cases/get-notifications.usecase.ts
import { NotificationRepository } from "../repositories/notifications.repository";

export class GetNotificationsUseCase {
  constructor(private repo: NotificationRepository) {}
  all() { return this.repo.getAll(); }
  byUser(idUsuario: number, estado?: string) { return this.repo.getByUser(idUsuario, estado); }
  stats() { return this.repo.stats(); }
}