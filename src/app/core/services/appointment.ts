import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Appointment } from '../models/appointment.model';
import { environment } from '../../enviroments/enviroments';

@Injectable({ providedIn: 'root' })
export class AppointmentService {

  private apiUrl = `${environment.apiUrl}/cita`;

  /* ==========================
     Estado Reactivo Global
     ========================== */
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  public readonly appointments$ = this.appointmentsSubject.asObservable();

  constructor(private http: HttpClient) { }

  loadAll(): void {
    this.getAppointmentsByDate(new Date());
  }

  cancel(id: number) {
    return this.softDelete(id);
  }

  /* =====================================================
     1️⃣ GET – Cargar citas (por fecha lógica del frontend)
     ===================================================== */
  getAppointmentsByDate(date: string | Date): void {

    this.http.get<any[]>(`${this.apiUrl}/lista`).pipe(
      map(data => this.mapBackendAppointments(data)),
      tap(data => console.log('📦 CITAS RAW BACKEND →', data))
    ).subscribe({
      next: appointments => 
        
        this.appointmentsSubject.next(appointments),
      error: err => console.error('❌ Error cargando citas:', err)
    });
  }

  /* =====================================================
     2️⃣ CREATE – Crear cita
     ===================================================== */
  create(appt: Partial<Appointment>): Observable<any> {

  const payload = {
    idCliente: Number(appt.idCliente),
    idMascota: Number(appt.idMascota),
    idServicio: Number(appt.idServicio),
    userIdUser: Number(appt.userIdUser),

    fecha: appt.fecha,
    hora: appt.hora,

    motivo: appt.motivo ?? '',
    sintomas: 'Ingreso manual desde Planner',
    notasAdicionales: 'Creada desde Planner',

    estadoCita: 'programada'
  };

  console.log('CREATE PAYLOAD →', payload);

  return this.http.post(`${this.apiUrl}/crear`, payload).pipe(
    tap(() => this.getAppointmentsByDate(appt.fecha!))
  );
}

  /* =====================================================
     3️⃣ UPDATE – Actualizar cita
     ===================================================== */
  update(id: number, changes: Partial<Appointment>): Observable<any> {

    // 🅰️ Cambio de estado (Agenda / Botones rápidos)
    if (changes.estadoCita && Object.keys(changes).length === 1) {
      return this.http.put(
        `${this.apiUrl}/cambiar-estado/${id}`,
        {
          estado: changes.estadoCita,
          notas: 'Actualizado desde Agenda'
        }
      );
    }

    // 🅱️ Reprogramación / Edición completa
    const payload = {
      idCliente: Number(changes.idCliente),
      idMascota: Number(changes.idMascota),
      fecha: changes.fecha,
      hora: changes.hora,
      userIdUser: Number(changes.userIdUser),
      idServicio: Number(changes.idServicio),
      motivo: changes.motivo ?? null
    };

    return this.http.put(`${this.apiUrl}/actualizar/${id}`, payload).pipe(
      tap(() => this.getAppointmentsByDate(changes.fecha!))
    );
  }

  /* =====================================================
     4️⃣ DELETE – Cancelar cita (Soft Delete)
     ===================================================== */
  softDelete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cancelar/${id}`).pipe(
      tap(() => {
        const current = this.appointmentsSubject.value;
        this.appointmentsSubject.next(
          current.filter(a => a.idCita !== id)
        );
      })
    );
  }

  /* =====================================================
     🔁 Mapper Backend → Frontend (ÚNICO PUNTO)
     ===================================================== */
  private mapBackendAppointments(data: any[]): Appointment[] {
    return data.map(item => ({
      idCita: item.idCita,
      idCliente: item.idCliente,
      idMascota: item.idMascota,
      idServicio: item.idServicio,
      userIdUser: Number(item.userIdUser),

      fecha: item.fecha?.split('T')[0],
      hora: item.hora,
      estadoCita: item.estadoCita,

      nombreMascota: item.mascota?.nombre ?? item.nombreMascota ?? 'Sin nombre',
      nombreCliente: item.cliente?.nombre ?? item.nombreCliente ?? 'Desconocido',
      nombreServicio: item.servicio?.nombre ?? item.nombreServicio ?? 'General',
      veterinario: item.veterinario ?? 'No asignado',

      motivo: item.detallesMongo?.motivo ?? item.motivo ?? '',
      sintomas: item.detallesMongo?.sintomas ?? '',
      notasAdicionales: item.detallesMongo?.notasAdicionales ?? ''
    }));
  }
  getById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/${id}`);
  }
}
