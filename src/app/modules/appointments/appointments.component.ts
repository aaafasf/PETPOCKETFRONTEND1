import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // Añadido Router y RouterModule
import { ServicioService } from '../../core/services/servicio.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule], // Añadido RouterModule para habilitar navegación
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css'
})
export class AppointmentsComponent implements OnInit {
  servicioId: string | null = null;
  nombreServicio: string = 'Cargando servicio...';

  // Inyectamos Router para poder navegar programáticamente
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private servicioService: ServicioService
  ) {}

  ngOnInit(): void {
    // Capturamos el ?id= de la URL que enviamos desde el Dashboard
    this.route.queryParamMap.subscribe(params => {
      this.servicioId = params.get('id');
      this.definirServicio();
    });
  }

  definirServicio() {
  if (!this.servicioId) {
    this.nombreServicio = 'Servicio Especializado';
    return;
  }

  // Intento real: backend
  this.servicioService.listarAdmin().subscribe({
    next: (servicios) => {
      const encontrado = servicios.find(
        (s: any) => String(s.idServicio) === String(this.servicioId)
      );

      this.nombreServicio = encontrado
        ? encontrado.nombre
        : 'Servicio Especializado';

      console.log('Agendando cita para:', this.nombreServicio, '(ID:', this.servicioId, ')');
    },
    error: () => {
      this.nombreServicio = 'Servicio Especializado';
    }
  });
}


  // Función para el botón "Cancelar y volver"
  irAlInicio(): void {
    this.router.navigate(['/dashboard']);
  }

  
}
