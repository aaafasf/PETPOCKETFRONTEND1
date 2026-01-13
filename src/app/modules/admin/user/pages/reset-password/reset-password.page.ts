import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
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
    // Aquí se conectará con el servicio en el futuro
    console.log('Contraseña actualizada con éxito');
  }

  resetPassword() {
    // 1. Validaciones básicas
    if (!this.password || !this.confirmPassword) {
      alert('Todos los campos son obligatorios');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // 2. Ejecutar la lógica de guardado
    this.actualizarContrasena();

    // 3. Redirigir y confirmar
    alert('Contraseña restablecida correctamente');
  
    /** * CAMBIO IMPORTANTE: 
     * En tu captura de pantalla la URL es /admin/users/...
     * Por lo tanto, la ruta debe ser 'admin/users' (en plural)
     */
    this.router.navigate(['/admin/users']).then(nav => {
      if (!nav) {
        // Si falla con 'users', intenta con 'user' o revisa app.routes.ts
        console.error('La navegación falló. Verifica la ruta en app.routes.ts');
      }
    }); 
  }

  goBack() {
    this.location.back();
  }
}