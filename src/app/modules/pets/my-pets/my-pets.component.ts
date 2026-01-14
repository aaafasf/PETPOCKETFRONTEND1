import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-my-pets',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  editIndex: number|null = null;
  mascotaEdit: any = {};

  constructor(private catalogos: CatalogosService, private http: HttpClient) {}

  ngOnInit() {
    // Aquí deberías obtener el id del usuario autenticado
    this.http.get<any[]>('/api/mis-mascotas').subscribe(data => this.mascotas = data);
    this.catalogos.getEspecies().subscribe(data => this.especies = data.filter(e => e.activo));
    this.catalogos.getTamanos().subscribe(data => this.tamanos = data.filter(t => t.activo));
    this.catalogos.getSexos().subscribe(data => this.sexos = data.filter(s => s.activo));
    this.catalogos.getColores().subscribe(data => this.colores = data.filter(c => c.activo));
    this.catalogos.getEstadosMascota().subscribe(data => this.estadosMascota = data.filter(e => e.activo));
  }

  onEdit(i: number) {
    this.editIndex = i;
    this.mascotaEdit = { ...this.mascotas[i] };
    this.onEspecieChange(this.mascotaEdit.idEspecie);
  }

  onEspecieChange(idEspecie: number) {
    this.catalogos.getRazas().subscribe(data => {
      this.razas = data.filter(r => r.activo && r.idEspecie === idEspecie);
    });
  }

  onSave() {
    if (this.editIndex !== null) {
      // Aquí deberías hacer PUT a la API para guardar cambios
      this.mascotas[this.editIndex] = { ...this.mascotaEdit };
      this.editIndex = null;
    }
  }

  onCancel() {
    this.editIndex = null;
  }
}
