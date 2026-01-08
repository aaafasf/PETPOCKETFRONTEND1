import { Component, OnInit, ChangeDetectorRef, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; 
import { ServicioVeterinarioService } from '../../core/services/servicio-veterinario';
import { NotificacionesService, Notificacion } from '../../core/services/notificaciones.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  
  servicios: any[] = [];
  isLoading: boolean = true;
  
  notificaciones: Notificacion[] = [];
  mostrarNotificaciones = false;
  notificacionSeleccionada: Notificacion | null = null;
  mostrarModalDetalle = false;
  isLoadingNotificaciones = false;
  
  private subscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private apiService: ServicioVeterinarioService,
    private cdr: ChangeDetectorRef,
    private notificacionesService: NotificacionesService
  ) {}

  ngOnInit(): void {
    this.cargarServiciosDesdeBackend();
    this.cargarNotificaciones();
    
    const sub = this.notificacionesService.notificaciones$.subscribe(notificaciones => {
      this.notificaciones = notificaciones;
      this.cdr.detectChanges();
    });
    this.subscription.add(sub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-dropdown') && !target.closest('.notification-button')) {
      this.mostrarNotificaciones = false;
    }
  }

  cargarServiciosDesdeBackend(): void {
    this.isLoading = true;
    this.apiService.getServicios().subscribe({
      next: (data: any) => {
        this.servicios = data.map((s: any) => ({
          idServicio: s.idServicio,
          nombreServicio: s.nombreServicio,
          descripcionServicio: s.descripcionServicio,
          precioServicio: s.precioServicio,
          imagen: s.imagen ? 'servicios/' + s.imagen : null,
          color: s.color || 'border-blue-400',
          icon: s.icon || '🩺'
        }));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error al conectar con el servidor:', err);
        this.cdr.detectChanges();
      }
    });
  }

  cargarNotificaciones(): void {
    this.isLoadingNotificaciones = true;
    
    // Timeout de seguridad
    const timeoutId = setTimeout(() => {
      if (this.isLoadingNotificaciones) {
        this.isLoadingNotificaciones = false;
      }
    }, 6000);

    this.notificacionesService.obtenerTodas().subscribe({
      next: () => {
        clearTimeout(timeoutId);
        this.isLoadingNotificaciones = false;
      },
      error: (err) => {
        clearTimeout(timeoutId);
        this.isLoadingNotificaciones = false;
        // Solo log si no es un error esperado (timeout, 404 o 0)
        if (err.name !== 'TimeoutError' && err.status !== 404 && err.status !== 0) {
          console.error('Error al cargar notificaciones en dashboard:', err);
        }
      }
    });
  }

  get notificacionesNoLeidas(): Notificacion[] {
    return this.notificacionesService.obtenerNoLeidas();
  }

  get notificacionesLeidas(): Notificacion[] {
    return this.notificacionesService.obtenerLeidas().slice(0, 3);
  }

  toggleNotificaciones(): void {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
    if (this.mostrarNotificaciones && this.notificaciones.length === 0) {
      this.cargarNotificaciones();
    }
  }

  verDetalle(notificacion: Notificacion): void {
    this.notificacionSeleccionada = notificacion;
    this.mostrarModalDetalle = true;
    this.mostrarNotificaciones = false;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.notificacionSeleccionada = null;
  }

  marcarComoLeida(): void {
    if (!this.notificacionSeleccionada?.id) return;

    this.notificacionesService.marcarComoLeida(this.notificacionSeleccionada.id).subscribe({
      next: () => {
        // El servicio ya actualiza el estado automáticamente
      },
      error: (err) => {
        console.error('Error al marcar como leída:', err);
        alert('⚠️ No se pudo marcar como leída. Por favor, intenta nuevamente.');
      }
    });
  }

  verTodasLasNotificaciones(): void {
    this.router.navigate(['/notifications']);
    this.mostrarNotificaciones = false;
  }

  agendarCita(servicioId: number): void {
    if (!servicioId) return;
    console.log('Navegando a citas con ID:', servicioId);
    this.router.navigate(['/appointments'], { queryParams: { id: servicioId } });
  }
}
