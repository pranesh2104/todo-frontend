import { TestBed } from '@angular/core/testing';

import { GraphlqlClientService } from './graphlql-client.service';

describe('GraphlqlClientService', () => {
  let service: GraphlqlClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraphlqlClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
