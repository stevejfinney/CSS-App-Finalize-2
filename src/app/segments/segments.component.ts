import { Component, OnInit, Inject, Pipe, PipeTransform } from '@angular/core';
import { ApiService } from '../api.service';
import { LanguageSelector } from '../api.languageselector';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RinksComponent } from '../rinks/rinks.component';

@Component({
  selector: 'app-segments',
  templateUrl: './segments.component.html',
  styleUrls: ['./segments.component.css']
})
export class SegmentsComponent implements OnInit {

    categoryid!: string;
    category = [] as any;
    segments = [] as any;
    segment = [] as any;
    selectedSegmentValue! : string;
    availSegments = [] as any;
    selectedWbpValue!: string;
    nextOrderNumber!: string;
    formResponse: any;
    times = [] as any;
    language!: string;
    patternDances = [] as any;
    selectedPatternDanceValue! : string;
    viewDances = false;
    rinks = [] as any;
    availRinks = [] as any;
    selectedRinkValue! : string;
    runEventToggle: any;
    runStreamToggle: any;
    segmentActive: any;

    constructor(private apiService: ApiService, private languageSelector: LanguageSelector, private fb: FormBuilder, private activatedRoute: ActivatedRoute, private router: Router, public dialog: MatDialog) { }

    ngOnInit(): void {
        let categoryid = this.activatedRoute.snapshot.params.categoryid;
        this.categoryid = categoryid;

        this.language = this.languageSelector.getLanguage();

        this.runEventToggle = true;
        this.segmentActive = false;

        this.apiService.getCategoryById(categoryid).subscribe(
            (category) => {
                this.category = category;
                this.apiService.getRinksByEvent(this.category[0].eventid).subscribe(
                    (rinks) => {
                        if(JSON.stringify(rinks).length > 2) {
                            this.availRinks = rinks;
                            // default dropdown to first option
                            this.selectedRinkValue = this.availRinks[0].rinkid;
                        }
                    });
            });

        this.apiService.getSegmentsByCategory(categoryid).subscribe(
            (segments) => {
                if(JSON.stringify(segments).length > 2) {
                    this.segments = segments;
                    this.nextOrderNumber = this.segments.length + 1;
                    
                    // loop thru segments, if one active disable comp and official buttons
                    this.segments.forEach((segment: any) => {
                        if(segment.inprogress == 1) this.segmentActive = true;
                    });
                }
            });

        this.apiService.getAvailableSegmentsByCategory(categoryid).subscribe(
            (availSegments) => {
                if(JSON.stringify(availSegments).length > 2) {
                    this.availSegments = availSegments;
                    // default dropdown to first option
                    this.selectedSegmentValue = this.availSegments[0].sc_skatingsegmentdefinitionsid;
                    
                    //if(this.availSegments[0].languages.en.name.indexOf('Pattern') !== -1) {
                    if(this.availSegments[0].sc_patterndancesegment == 1) {
                        // show the dance selector for pattern dances
                        this.viewDances = true;
                        console.log('gerg')
                    }
                }
                
            });

        
            
        this.selectedWbpValue = 'yes';

        this.apiService.getPatternDances().subscribe(
            (patternDances) => {
                this.patternDances = patternDances;
            }
        )
    }

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.segments, event.previousIndex, event.currentIndex);
        this.segments.forEach((segment: { performanceorder: any; }, idx: number) => {
            segment.performanceorder = idx + 1;
        });
        // now update system
        this.apiService.updateSegmentOrder(this.segments).subscribe(
            (resp) => {
                //alert('Order updated');
            });
    }

    segmentForm(action: string, segmentid: any) {
        const dialogRef = this.dialog.open(segmentsForm, {
            height: '70%',
            width: '60%',
            data: {
                dataKey: {action:action, categoryid:this.categoryid, segmentid:segmentid}
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            this.apiService.getSegmentsByCategory(this.categoryid).subscribe(
                (segments) => {
                    if(JSON.stringify(segments).length > 2) {
                        this.segments = segments;
                        this.nextOrderNumber = this.segments.length + 1;
                        
                        // loop thru segments, if one active disable comp and official buttons
                        this.segments.forEach((segment: any) => {
                            if(segment.inprogress == 1) this.segmentActive = true;
                        });
                    }
                });
        });
    }

    deleteSegment(segmentid: string, categoryid: string) {
        var params = {segmentid: segmentid, categoryid: categoryid}
        if(confirm("Are you sure to delete this record?")) {
            this.apiService.deleteSegment(params).subscribe(
                (res) => {
                    this.segments = res;
                },
                (error) => {
                    //console.log(error.error.body);
                    this.formResponse = `${JSON.stringify(error.error.returnError)}`;
                })
        }
    }

    viewPcFactors(definitionid: string) {
        var params = {definitionid: definitionid};
        this.apiService.viewPcFactors(params).subscribe(
            (res) => {
                var resp = JSON.parse(JSON.stringify(res));
                if(!resp.error) {
                    const dialogRef = this.dialog.open(pcFactors, {
                        data: {
                            dataKey: res
                        }
                    });
                }
                else {
                    alert('No PC Factors for this segment');
                }
            },
            (error) => {
                //console.log(error.error.body);
                this.formResponse = `${JSON.stringify(error.error.returnError)}`;
            }
        )
    }

    viewStandardsCriteria(definitionid: string) {
        var params = {definitionid: definitionid};
        this.apiService.viewStandardsCriteria(params).subscribe(
            (res) => {
                var resp = JSON.parse(JSON.stringify(res));
                if(!resp.error) {
                    const dialogRef = this.dialog.open(standardsCriteria, {
                        data: {
                            dataKey: res
                        }
                    });
                }
                else {
                    alert('No Criteria for this segment');
                }
            },
            (error) => {
                this.formResponse = `${JSON.stringify(error.error.returnError)}`;
            }
        )
    }

    /*
    addRink(eventid: string) {
        const dialogRef = this.dialog.open(RinksComponent, {
            height: '70%',
            width: '60%',
            data: {
                dataKey: {eventid:eventid}
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            this.apiService.getRinksByEvent(this.category[0].eventid).subscribe(
                (rinks) => {
                    if(JSON.stringify(rinks).length > 2) {
                        this.availRinks = rinks;
                        // default dropdown to first option
                        this.selectedRinkValue = this.availRinks[0].rinkid;
                    }
                });
        });
    }
    */

    addCompetitors(categoryid: string) {
        this.router.navigate([`/competitors/${categoryid}`]);
    }

    addOfficials(categoryid: string) {
        this.router.navigate([`/officials/${categoryid}`]);
    }

    // toggleStream(event: any,eventid: any) {
    //     var islive = (event == true) ? 1 : 0;
    //     var params = {eventid: eventid, islive: islive}
    //     // update rink feed is live field
    //     this.apiService.setRinkFeedLive(params).subscribe(
    //         (res) => {
    //             var resp = JSON.parse(JSON.stringify(res));
    //             if(resp.response == 'on') {
    //                 // send chat event
    //                 // MADE UP FUNCTION NAME
    //                 // sendChatEvent('LIVEFEEDACTIVE')
    //             }
    //             else {
    //                 // send chat event
    //                 // MADE UP FUNCTION NAME
    //                 // sendChatEvent('LIVEFEEDINACTIVE')
    //             }
    //         },
    //         (error) => {
    //             console.log(error.error.body);
    //         }
    //     )
    // }
    
}

