import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, combineLatest, map } from 'rxjs';
import { RouterModule } from '@angular/router';

import { AppointmentService } from '../../../core/services/appointment';
import { ClinicService } from '../../../core/services/clinic-service';
import { ClienteService, ClienteDto } from '../../../core/services/cliente.service';
import { MascotaService, MascotaDto } from '../../../core/services/mascota.service';

import { ClinicService as ClinicServiceInfo } from '../../../core/models/clinic-service.model';
import { PlannerAppointmentVM } from './planner.viewmodel';
import { FormManual } from '../form-manual/form-manual';

@Component({
  selector: 'app-planner',
  standalone: true,
  imports: [CommonModule, FormsModule, FormManual, RouterModule],
  templateUrl: './planner.html',
  styleUrl: './planner.css',
})
export class Planner implements OnInit {

  // --- FILTROS ---
  selectedDate = this.getLocalDate();
  searchVetId = '';
  searchServiceId = '';

  // --- DATOS LOCALES ---
  clinicServices: ClinicServiceInfo[] = [];
  veterinarians: { id: number; name: string }[] = [];
  clientes: ClienteDto[] = [];
  mascotas: MascotaDto[] = [];

  // --- UI ---
  isModalOpen = false;
  selectedAppointmentId: number | null = null;

  // --- VIEWMODEL ---
  plannerAppointments$!: Observable<PlannerAppointmentVM[]>;

  constructor(
    private appointmentService: AppointmentService,
    private clinicService: ClinicService,
    private clienteService: ClienteService,
    private mascotaService: MascotaService
  ) { }

  ngOnInit(): void {
    // 1️⃣ Cargar catálogos
    this.clinicService.getServices().subscribe(s => this.clinicServices = s);
    this.clinicService.getVeterinarians().subscribe(v => {
      this.veterinarians = v;
      console.log('👨‍⚕️ Veterinarios cargados:', v);
    });

    // 2️⃣ ViewModel Reactivo
    this.plannerAppointments$ = combineLatest([
      this.appointmentService.appointments$,
      this.clinicService.getServices(),
      this.clinicService.getVeterinarians(),
      this.clienteService.getAll(), 
      this.mascotaService.getAll()  
    ]).pipe(
      map(([appointments, services, vets, clientes, mascotas]) => {
        
        this.clientes = clientes;
        this.mascotas = mascotas;

        console.log('📊 Total de citas recibidas:', appointments.length);

    const filtered = appointments.filter(a => {
      const citaFecha = (a.fecha || '').substring(0, 10);
      const filtroFecha = (this.selectedDate || '').substring(0, 10);

          const filtroVetNum = this.searchVetId ? Number(this.searchVetId) : null;
          
          // ✅ CORRECCIÓN: Manejar NaN y null correctamente
          const matchVet = !filtroVetNum || 
                           (a.userIdUser != null && !isNaN(a.userIdUser) && Number(a.userIdUser) === filtroVetNum);

      const filtroServNum = this.searchServiceId ? Number(this.searchServiceId) : null;
      const matchService = !filtroServNum || Number(a.idServicio) === filtroServNum;

          return matchFecha && matchVet && matchService;
        });

        console.log('✅ Citas después del filtro:', filtered.length);

        // B. MAPEO
        return filtered.map(a => {
          // ✅ CORRECCIÓN: Comparar solo si userIdUser es válido
          const vetObj = vets.find(v => {
            if (a.userIdUser == null || isNaN(a.userIdUser)) {
              return false;
            }
            return Number(v.id) === Number(a.userIdUser);
          });
          
          const servObj = services.find(s => Number(s.idServicio) === Number(a.idServicio));
          const clienteObj = clientes.find(c => Number(c.idClientes) === Number(a.idCliente));
          const mascotaObj = mascotas.find(m => Number(m.idMascota) === Number(a.idMascota));

          const estadoNormalizado = (a.estadoCita || 'programada').toLowerCase();

          // ✅ CORRECCIÓN: Usar objetos anidados de tu modelo
          const mascotaNombre = a.mascota?.nombre ?? mascotaObj?.nombreMascota ?? 'Desconocido';
          const clienteNombre = a.cliente?.nombre ?? clienteObj?.nombreCliente ?? 'Desconocido';

          const viewModel = {
            idCita: a.idCita,
            fecha: a.fecha,
            hora: a.hora,
            estadoCita: estadoNormalizado,

            veterinarioId: a.userIdUser,
            veterinarioNombre: vetObj ? vetObj.name : 'Sin Asignar',

            servicioId: a.idServicio,
            servicioNombre: servObj ? servObj.nombreServicio : a.nombreServicio ?? '...',
            color: servObj ? servObj.color : '#ccc',

            mascotaNombre: mascotaNombre,
            clienteNombre: clienteNombre,

            motivo: a.motivo ?? a.detallesMongo?.motivo
          } as PlannerAppointmentVM;

          // Debug para ver si encuentra veterinario
          if (!vetObj) {
            console.log(`⚠️ Cita ${a.idCita}: userIdUser=${a.userIdUser} - NO se encontró veterinario`);
          }

          return viewModel;
        });
      })
    );

    this.refreshAppointments();
  }

