import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ServicioService } from '../services/servicio.service';

export const serviciosResolver: ResolveFn<any[]> = () => {
  const servicioService = inject(ServicioService);
  return servicioService.listarAdmin();
};  