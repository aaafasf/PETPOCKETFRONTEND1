import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { NotificacionesService, Notificacion } from '../../core/services/notificaciones.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notificaciones: Notificacion[] = [];
  nuevaAlerta = { titulo: '', mensaje: '', tipo: 'recordatorio' as const, mesesProgramacion: 6 };
  notificacionSeleccionada: Notificacion | null = null;
  mostrarModal = false;
  private subscription?: Subscription;

  constructor(
    private notificacionesService: NotificacionesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse a las actualizaciones del servicio
    this.subscription = this.notificacionesService.notificaciones$.subscribe(
      notificaciones => {
        this.notificaciones = notificaciones;
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  // Read: Obtener notificaciones leídas y no leídas
  get notificacionesNoLeidas(): Notificacion[] {
    return this.notificacionesService.obtenerNoLeidas();
  }

  get notificacionesLeidas(): Notificacion[] {
    return this.notificacionesService.obtenerLeidas();
  }

  // Create: Crear una alerta programada
  agregarAlerta() {
    if (this.nuevaAlerta.titulo && this.nuevaAlerta.mensaje) {
      this.notificacionesService.crearNotificacion(
        this.nuevaAlerta.titulo,
        this.nuevaAlerta.mensaje,
        this.nuevaAlerta.tipo,
        this.nuevaAlerta.mesesProgramacion
      );
      this.nuevaAlerta = { titulo: '', mensaje: '', tipo: 'recordatorio', mesesProgramacion: 6 };
    }
  }

  // Read: Abrir modal de notificación
  abrirModal(notificacion: Notificacion) {
    this.notificacionSeleccionada = notificacion;
    this.mostrarModal = true;
  }

  // Cerrar modal
  cerrarModal() {
    this.mostrarModal = false;
    this.notificacionSeleccionada = null;
  }

  // Update: Marcar como leída (desde la modal)
  marcarComoLeida() {
    if (this.notificacionSeleccionada) {
      this.notificacionesService.marcarComoLeida(this.notificacionSeleccionada.id);
    }
  }

  // Delete: Limpiar historial (desde la modal)
  limpiarHistorial() {
    this.notificacionesService.limpiarHistorial();
    this.cerrarModal();
  }

  // Regresar al dashboard
  regresar() {
    this.router.navigate(['/dashboard']);
  }
}