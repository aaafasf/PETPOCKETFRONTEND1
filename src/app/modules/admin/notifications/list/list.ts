import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { NotificacionesService, Notificacion } from '../../../../core/services/notificaciones.service';
import { ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';



@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, ConfirmDialogModule, ToastModule, RouterModule],
  templateUrl: './list.html',
  styleUrl: './list.css',
  providers: [ConfirmationService, MessageService]
})
export class ListComponent implements OnInit {
  notificaciones: Notificacion[] = [];
  loading = false;

  constructor(
    private notificacionesService: NotificacionesService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadNotificaciones();
  }

  loadNotificaciones() {
    this.loading = true;
    this.notificacionesService.obtenerTodas().subscribe({
      next: (data: Notificacion[]) => {
        this.notificaciones = data;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading notifications:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las notificaciones'
        });
        this.loading = false;
      }
    });
  }

  createNotification() {
    this.router.navigate(['admin/notifications/create']);
  }

  editNotification(notification: Notificacion) {
    this.router.navigate(['admin/notifications/edit', notification.id]);
  }

  deleteNotification(notification: Notificacion) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar la notificación "${notification.titulo}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.notificacionesService.eliminarNotificacion(notification.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Notificación eliminada correctamente'
            });
            this.loadNotificaciones();
          },
          error: (error) => {
            console.error('Error deleting notification:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar la notificación'
            });
          }
        });
      }
    });
  }

  sendCampaign() {
    // Implementar lógica para campaña masiva
    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail: 'Funcionalidad de campaña masiva en desarrollo'
    });
  }

  getSeverity(status: string) {
    switch (status) {
      case 'vacuna': return 'success';
      case 'control': return 'warn';
      case 'recordatorio': return 'info';
      default: return 'secondary';
    }
  }
}
