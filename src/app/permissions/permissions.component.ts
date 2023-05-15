import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { LanguageSelector } from '../api.languageselector';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-permissions',
    templateUrl: './permissions.component.html',
    styleUrls: ['./permissions.component.css']
})
export class PermissionsComponent implements OnInit {

    eventid!: string;
    event = [] as any;
    perms = [] as any;
    specialists = [] as any;
    formResponse: any;
    selectedValue!: string;
    selectedText!: string;
    language!: string;
    environ: string = 'offline';
    isLoggedIn: boolean = false;
  
    constructor(private apiService: ApiService, private languageSelector: LanguageSelector, private fb: FormBuilder, private activatedRoute: ActivatedRoute) { }

    ngOnInit(): void {
        this.apiService.isLoggedIn.subscribe((res: boolean) => {
            this.isLoggedIn = res;
        })
        
        //this.environ = this.apiService.OnlineStatus.value;
        if(!this.isLoggedIn) {
            this.environ = 'offline'
        }
        else {
            this.environ = 'online'
        }
    
        //this.environ = 'online';
        
        let eventid = this.activatedRoute.snapshot.params.eventid;
        this.permsForm.controls['eventid'].setValue(eventid);
        this.eventid = eventid;

        this.language = this.languageSelector.getLanguage();

        // get event details
        this.apiService.getEventById(eventid).subscribe(
            (event) => {
                this.event = event;
            });
        
        this.apiService.getEventPermissions(eventid).subscribe(
            (perms) => {
                this.perms = [];
                // check returned list for id of current user
                let userid = sessionStorage.getItem('contactid');
                for (const [key, value] of Object.entries(perms)) {
                    if(Object.values(value).includes(userid) == true) {
                        this.perms = perms;
                    }
                }
            });

        this.apiService.getDataSpecialists({env:this.environ}).subscribe(
            (dspecs) => {
                this.specialists = dspecs;
            })
    }

    permsForm: FormGroup = this.fb.group({
        dspermissionsid: [''],
        eventid: [''],
        dscontactid: [''],
        dsname: ['']
    })

    updatePerms() {
        if(this.permsForm.valid) {
            this.permsForm.controls['dscontactid'].setValue(this.selectedValue);
            this.permsForm.controls['dsname'].setValue(this.selectedText);
            // it's an insert
            this.apiService.insertPerms(this.permsForm.value).subscribe(
                (res) => {
                    this.perms = res;
                },
                (error) => {
                    this.formResponse = `${JSON.stringify(error.error.returnError)}`;
                })
        }
    }

    updateDSText(contact: any) {
        this.selectedText = contact.source.triggerValue;
    }

    deletePerm(eventid:string, guid: string) {
        var params = {eventid: eventid, dspermissionsid: guid}
        this.apiService.deletePerm(params).subscribe(
            (res) => {
                this.perms = res;
            },
            (error) => {
                this.formResponse = `${JSON.stringify(error.error.returnError)}`;
            })
    }
}
