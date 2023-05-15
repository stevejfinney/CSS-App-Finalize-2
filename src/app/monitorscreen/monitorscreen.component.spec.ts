import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorscreenComponent } from './monitorscreen.component';

xdescribe('MonitorscreenComponent', () => {
  let component: MonitorscreenComponent;
  let fixture: ComponentFixture<MonitorscreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonitorscreenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitorscreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
