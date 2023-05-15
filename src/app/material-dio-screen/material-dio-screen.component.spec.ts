import { LayoutModule } from '@angular/cdk/layout';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { waitForAsync, async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MaterialDioScreenComponent } from './material-dio-screen.component';


import {ApiService} from '../api.service';
import { DebugElement } from '@angular/core';
import { AppModule } from '../app.module';
import { By } from '@angular/platform-browser';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import { ChatService } from '../chat_service';


xdescribe('Material Component', () => {

    
    let component : MaterialDioScreenComponent;
    
    let fixure : ComponentFixture<MaterialDioScreenComponent>
    
    let el: DebugElement;
  
    beforeEach(async(()=>{
      TestBed.configureTestingModule({
        imports:[
          AppModule,
          HttpClientTestingModule,
          NoopAnimationsModule,
          LayoutModule,
          MatButtonModule,
          MatCardModule,
          MatGridListModule,
          MatIconModule,
          MatMenuModule],
        providers: [ApiService,ChatService]

      })
      .compileComponents()
      .then(()=>{
  
          fixure = TestBed.createComponent(MaterialDioScreenComponent);
          component = fixure.componentInstance;
          el = fixure.debugElement;
      });
  
      
    }));

    xit("should create the materail component", () => {
  
      expect(component).toBeTruthy();
      //console.log(component);
      
    });
  
   
  
  
  });
