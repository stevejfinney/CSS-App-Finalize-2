import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
  })
export class ApiGuard implements CanActivate {
    constructor(
        private router: Router,
        private apiService: ApiService
        ) {}
    
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree>
        | Promise<boolean | UrlTree>
        | boolean
        | UrlTree {
        
            // get if system running in online / offline mode
            const onlineMode = this.apiService.checkIsOnline();

            // get if user is logged in
            const loggedIn = this.apiService.checkLoginStatus();

            // get user roles
            var userRoles = this.apiService.getUserRoles();
            
            // get roles for component
            var compRoles = next.data.requiresRoles;

            if(onlineMode) { // if true then check if already logged in
                if(!loggedIn) {
                    this.router.navigate(['/login']);
                    return false;
                }
                else {
                    // check role
                    if(compRoles) { // if needs specific roles run a check
                        return this.checkRoles(compRoles,userRoles)
                    }
                    else {
                        return true;
                    }
                }
            }
            else { // then we're offline and need to check if route requires login
                const offlineLogin = next.data.offlineLogin;
                if(offlineLogin === 'true') { // if true, then check logged in
                    if(!loggedIn) {
                        this.router.navigate(['/login']);
                        return false;
                    }
                    else {
                        // check role
                        if(compRoles) { // if needs specific roles run a check
                            return this.checkRoles(compRoles,userRoles)
                        }
                        else {
                            return true;
                        }
                    }
                }
                else { // we're offline and no login required
                    return true;
                }
            }
    }

    checkRoles(compRoles: string,userRoles: string) {
        var compRolesArr = compRoles.split(',');
        var userRolesArr = userRoles.split(',');
        var hasRole = false;
        compRolesArr.forEach((element: any) => {
            if(userRolesArr.includes(element)) {
                hasRole = true;
            }
        })
        return hasRole;
    }
}

