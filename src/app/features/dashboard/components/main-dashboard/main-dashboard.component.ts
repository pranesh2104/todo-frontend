import { Component, inject, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-dashboard',
  imports: [CommonModule],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.scss'
})
export class MainDashboardComponent implements OnInit {

  private taskService = inject(TaskService);

  tasks: any = [];

  ngOnInit(): void {
    this.taskService.getAllTasks().subscribe({
      next: (res) => {
        this.tasks = res;
        console.log('all task response ', res);
      },
      error: (error) => {
        console.error('all task error ', error);
      }
    })
  }

}
