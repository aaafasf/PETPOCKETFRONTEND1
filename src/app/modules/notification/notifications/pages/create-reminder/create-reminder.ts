import { Component } from '@angular/core';
import { NotificationHttpService } from '../../../../../core/services/notification.http.service';
import { ScheduleReminderUseCase } from '../../../../../core/use-cases/schedule-reminder.usecase';
import { NotificationForm } from '../../components/notification-form/notification-form';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-create-reminder',
  imports: [NotificationForm, ToastModule, RouterLink],
  providers: [MessageService],
  templateUrl: './create-reminder.html',
  styleUrl: './create-reminder.css',
})
export class CreateReminder {
  private uc: ScheduleReminderUseCase;

  constructor(
    private repo: NotificationHttpService,
    private msg: MessageService
  ) {
    this.uc = new ScheduleReminderUseCase(this.repo);
  }

  async onSubmit(data: any) {
    await this.uc.execute({
      idUsuario: data.idUsuario!,
      idMascota: data.idMascota,
      mensaje: data.mensaje!,
      fechaProgramada: data.fechaProgramada!,
    });
    this.msg.add({ severity: 'success', summary: 'Recordatorio', detail: 'Recordatorio programado' });
  }

}
