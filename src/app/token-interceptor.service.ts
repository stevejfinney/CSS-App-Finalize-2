import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent  } from '@angular/common/http'
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})


export class TokenInterceptorService implements HttpInterceptor {

 constructor(private api : ApiService) { }

intercept(request : HttpRequest < any >, next : HttpHandler): Observable < HttpEvent < any >>
{
    // add authorization header with token if available
    let currentuser = this.api.isLoggedIn;
    let token = sessionStorage.getItem('token');

    
    if(currentuser && token !== undefined)
{
    request = request.clone({
        setHeaders:
        {
            Authorization: `Bearer ${token}`

        }
    });
}

return next.handle(request);
    }
}