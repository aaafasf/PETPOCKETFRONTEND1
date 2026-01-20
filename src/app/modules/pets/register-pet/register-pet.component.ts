import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { MascotaService } from '../../../core/services/mascota.service';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register-pet',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
  especie: string = '';
  raza: string = '';
  edad: number | null = null;
  sexo: string = '';
  pesoKg: number | null = null;
  color: string = '';
  alergias: string = '';
  observaciones: string = '';
  esterilizado: boolean = false;

  idPropietario: number = 1; // Idealmente obtener del usuario logueado
  loading = false;

  constructor(
    private catalogos: CatalogosService,
    private mascotaService: MascotaService,
    private http: HttpClient,
    private router: Router
  ) {}

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

  onEspecieChange(especie: string) {
    this.especie = especie;
    this.raza = '';

    if (this.especie) {
      this.catalogos.getRazas().subscribe(data => {
        this.razas = data.filter(r => r.activo && (r.idEspecie === parseInt(especie) || r.especie === especie));
      });
    } else {
      this.razas = [];
    }
  }

  onSubmit() {
    // Validaciones básicas
    if (!this.nombreMascota.trim()) {
      alert('Por favor ingresa el nombre de la mascota');
      return;
    }

    if (!this.especie) {
      alert('Por favor selecciona una especie');
      return;
    }

    if (!this.sexo) {
      alert('Por favor selecciona el sexo');
      return;
    }

    this.loading = true;

    const mascotaData = {
      nombreMascota: this.nombreMascota,
      especie: this.especie,
      raza: this.raza || '',
      edad: this.edad || 0,
      sexo: this.sexo,
      pesoKg: this.pesoKg || 0,
      color: this.color || '',
      alergias: this.alergias ? [this.alergias] : [],
      observaciones: this.observaciones || '',
      esterilizado: this.esterilizado,
      idPropietario: this.idPropietario
    };

    this.mascotaService.create(mascotaData).subscribe({
      next: (response) => {
        alert('¡Mascota registrada exitosamente!');
        this.limpiarFormulario();
        this.loading = false;
        this.router.navigate(['/pets/my']);
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error al registrar mascota: ' + (error?.error?.message || error?.message));
        this.loading = false;
      }
    });
  }

  private limpiarFormulario() {
    this.nombreMascota = '';
    this.especie = '';
    this.raza = '';
    this.edad = null;
    this.sexo = '';
    this.pesoKg = null;
    this.color = '';
    this.alergias = '';
    this.observaciones = '';
    this.esterilizado = false;
    this.razas = [];
  }

  onCancel() {
    if (confirm('¿Descartar cambios?')) {
      this.limpiarFormulario();
      this.router.navigate(['/pets/my']);
    }
  }
}
