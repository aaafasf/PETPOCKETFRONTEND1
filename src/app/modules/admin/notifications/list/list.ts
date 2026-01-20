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
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule, 
    TableModule, 
    ButtonModule, 
    TagModule, 
    ConfirmDialogModule, 
    ToastModule, 
    RouterModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    FormsModule
  ],
  templateUrl: './list.html',
  styleUrl: './list.css',
  providers: [ConfirmationService, MessageService]
})
export class ListComponent implements OnInit {
  notificaciones: Notificacion[] = [];
  notificacionesFiltradas: Notificacion[] = [];
  loading = false;
  searchTerm: string = '';      

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
    this.notificacionesService.obtenerTodasNotificaciones().subscribe({
      next: (data: Notificacion[]) => {
        this.notificaciones = data;
        this.notificacionesFiltradas = data;
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

  filtrarNotificaciones() {
    if (!this.searchTerm.trim()) {
      this.notificacionesFiltradas = [...this.notificaciones];
    } else {
      const termino = this.searchTerm.toLowerCase();
      this.notificacionesFiltradas = this.notificaciones.filter(notif =>
        (notif.titulo?.toLowerCase().includes(termino)) ||
        (notif.mensaje?.toLowerCase().includes(termino)) ||
        (notif.nameUsers?.toLowerCase().includes(termino)) ||
        (notif.nameMascota?.toLowerCase().includes(termino)) ||
        (notif.tipo?.toLowerCase().includes(termino))
      );
    }
  }

  createNotification() {
    this.router.navigate(['admin/notifications/create']);
  }

  editNotification(notification: Notificacion) {
    this.router.navigate(['admin/notifications/edit', notification.idNotificacion || notification.id]);
  }

  deleteNotification(notification: Notificacion) {
    const id = notification.idNotificacion || notification.id;
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar la notificación "${notification.titulo}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (id) {
          this.notificacionesService.eliminarNotificacion(id).subscribe({
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
      }
    });
  }

  sendCampaign() {
    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail: 'Funcionalidad de campaña masiva en desarrollo'
    });
  }

  getSeverity(tipo: string | undefined) {
    switch (tipo) {
      case 'vacuna': return 'success';
      case 'control': return 'warn';
      case 'recordatorio': return 'info';
      case 'general': return 'secondary';
      default: return 'secondary';
    }
  }

  getSeverityEstado(estado: string | undefined) {
    switch (estado) {
      case 'enviada':
      case 'leida': return 'success';
      case 'pendiente': return 'warn';
      case 'programada': return 'info';
      default: return 'secondary';
    }
  }

  getEstadoLabel(notif: Notificacion): string {
    if (notif.estadoNotificacion === 'leida' || notif.leida) {
      return 'Enviada';
    }
    if (notif.estadoNotificacion === 'pendiente') {
      return 'Pendiente';
    }
    if (notif.estadoNotificacion === 'programada') {
      return 'Programada';
    }
    return notif.noLeida ? 'No Leída' : 'Enviada';
  }

  // Formatea la fecha que viene como string del backend
  formatearFecha(fecha: string | Date | undefined): string {
    if (!fecha) return '-';
    
    try {
      // Si ya es un string formateado del backend, devolverlo tal cual
      if (typeof fecha === 'string' && fecha.includes('/')) {
        return fecha;
      }
      
      // Si es un string ISO o timestamp, convertir a Date
      const date = new Date(fecha);
      
      // Validar que sea una fecha válida
      if (isNaN(date.getTime())) {
        return fecha.toString();
      }
      
      // Formatear como dd/MM/yyyy HH:mm
      const dia = String(date.getDate()).padStart(2, '0');
      const mes = String(date.getMonth() + 1).padStart(2, '0');
      const año = date.getFullYear();
      const horas = String(date.getHours()).padStart(2, '0');
      const minutos = String(date.getMinutes()).padStart(2, '0');
      
      return `${dia}/${mes}/${año} ${horas}:${minutos}`;
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return fecha?.toString() || '-';
    }
  }
}
