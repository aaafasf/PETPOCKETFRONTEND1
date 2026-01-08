import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormManual } from './form-manual';

describe('FormManual', () => {
  let component: FormManual;
  let fixture: ComponentFixture<FormManual>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormManual]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormManual);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
