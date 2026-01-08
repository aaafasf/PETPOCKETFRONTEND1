import { Component } from '@angular/core';
import { SendCampaignUseCase } from '../../../../../core/use-cases/send-campaign.usecase';
import { NotificationHttpService } from '../../../../../core/services/notification.http.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChipModule } from 'primeng/chip';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';


@Component({
  selector: 'app-send-campaign',
  standalone: true,
  imports: [ReactiveFormsModule, MultiSelectModule, TextareaModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './send-campaign.html',
  styleUrl: './send-campaign.css',
})
export class SendCampaign {

  private uc: SendCampaignUseCase;
  form: FormGroup;

  listaUsuarios: { idUser: number; nameUsers: string }[] = [
    { idUser: 1, nameUsers: 'Juan Pérez' },
    { idUser: 2, nameUsers: 'María López' },
    { idUser: 3, nameUsers: 'Carlos Sánchez' }
  ];


  constructor(
    private repo: NotificationHttpService,
    private fb: FormBuilder,
    private msg: MessageService
  ) {
    this.uc = new SendCampaignUseCase(this.repo);

    this.form = this.fb.group({
      usuarios: [[] as number[], Validators.required],
      mensaje: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  async onSubmit() {
    const { usuarios, mensaje } = this.form.value;
    const count = await this.uc.execute({ usuarios: usuarios!, mensaje: mensaje! });
    this.msg.add({ severity: 'success', summary: 'Campaña enviada', detail: `${count} notificaciones creadas` });
  }

}

