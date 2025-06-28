import { inject, Injectable, TransferState } from '@angular/core';
import { CREATE_TAG, CREATE_TASK, DELETE_TASK, GET_ALL_TASKS_TAGS, UPDATE_TASK_STATUS, UPDATE_TASK, DELETE_TAG } from '@core/graphql/task.query';
import { GraphqlClientService } from '@shared/services/graphql-client.service';
import { IAllTaskResponse, ICreateTagDetails, ICreateTaskInput, IDeleteTagInput, IDeleteTaskInput, IUpdateTaskInput, IUpdateTaskStatusInput } from '../models/task.model';
import { TASK_KEY } from '../constants/task.state.consant';
import { of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private graphqlClientService = inject(GraphqlClientService);

  private transferState = inject(TransferState);

  constructor() { }

  getAllTasks(): Observable<IAllTaskResponse> {
    if (this.transferState.hasKey(TASK_KEY)) {
      const taskData = this.transferState.get<IAllTaskResponse | null>(TASK_KEY, null);
      if (taskData === null)
        return this.graphqlClientService.executeWatchQuery<IAllTaskResponse>(GET_ALL_TASKS_TAGS, {});
      return of(taskData);
    }
    else {
      return this.graphqlClientService.executeWatchQuery<IAllTaskResponse>(GET_ALL_TASKS_TAGS, {});
    }
  }

  // createTask<T>(taskDetails: ICreateTaskInput) {
  // return this.graphqlClientService.executeMutation<T,>(CREATE_TASK, taskDetails, (cache: ApolloCache<any>, { data }) => {
  //   if (!data) return;
  //   const newTask = data.createTask.task;
  //   console.log('newTask ', newTask);

  //   // const existingTasks = cache.readQuery<{ getAllTasks: IGetAllTask[] }>({ query: gql`${GET_ALL_TASKS_TAGS}` });

  //   // if (!existingTasks) return;

  //   const existingData = cache.readQuery<IAllTaskResponse>({ query: gql`${GET_ALL_TASKS_TAGS}` });

  //   if (!existingData) return;

  //   cache.writeQuery({
  //     query: gql`${GET_ALL_TASKS_TAGS}`,
  //     data: {
  //       ...existingData,
  //       getAllTasks: [...existingData.getAllTasks, newTask]
  //     }
  //   });
  // });
  // }

  createTask<T>(taskDetails: ICreateTaskInput) {
    return this.graphqlClientService.executeMutation<T, ICreateTaskInput>(CREATE_TASK, taskDetails, { cacheConfig: { query: GET_ALL_TASKS_TAGS, listField: 'getAllTasks', responseKey: 'task' } });
  }
  // { cacheConfig: { query: GET_ALL_TASKS_TAGS, listField: 'getAllTasks', responseKey: 'task' } }

  // createTag<T>(tagDetails: ICreateTagDetails): Observable<T> {
  //   return this.graphqlClientService.executeMutation<T>(CREATE_TAG, tagDetails, (cache: ApolloCache<any>, { data }) => {
  //     if (!data || !data.createTag) return;

  //     const newTag = data.createTag.tag;

  //     const existingData = cache.readQuery<IAllTaskResponse>({ query: gql`${GET_ALL_TASKS_TAGS}` });

  //     if (!existingData) return;

  //     cache.writeQuery({
  //       query: gql`${GET_ALL_TASKS_TAGS}`,
  //       data: {
  //         ...existingData,
  //         getAllTags: [...existingData.getAllTags, newTag]
  //       }
  //     });
  //   });
  // }

  createTag<T>(tagDetails: ICreateTagDetails): Observable<T> {
    return this.graphqlClientService.executeMutation<T, ICreateTagDetails>(CREATE_TAG, tagDetails, { cacheConfig: { query: GET_ALL_TASKS_TAGS, listField: 'getAllTags', responseKey: 'tag' } });
  }
  // { cacheConfig: { query: GET_ALL_TASKS_TAGS, listField: 'getAllTags', responseKey: 'tag' } }

  updateTask<T>(updateTaskDetails: IUpdateTaskInput) {
    return this.graphqlClientService.executeMutation<T, IUpdateTaskInput>(UPDATE_TASK, updateTaskDetails);
  }
  // { cacheConfig: { query: GET_ALL_TASKS_TAGS, listField: 'getAllTasks', updateStrategy: 'update', idFieldName: 'id' }
  // { cacheConfig: { updateStrategy: 'update', query: GET_ALL_TASKS_TAGS, listField: 'getAllTasks', responseKey: 'task' } }

  deleteTask<T>(taskId: string) {
    return this.graphqlClientService.executeMutation<T, IDeleteTaskInput>(DELETE_TASK, { taskId });
  }

  updateTaskStatus<T>(taskStatus: IUpdateTaskStatusInput) {
    return this.graphqlClientService.executeMutation<T, IUpdateTaskStatusInput>(UPDATE_TASK_STATUS, taskStatus, {
      cacheConfig: { query: GET_ALL_TASKS_TAGS, listField: 'getAllTasks', useModify: true, middleVariable: 'taskStatus' }
    });
  }

  deleteTag<T>(tagId: string) {
    return this.graphqlClientService.executeMutation<T, IDeleteTagInput>(DELETE_TAG, { tagId });
  }

  // { cacheConfig: { query: GET_ALL_TASKS_TAGS, listField: 'getAllTasks', responseKey: 'task', updateStrategy: 'delete', id: taskId } }
}
