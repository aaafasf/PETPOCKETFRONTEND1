import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserHttpRepository } from '../../../../../infrastructure/user/user-http.repository';
import { GetUserUseCase, DeleteUserUseCase } from '../../../../../core/domain/user/user.use-cases';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list.page.html',
  styleUrls: ['./user-list.page.css']
})
export class UserListPage implements OnInit {

  users: any[] = [];
  selectedUser: any = null;

  private getUserUseCase: GetUserUseCase;
  private deleteUserUseCase: DeleteUserUseCase;

  constructor(
    private cd: ChangeDetectorRef,
    private userRepository: UserHttpRepository, 
    private router: Router
  ) {
    this.getUserUseCase = new GetUserUseCase(this.userRepository);
    this.deleteUserUseCase = new DeleteUserUseCase(this.userRepository);
  }
  // Dentro de tu export class UserListPage

toggleStatus(event: Event, user: any) {
  event.stopPropagation(); // Evita que se dispare el click de la tarjeta
  
  // Cambiamos el estado (true/false)
  user.desactivado = !user.desactivado;
  
  console.log(`Estado de ${user.nameUsers}: ${user.desactivado ? 'Inactivo' : 'Activo'}`);
}

  ngOnInit(): void {
    this.loadUsers();
  }

  async loadUsers() {
    try {
      const response: any = await this.getUserUseCase.execute();
      this.users = Array.isArray(response) ? response : response?.data ?? [];

      this.users = this.users.map((user, index) => ({
        ...user,
        adjustedId: index + 1, // Ajuste de ID
        roles: user.roles || 'Sin roles asignados',
      }));
      
      this.cd.detectChanges(); 

      console.log('Usuarios cargados:', this.users);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      this.users = [];
    }
  }

  selectUser(user: any) {
    this.selectedUser = this.selectedUser?.idUser === user.idUser ? null : user;
  }

  async onDeleteClick(event: Event, user: any) {
    event.stopPropagation();

    if (!confirm(`¿Seguro que deseas eliminar a este usuario?`)) {
      return;
    }

    try {
      const response: any = await this.deleteUserUseCase.execute(user.idUser);
      if (response && response.success) {
        this.users = this.users.filter(u => u.idUser !== user.idUser);
        this.selectedUser = null;  // Deseleccionamos el usuario eliminado
      } else {
        alert('No se pudo eliminar el usuario');
      }
    } catch (error) {
      alert('Error al eliminar el usuario');
    }
  }

  goToResetPassword(event: Event, userId: string) {
    event.stopPropagation();
    if (!userId) return;

    // Navegamos a la página de restablecimiento de contraseña con el ID del usuario
    this.router.navigate([
      '/admin/users/reset-password', userId
    ]);
  }

  getAsterisks(password: string): string {
    return password ? '*'.repeat(password.length) : 'No disponible';
  }
}
