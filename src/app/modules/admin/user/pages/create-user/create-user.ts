import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CreateUserUseCase } from '../../../../../core/domain/user/user.use-cases';
import { UserHttpRepository } from '../../../../../infrastructure/user/user-http.repository';
import { CreateUserDto } from '../../../../../infrastructure/user/create-user.dto';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [FormsModule, RouterModule], // 👈 CLAVE
  templateUrl: './create-user.html',
  styleUrls: ['./create-user.css'],
})
export class CreateUserPage {
  cedulaCliente = '';
  nombreCliente = '';
  emailCliente = '';
  passwordCliente = '';
  confirmPassword = '';
  rolSeleccionado = "";

  private createUserUseCase: CreateUserUseCase;

  constructor(
    private userRepository: UserHttpRepository,
    private router: Router
  ) {
    this.createUserUseCase = new CreateUserUseCase(this.userRepository);
  }

  async createUser() {
    if (
      !this.cedulaCliente ||
      !this.nombreCliente ||
      !this.emailCliente ||
      !this.passwordCliente||
      !this.rolSeleccionado
    ) {
      alert('Todos los campos obligatorios deben ser llenados');
      return;
    }

    if (this.passwordCliente !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    const dto: CreateUserDto = {
      nameUsers: this.nombreCliente,
      phoneUser: '',
      emailUser: this.emailCliente,
      userName: this.cedulaCliente,
      passwordUser: this.passwordCliente,
      roles: [this.rolSeleccionado],
    };

    try {
      await this.createUserUseCase.execute(dto);
      alert('Usuario creado correctamente');
      this.router.navigate(['/admin/users']);
    } catch (error: any) {
      alert(error?.message || 'Error al crear usuario');
    }
  }
}
