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

  datosClinica = {
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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarConfiguraciones();
  }

  cargarConfiguraciones() {
    this.http.get<any[]>('http://localhost:3000/configuracion/listar').subscribe({
      next: (res) => {
        this.configuraciones = res;
      },
      error: (err) => console.error('Error al cargar configuraciones', err)
    });
  }

  cargarLogo(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.datosClinica.logo = file.name; // guardamos solo el nombre
    }
  }

  guardarConfiguracion() {
  const formData = new FormData();

  // Agregar solo campos que no sean archivo
  for (const key in this.datosClinica) {
    if (key !== 'logo') {
      const typedKey = key as keyof typeof this.datosClinica;
      formData.append(typedKey, this.datosClinica[typedKey] as any);
    }
  }

  // Agregar archivo si existe
  const inputFile = (<HTMLInputElement>document.querySelector('input[type="file"]'));
  if (inputFile && inputFile.files && inputFile.files[0]) {
    formData.append('logo', inputFile.files[0]);
  }

  this.http.post('http://localhost:3000/configuracion', formData).subscribe({
    next: () => {
      alert('Configuración guardada correctamente');
      this.cargarConfiguraciones(); // Refrescar lista
      this.datosClinica.logo = ''; // Limpiar input
      if (inputFile) inputFile.value = '';
    },
    error: (err) => {
      console.error(err);
      alert('Error al guardar configuración');
    }
  });
}

}
