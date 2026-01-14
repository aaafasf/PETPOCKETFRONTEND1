

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogosService } from '../../../core/services/catalogos.service';

@Component({
  selector: 'app-register-pet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-pet.component.html',
  styleUrl: './register-pet.component.css'
})
export class RegisterPetComponent implements OnInit {
  especies: any[] = [];
  razas: any[] = [];
  tamanos: any[] = [];
  sexos: any[] = [];
  colores: any[] = [];
  estadosMascota: any[] = [];

  idEspecie: number|null = null;

  constructor(private catalogos: CatalogosService) {}

  ngOnInit() {
    this.catalogos.getEspecies().subscribe(data => this.especies = data.filter(e => e.activo));
    this.catalogos.getTamanos().subscribe(data => this.tamanos = data.filter(t => t.activo));
    this.catalogos.getSexos().subscribe(data => this.sexos = data.filter(s => s.activo));
    this.catalogos.getColores().subscribe(data => this.colores = data.filter(c => c.activo));
    this.catalogos.getEstadosMascota().subscribe(data => this.estadosMascota = data.filter(e => e.activo));
  }

  onEspecieChange(idEspecie: number|string) {
    this.idEspecie = typeof idEspecie === 'string' ? Number(idEspecie) : idEspecie;
    this.catalogos.getRazas().subscribe(data => {
      this.razas = data.filter(r => r.activo && r.idEspecie === this.idEspecie);
    });
  }
}
