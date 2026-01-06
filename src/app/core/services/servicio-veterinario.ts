import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServicioVeterinarioService {

  private API_URL = 'http://localhost:3000/api/servicios/lista'; // tu ruta pública

  constructor(private http: HttpClient) {}

  getServicios(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL);
  }

  getServicioById(id: number): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/api/servicios/obtener/${id}`);
  }
}
