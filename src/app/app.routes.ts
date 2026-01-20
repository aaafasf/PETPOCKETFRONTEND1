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
import { serviciosResolver } from './core/resolvers/servicios.resolver';

// ===================
// IMPORTS ADMIN - LAYOUT & USERS
// ===================
import { AdminLayoutComponent } from './modules/admin/layout/admin-layout.component';
import { CreateUserPage } from './modules/admin/user/pages/create-user/create-user';
import { UserListPage } from './modules/admin/user/pages/user-list/user-list.page';
import { ResetPasswordPage } from './modules/admin/user/pages/reset-password/reset-password.page';


export const routes: Routes = [
  // ===================
  // REDIRECCIÓN INICIAL
  // ===================
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // ===================
  // DASHBOARD
  // ===================
  { path: 'dashboard', component: DashboardComponent },

  // ===================
  // AUTH
  // ===================
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/forgot-password', component: ForgotPasswordComponent },
  { path: 'auth/reset-password', component: ResetPasswordComponent },

  // ===================
  // PETS
  // ===================
  { path: 'pets/register', component: RegisterPetComponent },
  { path: 'pets/my', component: MyPetsComponent },

  // ===================
  // APPOINTMENTS
  // ===================
  { path: 'appointments', component: AppointmentsComponent },
  { path: 'appointments/mis-citas', component: MisCitasComponent },

  // ===================
  // ADMIN NOTIFICATIONS
  // ===================
  { path: 'notifications', component: NotificationsComponent },

  // ===================
  // ADMIN ROUTES WITH LAYOUT
  // ===================
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./modules/admin/dashboard/dashboard-admin.component')
            .then(m => m.DashboardAdminComponent),
        resolve: {
          servicios: serviciosResolver
        }
      },

      // Servicios
      {
        path: 'servicios',
        loadComponent: () =>
          import('./modules/admin/servicios/servicios.component')
            .then(m => m.ServiciosComponent),
      },

      // Mascotas (Admin)
      {
        path: 'mascotas',
        loadComponent: () =>
          import('./modules/admin/mascotas/mascotas-admin.component')
            .then(m => m.MascotasAdminComponent),
      },

      // Catalogos
      {
        path: 'catalogos',
        loadComponent: () =>
          import('./modules/admin/catalogos/catalogos.component')
            .then(m => m.CatalogosComponent),
      },

      // Configuración
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./modules/admin/configuracion/configuracion.component')
            .then(m => m.ConfiguracionComponent),
      },

      // Planner
      {
        path: 'planner',
        loadComponent: () =>
          import('./modules/admin/planner/planner')
            .then(m => m.Planner),
      },

      {
      path: 'notifications',
      loadChildren: () =>
        import('./modules/admin/notifications/notifications-routing-module')
          .then(m => m.NotificationsRoutingModule),
    },
      // Agenda
      {
        path: 'agenda',
        loadComponent: () =>
          import('./modules/admin/agenda/agenda')
            .then(m => m.Agenda),
      },

      // Expedientes
      {
        path: 'expedientes',
        loadComponent: () =>
          import('./modules/admin/expedientes/expedientes.component')
            .then(m => m.ExpedientesComponent),
      },

      // Users
      { path: 'users', component: UserListPage },
      { path: 'users/create', component: CreateUserPage },
      { path: 'users/reset-password/:id', component: ResetPasswordPage },

      // Redirección por defecto en admin
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
