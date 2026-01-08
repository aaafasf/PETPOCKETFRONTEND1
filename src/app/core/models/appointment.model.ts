export interface Appointment {
  idCita: number;
  fecha: string;
  hora: string;
  estadoCita: AppointmentStatus;

  idCliente: number;
  idMascota: number;
  idServicio: number;
  userIdUser?: number | null;

  
  cliente?: Cliente;
  mascota?: Mascota;
  nombreServicio?: string;
  motivo?: string;
  notasAdicionales?: string;
  detallesMongo?: DetallesMongo;
  
}

export enum AppointmentStatus {
  PROGRAMADA = 'programada',
  CONFIRMADA = 'confirmada',
  CANCELADA = 'cancelada',
  COMPLETADA = 'completada'
}
export interface Cliente {
  nombre: string;
  cedula?: string;
}

export interface Mascota {
  nombre: string;
  especie?: string;
}

export interface Servicio {
  nombre: string;
  precio?: number;
}

export interface DetallesMongo {
  motivo?: string;
  sintomas?: string;
  notasAdicionales?: string;
  estado?: string;
}
