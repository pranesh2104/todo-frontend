import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { UPDATE_SESSION_TOKEN, GET_ALL_USER, GET_CURRENT_USER } from '@core/graphql/user.query';
import { GraphqlClientService } from '@shared/services/graphql-client.service';
import { IGetOneUserResponse, IUserReponse } from 'app/features/auth/models/auth.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  /**
   * Inject the GraphqlClient Service instance.
   */
  private graphqlClientService = inject(GraphqlClientService);
  /**
   * Signal to manage the user data.
   */
  public readonly currentUser: WritableSignal<IUserReponse> = signal<IUserReponse>({} as IUserReponse);
  /**
   * Todo: have to write the Interface.
   * Executes a GraphQL query to fetch the all authenticated user's data
   * @returns Executes a GraphQL query to fetch the all authenticated user's data
   */
  getAllUsers(): Observable<IGetOneUserResponse[]> {
    return this.graphqlClientService.executeQuery(GET_ALL_USER, {});
  }
  /**
   * Executes a GraphQL query to fetch the current authenticated user's data.
   * @returns An Observable that emits the current user's information.
   */
  getCurrentUser(): Observable<IGetOneUserResponse> {
    return this.graphqlClientService.executeQuery<IGetOneUserResponse>(GET_CURRENT_USER, {});
  }
  /**
   * Executes a GraphQL query to fetch the current authenticated user's data.
   * @returns An Observale that emits the success message.
   */
  getSessionToken(): Observable<{ success: boolean }> {
    return this.graphqlClientService.executeMutation(UPDATE_SESSION_TOKEN, {})
  }
  /**
   * Updates the current user signal with the provided partial user data.
   * Merges the new values into the existing user state.
   * 
   * @param update - Partial user information to merge with the existing user data.
   */
  setCurrentUser(update: Partial<IUserReponse>) {
    this.currentUser.update(prev => ({ ...prev, ...update }));
  }
}
