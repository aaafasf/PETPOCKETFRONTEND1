import { Component, OnInit  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NotificationHttpService } from '../../../../../core/services/notification.http.service';
import { GetNotificationsUseCase } from '../../../../../core/use-cases/get-notifications.usecase';
import { NotificationTable } from '../../components/notification-table/notification-table';

@Component({
  selector: 'app-by-client',
  imports: [NotificationTable],
  templateUrl: './by-client.html',
  styleUrl: './by-client.css',
})
export class ByClient implements OnInit {
  data: any[] = [];
  idUsuario!: number;   // se declara pero se inicializa después
  private getUC!: GetNotificationsUseCase;

  constructor(
    private repo: NotificationHttpService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.idUsuario = Number(this.route.snapshot.paramMap.get('idUsuario'));
    this.getUC = new GetNotificationsUseCase(this.repo);
    this.load();
  }

  async load() {
    this.data = await this.getUC.byUser(this.idUsuario);
  }
}
