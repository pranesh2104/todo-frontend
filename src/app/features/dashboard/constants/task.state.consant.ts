import { makeStateKey } from "@angular/core";
import { IAllTaskResponse } from "../models/task.model";

export const TASK_KEY = makeStateKey<IAllTaskResponse>('taskData');