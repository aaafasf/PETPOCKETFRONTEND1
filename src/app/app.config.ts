import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // 1. Importamos el proveedor HTTP

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { LOCALE_ID } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeNG({theme: {preset: Aura, options: { darkModeSelector: 'none'}}}),
    provideRouter(routes),
    provideHttpClient(), // 2. Habilitamos el cliente para hacer peticiones al Backend
    { provide: LOCALE_ID, useValue: 'es' } // Configurar locale en español
  ]
};