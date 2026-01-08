import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, tap, timeout, finalize } from 'rxjs/operators';

export interface Notificacion {
  id?: number;
  titulo: string;
  mensaje: string;
  fecha: Date | string;
  fechaProgramada?: Date | string;
  leida: boolean;
  tipo: 'vacuna' | 'control' | 'recordatorio';
  mesesProgramacion?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private API_URL = 'http://localhost:3000/api/notificaciones';
  private notificacionesSubject = new BehaviorSubject<Notificacion[]>([]);
  public notificaciones$ = this.notificacionesSubject.asObservable();

  constructor(private http: HttpClient) {
    // No cargar automáticamente - dejar que los componentes lo hagan cuando lo necesiten
  }

  private mapearNotificacion(n: any): Notificacion {
    return {
      id: n.id || n.idNotificacion,
      titulo: n.titulo || n.título || '',
      mensaje: n.mensaje || '',
      fecha: n.fecha ? new Date(n.fecha) : new Date(),
      fechaProgramada: n.fechaProgramada ? new Date(n.fechaProgramada) : undefined,
      leida: n.leida || n.leída || false,
      tipo: n.tipo || 'recordatorio',
      mesesProgramacion: n.mesesProgramacion
    };
  }

  obtenerTodas(): Observable<Notificacion[]> {
    console.log('🔵 [NotificacionesService] Iniciando petición a:', this.API_URL);
    
    return this.http.get<any[]>(this.API_URL).pipe(
      timeout(15000),
      map((respuesta: any) => {
        console.log('✅ [NotificacionesService] Respuesta recibida:', respuesta);
        
        // Manejar diferentes formatos de respuesta
        let notificaciones: any[] = [];
        
        if (Array.isArray(respuesta)) {
          notificaciones = respuesta;
        } else if (respuesta?.data && Array.isArray(respuesta.data)) {
          notificaciones = respuesta.data;
        }
        
        const mapeadas = notificaciones.map(n => this.mapearNotificacion(n));
        console.log('✅ [NotificacionesService] Notificaciones procesadas:', mapeadas.length);
        return mapeadas;
      }),
      tap(notificaciones => {
        this.notificacionesSubject.next(notificaciones);
      }),
      catchError((err: any) => {
        console.error('❌ [NotificacionesService] Error:', err);
        // Solo lanzar error si realmente es un error de conexión
        const status = err?.status;
        if (status === 0 || status === 404 || err?.name === 'TimeoutError') {
          this.notificacionesSubject.next([]);
          return throwError(() => err);
        }
        // Para otros errores, retornar array vacío como éxito
        this.notificacionesSubject.next([]);
        return of([]);
      })
    );
  }

  obtenerPorId(id: number): Observable<Notificacion> {
    return this.http.get<any>(`${this.API_URL}/${id}`).pipe(
      map(notificacion => this.mapearNotificacion(notificacion)),
      catchError(err => {
        console.error('Error al obtener notificación por ID:', err);
        return throwError(() => err);
      })
    );
  }

  obtenerNoLeidas(): Notificacion[] {
    return this.notificacionesSubject.value.filter(n => !n.leida);
  }

  obtenerLeidas(): Notificacion[] {
    return this.notificacionesSubject.value.filter(n => n.leida);
  }

  crearNotificacion(notificacion: Partial<Notificacion>): Observable<Notificacion> {
    const payload = {
      titulo: notificacion.titulo,
      mensaje: notificacion.mensaje,
      tipo: notificacion.tipo || 'recordatorio',
      fechaProgramada: notificacion.fechaProgramada,
      mesesProgramacion: notificacion.mesesProgramacion
    };

    console.log('🔵 [NotificacionesService] Creando notificación en:', this.API_URL);
    console.log('🔵 [NotificacionesService] Payload:', payload);

    return this.http.post<any>(this.API_URL, payload).pipe(
      timeout(10000),
      map(respuesta => {
        console.log('✅ [NotificacionesService] Respuesta de creación:', respuesta);
        const notificacionCreada = respuesta.data || respuesta;
        const mapeada = this.mapearNotificacion(notificacionCreada);
        console.log('✅ [NotificacionesService] Notificación mapeada:', mapeada);
        return mapeada;
      }),
      tap(notificacionCreada => {
        console.log('✅ [NotificacionesService] Agregando notificación al BehaviorSubject');
        const notificacionesActuales = this.notificacionesSubject.value;
        // Verificar que no esté duplicada antes de agregar
        const existe = notificacionesActuales.some(n => 
          n.id === notificacionCreada.id || 
          (n.titulo === notificacionCreada.titulo && 
           n.mensaje === notificacionCreada.mensaje &&
           Math.abs(new Date(n.fecha).getTime() - new Date(notificacionCreada.fecha).getTime()) < 1000)
        );
        if (!existe) {
          this.notificacionesSubject.next([notificacionCreada, ...notificacionesActuales]);
          console.log('✅ [NotificacionesService] Notificación agregada, total:', this.notificacionesSubject.value.length);
        } else {
          console.log('⚠️ [NotificacionesService] Notificación duplicada detectada, recargando desde backend');
          // Si ya existe, refrescar desde el backend para evitar duplicados
          this.obtenerTodas().subscribe();
        }
      }),
      catchError(err => {
        console.error('❌ [NotificacionesService] Error al crear notificación:', err);
        console.error('❌ [NotificacionesService] Detalles:', {
          status: err?.status,
          message: err?.message,
          error: err?.error
        });
        return throwError(() => err);
      })
    );
  }

  marcarComoLeida(id: number): Observable<Notificacion> {
    return this.http.patch<any>(`${this.API_URL}/${id}/marcar-leida`, {}).pipe(
      timeout(5000),
      map(respuesta => {
        const notificacionActualizada = respuesta.data || respuesta;
        return this.mapearNotificacion({ ...notificacionActualizada, leida: true });
      }),
      tap(notificacionActualizada => {
        const notificacionesActuales = this.notificacionesSubject.value;
        const index = notificacionesActuales.findIndex(n => n.id === id);
        if (index !== -1) {
          notificacionesActuales[index] = notificacionActualizada;
          this.notificacionesSubject.next([...notificacionesActuales]);
        }
      }),
      catchError(err => {
        console.error('Error al marcar como leída:', err);
        return throwError(() => err);
      })
    );
  }

  eliminarNotificacion(id: number): Observable<void> {
    return this.http.delete<any>(`${this.API_URL}/${id}`).pipe(
      timeout(5000),
      tap(() => {
        const notificacionesActuales = this.notificacionesSubject.value.filter(n => n.id !== id);
        this.notificacionesSubject.next(notificacionesActuales);
      }),
      catchError(err => {
        console.error('Error al eliminar notificación:', err);
        return throwError(() => err);
      })
    );
  }

  limpiarHistorial(): Observable<void> {
    return this.http.delete<any>(`${this.API_URL}/limpiar`).pipe(
      timeout(5000),
      tap(() => {
        this.notificacionesSubject.next([]);
      }),
      catchError(err => {
        console.error('Error al limpiar historial:', err);
        return throwError(() => err);
      })
    );
  }
}

