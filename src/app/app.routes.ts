import { Routes } from '@angular/router';

// Imports actualizados a la estructura Clean (dentro de modules)
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { RegisterPetComponent } from './modules/pets/register-pet/register-pet.component';
import { ForgotPasswordComponent } from './modules/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './modules/auth/reset-password/reset-password.component';
import { LoginComponent } from './modules/auth/login/login.component';
import { RegisterComponent } from './modules/auth/register/register.component';
import { AppointmentsComponent } from './modules/appointments/appointments.component'; 
import { NotificationsComponent } from './modules/notifications/notifications.component';



export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        component: DashboardComponent
    },
    {
        path: 'auth',
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent },
            { path: 'forgot-password', component: ForgotPasswordComponent },
            { path: 'reset-password', component: ResetPasswordComponent }
        ]
    },
    {
        path: 'pets',
        children: [
            { path: 'register', component: RegisterPetComponent }
        ]
    },
    {
        path: 'appointments',
        component: AppointmentsComponent
    },
    {
        path: 'notifications',
        component: NotificationsComponent
    },

    // =====================
    // ADMIN (AGREGADO)
    // =====================
   {
    path: 'admin/dashboard',
    loadComponent: () =>
        import('./modules/admin/dashboard/dashboard-admin.component')
            .then(m => m.DashboardAdminComponent),
    runGuardsAndResolvers: 'always'  // <--- fuerza recarga siempre
},
{
    path: 'admin/servicios',
    loadComponent: () =>
        import('./modules/admin/servicios/servicios.component')
            .then(m => m.ServiciosComponent),
    runGuardsAndResolvers: 'always'
},
{
    path: 'admin/configuracion',
    loadComponent: () =>
        import('./modules/admin/configuracion/configuracion.component')
            .then(m => m.ConfiguracionComponent),
    runGuardsAndResolvers: 'always'
},


];
