import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppointmentStatus } from '../../../core/models/appointment.model';
import { ClinicService as ClinicServiceInfo } from '../../../core/models/clinic-service.model';
import { PlannerAppointmentVM } from '../planner/planner.viewmodel';
import { AppointmentService } from '../../../core/services/appointment';
import { map } from 'rxjs';
import { ClienteService, ClienteDto } from '../../../core/services/cliente.service';
import { MascotaService, MascotaDto } from '../../../core/services/mascota.service';
import { ClinicService } from '../../../core/services/clinic-service';


/**
 MODELO LOCAL SOLO PARA EL FORMULARIO
 */
interface ManualAppointmentForm {
  idCita?: number;
  idCliente: number;
  idMascota: number;
  userIdUser: number;
  idServicio: number;
  fecha: string;
  hora: string;
  estadoCita: string; // ✅ Cambiado de AppointmentStatus a string

  motivo?: string;
}

@Component({
  selector: 'app-form-manual',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-manual.html',
  styleUrl: './form-manual.css',
})
export class FormManual implements OnInit {

  appointmentForm!: FormGroup;
  
  // ✅ CORRECCIÓN: Usar array de strings en minúsculas
  appointmentStatuses = ['programada', 'confirmada', 'cancelada', 'completada'];

  @Input() clientes: ClienteDto[] = [];
  @Input() mascotas: MascotaDto[] = [];
  @Input() services: ClinicServiceInfo[] = [];
  @Input() veterinarians: { id: number; name: string }[] = [];

  @Output() save = new EventEmitter<ManualAppointmentForm>();
  @Output() close = new EventEmitter<void>();
  @Input() appointmentId: number | null = null;

  // ✅ NUEVO: Variable para guardar el idCita actual
  private currentCitaId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private clienteService: ClienteService,
    private mascotaService: MascotaService,
    private clinicService: ClinicService
  ) {}

  ngOnInit(): void {
    this.initForm();

    // 👤 CLIENTES
    this.clienteService.getAll().subscribe(data => {
      console.log('👤 Clientes cargados:', data);
      this.clientes = data;
    });

    // 🐶 MASCOTAS
    this.mascotaService.getAll().subscribe(data => {
      console.log('🐶 Mascotas cargadas:', data);
      this.mascotas = data;
    });

    // 🧑‍⚕️ VETERINARIOS
    this.clinicService.getVeterinarians().subscribe(data => {
      console.log('🧑‍⚕️ Veterinarios cargados:', data);
      this.veterinarians = data;
    });

    // ✏️ MODO EDICIÓN
    if (this.appointmentId) {
      console.log('✏️ Modo edición - Cargando cita:', this.appointmentId);
      
      this.appointmentService.appointments$
        .pipe(map(list => list.find(a => a.idCita === this.appointmentId)))
        .subscribe(appt => {
          if (!appt) {
            console.warn('⚠️ No se encontró la cita:', this.appointmentId);
            return;
          }

          console.log('📥 Cita encontrada para editar:', appt);

          // ✅ CORRECCIÓN: Guardar el ID de la cita
          this.currentCitaId = appt.idCita;

          // ✅ CORRECCIÓN: Normalizar el estado a minúsculas
          const estadoNormalizado = (appt.estadoCita || 'programada').toLowerCase();

          this.appointmentForm.patchValue({
            idCliente: appt.idCliente,
            idMascota: appt.idMascota,
            idServicio: appt.idServicio,
            userIdUser: appt.userIdUser,
            fecha: appt.fecha,
            hora: appt.hora,
            estadoCita: estadoNormalizado, // ✅ Estado en minúsculas
            motivo: appt.motivo || ''
          });

          console.log('✅ Formulario cargado con valores:', this.appointmentForm.value);
        });
    }
  }

  private initForm(): void {
    this.appointmentForm = this.fb.group({
      idCliente: [null, Validators.required],
      idMascota: [null, Validators.required],
      userIdUser: [null, Validators.required],
      idServicio: [null, Validators.required],
      fecha: [new Date().toISOString().substring(0,10), Validators.required],
      hora: ['', Validators.required],
      estadoCita: ['programada', Validators.required], // ✅ Minúsculas por defecto
      motivo: ['']
    });
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      console.warn('⚠️ Formulario inválido:', this.appointmentForm.value);
      return;
    }

    const raw = this.appointmentForm.value;
    const idClienteNum = Number(raw.idCliente);
    const idMascotaNum = Number(raw.idMascota);
    const idServicioNum = Number(raw.idServicio);
    const userIdUserNum = Number(raw.userIdUser);

    // Validación
    if (!idClienteNum || !idMascotaNum || !idServicioNum || !userIdUserNum) {
      alert('Por favor seleccione Cliente, Mascota, Veterinario y Servicio válidos.');
      return;
    }

    // ✅ CORRECCIÓN: Incluir idCita si estamos editando
    const data: ManualAppointmentForm = {
      idCliente: idClienteNum,
      idMascota: idMascotaNum,
      idServicio: idServicioNum,
      userIdUser: userIdUserNum,
      fecha: raw.fecha,
      hora: raw.hora,
      estadoCita: raw.estadoCita.toLowerCase(), // ✅ Asegurar minúsculas
      motivo: raw.motivo || ''
    };

    // ✅ CORRECCIÓN CRÍTICA: Incluir idCita si estamos en modo edición
    if (this.currentCitaId) {
      data.idCita = this.currentCitaId;
      console.log('📝 Actualizando cita:', this.currentCitaId, data);
    } else {
      console.log('➕ Creando nueva cita:', data);
    }

    this.save.emit(data);
  }
}