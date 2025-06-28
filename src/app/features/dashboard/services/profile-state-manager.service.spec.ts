import { TestBed } from '@angular/core/testing';

import { ProfileStateManagerService } from './profile-state-manager.service';

describe('ProfileStateManagerService', () => {
  let service: ProfileStateManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfileStateManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
