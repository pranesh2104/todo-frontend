import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-sign-in',
  imports: [],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements OnInit {
  customerId!: string;


  @Input()
  set id(customerId: string) {
    this.customerId = customerId;
  }

  ngOnInit(): void {
    console.log('this.customerId ', this.customerId);
  }
}
