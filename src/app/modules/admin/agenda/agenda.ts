import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, combineLatest, map } from 'rxjs';
import { RouterModule } from '@angular/router';

import { AppointmentStatus } from '../../../core/models/appointment.model';
import { AppointmentService } from '../../../core/services/appointment';
import { ClinicService } from '../../../core/services/clinic-service';
// ✅ IMPORTAR SERVICIOS DE CLIENTE Y MASCOTA
import { ClienteService } from '../../../core/services/cliente.service';
import { MascotaService } from '../../../core/services/mascota.service';

import { ClinicService as ClinicServiceInfo } from '../../../core/models/clinic-service.model';
import { AgendaAppointmentVM } from './agenda.viewmodel';
import { mapAppointmentToAgendaVM } from './agenda.mapper';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './agenda.html',
  styleUrl: './agenda.css',
})
export class Agenda implements OnInit {

  readonly Status = AppointmentStatus;

  // Fecha de hoy (Zona horaria local)
  readonly todayStr = this.getLocalDate();

  appointments$!: Observable<AgendaAppointmentVM[]>;

  constructor(
    private appointmentService: AppointmentService,
    private clinicService: ClinicService,
    private clienteService: ClienteService, // ✅ Inyectado
    private mascotaService: MascotaService   // ✅ Inyectado
  ) {}

  ngOnInit(): void {
    // Construir el ViewModel reactivo combinando TODA la información necesaria
    this.appointments$ = combineLatest([
      this.appointmentService.appointments$,
      this.clinicService.getServices(),
      this.clienteService.getAll(), // ✅ Traemos clientes
      this.mascotaService.getAll()  // ✅ Traemos mascotas
    ]).pipe(
      map(([appointments, services, clientes, mascotas]) => {
        
        console.log(`🔎 Agenda: Procesando citas para hoy: ${this.todayStr}`);

        return appointments
          .filter(a => {
            // FILTRO ÚNICO: SOLO CITAS DE HOY
            const citaFecha = (a.fecha || '').split('T')[0]; 
            return citaFecha === this.todayStr;
          })
          .sort((a, b) => a.hora.localeCompare(b.hora))
          .map(a => {
            // Mapeo base
            const vm = mapAppointmentToAgendaVM(a, services, this.todayStr);

            // ✅ SOLUCIÓN "SIN NOMBRE": Buscamos en los catálogos
            const cliente = clientes.find(c => Number(c.idClientes) === Number(a.idCliente));
            const mascota = mascotas.find(m => Number(m.idMascota) === Number(a.idMascota));

            if (cliente) vm.nombreCliente = cliente.nombreCliente;
            if (mascota) vm.nombreMascota = mascota.nombreMascota;

            return vm;
          });
      })
    );

    // Cargar datos iniciales
    this.appointmentService.getAppointmentsByDate(this.todayStr);
    this.clienteService.getAll().subscribe(); // Asegurar carga
    this.mascotaService.getAll().subscribe(); // Asegurar carga
  }

  private getLocalDate(): string {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return (new Date(d.getTime() - offset)).toISOString().split('T')[0];
  }

  onChangeStatus(appointmentId: number, newStatus: AppointmentStatus): void {
    this.appointmentService
      .update(appointmentId, { estadoCita: newStatus })
      .subscribe();
  }

  getStatusClass(status: AppointmentStatus): string {
    return `status-badge ${status}`;
  }
}