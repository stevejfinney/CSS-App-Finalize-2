import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RinksComponent } from './rinks.component';

xdescribe('RinksComponent', () => {
  let component: RinksComponent;
  let fixture: ComponentFixture<RinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RinksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
