import { inject, Injectable, TransferState } from '@angular/core';
import { USER_KEY } from '@core/constants/state.constant';
import { GET_ACCESS_TOKEN, GET_ALL_USER, GET_CURRENT_USER } from '@core/graphql/user.query';
import { IRefreshTokenResponse } from '@core/models/core.model';
import { GraphqlClientService } from '@shared/services/graphql-client.service';
import { IGetOneUserResponse } from 'app/features/auth/models/auth.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private graphqlClientService = inject(GraphqlClientService);

  private transferState = inject(TransferState);

  constructor() { }

  getAllUsers() {
    return this.graphqlClientService.executeQuery(GET_ALL_USER, {});
  }

  getCurrentUser(): Observable<IGetOneUserResponse> {
    if (this.transferState.hasKey(USER_KEY)) {
      const userData = this.transferState.get<IGetOneUserResponse | null>(USER_KEY, null);
      if (userData === null)
        return this.graphqlClientService.executeQuery<IGetOneUserResponse>(GET_CURRENT_USER, {});
      return of(userData);
    }
    else {
      return this.graphqlClientService.executeQuery<IGetOneUserResponse>(GET_CURRENT_USER, {});
    }
  }

  getAccessToken(): Observable<IRefreshTokenResponse> {
    return this.graphqlClientService.executeMutation(GET_ACCESS_TOKEN, {})
  }
}
