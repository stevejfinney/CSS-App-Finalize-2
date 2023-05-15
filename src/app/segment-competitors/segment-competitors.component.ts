import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { LanguageSelector } from '../api.languageselector';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-segment-competitors',
  templateUrl: './segment-competitors.component.html',
  styleUrls: ['./segment-competitors.component.css']
})
export class SegmentCompetitorsComponent implements OnInit {

    segmentid!: string;
    segment = [] as any;
    competitors = [] as any;
    language!: string;
    event = [] as any;
    runEventToggle: any;
    skateToggleKey: any;
    otherSkaterOnIce: any;

  constructor(private apiService: ApiService, private languageSelector: LanguageSelector, private fb: FormBuilder, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {

    let segmentid = this.activatedRoute.snapshot.params.segmentid;
    this.segmentid = segmentid;

    this.language = this.languageSelector.getLanguage();

    this.runEventToggle = true;
    this.otherSkaterOnIce = false;

    this.apiService.getSegmentById(segmentid).subscribe(
        (segment) => {
            this.segment = segment;    
        }
    );

    // get event details
    this.apiService.getEventBySegmentid(segmentid).subscribe(
        (event) => {
            this.event = event;
            this.runEventToggle = (this.event[0].inprogress == 1) ? true : false;
        });

    this.apiService.getSegmentCompetitors(segmentid).subscribe(
        (competitors) => {
            this.competitors = competitors;
            this.competitors.forEach((comp: any) => {
                if(comp.onice == 1) this.otherSkaterOnIce = true;
            })
        }
    )

    // check skate on ice
    this.skateToggleKey = false;
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.competitors, event.previousIndex, event.currentIndex);
    this.competitors.forEach((segment: { sortorder: any; }, idx: number) => {
        segment.sortorder = idx + 1;
    });
    // now update system
    this.apiService.updateSegmentCompetitorOrder(this.competitors).subscribe(
        (res) => {
            // res returns array of results for each item (4 skaters returns [1,1,1,1])
            // 1 is successful, 0 is fail.
            var resp = true;
            Object.values(res).forEach(val => {
                if(val == 0)
                    resp = false;
            });
            // we had a failure
            if(!resp)
                alert('Unable to update order, please try again');
        });
    }

    deleteEntry(competitorentryid: string) {
        
        var params = {competitorentryid: competitorentryid, segmentid: this.segmentid}
        if(confirm("Are you sure to delete this record?")) {
            this.apiService.deleteCompetitorEntry(params).subscribe(
                (res) => {
                    this.competitors = res;
                })
        }
    }

    randomStart() {
        this.apiService.randomStartOrder(this.segmentid).subscribe(
            (res) => {
                this.competitors = res;
            })
    }

    reverseStart() {
        this.apiService.reverseStartOrder(this.segmentid).subscribe(
            (res) => {
                this.competitors = res;
            })
    }

    prevStart() {
        this.apiService.prevStartOrder(this.segmentid).subscribe(
            (res) => {
                this.competitors = res;
            })
    }

    prevRankingStart() {
        this.apiService.prevRankingStart(this.segmentid).subscribe(
            (res) => {
                this.competitors = res;
            })
    }

    setWarmupGroups() {
        this.apiService.setWarmupGroups(this.segmentid).subscribe(
            (res) => {
                this.competitors = res;
            })
    }

    pdGroup() {
        this.apiService.setPDGroups(this.segmentid).subscribe(
            (res) => {
                this.competitors = res;
            })
    }

    pdCylceGroup() {
        this.apiService.cyclePDGroups(this.segmentid).subscribe(
            (res) => {
                this.competitors = res;
            })
    }

    skateToggle(command: any, segmentid: any, competitorentryid: any) {
        
        this.apiService.toggleSkater({segmentid:segmentid,competitorentryid:competitorentryid}).subscribe(
            (res) => {
                this.competitors = res;
                
                this.otherSkaterOnIce = false;
                this.competitors.forEach((comp: any) => {
                    if(comp.onice == 1) {
                        this.otherSkaterOnIce = true;
                        
                    }
                })
                switch(command) {
                    case 'start':
                        console.log(`SKATERSTART: ${competitorentryid}`);
                        // send chat event
                        // MADE UP FUNCTION NAME
                        // sendChatEvent('SKATERSTART','comp.competitorentryid')
                        break;
                    case 'stop':
                        console.log(`SKATERSTOP: ${competitorentryid}`);
                        // send chat event
                        // MADE UP FUNCTION NAME
                        // sendChatEvent('SKATERSTART','comp.competitorentryid')
                        break;
                }
            })
    }
}
