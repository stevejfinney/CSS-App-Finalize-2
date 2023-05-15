
import { SegmentOfficialsComponent } from './segment-officials.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {ApiService} from '../api.service';
import { DebugElement } from '@angular/core';
import { AppModule } from '../app.module';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';


describe('SegmentOfficialsComponent', () => {
  let component: SegmentOfficialsComponent;
  let fixure: ComponentFixture<SegmentOfficialsComponent>;
  let el: DebugElement;

  beforeEach(async(()=>{
    TestBed.configureTestingModule({
      imports:[AppModule,HttpClientTestingModule],
      providers: [ApiService]
    
    })
    .compileComponents()
    .then(()=>{

        fixure = TestBed.createComponent(SegmentOfficialsComponent);
        component = fixure.componentInstance;
        el = fixure.debugElement;
    });

    
  }));


  it('should create SegmentOfficials component', () => {
    expect(component).toBeTruthy();
  });

});
