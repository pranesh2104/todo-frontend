import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PRIORITIES } from '@core/constants/common.constant';
import { FilterValues, SIDE_NAV_ITEMS } from '@core/constants/side-nav.constant';
import { UserService } from '@core/services/user.service';
import { UserAvatarComponent } from '@shared/components/user-avatar/user-avatar.component';
import { ICommonAPIResponse } from '@shared/models/shared.model';
import { IUserReponse } from 'app/features/auth/models/auth.model';
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
  /**
   * Manages observable subscriptions.
   */
  private subscriptions: Subscription = new Subscription();
  /**
   * Inject the UserService Instance.
   */
  private userService = inject(UserService);
  /**
   * Computed signal that derives the current user from the UserService.
   * Automatically updates when the underlying user signal changes.
   */
  currentUser: Signal<IUserReponse> = computed(() => this.userService.currentUser());

  tagForm: FormGroup<ITagForm> = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true }),
    color: new FormControl<string>('', { nonNullable: true })
  });
  /**
   * Inject the TaskService Instance.
   */
  private readonly taskService = inject(TaskService);
  /**
   * Holds the static side navbar items.
   */
  filterItems = SIDE_NAV_ITEMS;
  /**
   * Signal to holds the tag's data.
   */
  tags = signal<ITaskTagInput[]>([]);
  /**
   * Holds the static priority values.
   */
  priorities = PRIORITIES;
  /**
   * Signal to holds the selected filter item.
   */
  selectedFilterItem: WritableSignal<string> = signal<string>('');
  /**
   * Inject the PrimeNG Message Service.
   */
  private readonly toastMessageService = inject(MessageService);
  /**
   * Inject the Router instance.
   */
  private router = inject(Router);

  private activedRoute = inject(ActivatedRoute);
  /**
   * Fetch the tag data.
   */
  ngOnInit(): void {
    this.subscriptions.add(this.taskService.getAllTasks().subscribe({
      next: (res: IAllTaskResponse) => {
        this.tags.set([...res.getAllTags]);
      },
      error: (error) => {
        console.error('all task error ', error);
      }
    }));
    this.updateSelectedFilterItem();
  }
  /**
   * Update the Selected filter item value initial time.
   */
  updateSelectedFilterItem(): void {
    this.subscriptions.add(this.activedRoute.queryParams.subscribe({
      next: (res) => {
        if (res)
          this.selectedFilterItem.set(Object.values(res)[0]);
        else
          this.selectedFilterItem.set('all');
      }
    }));
  }
  /**
   * Change the Route based on the selected item.
   * @param item holds the item info.
   */
  onFilterSelect(item: { name: string; value: FilterValues; icon: string; }): void {
    this.router.navigate(['app/dashboard'], { queryParams: { property: item.value } });
    this.selectedFilterItem.set(item.value);
  }
  /**
   * Change the Route based on selected tag,
   * @param tagId holds the tag Id.
   */
  onFilterTag(tagId: string | undefined): void {
    if (tagId) {
      this.router.navigate(['app/dashboard'], { queryParams: { tag: tagId } });
      this.selectedFilterItem.set(tagId);
    }
  }
  /**
   * Change the Route based on selected priority.
   * @param priority holds the priority.
   */
  onFilterPriority(priority: string): void {
    this.router.navigate(['app/dashboard'], { queryParams: { priority: priority } });
    this.selectedFilterItem.set(priority);
  }
  /**
   * Add new tag.
   * @returns void
   */
  onAddTag(): void {
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
  /**
   * Delete the Tag
   * @param tagId holds the tag id.
   * @returns void
   */
  onDeleteTag(tagId: string | undefined): void {
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
  /**
   * UnSubscribe the Observable streams.
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
