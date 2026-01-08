import { Routes } from '@angular/router';

// ===================
// IMPORTS BASE
// ===================
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { RegisterPetComponent } from './modules/pets/register-pet/register-pet.component';
import { ForgotPasswordComponent } from './modules/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './modules/auth/reset-password/reset-password.component';
import { LoginComponent } from './modules/auth/login/login.component';
import { RegisterComponent } from './modules/auth/register/register.component';
import { AppointmentsComponent } from './modules/appointments/appointments.component';
import { NotificationsComponent } from './modules/notifications/notifications.component';
import { Planner } from './modules/admin/planner/planner';
import { Agenda } from './modules/admin/agenda/agenda';

// ===================
// ADMIN - USER (CLEAN)
// ===================
import { CreateUserPage } from './modules/admin/user/pages/create-user/create-user';
import { UserListPage } from './modules/admin/user/pages/user-list/user-list.page';
import { ResetPasswordPage } from './modules/admin/user/pages/reset-password/reset-password.page';


export const routes: Routes = [

  // ===================
  // BASE
  // ===================
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },

  // ===================
  // AUTH
  // ===================
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
    ],
  },

  // ===================
  // PETS
  // ===================
  {
    path: 'pets',
    children: [
      { path: 'register', component: RegisterPetComponent },
    ],
  },

  // ===================
  // OTRAS
  // ===================
  {
    path: 'appointments',
    component: AppointmentsComponent,
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
  },

  


  // ===================
  // ADMIN - USERS ✅ (AQUÍ VA EL SIDEBAR)
  // ===================
  {
    path: 'admin/users',
    children: [
      { path: '', component: UserListPage },               // /admin/users
      { path: 'create', component: CreateUserPage },       // /admin/users/create
      { path: 'reset-password/:id', component: ResetPasswordPage }, // /admin/users/reset-password
    ],
  },

  // ===================
  // ADMIN (YA EXISTENTE)
  // ===================
  {
    path: 'admin/dashboard',
    loadComponent: () =>
      import('./modules/admin/dashboard/dashboard-admin.component')
        .then(m => m.DashboardAdminComponent),
  },
  {
    path: 'admin/servicios',
    loadComponent: () =>
      import('./modules/admin/servicios/servicios.component')
        .then(m => m.ServiciosComponent),
  },
  {
    path: 'admin/configuracion',
    loadComponent: () =>
        import('./modules/admin/configuracion/configuracion.component')
            .then(m => m.ConfiguracionComponent),
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'admin/notifications',
    loadChildren: () =>
      import('./modules/admin/notifications/notifications-module')
        .then(m => m.NotificationsModule)
  },

];
