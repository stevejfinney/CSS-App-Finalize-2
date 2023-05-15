import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { LanguageSelector } from '../api.languageselector';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: 'app-officials',
  templateUrl: './officials.component.html',
  styleUrls: ['./officials.component.css']
})
export class OfficialsComponent implements OnInit {

  categoryid!: string;
  category = [] as any;
  officials = [] as any;
  selectedOfficialValue!: string;
  formResponse: any;
  segOfficials = [] as any;
  dataSource = [] as any;
  dataSourceLocal = [] as any;
  displayedColumns = ['sc_scnum', 'sc_fullname'];
  officialObj = [] as any;
  officialRoles = [] as any;
  selectedOfficialRole = '' as string;
  selectedOfficialRoleText = '' as string;
  selectedOfficialPosition = '' as string;
  language!: string;
  includescore!: any;
  includescoreChecked = true as boolean;
  environ: string = 'offline';
  isLoggedIn: boolean = false;
  disablePosition: boolean = true;
  loading: boolean = false;
  loadingLocal: boolean = false;
  loadingSpinner: boolean = false;
  localMessage = '' as string;
  onlineMessage = '' as string;
  userStop$: Subject<boolean> = new Subject<boolean>();

  constructor(private apiService: ApiService, private languageSelector: LanguageSelector, private fb: FormBuilder, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.apiService.isLoggedIn.subscribe((res: boolean) => {
      this.isLoggedIn = res;
    })

    if (!this.isLoggedIn) {
      this.environ = 'offline'
    }
    else {
      this.environ = 'online'
    }

    //this.environ = 'online';

    let categoryid = this.activatedRoute.snapshot.params.categoryid;
    this.categoryid = categoryid;
    this.officialForm.controls['categoryid'].setValue(categoryid);

    this.language = this.languageSelector.getLanguage();

    this.includescore = 1;

    this.apiService.getCategoryById(categoryid).subscribe(
      (category) => {
        this.category = category;
      });

    this.apiService.getOfficialsByCategory(categoryid).subscribe(
      (officials: any) => {
        //this.officials = officials;

        //Official Order

        //console.log("official1234", this.officials)

        this.officials = this.sortOfficials(officials);

      }
    )

    this.apiService.getOfficialRoles().subscribe(
      (roles) => {
        this.officialRoles = roles;
        //console.log("roles", this.officialRoles)
      }
    )
  }

  officialForm: FormGroup = this.fb.group({
    categoryid: [''],
    officialid: [''],
    officialname: [''],
    officialrole: [''],
    officialposition: [''],
    includescore: ['']
  })

  addOfficialToCategory() {
    if (this.officialForm.controls['officialid'].value == '') {
      alert(`No official selected`);
    }
    else if (this.selectedOfficialRole == '') {
      alert(`No role selected`);
    }
    else if ((this.selectedOfficialRoleText == 'Judge' || this.selectedOfficialRoleText == 'Juge') && this.selectedOfficialPosition == '') {
      alert(`Please select a position for this judge`);
    }
    else {
      this.officialForm.controls['officialrole'].setValue(this.selectedOfficialRole);
      this.officialForm.controls['officialposition'].setValue(this.selectedOfficialPosition);
      this.officialForm.controls['includescore'].setValue(this.includescore);

      var params = { officialObj: this.officialObj, formObj: this.officialForm.value };

      this.apiService.insertOfficial(params).subscribe(
        (res) => {
          //alert(`Official "${this.officialObj.sc_fullname}" added.`);
          this.officials = this.sortOfficials(res);
        },
        (error) => {
          this.formResponse = `${JSON.stringify(error.error.returnError)}`;
          alert(`System was unable to add "${this.officialObj.sc_fullname}".`);
        })
    }
  }

