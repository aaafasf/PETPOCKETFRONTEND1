import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-expedientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './expedientes.component.html',
  styleUrls: ['./expedientes.component.css']
})
export class ExpedientesComponent {
  filtro: string = '';

  mascotasFiltradas = [
    { nombre: 'Firulais', especie: 'Perro', raza: 'Labrador', edad: 3, sexo: 'Macho', estado: 'Activo', cliente: { nombre: 'Juan Perez', telefono: '0991234567' } },
    { nombre: 'Michi', especie: 'Gato', raza: 'Siames', edad: 2, sexo: 'Hembra', estado: 'Inactivo', cliente: { nombre: 'Ana Gomez', telefono: '0987654321' } }
  ];

  editarMascota(mascota: any) {
    const nuevoNombre = prompt('Nombre de la mascota:', mascota.nombre);
    if (nuevoNombre !== null) mascota.nombre = nuevoNombre;
    const nuevaEspecie = prompt('Especie:', mascota.especie);
    if (nuevaEspecie !== null) mascota.especie = nuevaEspecie;
    const nuevaRaza = prompt('Raza:', mascota.raza);
    if (nuevaRaza !== null) mascota.raza = nuevaRaza;
    const nuevaEdad = prompt('Edad:', mascota.edad);
    if (nuevaEdad !== null && !isNaN(+nuevaEdad)) mascota.edad = +nuevaEdad;
    const nuevoSexo = prompt('Sexo (Macho/Hembra):', mascota.sexo);
    if (nuevoSexo !== null) mascota.sexo = nuevoSexo;
  }

  cambiarEstado(mascota: any) {
    mascota.estado = mascota.estado === 'Activo' ? 'Inactivo' : 'Activo';
  }

  verExpediente(mascota: any) {
    alert(`
Nombre: ${mascota.nombre}
Especie: ${mascota.especie}
Raza: ${mascota.raza}
Edad: ${mascota.edad} años
Sexo: ${mascota.sexo}
Cliente: ${mascota.cliente.nombre}
Teléfono: ${mascota.cliente.telefono}
Estado: ${mascota.estado}
    `);
  }

  get mascotasFiltradasConFiltro() {
    if (!this.filtro) return this.mascotasFiltradas;
    return this.mascotasFiltradas.filter(m =>
      m.nombre.toLowerCase().includes(this.filtro.toLowerCase()) ||
      m.cliente.nombre.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }
}
