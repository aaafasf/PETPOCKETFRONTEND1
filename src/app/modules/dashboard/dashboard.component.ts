import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterLink } from '@angular/router'; 
import { ServicioVeterinarioService } from '../../core/services/servicio-veterinario';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink], 
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  servicios: any[] = [];
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private apiService: ServicioVeterinarioService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.cargarServiciosDesdeBackend();
  }

  cargarServiciosDesdeBackend(): void {
  this.isLoading = true;
  this.apiService.getServicios().subscribe({
    next: (data: any) => {
      // Mapeo correcto para que HTML funcione
      this.servicios = data.map((s: any) => ({
        idServicio: s.idServicio,
        nombreServicio: s.nombre,
        descripcionServicio: s.descripcion,
        precioServicio: s.precio,
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

  