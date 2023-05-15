import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnouncerscreenComponent } from './announcerscreen.component';

xdescribe('AnnouncerscreenComponent', () => {
  let component: AnnouncerscreenComponent;
  let fixture: ComponentFixture<AnnouncerscreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnouncerscreenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnouncerscreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
