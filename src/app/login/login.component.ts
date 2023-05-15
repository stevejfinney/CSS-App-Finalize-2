import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {


    hide: boolean = true;
    formResponse: any;
    loading = false;

    constructor(private fb: FormBuilder,
        private apiService: ApiService,
        private _router: Router,
        private msalService: MsalService) { 
            //msalService.instance.getActiveAccount;
         }

    ngOnInit() { 
        this.msalService.instance.handleRedirectPromise().then(
            res => {
                if(res != null && res.account != null) {
                    this.msalService.instance.setActiveAccount(res.account);
                    console.log(res.account);
                    // now we use the account obj to check permissions on crm!!
                }
            }
        )
    }

    isLoggedInMsal() : boolean {
        return this.msalService.instance.getActiveAccount () != null;
    }

    loginMsal() {
        this.msalService.loginRedirect();
        //this.msalService.loginPopup().subscribe( (response: AuthenticationResult) => {
        //    this.msalService.instance.setActiveAccount(response.account)
        //})
    }

    logoutMsal() {
        this.msalService.logout();
    }

    /* old login */
    loginForm: FormGroup = this.fb.group({
        password: [''],
        username: ['']
    })



    onLogin() {
        this.loading = true;
        // Get and check the credentials
        if(this.loginForm.valid){
            this.apiService.doAuth(this.loginForm.value).subscribe(
                (res) => {

                    console.log("login done",res);
                    
                    var resp = JSON.parse(JSON.stringify(res)); // yes, i had to stringify then parse this....
                    if (resp.accessToken) {
                        //store user details and token in session storage
                        this.apiService.loginStatus.next(true);
                        sessionStorage.setItem('loginStatus', '1');
                        sessionStorage.setItem('accessToken', resp.accessToken);
                        sessionStorage.setItem('refreshToken', resp.refreshToken);
                        sessionStorage.setItem('firstname', resp.firstname);
                        sessionStorage.setItem('lastname', resp.lastname);
                        sessionStorage.setItem('scnum', resp.scnum);
                        sessionStorage.setItem('contactid', resp.contactid);
                        sessionStorage.setItem('roles', resp.roles);
                        this.formResponse = `User Logged In Succesfully`;
                        this._router.navigate(['/dashboard']);
                        this.apiService.UserName.next(sessionStorage.getItem('firstname') || '');
                    }
                    else {
                        this.formResponse = `Token Not issued!`;
                        this.loading = false;
                    }
            },
                (error) => {
                    //console.log(error.error.body);
                    this.formResponse = `${JSON.stringify(error.error.returnError)}`;
                    this.loading = false;
                })

        }
    
    }  
}