import { AppointmentStatus } from "../../../core/models/appointment.model";
import { mapAppointmentToPlannerVM } from "./planner.mapper";

export interface PlannerAppointmentVM {

  idCita: number;

  veterinarioId: number;
  veterinarioNombre: string;

  servicioId: number;
  servicioNombre: string;
  color?: string;

  clienteNombre: string;
  mascotaNombre: string;

  fecha: string;
  hora: string;

  estadoCita: AppointmentStatus;

  motivo?: string;
  notasAdicionales?: string;
}
