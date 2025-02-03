import { TestBed } from '@angular/core/testing';

import { ApolloConfigService } from './apollo-config.service';

describe('GraphqlConfigService', () => {
  let service: ApolloConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApolloConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
