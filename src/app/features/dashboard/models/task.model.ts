import { FormArray, FormControl, FormGroup } from "@angular/forms";

export interface ICreateTaskInput {
  taskDetails: ITaskDetailsInput;
}

export interface ITaskDetailsInput {
  id?: string;
  title: string;
  description: string | null;
  comment: string | null;
  dueDate: Date | string | null;
  priority: string | null;
  tags: ITaskTagInput[] | string[];
  subTasks: ISubTaskInput[];
}

export interface ITaskTagInput {
  id?: string;
  name?: string;
  color?: string;
}

export interface ISubTaskInput {
  id?: string;
  title: string;
  description: string | null;
  comment: string | null;
  dueDate: Date | string | null;
  priority: string | null;
}

export interface ICreateTagDetails {
  tagDetails: ITaskTagInput;
}

export interface ITaskForm {
  id: FormControl<string>;
  title: FormControl<string>;
  description: FormControl<string | null>;
  comment: FormControl<string | null>;
  dueDate: FormControl<Date | string | null>;
  priority: FormControl<string | null>;
  tags: FormControl<ITaskTagInput[] | null>;
  subTasks: FormArray<FormGroup<ISubTaskForm>>;
}

export interface ISubTaskForm {
  id: FormControl<string>;
  title: FormControl<string>;
  description: FormControl<string | null>;
  comment: FormControl<string | null>;
  dueDate: FormControl<Date | string | null>;
  priority: FormControl<string | null>;
}

export interface ITagForm {
  color: FormControl<string>;
  name: FormControl<string>;
}

export interface IAllTaskResponse {
  getAllTasks: IGetAllTask[];
  getAllTags: ITaskTagInput[] & { id: string };
}

export interface IGetAllTask {
  id: string;
  title: string;
  comment: string | null;
  createdAt: Date | string;
  description: string | null;
  dueDate: Date | string | null;
  isCompleted: boolean;
  priority: string;
  tags: ITaskTagInput[] & { id: string } | null;
  updatedAt: Date | string | null;
  subTasks: ISubTaskResponse[];
}

export interface ISubTaskResponse {
  id: string;
  title: string;
  updatedAt: Date | string | null;
  priority: string | null;
  isCompleted: boolean
  dueDate: Date | string | null;
  description: string | null;
  createdAt: Date | string;
  comment: string | null;
}

export interface ICreateTagResponse {
  tag: ITaskTagInput;
}

export interface ICreateTaskResponse {
  task: IGetAllTask;
}

export interface IUpdateTaskInput {
  updateTaskDetails: IUpdateTaskDetails;
}

export interface IUpdateTaskDetails {
  id: string;
  subTaskChanges: ISubTaskChanges;
  taskChanges: ITaskChanges;
}

export interface ITaskChanges {
  title?: string;
  priority?: string;
  isCompleted?: boolean;
  dueDate?: string,
  description?: string,
  comment?: string;
  tags?: ITagChangesInput;
}

interface ITagChangesInput {
  added: string[];
  removed: string[]
}
export interface ISubTaskChanges {
  removed: string[],
  modified: IModifySubTaskInput[],
  added: IAddSubTaskInput[]
}

interface IModifySubTaskInput {
  id: string;
  comment?: string;
  description?: string;
  dueDate?: string;
  isCompleted?: boolean;
  priority?: string;
  title?: string;
}

interface IAddSubTaskInput {
  comment: string;
  description: string;
  dueDate: string;
  priority: string;
  title: string;
}

export interface IDeleteTaskInput {
  taskId: string;
}