import { Appointment } from "../../../core/models/appointment.model";
import { PlannerAppointmentVM } from './planner.viewmodel';

/**
 * Mapper: Appointment (Dominio) → PlannerAppointmentVM (UI)
 */
export function mapAppointmentToPlannerVM(
  appointment: Appointment,
  services: { idServicio: number; nombreServicio: string }[],
  veterinarians: { id: number; name: string }[]
): PlannerAppointmentVM {

  const service = services.find(s => s.idServicio === appointment.idServicio);
  const vet = veterinarians.find(v => v.id === appointment.userIdUser);

  return {
    /* =====================
       Identidad
       ===================== */
    idCita: appointment.idCita,

    /* =====================
       Relaciones
       ===================== */
    veterinarioId: appointment.userIdUser ?? 0,
    veterinarioNombre: vet?.name ?? 'No asignado',

    servicioId: appointment.idServicio,
    servicioNombre: service?.nombreServicio ?? 'Servicio General',

    clienteNombre: 'Cliente',   
    mascotaNombre: 'Mascota',   

    /* =====================
       Tiempo
       ===================== */
    fecha: appointment.fecha,
    hora: appointment.hora,

    /* =====================
       Estado
       ===================== */
    estadoCita: appointment.estadoCita,

    /* =====================
       Detalles
       ===================== */
    motivo: appointment.motivo,
    notasAdicionales: appointment.notasAdicionales
  };
}
