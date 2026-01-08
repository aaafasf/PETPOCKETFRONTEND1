import { Routes } from '@angular/router';
import { AdminInbox } from './pages/admin-inbox/admin-inbox';
import { ByClient } from './pages/by-client/by-client';
import { CreateReminder } from './pages/create-reminder/create-reminder';
import { SendCampaign } from './pages/send-campaign/send-campaign';

export const NOTIFICATIONS_ROUTES: Routes = [
  { path: 'inbox', component: AdminInbox },
  { path: 'cliente/:idUsuario', component: ByClient },
  { path: 'crear-recordatorio', component: CreateReminder },
  { path: 'campaña', component: SendCampaign },
];
