import { AppointmentStatus } from "../../../core/models/appointment.model";

export interface AgendaAppointmentVM {

   idCita: number;

  hora: string;

  estadoCita: AppointmentStatus;
  estadoLabel: string;

  nombreMascota: string;
  nombreCliente: string;

  serviceName: string;
  idServicio: number;

  motivo?: string;
  notasAdicionales?: string;
}

