
import { AppComponent } from './app.component';
import {ApiService} from './api.service';
import { DebugElement } from '@angular/core';
import { AppModule } from './app.module';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';


describe('AppComponent', () => {
  let component: AppComponent;
  let fixure: ComponentFixture<AppComponent>;
  let el: DebugElement;

  beforeEach(async(()=>{
    TestBed.configureTestingModule({
      imports:[AppModule,HttpClientTestingModule],
      providers: [ApiService]
    
    })
    .compileComponents()
    .then(()=>{

        fixure = TestBed.createComponent(AppComponent);
        component = fixure.componentInstance;
        el = fixure.debugElement;
    });

    
  }));


  it('should create app component', () => {
    expect(component).toBeTruthy();
  });

 
});
