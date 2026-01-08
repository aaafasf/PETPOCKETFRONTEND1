import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup  } from '@angular/forms';
import { AppNotification } from '../../../../../core/interfaces/notification.interface';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';


@Component({
  selector: 'app-notification-form',
  standalone: true,
  imports: [ReactiveFormsModule, DatePickerModule, SelectModule, TextareaModule, ButtonModule, CommonModule, InputTextModule, CardModule],
  templateUrl: './notification-form.html',
  styleUrl: './notification-form.css',
})
export class NotificationForm {
  @Input() initial?: Partial<AppNotification>;
  @Output() submitForm = new EventEmitter<Partial<AppNotification>>();
  @Output() saved = new EventEmitter<AppNotification>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      idUsuario: [null, Validators.required],
      idMascota: [null],
      tipo: ['recordatorio', Validators.required],
      mensaje: ['', [Validators.required, Validators.minLength(5)]],
      fechaProgramada: [null],
    });
  }

  ngOnChanges() {
    if (this.initial) this.form.patchValue(this.initial);
  }

  onSubmit() {
  if (this.form.valid) {
    const value = this.form.value;
    const fechaProgramada = value.fechaProgramada ? new Date(value.fechaProgramada).toISOString() : undefined;
    this.submitForm.emit({ ...value, fechaProgramada });
    
    // limpia después de enviar
    this.form.reset({ tipo: 'recordatorio' });
  }
}

}