@Component({
    selector: 'segmentsForm',
    templateUrl: './segmentsForm.component.html',
})
export class segmentsForm {

    categoryid!: string;
    category = [] as any;
    segments = [] as any;
    segment = [] as any;
    selectedSegmentValue! : string;
    availSegments = [] as any;
    selectedWbpValue!: string;
    nextOrderNumber!: string;
    formResponse: any;
    times = [] as any;
    language!: string;
    patternDances = [] as any;
    selectedPatternDanceValue! : string;
    viewDances = false;
    rinks = [] as any;
    availRinks = [] as any;
    selectedRinkValue! : string;
    runEventToggle: any;
    runStreamToggle: any;
    segmentActive: any;

    constructor(public dialogRef: MatDialogRef<segmentsForm>, @Inject(MAT_DIALOG_DATA) public data: any, private apiService: ApiService, private fb: FormBuilder, private languageSelector: LanguageSelector) {}
    
    ngOnInit() {
        this.categoryid = this.data.dataKey.categoryid;
        this.segmentForm.controls['categoryid'].setValue(this.data.dataKey.categoryid);

        this.language = this.languageSelector.getLanguage();

        this.apiService.getCategoryById(this.categoryid).subscribe(
            (category) => {
                this.category = category;
                this.apiService.getRinksByEvent(this.category[0].eventid).subscribe(
                    (rinks) => {
                        if(JSON.stringify(rinks).length > 2) {
                            this.availRinks = rinks;
                            // default dropdown to first option
                            this.selectedRinkValue = this.availRinks[0].rinkid;
                        }
                    });
            });

        this.apiService.getAvailableSegmentsByCategory(this.categoryid).subscribe(
            (availSegments) => {
                if(JSON.stringify(availSegments).length > 2) {
                    this.availSegments = availSegments;
                    // default dropdown to first option
                    this.selectedSegmentValue = this.availSegments[0].sc_skatingsegmentdefinitionsid;
                    
                    //if(this.availSegments[0].languages.en.name.indexOf('Pattern') !== -1) {
                    if(this.availSegments[0].sc_patterndancesegment == 1) {
                        // show the dance selector for pattern dances
                        this.viewDances = true;
                    }
                }
                
            });

        this.selectedWbpValue = 'yes';

        this.apiService.getPatternDances().subscribe(
            (patternDances) => {
                this.patternDances = patternDances;
            }
        )

        // edit or new?
        if(this.data.dataKey.action === 'edit' && this.data.dataKey.segmentid) {
            this.editSegment(this.data.dataKey.segmentid)
        }
        else {
            this.apiService.getAvailableSegmentsByCategory(this.categoryid).subscribe(
                (availSegments) => {
                    if(JSON.stringify(availSegments).length > 2) {
                        this.availSegments = availSegments;
                        // default dropdown to first option
                        this.selectedSegmentValue = this.availSegments[0].sc_skatingsegmentdefinitionsid;
                        
                        //if(this.availSegments[0].languages.en.name.indexOf('Pattern') !== -1) {
                        if(this.availSegments[0].sc_patterndancesegment == 1) {
                            // show the dance selector for pattern dances
                            this.viewDances = true;
                        }

                        this.addSegment();
                    }
                    
                });
        }
    }

