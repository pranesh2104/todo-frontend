import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ICreateTagResponse, IGetAllTask, ISubTaskForm, ISubTaskInput, ITagForm, ITaskForm, ITaskTagInput } from '../../models/task.model';
import { MultiSelectModule } from 'primeng/multiselect';
import { ColorPickerModule } from 'primeng/colorpicker';
import { AccordionModule } from 'primeng/accordion';
import { ChipModule } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { Message } from 'primeng/message';
import { TagBgStylePipe } from '../../pipes/tag-bg-style.pipe';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { removeTypename } from '@core/utils/graphql-utils';
import { Dialog } from 'primeng/dialog';
import { TaskService } from '../../services/task.service';
import { ICommonAPIResponse } from '@shared/models/shared.model';
import { isDateExpired } from '../../utils/task.util';

@Component({
  selector: 'app-form-component',
  imports: [CommonModule, AutoCompleteModule, Dialog, ButtonModule, ChipModule, Message, MultiSelectModule, ColorPickerModule, AccordionModule, InputTextModule, ReactiveFormsModule, TextareaModule, SelectModule, DatePickerModule, TagBgStylePipe],
  templateUrl: './form-component.component.html',
  styleUrl: './form-component.component.scss'
})
export class FormComponent {

  tags = input<ITaskTagInput[]>();

  formSubmitted = input<boolean>(false);

  taskDialogRef = input<Dialog>();

  submitEmitter = output<boolean>();

  taskForm!: FormGroup<ITaskForm>;

  tagForm!: FormGroup<ITagForm>;

  priorities = [{ value: 'high', name: 'High' }, { value: 'medium', name: 'Medium' }, { value: 'low', name: 'Low' }];

  filteredSuggestions: ITaskTagInput[] = [];

  isEditDialog: boolean = false;

  today: Date = new Date();

  minDate: Date = new Date();

  taskDialogVisible: boolean = false;

  tagDialogVisible: boolean = false;

  private readonly taskService = inject(TaskService);

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.minDate.setHours(0, 0, 0, 0);
    this.today.setHours(0, 0, 0, 0);
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

  get subTasks() {
    return this.taskForm.get('subTasks') as FormArray;
  }

  addSubTask() {
    this.subTasks.push(this.createSubTaskForm());
  }

  removeSubTask(index: number) {
    this.subTasks.removeAt(index);
    this.taskForm.markAsDirty();
  }

  patchValue(task: IGetAllTask) {
    task = removeTypename(task);
    if (task.dueDate) {
      task.dueDate = new Date(task.dueDate);
      task.dueDate.setHours(0, 0, 0, 0);
    }
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

  filterSuggestionsChips(event: any) {
    const query = event.query.toLowerCase();
    const tags = this.tags();
    if (tags && tags.length) {
      this.filteredSuggestions = tags.filter(item => item.name && item.name.toLowerCase().includes(query));
    }
  }

  onOpenTagDialog() {
    this.tagDialogVisible = true;
    this.tagForm = this.fb.group<ITagForm>({
      name: this.fb.control<string>('', { nonNullable: true }),
      color: this.fb.control<string>('', { nonNullable: true })
    });
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

  onDialogClose() {
    this.taskForm.reset();
    this.minDate = new Date();
    const subTasks = this.taskForm.get('subTasks') as FormArray;
    while (subTasks.length) {
      subTasks.removeAt(0);
    }
  }

  isDateExpired(date: string | Date | null | undefined): boolean {
    return isDateExpired(date);
  }

  public hideTaskDialog() {
    this.taskDialogVisible = false;
    this.taskForm.reset();
    while (this.subTasks.length) {
      this.subTasks.removeAt(0);
    }
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

  onFormSubmit() {
    this.submitEmitter.emit(true)
  }
}
