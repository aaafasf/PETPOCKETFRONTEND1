import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CitasService } from '../../core/services/citas.service';
import { CrearCitaRequest, Mascota, Servicio, Veterinario } from '../../interfaces/cita.interface';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css',
})
export class AppointmentsComponent implements OnInit {
  private citasService = inject(CitasService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Mock de ID del cliente - En producción deberías obtenerlo del AuthService
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
    userIdUser: null,
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

  // Fecha mínima (hoy)
  fechaMinima: string = '';

  // Para compatibilidad con el diseño anterior
  servicioId: string | null = null;
  nombreServicio: string = 'Cargando servicio...';

  ngOnInit() {
    this.setFechaMinima();
    this.cargarDatos();

    // Capturamos el ?id= de la URL si viene desde el Dashboard
    this.route.queryParamMap.subscribe((params) => {
      this.servicioId = params.get('id');
      if (this.servicioId) {
        this.cita.idServicio = parseInt(this.servicioId);
        this.definirServicio();
      }
    });
  }

  setFechaMinima() {
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
    this.cita.fecha = this.fechaMinima;
  }

  definirServicio() {
    // Diccionario actualizado según los datos reales de la Base de Datos
    const servicios: { [key: string]: string } = {
      '41': 'Vacunación',
      '42': 'Desparasitación',
      '43': 'Corte de Pelo',
      '44': 'Consulta General',
    };

    this.nombreServicio = servicios[this.servicioId || ''] || 'Servicio Especializado';
    console.log('Agendando cita para:', this.nombreServicio, '(ID:', this.servicioId, ')');
  }

  cargarDatos() {
    this.cargando = true;

    // Usar datos mock temporalmente hasta tener los endpoints correctos
    console.warn('Usando datos mock para mascotas, servicios y veterinarios');

    this.mascotas = [{ idMascota: 1, nombre: 'Firulais', especie: 'Perro', raza: 'Mestizo' }];

    this.servicios = [
      { idServicio: 41, nombre: 'Vacunación', duracion: 30, precio: 50 },
      { idServicio: 42, nombre: 'Desparasitación', duracion: 15, precio: 30 },
      { idServicio: 43, nombre: 'Corte de Pelo', duracion: 60, precio: 35 },
      { idServicio: 44, nombre: 'Consulta General', duracion: 30, precio: 40 },
    ];

    this.veterinarios = [
      { idUser: 53, nombre: 'Veterinario Principal', especialidad: 'Medicina General' },
    ];

    this.cargando = false;
  }

  verificarDisponibilidad() {
    if (!this.cita.fecha || !this.cita.hora) return;

    this.verificandoDisponibilidad = true;
    this.citasService
      .verificarDisponibilidad(this.cita.fecha, this.cita.hora, this.cita.userIdUser)
      .subscribe({
        next: (response) => {
          this.disponible = response.disponible;
          this.mensajeDisponibilidad =
            response.mensaje ||
            (response.disponible ? 'Horario disponible' : 'Horario no disponible');
          this.verificandoDisponibilidad = false;
        },
        error: (error) => {
          console.error('Error al verificar disponibilidad:', error);
          this.disponible = true; // Asumir disponible si falla
          this.verificandoDisponibilidad = false;
        },
      });
  }

  agregarTratamiento() {
    if (this.tratamiento.trim()) {
      if (!this.cita.tratamientosAnteriores) {
        this.cita.tratamientosAnteriores = [];
      }
      this.cita.tratamientosAnteriores.push(this.tratamiento);
      this.tratamiento = '';
    }
  }

  eliminarTratamiento(index: number) {
    this.cita.tratamientosAnteriores?.splice(index, 1);
  }

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

  agendarCita() {
  if (!this.validarFormulario()) return;

  this.cargando = true;

  // Forzamos que userIdUser sea null si no es un número válido
  const userId = this.cita.userIdUser && Number(this.cita.userIdUser) > 0 ? this.cita.userIdUser : null;

  // Creamos copia limpia del objeto cita
  const citaLimpia: CrearCitaRequest = {
    ...this.cita,
    userIdUser: userId, // null si no hay veterinario
  };

  console.log('📤 Datos a enviar:', citaLimpia);

  this.citasService.crearCita(citaLimpia).subscribe({
    next: (response) => {
      console.log('✅ Cita agendada exitosamente:', response);
      alert('¡Cita agendada exitosamente!');
      this.router.navigate(['/appointments/mis-citas']);
    },
    error: (error) => {
      console.error('❌ Error al agendar cita:', error);
      this.error = error.error?.message || 'No se pudo agendar la cita. Intenta nuevamente.';
      this.cargando = false;
    },
  });
}


  cancelar() {
    if (confirm('¿Estás seguro de cancelar? Se perderán los datos ingresados.')) {
      this.router.navigate(['/dashboard']);
    }
  }

  // Función para el botón "Cancelar y volver" (compatibilidad con diseño anterior)
  irAlInicio(): void {
    this.router.navigate(['/dashboard']);
  }
}