    segmentForm: FormGroup = this.fb.group({
        segmentid: [''],
        categoryid: [''],
        definitionid: [''],
        rinkid: [''],
        enname: [''],
        frname: [''],
        performanceorder: [''],
        warmupgroupmaxsize: [''],
        wellbalanced: [''],
        reviewtimemins: [''],
        reviewtimesecs: [''],
        reviewtime: [''],
        patterndanceid: [''],
        startdate:  [''],
        enddate:  ['']
    })

    addSegment() {
        // get defaults from db
        this.apiService.getSegmentDefinitionDefaults(this.selectedSegmentValue).subscribe(
            (res) => {
                var resp = JSON.parse(JSON.stringify(res)); // yes, i had to stringify then parse this....
                // reset form
                this.segmentForm.controls['segmentid'].setValue('');
                this.segmentForm.controls['enname'].setValue(resp[0].languages.en.name);
                this.segmentForm.controls['frname'].setValue(resp[0].languages.fr.name);
                this.segmentForm.controls['warmupgroupmaxsize'].setValue(resp[0].sc_warmupgroupmaximumsize ? resp[0].sc_warmupgroupmaximumsize : 0);
                this.segmentForm.controls['performanceorder'].setValue(resp[0].sc_order);
                this.segmentForm.controls['startdate'].setValue("");
                this.segmentForm.controls['enddate'].setValue("");

                // review times
                this.times = this.calcTimes(resp[0].sc_reviewtime);
                this.segmentForm.controls['reviewtimemins'].setValue(this.times.mins);
                this.segmentForm.controls['reviewtimesecs'].setValue(this.times.secs);
            });

        this.selectedWbpValue = 'no';
    }

