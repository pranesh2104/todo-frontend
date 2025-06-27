import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonResetComponent } from './common-reset.component';

describe('CommonResetComponent', () => {
  let component: CommonResetComponent;
  let fixture: ComponentFixture<CommonResetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonResetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
