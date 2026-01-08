import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // 👈 CLAVE
  templateUrl: './reset-password.page.html',
})
export class ResetPasswordPage {
  password = '';
  confirmPassword = '';
  userId: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {
    // Obtén el ID del usuario desde la URL
    this.userId = this.route.snapshot.paramMap.get('id')!;
  }

  actualizarContrasena() {
    // AQUÍ: En el futuro pondrás la llamada a tu servicio para guardar en la BD
    console.log('Contraseña actualizada con éxito');
  }

  resetPassword() {
    if (!this.password || !this.confirmPassword) {
      alert('Todos los campos son obligatorios');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    alert('Contraseña restablecida correctamente');
    this.router.navigate(['/admin/users']);  // Redirigir a la lista de usuarios después de restablecer la contraseña
  }

  goBack() {
    this.router.navigate(['/admin/users']); // Redirigir a la lista de usuarios si se cancela
    this.location.back();  
  }
}