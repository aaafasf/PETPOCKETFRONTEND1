import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NotificacionesService, Notificacion, CrearNotificacionRequest } from '../../core/services/notificaciones.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit, OnDestroy {
  // Read: Lista de notificaciones
  notificaciones: Notificacion[] = [];
  notificacionesFiltradas: Notificacion[] = [];
  notificacionSeleccionada: Notificacion | null = null;
  mostrarModal: boolean = false;
  filtroLeidas: 'todas' | 'leidas' | 'no-leidas' = 'todas';
  
  // Create: Formulario para nueva alerta
  nuevaAlerta: CrearNotificacionRequest = {
    titulo: '',
    mensaje: '',
    tipo: 'recordatorio',
    fechaProgramada: undefined
  };

  // Estados de carga y error
  cargando: boolean = false;
  cargandoInicial: boolean = false; // Estado separado para carga inicial
  error: string | null = null;
  errorDetalle: any = null;
  timeoutCarga: any = null;

  // Tipos disponibles
  tiposNotificacion: Array<{ value: 'vacuna' | 'control' | 'recordatorio' | 'general', label: string }> = [
    { value: 'vacuna', label: 'Vacuna' },
    { value: 'control', label: 'Control' },
    { value: 'recordatorio', label: 'Recordatorio' },
    { value: 'general', label: 'General' }
  ];

  constructor(
    private notificacionesService: NotificacionesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('🚀 Inicializando componente de notificaciones');
    console.log('🔗 URL del servicio:', 'http://localhost:3000/notificaciones');
    this.cargarNotificaciones();
  }
  
  ngOnDestroy(): void {
    // Limpiar timeout si el componente se destruye
    if (this.timeoutCarga) {
      clearTimeout(this.timeoutCarga);
    }
  }

  // ==================== READ (Consultas) ====================

  cargarNotificaciones(): void {
    // Usar cargandoInicial solo si es la primera carga (cuando no hay notificaciones aún)
    const esCargaInicial = this.notificaciones.length === 0;
    
    if (esCargaInicial) {
      this.cargandoInicial = true;
    } else {
      this.cargando = true;
    }
    
    this.error = null;
    this.errorDetalle = null;
    
    // Limpiar timeout anterior si existe
    if (this.timeoutCarga) {
      clearTimeout(this.timeoutCarga);
    }
    
    // Timeout de seguridad (10 segundos)
    this.timeoutCarga = setTimeout(() => {
      if (this.cargando || this.cargandoInicial) {
        if (esCargaInicial) {
          this.cargandoInicial = false;
        } else {
          this.cargando = false;
        }
        this.error = 'El servidor está tardando demasiado en responder. Verifica la conexión.';
        this.errorDetalle = { status: 'TIMEOUT', message: 'Timeout después de 10 segundos' };
        alert('⚠️ Error de conexión\n\nEl servidor no responde. Verifica que:\n- El backend esté corriendo en http://localhost:3000\n- La ruta /notificaciones/lista exista\n- No haya problemas de red');
        this.notificaciones = [];
        this.notificacionesFiltradas = [];
      }
    }, 10000);
    
    console.log('🔄 Cargando notificaciones desde: http://localhost:3000/notificaciones/lista');
    
    this.notificacionesService.obtenerTodasNotificaciones().subscribe({
      next: (notificaciones) => {
        // Limpiar timeout
        if (this.timeoutCarga) {
          clearTimeout(this.timeoutCarga);
          this.timeoutCarga = null;
        }
        
        console.log('✅ Notificaciones cargadas:', notificaciones);
        
        // Verificar si es un array
        if (Array.isArray(notificaciones)) {
          this.notificaciones = notificaciones.map(n => {
            // Mapear ID
            const idFinal = n.id || n.idNotificacion;
            
            // Mapear fecha - intentar múltiples formatos
            let fechaMapeada: Date | undefined;
            if (n.fecha) {
              try {
                fechaMapeada = new Date(n.fecha);
                if (isNaN(fechaMapeada.getTime())) {
                  console.warn('⚠️ Fecha inválida en campo fecha:', n.fecha);
                  fechaMapeada = undefined;
                }
              } catch (e) {
                console.warn('⚠️ Error al parsear fecha:', n.fecha, e);
                fechaMapeada = undefined;
              }
            }
            
            // Si no hay fecha válida, intentar con createNotificacion
            if (!fechaMapeada && n.createNotificacion) {
              try {
                fechaMapeada = new Date(n.createNotificacion);
                if (isNaN(fechaMapeada.getTime())) {
                  fechaMapeada = undefined;
                }
              } catch (e) {
                console.warn('⚠️ Error al parsear createNotificacion:', n.createNotificacion, e);
              }
            }
            
            // Si aún no hay fecha válida, usar fecha actual
            if (!fechaMapeada) {
              fechaMapeada = new Date();
            }
            
            // Mapear fechaProgramada si existe
            let fechaProgramadaMapeada: Date | undefined;
            if (n.fechaProgramada) {
              try {
                fechaProgramadaMapeada = new Date(n.fechaProgramada);
                if (isNaN(fechaProgramadaMapeada.getTime())) {
                  fechaProgramadaMapeada = undefined;
                }
              } catch (e) {
                console.warn('⚠️ Error al parsear fechaProgramada:', n.fechaProgramada, e);
              }
            }
            
            return {
              ...n,
              id: idFinal,
              idNotificacion: n.idNotificacion || idFinal,
              fecha: fechaMapeada,
              fechaProgramada: fechaProgramadaMapeada
            };
          });
          this.aplicarFiltro();
          
          // Actualizar el estado de carga correcto
          if (esCargaInicial) {
            this.cargandoInicial = false;
          } else {
            this.cargando = false;
          }
          
          // Forzar detección de cambios
          this.cdr.detectChanges();
          console.log('✅ Notificaciones filtradas:', this.notificacionesFiltradas.length);
        } else {
          console.warn('⚠️ Respuesta no es un array:', notificaciones);
        this.notificaciones = [];
        this.notificacionesFiltradas = [];
        
        // Actualizar el estado de carga correcto
        if (esCargaInicial) {
          this.cargandoInicial = false;
        } else {
          this.cargando = false;
        }
        
        this.error = 'El servidor devolvió un formato inesperado.';
        this.cdr.detectChanges();
        }
      },
      error: (err) => {
        // Limpiar timeout
        if (this.timeoutCarga) {
          clearTimeout(this.timeoutCarga);
          this.timeoutCarga = null;
        }
        
        console.error('❌ Error al cargar notificaciones:', err);
        this.errorDetalle = err;
        
        // Determinar el tipo de error
        let mensajeError = 'Error al cargar las notificaciones.';
        let mensajeAlerta = '⚠️ Error al cargar notificaciones\n\n';
        
        if (err.status === 0 || err.status === undefined) {
          mensajeError = 'No se puede conectar con el servidor.';
          mensajeAlerta += '❌ Error de conexión\n';
          mensajeAlerta += 'El backend no está respondiendo.\n\n';
          mensajeAlerta += 'Verifica que:\n';
          mensajeAlerta += '• El servidor esté corriendo en http://localhost:3000\n';
          mensajeAlerta += '• La ruta /notificaciones/lista exista\n';
          mensajeAlerta += '• No haya errores de CORS';
        } else if (err.status === 404) {
          mensajeError = 'La ruta no existe en el servidor (404).';
          mensajeAlerta += `❌ Error 404 - Ruta no encontrada\n`;
          mensajeAlerta += `La ruta /notificaciones/lista no existe en el backend.\n\n`;
          mensajeAlerta += `Verifica que el endpoint esté configurado correctamente.`;
        } else if (err.status === 500) {
          mensajeError = 'Error interno del servidor (500).';
          mensajeAlerta += `❌ Error 500 - Error del servidor\n`;
          mensajeAlerta += `El backend tiene un error interno.\n\n`;
          mensajeAlerta += `Mensaje: ${err.error?.message || 'Error desconocido'}`;
        } else {
          mensajeError = `Error del servidor (${err.status}).`;
          mensajeAlerta += `❌ Error ${err.status}\n`;
          mensajeAlerta += `Mensaje: ${err.error?.message || err.message || 'Error desconocido'}\n\n`;
          mensajeAlerta += `Detalle: ${JSON.stringify(err.error || err, null, 2)}`;
        }
        
        this.error = mensajeError;
        
        // Actualizar el estado de carga correcto
        if (esCargaInicial) {
          this.cargandoInicial = false;
        } else {
          this.cargando = false;
        }
        
        this.notificaciones = [];
        this.notificacionesFiltradas = [];
        
        // Forzar detección de cambios
        this.cdr.detectChanges();
        
        // Mostrar alerta con detalles
        alert(mensajeAlerta);
        
        // Log completo para debugging
        console.error('Detalle completo del error:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
          message: err.message,
          url: err.url
        });
      }
    });
  }

  aplicarFiltro(): void {
    // Asegurar que los arrays estén inicializados
    if (!Array.isArray(this.notificaciones)) {
      this.notificaciones = [];
    }
    
    if (!Array.isArray(this.notificacionesFiltradas)) {
      this.notificacionesFiltradas = [];
    }
    
    // Aplicar filtro según el tipo seleccionado
    if (this.filtroLeidas === 'todas') {
      this.notificacionesFiltradas = [...this.notificaciones];
    } else if (this.filtroLeidas === 'leidas') {
      this.notificacionesFiltradas = this.notificaciones.filter(n => n.leida === true);
    } else if (this.filtroLeidas === 'no-leidas') {
      this.notificacionesFiltradas = this.notificaciones.filter(n => n.leida === false || !n.leida);
    } else {
      // Por defecto, mostrar todas
      this.notificacionesFiltradas = [...this.notificaciones];
    }
    
    // Ordenar por fecha (más recientes primero)
    this.notificacionesFiltradas.sort((a, b) => {
      const fechaA = new Date(a.fecha || 0).getTime();
      const fechaB = new Date(b.fecha || 0).getTime();
      return fechaB - fechaA;
    });
    
    console.log('🔍 Filtro aplicado:', this.filtroLeidas, '- Total filtradas:', this.notificacionesFiltradas.length);
  }

  cambiarFiltro(tipo: 'todas' | 'leidas' | 'no-leidas'): void {
    this.filtroLeidas = tipo;
    this.aplicarFiltro();
  }

  // ==================== CREATE (Crear) ====================

  agregarAlerta(): void {
    if (!this.nuevaAlerta.titulo || !this.nuevaAlerta.mensaje) {
      this.error = 'Por favor, completa todos los campos.';
      alert('⚠️ Campos incompletos\n\nPor favor, completa el título y el mensaje.');
      return;
    }

    this.cargando = true;
    this.error = null;
    this.errorDetalle = null;

    const datos: CrearNotificacionRequest = {
      ...this.nuevaAlerta,
      fechaProgramada: this.nuevaAlerta.fechaProgramada || undefined
    };

    console.log('📤 Creando notificación con datos:', datos);

    this.notificacionesService.crearNotificacion(datos).subscribe({
      next: (response: any) => {
        console.log('✅ Respuesta del backend:', response);
        
        // El backend puede devolver { success: true, data: {...} } o directamente el objeto
        let notificacionData: any;
        if (response && response.success && response.data) {
          // Respuesta envuelta
          notificacionData = response.data;
          console.log('✅ Notificación creada (datos extraídos):', notificacionData);
        } else {
          // Respuesta directa
          notificacionData = response;
          console.log('✅ Notificación creada (respuesta directa):', notificacionData);
        }
        
        // Mostrar alerta de éxito
        window.alert('✅ ¡Notificación creada exitosamente!');
        
        // Crear el objeto de notificación completo combinando datos del backend y del formulario
        const nueva: Notificacion = {
          id: notificacionData.idNotificacion || notificacionData.id,
          titulo: datos.titulo,
          mensaje: datos.mensaje,
          tipo: datos.tipo,
          fecha: new Date(),
          leida: false,
          fechaProgramada: datos.fechaProgramada ? new Date(datos.fechaProgramada) : undefined,
          idUsuario: notificacionData.usuarioId || notificacionData.idUsuario,
          idMascota: datos.idMascota
        };
        
        console.log('✅ Notificación formateada para agregar:', nueva);
        
        // Agregar la nueva notificación al inicio de la lista
        this.notificaciones.unshift(nueva);
        this.aplicarFiltro();
        
        // Recargar la lista completa para asegurarse de tener todos los datos actualizados
        setTimeout(() => {
          this.cargarNotificaciones();
        }, 500);
        
        // Limpiar formulario
        this.nuevaAlerta = {
          titulo: '',
          mensaje: '',
          tipo: 'recordatorio',
          fechaProgramada: undefined
        };
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error al crear notificación:', err);
        this.errorDetalle = err;
        
        let mensajeAlerta = '❌ Error al crear notificación\n\n';
        
        if (err.status === 0 || err.status === undefined) {
          mensajeAlerta += 'No se puede conectar con el servidor.\n';
          mensajeAlerta += 'Verifica que el backend esté corriendo.';
        } else if (err.status === 404) {
          mensajeAlerta += 'La ruta /notificaciones/crear no existe (404).';
        } else if (err.status === 500) {
          mensajeAlerta += `Error del servidor: ${err.error?.message || 'Error interno'}`;
        } else {
          mensajeAlerta += `Error ${err.status}: ${err.error?.message || err.message || 'Error desconocido'}`;
        }
        
        this.error = 'Error al crear la notificación. Ver detalles en la consola.';
        this.cargando = false;
        alert(mensajeAlerta);
        
        console.error('Detalle completo del error:', err);
      }
    });
  }

  // ==================== READ (Ver Detalle) ====================

  abrirModal(notificacion: Notificacion): void {
    console.log('📂 Abriendo modal para notificación:', notificacion);
    console.log('📂 ID original:', notificacion.id);
    console.log('📂 idNotificacion original:', notificacion.idNotificacion);
    
    // MAPEAR idNotificacion a id SIEMPRE - asegurar que ambos campos tengan el valor
    const idFinal = notificacion.id || notificacion.idNotificacion;
    this.notificacionSeleccionada = { 
      ...notificacion,
      id: idFinal,
      idNotificacion: notificacion.idNotificacion || idFinal
    };
    
    console.log('📂 Notificación seleccionada después del mapeo:', this.notificacionSeleccionada);
    console.log('📂 ID final mapeado:', this.notificacionSeleccionada.id);
    console.log('📂 idNotificacion final:', this.notificacionSeleccionada.idNotificacion);
    
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.notificacionSeleccionada = null;
  }

  // ==================== UPDATE (Actualizar) ====================

  marcarComoLeida(id?: number): void {
    // Buscar ID en múltiples lugares - SIEMPRE incluir idNotificacion
    const idNotificacion = id || 
                          this.notificacionSeleccionada?.id || 
                          this.notificacionSeleccionada?.idNotificacion;
    
    if (!idNotificacion) {
      console.error('❌ No se pudo obtener el ID de la notificación');
      console.error('ID recibido como parámetro:', id);
      console.error('notificacionSeleccionada.id:', this.notificacionSeleccionada?.id);
      console.error('notificacionSeleccionada.idNotificacion:', this.notificacionSeleccionada?.idNotificacion);
      console.error('Notificación completa:', this.notificacionSeleccionada);
      alert('❌ Error: No se pudo identificar la notificación');
      return;
    }

    this.cargando = true;
    console.log('📤 Marcando notificación como leída con ID:', idNotificacion);
    
    this.notificacionesService.marcarComoLeida(idNotificacion).subscribe({
      next: () => {
        console.log('✅ Notificación marcada como leída');
        
        // Actualizar en la lista local - buscar por id O idNotificacion
        const noti = this.notificaciones.find(n => 
          (n.id && n.id === idNotificacion) || 
          (n.idNotificacion && n.idNotificacion === idNotificacion)
        );
        if (noti) {
          noti.leida = true;
          console.log('✅ Notificación actualizada en lista local');
        } else {
          console.warn('⚠️ No se encontró la notificación en la lista para actualizar');
        }
        
        if (this.notificacionSeleccionada) {
          const tieneIdCorrecto = (this.notificacionSeleccionada.id && this.notificacionSeleccionada.id === idNotificacion) ||
                                  (this.notificacionSeleccionada.idNotificacion && this.notificacionSeleccionada.idNotificacion === idNotificacion);
          if (tieneIdCorrecto) {
            this.notificacionSeleccionada.leida = true;
            console.log('✅ Notificación seleccionada actualizada');
          }
        }
        
        // Aplicar filtro para actualizar la lista filtrada
        this.aplicarFiltro();
        this.cdr.detectChanges();
        this.cargando = false;
        
        // Mostrar mensaje de éxito
        window.alert('✅ Notificación marcada como leída');
        
        // Cerrar el modal si está abierto
        if (this.mostrarModal) {
          this.cerrarModal();
        }
      },
      error: (err) => {
        console.error('❌ Error al marcar como leída:', err);
        this.errorDetalle = err;
        this.cargando = false;
        
        let mensajeAlerta = '❌ Error al marcar como leída\n\n';
        if (err.status === 0 || err.status === undefined) {
          mensajeAlerta += 'No se puede conectar con el servidor.';
        } else {
          mensajeAlerta += `Error ${err.status}: ${err.error?.message || err.message || 'Error desconocido'}`;
        }
        
        this.error = 'Error al marcar como leída.';
        alert(mensajeAlerta);
        console.error('Detalle completo del error:', err);
      }
    });
  }

  // ==================== DELETE (Eliminar) ====================

  limpiarHistorial(): void {
    console.log('🔥🔥🔥 LIMPIAR HISTORIAL - INICIO 🔥🔥🔥');
    
    // Contar cuántas leídas hay
    const cantidadLeidas = this.notificaciones.filter(n => n.leida).length;
    console.log('🔥 Notificaciones leídas encontradas:', cantidadLeidas);
    
    if (cantidadLeidas === 0) {
      console.log('ℹ️ No hay notificaciones leídas para limpiar');
      return;
    }

    console.log('✅ Limpiando inmediatamente...');
    console.log('🔥 Total antes:', this.notificaciones.length);
    
    // ELIMINAR INMEDIATAMENTE DE LA LISTA LOCAL
    const antes = this.notificaciones.length;
    this.notificaciones = this.notificaciones.filter(n => !n.leida);
    const despues = this.notificaciones.length;
    
    console.log('🔥 Total después:', despues);
    console.log('🔥 Eliminadas:', antes - despues);
    
    // Actualizar lista filtrada
    this.aplicarFiltro();
    console.log('🔥 Filtro aplicado');
    
    // Cerrar modal
    this.cerrarModal();
    console.log('🔥 Modal cerrado');
    
    // Forzar actualización de la vista
    this.cdr.detectChanges();
    console.log('🔥 Vista actualizada');
    
    // Intentar limpiar en el backend (en segundo plano)
    this.notificacionesService.limpiarHistorial().subscribe({
      next: () => {
        console.log('✅ Historial limpiado en el backend');
      },
      error: (err) => {
        console.error('⚠️ Error al limpiar en el backend:', err);
        // Recargar desde backend para sincronizar
        setTimeout(() => {
          this.cargarNotificaciones();
        }, 1000);
      }
    });
    
    console.log('✅✅✅ LIMPIAR HISTORIAL - COMPLETADO ✅✅✅');
  }

  eliminarNotificacion(id?: number): void {
    console.log('🔥🔥🔥 ELIMINAR - INICIO 🔥🔥🔥');
    
    // Obtener ID de la notificación seleccionada
    if (!this.notificacionSeleccionada) {
      console.error('❌ No hay notificación seleccionada');
      return;
    }

    // Buscar ID en múltiples lugares
    const idNotificacion = id || 
                          this.notificacionSeleccionada?.id || 
                          this.notificacionSeleccionada?.idNotificacion;
    
    console.log('🔥 ID a eliminar:', idNotificacion);
    
    if (!idNotificacion) {
      console.error('❌ No se pudo obtener el ID');
      return;
    }

    console.log('✅ Eliminando inmediatamente...');
    console.log('🔥 Total antes:', this.notificaciones.length);

    // ELIMINAR INMEDIATAMENTE DE LA LISTA LOCAL
    const antes = this.notificaciones.length;
    this.notificaciones = this.notificaciones.filter(n => {
      const coincideId = (n.id && n.id === idNotificacion);
      const coincideIdNotif = (n.idNotificacion && n.idNotificacion === idNotificacion);
      const mantener = !coincideId && !coincideIdNotif;
      if (!mantener) {
        console.log('🗑️ Eliminando notificación:', n);
      }
      return mantener;
    });
    const despues = this.notificaciones.length;
    
    console.log('🔥 Total después:', despues);
    console.log('🔥 Eliminadas:', antes - despues);
    
    // Actualizar lista filtrada
    this.aplicarFiltro();
    console.log('🔥 Filtro aplicado');
    
    // Cerrar modal
    this.cerrarModal();
    console.log('🔥 Modal cerrado');
    
    // Forzar actualización de la vista
    this.cdr.detectChanges();
    console.log('🔥 Vista actualizada');
    
    // Intentar eliminar en el backend (en segundo plano)
    this.notificacionesService.eliminarNotificacion(idNotificacion).subscribe({
      next: () => {
        console.log('✅ Notificación eliminada en el backend');
      },
      error: (err) => {
        console.error('⚠️ Error al eliminar en el backend:', err);
        // Recargar desde backend para sincronizar
        setTimeout(() => {
          this.cargarNotificaciones();
        }, 1000);
      }
    });
    
    console.log('✅✅✅ ELIMINAR - COMPLETADO ✅✅✅');
  }

  // ==================== UTILIDADES ====================

  formatearFecha(fecha: Date | string | undefined): string {
    if (!fecha) return 'Sin fecha';
    
    try {
      // Intentar crear la fecha
      let date: Date;
      if (typeof fecha === 'string') {
        // Si es string, intentar parsearlo
        date = new Date(fecha);
      } else if (fecha instanceof Date) {
        date = fecha;
      } else {
        return 'Sin fecha';
      }
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        console.warn('⚠️ Fecha inválida recibida:', fecha);
        return 'Fecha inválida';
      }
      
      // Formatear la fecha
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('❌ Error al formatear fecha:', error, 'Fecha original:', fecha);
      return 'Fecha inválida';
    }
  }

  obtenerTipoLabel(tipo: string | undefined): string {
    if (!tipo) return 'General';
    const tipoEncontrado = this.tiposNotificacion.find(t => t.value === tipo);
    return tipoEncontrado ? tipoEncontrado.label : tipo;
  }

  contarNoLeidas(): number {
    return this.notificaciones.filter(n => !n.leida).length;
  }

  mostrarDetalleError(): void {
    if (this.errorDetalle) {
      const detalle = JSON.stringify(this.errorDetalle, null, 2);
      window.alert(`Detalle del error:\n\n${detalle}`);
    }
  }
}