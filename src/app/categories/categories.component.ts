import { Component, OnInit, Inject } from '@angular/core';
import { ApiService } from '../api.service';
import { LanguageSelector } from '../api.languageselector';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { RinksComponent } from '../rinks/rinks.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

    eventid!: string;
    event = [] as any;
    categories = [] as any;
    programs = [] as any;
    disciplines = [] as any;
    definitions = [] as any;
    fileName = '';
    selectedValue!: string;
    selectedProgramValue!: string;
    selectedDisciplineValue!: string;
    selectedDefinitionValue!: string;
    formResponse: any;
    fileUploadedMessages = [] as any;
    isShown: boolean = false;
    english: boolean = true;
    french: boolean = false;
    language!: string;
    runEventToggle: any;
    runStreamToggle: any;
    isOnline: boolean = false;

    constructor(private apiService: ApiService, private languageSelector: LanguageSelector, private fb: FormBuilder, private activatedRoute: ActivatedRoute, private router: Router, public dialog: MatDialog) { }

    ngOnInit(): void {
        let eventid = this.activatedRoute.snapshot.params.eventid;
        
        this.eventid = eventid;

        //this.selectedValue = "Setup";

        this.runEventToggle = true;

        this.language = this.languageSelector.getLanguage();

        // get event details
        this.apiService.getEventById(eventid).subscribe(
            (event) => {
                this.event = event;
                this.runEventToggle = (this.event[0].inprogress == 1) ? true : false;
            });

        // set toggle for live stream
        this.runStreamToggle = false;
        this.apiService.getLiveFeedStatus(eventid).subscribe(
            (feedlive) => {
                var resp = JSON.parse(JSON.stringify(feedlive));
                if(resp.feedlive == 1) {
                    this.runStreamToggle = true;
                }
            });

        this.apiService.getCategories(eventid).subscribe(
            (categories) => {
                this.categories = categories;
            });

        this.fileUploadedMessages = '';

        this.apiService.loginStatus.subscribe((res: boolean) => {
            if(res === true)
                this.isOnline = true;
        })
    }

    

    deleteCategory(eventid: string, categoryid: string) {
        var params = {eventid: eventid, categoryid: categoryid}
        if(confirm("Are you sure to delete this record?")) {
            this.apiService.deleteCategory(params).subscribe(
                (res) => {
                    this.categories = res;
                },
                (error) => {
                    //console.log(error.error.body);
                    this.formResponse = `${JSON.stringify(error.error.returnError)}`;
                })
        }
    }

    categoryForm(action: string, categoryid: any) {
        const dialogRef = this.dialog.open(categoriesForm, {
            height: '70%',
            width: '60%',
            data: {
                dataKey: {action:action, eventid:this.eventid, categoryid:categoryid}
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            this.apiService.getCategories(this.eventid).subscribe(
                (categories) => {
                    this.categories = categories;
                });
        });
    }
    
    //upload file 
    onFileSelected(event: any) {

        const file: File = event.target.files[0];

        if (file) {
            this.toggleShow();
            
            this.fileName = file.name;
            const formData = new FormData();
            formData.append("thumbnail", file);

            var onlineStatus = 'offline';
            if(this.isOnline)
                onlineStatus = 'online';

            this.apiService.eventUpload(formData, this.eventid, onlineStatus).subscribe(
                (res) => {
                    this.categories = res;

                    this.toggleShow();
                },
                (error) => {
                    var errStr = error.error.message.substring(1, error.error.message.length-1);
                    var errorArr = errStr.split(',');
                    
                    var errObj = Object.assign({}, errorArr);
                    this.fileUploadedMessages = errorArr;

                    this.toggleShow();
                }
            );
        }
    }

    toggleShow() {
        this.isShown = ! this.isShown;
    }

    /*toggleEvent(event: any,eventid: any) {
        var inprogress = (event == true) ? 1 : 0;
        var params = {eventid: eventid, inprogress: inprogress}
        // update event inprogress field
        // checks event has segment with skaters and officials
        this.apiService.setEventInProgress(params).subscribe(
            (res) => {
                var resp = JSON.parse(JSON.stringify(res));
                if(resp.response == 'fail') {
                    alert('Unable to start event. Missing competitors or officials.');
                    this.runEventToggle = false;
                    // send chat event
                    // MADE UP FUNCTION NAME
                    // sendChatEvent('EVENTINACTIVE')
                }
                else {
                    // send chat event
                    // MADE UP FUNCTION NAME
                    // sendChatEvent('EVENTACTIVE')
                }
            },
            (error) => {
                console.log(error.error.body);
            }
        )
    }*/

    addRink(eventid: string) {
        const dialogRef = this.dialog.open(RinksComponent, {
            height: '70%',
            width: '60%',
            data: {
                dataKey: {eventid:eventid}
            }
        });
    }
}

