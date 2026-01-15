import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';

interface Servicio {
  idServicio: number;
  nombreServicio: string;
  descripcionServicio: string;
  precioServicio: number;
  imagen?: string | null;
  estadoServicio: string;
  citas?: number;
}

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css']
})
export class DashboardAdminComponent {

  servicios: Servicio[] = [];
  totalServicios = 0;
  totalCitas = 0;
  serviciosActivos = 0;

  constructor(private route: ActivatedRoute) {

    const data = this.route.snapshot.data['servicios'];

    this.servicios = data.map((s: any) => ({
      idServicio: s.idServicio,
      nombreServicio: s.nombreServicio,
      descripcionServicio: s.descripcionServicio,
      precioServicio: s.precioServicio,
      estadoServicio: s.estadoServicio,
      imagen: s.imagen
        ? `http://localhost:3000/uploads/servicios/${s.imagen}`
        : null,
      citas: s.citas ?? 0
    }));

    this.calcularEstadisticas();
  }

  calcularEstadisticas(): void {
    this.totalServicios = this.servicios.length;
    this.serviciosActivos = this.servicios.filter(
      s => s.estadoServicio === 'activo'
    ).length;
    this.totalCitas = this.servicios.reduce(
      (sum, s) => sum + (s.citas ?? 0), 0
    );
  }
}
