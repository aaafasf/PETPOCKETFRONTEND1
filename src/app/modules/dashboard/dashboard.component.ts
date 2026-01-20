import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; 
import { ServicioVeterinarioService } from '../../core/services/servicio-veterinario';
import { NotificacionesService, Notificacion } from '../../core/services/notificaciones.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  servicios: any[] = [];
  isLoading: boolean = true;
  
  notificaciones: Notificacion[] = [];
  mostrarNotificaciones = false;
  notificacionSeleccionada: Notificacion | null = null;
  mostrarModalDetalle = false;
  isLoadingNotificaciones = false;

  constructor(
    private router: Router,
    private apiService: ServicioVeterinarioService,
    private cdr: ChangeDetectorRef,
    private notificacionesService: NotificacionesService
  ) {}

  ngOnInit(): void {
    this.cargarServiciosDesdeBackend();
    this.cargarNotificaciones();
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
          imagen: s.imagen || null,
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

    const timeoutId = setTimeout(() => {
      if (this.isLoadingNotificaciones) {
        this.isLoadingNotificaciones = false;
      }
    }, 6000);

    this.notificacionesService.obtenerTodasNotificaciones().subscribe({
      next: (notificaciones: Notificacion[]) => {
        clearTimeout(timeoutId);
        this.notificaciones = notificaciones;
        this.isLoadingNotificaciones = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        clearTimeout(timeoutId);
        this.isLoadingNotificaciones = false;
        console.error('Error al cargar notificaciones en dashboard:', err);
      }
    });
  }

  // Getters para trabajar con el array cargado
  get notificacionesNoLeidas(): Notificacion[] {
    return this.notificaciones.filter(n => !n.leida);
  }

  get notificacionesLeidas(): Notificacion[] {
    return this.notificaciones.filter(n => n.leida).slice(0, 3);
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
