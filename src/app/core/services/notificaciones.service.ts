import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  fecha: Date;
  leida: boolean;
  tipo: 'vacuna' | 'control' | 'recordatorio';
  fechaProgramada?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private notificaciones: Notificacion[] = [
    { id: 1, titulo: 'Vacuna Pendiente', mensaje: 'Recordatorio: Vacuna de rabia en 6 meses.', fecha: new Date(), leida: false, tipo: 'vacuna' },
    { id: 2, titulo: 'Control Mensual', mensaje: 'Mañana tienes un control con el Dr. Javier.', fecha: new Date(), leida: true, tipo: 'control' }
  ];

  private notificacionesSubject = new BehaviorSubject<Notificacion[]>(this.notificaciones);
  public notificaciones$: Observable<Notificacion[]> = this.notificacionesSubject.asObservable();

  constructor() {
    // Cargar notificaciones del localStorage si existen
    this.cargarDesdeLocalStorage();
  }

  obtenerTodas(): Notificacion[] {
    return [...this.notificaciones];
  }

  obtenerNoLeidas(): Notificacion[] {
    return this.notificaciones.filter(n => !n.leida);
  }

  obtenerLeidas(): Notificacion[] {
    return this.notificaciones.filter(n => n.leida);
  }

  crearNotificacion(titulo: string, mensaje: string, tipo: 'vacuna' | 'control' | 'recordatorio', mesesProgramacion?: number): Notificacion {
    const nuevaNotificacion: Notificacion = {
      id: this.obtenerNuevoId(),
      titulo,
      mensaje,
      fecha: new Date(),
      leida: false,
      tipo
    };

    if (mesesProgramacion) {
      const fechaProgramada = new Date();
      fechaProgramada.setMonth(fechaProgramada.getMonth() + mesesProgramacion);
      nuevaNotificacion.fechaProgramada = fechaProgramada;
    }

    this.notificaciones.unshift(nuevaNotificacion);
    this.actualizar();
    return nuevaNotificacion;
  }

  marcarComoLeida(id: number): void {
    const notificacion = this.notificaciones.find(n => n.id === id);
    if (notificacion) {
      notificacion.leida = true;
      this.actualizar();
    }
  }

  limpiarHistorial(): void {
    this.notificaciones = [];
    this.actualizar();
  }

  obtenerPorId(id: number): Notificacion | undefined {
    return this.notificaciones.find(n => n.id === id);
  }

  private obtenerNuevoId(): number {
    return this.notificaciones.length > 0 
      ? Math.max(...this.notificaciones.map(n => n.id)) + 1 
      : 1;
  }

  private actualizar(): void {
    this.guardarEnLocalStorage();
    this.notificacionesSubject.next([...this.notificaciones]);
  }

  private guardarEnLocalStorage(): void {
    try {
      localStorage.setItem('notificaciones', JSON.stringify(this.notificaciones));
    } catch (error) {
      console.error('Error al guardar notificaciones en localStorage:', error);
    }
  }

  private cargarDesdeLocalStorage(): void {
    try {
      const guardadas = localStorage.getItem('notificaciones');
      if (guardadas) {
        const parsed = JSON.parse(guardadas);
        // Convertir las fechas de string a Date
        this.notificaciones = parsed.map((n: any) => ({
          ...n,
          fecha: new Date(n.fecha),
          fechaProgramada: n.fechaProgramada ? new Date(n.fechaProgramada) : undefined
        }));
        this.notificacionesSubject.next([...this.notificaciones]);
      }
    } catch (error) {
      console.error('Error al cargar notificaciones del localStorage:', error);
    }
  }
}

