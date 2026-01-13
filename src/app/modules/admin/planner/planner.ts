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
      console.log('👨‍⚕️ Veterinarios cargados:', v); // Revisa si el ID 34 está aquí
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
    this.clinicServices = services;
    this.veterinarians = vets;

    const filtered = appointments.filter(a => {
      const citaFecha = (a.fecha || '').substring(0, 10);
      const filtroFecha = (this.selectedDate || '').substring(0, 10);

      const filtroVetNum = this.searchVetId ? Number(this.searchVetId) : null;
      const matchVet = !filtroVetNum || Number(a.userIdUser) === filtroVetNum;

      const filtroServNum = this.searchServiceId ? Number(this.searchServiceId) : null;
      const matchService = !filtroServNum || Number(a.idServicio) === filtroServNum;

      return citaFecha === filtroFecha && matchVet && matchService;
    });

    return filtered.map(a => {
      const vetObj = vets.find(v => Number(v.id) === Number(a.userIdUser));
      const servObj = services.find(s => Number(s.idServicio) === Number(a.idServicio));
      const clienteObj = clientes.find(c => Number(c.idClientes) === Number(a.idCliente));
      const mascotaObj = mascotas.find(m => Number(m.idMascota) === Number(a.idMascota));

      return {
        idCita: a.idCita,
        fecha: a.fecha,
        hora: a.hora,
        estadoCita: (a.estadoCita || 'programada').toLowerCase(),

        veterinarioId: a.userIdUser,
        veterinarioNombre: vetObj?.name || 'Vet. no asignado',

        servicioId: a.idServicio,
        servicioNombre: servObj?.nombreServicio || '...',
        color: servObj?.color || '#ccc',

        mascotaNombre: mascotaObj?.nombreMascota || 'Desconocido',
        clienteNombre: clienteObj?.nombreCliente || 'Desconocido',

        motivo: a.motivo
      } as PlannerAppointmentVM;
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
      
      // Enviamos el ID tal cual lo manda el formulario (puede ser 34, 1, etc)
      userIdUser: data.userIdUser ? Number(data.userIdUser) : null,
      
      fecha: data.fecha,
      hora: data.hora,
      
      // Aseguramos que el estado vaya en minúsculas al backend por convención
      estadoCita: (data.estadoCita || 'programada').toLowerCase(),
      
      motivo: data.motivo ?? null
    };

    console.log('🚀 Enviando Payload:', payload);

    const request = data.idCita
      ? this.appointmentService.update(data.idCita, payload)
      : this.appointmentService.create(payload);

    request.subscribe({
      next: () => {
        this.isModalOpen = false;
        
        // 🕒 Pequeño truco: Esperar 200ms para asegurar que la DB guardó el cambio
        // antes de volver a pedir los datos. Esto soluciona el "no se pinta el cambio".
        setTimeout(() => {
          this.refreshAppointments();
          alert('Datos guardados y actualizados.');
        }, 200);
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
    return appointments.filter(a => Number(a.veterinarioId) === Number(vetId));
  }

  private getLocalDate(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}