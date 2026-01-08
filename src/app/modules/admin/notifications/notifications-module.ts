import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NotificationsRoutingModule } from './notifications-routing-module';
import { ListComponent } from './list/list';
import { FormComponent } from './form/form';

// Importar PrimeNG modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { TextareaModule } from 'primeng/textarea';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NotificationsRoutingModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    CardModule,
    TextareaModule,
    ListComponent,
    FormComponent
  ]
})
export class NotificationsModule { }
