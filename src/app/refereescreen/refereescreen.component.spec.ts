import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefereescreenComponent } from './refereescreen.component';

xdescribe('RefereescreenComponent', () => {
  let component: RefereescreenComponent;
  let fixture: ComponentFixture<RefereescreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RefereescreenComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefereescreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
