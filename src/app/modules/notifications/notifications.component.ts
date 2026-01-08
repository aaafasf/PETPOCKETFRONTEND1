import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
  nuevaAlerta = { 
    titulo: '', 
    mensaje: '', 
    tipo: 'recordatorio' as const,
    mesesProgramacion: 0
  };
  
  mostrarModal = false;
  notificacionSeleccionada: Notificacion | null = null;
  isLoading = false;
  backendError = false;
  
  private subscription: Subscription = new Subscription();

  constructor(
    private notificacionesService: NotificacionesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('🟢 [NotificationsComponent] Componente inicializado');
    // Resetear estados al inicio
    this.isLoading = false;
    this.backendError = false;
    
    // Suscribirse primero a las actualizaciones del servicio
    const sub = this.notificacionesService.notificaciones$.subscribe(notificaciones => {
      console.log('📬 [NotificationsComponent] Recibida actualización del BehaviorSubject, notificaciones:', notificaciones.length);
      this.notificaciones = notificaciones;
      // Si hay notificaciones o el array está vacío, significa que el backend respondió
      this.backendError = false;
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });
    this.subscription.add(sub);
    
    // Luego cargar las notificaciones
    this.cargarNotificaciones();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  cargarNotificaciones(): void {
    console.log('🟢 [NotificationsComponent] Iniciando carga de notificaciones');
    this.isLoading = true;
    this.backendError = false;
    this.cdr.detectChanges();

    this.notificacionesService.obtenerTodas().subscribe({
      next: (notificaciones) => {
        console.log('✅ [NotificationsComponent] Éxito - notificaciones:', notificaciones.length);
        // FORZAR que backendError sea false cuando hay éxito
        this.backendError = false;
        this.isLoading = false;
        // Asegurar que las notificaciones estén actualizadas
        this.notificaciones = notificaciones;
        console.log('✅ [NotificationsComponent] Estados finales - isLoading:', this.isLoading, ', backendError:', this.backendError, ', notificaciones:', this.notificaciones.length);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ [NotificationsComponent] Error:', err);
        console.error('❌ [NotificationsComponent] Status:', err?.status);
        this.isLoading = false;
        const status = err?.status;
        // Solo marcar error si es realmente un problema de conexión
        if (status === 0 || status === 404 || err?.name === 'TimeoutError') {
          this.backendError = true;
          console.warn('⚠️ Backend no disponible');
        } else {
          // Para otros errores, no mostrar como error de backend
          this.backendError = false;
          console.log('ℹ️ Error no crítico, continuando sin mostrar error de backend');
        }
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  get notificacionesNoLeidas(): Notificacion[] {
    return this.notificacionesService.obtenerNoLeidas();
  }

  get notificacionesLeidas(): Notificacion[] {
    return this.notificacionesService.obtenerLeidas();
  }

  agregarAlerta(): void {
    // Prevenir múltiples clics
    if (this.isLoading || !this.nuevaAlerta.titulo?.trim() || !this.nuevaAlerta.mensaje?.trim()) {
      return;
    }

    this.isLoading = true;
    
    const fechaProgramada = this.nuevaAlerta.mesesProgramacion && this.nuevaAlerta.mesesProgramacion > 0
      ? new Date(Date.now() + this.nuevaAlerta.mesesProgramacion * 30 * 24 * 60 * 60 * 1000)
      : undefined;

    const notificacion: Partial<Notificacion> = {
      titulo: this.nuevaAlerta.titulo.trim(),
      mensaje: this.nuevaAlerta.mensaje.trim(),
      tipo: this.nuevaAlerta.tipo,
      fechaProgramada: fechaProgramada,
      mesesProgramacion: this.nuevaAlerta.mesesProgramacion && this.nuevaAlerta.mesesProgramacion > 0 
        ? this.nuevaAlerta.mesesProgramacion 
        : undefined
    };

    const subscription = this.notificacionesService.crearNotificacion(notificacion).subscribe({
      next: (notificacionCreada) => {
        console.log('✅ [NotificationsComponent] Notificación creada:', notificacionCreada);
        // Resetear formulario
        this.nuevaAlerta = { titulo: '', mensaje: '', tipo: 'recordatorio', mesesProgramacion: 0 };
        this.isLoading = false;
        // Recargar todas las notificaciones para asegurar que se muestren
        this.cargarNotificaciones();
        subscription.unsubscribe();
      },
      error: (err) => {
        console.error('❌ [NotificationsComponent] Error al crear:', err);
        console.error('❌ [NotificationsComponent] Status:', err?.status);
        console.error('❌ [NotificationsComponent] Mensaje:', err?.message);
        this.isLoading = false;
        subscription.unsubscribe();
        
        // Mensaje más específico según el error
        let mensaje = 'Error al crear la notificación.';
        if (err?.status === 404) {
          mensaje = 'Error 404: El endpoint POST /api/notificaciones no existe en el backend. Verifica que la ruta esté configurada correctamente.';
        } else if (err?.status === 0) {
          mensaje = 'Error: No se pudo conectar con el backend. Asegúrate de que el servidor esté corriendo en el puerto 3000.';
        } else if (err?.name === 'TimeoutError') {
          mensaje = 'Error: La petición excedió el tiempo de espera. El backend podría estar tardando mucho en responder.';
        }
        
        alert(mensaje);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  abrirModal(notificacion: Notificacion): void {
    this.notificacionSeleccionada = notificacion;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.notificacionSeleccionada = null;
  }

  marcarComoLeida(): void {
    if (!this.notificacionSeleccionada?.id) return;

    this.notificacionesService.marcarComoLeida(this.notificacionSeleccionada.id).subscribe({
      next: () => {
        // El servicio ya actualiza el estado automáticamente
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al marcar como leída:', err);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  limpiarHistorial(): void {
    if (!confirm('¿Estás seguro de que deseas limpiar todo el historial de notificaciones?')) {
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.notificacionesService.limpiarHistorial().subscribe({
      next: () => {
        this.isLoading = false;
        this.backendError = false;
        this.cerrarModal();
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        if (err.name === 'TimeoutError' || (err as any).status === 404 || (err as any).status === 0) {
          this.backendError = true;
        }
        console.error('Error al limpiar historial:', err);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  eliminarNotificacion(id: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar esta notificación?')) {
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.notificacionesService.eliminarNotificacion(id).subscribe({
      next: () => {
        this.isLoading = false;
        if (this.notificacionSeleccionada?.id === id) {
          this.cerrarModal();
        }
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al eliminar notificación:', err);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }
}
