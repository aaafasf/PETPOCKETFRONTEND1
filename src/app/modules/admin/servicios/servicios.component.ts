import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ServicioService } from '../../../core/services/servicio.service';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.css']
})
export class ServiciosComponent implements OnInit {

  servicios: any[] = [];
  
  imagenSeleccionada: File | null = null;
  previewImagen: string | null = null;

  imagenSeleccionadaEdit: File | null = null;
  previewImagenEdit: string | null = null;

  // 🔹 AHORA imagen es URL
  nuevoServicio = {
    nombreServicio: '',
    descripcionServicio: '',
    precioServicio: 0,
    estadoServicio: 'activo',
    imagen: '' // 👈 URL
  };

  editando = false;
  servicioEditando: any = null;

  timestamp = new Date().getTime();

  constructor(
    private servicioService: ServicioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarServicios();
  }

  // =========================
  // Cargar servicios
  // =========================
  cargarServicios(): void {
    this.servicioService.listarAdmin().subscribe({
      next: (resp: any[]) => {
        this.servicios = resp.map((s: any) => ({
          idServicio: s.idServicio,
          nombreServicio: s.nombreServicio,
          descripcionServicio: s.descripcionServicio,
          precioServicio: s.precioServicio,
          estadoServicio: s.estadoServicio ?? 'activo',
          imagen: s.imagen ?? null
        }));
        this.cdr.detectChanges();
      },
      error: err => console.error('Error al cargar servicios', err)
    });
  }

  // =========================
  // Agregar servicio (SIN FormData)
  // =========================
  agregarServicio(): void {
    const payload = {
      nombre: this.nuevoServicio.nombreServicio,
      descripcion: this.nuevoServicio.descripcionServicio,
      precio: this.nuevoServicio.precioServicio,
      estadoServicio: 'activo',
      imagen: this.nuevoServicio.imagen // 👈 URL
    };

    this.servicioService.crear(payload).subscribe(() => {
      this.cargarServicios();

      // Reset
      this.nuevoServicio = {
        nombreServicio: '',
        descripcionServicio: '',
        precioServicio: 0,
        estadoServicio: 'activo',
        imagen: ''
      };

      this.cdr.detectChanges();
    });
  }

  // =========================
  // Editar servicio
  // =========================
  editarServicio(servicio: any): void {
    this.editando = true;
    this.servicioEditando = { ...servicio };
  }

  guardarEdicion(): void {
    const payload = {
      nombre: this.servicioEditando.nombreServicio,
      descripcion: this.servicioEditando.descripcionServicio,
      precio: this.servicioEditando.precioServicio,
      estadoServicio: this.servicioEditando.estadoServicio,
      imagen: this.servicioEditando.imagen // 👈 URL
    };

    this.servicioService
      .actualizar(this.servicioEditando.idServicio, payload)
      .subscribe(() => {
        this.timestamp = new Date().getTime();
        this.cargarServicios();
        this.cancelarEdicion();
      });
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.servicioEditando = null;
  }

  // =========================
  // Activar / Desactivar
  // =========================
  toggleEstado(servicio: any) {
    const nuevoEstado =
      servicio.estadoServicio === 'activo' ? 'inactivo' : 'activo';

    this.servicioService
      .cambiarEstado(servicio.idServicio, nuevoEstado)
      .subscribe({
        next: () => this.cargarServicios(),
        error: err => console.error('Error al cambiar estado', err)
      });
  }

  // =========================
  // Eliminar
  // =========================
  eliminarServicio(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar este servicio?')) return;

    this.servicioService.eliminar(id).subscribe(() => {
      this.servicios = this.servicios.filter(s => s.idServicio !== id);
      this.cdr.detectChanges();
    });
  }
}
