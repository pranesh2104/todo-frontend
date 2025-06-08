import { inject, Injectable, TransferState } from '@angular/core';
import { CREATE_TAG, CREATE_TASK, DELETE_TASK, GET_ALL_TASKS_TAGS, UPDATE_TASK_STATUS, UPDATE_TASK } from '@core/graphql/task.query';
import { GraphqlClientService } from '@shared/services/graphql-client.service';
import { IAllTaskResponse, ICreateTagDetails, ICreateTaskInput, IDeleteTaskInput, IGetAllTask, ITaskTagInput, IUpdateTaskInput, IUpdateTaskStatusInput } from '../models/task.model';
// import { ApolloCache, gql, } from '@apollo/client/core';
import { TASK_KEY } from '../constants/task.state.consant';
import { of, Observable } from 'rxjs';
import { FormArray, FormGroup } from '@angular/forms';
// import { ApolloCache } from '@apollo/client/cache';
// import { gql } from 'apollo-angular';

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

  // { cacheConfig: { query: GET_ALL_TASKS_TAGS, listField: 'getAllTasks', responseKey: 'task', updateStrategy: 'delete', id: taskId } }

  /**
  * Extracts only the changed values from a FormGroup
  * Works with nested FormGroups and FormArrays
  * @param form The FormGroup to extract changes from
  * @returns An object containing only the changed fields
  */
  getChangedValues(form: FormGroup, originalTask: IGetAllTask): any {
    if (!form.dirty) return {};

    const changes: any = {};
    const controls = form.controls;

    let removed: any = [];
    let added = [];

    Object.keys(controls).forEach(key => {
      const control = controls[key];
      if (!control || !control.dirty) return;

      if (key !== 'tags') {
        if (control instanceof FormGroup) {
          const nestedChanges = this.getChangedValues(control, originalTask);
          if (Object.keys(nestedChanges).length > 0) {
            changes[key] = nestedChanges;
          }
        } else if (control instanceof FormArray) {
          const arrayChanges = this.getFormArrayChanges(control, originalTask);
          if (arrayChanges.length > 0 || control.dirty) {
            changes[key] = arrayChanges;
          }
        } else if (control.dirty) {
          changes[key] = control.value;
        }
      }
      else {
        if (originalTask.tags && originalTask.tags.length && control && control.value && control.value.length) {
          removed = originalTask.tags.filter((tag) => !control.value.some((formTag: ITaskTagInput) => formTag.name === tag.name)).map((t) => t.id);
          added = control.value.filter((formTag: ITaskTagInput) => !originalTask.tags?.some((tag) => tag.name === formTag.name)).map((t: ITaskTagInput) => t.id);
          changes[key] = { added, removed };
        }

      }
    });

    return changes;
  }

  /**
   * Handles changes in FormArrays (for subtasks and tags)
   * @param formArray The FormArray to extract changes from
   * @returns An array of the changed items
   */
  private getFormArrayChanges(formArray: FormArray, originalTask: IGetAllTask): any[] {
    if (!formArray.dirty) {
      return [];
    }

    // For new or modified arrays, we need to include the full array
    // because MongoDB typically needs the complete array for updates
    return formArray.controls.map((control) => {

      if (control instanceof FormGroup) {
        // If the individual form group is dirty, get its changes
        if (control.dirty) {
          const groupChanges = this.getChangedValues(control, originalTask);

          // If we have an existing ID, include it to ensure proper updates
          if (control.get('id') && control.get('id')?.value) {
            groupChanges.id = control.get('id')?.value;
          }

          return groupChanges;
        } else if (control.get('id') && control.get('id')?.value) {
          // If it's not dirty but has an ID, we need to include the ID
          // to ensure array integrity in MongoDB
          return { id: control.get('id')?.value };
        }
      }

      // For primitive values or dirty controls
      return control.dirty ? control.value : null;
    }).filter(item => item !== null);
  }

  /**
   * Special method for handling subtasks with additional change tracking
   * @param formArray The subtasks FormArray
   * @param originalSubtasks The original subtasks from the database
   * @returns An object with modified, added, and removed subtasks
   */
  getSubtasksChanges(formArray: FormArray, originalTasks: IGetAllTask): any {
    if (!formArray.dirty) {
      return { modified: [], added: [], removed: [] };
    }

    const currentSubtaskIds = new Set();
    const modified: any[] = [];
    const added: any[] = [];
    let removed: any[] = [];
    // Process current form array
    formArray.controls.forEach((control) => {
      if (control instanceof FormGroup) {
        const idControl = control.get('id');
        // Has ID and is dirty - modified existing subtask
        if (idControl && idControl.value) {
          currentSubtaskIds.add(idControl.value);

          if (control.dirty) {
            modified.push({
              id: idControl.value,
              ...this.getChangedValues(control, originalTasks)
            });
          }
        }
        // No ID or null ID - new subtask
        else if (control.dirty) {
          console.log('contorl ', control.value);
          delete control.value.id;
          added.push(control.value);
        }
      }
    });

    // Find removed subtasks (in original but not in current)
    removed = originalTasks.subTasks.filter(subtask => !currentSubtaskIds.has(subtask.id)).map(subtask => subtask.id);

    return { modified, added, removed };
  }
}
