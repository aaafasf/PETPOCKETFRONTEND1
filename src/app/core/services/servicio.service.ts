  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';

  @Injectable({
    providedIn: 'root'
  })
  export class ServicioService {

    private API_URL = 'http://localhost:3000/api/servicios';

    constructor(private http: HttpClient) {}

    listarAdmin(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/`);
  }

    crear(servicio: any): Observable<any> {
      return this.http.post<any>(`${this.API_URL}`, servicio);
    }

    actualizar(id: number, servicio: any): Observable<any> {
      return this.http.put<any>(`${this.API_URL}/${id}`, servicio);
    }

    eliminar(id: number): Observable<any> {
      return this.http.delete<any>(`${this.API_URL}/${id}`);
    }
  }       