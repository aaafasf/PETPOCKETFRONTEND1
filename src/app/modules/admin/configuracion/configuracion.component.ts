import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent implements OnInit {

  configuraciones: any[] = [];

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

  private apiUrl = 'http://localhost:3000/configuracion';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarFormulario();
    this.cargarListado();
  }

  // 🔹 CARGA LA CONFIGURACIÓN EN EL FORMULARIO
  cargarFormulario() {
    this.http.get<any>(this.apiUrl).subscribe({
      next: (res) => {
        if (res && Object.keys(res).length > 0) {
          this.datosClinica = res; // 🔥 AQUÍ SE ARREGLA TODO
        }
      },
      error: (err) => console.error('Error al cargar configuración', err)
    });
  }

  // 🔹 CARGA LA LISTA DE CONFIGURACIONES
  cargarListado() {
  this.http.get<any[]>(`${this.apiUrl}/listar`).subscribe({
    next: (res) => {
      const agrupado: any = {};
      res.forEach(c => {
        switch (c.clave) {
          case 'nombreClinica': agrupado.nombre = c.valor; break;
          case 'telefonoClinica': agrupado.telefono = c.valor; break;
          case 'correoClinica': agrupado.correo = c.valor; break;
          case 'direccionClinica': agrupado.direccion = c.valor; break;
          case 'horariosClinica': agrupado.horarios = c.valor; break;
          case 'logoClinica': agrupado.logo = c.valor; break;
          case 'zonaHoraria': agrupado.zonaHoraria = c.valor; break;
          case 'idioma': agrupado.idioma = c.valor; break;
          case 'formatoFecha': agrupado.formatoFecha = c.valor; break;
          case 'politicas': agrupado.politicas = c.valor; break;
          case 'horasMinimasCancelacion': agrupado.horasMinimasCancelacion = parseInt(c.valor); break;
          case 'limiteMascotas': agrupado.limiteMascotas = parseInt(c.valor); break;
        }
      });
      this.configuraciones = [agrupado];
    },
    error: (err) => console.error('Error al listar configuraciones', err)
  }); // ← este paréntesis y llave deben cerrar bien
} // ← esta llave debe cerrar la función


  guardarConfiguracion() {
    this.http.post(this.apiUrl, this.datosClinica).subscribe({
      next: () => {
        alert('Configuración guardada correctamente');
        this.cargarFormulario(); // recarga formulario
        this.cargarListado();    // recarga lista
      },
      error: (err) => {
        console.error(err);
        alert('Error al guardar configuración');
      }
    });
  }
}
