import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpBackend } from '@angular/common/http';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { retry, catchError, map } from 'rxjs/operators';
//import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ServerEnvService {


    envvars = [] as any;

  constructor(private httpClient: HttpClient, public handler: HttpBackend) { 
    this.httpClient = new HttpClient(handler); // used this to bypass token interceptors used by authguard
  }

  handleError(error: HttpErrorResponse) {
    return throwError(error);
  }


  init() : Promise<Boolean>
  {
    return new Promise<Boolean>((resolve)=>{
      this.httpClient.get(`/api/env`).pipe(retry(3), catchError(this.handleError)).subscribe(
        (envvars) => {
            this.envvars = envvars;
            console.log(envvars);
            // add to store - can be accessed anywhere in angular now!
            sessionStorage.setItem('isOnline', this.envvars.isOnline);
            sessionStorage.setItem('prodVersion', this.envvars.prodVersion);
            sessionStorage.setItem('stageVersion', this.envvars.stageVersion);
            sessionStorage.setItem('appPort', this.envvars.appPort);
            resolve(true);
        });
    });
        
  }
}