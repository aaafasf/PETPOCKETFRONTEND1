import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DatePipe } from '@angular/common';
import { AppNotification } from '../../../../../core/interfaces/notification.interface';


@Component({
  selector: 'app-notification-table',
  standalone: true,
  imports: [TableModule, ButtonModule, TagModule, DatePipe],
  templateUrl: './notification-table.html',
  styleUrl: './notification-table.css',
})
export class NotificationTable {
  @Input() data: AppNotification[] = [];
  @Output() markRead = new EventEmitter<number>();
  @Output() edit = new EventEmitter<AppNotification>();
  @Output() remove = new EventEmitter<number>();

  
}
