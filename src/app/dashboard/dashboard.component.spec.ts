import {ApiService} from '../api.service';
import {  async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { AppModule } from '../app.module';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { Router } from '@angular/router';
import { DashboardComponent } from './dashboard.component';


describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let el: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardComponent ]
    })
    .compileComponents();
  });

  
  beforeEach(async(()=>{
      TestBed.configureTestingModule({
        imports:[AppModule,HttpClientTestingModule],
        providers: [ApiService]
      
      })
      .compileComponents()
      .then(()=>{
  
          fixture = TestBed.createComponent(DashboardComponent);
          component = fixture.componentInstance;
          el = fixture.debugElement;
      });
  
      
    }));
	

  it('should create the dashboard component', () => {
    expect(component).toBeTruthy();
  });
});

