import { Component, inject, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { ChipModule } from 'primeng/chip';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { AccordionModule } from 'primeng/accordion';
import { IAllTaskResponse, ICreateTagResponse, ICreateTaskInput, ICreateTaskResponse, IGetAllTask, ISubTaskInput, ISubTaskForm, ITaskTagInput, ITagForm, ITaskForm } from '../../models/task.model';
import { convertFormToTaskDetails, FormTaskDetails } from '../../utils/task.util';
import { Toast } from 'primeng/toast';
import { MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ICommonAPIResponse } from '@shared/models/shared.model';
import { MultiSelectModule } from 'primeng/multiselect';
import { Message } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TagBgStylePipe } from "../../pipes/tag-bg-style.pipe";
import { removeDuplicateTag, removeTypename } from '@core/utils/graphql-utils';


@Component({
  selector: 'app-main-dashboard',
  imports: [CommonModule, Dialog, AutoCompleteModule, ButtonModule, TooltipModule, Message, MultiSelectModule, ColorPickerModule, Toast, AccordionModule, ChipModule, InputTextModule, ReactiveFormsModule, TextareaModule, SelectModule, DatePickerModule, Menu, TagBgStylePipe],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.scss',
  providers: [MessageService]
})
export class MainDashboardComponent implements OnInit {

  private readonly taskService = inject(TaskService);

  tasks: IGetAllTask[] = [];

  submitting = false;

  tags: ITaskTagInput[] = [];

  taskDialogVisible: boolean = false;

  tagDialogVisible: boolean = false;

  taskForm!: FormGroup<ITaskForm>;

  tagForm!: FormGroup<ITagForm>;

  today: Date = new Date();

  minDate: Date = new Date();

  priorities = [{ value: 'high', name: 'High' }, { value: 'medium', name: 'Medium' }, { value: 'low', name: 'Low' }];

  menuItems: MenuItem[] = [
    { label: 'New', icon: 'pi pi-plus' },
    { label: 'Delete', icon: 'pi pi-trash', iconStyle: { color: '#E53935' } }
  ]

  filteredSuggestions: ITaskTagInput[] = [];

  isEditDialog: boolean = false;


  constructor(private fb: FormBuilder, private toastMessageService: MessageService) { }

  ngOnInit(): void {
    this.taskService.getAllTasks().subscribe({
      next: (res: IAllTaskResponse) => {
        this.tasks = res.getAllTasks;
        this.tags = [...res.getAllTags];
        console.log('all task response ', res);
      },
      error: (error) => {
        console.error('all task error ', error);
      }
    });
    this.initForm();
  }

  initForm() {
    this.taskForm = this.fb.group<ITaskForm>({
      id: this.fb.control('', { nonNullable: true }),
      title: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
      description: this.fb.control(null),
      comment: this.fb.control(null),
      dueDate: this.fb.control(null),
      priority: this.fb.control(null),
      tags: this.fb.control(null, { validators: [Validators.required] }),
      subTasks: this.fb.array<FormGroup<ISubTaskForm>>([])
    });
  }

  get subTasks() {
    return this.taskForm.get('subTasks') as FormArray;
  }

  createSubTaskForm(subTask?: ISubTaskInput) {
    return this.fb.group<ISubTaskForm>({
      id: this.fb.control(subTask?.id || '', { nonNullable: true }),
      title: this.fb.control(subTask?.title || '', { validators: [Validators.required], nonNullable: true }),
      description: this.fb.control(subTask?.description || null),
      comment: this.fb.control(subTask?.comment || null),
      dueDate: this.fb.control(subTask?.dueDate ? new Date(subTask?.dueDate) : null),
      priority: this.fb.control(subTask?.priority || null)
    });
  }

  addSubTask() {
    this.subTasks.push(this.createSubTaskForm());
  }

  removeSubTask(index: number) {
    this.subTasks.removeAt(index);
  }

  showDialog() {
    this.taskDialogVisible = true;
  }

  hideDialog() {
    this.taskDialogVisible = false;
    this.taskForm.reset();
    while (this.subTasks.length) {
      this.subTasks.removeAt(0);
    }
  }

  onSubmit() {
    const title = this.taskForm.get('title');
    if (this.taskForm.valid && this.taskForm.value && title && title.value) {
      let taskInput: ICreateTaskInput = { taskDetails: convertFormToTaskDetails(this.taskForm.value as FormTaskDetails) };
      this.submitting = true;
      taskInput = removeTypename(taskInput);
      this.taskService.createTask<ICommonAPIResponse<ICreateTaskResponse>>(taskInput).subscribe({
        next: (res: ICommonAPIResponse<ICreateTaskResponse>) => {
          if (res && res['createTask'] && res['createTask'].success) {
            this.submitting = false;
            this.hideDialog();
            this.toastMessageService.add({ severity: 'success', summary: 'Success', detail: 'Task Added successfully', life: 3000 });
          }
        },
        error: () => {
          this.submitting = false;
          this.hideDialog();
          this.toastMessageService.add({ severity: 'error', detail: 'Task Added failed', life: 3000, summary: 'Error' });
        }
      });
    }
  }

