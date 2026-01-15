// core/use-cases/send-campaign.usecase.ts
import { NotificationRepository } from "../repositories/notifications.repository";

export class SendCampaignUseCase {
  constructor(private repo: NotificationRepository) {}
  execute(payload: { mensaje: string; usuarios: number[]; tipo?: string }) {
    return this.repo.createBulk({
      mensaje: payload.mensaje,
      tipo: payload.tipo ?? 'campaña',
      usuarios: payload.usuarios,
    });
  }
}