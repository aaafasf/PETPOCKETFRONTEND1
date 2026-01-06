import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  // Agregamos RouterLink para que funcionen los enlaces del HTML
  imports: [CommonModule, RouterModule, RouterLink], 
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // En el futuro, aquí implementaremos el CRUD de Usuarios (Read)
  // para ver el perfil del usuario [cite: 10, 11]
}