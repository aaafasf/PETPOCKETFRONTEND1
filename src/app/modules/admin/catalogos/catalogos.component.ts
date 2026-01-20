import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { HttpErrorResponse } from '@angular/common/http';

interface CatalogoItem {
  id: number;                 // 👈 SOLO FRONTEND (track)
  idEspecie?: number;
  idRaza?: number;
  idTamano?: number;
  idSexo?: number;
  idColor?: number;
  idEstadoMascota?: number;
  nombre: string;
  activo: boolean;
}

interface CatalogoDef {
  nombre: string;
  key: string;
  items: CatalogoItem[];
  load: () => any;
  add: (d: any) => any;
  update: (id: number, d: any) => any;
  setActivo: (id: number, a: boolean) => any;
}

@Component({
  selector: 'app-catalogos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogos.component.html',
  styleUrls: ['./catalogos.component.css']
})
export class CatalogosComponent implements OnInit {

  especies: any[] = [];

  catalogos: CatalogoDef[] = [
    {
      nombre: 'Especies',
      key: 'especie',
      items: [],
      load: () => this.svc.getEspecies(),
      add: d => this.svc.addEspecie(d),
      update: (id, d) => this.svc.updateEspecie(id, d),
      setActivo: (id, a) => this.svc.setEspecieActiva(id, a)
    },
    {
      nombre: 'Razas',
      key: 'raza',
      items: [],
      load: () => this.svc.getRazas(),
      add: d => this.svc.addRaza(d),
      update: (id, d) => this.svc.updateRaza(id, d),
      setActivo: (id, a) => this.svc.setRazaActiva(id, a)
    },
    {
      nombre: 'Sexos',
      key: 'sexo',
      items: [],
      load: () => this.svc.getSexos(),
      add: d => this.svc.addSexo(d),
      update: (id, d) => this.svc.updateSexo(id, d),
      setActivo: (id, a) => this.svc.setSexoActiva(id, a)
    },
    {
      nombre: 'Colores',
      key: 'color',
      items: [],
      load: () => this.svc.getColores(),
      add: d => this.svc.addColor(d),
      update: (id, d) => this.svc.updateColor(id, d),
      setActivo: (id, a) => this.svc.setColorActiva(id, a)
    },
    {
      nombre: 'Tamaños',
      key: 'tamano',
      items: [],
      load: () => this.svc.getTamanos(),
      add: d => this.svc.addTamano(d),
      update: (id, d) => this.svc.updateTamano(id, d),
      setActivo: (id, a) => this.svc.setTamanoActiva(id, a)
    },
    {
      nombre: 'Estados',
      key: 'estado',
      items: [],
      load: () => this.svc.getEstadosMascota(),
      add: d => this.svc.addEstadoMascota(d),
      update: (id, d) => this.svc.updateEstadoMascota(id, d),
      setActivo: (id, a) => this.svc.setEstadoMascotaActiva(id, a)
    }
  ];

  showModal = false;
  editMode = false;
  modalCatalogo: CatalogoDef | null = null;
  modalItem: Partial<CatalogoItem> = { nombre: '' };

  constructor(private svc: CatalogosService) {}

  // ===============================
  // INIT
  // ===============================
  ngOnInit() {
    this.catalogos.forEach(cat => this.loadCatalogo(cat));
    this.svc.getEspecies().subscribe(data => this.especies = data);
  }

  private loadCatalogo(cat: CatalogoDef) {
    cat.load().subscribe((data: any[]) => {
      cat.items = data.map(item => ({
        ...item,
        // 👇 unificamos ID SOLO para frontend
        id:
          item.idEspecie ??
          item.idRaza ??
          item.idSexo ??
          item.idColor ??
          item.idTamano ??
          item.idEstadoMascota ??
          item.id
      }));
    });
  }

  // ===============================
  // MODAL
  // ===============================
  abrirAgregar(catalogo: CatalogoDef) {
    this.editMode = false;
    this.modalCatalogo = catalogo;
    this.modalItem = { nombre: '' };

    if (catalogo.key === 'raza') {
      this.modalItem.idEspecie = this.especies[0]?.idEspecie;
    }

    this.showModal = true;
  }

  abrirEditar(catalogo: CatalogoDef, item: CatalogoItem) {
    this.editMode = true;
    this.modalCatalogo = catalogo;
    this.modalItem = { ...item };
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
    this.modalCatalogo = null;
    this.modalItem = { nombre: '' };
  }

  // ===============================
  // GUARDAR (🔥 CLAVE)
  // ===============================
  guardarModal() {
    if (!this.modalCatalogo || !this.modalItem.nombre) return;

    // ⚠️ PAYLOAD LIMPIO (SIN ID)
    const payload: any = {
      nombre: this.modalItem.nombre
    };

    // solo razas
    if (this.modalCatalogo.key === 'raza') {
      if (!this.modalItem.idEspecie) {
        alert('Selecciona una especie');
        return;
      }
      payload.idEspecie = this.modalItem.idEspecie;
    }

    // 🔵 EDITAR
    if (this.editMode && this.modalItem.id !== undefined) {
      this.modalCatalogo.update(this.modalItem.id, payload).subscribe({
        next: () => {
          this.loadCatalogo(this.modalCatalogo!);
          this.cerrarModal();
        },
        error: (err: HttpErrorResponse) => this.handleError(err)
      });

    // 🟢 CREAR
    } else {
      this.modalCatalogo.add(payload).subscribe({
        next: () => {
          this.loadCatalogo(this.modalCatalogo!);
          this.cerrarModal();
        },
        error: (err: HttpErrorResponse) => this.handleError(err)
      });
    }
  }

  // ===============================
  // ACTIVAR / DESACTIVAR
  // ===============================
  activar(catalogo: CatalogoDef, item: CatalogoItem) {
    catalogo.setActivo(item.id, true).subscribe(() => {
      this.loadCatalogo(catalogo);
    });
  }

  desactivar(catalogo: CatalogoDef, item: CatalogoItem) {
    catalogo.setActivo(item.id, false).subscribe(() => {
      this.loadCatalogo(catalogo);
    });
  }

  // ===============================
  // ERROR
  // ===============================
  private handleError(err: HttpErrorResponse) {
    console.error('BACKEND ERROR:', err);

    const msg =
      err?.error?.message ||
      err?.error?.error ||
      'Error interno del servidor';

    alert(msg);
  }
}
