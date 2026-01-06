import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  fecha: Date;
  leida: boolean;
  tipo: 'vacuna' | 'control' | 'recordatorio';
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
  // Read: Lista de notificaciones
  notificaciones: Notificacion[] = [
    { id: 1, titulo: 'Vacuna Pendiente', mensaje: 'Recordatorio: Vacuna de rabia en 6 meses.', fecha: new Date(), leida: false, tipo: 'vacuna' },
    { id: 2, titulo: 'Control Mensual', mensaje: 'Mañana tienes un control con el Dr. Javier.', fecha: new Date(), leida: true, tipo: 'control' }
  ];

  nuevaAlerta = { titulo: '', mensaje: '', tipo: 'recordatorio' as const };

  ngOnInit(): void {}

  // Create: Crear una alerta programada
  agregarAlerta() {
    if (this.nuevaAlerta.titulo && this.nuevaAlerta.mensaje) {
      const id = this.notificaciones.length + 1;
      this.notificaciones.unshift({
        id,
        ...this.nuevaAlerta,
        fecha: new Date(),
        leida: false
      });
      this.nuevaAlerta = { titulo: '', mensaje: '', tipo: 'recordatorio' };
    }
  }

  // Update: Marcar como leída
  marcarComoLeida(id: number) {
    const noti = this.notificaciones.find(n => n.id === id);
    if (noti) noti.leida = true;
  }

  // Delete: Limpiar historial
  limpiarHistorial() {
    this.notificaciones = [];
  }
}