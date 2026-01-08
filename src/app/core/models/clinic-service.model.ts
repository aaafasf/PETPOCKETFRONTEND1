export interface ClinicService {
  // Coincide con tu SQL (Tabla: servicios)
  idServicio: number;        // Antes string 'id'
  nombreServicio: string;    // Antes 'name'
  precioServicio: number;    // Antes 'price'
  duracionServicio: number;  // Antes 'durationMinutes'
  color: string;            // Antes 'colorHex'
  
  // Opcionales (depende si tu tabla SQL tiene estas columnas)
  descripcion?: string;        // Si tu backend no manda color, lo puedes quitar
  activo?: boolean;         // Antes 'isActive'
}