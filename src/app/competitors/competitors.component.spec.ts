import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CompetitorsComponent } from './competitors.component';

import {ApiService} from '../api.service';
import { DebugElement } from '@angular/core';
import { AppModule } from '../app.module';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';



describe('CompetitorsComponent', () => {
  let component: CompetitorsComponent;
  let fixure: ComponentFixture<CompetitorsComponent>;
  let el: DebugElement;

  beforeEach(async(()=>{
    TestBed.configureTestingModule({
      imports:[AppModule,HttpClientTestingModule],
      providers: [ApiService]
    
    })
    .compileComponents()
    .then(()=>{

        fixure = TestBed.createComponent(CompetitorsComponent);
        component = fixure.componentInstance;
        el = fixure.debugElement;
    });

    
  }));


  it('should create competitor component', () => {
    expect(component).toBeTruthy();
  });

 
});
