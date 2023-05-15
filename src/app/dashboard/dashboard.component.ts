import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { LanguageSelector } from '../api.languageselector';
import { Router } from '@angular/router'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  events = [] as any;
  assignments = [] as any;
  language!: string;

  constructor(
    private apiService: ApiService,
    private languageSelector: LanguageSelector,
    private _router: Router) { }

  ngOnInit(): void {

    this.language = this.languageSelector.getLanguage();

    this.apiService.getEvents().subscribe(
      (events) => {
        this.events = events;
      }
    );

    this.apiService.getJudgeAssignments().subscribe(
      (assignments) => {
        this.assignments = assignments;
        console.log("sasasa",assignments);
      }
    );

  }

  editEvent(eventid: string) {
    this._router.navigate([`/event/${eventid}`]);
  }

  

}
