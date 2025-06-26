import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PRIORITIES } from '@core/constants/common.constant';
import { FilterValues, IFilter, SIDE_NAV_ITEMS } from '@core/constants/side-nav.constant';
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
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, ColorPickerModule, InputTextModule, UserAvatarComponent],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class SideNavComponent implements OnInit, OnDestroy {

  userData = input<IUserReponse>();

  private colors: string[] = ['#3B82F6', '#22C55E', '#EAB308', '#EF4444', '#A855F7', '#EC4899'];

  userBGColor = computed(() => {
    if (this.userData() && this.userData()?.name) return this.getColorFromName();
    return '#3B82F6';
  });

  private subscribeArr = new Subscription();

  private cdr = inject(ChangeDetectorRef);

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

  // private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.subscribeArr.add(this.taskService.getAllTasks().subscribe({
      next: (res: IAllTaskResponse) => {
        this.tags.set([...res.getAllTags]);
        console.log('from side nav', this.tags());
        // this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('all task error ', error);
      }
    }));
    this.subscribeArr.add(this.taskService.filter$.subscribe({
      next: (res: IFilter) => {
        this.selectedFilterItem = res.filterBy === 'tag' ? res.tagId : res.filterBy === 'priority' ? res.priority : res.property;
      }
    }));
  }

  onFilterSelect(item: { name: string; value: FilterValues; icon: string; }) {
    this.taskService.setFilter({ filterBy: 'property', property: item.value });
  }

  onFilterTag(tagId: string | undefined) {
    if (tagId)
      this.taskService.setFilter({ filterBy: 'tag', tagId });
  }

  onFilterPriority(priority: string) {
    this.taskService.setFilter({ filterBy: 'priority', priority });
  }

  onAddTag() {
    const tagFormValue = this.tagForm.value;
    if (this.tagForm.valid && tagFormValue && tagFormValue.name && tagFormValue.color && tagFormValue.name.length && tagFormValue.color.length) {
      this.subscribeArr.add(this.taskService.createTag<ICommonAPIResponse<ICreateTagResponse>>({ tagDetails: tagFormValue as ITaskTagInput }).subscribe({
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
    this.taskService.deleteTag<ICommonAPIResponse>(tagId).subscribe({
      next: (res) => {
        if (res && res['deleteTag'] && res['deleteTag'].success) {
          this.toastMessageService.add({ severity: 'success', summary: 'Success', detail: 'Tag Deleted successfully', life: 3000 });
        }
      },
      error: () => {
        this.toastMessageService.add({ severity: 'error', summary: 'Error', detail: 'Tag Deleted Failed', life: 2000 });
      }
    });
  }

  private getColorFromName(): string {
    let hash = 0;
    let color = '#3B82F6'
    const userName = this.userData()?.name || '';
    for (let i = 0; i < userName.length; i++) {
      hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    }
    color = this.colors[Math.abs(hash) % this.colors.length]!;
    return color;
  }

  ngOnDestroy(): void {
    this.subscribeArr.unsubscribe();
  }
}