  getRecord(row: any) {
    this.officialObj = row;
    this.officialForm.controls['officialid'].setValue(this.officialObj.sc_officialid);
    this.officialForm.controls['officialname'].setValue(this.officialObj.sc_fullname);
    this.handleUserStop();
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
      this.loadingLocal = true;
      this.loadingSpinner = true;

      this.localMessage = 'Searching local records';
      this.onlineMessage = 'Searching online records';

      let fetchParams = { filter: filterValue, sort: 'asc', pageNumber: 0, pageSize: 20, env: this.environ };
      
      // check local db first
      this.apiService.getSearchOfficialsLocal(fetchParams)
      .pipe(takeUntil(this.userStop$))
      .subscribe(
        (localofficials) => {
          if (Object.keys(localofficials).length > 0) {
            this.dataSourceLocal = localofficials;
            this.localMessage = '';
            this.loadingLocal = false;
          }
          else {
            //alert(`No results found`)
            this.localMessage = 'No local records found'
          }
          
          if(!this.loadingLocal && !this.loading)
            this.loadingSpinner = false;
        },
        err => {
          console.log("err" + err);
        },
        () => {
          console.log("Completed");
        }
      );

      // if online will check online system
      this.apiService.getSearchOfficials(fetchParams)
      .pipe(takeUntil(this.userStop$))
      .subscribe(
        (officials) => {
          if (Object.keys(officials).length > 0) {
            this.dataSource = officials;
            this.onlineMessage = '';
            this.loading = false;
          }
          else {
            //alert(`No results found`)
            this.onlineMessage = 'No online records found'
          }
          
          if(!this.loadingLocal && !this.loading)
            this.loadingSpinner = false;
        },
        err => {
          console.log("err" + err);
        },
        () => {
          console.log("Completed");
        }
      );
    }
  }

  handleUserStop() {
    this.userStop$.next(true);
    this.loadingLocal = false;
    this.localMessage = '';
    this.loading = false;
    this.onlineMessage = '';
    this.loadingSpinner = false;
  }

  onPositionChange(position: any) {
    this.selectedOfficialPosition = position.value;
  }

  onRoleChange(role: any) {
    this.selectedOfficialRole = role.value;
    this.selectedOfficialRoleText = role.source.triggerValue;
    if (this.selectedOfficialRole == '469C7509-FEA6-EC11-983F-00224825E0C8') // judge
      this.disablePosition = false;
    else
      this.disablePosition = true;
  }

  onChangeInclude(event: any) {
    this.includescore = event.checked ? 1 : 0;
    this.officialForm.controls['includescore'].setValue(this.includescore);
  }

  sortOfficials(officials: any) {
    var sortedOffs: any = [];
    var official_order: any = [
      "F19EFA05-1FA9-EC11-983F-002248267FC3",
      "DD0D08B3-1EA9-EC11-983F-002248267FC3",
      "3983AAF1-1EA9-EC11-983F-002248267FC3",
      "9A8F5827-FEA6-EC11-983F-00224825E0C8",
      "469C7509-FEA6-EC11-983F-00224825E0C8",
      "3B732AFD-FDA6-EC11-983F-00224825E0C8",
      "49E9C4A5-1EA9-EC11-983F-002248267FC3",
      "38940E18-1FA9-EC11-983F-002248267FC3",
      "5D920A2A-1FA9-EC11-983F-002248267FC3",
      "98642430-1FA9-EC11-983F-002248267FC3",
      "6A9D2736-8B66-ED11-9562-00224828DA82"]

    for (let j = 0; j < official_order.length; j++) {

      var official_order_filter = officials.filter((record: any) => record.role == official_order[j]);

      if (official_order_filter.length >= 1) {

        if (j == 4) {

          let official_filter: any = official_order_filter.sort((a: any, b: any) => a.position - b.position);

          for (let i = 0; i < official_filter.length; i++) {

            sortedOffs.push(official_filter[i]);
            //console.log("position", official_order_filter.sort((a: any, b: any) => a.position - b.position))

          }


        }

        else {

          for (let i = 0; i < official_order_filter.length; i++) {

            sortedOffs.push(official_order_filter[i]);


          }
        }

      }


    }
    return sortedOffs;
  }

}
