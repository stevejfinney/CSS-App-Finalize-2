import { PermissionsComponent } from './permissions.component';
import {ApiService} from '../api.service';
import { DebugElement } from '@angular/core';
import { AppModule } from '../app.module';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

describe('PermissionsComponent', () => {

  let component : PermissionsComponent;
    
  let fixure : ComponentFixture<PermissionsComponent>
  
  let el: DebugElement;

  beforeEach(async(()=>{
    TestBed.configureTestingModule({
      imports:[AppModule,HttpClientTestingModule],
      providers: [ApiService]
    
    })
    .compileComponents()
    .then(()=>{

        fixure = TestBed.createComponent(PermissionsComponent);
        component = fixure.componentInstance;
        el = fixure.debugElement;
    });

    
  }));


  it('should create the permission component', () => {
    expect(component).toBeTruthy();
  });

  it("should display the fileds for data specialist", () => {
  
    fixure.detectChanges();
    const cards = el.queryAll(By.css("#ds_list"));
    expect(cards).toBeTruthy("Form fileds is not diplayed");

});

});
