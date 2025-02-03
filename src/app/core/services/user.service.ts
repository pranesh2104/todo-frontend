import { inject, Injectable } from '@angular/core';
import { GET_ACCESS_TOKEN, GET_ALL_USER, GET_CURRENT_USER } from '@core/graphql/user.query';
import { GraphqlClientService } from '@shared/services/graphql-client.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private graphqlClientService = inject(GraphqlClientService);

  constructor() { }

  getAllUsers() {
    return this.graphqlClientService.executeQuery(GET_ALL_USER, {});
  }

  getCurrentUser() {
    return this.graphqlClientService.executeQuery(GET_CURRENT_USER, {});
  }

  getAccessToken() {
    return this.graphqlClientService.executeMutation(GET_ACCESS_TOKEN, {})
  }
}
