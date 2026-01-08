import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ServicioService } from '../../core/services/servicio.service';
import { CitasService } from '../../core/services/citas.service';
import { CrearCitaRequest, Mascota, Servicio, Veterinario } from '../../interfaces/cita.interface';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css'],
})
export class AppointmentsComponent implements OnInit {
  private citasService = inject(CitasService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private servicioService = inject(ServicioService);

  // Mock de ID del cliente - reemplazar por AuthService en producción
  idCliente: number = 1;

  // Listas para selects
  mascotas: Mascota[] = [];
  servicios: Servicio[] = [];
  veterinarios: Veterinario[] = [];

  // Datos del formulario
  cita: CrearCitaRequest = {
    idCliente: this.idCliente,
    idMascota: 0,
    idServicio: 0,
    fecha: '',
    hora: '',
    userIdUser: undefined,
    motivo: '',
    sintomas: '',
    diagnosticoPrevio: '',
    tratamientosAnteriores: [],
    notasAdicionales: '',
  };

  tratamiento: string = '';

  // Estados
  cargando: boolean = false;
  verificandoDisponibilidad: boolean = false;
  disponible: boolean = true;
  mensajeDisponibilidad: string = '';
  error: string = '';

  // Fecha mínima
  fechaMinima: string = '';

  // Para compatibilidad con diseño anterior
  servicioId: string | null = null;
  nombreServicio: string = 'Cargando servicio...';

  ngOnInit() {
    this.setFechaMinima();
    this.cargarDatos();

    // Capturar ?id= de la URL si viene desde Dashboard
    this.route.queryParamMap.subscribe((params) => {
      this.servicioId = params.get('id');
      if (this.servicioId) {
        this.cita.idServicio = parseInt(this.servicioId);
        this.definirServicio();
      }
    });
  }

  // ==================== FECHA ====================
  setFechaMinima() {
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
    this.cita.fecha = this.fechaMinima;
  }

  // ==================== SERVICIO ====================
  definirServicio() {
    if (!this.servicioId) {
      this.nombreServicio = 'Servicio Especializado';
      return;
    }

    this.servicioService.listarAdmin().subscribe({
      next: (servicios: Servicio[]) => {
        const encontrado = servicios.find(
          (s) => String(s.idServicio) === String(this.servicioId)
        );
        this.nombreServicio = encontrado ? encontrado.nombre : 'Servicio Especializado';
      },
      error: () => {
        this.nombreServicio = 'Servicio Especializado';
      },
    });
  }

  // ==================== CARGAR DATOS ====================
  cargarDatos() {
    this.cargando = true;

    // Mascotas
    this.citasService.obtenerMascotasCliente(this.idCliente).subscribe({
      next: (res: Mascota[]) => (this.mascotas = res || []),
      error: (err: any) => console.error('Error cargando mascotas:', err),
    });

    // Servicios
    this.servicioService.listarAdmin().subscribe({
      next: (res: Servicio[]) => (this.servicios = res || []),
      error: (err: any) => console.error('Error cargando servicios:', err),
    });

    // Veterinarios
    this.citasService.obtenerVeterinarios().subscribe({
      next: (res: Veterinario[]) => (this.veterinarios = res || []),
      error: (err: any) => console.error('Error cargando veterinarios:', err),
      complete: () => (this.cargando = false),
    });
  }

  // ==================== DISPONIBILIDAD ====================
  verificarDisponibilidad() {
    if (!this.cita.fecha || !this.cita.hora) return;

    this.verificandoDisponibilidad = true;
    this.citasService
      .verificarDisponibilidad(this.cita.fecha, this.cita.hora, this.cita.userIdUser)
      .subscribe({
        next: (res) => {
          this.disponible = res.disponible;
          this.mensajeDisponibilidad =
            res.mensaje || (res.disponible ? 'Horario disponible' : 'Horario no disponible');
          this.verificandoDisponibilidad = false;
        },
        error: () => {
          this.disponible = true;
          this.verificandoDisponibilidad = false;
        },
      });
  }

  // ==================== TRATAMIENTOS ====================
  agregarTratamiento() {
    if (this.tratamiento.trim()) {
      this.cita.tratamientosAnteriores = this.cita.tratamientosAnteriores || [];
      this.cita.tratamientosAnteriores.push(this.tratamiento);
      this.tratamiento = '';
    }
  }

  eliminarTratamiento(index: number) {
    this.cita.tratamientosAnteriores?.splice(index, 1);
  }

  // ==================== VALIDACIÓN FORMULARIO ====================
  validarFormulario(): boolean {
    if (!this.cita.idMascota) {
      this.error = 'Debes seleccionar una mascota';
      return false;
    }
    if (!this.cita.idServicio) {
      this.error = 'Debes seleccionar un servicio';
      return false;
    }
    if (!this.cita.fecha) {
      this.error = 'Debes seleccionar una fecha';
      return false;
    }
    if (!this.cita.hora) {
      this.error = 'Debes seleccionar una hora';
      return false;
    }
    if (!this.disponible) {
      this.error = 'El horario seleccionado no está disponible';
      return false;
    }
    this.error = '';
    return true;
  }

  // ==================== AGENDAR CITA ====================
  agendarCita() {
    if (!this.validarFormulario()) return;

    this.cargando = true;

    const citaLimpia: CrearCitaRequest = {
      ...this.cita,
      userIdUser: this.cita.userIdUser && this.cita.userIdUser > 0 ? this.cita.userIdUser : undefined,
    };

    this.citasService.crearCita(citaLimpia).subscribe({
      next: () => {
        alert('¡Cita agendada exitosamente!');
        this.router.navigate(['/appointments/mis-citas']);
      },
      error: (err: any) => {
        console.error('Error al agendar cita:', err);
        this.error = err.error?.message || 'No se pudo agendar la cita';
        this.cargando = false;
      },
    });
  }

  // ==================== CANCELAR / IR A DASHBOARD ====================
  cancelar() {
    if (confirm('¿Estás seguro de cancelar? Se perderán los datos ingresados.')) {
      this.router.navigate(['/dashboard']);
    }
  }

  irAlInicio(): void {
    this.router.navigate(['/dashboard']);
  }
}
