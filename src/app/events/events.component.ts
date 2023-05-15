import { Component, OnInit, Inject } from '@angular/core';
import { ApiService } from '../api.service';
import { LanguageSelector } from '../api.languageselector';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {

    events = [] as any;
    language!: string;
    isOnline: boolean = false;

    constructor(private apiService: ApiService, private languageSelector: LanguageSelector, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.language = this.languageSelector.getLanguage();
        
    this.apiService.getEvents().subscribe(
        (events) => {
            this.events = events;
        });

    this.apiService.OnlineStatus.subscribe((res: string) => {
        if(res === "online")
            this.isOnline = true;
    })
  }

  

    deleteEvent(eventid: string) {
        if(confirm("Are you sure to delete this record?")) {
            this.apiService.deleteEvent(eventid).subscribe(
                (res) => {
                    this.apiService.getEvents().subscribe(
                        (events) => {
                            this.events = events;
                        });
                },
                (error) => {
                    //console.log(error.error.body);
                    //this.formResponse = `${JSON.stringify(error.error.returnError)}`;
                })
        }
    }

    eventForm(action: string, eventid: any) {
        const dialogRef = this.dialog.open(eventsForm, {
            height: '70%',
            width: '60%',
            data: {
                dataKey: {action:action, eventid:eventid}
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            this.apiService.getEvents().subscribe(
                (events) => {
                    this.events = events;
                });
        
        });
    }

}

@Component({
    selector: 'eventsForm',
    templateUrl: './eventsForm.component.html',
})
export class eventsForm {
    
    eventClasses = [] as any;
    hide: boolean = true;
    formResponse: any;
    selectedClassValue!: string;
    selected = '0';
    disablethis = false;
    categories = [] as any;
    language!: string;
    isOnline: boolean = false;
    
    constructor(public dialogRef: MatDialogRef<eventsForm>, @Inject(MAT_DIALOG_DATA) public data: any, private apiService: ApiService, private fb: FormBuilder, private languageSelector: LanguageSelector) {}
    
    ngOnInit() {
        this.language = this.languageSelector.getLanguage();

        this.apiService.getEventClasses().subscribe(
            (eventClasses) => {
                this.eventClasses = eventClasses;
            }
        )

        // edit or new?
        if(this.data.dataKey.action === 'edit' && this.data.dataKey.eventid) {
            this.editEvent(this.data.dataKey.eventid)
        }
        else {
            this.addEvent();
        }
    }

    eventForm: FormGroup = this.fb.group({
        eventid: [''],
        sc_skatingeventclassid: [''],
        enname: [''],
        location: [''],
        frname: ['']
    })
    
    updateEvent() { 
        if(this.eventForm.valid) {
            this.eventForm.controls['sc_skatingeventclassid'].setValue(this.selectedClassValue);
            // check if id field has value
            if(this.eventForm.controls['eventid'].value !== "") {
                // yes, then it's an update
                this.apiService.updateEvent(this.eventForm.value).subscribe(
                    (res) => {
                        this.dialogRef.close();
                    },
                    (error) => {
                        this.formResponse = `${JSON.stringify(error.error.returnError)}`;
                    })
            }
            else {
                // no, it's an insert
                this.apiService.insertEvent(this.eventForm.value).subscribe(
                    (res) => {
                        this.dialogRef.close();
                    },
                    (error) => {
                        this.formResponse = `${JSON.stringify(error.error.returnError)}`;
                    })
            }
        }
    }

    editEvent(eventid: string) {
        this.apiService.getEventById(eventid).subscribe(
            (res) => {
                var resp = JSON.parse(JSON.stringify(res)); // yes, i had to stringify then parse this....
                this.eventForm.controls['eventid'].setValue(resp[0].eventid);
                this.eventForm.controls['enname'].setValue(resp[0].languages.en.name);
                this.eventForm.controls['location'].setValue(resp[0].location);
                this.eventForm.controls['frname'].setValue(resp[0].languages.fr.name);
                this.selectedClassValue = resp[0].sc_skatingeventclassid.toString(); 
            },
            (error) => {
                this.formResponse = `${JSON.stringify(error.error.returnError)}`;
            })
    }

    addEvent() {
        //clear the fields
        this.eventForm.controls['eventid'].setValue("");
        this.eventForm.controls['enname'].setValue("");
        this.eventForm.controls['location'].setValue("");
        this.eventForm.controls['frname'].setValue("");
        this.selectedClassValue = "";
    }
    
}
