import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-expedientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
<div class="flex min-h-screen bg-gradient-to-br from-[#ECEFF3] via-[#F5F7FA] to-[#E9EDF2] font-sans">

  <!-- SIDEBAR -->
  <aside class="w-72 bg-gradient-to-b from-[#050505] via-[#0B0B0F] to-[#000000] text-zinc-300 flex flex-col shadow-lg relative">
    <div class="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#F27438] via-orange-400 to-[#F27438]"></div>
    <div class="px-8 pt-10 pb-8 text-center">
      <img src="/assets/img/logo-circular.png" class="w-20 mx-auto mb-6 opacity-90 transform transition-transform duration-300 hover:scale-110">
      <p class="text-[10px] tracking-[0.45em] font-semibold text-zinc-500">ADMIN SYSTEM</p>
    </div>

    <nav class="flex-1 px-4 space-y-1 text-sm">
      <a routerLink="/admin/dashboard" routerLinkActive="bg-white/10 text-white" [routerLinkActiveOptions]="{ exact: true }" class="flex items-center gap-4 px-5 py-3 rounded-xl hover:bg-white/5 transition">
        <span class="text-xl">📊</span> Dashboard
      </a>
      <a routerLink="/admin/expedientes" routerLinkActive="bg-white/10 text-white" [routerLinkActiveOptions]="{ exact: true }" class="flex items-center gap-4 px-5 py-3 rounded-xl hover:bg-white/5 transition">
        <span class="text-xl">📁</span> Expedientes
      </a>
      <a routerLink="/admin/users" routerLinkActive="bg-white/10 text-white" [routerLinkActiveOptions]="{ exact: true }" class="flex items-center gap-4 px-5 py-3 rounded-xl hover:bg-white/5 transition">
        <span class="text-xl">👥</span> Usuarios
      </a>
    </nav>

    <div class="px-6 py-6 border-t border-white/10">
      <div class="flex items-center gap-4 bg-white/5 rounded-xl p-4">
        <img src="/assets/img/pet-illustration.jpg" class="w-9 opacity-40">
        <div class="text-xs">
          <p class="text-zinc-300 font-medium">PetPocket</p>
          <p class="text-zinc-500">Admin Console</p>
        </div>
      </div>
    </div>
  </aside>

  <!-- MAIN CONTENT -->
  <main class="flex-1 flex flex-col overflow-hidden p-8">

    <!-- TÍTULO -->
    <h2 class="text-3xl font-extrabold mb-6 flex items-center gap-2 text-gray-800">📁 Expedientes de Mascotas</h2>

    <!-- BUSCADOR -->
    <input type="text" placeholder="🔍 Buscar por mascota o cliente..." [(ngModel)]="filtro"
      class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 mb-6 transition" />

    <!-- TABLA -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm text-left border-separate border-spacing-y-2">
        <thead>
          <tr class="text-gray-600 uppercase text-xs">
            <th class="px-4 py-2">Mascota</th>
            <th class="px-4 py-2">Especie</th>
            <th class="px-4 py-2">Raza</th>
            <th class="px-4 py-2">Edad</th>
            <th class="px-4 py-2">Sexo</th>
            <th class="px-4 py-2">Cliente</th>
            <th class="px-4 py-2">Estado</th>
            <th class="px-4 py-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let m of mascotasFiltradasConFiltro" class="bg-gray-50 hover:bg-orange-50 transition rounded-xl shadow-sm">
            <td class="px-4 py-3 font-semibold">{{ m.nombre }}</td>
            <td class="px-4 py-3">{{ m.especie }}</td>
            <td class="px-4 py-3">{{ m.raza }}</td>
            <td class="px-4 py-3">{{ m.edad }} años</td>
            <td class="px-4 py-3">{{ m.sexo }}</td>
            <td class="px-4 py-3">
              <p class="font-medium">{{ m.cliente.nombre }}</p>
              <p class="text-xs text-gray-500">{{ m.cliente.telefono }}</p>
            </td>
            <td class="px-4 py-3">
              <span
                class="px-3 py-1 rounded-full text-xs font-bold"
                [ngClass]="{
                  'bg-green-100 text-green-700': m.estado === 'Activo',
                  'bg-red-100 text-red-700': m.estado === 'Inactivo'
                }"
              >
                {{ m.estado }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex gap-2 justify-center">
                <button class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition" (click)="verExpediente(m)">Ver</button>
                <button class="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition" (click)="editarMascota(m)">Editar</button>
                <button class="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition" (click)="cambiarEstado(m)">Estado</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</div>
  `,
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
