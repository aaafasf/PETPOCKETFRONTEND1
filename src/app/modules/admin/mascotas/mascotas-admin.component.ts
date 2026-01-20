import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MascotaService } from '../../../core/services/mascota.service';
import { CatalogosService } from '../../../core/services/catalogos.service';

interface Mascota {
  idMascota?: number;
  nombreMascota: string;
  especie: string;
  raza?: string;
  edad?: number;
  sexo?: string;
  idPropietario: number | null;
  propietario?: { nombre: string; email: string };
  pesoKg?: number;
  color?: string;
  alergias?: string[];
  esterilizado?: boolean;
  observaciones?: string;
}

@Component({
  selector: 'app-mascotas-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mascotas-admin.component.html',
  styleUrls: ['./mascotas-admin.component.css']
})
export class MascotasAdminComponent implements OnInit {

  mascotas: Mascota[] = [];
  filteredMascotas: Mascota[] = [];

  propietarios: any[] = [];
  especies: any[] = [];
  razas: any[] = [];
  sexos: any[] = [];
  colores: any[] = [];

  loading = false;
  searchTerm = '';

  editando = false;
  mascotaEditando: Mascota | null = null;

  nuevaMascota: Mascota = this.getMascotaVacia();

  constructor(
    private http: HttpClient,
    private mascotaService: MascotaService,
    private catalogos: CatalogosService,
    private cdr: ChangeDetectorRef
  ) {}

  // =========================
  // CICLO DE VIDA
  // =========================
  ngOnInit(): void {
    this.cargarMascotas();
    this.cargarPropietarios();
    this.cargarCatalogos();
  }

  // =========================
  // CARGAS INICIALES
  // =========================
  cargarMascotas(): void {
    this.loading = true;
    this.mascotaService.getAll().subscribe({
      next: data => {
        // Normalize backend response to ensure pesoKg and color are top-level
        const normalized = (data as any[] || []).map(d => ({
          idMascota: d.idMascota,
          nombreMascota: d.nombreMascota || d.nombre,
          especie: d.especie,
          raza: d.raza || d.detallesMongo?.razaDetallada || '',
          edad: d.edad ?? d.detallesMongo?.edad ?? undefined,
          sexo: d.sexo,
          idPropietario: d.idPropietario ?? d.idCliente ?? null,
          pesoKg: d.pesoKg ?? d.detallesMongo?.pesoKg ?? undefined,
          color: d.color ?? d.detallesMongo?.color ?? '',
          propietario: d.propietario || (d.nombreCliente ? { nombre: d.nombreCliente } : undefined),
          observaciones: d.observaciones ?? d.detallesMongo?.observaciones ?? ''
        }));

        this.mascotas = normalized;
        this.filteredMascotas = [...normalized];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error al cargar mascotas:', err);
        this.loading = false;
      }
    });
  }

  cargarPropietarios(): void {
    this.http.get<any[]>('http://localhost:3000/api/cliente/lista').subscribe({
      next: data => {
        // Normalize backend `cliente` shape to `propietario` shape expected by this component
        this.propietarios = (data || []).map(p => ({
          idPropietario: p.idClientes ?? p.idCliente ?? p.id,
          nombrePropietario: p.nombreCliente ?? p.nombre
        }));
        this.cdr.detectChanges();
      },
      error: err => console.error('Error al cargar propietarios:', err)
    });
  }

  cargarCatalogos(): void {
    this.catalogos.getEspecies().subscribe(d => this.especies = d.filter(e => e.activo));
    this.catalogos.getSexos().subscribe(d => this.sexos = d.filter(s => s.activo));
    this.catalogos.getColores().subscribe(d => this.colores = d.filter(c => c.activo));
  }

  onEspecieChange(idEspecie: string): void {
    if (!idEspecie) {
      this.razas = [];
      return;
    }

    this.catalogos.getRazas().subscribe(data => {
      this.razas = data.filter(
        r => r.activo && r.idEspecie === Number(idEspecie)
      );
    });
  }

