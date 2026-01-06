import { TestBed } from '@angular/core/testing';

import { ServicioVeterinario } from '../modules/dashboard/servicio-veterinario';

describe('ServicioVeterinario', () => {
  let service: ServicioVeterinario;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicioVeterinario);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