@Component({
    selector: 'categoriesForm',
    templateUrl: './categoriesForm.component.html',
})
export class categoriesForm {

    eventid!: string;
    event = [] as any;
    categories = [] as any;
    programs = [] as any;
    disciplines = [] as any;
    definitions = [] as any;
    fileName = '';
    selectedValue!: string;
    selectedProgramValue!: string;
    selectedDisciplineValue!: string;
    selectedDefinitionValue!: string;
    formResponse: any;
    fileUploadedMessages = [] as any;
    isShown: boolean = false;
    english: boolean = true;
    french: boolean = false;
    language!: string;
    runEventToggle: any;
    runStreamToggle: any;
    labels: any;
    selectedDefinition: any;
    selectedLabels = [] as any;
    
    constructor(public dialogRef: MatDialogRef<categoriesForm>, @Inject(MAT_DIALOG_DATA) public data: any, private apiService: ApiService, private fb: FormBuilder, private languageSelector: LanguageSelector) {}
    
    ngOnInit() {
        this.language = this.languageSelector.getLanguage();

        this.eventid = this.data.dataKey.eventid;
        this.categoryForm.controls['eventid'].setValue(this.eventid);

        this.apiService.getPrograms().subscribe(
            (programs) => {
                this.programs = programs;
            })

        this.apiService.getDisciplines().subscribe(
            (disciplines) => {
                this.disciplines = disciplines;
            })

        // edit or new?
        if(this.data.dataKey.action === 'edit' && this.data.dataKey.categoryid) {
            this.editCategory(this.data.dataKey.categoryid)
        }
        else {
            this.addCategory();
        }
    }

    categoryForm: FormGroup = this.fb.group({
        categoryid: [''],
        eventid: [''],
        enname: [''],
        frname: [''],
        programid: [''],
        disciplineid: [''],
        definitionid: [''],
        sortorder: [''],
        status: [''],
        hasreadysegments: [''],
        hascompetitors: [''],
        hasofficials: [''],
        startdate:  [''],
        enddate:  [''],
        labels: ['']
    })

    updateCategory() {
        if(this.categoryForm.valid) {
            //this.categoryForm.controls['status'].setValue(this.selectedValue);
            //this.categoryForm.controls['disciplineid'].setValue(this.selectedDisciplineValue);
            this.categoryForm.controls['definitionid'].setValue(this.selectedDefinitionValue);
            //this.categoryForm.controls['programid'].setValue(this.selectedProgramValue);
            this.categoryForm.controls['labels'].setValue(JSON.stringify(this.selectedLabels));
            // check if id field has value
            if(this.categoryForm.controls['categoryid'].value !== "") {
                // yes, then it's an update
                this.apiService.updateCategory(this.categoryForm.value).subscribe(
                    (res) => {
                        this.dialogRef.close();
                    },
                    (error) => {
                        this.formResponse = `${JSON.stringify(error.error.returnError)}`;
                    })
            }
            else {
                //console.log(this.categoryForm.value)
                // no, it's an insert
                this.apiService.insertCategory(this.categoryForm.value).subscribe(
                    (res) => {
                        this.dialogRef.close();
                    },
                    (error) => {
                        this.formResponse = `${JSON.stringify(error.error.returnError)}`;
                    })
            }
        }
    }

