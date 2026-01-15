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
    let fechaStr = '';

    if (typeof date === 'string') {
      fechaStr = date;
    } else {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      fechaStr = `${year}-${month}-${day}`;
    }

    console.log('📡 Llamando agenda por fecha:', fechaStr);

    const timestamp = new Date().getTime();

    this.http
      .get<any>(`${this.apiUrl}/agenda/${fechaStr}?t=${timestamp}`)
      .pipe(
        map(data => this.mapBackendAppointments(data)),
        tap(data => {
          console.log('📥 AGENDA BACKEND (Fresca) →', data);
          console.log('📊 Total de citas recibidas:', data.length);
        })
      )
      .subscribe({
        next: appointments => this.appointmentsSubject.next(appointments),
        error: err => console.error('❌ Error agenda:', err)
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

    // ✅ CORRECCIÓN: Removido tap() - el refresh se hace desde el componente
    return this.http.post(`${this.apiUrl}/crear`, payload);
  }

  /* =====================================================
      3️⃣ UPDATE – Actualizar cita
     ===================================================== */
  update(id: number, changes: Partial<Appointment>): Observable<any> {

    if (changes.estadoCita && Object.keys(changes).length === 1) {
      return this.http.put(
        `${this.apiUrl}/cambiar-estado/${id}`,
        {
          estado: changes.estadoCita,
          notas: 'Actualizado desde Agenda'
        }
      );
    }

    const payload = {
      idCliente: Number(changes.idCliente),
      idMascota: Number(changes.idMascota),
      fecha: changes.fecha,
      hora: changes.hora,
      userIdUser: Number(changes.userIdUser),
      idServicio: Number(changes.idServicio),
      motivo: changes.motivo ?? null,
      estadoCita: changes.estadoCita ?? 'programada'

    };

    // ✅ CORRECCIÓN: Removido tap() - el refresh se hace desde el componente
    return this.http.put(`${this.apiUrl}/actualizar/${id}`, payload);
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
  private mapBackendAppointments(data: any): Appointment[] {
    // Validación de estructura de respuesta (Array vs Objeto)
    const listaCitas = Array.isArray(data) ? data : (data && data.data) ? data.data : [];
    
    if (!Array.isArray(listaCitas)) {
      console.warn('⚠️ La respuesta del backend no es un array:', data);
      return [];
    }

    return listaCitas.map((item: any) => {
      
      // 🔍 DEBUG: Ver estructura completa del item
      console.log('🔎 Item COMPLETO del backend:', JSON.stringify(item, null, 2));

      // ✅ CORRECCIÓN CRÍTICA: Detectar todos los posibles nombres del campo veterinario
      let veterinarioId = null;
      
      if (item.userIdUser != null && item.userIdUser !== '') {
        veterinarioId = Number(item.userIdUser);
      } else if (item.userId != null && item.userId !== '') {
        veterinarioId = Number(item.userId);
      } else if (item.veterinarioId != null && item.veterinarioId !== '') {
        veterinarioId = Number(item.veterinarioId);
      } else if (item.idVeterinario != null && item.idVeterinario !== '') {
        veterinarioId = Number(item.idVeterinario);
      } else if (item.user_id_user != null && item.user_id_user !== '') {
        veterinarioId = Number(item.user_id_user);
      }

      // Verificar si el resultado es NaN (conversión fallida)
      if (isNaN(veterinarioId as number)) {
        console.warn(`⚠️ Cita ${item.idCita}: No se pudo convertir veterinarioId a número`, {
          userIdUser: item.userIdUser,
          userId: item.userId,
          veterinarioId: item.veterinarioId
        });
        veterinarioId = null;
      }

      // ✅ CORRECCIÓN: Usar objetos anidados según tu modelo Appointment
      return {
        idCita: item.idCita,
        idCliente: item.idCliente,
        idMascota: item.idMascota,
        idServicio: item.idServicio,
        
        // ✅ CORRECCIÓN: Usar el veterinarioId detectado (puede ser null)
        userIdUser: veterinarioId,

        // Uso de substring para fecha segura (evita UTC shift)
        fecha: (item.fecha || '').substring(0, 10),
        
        hora: item.hora,
        estadoCita: item.estadoCita,

        // ✅ Objetos anidados según tu modelo
        cliente: {
          nombre: item.cliente?.nombre ?? item.nombreCliente ?? 'Desconocido',
          cedula: item.cliente?.cedula
        },
        
        mascota: {
          nombre: item.mascota?.nombre ?? item.nombreMascota ?? 'Sin nombre',
          especie: item.mascota?.especie
        },

        nombreServicio: item.servicio?.nombre ?? item.nombreServicio ?? 'General',

        // ✅ Detalles en el objeto correcto
        detallesMongo: {
          motivo: item.detallesMongo?.motivo ?? item.motivo ?? '',
          sintomas: item.detallesMongo?.sintomas ?? '',
          notasAdicionales: item.detallesMongo?.notasAdicionales ?? '',
          estado: item.detallesMongo?.estado
        },

        motivo: item.detallesMongo?.motivo ?? item.motivo
      } as Appointment;
    });
  }
  
  getById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/${id}`);
  }
}