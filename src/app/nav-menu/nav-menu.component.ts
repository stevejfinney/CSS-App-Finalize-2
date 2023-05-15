import { Component, OnInit } from '@angular/core';
import { Router ,NavigationEnd  } from '@angular/router';
import { Observable } from 'node_modules/rxjs';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit {

  siteLanguage:any='English';
  url_en:any="";
  url_fr:any="";

  path:any="";
  sitelocale:any;

  languageList=[
    {code:'en',label:'English'},
    {code:'fr',label:'Français'}
  ]

  constructor(private apiService: ApiService, private router:Router) { }

  UserName$!: Observable<string>;
  OnlineStatus$!: Observable<string>;
  isLoggedIn: boolean = false;


  ngOnInit() {
    this.apiService.isLoggedIn.subscribe((res: boolean) => {
      this.isLoggedIn = res;
    })
    
    
    this.UserName$ = this.apiService.currentUserName; //return the current user first name
    this.OnlineStatus$ = this.apiService.OnlineStatus;

    this.sitelocale = window.location.pathname.split('/')[1];
    
    
    this.router.events.subscribe((val) => {
      
      this.path = window.location.href.split('/');
      this.path[3]="en";
      this.url_en = this.path.join("/");

      this.path[3]="fr";
      this.url_fr = this.path.join("/");
  
      //console.log("4",this.url);
      
  });

    this.siteLanguage = this.languageList.find(f=>f.code === this.sitelocale)?.label;
    
    if (this.sitelocale == '') 
    {
      this.siteLanguage = 'English';
    }
    this.apiService.isLoggedIn.subscribe((res: boolean) => {
      this.isLoggedIn = res;
    })
    this.UserName$ = this.apiService.currentUserName; //return the current user first name
    
  }

  onLogout() {
    this.apiService.logoutUser(); //clear the storage, close the session and logout the user
  }

}
