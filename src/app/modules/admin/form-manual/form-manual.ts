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
  estadoCita: AppointmentStatus;

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
  appointmentStatuses = Object.values(AppointmentStatus);

  @Input() clientes: ClienteDto[] = [];           // ✅ Nueva entrada
  @Input() mascotas: MascotaDto[] = [];

  @Input() services: ClinicServiceInfo[] = [];
  @Input() veterinarians: { id: number; name: string }[] = [];

  @Output() save = new EventEmitter<ManualAppointmentForm>();
  @Output() close = new EventEmitter<void>();
  @Input() appointmentId: number | null = null;

  constructor(private fb: FormBuilder, private appointmentService: AppointmentService) { }

  ngOnInit(): void {
    this.initForm();

    if (this.appointmentId) {
      this.appointmentService.appointments$
        .pipe(
          map(list => list.find(a => a.idCita === this.appointmentId))
        )
        .subscribe(appt => {
          if (!appt) return;

          this.appointmentForm.patchValue({
            idCita: appt.idCita,
            idCliente: appt.idCliente,
            idMascota: appt.idMascota,
            idServicio: appt.idServicio,
            userIdUser: appt.userIdUser,


            fecha: appt.fecha,
            hora: appt.hora,
            estadoCita: appt.estadoCita,
            motivo: appt.motivo
          });
        });
    }
  }

  private initForm(): void {
    this.appointmentForm = this.fb.group({
      idCita: [null],
      idCliente: [null, Validators.required],
      idMascota: [null, Validators.required],
      idServicio: [null, Validators.required],
      userIdUser: [null, Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      estadoCita: ['programada', Validators.required],
      motivo: ['']
    });

  }


  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched(); // Para ver qué falta
      return;
    }

    const raw = this.appointmentForm.value;
    const idClienteNum = Number(raw.idCliente);
    const idMascotaNum = Number(raw.idMascota);
    const idServicioNum = Number(raw.idServicio);
    const userIdUserNum = Number(raw.userIdUser);

    // Si alguno es 0 o NaN, mostramos alerta y no enviamos
    if (!idClienteNum || !idMascotaNum || !idServicioNum || !userIdUserNum) {
      alert('Por favor seleccione Cliente, Mascota, Veterinario y Servicio válidos.');
      return;
    }

    // Convertimos explícitamente a número para evitar NaN
    const data: ManualAppointmentForm = {
      ...raw,
      idCita: raw.idCita ? Number(raw.idCita) : undefined,
      idCliente: idClienteNum,
      idMascota: idMascotaNum,
      idServicio: idServicioNum,
      userIdUser: userIdUserNum
    };
    console.log('📦 Formulario valido enviado:', data); // Para depurar

    this.save.emit(data);
  }
}
