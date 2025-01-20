import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  imports: [MatCardModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {

  selectedEmail!: string;

  private readonly route = inject(ActivatedRoute);


  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams: Params) => {
      if (queryParams && queryParams['email']) {
        this.selectedEmail = queryParams['email'];
        console.log('select ', this.selectedEmail);
      }
    });
  }

}
