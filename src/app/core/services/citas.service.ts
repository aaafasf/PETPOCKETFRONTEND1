import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Cita,
  CitaDetalle,
  CrearCitaRequest,
  CrearCitaResponse,
  ReprogramarCitaRequest,
  CambiarEstadoCitaRequest,
  DisponibilidadResponse,
  EstadisticasCitas,
  Mascota,
  Servicio,
  Veterinario,
} from '../../interfaces/cita.interface';

@Injectable({
  providedIn: 'root',
})
export class CitasService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/cita';

  constructor() {}

  // ==================== READ (Consultas) ====================

  // Obtener todas las citas
  obtenerTodasCitas(): Observable<any> {
    const params = new HttpParams().set('t', Date.now().toString());
    return this.http.get(`${this.apiUrl}/lista`, {
      params,
      headers: { 'Cache-Control': 'no-cache' },
    });
  }

  // Obtener detalle de una cita específica
  obtenerDetalleCita(idCita: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/detalle/${idCita}`);
  }

  // Obtener citas de un cliente
  obtenerCitasCliente(idCliente: number, estado?: string): Observable<any> {
    let params = new HttpParams();
    if (estado) {
      params = params.set('estado', estado);
    }
    // Evitar respuestas cacheadas (304) agregando timestamp
    params = params.set('t', Date.now().toString());
    return this.http.get(`${this.apiUrl}/cliente/${idCliente}`, {
      params,
      headers: { 'Cache-Control': 'no-cache' },
    });
  }

  // Obtener calendario de citas
  obtenerCalendario(
    fechaInicio?: string,
    fechaFin?: string,
    idVeterinario?: number
  ): Observable<any> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    if (idVeterinario) params = params.set('idVeterinario', idVeterinario.toString());

    return this.http.get(`${this.apiUrl}/calendario`, { params });
  }

  // Verificar disponibilidad de horario
  verificarDisponibilidad(
    fecha: string,
    hora: string,
    idVeterinario?: number | null
  ): Observable<DisponibilidadResponse> {
    let params = new HttpParams().set('fecha', fecha).set('hora', hora);

    if (idVeterinario) {
      params = params.set('idVeterinario', idVeterinario.toString());
    }

    return this.http.get<DisponibilidadResponse>(`${this.apiUrl}/verificar-disponibilidad`, {
      params,
    });
  }

  // Obtener estadísticas de citas
  obtenerEstadisticas(fechaInicio?: string, fechaFin?: string): Observable<EstadisticasCitas> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get<EstadisticasCitas>(`${this.apiUrl}/estadisticas`, { params });
  }

  // ==================== CREATE (Crear) ====================

  // Crear nueva cita
  crearCita(datos: CrearCitaRequest): Observable<CrearCitaResponse> {
    return this.http.post<CrearCitaResponse>(`${this.apiUrl}/crear`, datos);
  }

  // ==================== UPDATE (Actualizar) ====================

  // Actualizar cita completa
  actualizarCita(idCita: number, datos: CrearCitaRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar/${idCita}`, datos);
  }

  // Reprogramar cita
  reprogramarCita(idCita: number, datos: ReprogramarCitaRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/reprogramar/${idCita}`, datos);
  }

  // Cambiar estado de cita
  cambiarEstadoCita(idCita: number, datos: CambiarEstadoCitaRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/cambiar-estado/${idCita}`, datos);
  }

  // ==================== DELETE (Eliminar) ====================

  // Cancelar cita
  cancelarCita(idCita: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cancelar/${idCita}`);
  }

  // ==================== MÉTODOS AUXILIARES ====================

  // Obtener mascotas de un cliente (asumiendo que existe este endpoint)
  obtenerMascotasCliente(idCliente: number): Observable<Mascota[]> {
    // Ajustar según tu API
    return this.http.get<Mascota[]>(`http://localhost:3000/mascotas/cliente/${idCliente}`);
  }

  // Obtener servicios disponibles
  obtenerServicios(): Observable<Servicio[]> {
    // Ajustar según tu API
    return this.http.get<Servicio[]>(`http://localhost:3000/servicios/lista`);
  }

  // Obtener veterinarios disponibles
  obtenerVeterinarios(): Observable<Veterinario[]> {
    // Ajustar según tu API
    return this.http.get<Veterinario[]>(`http://localhost:3000/veterinarios/lista`);
  }
}
