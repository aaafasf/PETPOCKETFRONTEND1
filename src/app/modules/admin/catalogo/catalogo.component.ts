import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CatalogosService } from '../../../core/services/catalogos.service';

export interface Especie {
  idEspecie: number;
  nombre: string;
  activo: boolean;
}

@Component({
  selector: 'app-catalogos',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './catalogos.component.html'
})
export class CatalogosComponent implements OnInit {

  especies: Especie[] = [];
  nuevaEspecie = '';
  cargando = false;
  error = '';

  constructor(private catalogosService: CatalogosService) {}

  ngOnInit(): void {
    this.cargarEspecies();
  }

  cargarEspecies(): void {
    this.cargando = true;
    this.catalogosService.getEspecies().subscribe({
      next: data => {
        this.especies = data;
        this.cargando = false;
      },
      error: err => {
        console.error(err);
        this.error = 'Error al cargar especies';
        this.cargando = false;
      }
    });
  }

  guardarEspecie(): void {
    if (!this.nuevaEspecie.trim()) return;

    this.catalogosService.addEspecie({
      nombre: this.nuevaEspecie,
      activo: true
    }).subscribe({
      next: () => {
        this.nuevaEspecie = '';
        this.cargarEspecies();
      },
      error: err => {
        console.error(err);
        this.error = 'No se pudo guardar la especie';
      }
    });
  }

  desactivarEspecie(especie: Especie): void {
    this.catalogosService.desactivarEspecie(especie.idEspecie).subscribe({
      next: () => this.cargarEspecies(),
      error: err => console.error(err)
    });
  }
}
