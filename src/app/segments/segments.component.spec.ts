import {ApiService} from '../api.service';
import { DebugElement } from '@angular/core';
import { AppModule } from '../app.module';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SegmentsComponent } from './segments.component';


xdescribe('SegmentsComponent', () => {

  let component: SegmentsComponent;
  let fixure: ComponentFixture<SegmentsComponent>;
  let el: DebugElement;

  beforeEach(async(()=>{
    TestBed.configureTestingModule({
      imports:[AppModule,HttpClientTestingModule],
      providers: [ApiService]
    
    })
    .compileComponents()
    .then(()=>{

        fixure = TestBed.createComponent(SegmentsComponent);
        component = fixure.componentInstance;
        el = fixure.debugElement;
    });

    
  }));

  

  it('should create segment component', () => {
    expect(component).toBeTruthy();
  });

  it("should display the fileds", () => {
  
    fixure.detectChanges();
    const cards = el.queryAll(By.css("mat-card"));
    expect(cards).toBeTruthy("Form fileds is not diplayed");

});
});
