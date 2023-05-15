import { OfficialsComponent } from './officials.component';
import {ApiService} from '../api.service';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { AppModule } from '../app.module';
import { By } from '@angular/platform-browser';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

describe('official Component', () => {

  let component : OfficialsComponent;
  
  let fixure : ComponentFixture<OfficialsComponent>
  
  let el: DebugElement;

  beforeEach(async(()=>{
    TestBed.configureTestingModule({
      imports:[AppModule,HttpClientTestingModule],
      providers: [ApiService]
    
    })
    .compileComponents()
    .then(()=>{

        fixure = TestBed.createComponent(OfficialsComponent);
        component = fixure.componentInstance;
        el = fixure.debugElement;
    });

    
  }));

  it('should create official component', () => {
    expect(component).toBeTruthy();
  });

 
});
