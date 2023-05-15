import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class LanguageSelector {

    constructor(private router: Router)  { }

    handleError(error: HttpErrorResponse) {
        return throwError(error);
    }

    public getLanguage() {
        var language;

        // get language from url or default to english
        if(window.location.href.indexOf("/en/") > -1) language = 'en';
        if(window.location.href.indexOf("/fr/") > -1) language = 'fr';
        if(!language) language = 'en';

        return language;
    }

}