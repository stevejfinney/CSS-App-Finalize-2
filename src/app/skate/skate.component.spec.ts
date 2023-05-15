import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkateComponent } from './skate.component';

xdescribe('SkateComponent', () => {
  let component: SkateComponent;
  let fixture: ComponentFixture<SkateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SkateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
