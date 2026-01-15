  import { ApplicationConfig, LOCALE_ID } from '@angular/core';
  import { provideRouter,withRouterConfig } from '@angular/router';
  import { provideHttpClient } from '@angular/common/http';
  import { routes } from './app.routes'; 

  export const appConfig: ApplicationConfig = {
    providers: [
      provideRouter(routes,
      withRouterConfig({ onSameUrlNavigation: 'reload' })
      ),
      provideHttpClient(), // Sin withFetch() para mejor compatibilidad con CORS
      { provide: LOCALE_ID, useValue: 'es' }
    ]
  };
