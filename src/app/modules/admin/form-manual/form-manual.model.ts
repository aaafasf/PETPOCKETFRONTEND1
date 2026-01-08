export interface AppointmentFormManual {
  idCita?: number;

  nombreMascota: string;
  nombreCliente: string;

  idServicio: number;
  userIdUser?: number | null;
  

  fecha: string;
  hora: string;

  estadoCita: string;
  motivo?: string;
}
