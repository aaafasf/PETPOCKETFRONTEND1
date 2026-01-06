import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterLink } from '@angular/router'; 
import { ServicioVeterinarioService } from '../../core/services/servicio-veterinario';
import { NotificacionesService, Notificacion } from '../../core/services/notificaciones.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink], 
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  
  servicios: any[] = [];
  isLoading: boolean = true;
  mostrarNotificaciones = false;
  notificacionSeleccionada: Notificacion | null = null;
  mostrarModalDetalle = false;
  notificaciones: Notificacion[] = [];
  private subscription?: Subscription;

  constructor(
    private router: Router,
    private apiService: ServicioVeterinarioService,
    private cdr: ChangeDetectorRef,
    private notificacionesService: NotificacionesService
  ) {}

  ngOnInit(): void {
    this.cargarServiciosDesdeBackend();
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

  get notificacionesNoLeidas(): Notificacion[] {
    return this.notificacionesService.obtenerNoLeidas();
  }

  get notificacionesLeidas(): Notificacion[] {
    return this.notificacionesService.obtenerLeidas();
  }

  toggleNotificaciones() {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
  }

  // Cerrar dropdown al hacer clic fuera
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.mostrarNotificaciones = false;
    }
  }

  verDetalle(notificacion: Notificacion) {
    this.notificacionSeleccionada = notificacion;
    this.mostrarModalDetalle = true;
    this.mostrarNotificaciones = false;
  }

  cerrarModalDetalle() {
    this.mostrarModalDetalle = false;
    this.notificacionSeleccionada = null;
  }

  marcarComoLeida() {
    if (this.notificacionSeleccionada) {
      this.notificacionesService.marcarComoLeida(this.notificacionSeleccionada.id);
    }
  }

  verTodasLasNotificaciones() {
    this.router.navigate(['/notifications']);
    this.mostrarNotificaciones = false;
  }

  cargarServiciosDesdeBackend(): void {
  this.isLoading = true;
  this.apiService.getServicios().subscribe({
    next: (data: any) => {
      // Mapeo correcto para que HTML funcione
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


  agendarCita(servicioId: number): void {
    if (!servicioId) return;
    console.log('Navegando a citas con ID:', servicioId);
    this.router.navigate(['/appointments'], { queryParams: { id: servicioId } });
  }
}

  