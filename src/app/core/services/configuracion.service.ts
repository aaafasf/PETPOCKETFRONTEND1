import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ConfiguracionClinica {
  nombre?: string;
  logo?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  horarios?: string;
  zonaHoraria?: string;
  idioma?: string;
  formatoFecha?: string;
  politicas?: string;
  horasMinimasCancelacion?: number;
  limiteMascotas?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  private apiUrl = 'http://localhost:3000/api/configuracion';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene toda la configuración estructurada como un objeto
   */
  obtenerConfiguracion(idClinica: number = 1): Observable<ConfiguracionClinica> {
    return this.http.get<ConfiguracionClinica>(`${this.apiUrl}?idClinica=${idClinica}`);
  }

  /**
   * Lista todas las configuraciones en formato clave-valor
   */
  listarConfiguraciones(idClinica: number = 1): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listar?idClinica=${idClinica}`);
  }

  /**
   * Guarda/actualiza toda la configuración de golpe (formulario completo)
   */
  guardarConfiguracion(datos: ConfiguracionClinica, idClinica: number = 1): Observable<any> {
    return this.http.post(`${this.apiUrl}`, { ...datos, idClinica });
  }

  /**
   * Actualiza una clave específica
   */
  actualizarConfiguracion(clave: string, valor: any, idClinica: number = 1): Observable<any> {
    return this.http.put(`${this.apiUrl}/${clave}?idClinica=${idClinica}`, { valor });
  }

  /**
   * Elimina una clave específica
   */
  eliminarConfiguracion(clave: string, idClinica: number = 1): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${clave}?idClinica=${idClinica}`);
  }
}
