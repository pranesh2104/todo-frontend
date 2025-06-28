import { inject, Injectable, signal, TransferState } from '@angular/core';
import { USER_KEY } from '@core/constants/state.constant';
import { UPDATE_SESSION_TOKEN, GET_ALL_USER, GET_CURRENT_USER } from '@core/graphql/user.query';
import { GraphqlClientService } from '@shared/services/graphql-client.service';
import { IGetOneUserResponse, IUserReponse } from 'app/features/auth/models/auth.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private graphqlClientService = inject(GraphqlClientService);

  private transferState = inject(TransferState);

  readonly currentUser = signal<IUserReponse>({} as IUserReponse);

  constructor() { }

  getAllUsers() {
    return this.graphqlClientService.executeQuery(GET_ALL_USER, {});
  }

  getCurrentUser(): Observable<IGetOneUserResponse> {
    return this.graphqlClientService.executeQuery<IGetOneUserResponse>(GET_CURRENT_USER, {});
  }

  getAccessToken(): Observable<{ success: boolean }> {
    return this.graphqlClientService.executeMutation(UPDATE_SESSION_TOKEN, {})
  }

  setCurrentUser(update: Partial<IUserReponse>) {
    this.currentUser.update(prev => ({ ...prev, ...update }));
  }
}
