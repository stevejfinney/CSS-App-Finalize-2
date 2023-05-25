import { Component, OnInit  } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'node_modules/rxjs';

@Component({
  selector: 'app-admin-options',
  templateUrl: './admin-options.component.html',
  styleUrls: ['./admin-options.component.css']
})
export class AdminOptionsComponent implements OnInit {

  title = "Admin Section";
  apiTitle = "API Db Functions";
  checkDbMsg = "";
  rebuildDbMsg = "";
  updateDbMsg = "";
  updateDefinitionsMsg = "";
  updateSchemaMsg = "";
  configToTestRes = [] as any;
  configToTestErr = "";
  testToProdRes = [] as any;
  testToProdErr = "";
  testVersion = "";
  prodVersion = "";

  msgProdVersion!: string;
  msgStageVersion!: string;

  OnlineStatus$!: Observable<string>;

  constructor(private apiService: ApiService) {
    
  }

  ngOnInit(): void {
    this.OnlineStatus$ = this.apiService.OnlineStatus;

    this.msgProdVersion = sessionStorage.getItem('prodVersion')!;
    this.msgStageVersion = sessionStorage.getItem('stageVersion')!;
  }

  // check database request and response handler
  checkDb() {
    this.apiService.checkDb().subscribe(
      (response) => {
        var resp = JSON.parse(JSON.stringify(response)); // yes, i had to stringify then parse this....
        if(resp.result == 'true') {
          this.checkDbMsg = 'Database file exists';
        }
        else {
          this.checkDbMsg = `Database file does not exist || ${resp.error}`;
        }
      },
      (error) => console.log(error))
    //console.log('checkDb');
  }

  // rebuild database request and response handler
  rebuildDb() {
    this.apiService.rebuildDb().subscribe(
      (response) => {
        var resp = JSON.parse(JSON.stringify(response)); // yes, i had to stringify then parse this....
        if(resp.result == 'true') {
          this.rebuildDbMsg = 'Database rebuild successful';
        }
        else {
          this.rebuildDbMsg = `Unable to rebuild database || ${resp.error}`;
        }
      },
      (error) => console.log(error))
    //console.log('rebuildDb');
  }

  // update database request
  checkDbVersion() {
    this.apiService.checkDbVersion().subscribe(
      (response) => {
        var resp = JSON.parse(JSON.stringify(response)); // yes, i had to stringify then parse this....
        if(resp.result == 'true') {
          this.updateDbMsg = `Database is up to date || ${resp.error}`;
        }
        else {
          this.updateDbMsg = `Out of date || ${resp.error}`;
        }
      },
      (error) => console.log(error))
    //console.log('updateDb');
  }

  // update database definitions
  updateDefinitions() {
    let params = { "accessToken": sessionStorage.getItem('accessToken') };
    this.apiService.updateDefinitions(params).subscribe(
        (response) => {
          var resp = JSON.parse(JSON.stringify(response)); // yes, i had to stringify then parse this....
          if(resp.result == 'true') {
            this.updateDefinitionsMsg = `Definitions updated`;
          }
          else {
            this.updateDefinitionsMsg = `Definitions not updated || ${resp.error}`;
          }
        },
        (error) => console.log(error))
      //console.log('updateDefinitions');
  }

  // update db schema
  updateSchema() {
    this.apiService.updateSchema().subscribe(
      (response) => {
        var resp = JSON.parse(JSON.stringify(response)); // yes, i had to stringify then parse this....
        if(resp.result == 'true') {
          this.updateSchemaMsg = `Schema updated || ${resp.error}`;
        }
        else {
          this.updateSchemaMsg = `Schema not updated || ${resp.error}`;
        }
      },
      (error) => console.log(error))
    //console.log('updateDefinitions');
  }

  // copy scoring config to test (stage)
  configToTest() {
    this.testVersion = `Please wait, this may take a few minutes!`;
    this.configToTestRes = [];
    this.configToTestErr = "";
    this.apiService.configToTest().subscribe(
        (response) => {
          var resp = JSON.parse(JSON.stringify(response)); // yes, i had to stringify then parse this....
          this.testVersion = `${resp.message}`;
          //this.configToTestRes = resp.dbresp;
        },
        (error) => this.configToTestErr = error.error)
  }

  // copy scoring test to prod
  testToProd() {
    this.prodVersion = `Please wait, this may take a few minutes!`;
    this.testToProdRes = [];
    this.testToProdErr = "";
    this.apiService.testToProd().subscribe(
        (response) => {
          var resp = JSON.parse(JSON.stringify(response)); // yes, i had to stringify then parse this....
          this.prodVersion = `CSS Production version updated to ${resp.version}`;
          this.testToProdRes = resp.dbresp;
        },
        (error) => {
            this.testToProdErr = error.error;
        })
  }

}
