import { TestBed } from '@angular/core/testing';

import { GraphqlClientService } from './graphql-client.service';

describe('GraphqlClientService', () => {
  let service: GraphqlClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraphqlClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
