import { Routes } from '@angular/router';

// ===================
// IMPORTS COMPONENTES BASE
// ===================
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { RegisterPetComponent } from './modules/pets/register-pet/register-pet.component';
import { ForgotPasswordComponent } from './modules/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './modules/auth/reset-password/reset-password.component';
import { LoginComponent } from './modules/auth/login/login.component';
import { RegisterComponent } from './modules/auth/register/register.component';
import { AppointmentsComponent } from './modules/appointments/appointments.component';
import { MisCitasComponent } from './modules/appointments/mis-citas/mis-citas.component';
import { NotificationsComponent } from './modules/notifications/notifications.component';
import { MyPetsComponent } from './modules/pets/my-pets/my-pets.component';

// ===================
// IMPORTS ADMIN - USERS
// ===================
import { CreateUserPage } from './modules/admin/user/pages/create-user/create-user';
import { UserListPage } from './modules/admin/user/pages/user-list/user-list.page';
import { ResetPasswordPage } from './modules/admin/user/pages/reset-password/reset-password.page';


export const routes: Routes = [
  // ===================
  // REDIRECCIÓN INICIAL
  // ===================
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  // ===================
  // DASHBOARD
  // ===================
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
      { path: 'my', component: MyPetsComponent },
    ],
  },

  // ===================
  // APPOINTMENTS
  // ===================
  {
    path: 'appointments',
    children: [
      { path: '', component: AppointmentsComponent },
      { path: 'mis-citas', component: MisCitasComponent },
    ],
  },

  // ===================
  // ADMIN NOTIFICATIONS
  // ===================
  {
    path: 'admin/notifications',
    loadChildren: () =>
      import('./modules/admin/notifications/notifications-module')
        .then(m => m.NotificationsModule),
  },

  // ===================
  // ADMIN DASHBOARD
  // ===================
  {
    path: 'admin/users',
    children: [
      { path: '', component: UserListPage },                     // /admin/users
      { path: 'create', component: CreateUserPage },             // /admin/users/create
      { path: 'reset-password/:id', component: ResetPasswordPage }, // /admin/users/reset-password/:id
    ],
  },

  // ===================
  // ADMIN DASHBOARD
  // ===================
  {
    path: 'admin/dashboard',
    loadComponent: () =>
      import('./modules/admin/dashboard/dashboard-admin.component')
        .then(m => m.DashboardAdminComponent),
    runGuardsAndResolvers: 'always',
  },

  // ===================
  // ADMIN SERVICIOS
  // ===================
  {
    path: 'admin/servicios',
    loadComponent: () =>
      import('./modules/admin/servicios/servicios.component')
        .then(m => m.ServiciosComponent),
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'admin/catalogos',
    loadComponent: () => import('./modules/admin/catalogos/catalogos.component').then(m => m.CatalogosComponent),
  },

  // ===================
  // ADMIN CONFIGURACIÓN
  // ===================
  {
    path: 'admin/configuracion',
    loadComponent: () =>
        import('./modules/admin/configuracion/configuracion.component')
            .then(m => m.ConfiguracionComponent),
    runGuardsAndResolvers: 'always'
},
{
  path: 'admin/planner',
  loadComponent: () =>
    import('./modules/admin/planner/planner')
      .then(m => m.Planner),
},
{
  path: 'admin/agenda',
  loadComponent: () =>
    import('./modules/admin/agenda/agenda')
      .then(m => m.Agenda),
}
  

];
