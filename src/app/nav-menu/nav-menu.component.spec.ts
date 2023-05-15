import { NavMenuComponent } from './nav-menu.component';
import {ApiService} from '../api.service';
import { DebugElement } from '@angular/core';
import { AppModule } from '../app.module';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

describe('NavMenuComponent', () => {

  let component : NavMenuComponent;
    
  let fixure : ComponentFixture<NavMenuComponent>
  
  let el: DebugElement;

  beforeEach(async(()=>{
    TestBed.configureTestingModule({
      imports:[AppModule,HttpClientTestingModule],
      providers: [ApiService]
    
    })
    .compileComponents()
    .then(()=>{

        fixure = TestBed.createComponent(NavMenuComponent);
        component = fixure.componentInstance;
        el = fixure.debugElement;
    });

    
  }));

  it('should create nav menu', () => {
    expect(component).toBeTruthy();
  });

  it("should display the nav menu", () => {
  
    fixure.detectChanges();
    const card = el.queryAll(By.css("mat-card"));
    expect(card).toBeTruthy("Navbar-Menu is not diplayed");

});

});
