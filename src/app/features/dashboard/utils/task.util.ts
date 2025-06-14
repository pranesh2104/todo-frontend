import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
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

export function isControlEmpty(control: AbstractControl): boolean {
  if (control instanceof FormControl) {
    return control.value === null || control.value === '' || control.value === undefined;
  }

  if (control instanceof FormGroup) {
    return Object.values(control.controls).every(isControlEmpty);
  }

  if (control instanceof FormArray) {
    return control.controls.every(isControlEmpty);
  }

  return true;
}

export function isDateExpired(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date < today;
}