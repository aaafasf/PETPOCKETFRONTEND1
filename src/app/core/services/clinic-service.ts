import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ClinicService as ClinicServiceInfo } from '../models/clinic-service.model';
import { environment } from '../../enviroments/enviroments';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class ClinicService {
  
  // Apunta a http://localhost:3000/cita/veterinarios
  private apiUrl = environment.apiUrl;

  private secretKey = 'cifrarDatos';

  // Colores por defecto para servicios que no tengan color asignado
  private defaultColors = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6'];

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista REAL de servicios desde el Backend
   * Mapeamos la estructura SQL/Mongo a la estructura plana del Planner
   */
  getServices(): Observable<ClinicServiceInfo[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/servicios/lista`).pipe(
      map(response => {
        return response.map(item => {
          // Extraemos la duración de Mongo o ponemos 30 min por defecto
          const duracion = item.detallesMongo?.duracionMinutos || 30;
          
          return {
            idServicio: item.idServicio,
            nombreServicio: item.nombreServicio, // Ya viene descifrado del controller
            precioServicio: item.precioServicio,
            duracionServicio: duracion,
            
            // Si tu backend no guarda color, asignamos uno aleatorio basado en el ID
            // Ojo: Si agregas el campo 'color' a tu tabla SQL, usa: item.color
            color: item.color || this.getColorById(item.idServicio),
            
            descripcion: item.descripcionServicio,
            activo: item.estadoServicio === 'activo'
          } as ClinicServiceInfo;
        });
      })
    );
  }

  // Helper para dar color consistente según el ID (para que no cambie al recargar)
  private getColorById(id: number): string {
    const index = id % this.defaultColors.length;
    return this.defaultColors[index];
  }
getVeterinarians(): Observable<{ id: number; name: string }[]> {
  return this.http.get<any>(`${this.apiUrl}/cita/veterinarios`).pipe(
    map(response => {
      console.log('📡 Respuesta REAL de la Base de Datos:', response); 

      let users: any[] = [];

      // Lógica robusta: Detecta si el backend manda un Array o un Objeto
      if (Array.isArray(response)) {
        users = response;
      } 
      else if (response?.usuarios) {
        users = response.usuarios;
      }
      else if (response?.users) {
        users = response.users;
      }

      // IMPORTANTE: Ya no hay "if users.length === 0" porque ahora SÍ vendrán datos reales.
      
      return users.map((u: any) => ({
        id: u.idUser,
        name: this.decryptData(u.nameUsers || u.nombre || u.name)
      }));
    })
  );
}


  private decryptData(encryptedData: string): string {
    try {
      // Si el string no parece encriptado (no empieza con U2Fsd...), devuélvelo tal cual
      if (!encryptedData || !encryptedData.startsWith('U2Fsd')) return encryptedData;

      const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      
      // Si la clave es incorrecta, originalText será vacío
      return originalText || 'Error desencriptando (Revisa clave)';
    } catch (e) {
      console.error('Error al desencriptar nombre', e);
      return encryptedData;
    }
  }

}