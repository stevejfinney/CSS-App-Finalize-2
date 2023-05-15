import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { LanguageSelector } from '../api.languageselector';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-competitors',
    templateUrl: './competitors.component.html',
    styleUrls: ['./competitors.component.css']
})
export class CompetitorsComponent implements OnInit {

    categoryid!: string;
    category = [] as any;
    competitors = [] as any;
    selectedCompetitorValue!: string;
    formResponse: any;
    segCompetitors = [] as any;
    dataSource = [] as any;
    displayedColumns = ['new_teamid', 'sc_scnum', 'sc_name'];
    competitorObj = [] as any;
    language!: string;
    environ: string = 'offline';
    isLoggedIn: boolean = false;
    loading: boolean = false;

    constructor(private apiService: ApiService, private languageSelector: LanguageSelector, private fb: FormBuilder, private activatedRoute: ActivatedRoute, private router: Router) { }

    ngOnInit(): void {

        this.apiService.isLoggedIn.subscribe((res: boolean) => {
            this.isLoggedIn = res;
        })

        //this.environ = this.apiService.OnlineStatus.value;


        // slightly different column names if online or offline when adding competitors
        //if(this.environ === 'offline') {
        if (!this.isLoggedIn) {
            this.displayedColumns = ['sc_scnum', 'sc_name']
            this.environ = 'offline'
        }
        else {
            this.displayedColumns = ['new_teamid', 'sc_name']
            this.environ = 'online'
        }

        //this.environ = 'online';

        let categoryid = this.activatedRoute.snapshot.params.categoryid;
        this.categoryid = categoryid;
        this.competitorForm.controls['categoryid'].setValue(categoryid);

        this.language = this.languageSelector.getLanguage();

        this.apiService.getCategoryById(categoryid).subscribe(
            (category) => {
                this.category = category;
            });

        this.apiService.getCompetitorsByCategory(categoryid).subscribe(
            (competitors) => {
                this.competitors = competitors;
            }
        )
    }

    competitorForm: FormGroup = this.fb.group({
        categoryid: [''],
        competitorid: ['']
    })

    addCompetitorToCategory() {
        if (this.competitorForm.controls['competitorid'].value == '') {
            alert(`No competitor selected`);
        }
        else {
            //this.competitorForm.controls['competitorid'].setValue(this.selectedCompetitorValue);
            this.apiService.insertCompetitor(this.competitorForm.value).subscribe(
                (res) => {
                    console.log(res);
                    //alert(`Competitor "${this.competitorObj.sc_name}" added.`);
                    this.competitors = res;
                },
                (error) => {
                    this.formResponse = `${JSON.stringify(error.error.returnError)}`;
                    alert(`System was unable to add "${this.competitorObj.sc_name}".`);
                })
        }

    }

    getRecord(row: any) {
        this.competitorObj = row;
        if (confirm(`Add competitor "${this.competitorObj.sc_name}" to this category?`)) {
            //this.competitorForm.controls['competitorid'].setValue(this.competitorObj.sc_competitorid);
            //this.addCompetitorToCategory();
            // new update - send entire competitorobj to insert into css_sc_competitors table
            this.competitorObj.categoryid = this.categoryid;

            this.apiService.insertCompetitor(this.competitorObj).subscribe(
                (res) => {
                    this.competitors = res;
                },
                (error) => {
                    this.formResponse = `${JSON.stringify(error.error.returnError)}`;
                    alert(`System was unable to add "${this.competitorObj.sc_name}".`);
                }
            )
        }
    }

    applyFilter(searchVar: string) {
        var filterValue = searchVar;
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches

        if (filterValue.length < 4) {
            alert(`Minimum search length is 4 characters`);
        }
        else {
            this.dataSource.filter = filterValue;
            this.loading = true;
            let fetchParams = { filter: filterValue, sort: 'asc', pageNumber: 0, pageSize: 20, env: this.environ };
            this.apiService.getSearchCompetitors(fetchParams).subscribe(
                (competitors) => {
                    if (Object.keys(competitors).length > 0) {
                        this.dataSource = competitors;
                        this.loading = false;
                    }
                    else {
                        alert(`No results found`)
                        this.loading = false;
                    }

                });
        }
    }

}
