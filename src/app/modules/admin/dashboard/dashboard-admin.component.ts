import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ServicioService } from '../../../core/services/servicio.service';

interface Servicio {
  idServicio: number;
  nombreServicio: string;
  descripcionServicio: string;
  precioServicio: number;
  imagen?: string | null;
  estadoServicio?: string;
  citas?: number;
}

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css']
})
export class DashboardAdminComponent implements OnInit {
  servicios: Servicio[] = [];
  totalServicios = 0;
  totalCitas = 0;
  serviciosActivos = 0;
  cargando = true;

  constructor(
    private servicioService: ServicioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Cargar al iniciar
    this.cargarServicios();

    // Cada vez que se activa la ruta Dashboard, recargar datos
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.urlAfterRedirects === '/admin/dashboard') {
          this.cargarServicios();
        }
      });
  }

  // -----------------------------
  // Cargar servicios desde backend
  // -----------------------------
  cargarServicios(): void {
    this.cargando = true;
    this.servicioService.listarAdmin().subscribe({
      next: (data: any[]) => {
        // 🔹 Mapear correctamente los campos de la BD
        this.servicios = data.map((s: any) => ({
          idServicio: s.idServicio,
          nombreServicio: s.nombre ?? 'Sin nombre',
          descripcionServicio: s.desc ?? '',
          precioServicio: s.precio ?? 0,
          estadoServicio: s.estadoServicio ?? 'activo',
          imagen: s.imagen
            ? `http://localhost:3000/uploads/servicios/${s.imagen}?t=${Date.now()}`
            : null,
          citas: s.citas ?? 0
        }));

        this.calcularEstadisticas();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar servicios', err);
        this.cargando = false;
      }
    });
  }

  // -----------------------------
  // Calcular estadísticas del dashboard
  // -----------------------------
  calcularEstadisticas(): void {
    this.totalServicios = this.servicios.length;
    this.totalCitas = this.servicios.reduce((sum, s) => sum + (s.citas || 0), 0);
    this.serviciosActivos = this.servicios.filter(s => s.estadoServicio === 'activo').length;
  }

  // -----------------------------
  // Servicios más agendados (top 3)
  // -----------------------------
  getServiciosMasAgendados(): Servicio[] {
    return this.servicios
      .filter(s => s.estadoServicio === 'activo')
      .sort((a, b) => (b.citas || 0) - (a.citas || 0))
      .slice(0, 3);
  }
}
