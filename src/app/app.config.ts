  import { ApplicationConfig, LOCALE_ID } from '@angular/core';
  import { provideRouter,withRouterConfig } from '@angular/router';
  import { provideHttpClient } from '@angular/common/http'; // 1. Importamos el proveedor HTTP

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

  import { routes } from './app.routes';


  export const appConfig: ApplicationConfig = {
    providers: [
    providePrimeNG({theme: {preset: Aura}}),
      provideRouter(routes,
      withRouterConfig({ onSameUrlNavigation: 'reload' })
      ),
      provideHttpClient(), // 2. Habilitamos el cliente para hacer peticiones al Backend
      { provide: LOCALE_ID, useValue: 'es' } // Configurar locale en español
    ]
  };
