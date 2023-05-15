import { EventsComponent } from './events.component';
import {ApiService} from '../api.service';
import {  async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { AppModule } from '../app.module';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { Router } from '@angular/router';


describe('Event Component', () => {

    let component : EventsComponent;
    
    let fixure : ComponentFixture<EventsComponent>
    
    let el: DebugElement;
  
    beforeEach(async(()=>{
      TestBed.configureTestingModule({
        imports:[AppModule,HttpClientTestingModule],
        providers: [ApiService]
      
      })
      .compileComponents()
      .then(()=>{
  
          fixure = TestBed.createComponent(EventsComponent);
          component = fixure.componentInstance;
          el = fixure.debugElement;
      });
  
      
    }));

    it("should create the event component", () => {
  
      expect(component).toBeTruthy();
      //console.log(component);
      
    });
  
    it("should display the fileds for input", () => {
  
        fixure.detectChanges();
        const cards = el.queryAll(By.css("mat-card"));
        //console.log(forms[0].nativeNode);
        expect(cards).toBeTruthy("Cards are not diplayed");

    });
  
  
  });
