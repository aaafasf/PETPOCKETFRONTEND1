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
  styleUrls: ['./servicios.component.css']  // ← ESTA LÍNEA ES LO ÚNICO QUE AGREGAS
})
export class ServiciosComponent implements OnInit {

  servicios: any[] = [];

  nuevoServicio = {
    nombreServicio: '',
    descripcionServicio: '',
    precioServicio: 0,
    estadoServicio: 'activo'
  };

  editando = false;
  servicioEditando: any = null;

  // IMAGEN para AGREGAR
  imagenSeleccionada: File | null = null;
  previewImagen: string | null = null;

  // IMAGEN para EDITAR
  imagenSeleccionadaEdit: File | null = null;
  previewImagenEdit: string | null = null;

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
  // Seleccionar imagen (Agregar)
  // =========================
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.imagenSeleccionada = file || null;

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImagen = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // =========================
  // Seleccionar imagen (Editar)
  // =========================
  onFileSelectedEdit(event: any): void {
    const file = event.target.files[0];
    this.imagenSeleccionadaEdit = file || null;

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImagenEdit = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // =========================
  // Agregar servicio
  // =========================
  agregarServicio(): void {
    const formData = new FormData();
    formData.append('nombre', this.nuevoServicio.nombreServicio);
    formData.append('descripcion', this.nuevoServicio.descripcionServicio);
    formData.append('precio', this.nuevoServicio.precioServicio.toString());
    formData.append('estadoServicio', 'activo');

    if (this.imagenSeleccionada) {
      formData.append('imagen', this.imagenSeleccionada);
    }

    this.servicioService.crear(formData).subscribe(() => {
      this.cargarServicios();
     
      

      // Reset
      this.nuevoServicio = {
        nombreServicio: '',
        descripcionServicio: '',
        precioServicio: 0,
        estadoServicio: 'activo'
      };
      this.imagenSeleccionada = null;
      this.previewImagen = null;

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
  
  timestamp = new Date().getTime();
  
  guardarEdicion(): void {
    const formData = new FormData();
    formData.append('nombre', this.servicioEditando.nombreServicio);
    formData.append('descripcion', this.servicioEditando.descripcionServicio);
    formData.append('precio', this.servicioEditando.precioServicio.toString());
    formData.append('estadoServicio', this.servicioEditando.estadoServicio);

    if (this.imagenSeleccionadaEdit) {
      formData.append('imagen', this.imagenSeleccionadaEdit);
    }

    this.servicioService.actualizar(this.servicioEditando.idServicio, formData)
      .subscribe(() => {
        this.timestamp = new Date().getTime(); // 🔹 fuerza recarga de imagen
        this.cargarServicios();
        this.cancelarEdicion();
        this.imagenSeleccionadaEdit = null;
        this.previewImagenEdit = null;
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
      next: () => {
        // 🔥 LA CLAVE
        this.cargarServicios();
      },
      error: err => {
        console.error('Error al cambiar estado', err);
      }
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
