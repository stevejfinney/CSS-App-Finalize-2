import { CategoriesComponent } from './categories.component';
import {ApiService} from '../api.service';
import { DebugElement } from '@angular/core';
import { AppModule } from '../app.module';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';


describe('Categories Component', () => {

  let component : CategoriesComponent;
    
  let fixure : ComponentFixture<CategoriesComponent>
  
  let el: DebugElement;
  beforeEach(async(()=>{
    TestBed.configureTestingModule({
      imports:[AppModule,HttpClientTestingModule],
      providers: [ApiService]
    
    })
    .compileComponents()
    .then(()=>{

        fixure = TestBed.createComponent(CategoriesComponent);
        component = fixure.componentInstance;
        el = fixure.debugElement;
    });

    
  }));

  it('should create category component', () => {
    expect(component).toBeTruthy();
  });

  it("should display card ", () => {
  
    fixure.detectChanges();
    const menu = el.queryAll(By.css("mat-toolbar"));
    expect(menu).toBeTruthy("Navbar-Menu is not diplayed");

});

});
