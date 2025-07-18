import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { IAllTaskResponse, ICreateTaskInput, ICreateTaskResponse, IGetAllTask, ITaskTagInput } from '../../models/task.model';
import { convertFormToTaskDetails, FormTaskDetails, isControlEmpty, isDateExpired } from '../../utils/task.util';
import { Toast } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ICommonAPIResponse } from '@shared/models/shared.model';
import { TooltipModule } from 'primeng/tooltip';
import { TagBgStylePipe } from "../../pipes/tag-bg-style.pipe";
import { removeDuplicateTag, removeTypename } from '@core/utils/graphql-utils';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { FormComponent } from '../form-component/form-component.component';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormModifyService } from '../../services/form-modify.service';
import { FilterValues, IFilter } from '@core/constants/side-nav.constant';
import { isDateAfter, isSameDate } from '../../utils/date.util';
import { ICommonErrorResponse, ICommonResponse } from '@shared/models/shared.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-main-dashboard',
  imports: [CommonModule, Dialog, ConfirmPopupModule, ButtonModule, FormComponent, TooltipModule, MultiSelectModule, Toast, InputTextModule, ReactiveFormsModule, TagBgStylePipe],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.scss',
  providers: [MessageService, ConfirmationService, FormModifyService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainDashboardComponent implements OnInit {

  tasks = signal<IGetAllTask[]>([]);

  filteredTasks = computed(() => {

    const filter = this.filter();

    const search = this.searchText().toLowerCase();

    let tasks = this.tasks();

    if (filter.filterBy === 'property') {
      const now = new Date();
      const filterMap: Record<FilterValues, (task: IGetAllTask) => boolean> = {
        all: () => true,
        important: task => task.isImportant,
        completed: task => task.isCompleted,
        today: task => { return task.dueDate && typeof task.dueDate === 'string' ? isSameDate(task.dueDate, now) : false; },
        upcoming: task => { return task.dueDate && typeof task.dueDate === 'string' ? isDateAfter(task.dueDate, now) : false; }
      };

      tasks = tasks.filter(filterMap[filter.property]);
    }
    else if (filter.filterBy === 'tag') {
      tasks = tasks.filter(task => task.tags?.some(t => t.id === filter.tagId));
    }
    else {
      tasks = tasks.filter(task => task.priority === filter.priority);
    }
    if (search) {
      tasks = tasks.filter(task =>
        task.title.toLowerCase().includes(search) ||
        task.description?.toLowerCase().includes(search)
      );
    }
    return tasks;
  });

  submitting = signal<boolean>(false);

  tags = signal<ITaskTagInput[]>([]);

  taskDialogVisible = signal<boolean>(false);

  searchControl = new FormControl<string>('', { nonNullable: true });

  isEditDialog = signal<boolean>(false);

  private readonly taskService = inject(TaskService);

  private readonly formModifyService = inject(FormModifyService);

  private readonly toastMessageService = inject(MessageService);

  private readonly confirmationService = inject(ConfirmationService);

  @ViewChild('formComponent', { static: false }) formComponent !: FormComponent;

  headerText = signal<string>('All');

  private subscriptions = new Subscription();

  private router = inject(Router);

  private activedRoute = inject(ActivatedRoute);

  visibleTagCount = signal(3);

  private platformId = inject(PLATFORM_ID);

  private filter = signal<IFilter>({} as IFilter);

  searchText = signal('');

  constructor() {
    effect(() => {
      const filter = this.filter();
      if (filter.filterBy === 'property') {
        const headerMap: Record<FilterValues, string> = {
          all: 'All', important: 'Important', completed: 'Completed', today: 'Today', upcoming: 'Upcoming'
        };
        this.headerText.set(headerMap[filter.property] || filter.property);
      } else if (filter.filterBy === 'tag') {
        const tagName = this.tags().find(t => t.id === filter.tagId)?.name;
        if (tagName) this.headerText.set(tagName);
      } else if (filter.filterBy === 'priority') {
        this.headerText.set(filter.priority.charAt(0).toUpperCase() + filter.priority.slice(1));
      }
    });
  }

  ngOnInit(): void {
    this.subscriptions.add(this.taskService.getAllTasks().subscribe({
      next: (res: IAllTaskResponse) => {
        this.tasks.set([...res.getAllTasks]);
        this.tags.set([...res.getAllTags]);
      },
      error: (error: ICommonErrorResponse) => {
        const parsedError: ICommonResponse = JSON.parse(error.message);
        if (parsedError.code === 'USER_NOT_FOUND') {
          console.log('IN main dashboard');
          this.toastMessageService.add({ severity: 'warn', detail: 'For security, kindly log in again.', life: 3000, summary: 'Warning' });
          this.router.navigate(['/signin']);
        }
      }
    }));
    this.handleSearch();
    this.subscriptions.add(this.activedRoute.queryParams.subscribe({
      next: (res) => {
        if (!Object.keys(res).length) {
          this.filter.set({ filterBy: 'property', property: 'all' });
        }
        if (res['property']) {
          const value = res['property'];
          this.filter.set({ filterBy: 'property', property: value });
        }
        else if (res['tag']) {
          const value = res['tag'];
          this.filter.set({ filterBy: 'tag', tagId: value });
        }
        else if (res['priority']) {
          this.filter.set({ filterBy: 'priority', priority: res['priority'] });
        }
      }
    }));
    if (isPlatformBrowser(this.platformId)) {
      if (window.innerWidth < 640) {
        this.visibleTagCount.set(2);
      }
    }
  }

  onCancel(event: Event) {
    if (!this.formComponent.taskForm.dirty) {
      this.formComponent.hideTaskDialog();
      this.taskDialogVisible.set(false);
    } else if (!isControlEmpty(this.formComponent.taskForm) && this.formComponent.taskForm.dirty) {
      this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'You have unsaved changes.',
        icon: 'pi pi-exclamation-triangle',
        rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
        acceptButtonProps: { label: 'Save' },
        accept: () => {
          if (this.isEditDialog()) this.onEditSubmit();
          else this.onSubmit();
        },
        reject: () => { this.formComponent.hideTaskDialog(); this.taskDialogVisible.set(false); }
      })
    }
    else if (isControlEmpty(this.formComponent.taskForm)) {
      this.formComponent.hideTaskDialog();
      this.taskDialogVisible.set(false);
    }
  }

  onResetFilter() {
    this.router.navigate([], { relativeTo: this.activedRoute, queryParams: { property: 'all' } })
  }

  onSubmit() {
    const title = this.formComponent.taskForm.get('title');
    if (this.formComponent.taskForm.valid && this.formComponent.taskForm.value && title && title.value) {
      let taskInput: ICreateTaskInput = { taskDetails: convertFormToTaskDetails(this.formComponent.taskForm.value as FormTaskDetails) };
      this.submitting.set(true);
      taskInput = removeTypename(taskInput);
      this.subscriptions.add(this.taskService.createTask<ICommonAPIResponse<ICreateTaskResponse>>(taskInput).subscribe({
        next: (res: ICommonAPIResponse<ICreateTaskResponse>) => {
          if (res && res['createTask'] && res['createTask'].success) {
            this.submitting.set(false);
            this.formComponent.hideTaskDialog();
            this.taskDialogVisible.set(false);
            this.toastMessageService.add({ severity: 'success', summary: 'Task Added', detail: 'Task Added successfully', life: 3000 });
          }
        },
        error: () => {
          this.submitting.set(false);
          this.formComponent.hideTaskDialog();
          this.taskDialogVisible.set(false);
          this.toastMessageService.add({ severity: 'error', detail: 'Task Added failed', life: 3000, summary: 'Error' });
        }
      }));
    }
    else if (this.formComponent.taskForm.invalid) {
      this.toastMessageService.add({ severity: 'warn', detail: 'Some required fields are missing.', life: 3000, summary: 'Warning' });
    }
  }

  onCreateTask() {
    this.taskDialogVisible.set(true);
  }

  onEdit(task: IGetAllTask) {
    this.taskDialogVisible.set(true);
    this.isEditDialog.set(true);
    setTimeout(() => { this.formComponent.patchValue(task); }, 100);
  }

  onTaskStatusUpdate(task: IGetAllTask, isImportant: boolean) {
    let updateValue: { isImportant?: boolean, isCompleted?: boolean } = {};
    if (isImportant) updateValue.isImportant = !task.isImportant;
    else updateValue.isCompleted = !task.isCompleted;
    this.subscriptions.add(this.taskService.updateTaskStatus<ICommonAPIResponse>({ taskStatus: { taskId: task.id, ...updateValue } }).subscribe({
      next: (res) => {
        if (res && res['updateTaskStatus'] && res['updateTaskStatus'].success)
          this.toastMessageService.add({ severity: 'success', summary: 'Task Updated', detail: 'Task Updated successfully', life: 3000 });
      },
      error: (e) => {
        console.error('OnImportant Error :', e);
        this.toastMessageService.add({ severity: 'error', summary: 'Error', detail: 'Task Updated Failed', life: 2000 });
      }
    }));
  }

  onFormSubmit(isFormSubmitted: boolean) {
    if (isFormSubmitted) {
      if (this.isEditDialog()) {
        this.onEditSubmit();
      }
      else {
        this.onSubmit();
      }
    }
  }

  onEditSubmit() {
    if (this.formComponent.taskForm.invalid || !this.formComponent.taskForm.dirty) {
      return;
    }
    const id = this.formComponent.taskForm.get('id');
    if (id && id.value) {
      const ogTask = this.tasks().find(task => task.id === id.value);
      if (ogTask) {
        let simpleChanges = this.formModifyService.getChangedValues(this.formComponent.taskForm, ogTask);
        let subtaskChanges;
        if (simpleChanges && simpleChanges.subTasks)
          delete simpleChanges.subTasks;
        if (this.formComponent.taskForm.get('subTasks')?.dirty) {
          subtaskChanges = this.formModifyService.getSubtasksChanges(
            this.formComponent.taskForm.get('subTasks') as FormArray,
            ogTask || {}
          );
        }

        // simpleChanges = removeTypename(simpleChanges);
        simpleChanges.tags = removeDuplicateTag(simpleChanges.tags, ogTask.tags || []);
        this.subscriptions.add(this.taskService.updateTask<ICommonAPIResponse<IGetAllTask>>({ updateTaskDetails: { id: id.value, ...simpleChanges, subTask: subtaskChanges } }).subscribe({
          next: (res) => {
            if (res && res['updateTask'] && res['updateTask'].success) {
              this.formComponent.hideTaskDialog();
              this.taskDialogVisible.set(false);
              this.toastMessageService.add({ severity: 'success', summary: 'Task Updated', detail: 'Task Updated successfully', life: 3000 });
            }
          },
          error: () => {
            this.formComponent.hideTaskDialog();
            this.taskDialogVisible.set(false);
            this.toastMessageService.add({ severity: 'error', summary: 'Error', detail: 'Task Updated Failed', life: 2000 });
          }
        }));
      }
    }
  }

  onDelete(taskId: string) {
    this.subscriptions.add(this.taskService.deleteTask<ICommonAPIResponse>(taskId).subscribe({
      next: (res) => {
        if (res && res['deleteTask'] && res['deleteTask'].success)
          this.toastMessageService.add({ severity: 'success', summary: 'Task Deleted', detail: 'Task Deleted successfully', life: 3000 });
      },
      error: () => {
        this.toastMessageService.add({ severity: 'error', summary: 'Error', detail: 'Task Deleted Failed', life: 2000 });
      }
    }));
  }

  isDateExpired(date: string | Date | null | undefined): boolean {
    return isDateExpired(date);
  }

  onDialogClose(event: any) {
    if (!event) this.formComponent.onDialogClose();
  }

  handleSearch() {
    this.subscriptions.add(this.searchControl.valueChanges.pipe(debounceTime(1500), distinctUntilChanged()).subscribe({
      next: (searchText) => {
        this.searchText.set(typeof searchText === 'string' ? searchText.trim() : '');
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
