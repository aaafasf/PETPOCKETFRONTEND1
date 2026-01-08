import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroments';

export interface ClienteDto {
  idClientes: number;
  nombreCliente: string;
  cedulaCliente?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ClienteDto[]> {
    return this.http.get<ClienteDto[]>(`${this.apiUrl}/cliente/lista`);
  }
}