  // =========================
  // CREAR MASCOTA
  // =========================
  agregarMascota(): void {
    if (
      !this.nuevaMascota.nombreMascota ||
      !this.nuevaMascota.especie ||
      this.nuevaMascota.idPropietario == null
    ) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    const payload: Partial<Mascota> = {
      nombreMascota: this.nuevaMascota.nombreMascota,
      especie: this.nuevaMascota.especie,
      raza: this.nuevaMascota.raza || undefined,  
      edad: this.nuevaMascota.edad,
      sexo: this.nuevaMascota.sexo || undefined, 
      idPropietario: Number(this.nuevaMascota.idPropietario)
    };
    // include optional fields (use inline casts to avoid template/type narrowing issues)
    if ((this.nuevaMascota as any).pesoKg !== undefined) payload.pesoKg = (this.nuevaMascota as any).pesoKg;
    if ((this.nuevaMascota as any).color) payload.color = (this.nuevaMascota as any).color;
    if ((this.nuevaMascota as any).observaciones) payload.observaciones = (this.nuevaMascota as any).observaciones;
    if ((this.nuevaMascota as any).esterilizado !== undefined) payload.esterilizado = (this.nuevaMascota as any).esterilizado;

    this.loading = true;
    this.mascotaService.create(payload).subscribe({
      next: () => {
        alert('Mascota creada exitosamente');
        this.resetNuevaMascota();
        this.cargarMascotas();
        this.loading = false;
      },
      error: err => {
        console.error('Error al crear mascota:', err);
        alert('Error al crear mascota');
        this.loading = false;
      }
    });
  }

  resetNuevaMascota(): void {
    this.nuevaMascota = this.getMascotaVacia();
  }

  // =========================
  // EDICIÓN
  // =========================
editarMascota(mascota: Mascota): void {
  this.editando = true;

  // Clonamos la mascota y aseguramos valores por defecto
  this.mascotaEditando = { 
    ...mascota,
    pesoKg: mascota.pesoKg ?? 0,
    color: mascota.color || '',
    edad: mascota.edad ?? 0,
    raza: mascota.raza ?? '',     // importante para dropdown
  };

  if (mascota.especie) {
    this.onEspecieChange(mascota.especie);
  }
}


guardarEdicion(): void {
  if (!this.mascotaEditando) return;

  const payload = {
    nombreMascota: this.mascotaEditando.nombreMascota,
    especie: this.mascotaEditando.especie,
    raza: this.mascotaEditando.raza || undefined,
    edad: this.mascotaEditando.edad ?? 0,
    sexo: this.mascotaEditando.sexo || undefined,
    pesoKg: this.mascotaEditando.pesoKg ?? 0,
    color: this.mascotaEditando.color || '',
    idPropietario: Number(this.mascotaEditando.idPropietario)
  };

  this.loading = true;
  this.mascotaService
    .update(this.mascotaEditando.idMascota!, payload)
    .subscribe({
      next: () => {
        alert('Mascota actualizada exitosamente');
        this.editando = false;
        this.mascotaEditando = null;
        this.cargarMascotas();
        this.loading = false;
      },
      error: err => {
        console.error('Error al actualizar mascota:', err);
        alert('Error al actualizar mascota');
        this.loading = false;
      }
    });
}



  cancelarEdicion(): void {
    this.editando = false;
    this.mascotaEditando = null;
  }

  // =========================
  // ELIMINAR
  // =========================
  eliminarMascota(id?: number): void {
    if (!id) return;
    if (!confirm('¿Estás seguro de que deseas eliminar esta mascota?')) return;

    this.loading = true;
    this.mascotaService.delete(id).subscribe({
      next: () => {
        alert('Mascota eliminada exitosamente');
        this.cargarMascotas();
        this.loading = false;
      },
      error: err => {
        console.error('Error al eliminar mascota:', err);
        alert('Error al eliminar mascota');
        this.loading = false;
      }
    });
  }

  // =========================
  // BUSCADOR
  // =========================
  buscar(): void {
    if (!this.searchTerm) {
      this.filteredMascotas = this.mascotas;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredMascotas = this.mascotas.filter(m =>
      m.nombreMascota.toLowerCase().includes(term) ||
      this.getNombrePropietario(m.idPropietario!).toLowerCase().includes(term)
    );
  }

  // =========================
  // HELPERS
  // =========================
  getNombrePropietario(id: number | null): string {
  if (id == null) return 'Sin propietario';

  const p = this.propietarios.find(
    x => x.idPropietario === id || x.id === id
  );
  return p ? (p.nombrePropietario || p.nombre) : 'Desconocido';
}
getColor(mascota: any): string {
  return mascota.color || '-';
}

getPeso(mascota: any): string {
  return mascota.pesoKg != null ? mascota.pesoKg + ' kg' : '-';
} 


  getNombreEspecie(idEspecie: any): string {
  const especie = this.especies.find(e => e.idEspecie == idEspecie);
  return especie ? especie.nombreEspecie || especie.nombre : 'Desconocido';
}

getNombreRaza(idRaza: any): string {
  const raza = this.razas.find(r => r.idRaza == idRaza);
  return raza ? raza.nombreRaza || raza.nombre : '-';
}

  private getMascotaVacia(): Mascota {
    return {
      nombreMascota: '',
      especie: '',
      raza: '',
      edad: undefined,
      sexo: '',
      idPropietario: null,
      pesoKg: undefined,
      color: '',
      alergias: [],
      esterilizado: false,
      observaciones: ''
    };
  }
}