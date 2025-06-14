import { TestBed } from '@angular/core/testing';

import { FormModifyService } from './form-modify.service';

describe('FormModifyService', () => {
  let service: FormModifyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormModifyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
