import { Component, OnInit, Inject, MissingTranslationStrategy } from '@angular/core';
import { ApiService } from '../api.service';
import { LanguageSelector } from '../api.languageselector';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-segment-officials',
  templateUrl: './segment-officials.component.html',
  styleUrls: ['./segment-officials.component.css']
})
export class SegmentOfficialsComponent implements OnInit {

  segmentid!: string;
  segment = [] as any;
  officials = [] as any;
  language!: string;
  event = [] as any;
  runEventToggle: any;

  constructor(private apiService: ApiService, private languageSelector: LanguageSelector, private fb: FormBuilder, private activatedRoute: ActivatedRoute, private router: Router, public dialog: MatDialog) { }

  ngOnInit(): void {
    let segmentid = this.activatedRoute.snapshot.params.segmentid;
    this.segmentid = segmentid;

    this.language = this.languageSelector.getLanguage();

    this.runEventToggle = true;

    this.apiService.getSegmentById(segmentid).subscribe(
      (segment) => {
        this.segment = segment;
        this.runEventToggle = (this.segment[0].inprogress == 1) ? true : false;
      }
    );

    this.apiService.getSegmentOfficials(segmentid).subscribe(
      (officials: any) => {
        //this.officials = officials;

        this.officials = this.sortOfficials(officials)


      }
    )
  }

  deleteEntry(officialassignmentid: string) {
    var params = { officialassignmentid: officialassignmentid, segmentid: this.segmentid }
    if (confirm("Are you sure to delete this record?")) {
      this.apiService.deleteOfficalAssignment(params).subscribe(
        (res) => {
          this.officials = res;
        })
    }
  }

  changeEntry(officialassignmentid: string) {
    // popup form in modal
    var params = { officialassignmentid: officialassignmentid };

    this.apiService.getOfficialPosition(params).subscribe(
      (res) => {
        const dialogRef = this.dialog.open(changeOfficialPosition, {
          data: {
            dataKey: res
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          this.apiService.getSegmentOfficials(this.segmentid).subscribe(
            (officials) => {
              this.officials = this.sortOfficials(officials);
            }
          )
        });
      },
      (error) => {
        console.log(error.error.body);
      }
    )
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

@Component({
  selector: 'changeOfficialPosition',
  templateUrl: './changeOfficialPosition.component.html',
})
export class changeOfficialPosition {

  official = [] as any;
  roles = [] as any;
  selectedOfficialRole!: string;
  selectedOfficialRoleText!: string;
  selectedOfficialPosition!: string;
  language!: string;

  constructor(public dialogRef: MatDialogRef<changeOfficialPosition>, private apiService: ApiService, private languageSelector: LanguageSelector, private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    // will log the entire data object
    this.official = this.data.dataKey;
    this.selectedOfficialRole = this.official[0].role;
    this.selectedOfficialPosition = this.official[0].position;
    this.officialForm.controls['officialname'].setValue(this.official[0].sc_fullname);
    this.officialForm.controls['officialassignmentid'].setValue(this.official[0].officialassignmentid);
    this.language = this.languageSelector.getLanguage();

    this.apiService.getOfficialRoles().subscribe(
      (roles) => {
        this.roles = roles;
      }
    )
  }

  officialForm: FormGroup = this.fb.group({
    officialassignmentid: [''],
    officialname: [''],
    officialrole: [''],
    officialposition: ['']
  })

  onPositionChange(position: any) {
    this.selectedOfficialPosition = position.value;
  }
  onRoleChange(role: any) {
    this.selectedOfficialRole = role.value;
    this.selectedOfficialRoleText = role.source.triggerValue;
  }

  updateOfficialAssignment() {
    if (this.selectedOfficialRole == '') {
      alert(`No role selected`);
    }
    else if ((this.selectedOfficialRoleText == 'Judge' || this.selectedOfficialRoleText == 'Juge') && this.selectedOfficialPosition == '') {
      alert(`Please select a position for this judge`);
    }
    else {
      this.officialForm.controls['officialrole'].setValue(this.selectedOfficialRole);
      this.officialForm.controls['officialposition'].setValue(this.selectedOfficialPosition);
      this.apiService.updateOfficialAssignment(this.officialForm.value).subscribe(
        (res) => {
          //alert(`Official "${this.official[0].sc_fullname}" updated.`);
          this.dialogRef.close();
        },
        (error) => {
          alert(`System was unable to update "${this.official[0].sc_fullname}".`);
        })
    }
  }

}
