import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BroadcasterscreenComponent } from './broadcasterscreen.component';

xdescribe('BroadcasterscreenComponent', () => {
  let component: BroadcasterscreenComponent;
  let fixture: ComponentFixture<BroadcasterscreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BroadcasterscreenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BroadcasterscreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
