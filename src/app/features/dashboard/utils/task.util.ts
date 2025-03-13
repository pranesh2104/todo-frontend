import { ISubTaskInput, ITaskDetailsInput, ITaskTagInput } from "../models/task.model";


export type FormTaskDetails = {
  [K in keyof ITaskDetailsInput]: ITaskDetailsInput[K] | undefined;
} & {
  subTasks?: Array<{
    [K in keyof ISubTaskInput]: ISubTaskInput[K] | undefined;
  }>;
}

export function convertFormToTaskDetails(form: FormTaskDetails): ITaskDetailsInput {
  return {
    title: form.title || '',
    description: form.description ?? null,
    comment: form.comment ?? null,
    dueDate: (typeof form.dueDate === 'object' ? form.dueDate?.toString() : form.dueDate) || null,
    priority: form.priority ?? null,
    tags: form.tags && form.tags.length ? form.tags.map((tag: ITaskTagInput) => tag.id).filter((id): id is string => !!id) : [],
    subTasks: (form.subTasks ?? []).map(sub => ({
      title: sub.title || '',
      description: sub.description ?? null,
      comment: sub.comment ?? null,
      dueDate: (typeof form.dueDate === 'object' ? form.dueDate?.toString() : form.dueDate) || null,
      priority: sub.priority ?? null
    }))
  };
}