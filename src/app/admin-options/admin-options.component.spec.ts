import{AdminOptionsComponent} from './admin-options.component';
import {ApiService} from '../api.service';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { AppModule } from '../app.module';
import { By } from '@angular/platform-browser';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

describe('Admin option Component', () => {

  let component : AdminOptionsComponent;
  
  let fixure : ComponentFixture<AdminOptionsComponent>
  
  let el: DebugElement;

  beforeEach(async(()=>{
    TestBed.configureTestingModule({
      imports:[AppModule,HttpClientTestingModule],
      providers: [ApiService]
    
    })
    .compileComponents()
    .then(()=>{

        fixure = TestBed.createComponent(AdminOptionsComponent);
        component = fixure.componentInstance;
        el = fixure.debugElement;
    });

    
  }));

  it("should create the admin option component", () => {

    expect(component).toBeTruthy();
    
  });



});
