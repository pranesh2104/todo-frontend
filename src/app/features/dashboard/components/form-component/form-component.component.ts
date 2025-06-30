import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IGetAllTask, ISubTaskForm, ISubTaskInput, ITaskForm, ITaskTagInput } from '../../models/task.model';
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
import { isDateExpired } from '../../utils/task.util';
import { PRIORITIES } from '@core/constants/common.constant';

@Component({
  selector: 'app-form-component',
  imports: [CommonModule, AutoCompleteModule, ButtonModule, ChipModule, Message, MultiSelectModule, ColorPickerModule, AccordionModule, InputTextModule, ReactiveFormsModule, TextareaModule, SelectModule, DatePickerModule, TagBgStylePipe],
  templateUrl: './form-component.component.html',
  styleUrl: './form-component.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormComponent implements OnInit {

  tags = input<ITaskTagInput[]>();

  formSubmitted = input<boolean>(false);

  taskDialogRef = input<Dialog>();

  submitEmitter = output<boolean>();

  taskForm!: FormGroup<ITaskForm>;

  priorities = PRIORITIES;

  filteredSuggestions = signal<ITaskTagInput[]>([]);

  today: Date = new Date();

  minDate: Date = new Date();

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
      this.filteredSuggestions.set(tags.filter(item => item.name && item.name.toLowerCase().includes(query)));
    }
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
    this.taskForm.reset();
    while (this.subTasks.length) {
      this.subTasks.removeAt(0);
    }
  }

  onFormSubmit() {
    this.submitEmitter.emit(true)
  }
}
