import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { RouterModule } from '@angular/router'; // <-- AÑADIDO

@Component({
  selector: 'app-register-pet',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // <-- AÑADIDO RouterModule
  templateUrl: './register-pet.component.html',
  styleUrl: './register-pet.component.css'
})
export class RegisterPetComponent implements OnInit {
  // Propiedades para los select (catálogos)
  especies: any[] = [];
  razas: any[] = [];
  tamanos: any[] = [];
  sexos: any[] = [];
  colores: any[] = [];
  estadosMascota: any[] = [];

  // Propiedades del formulario (bindeadas con [(ngModel)])
  nombreMascota: string = '';
  idEspecie: number | null = null;
  idRaza: number | null = null;
  idTamano: number | null = null;
  idSexo: number | null = null;
  idColor: number | null = null;
  idEstadoMascota: number | null = null;
  edad: number | null = null;
  peso: string = '';
  alergias: string = '';
  caracter: string = '';

  constructor(private catalogos: CatalogosService) {}

  ngOnInit() {
    this.cargarCatalogos();
  }

  private cargarCatalogos() {
    this.catalogos.getEspecies().subscribe(data => this.especies = data.filter(e => e.activo));
    this.catalogos.getTamanos().subscribe(data => this.tamanos = data.filter(t => t.activo));
    this.catalogos.getSexos().subscribe(data => this.sexos = data.filter(s => s.activo));
    this.catalogos.getColores().subscribe(data => this.colores = data.filter(c => c.activo));
    this.catalogos.getEstadosMascota().subscribe(data => this.estadosMascota = data.filter(e => e.activo));
  }

  onEspecieChange(idEspecie: number | string) {
    this.idEspecie = typeof idEspecie === 'string' ? Number(idEspecie) : idEspecie;
    this.idRaza = null; // Resetear raza cuando cambia especie
    
    if (this.idEspecie) {
      this.catalogos.getRazas().subscribe(data => {
        this.razas = data.filter(r => r.activo && r.idEspecie === this.idEspecie);
      });
    } else {
      this.razas = [];
    }
  }

  // Método para enviar el formulario
  onSubmit() {
    // Validaciones básicas
    if (!this.nombreMascota.trim()) {
      alert('Por favor ingresa el nombre de la mascota');
      return;
    }

    if (!this.idEspecie) {
      alert('Por favor selecciona una especie');
      return;
    }

    if (!this.idRaza) {
      alert('Por favor selecciona una raza');
      return;
    }

    if (!this.idSexo) {
      alert('Por favor selecciona el sexo');
      return;
    }

    if (!this.alergias.trim()) {
      alert('Por favor indica las alergias');
      return;
    }

    if (!this.caracter.trim()) {
      alert('Por favor describe el carácter de la mascota');
      return;
    }

    // Crear objeto con los datos
    const mascotaData = {
      nombreMascota: this.nombreMascota,
      idEspecie: this.idEspecie,
      idRaza: this.idRaza,
      idTamano: this.idTamano,
      idSexo: this.idSexo,
      idColor: this.idColor,
      idEstadoMascota: this.idEstadoMascota || 1, // Valor por defecto si no se selecciona
      edad: this.edad,
      peso: this.peso,
      alergias: this.alergias,
      caracter: this.caracter,
      fechaRegistro: new Date().toISOString()
    };

    console.log('Datos a enviar:', mascotaData);
    
    // Aquí iría la llamada a tu servicio para guardar la mascota
    // Ejemplo:
    // this.mascotasService.registrarMascota(mascotaData).subscribe({
    //   next: (response) => {
    //     console.log('Mascota registrada:', response);
    //     alert('Mascota registrada exitosamente');
    //     this.limpiarFormulario();
    //   },
    //   error: (error) => {
    //     console.error('Error al registrar mascota:', error);
    //     alert('Error al registrar la mascota');
    //   }
    // });

    // Por ahora solo mostramos en consola
    alert(`Mascota "${this.nombreMascota}" registrada exitosamente (simulado)`);
    this.limpiarFormulario();
  }

  // Método para limpiar el formulario después de registrar
  private limpiarFormulario() {
    this.nombreMascota = '';
    this.idEspecie = null;
    this.idRaza = null;
    this.idTamano = null;
    this.idSexo = null;
    this.idColor = null;
    this.idEstadoMascota = null;
    this.edad = null;
    this.peso = '';
    this.alergias = '';
    this.caracter = '';
    this.razas = []; // Resetear razas
  }

  // Método para cancelar/limpiar el formulario manualmente
  onCancel() {
    if (confirm('¿Estás seguro de que quieres cancelar? Se perderán los datos ingresados.')) {
      this.limpiarFormulario();
    }
  }

  // Método auxiliar para obtener el nombre de un elemento por ID
  getNombrePorId(array: any[], id: number | null, propiedad: string = 'nombre'): string {
    if (!id) return 'No seleccionado';
    const item = array.find(item => item.id === id);
    return item ? item[propiedad] : 'Desconocido';
  }
}
