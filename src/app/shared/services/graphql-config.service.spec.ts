import { TestBed } from '@angular/core/testing';

import { GraphqlConfigService } from './graphql-config.service';

describe('GraphqlConfigService', () => {
  let service: GraphqlConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraphqlConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
