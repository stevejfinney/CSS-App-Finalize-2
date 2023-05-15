import { Component } from '@angular/core';
import { ApiService } from './api.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
  
    title = 'CSS';
    envvars = [] as any;

    constructor(public apiService: ApiService) { 
        
        /*
        // putting call to env vars here for now
        this.apiService.getEnv().subscribe(
            (envvars) => {
                this.envvars = envvars;
                //console.log(envvars);
                // add to store - can be accessed anywhere in angular now!
                sessionStorage.setItem('isOnline', this.envvars.isOnline);
                sessionStorage.setItem('prodVersion', this.envvars.prodVersion);
                sessionStorage.setItem('stageVersion', this.envvars.stageVersion);
            });
        */
    }
}