  // --- EVENTOS ---

  onDateChange(): void {
    this.refreshAppointments();
  }

  onFilterChange(): void {
    // El pipe se encarga
  }

  private refreshAppointments() {
    this.appointmentService.getAppointmentsByDate(this.selectedDate);
  }

  openCreateModal(): void {
    this.selectedAppointmentId = null;
    this.isModalOpen = true;
  }

  onAppointmentClick(appointmentId: number): void {
    this.selectedAppointmentId = appointmentId;
    this.isModalOpen = true;
  }

  handleSaveAppointment(data: any) {
    // Construcción Robustez del Payload
    const payload = {
      idCliente: Number(data.idCliente),
      idMascota: Number(data.idMascota),
      idServicio: Number(data.idServicio),
      
      // ✅ CORRECCIÓN: Asegurar que el ID del veterinario sea válido
      userIdUser: data.userIdUser ? Number(data.userIdUser) : null,
      
      fecha: data.fecha,
      hora: data.hora,
      
      estadoCita: (data.estadoCita || 'programada').toLowerCase(),
      
      motivo: data.motivo ?? null
    };

    console.log('🚀 Enviando Payload:', payload);

    const request = data.idCita
      ? this.appointmentService.update(data.idCita, payload)
      : this.appointmentService.create(payload);

    request.subscribe({
      next: () => {
        console.log('✅ Guardado exitoso, refrescando datos...');
        this.isModalOpen = false;
        
        // ✅ CORRECCIÓN: Primero cerrar modal, luego refrescar
        this.refreshAppointments();
        
        // Mostrar confirmación después de un momento
        setTimeout(() => {
          alert('Datos guardados y actualizados.');
        }, 100);
      },
      error: (err) => {
        console.error('❌ Error API:', err);
        alert('Error: ' + (err.error?.message || 'Fallo al guardar'));
      }
    });
  }

  onDeleteClick(event: Event, appointmentId: number): void {
    event.stopPropagation();
    if (confirm('¿Cancelar esta cita?')) {
      this.appointmentService.softDelete(appointmentId).subscribe(() => {
        this.refreshAppointments();
      });
    }
  }

  resetFilters(): void {
    this.searchVetId = '';
    this.searchServiceId = '';
    this.selectedDate = this.getLocalDate();
    this.refreshAppointments();
  }

  getAppointmentsForVet(vetId: number, appointments: PlannerAppointmentVM[]): PlannerAppointmentVM[] {
    const result = appointments.filter(a => {
      // ✅ CORRECCIÓN: Filtrar solo citas con veterinario válido
      if (a.veterinarioId == null || isNaN(a.veterinarioId)) {
        return false;
      }
      return Number(a.veterinarioId) === Number(vetId);
    });
    
    return result;
  }

  private getLocalDate(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}