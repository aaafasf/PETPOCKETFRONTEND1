import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CitasService } from '../../../core/services/citas.service';
import { CitaDetalle } from '../../../interfaces/cita.interface';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './mis-citas.component.html',
  styleUrls: ['./mis-citas.component.css'],
})
export class MisCitasComponent implements OnInit {
  private citasService = inject(CitasService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private readonly estadosValidos = [
    'todas',
    'programada',
    'confirmada',
    'completada',
    'cancelada',
  ];

  citas: CitaDetalle[] = [];
  citasFiltradas: CitaDetalle[] = [];
  cargando: boolean = false;
  error: string = '';
  filtroEstado: string = 'todas';

  // Mock de ID del cliente - En producción deberías obtenerlo del AuthService
  idCliente: number = 1;

  // Variables para reprogramar
  citaSeleccionada: CitaDetalle | null = null;
  mostrarModalReprogramar: boolean = false;
  nuevaFecha: string = '';
  nuevaHora: string = '';
  motivoReprogramacion: string = '';

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const estado = params.get('estado');
      this.filtroEstado = estado && this.esEstadoValido(estado) ? estado : 'todas';
      this.aplicarFiltro();
    });

    this.cargarCitas();
  }

  cargarCitas() {
    this.cargando = true;
    this.error = '';

    console.log('📥 Cargando citas del cliente:', this.idCliente);
    this.cargarCitasCliente();
  }

  cargarCitasCliente() {
    this.cargando = true;
    this.error = '';

    console.log('🔍 Solicitando citas para cliente ID:', this.idCliente);
    console.log('📡 URL que se llamará: http://localhost:3000/cita/cliente/' + this.idCliente);

    // Si el filtro es 'todas', no enviamos estado para obtener TODAS las citas
    // Si es un estado específico, lo filtramos en el frontend después de obtener todas
    // Para forzar obtener todas las citas sin el filtro del backend, pasamos undefined
    this.citasService.obtenerCitasCliente(this.idCliente, undefined).subscribe({
      next: (response) => {
        console.log('✅ Citas recibidas:', response);
        console.log('Tipo de respuesta:', typeof response);
        console.log('Es array?', Array.isArray(response));

        // Manejar diferentes estructuras de respuesta
        if (Array.isArray(response)) {
          this.citas = response;
        } else if (response?.data && Array.isArray(response.data)) {
          this.citas = response.data;
        } else if (response?.citas && Array.isArray(response.citas)) {
          this.citas = response.citas;
        } else {
          this.citas = [];
        }

        console.log('Total citas:', this.citas.length);
        // Ordenar por fecha de creación (desc)
        this.ordenarPorCreacionDesc(this.citas);
        this.aplicarFiltro();
        this.cargando = false;
        this.cdr.detectChanges(); // Forzar actualización de la UI
        console.log(
          'Estado final - Cargando:',
          this.cargando,
          'Citas filtradas:',
          this.citasFiltradas.length
        );
      },
      error: (error) => {
        console.error('❌ Error al cargar citas:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Message:', error.message);
        console.error('❌ Error completo:', JSON.stringify(error, null, 2));
        this.error = 'No se pudieron cargar las citas';
        this.citas = [];
        this.citasFiltradas = [];
        this.cargando = false;
        this.cdr.detectChanges(); // Forzar actualización de la UI
      },
    });
  }

  aplicarFiltro() {
    if (this.filtroEstado === 'todas') {
      this.citasFiltradas = [...this.citas];
    } else {
      this.citasFiltradas = this.citas.filter((c) => c.estadoCita === this.filtroEstado);
    }
    // Mantener orden por creación en el filtrado
    this.ordenarPorCreacionDesc(this.citasFiltradas);
  }

  abrirModalReprogramar(cita: CitaDetalle) {
    this.citaSeleccionada = cita;
    this.nuevaFecha = cita.fecha;
    this.nuevaHora = cita.hora;
    this.motivoReprogramacion = '';
    this.mostrarModalReprogramar = true;
  }

  cerrarModalReprogramar() {
    this.mostrarModalReprogramar = false;
    this.citaSeleccionada = null;
  }

  reprogramarCita() {
    if (!this.citaSeleccionada || !this.citaSeleccionada.idCita) return;

    this.cargando = true;
    const datos = {
      fecha: this.nuevaFecha,
      hora: this.nuevaHora,
      motivoReprogramacion: this.motivoReprogramacion,
    };

    this.citasService.reprogramarCita(this.citaSeleccionada.idCita, datos).subscribe({
      next: (response) => {
        alert('Cita reprogramada exitosamente');
        this.cerrarModalReprogramar();
        this.cargarCitas();
      },
      error: (error) => {
        console.error('Error al reprogramar cita:', error);
        alert('No se pudo reprogramar la cita. Intenta nuevamente.');
        this.cargando = false;
      },
    });
  }

  cancelarCita(idCita: number) {
    if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) return;

    this.cargando = true;
    this.citasService.cancelarCita(idCita).subscribe({
      next: (response) => {
        alert('Cita cancelada exitosamente');
        this.cargarCitas();
      },
      error: (error) => {
        console.error('Error al cancelar cita:', error);
        alert('No se pudo cancelar la cita. Intenta nuevamente.');
        this.cargando = false;
      },
    });
  }

  confirmarCita(idCita: number) {
    this.cargando = true;
    const datos = {
      estado: 'confirmada' as const,
      notas: 'Confirmada por el cliente',
    };

    console.log('Enviando datos para confirmar:', datos);
    this.citasService.cambiarEstadoCita(idCita, datos).subscribe({
      next: (response) => {
        alert('Cita confirmada exitosamente');
        this.cargarCitas();
      },
      error: (error) => {
        console.error('Error al confirmar cita:', error);
        console.error('Detalle del error:', error.error);
        alert(`No se pudo confirmar la cita. Error: ${error.error?.message || error.message}`);
        this.cargando = false;
      },
    });
  }

  obtenerClaseEstado(estadoCita?: string): string {
    switch (estadoCita) {
      case 'programada':
        return 'bg-orange-100 text-orange-600';
      case 'confirmada':
        return 'bg-green-100 text-green-600';
      case 'cancelada':
        return 'bg-red-100 text-red-600';
      case 'completada':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatearFechaHora(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Orden descendente por fecha de creación; fallback a fecha si no existe
  private ordenarPorCreacionDesc(lista: CitaDetalle[]) {
    lista.sort((a, b) => {
      const da = new Date(a.createCita || a.fecha || 0).getTime();
      const db = new Date(b.createCita || b.fecha || 0).getTime();
      return db - da;
    });
  }

  private esEstadoValido(estado: string): boolean {
    return this.estadosValidos.includes(estado);
  }
}
