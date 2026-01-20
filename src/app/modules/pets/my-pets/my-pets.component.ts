import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { MascotaService } from '../../../core/services/mascota.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-my-pets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './my-pets.component.html',
  styleUrls: ['./my-pets.component.css']
})
export class MyPetsComponent implements OnInit {
  mascotas: any[] = [];
  especies: any[] = [];
  razas: any[] = [];
  tamanos: any[] = [];
  sexos: any[] = [];
  colores: any[] = [];
  estadosMascota: any[] = [];

  editIndex: number | null = null;
  mascotaEdit: any = {};
  loading = false;
  idPropietario: number = 1; // Idealmente obtener del usuario logueado

  constructor(
    private catalogos: CatalogosService,
    private mascotaService: MascotaService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarMascotas();
    this.cargarCatalogos();
  }

  private cargarMascotas() {
    this.loading = true;
    // Obtener mascotas del propietario actual
    this.mascotaService.getByPropietario(this.idPropietario).subscribe({
      next: (data) => {
        this.mascotas = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar mascotas:', error);
        this.loading = false;
      }
    });
  }

  private cargarCatalogos() {
    this.catalogos.getEspecies().subscribe(data => this.especies = data.filter(e => e.activo));
    this.catalogos.getTamanos().subscribe(data => this.tamanos = data.filter(t => t.activo));
    this.catalogos.getSexos().subscribe(data => this.sexos = data.filter(s => s.activo));
    this.catalogos.getColores().subscribe(data => this.colores = data.filter(c => c.activo));
    this.catalogos.getEstadosMascota().subscribe(data => this.estadosMascota = data.filter(e => e.activo));
  }

  onEdit(i: number) {
    this.editIndex = i;
    this.mascotaEdit = { ...this.mascotas[i] };
    if (this.mascotaEdit.especie) {
      this.onEspecieChange(this.mascotaEdit.especie);
    }
  }

  onEspecieChange(especie: string) {
    this.mascotaEdit.especie = especie;
    this.catalogos.getRazas().subscribe(data => {
      this.razas = data.filter(r => r.activo && (r.idEspecie === parseInt(especie) || r.especie === especie));
    });
  }

  onSave() {
    if (this.editIndex !== null && this.mascotaEdit.idMascota) {
      this.loading = true;

      // Preparar datos para actualizar
      const updateData = {
        nombreMascota: this.mascotaEdit.nombreMascota,
        especie: this.mascotaEdit.especie,
        raza: this.mascotaEdit.raza || '',
        edad: this.mascotaEdit.edad || 0,
        sexo: this.mascotaEdit.sexo,
        pesoKg: this.mascotaEdit.pesoKg || 0,
        color: this.mascotaEdit.color || '',
        alergias: Array.isArray(this.mascotaEdit.alergias) ? this.mascotaEdit.alergias : [this.mascotaEdit.alergias],
        observaciones: this.mascotaEdit.observaciones || '',
        esterilizado: this.mascotaEdit.esterilizado || false,
        idPropietario: this.idPropietario
      };

      this.mascotaService.update(this.mascotaEdit.idMascota, updateData).subscribe({
        next: (response) => {
          // Actualizar en la lista local
          this.mascotas[this.editIndex!] = { ...this.mascotaEdit };
          this.editIndex = null;
          this.mascotaEdit = {};
          this.loading = false;
          alert('Mascota actualizada exitosamente');
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al actualizar mascota:', error);
          alert('Error al actualizar mascota: ' + (error?.error?.message || error?.message));
          this.loading = false;
        }
      });
    }
  }

  onDelete(i: number) {
    const mascota = this.mascotas[i];
    if (confirm(`¿Estás seguro de que deseas eliminar a ${mascota.nombreMascota}?`)) {
      this.loading = true;
      this.mascotaService.delete(mascota.idMascota).subscribe({
        next: (response) => {
          // Remover de la lista local
          this.mascotas.splice(i, 1);
          this.loading = false;
          alert('Mascota eliminada exitosamente');
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al eliminar mascota:', error);
          alert('Error al eliminar mascota: ' + (error?.error?.message || error?.message));
          this.loading = false;
        }
      });
    }
  }

  onCancel() {
    this.editIndex = null;
    this.mascotaEdit = {};
  }
}
