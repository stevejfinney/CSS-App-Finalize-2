import { LtsComponent } from './lts.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {ApiService} from '../api.service';
import { DebugElement } from '@angular/core';
import { AppModule } from '../app.module';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';


describe('LtsComponent', () => {
  let component: LtsComponent;
  let fixure: ComponentFixture<LtsComponent>;
  let el: DebugElement;

  beforeEach(async(()=>{
    TestBed.configureTestingModule({
      imports:[AppModule,HttpClientTestingModule],
      providers: [ApiService]
    
    })
    .compileComponents()
    .then(()=>{

        fixure = TestBed.createComponent(LtsComponent);
        component = fixure.componentInstance;
        el = fixure.debugElement;
    });

    
  }));


  it('should create Lts component', () => {
    expect(component).toBeTruthy();
  });

 
});
