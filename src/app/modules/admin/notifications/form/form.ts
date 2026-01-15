import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { NotificacionesService, Notificacion, CrearNotificacionRequest } from '../../../../core/services/notificaciones.service';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { RouterModule } from '@angular/router';
import { ClienteService } from '../../../../core/services/cliente.service';
import { MascotaService } from '../../../../core/services/mascota.service';


@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    DatePickerModule,
    ToastModule,
    SelectModule,
    RouterModule,
  ],
  templateUrl: './form.html',
  styleUrl: './form.css',
  providers: [MessageService]
})
export class FormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  notificationId: number | null = null;
  loading = false;

  usuarios: any[] = [];
  mascotas: any[] = [];

  tipos = [
    { label: 'Vacuna', value: 'vacuna' },
    { label: 'Control', value: 'control' },
    { label: 'Recordatorio', value: 'recordatorio' },
    { label: 'General', value: 'general' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private notificacionesService: NotificacionesService,
    private clienteService: ClienteService,
    private mascotaService: MascotaService,
    private messageService: MessageService
  ) {
    this.form = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      mensaje: ['', [Validators.required, Validators.minLength(10)]],
      tipo: ['recordatorio', Validators.required],
      idUsuario: [null],
      idMascota: [null],
      fechaProgramada: [null]
    });
  }

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarMascotas();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.notificationId = +params['id'];
        this.loadNotification(this.notificationId);
      }
    });
  }

  cargarUsuarios() {
    this.clienteService.getAll().subscribe({
      next: (usuarios: any[]) => {
        this.usuarios = usuarios.map(u => ({
          label: u.nombreCliente || u.nombre || u.email,
          value: u.idClientes || u.id
        }));
      },
      error: (error: any) => {
        console.error('Error al cargar usuarios:', error);
      }
    });
  }

  cargarMascotas() {
    this.mascotaService.getAll().subscribe({
      next: (mascotas: any[]) => {
        this.mascotas = mascotas.map(m => ({
          label: m.nombreMascota || m.nombre,
          value: m.idMascota || m.id,
          descripcion: m.especie || m.raza
        }));
      },
      error: (error: any) => {
        console.error('Error al cargar mascotas:', error);
      }
    });
  }

  loadNotification(id: number) {
    this.loading = true;
    this.notificacionesService.obtenerDetalleNotificacion(id).subscribe({
      next: (notification: Notificacion) => {
        this.form.patchValue({
          titulo: notification.titulo,
          mensaje: notification.mensaje,
          tipo: notification.tipo,
          idUsuario: notification.idUsuario,
          idMascota: notification.idMascota,
          fechaProgramada: notification.fechaProgramada ? new Date(notification.fechaProgramada) : null
        });
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading notification:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la notificación'
        });
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.loading = true;
      const formValue = this.form.value;

      if (this.isEdit && this.notificationId) {
        const notificationData: Partial<Notificacion> = {
          titulo: formValue.titulo,
          mensaje: formValue.mensaje,
          tipo: formValue.tipo,
          idUsuario: formValue.idUsuario,
          idMascota: formValue.idMascota
        };

        this.notificacionesService.actualizarNotificacion(this.notificationId, notificationData).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Notificación actualizada correctamente'
            });
            this.router.navigate(['admin/notifications/list']);
          },
          error: (error: any) => {
            console.error('Error updating notification:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo actualizar la notificación'
            });
            this.loading = false;
          }
        });
      } else {
        const notificationData: CrearNotificacionRequest = {
          titulo: formValue.titulo,
          mensaje: formValue.mensaje,
          tipo: formValue.tipo,
          idUsuario: formValue.idUsuario,
          idMascota: formValue.idMascota
        };

        this.notificacionesService.crearNotificacion(notificationData).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Notificación creada correctamente'
            });
            this.router.navigate(['admin/notifications/list']);
          },
          error: (error: any) => {
            console.error('Error creating notification:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo crear la notificación'
            });
            this.loading = false;
          }
        });
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Por favor, complete todos los campos requeridos'
      });
    }
  }

  cancel() {
    this.router.navigate(['admin/notifications/list']);
  }
}
