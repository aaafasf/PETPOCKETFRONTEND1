import { Appointment } from "../../../core/models/appointment.model";
import { AgendaAppointmentVM } from './agenda.viewmodel';

/**
 * Mapper: Appointment (Dominio) → AgendaAppointmentVM (UI)
 */
export function mapAppointmentToAgendaVM(
  appointment: Appointment,
  services: { idServicio: number; nombreServicio: string }[],
  today: string
): AgendaAppointmentVM {

  const service = services.find(s => s.idServicio === appointment.idServicio);

  return {
    idCita: appointment.idCita,
    hora: appointment.hora,

    estadoCita: appointment.estadoCita,
    estadoLabel: appointment.estadoCita.toUpperCase(),

    nombreMascota: appointment.mascota?.nombre ?? 'Sin nombre',
    nombreCliente: appointment.cliente?.nombre ?? 'Desconocido',

    serviceName: service?.nombreServicio ?? 'Servicio General',
    idServicio: appointment.idServicio,

    motivo: appointment.detallesMongo?.motivo ?? appointment.motivo ?? ''
  };
    
}
