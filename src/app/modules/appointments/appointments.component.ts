import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // Añadido Router y RouterModule

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
    private router: Router
  ) {}

  ngOnInit(): void {
    // Capturamos el ?id= de la URL que enviamos desde el Dashboard
    this.route.queryParamMap.subscribe(params => {
      this.servicioId = params.get('id');
      this.definirServicio();
    });
  }

  definirServicio() {
    // Diccionario actualizado según los datos de tu Backend y el nuevo icono de cirugía
    const servicios: { [key: string]: string } = {
      '1': 'Consulta General',
      '2': 'Vacunación',
      '3': 'Desparasitación',
      '4': 'Baño y Peluquería',
      '5': 'Esterilización' // ID 5 que acabamos de configurar con el icono ✂️
    };

    this.nombreServicio = servicios[this.servicioId || ''] || 'Servicio Especializado';
    
    console.log('Agendando cita para:', this.nombreServicio, '(ID:', this.servicioId, ')');
  }

  // Función para el botón "Cancelar y volver"
  irAlInicio(): void {
    this.router.navigate(['/dashboard']);
  }
}