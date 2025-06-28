import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PRIORITIES } from '@core/constants/common.constant';
import { FilterValues, SIDE_NAV_ITEMS } from '@core/constants/side-nav.constant';
import { UserService } from '@core/services/user.service';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';
import { ICommonAPIResponse } from '@shared/models/shared.model';
import { IAllTaskResponse, ICreateTagResponse, ITagForm, ITaskTagInput } from 'app/features/dashboard/models/task.model';
import { TaskService } from 'app/features/dashboard/services/task.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ColorPickerModule } from 'primeng/colorpicker';
import { InputTextModule } from 'primeng/inputtext';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-side-nav',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonModule, ColorPickerModule, InputTextModule, UserAvatarComponent],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class SideNavComponent implements OnInit, OnDestroy {

  private subscriptions = new Subscription();

  private userService = inject(UserService);

  currentUser = computed(() => this.userService.currentUser())

  tagForm: FormGroup<ITagForm> = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true }),
    color: new FormControl<string>('', { nonNullable: true })
  });

  private readonly taskService = inject(TaskService);

  filterItems = SIDE_NAV_ITEMS;

  tags = signal<ITaskTagInput[]>([]);

  priorities = PRIORITIES;

  selectedFilterItem !: string;

  private readonly toastMessageService = inject(MessageService);

  private router = inject(Router);

  ngOnInit(): void {
    this.subscriptions.add(this.taskService.getAllTasks().subscribe({
      next: (res: IAllTaskResponse) => {
        this.tags.set([...res.getAllTags]);
        console.log('from side nav', this.tags());
      },
      error: (error) => {
        console.error('all task error ', error);
      }
    }));
    const queryParams = this.router.url.split('?')[1];
    if (!queryParams) {
      this.selectedFilterItem = 'all';
    }
    else {
      const item = queryParams.split('=')[1];
      this.selectedFilterItem = item;
    }
  }

  onFilterSelect(item: { name: string; value: FilterValues; icon: string; }) {
    this.router.navigate(['app/dashboard'], { queryParams: { property: item.value } });
    this.selectedFilterItem = item.value;
  }

  onFilterTag(tagId: string | undefined) {
    if (tagId) {
      this.router.navigate(['app/dashboard'], { queryParams: { tag: tagId } });
      this.selectedFilterItem = tagId;
    }
  }

  onFilterPriority(priority: string) {
    this.router.navigate(['app/dashboard'], { queryParams: { priority: priority } });
    this.selectedFilterItem = priority;
  }

  onAddTag() {
    const tagFormValue = this.tagForm.value;
    if (this.tagForm.valid && tagFormValue && tagFormValue.name && tagFormValue.color && tagFormValue.name.length && tagFormValue.color.length) {
      this.subscriptions.add(this.taskService.createTag<ICommonAPIResponse<ICreateTagResponse>>({ tagDetails: tagFormValue as ITaskTagInput }).subscribe({
        next: (res: ICommonAPIResponse<ICreateTagResponse>) => {
          if (res && res['createTag'] && res['createTag'].success) {
            this.toastMessageService.add({ severity: 'success', summary: 'Success', detail: 'Tag Deleted successfully', life: 3000 });
            this.tagForm.reset();
          }
        }
      }));
    }
    else {
      if (!tagFormValue.color) {
        this.toastMessageService.add({ severity: 'warn', detail: 'Tag color missing.', life: 3000, summary: 'Warning' });
      }
    }
  }

  onDeleteTag(tagId: string | undefined) {
    if (!tagId) return;
    this.subscriptions.add(this.taskService.deleteTag<ICommonAPIResponse>(tagId).subscribe({
      next: (res) => {
        if (res && res['deleteTag'] && res['deleteTag'].success) {
          this.toastMessageService.add({ severity: 'success', summary: 'Success', detail: 'Tag Deleted successfully', life: 3000 });
        }
      },
      error: () => {
        this.toastMessageService.add({ severity: 'error', summary: 'Error', detail: 'Tag Deleted Failed', life: 2000 });
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
