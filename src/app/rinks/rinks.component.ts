import { Component, OnInit, Inject } from '@angular/core';
import { ApiService } from '../api.service';
import { LanguageSelector } from '../api.languageselector';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-rinks',
    templateUrl: './rinks.component.html',
    styleUrls: ['./rinks.component.css']
})
export class RinksComponent implements OnInit {

    eventid!: string;
    language!: string;
    rinks = [] as any;
    formResponse: any;
    videofeed!: any;
    videofeedChecked = true as boolean;

    loadingSpinner: any = false;
    create_rink:any = false;
    delete_rink:any = false;
    processsing_rink_ids :any = [];
    
    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private apiService: ApiService, private languageSelector: LanguageSelector, private fb: FormBuilder) { }

    ngOnInit(): void {
        
        let eventid = this.data.dataKey.eventid;

        this.eventid = eventid;
        this.rinkForm.controls['eventid'].setValue(eventid);
        
        this.language = this.languageSelector.getLanguage();

        this.videofeed = 0;

        this.apiService.getRinksByEvent(eventid).subscribe(
            (rinks) => {
                this.rinks = rinks;
            }
        )
    }

    rinkForm: FormGroup = this.fb.group({
        rinkid: [''],
        eventid: [''],
        name: [''],
        videofeed: ['']
    })

    updateRink() {
        

        this.rinkForm.controls['videofeed'].setValue(this.videofeedChecked == true ? 1 : 0);
        
        

        if(this.rinkForm.controls['rinkid'].value !== "") {
            this.apiService.updateRink(this.rinkForm.value).subscribe(
                (res) => {
                    this.rinks = res;
                    // reset form
                    this.rinkForm.controls['rinkid'].setValue('');
                    this.rinkForm.controls['name'].setValue('');
                    this.rinkForm.controls['videofeed'].setValue('1');
                    this.videofeedChecked = true;
                },
                (error) => {
                    this.formResponse = `${JSON.stringify(error.error.returnError)}`;
                })
        }
        else {

            console.log("rink form value",this.rinkForm.value,this.rinkForm.value["name"])

            if(this.rinkForm.value["name"] != "")
            {
                this.create_rink = true;

                this.apiService.insertRink(this.rinkForm.value).subscribe(
                (res) => {
                    this.rinks = res;
                    this.create_rink = false;

                    console.log("response coming",res,this.rinkForm.value);
                },
                (error) => {
                    this.formResponse = `${JSON.stringify(error.error.returnError)}`;
                })

            }
            
        }
        
    }

    editRink(rinkid: string) {
        this.apiService.getRinkById(rinkid).subscribe(
            (res) => {
                var resp = JSON.parse(JSON.stringify(res)); // yes, i had to stringify then parse this....
                this.rinkForm.controls['rinkid'].setValue(resp[0].rinkid);
                this.rinkForm.controls['name'].setValue(resp[0].name);
                this.rinkForm.controls['videofeed'].setValue(resp[0].videofeed);
                this.videofeedChecked = resp[0].videofeed == 1 ? true : false;
            },
            (error) => {
                this.formResponse = `${JSON.stringify(error.error.returnError)}`;
            })
    }

    deleteRink(rinkid: string, eventid: string) {
        var params = {rinkid:rinkid,eventid:eventid}

        this.delete_rink = true;
        this.processsing_rink_ids.push(rinkid);

        this.apiService.deleteRink(params).subscribe(
            (res) => {
                this.rinks = res;
                this.delete_rink = false;
        
                var index = this.processsing_rink_ids.indexOf(rinkid);
                if (index !== -1) {
                    this.processsing_rink_ids.splice(index, 1);
                }
                console.log("new array",this.processsing_rink_ids)


            },
            (error) => {
                this.formResponse = `${JSON.stringify(error.error.returnError)}`;
            })
    }

    
    onChangeFeed(event: any) {
        this.videofeed = event.checked ? 1 : 0;
        this.rinkForm.controls['videofeed'].setValue(this.videofeed);
        this.videofeedChecked = event.checked ? true : false;
    }

    copy_url(input:any)
    {
        console.log("copy value",input);

        
        navigator.clipboard.writeText(input).then(() => {
            console.log('Content copied to clipboard');
            alert("Copied the text: " + input);
            /* Resolved - text copied to clipboard successfully */
        },() => {
            console.error('Failed to copy');
            /* Rejected - text failed to copy to the clipboard */
        });

    }

    start_event(input:any)
    {
        this.loadingSpinner = true;
        //this.create_rink = true;

        this.processsing_rink_ids.push(input['rinkid']);

        console.log("new array",this.processsing_rink_ids)
        console.log("start event",input);
        this.apiService.startRink(input).subscribe(
            (res) => {
                console.log("startevent finished",res);

                this.loadingSpinner = false;
                //this.create_rink = false;

                var index = this.processsing_rink_ids.indexOf(input['rinkid']);
                if (index !== -1) {
                    this.processsing_rink_ids.splice(index, 1);
                }
                console.log("new array",this.processsing_rink_ids)

                
                this.apiService.getRinksByEvent(this.data.dataKey.eventid).subscribe(
                    (rinks) => {
                        this.rinks = rinks;

                        console.log("new APi request coming",this.rinks)
                    }
                )

            });

    }

    end_event(input:any)
    {
        this.loadingSpinner = true;
        console.log("end event",input);
        
        this.processsing_rink_ids.push(input['rinkid']);

        this.apiService.stopRink(input).subscribe(
            (res) => {
                console.log("end  finished",res);
                this.loadingSpinner = false;

                var index = this.processsing_rink_ids.indexOf(input['rinkid']);
                if (index !== -1) {
                    this.processsing_rink_ids.splice(index, 1);
                }

                this.apiService.getRinksByEvent(this.data.dataKey.eventid).subscribe(
                    (rinks) => {
                        this.rinks = rinks;

                        console.log("new APi request coming",this.rinks)
                    }
                )
                
            });
    }

}
