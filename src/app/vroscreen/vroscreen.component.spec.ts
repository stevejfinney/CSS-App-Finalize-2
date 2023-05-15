import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VROScreenComponent } from './vroscreen.component';

xdescribe('VROScreenComponent', () => {
  let component: VROScreenComponent;
  let fixture: ComponentFixture<VROScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VROScreenComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VROScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
