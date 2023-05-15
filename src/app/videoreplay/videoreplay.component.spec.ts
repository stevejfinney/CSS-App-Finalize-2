import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoreplayComponent } from './videoreplay.component';

xdescribe('VideoreplayComponent', () => {
  let component: VideoreplayComponent;
  let fixture: ComponentFixture<VideoreplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VideoreplayComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoreplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
