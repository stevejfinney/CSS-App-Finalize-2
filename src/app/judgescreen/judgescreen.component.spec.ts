import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ApiService } from '../api.service';
import { DebugElement } from '@angular/core';
import { AppModule } from '../app.module';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { JudgescreenComponent } from './judgescreen.component';

import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';



xdescribe('Judge screen component', () => {

  let component: JudgescreenComponent;

  let fixure: ComponentFixture<JudgescreenComponent>

  let el: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AppModule,
        HttpClientTestingModule
      ],
      providers: [ApiService, { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} }]


    })
      .compileComponents()
      .then(() => {

        fixure = TestBed.createComponent(JudgescreenComponent);
        component = fixure.componentInstance;
        el = fixure.debugElement;
      });


  }));

  it("should create the Judge screen component", () => {

    expect(component).toBeTruthy();
    //console.log(component);

  });




});
