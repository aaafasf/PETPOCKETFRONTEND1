import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ConfiguracionService } from '@core/services/configuracion.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent implements OnInit {

  configuraciones: any[] = [];
  cargando = false;
  mensaje = '';
  tipoMensaje: 'exito' | 'error' = 'exito';

  datosClinica: any = {
    nombre: '',
    telefono: '',
    correo: '',
    direccion: '',
    horarios: '',
    logo: '',
    zonaHoraria: '',
    idioma: '',
    formatoFecha: '',
    politicas: '',
    horasMinimasCancelacion: 0,
    limiteMascotas: 0
  };

  tipo_carga: 'cargando' | 'guardando' = 'cargando';

  constructor(private configuracionService: ConfiguracionService) {}

  ngOnInit() {
    this.tipo_carga = 'cargando';
    this.cargarFormulario();
    this.cargarConfiguraciones();
  }

  // 🔹 CARGA LA CONFIGURACIÓN EN EL FORMULARIO
  cargarFormulario() {
    this.cargando = true;
    this.configuracionService.obtenerConfiguracion().subscribe({
      next: (res: any) => {
        if (res && Object.keys(res).length > 0) {
          this.datosClinica = res;
        }
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar configuración', err);
        this.mostrarMensaje('Error al cargar configuración', 'error');
        this.cargando = false;
      }
    });
  }

  guardarConfiguracion() {
    this.cargando = true;
    this.configuracionService.guardarConfiguracion(this.datosClinica).subscribe({
      next: () => {
        this.mostrarMensaje('Configuración guardada correctamente', 'exito');
        this.cargarFormulario();
        this.cargarConfiguraciones(); 
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al guardar:', err);
        this.mostrarMensaje('Error al guardar configuración', 'error');
        this.cargando = false;
      }
    });
  }

  private mostrarMensaje(msg: string, tipo: 'exito' | 'error') {
    this.mensaje = msg;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 4000);
  }
  cargarConfiguraciones() {
  this.configuracionService.listarConfiguraciones(1).subscribe({
    next: (res) => {
      console.log('Configuraciones:', res); // 🧪 debug
      this.configuraciones = res || [];
    },
    error: (err) => {
      console.error('Error al listar configuraciones', err);
    }
  });
}

}
