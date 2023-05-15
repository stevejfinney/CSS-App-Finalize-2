import { Component, OnInit, Inject } from '@angular/core';
import { ApiService } from '../api.service';
import { LanguageSelector } from '../api.languageselector';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChatService } from '../chat_service';

@Component({
  selector: 'app-skate',
  templateUrl: './skate.component.html',
  styleUrls: ['./skate.component.css']
})
export class SkateComponent implements OnInit {

  language!: string;
  competitorentryid!: string;
  segmentid!: string;
  competitor = [] as any;

  skateTimeLeft!: number;
  reviewTimeLeft!: number;
  skateInterval: any;
  reviewInterval: any;
  skateRunning: boolean = false;
  skateTimerRunning: boolean = false;
  reviewRunning: boolean = false;
  startSkateTimerText = 'start';
  startReviewText = 'start';
  startSkateText = 'Start Skate';
  skateStatus = 'READY'; // status values: 'READY','SKATING','WBPREADY','FINALIZEREADY','SCOREREADY','COMPLETE'

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private apiService: ApiService, private languageSelector: LanguageSelector, private _chatService: ChatService) {

   

  }

  ngOnInit(): void {

    let competitorentryid = this.data.dataKey.competitorentryid;
    this.competitorentryid = competitorentryid;

    let segmentid = this.data.dataKey.segmentid;
    this.segmentid = segmentid;

    // var chat_room: any = {};
    // chat_room["room"] = segmentid;
    // chat_room["skater"] = competitorentryid;

    // this._chatService.loadSkater(chat_room);

   


    // get skater
    this.apiService.getCompetitorentry({ competitorentryid: competitorentryid }).subscribe(
      (competitor) => {
        this.competitor = competitor;
        this.reviewTimeLeft = this.competitor[0].reviewtime;
      }
    )

    this.language = this.languageSelector.getLanguage();
    this.skateTimeLeft = 0;
  }

  startSkate() {
    this.skateRunning = !this.skateRunning;
    if (this.skateRunning) {
      // start skate in db
      // toggleSkater(this.competitorentryid)
      this.startSkateText = 'End Skate';
      this.skateStatus = 'SKATING';
    }
    else {
      // stop skate in db
      this.startSkateText = 'Start Skate';
      this.skateStatus = 'WBPREADY';
    }
  }

  startSkateTimer() {
    this.skateTimerRunning = !this.skateTimerRunning;
    if (this.skateTimerRunning) {
      this.startSkateTimerText = 'stop';
      // SEND MESSAGE VIA CHAT ROOM
      // sendmessage('SKATESTART')
      this.skateInterval = setInterval(() => {
        this.skateTimeLeft++;
      }, 1000)
    }
    else {
      this.startSkateTimerText = 'resume';
      // SEND MESSAGE VIA CHAT ROOM
      // sendmessage('SKATEPAUSE')
      clearInterval(this.skateInterval);
    }
  }

  resetSkateTimer() {
    clearInterval(this.skateInterval);
    this.skateTimerRunning = false;
    this.startSkateTimerText = 'start';
    // SEND MESSAGE VIA CHAT ROOM
    // sendmessage('SKATERESET')
    this.skateTimeLeft = 0;
  }

  startReviewTimer() {
    this.reviewRunning = !this.reviewRunning;
    if (this.reviewRunning) {
      this.startReviewText = 'stop';
      // SEND MESSAGE VIA CHAT ROOM
      // sendmessage('REVIEWSTART')
      this.reviewInterval = setInterval(() => {
        if (this.reviewTimeLeft > 0) {
          this.reviewTimeLeft--;
        }
        else {
          this.resetReviewTimer();
        }
      }, 1000)
    }
    else {
      this.startReviewText = 'resume';
      // SEND MESSAGE VIA CHAT ROOM
      // sendmessage('REVIEWPAUSE')
      clearInterval(this.reviewInterval);
    }
  }

  resetReviewTimer() {
    clearInterval(this.reviewInterval);
    this.reviewRunning = false;
    this.startReviewText = 'start';
    // SEND MESSAGE VIA CHAT ROOM
    // sendmessage('REVIEWRESET')
    this.reviewTimeLeft = this.competitor[0].reviewtime;
  }

  ngOnDestroy() {
    clearInterval(this.reviewInterval);
    clearInterval(this.skateInterval);
  }




  // // test function for joining a room
  // joinRoom() {
  //   var chat_room: any = {};
  //   chat_room["room"] = this.segmentid;// + 'zz';
  //   chat_room["competitorentryid"] = this.competitorentryid;

  //   this._chatService.joinRoom(chat_room);
  // }

}
