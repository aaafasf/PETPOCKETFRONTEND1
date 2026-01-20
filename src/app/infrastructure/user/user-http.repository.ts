import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { UserRepository } from '../../core/domain/user/user.repository';
import { User } from '../../core/domain/user/user.model';
import { CreateUserDto } from '../../infrastructure/user/create-user.dto';

@Injectable({ providedIn: 'root' })
export class UserHttpRepository extends UserRepository {

  private apiUrl = 'http://localhost:3000/api/usuario';

  constructor(private http: HttpClient) {
    super();
  }

  getAll(): Promise<User[]> {
    return firstValueFrom(
      this.http.get<User[]>(`${this.apiUrl}/lista`)
    );
  }

  create(payload: CreateUserDto): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${this.apiUrl}/crear`, payload)
    );
  }

  delete(id: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.apiUrl}/eliminar/${id}`)
    );
  }
}