  onCreateTask() {
    this.taskDialogVisible = true;
  }

  onOpenTagDialog() {
    this.tagDialogVisible = true;
    this.tagForm = this.fb.group<ITagForm>({
      name: this.fb.control<string>('', { nonNullable: true }),
      color: this.fb.control<string>('', { nonNullable: true })
    });
  }

  onAddTag() {
    const tagFormValue = this.tagForm.value;
    if (this.tagForm.valid && tagFormValue && tagFormValue.name && tagFormValue.color && tagFormValue.name.length && tagFormValue.color.length) {
      this.taskService.createTag<ICommonAPIResponse<ICreateTagResponse>>({ tagDetails: tagFormValue as ITaskTagInput }).subscribe({
        next: (res: ICommonAPIResponse<ICreateTagResponse>) => {
          if (res && res['createTag'] && res['createTag'].success) {
            this.tagDialogVisible = false;
          }
        }
      });
    }
  }

  filterSuggestionsChips(event: any) {
    const query = event.query.toLowerCase();
    this.filteredSuggestions = this.tags.filter(item => item.name && item.name.toLowerCase().includes(query));
  }

  removeChip(chip: ITaskTagInput) {
    const tagFormControl = this.taskForm.get('tags');
    if (tagFormControl) {
      const currentValue = tagFormControl?.value || [];
      const updatedValue = currentValue.filter(tag => tag.name !== chip.name);
      tagFormControl.setValue(updatedValue);
      tagFormControl.markAsDirty();
      tagFormControl.updateValueAndValidity();
    }
  }

  onEdit(task: IGetAllTask) {
    this.isEditDialog = true;
    this.taskDialogVisible = true;
    this.patchValue(task);
  }

  patchValue(task: IGetAllTask) {
    task = removeTypename(task);
    if (task.dueDate)
      task.dueDate = new Date(task.dueDate);
    this.taskForm.patchValue(task);
    const subTaskForm = this.taskForm.get('subTasks') as FormArray;
    if (task.subTasks && task.subTasks.length && subTaskForm) {
      while (subTaskForm.length) {
        subTaskForm.removeAt(0);
      }
      task.subTasks.forEach((subTask: ISubTaskInput) => {
        const subTaskGroup = this.createSubTaskForm(subTask);
        subTaskForm.push(subTaskGroup);
      });
    }
  }

  onEditSubmit() {
    if (this.taskForm.invalid || !this.taskForm.dirty) {
      return;
    }
    const id = this.taskForm.get('id');
    if (id && id.value) {
      const ogTask = this.tasks.find(task => task.id === id.value);
      if (ogTask) {

        let simpleChanges = this.taskService.getChangedValues(this.taskForm, ogTask);
        let subtaskChanges;
        if (simpleChanges && simpleChanges.subTasks)
          delete simpleChanges.subTasks;
        if (this.taskForm.get('subTasks')?.dirty) {
          subtaskChanges = this.taskService.getSubtasksChanges(
            this.taskForm.get('subTasks') as FormArray,
            ogTask || {}
          );
        }

        simpleChanges = removeTypename(simpleChanges);
        simpleChanges.tags = removeDuplicateTag(simpleChanges.tags, ogTask.tags || []);
        this.taskService.updateTask<ICommonAPIResponse<IGetAllTask>>({ updateTaskDetails: { id: id.value, taskChanges: simpleChanges, subTaskChanges: subtaskChanges } }).subscribe({
          next: (res) => {
            if (res && res['updateTask'] && res['updateTask'].success) {
              this.hideDialog();
              this.toastMessageService.add({ severity: 'success', summary: 'Success', detail: 'Task Updated successfully', life: 3000 });
            }
          },
          error: () => {
            this.hideDialog();
            this.toastMessageService.add({ severity: 'error', summary: 'Error', detail: 'Task Updated Failed', life: 2000 });
          }
        });
      }
    }
  }

  checkDate() {
    console.log('selected Due Date ');
  }

  onDelete(taskId: string) {
    this.taskService.deleteTask<ICommonAPIResponse>(taskId).subscribe({
      next: (res) => {
        if (res && res['deleteTask'] && res['deleteTask'].success)
          this.toastMessageService.add({ severity: 'success', summary: 'Success', detail: 'Task Deleted successfully', life: 3000 });
      },
      error: () => {
        this.toastMessageService.add({ severity: 'error', summary: 'Error', detail: 'Task Updated Failed', life: 2000 });
      }
    });
  }

  isDateExpired(date: string | Date | null | undefined): boolean {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (typeof date === 'string')
      date = new Date(date);
    const isExpired = date < today;
    if (isExpired) {
      this.today = new Date(date);
      this.minDate = new Date(date);
    }
    return isExpired;
  }


  onDialogClose(event: any) {
    if (!event) {
      this.taskForm.reset();
      this.minDate = new Date();
      const subTasks = this.taskForm.get('subTasks') as FormArray;
      while (subTasks.length) {
        subTasks.removeAt(0);
      }
    }
  }
}
