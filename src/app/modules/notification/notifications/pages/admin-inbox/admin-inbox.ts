import { Component } from '@angular/core';
import { NotificationHttpService } from '../../../../../core/services/notification.http.service';
import { GetNotificationsUseCase } from '../../../../../core/use-cases/get-notifications.usecase';
import { DeleteNotificationUseCase } from '../../../../../core/use-cases/delete-notification.usecase';
import { NotificationTable } from '../../components/notification-table/notification-table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AppNotification } from '../../../../../core/interfaces/notification.interface';
import { ChangeDetectorRef } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-admin-inbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NotificationTable, ToastModule],
  providers: [MessageService],
  templateUrl: './admin-inbox.html',
  styleUrl: './admin-inbox.css',
})
export class AdminInbox {

  data: AppNotification[] = [];

  private getUC: GetNotificationsUseCase;
  private delUC: DeleteNotificationUseCase;

  constructor(
    private repo: NotificationHttpService,
    private msg: MessageService,
    private cd: ChangeDetectorRef

  ) {
    this.getUC = new GetNotificationsUseCase(this.repo);
    this.delUC = new DeleteNotificationUseCase(this.repo);
  }

  // ✅ Cargar datos después de que la vista está lista
  async ngAfterViewInit() {
    await this.load();
  }

  async load() {
    const res = await this.getUC.all();
    this.data = res.map(n => {
      let mensaje = n.mensaje;
      try {
        mensaje = decodeURIComponent(mensaje);
      } catch {}
      return { ...n, mensaje };
    });
    console.log('Notificaciones recibidas:', this.data);
    this.cd.markForCheck(); // 👈 fuerza refresco con OnPush
  }


  async onMarkRead(id: number) {
    await this.delUC.markRead(id);
    this.msg.add({ severity: 'success', summary: 'Leída', detail: 'Notificación marcada como leída' });
    await this.load();
  }

  async onRemove(id: number) {
    await this.delUC.execute(id);
    this.msg.add({ severity: 'warn', summary: 'Eliminada', detail: 'Notificación eliminada' });
    await this.load();
  }

  onEdit(n: AppNotification) {
    // Navegar a edición o abrir modal con NotificationFormComponent
  }

  async onSaved(newNotification: AppNotification) {
    // Recargar la tabla después de guardar
    await this.load();
    this.msg.add({ severity: 'success', summary: 'Guardada', detail: 'Notificación creada/actualizada' });
  }

  onCancel() {
    this.msg.add({ severity: 'info', summary: 'Cancelado', detail: 'Edición cancelada' });
  }

}

