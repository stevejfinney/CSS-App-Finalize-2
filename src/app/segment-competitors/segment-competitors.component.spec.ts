import { SegmentCompetitorsComponent } from './segment-competitors.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {ApiService} from '../api.service';
import { DebugElement } from '@angular/core';
import { AppModule } from '../app.module';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';



describe('SegmentCompetitorsComponent', () => {
  let component: SegmentCompetitorsComponent;
  let fixure: ComponentFixture<SegmentCompetitorsComponent>;
  let el: DebugElement;

  beforeEach(async(()=>{
    TestBed.configureTestingModule({
      imports:[AppModule,HttpClientTestingModule],
      providers: [ApiService]
    
    })
    .compileComponents()
    .then(()=>{

        fixure = TestBed.createComponent(SegmentCompetitorsComponent);
        component = fixure.componentInstance;
        el = fixure.debugElement;
    });

    
  }));


  it('should create segment competitor component', () => {
    expect(component).toBeTruthy();
  });

 
});