    updateSegment() {
        let mins = 0;
        let secs = 0;
        let total = 0;
        this.segmentForm.controls['definitionid'].setValue(this.selectedSegmentValue);
        this.segmentForm.controls['wellbalanced'].setValue(this.selectedWbpValue);
        this.segmentForm.controls['patterndanceid'].setValue(this.selectedPatternDanceValue);
        this.segmentForm.controls['rinkid'].setValue(this.selectedRinkValue);

        // review
        mins = this.segmentForm.controls['reviewtimemins'].value*60;
        secs = this.segmentForm.controls['reviewtimesecs'].value;
        total = mins + secs;
        this.segmentForm.controls['reviewtime'].setValue(total);
        
        // check if id field has value
        if(this.segmentForm.controls['segmentid'].value !== "") {
            // yes, then it's an update
            this.apiService.updateSegment(this.segmentForm.value).subscribe(
                (res) => {
                    this.dialogRef.close()
                },
                (error) => {
                    this.formResponse = `${JSON.stringify(error.error.returnError)}`;
                })
        }
        else {
            // no, it's an insert
            this.segmentForm.controls['performanceorder'].setValue(this.nextOrderNumber);
            this.nextOrderNumber = this.nextOrderNumber + 1;

            this.apiService.insertSegment(this.segmentForm.value).subscribe(
                (res) => {
                    this.dialogRef.close()
                },
                (error) => {
                    this.formResponse = `${JSON.stringify(error.error.returnError)}`;
                })
        }
    }

    onSegmentChange(segment: any) {
        this.selectedSegmentValue = segment.value;

        // if in add mode then update from db
        if(this.segmentForm.controls['segmentid'].value === '') {
            // get defaults from db
            this.apiService.getSegmentDefinitionDefaults(this.selectedSegmentValue).subscribe(
                (res) => {
                    var resp = JSON.parse(JSON.stringify(res)); // yes, i had to stringify then parse this....
                    // reset form
                    this.segmentForm.controls['segmentid'].setValue('');
                    this.segmentForm.controls['enname'].setValue(resp[0].languages.en.name);
                    this.segmentForm.controls['frname'].setValue(resp[0].languages.fr.name);
                    this.segmentForm.controls['warmupgroupmaxsize'].setValue(resp[0].sc_warmupgroupmaximumsize ? resp[0].sc_warmupgroupmaximumsize : 0);
                    this.segmentForm.controls['performanceorder'].setValue(resp[0].sc_order);

                    // review times
                    this.times = this.calcTimes(resp[0].sc_reviewtime);
                    this.segmentForm.controls['reviewtimemins'].setValue(this.times.mins);
                    this.segmentForm.controls['reviewtimesecs'].setValue(this.times.secs);

                    if(resp[0].sc_patterndancesegment == 1) {
                        // show the dance selector
                        this.viewDances = true;
                    }
                });

            this.selectedWbpValue = 'no';
            this.selectedPatternDanceValue = '';
        }
    }

    onPatternDanceChange(dance: any) {
        this.selectedPatternDanceValue = dance.value;
    }

    onRinkChange(rink: any) {
        this.selectedRinkValue = rink.value;
    }

    editSegment(segmentid: string) {
        this.apiService.getSegmentById(segmentid).subscribe(
            (res) => {
                var resp = JSON.parse(JSON.stringify(res)); // yes, i had to stringify then parse this....
                
                console.log("in edit",resp);

                this.segmentForm.controls['segmentid'].setValue(resp[0].segmentid);
                this.segmentForm.controls['categoryid'].setValue(this.categoryid);
                this.segmentForm.controls['enname'].setValue(resp[0].languages.en.name);
                this.segmentForm.controls['frname'].setValue(resp[0].languages.fr.name);
                this.segmentForm.controls['warmupgroupmaxsize'].setValue(resp[0].warmupgroupmaxsize);
                this.segmentForm.controls['performanceorder'].setValue(resp[0].performanceorder);
                this.segmentForm.controls['startdate'].setValue(resp[0].startdate);
                this.segmentForm.controls['enddate'].setValue(resp[0].enddate);

                // review times
                this.times = this.calcTimes(resp[0].reviewtime);
                this.segmentForm.controls['reviewtimemins'].setValue(this.times.mins);
                this.segmentForm.controls['reviewtimesecs'].setValue(this.times.secs);

                this.selectedSegmentValue = resp[0].definitionid.toString(); // sets segment value

                if(resp[0].rinkid != null)
                {
                    this.selectedRinkValue = resp[0].rinkid.toString(); // sets rink value
                }
                

                if(resp[0].wellbalanced) {
                    this.selectedWbpValue = resp[0].wellbalanced.toString(); // sets wbp value
                }
                else {
                    this.selectedWbpValue = 'no';
                }

                if(resp[0].patterndanceid) {
                    this.selectedPatternDanceValue = resp[0].patterndanceid.toString();
                }
                else {
                    this.selectedPatternDanceValue = '';
                }
                
            },
            (error) => {
                this.formResponse = `${JSON.stringify(error.error.returnError)}`;
            })
    }