    editCategory(categoryid: string) {
        this.apiService.getCategoryById(categoryid).subscribe(
            (res) => {
                var resp = JSON.parse(JSON.stringify(res)); // yes, i had to stringify then parse this....
                this.categoryForm.controls['categoryid'].setValue(resp[0].categoryid);
                this.categoryForm.controls['eventid'].setValue(this.eventid);
                this.categoryForm.controls['enname'].setValue(resp[0].languages.en.name);
                this.categoryForm.controls['frname'].setValue(resp[0].languages.fr.name);
                
                // get program and discipline
                this.selectedProgramValue = resp[0].programid.toString(); // sets status value
                this.selectedDisciplineValue = resp[0].disciplineid.toString(); // sets status value
                
                // use program and discipline to reload definition
                let catDef = {programid: this.selectedProgramValue, disciplineid: this.selectedDisciplineValue};
                this.apiService.getCategoryDefinitionByParent(catDef).subscribe(
                    (res) => {
                        this.definitions = res;
                        this.selectedDefinitionValue = resp[0].definitionid.toString(); // sets status value

                        // get labels
                        this.selectedDefinition = this.definitions.find((item: { sc_skatingcategorydefinitionid: string; }) => item.sc_skatingcategorydefinitionid === this.selectedDefinitionValue)
                        if(this.selectedDefinition.labels)
                            this.labels = this.selectedDefinition.labels
                        
                        //console.log(this.labels)
                        // convert labels string to array
                        var labelArr = []
                        //console.log(resp[0].labels)
                        if(resp[0].labels != null)
                            labelArr = JSON.parse(resp[0].labels);
                        
                        for(var y=0;y<this.labels.length;y++) {
                            for(var x=0;x<labelArr.length;x++) {
                                if(labelArr[x] === this.labels[y].sc_skatingcategorylabelsid) {
                                    this.selectedLabels.push(this.labels[y].sc_skatingcategorylabelsid)
                                }
                            }
                            
                            if(this.labels[y].sc_forced === 1) {
                                this.selectedLabels.push(this.labels[y].sc_skatingcategorylabelsid)
                            }
                        }
                        
                    },
                    (error) => {
                        console.log(error.error.body);
                    }
                )
                
                //this.selectedValue = resp[0].status.toString(); // sets status value
                this.categoryForm.controls['startdate'].setValue(resp[0].startdate);
                this.categoryForm.controls['enddate'].setValue(resp[0].enddate);

            },
            (error) => {
                this.formResponse = `${JSON.stringify(error.error.returnError)}`;
            })
    }

    addCategory() {
        //clear the fields
        this.categoryForm.controls['eventid'].setValue(this.eventid);
        this.categoryForm.controls['categoryid'].setValue("");
        this.categoryForm.controls['enname'].setValue("");
        this.categoryForm.controls['frname'].setValue("");
        this.categoryForm.controls['labels'].setValue("");
        //this.selectedValue = "Setup";
        this.categoryForm.controls['startdate'].setValue("");
        this.categoryForm.controls['enddate'].setValue("");
    }

    onProgramChange(program: any) {
        this.selectedProgramValue = program.value;
        this.selectedDisciplineValue = '';
        this.definitions = [];
        this.selectedDefinitionValue = '';
        this.selectedLabels = '';
    }

    onDisciplineChange(discipline: any) {
        this.selectedDisciplineValue = discipline.value;
        this.definitions = [];
        this.selectedDefinitionValue = '';
        this.selectedLabels = '';
        
        let catDef = {programid: this.selectedProgramValue, disciplineid: this.selectedDisciplineValue};
        this.apiService.getCategoryDefinitionByParent(catDef).subscribe(
            (res) => {
                this.definitions = res;
            },
            (error) => {
                console.log(error.error.body);
            }
        )
    }

    onDefinitionChange(definition: any) {
        this.selectedDefinitionValue = definition.value;
        
        // get labels
        this.selectedDefinition = this.definitions.find((item: { sc_skatingcategorydefinitionid: string; }) => item.sc_skatingcategorydefinitionid === this.selectedDefinitionValue)
        if(this.selectedDefinition.labels)
            this.labels = this.selectedDefinition.labels
        
        //console.log(this.labels)
        // reset selectedlabels as new def selected
        this.selectedLabels = [];
        // load forced labels in to selection
        for(var x=0;x<this.labels.length;x++) {
            if(this.labels[x].sc_forced === 1 || this.labels[x].sc_forced === true) {
                this.selectedLabels.push(this.labels[x].sc_skatingcategorylabelsid)
            }
        }
    }
}
