import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { PRIORITIES } from '@core/constants/common.constant';
import { FilterValues, IFilter, SIDE_NAV_ITEMS } from '@core/constants/side-nav.constant';
import { IUserReponse } from 'app/features/auth/models/auth.model';
import { IAllTaskResponse, ITaskTagInput } from 'app/features/dashboard/models/task.model';
import { TaskService } from 'app/features/dashboard/services/task.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-side-nav',
  imports: [CommonModule],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
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

  private readonly taskService = inject(TaskService);

  filterItems = SIDE_NAV_ITEMS;

  tags = signal<ITaskTagInput[]>([]);

  priorities = PRIORITIES;

  selectedFilterItem !: string;

  // private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.subscribeArr.add(this.taskService.getAllTasks().subscribe({
      next: (res: IAllTaskResponse) => {
        this.tags.set([...res.getAllTags]);
        console.log('from side nav', this.tags());
        // this.cdr.markForCheck();
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
    // if (isPlatformBrowser(this.platformId)) {
    //   this.coreAuthService.user.subscribe({
    //     next: (userResponse: IUserReponse | null) => {
    //       console.log('userResponse ', userResponse);
    //       if (userResponse) {
    //         this.user.set(userResponse);
    //       }
    //     }

    //   });
    // }
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