    calcTimes(recSeconds: number) {
        let mins = 0;
        let secs = 0;
        if(recSeconds) {
            // min = time/60
            mins = Math.floor(recSeconds / 60);
            secs = recSeconds % 60;
        }
        return {mins: mins, secs: secs};
    }
}

@Component({
    selector: 'pcFactors',
    templateUrl: './pcFactors.component.html',
})
export class pcFactors {
    
    factors = [] as any;
    language!: string;
    
    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private apiService: ApiService, private languageSelector: LanguageSelector) {}
    
    ngOnInit() {
        // will log the entire data object
        this.factors = this.data.dataKey;
        this.language = this.languageSelector.getLanguage();
    }
}

@Component({
    selector: 'standardsCriteria',
    templateUrl: './standardsCriteria.component.html',
})
export class standardsCriteria {
    
    standards = [] as any;
    language!: string;
    
    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private apiService: ApiService, private languageSelector: LanguageSelector) {}
    
    ngOnInit() {
        // will log the entire data object
        this.standards = this.data.dataKey;
        this.language = this.languageSelector.getLanguage();
    }
}

@Pipe({
    name: "formatCriterionLevel"
  })
  export class FormaCriterionLevelPipe implements PipeTransform {
    transform(value: number): string {
        var cl = '';
        switch(value) {
            case 947960000:
                cl = 'Bronze';
                break;
            case 947960001:
                cl = 'Silver';
                break;
            case 947960002:
                cl = 'Gold';
                break;
            case 947960003:
                cl = 'Successful';
                break;
            default:
                cl = 'error';
        }
        return cl;
    }
  }

  
  @Pipe({
    name: "formatRuleType"
  })
  export class FormaRuleTypePipe implements PipeTransform {
    transform(value: number): string {
        var cl = '';
        switch(value) {
            case 947960000:
                cl = 'Count Rating Values';
                break;
            case 947960001:
                cl = 'Specific Element Rating Value';
                break;
            case 947960002:
                cl = 'Count Rating Values (Hierarchical)';
                break;
            case 947960003:
                cl = 'Specific Element Rating Value (Hierarchical)';
                break;
            default:
                cl = 'error';
        }
        return cl;
    }
  }

  @Pipe({
    name: "formatCountType"
  })
  export class FormatCountTypePipe implements PipeTransform {
    transform(value: number): string {
        var cl = '';
        switch(value) {
            case 947960000:
                cl = 'Minimum';
                break;
            case 947960001:
                cl = 'Maximum';
                break;
            default:
                cl = 'error';
        }
        return cl;
    }
  }
/*
  @Pipe({
    name: "getElementName"
  })
  
  export class GetElementNamePipe implements PipeTransform {

    constructor(private apiService: ApiService, private languageSelector: LanguageSelector) { }

    transform(value: string): any {
        
        var language = this.languageSelector.getLanguage();
        var retStr = 'error';
        this.apiService.getElementById(value).subscribe(
            (element) => {
                var resp = JSON.parse(JSON.stringify(element));

                if(language == 'en') retStr = resp[0].languages.en.name;
                if(language == 'fr') retStr = resp[0].languages.fr.name;
                return retStr;
            });
        //return retStr;
    }
  }
*/
