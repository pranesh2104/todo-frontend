import { inject, Injectable } from '@angular/core';
import { GET_ALL_TASKS } from '@core/graphql/task.query';
import { GraphqlClientService } from '@shared/services/graphql-client.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private graphqlClientService = inject(GraphqlClientService);

  constructor() { }

  getAllTasks() {
    return this.graphqlClientService.executeQuery(GET_ALL_TASKS, {});
  }
}
