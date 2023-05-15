import { Component, OnInit, Inject, Input, EventEmitter, SimpleChanges } from '@angular/core';
//import test_data from '../../../test_input.json';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LanguageSelector } from '../api.languageselector';
import { ChatService } from '../chat_service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Injectable } from "@angular/core";
import io from 'socket.io-client';
import { MatTableDataSource } from '@angular/material/table';

import { Observable } from "rxjs";
import { ApiService } from '../api.service';
import { Wbp_rules } from './wbp_rules';



// for table 

export interface PeriodicElement {
  name: string;
  position: number;
  action: string;
  skateelementid: any,
  elmclip: any,
  validation_passed: any;

}
const ELEMENT_DATA: PeriodicElement[] = [

];

@Component({
  selector: 'app-material-dio-screen',
  templateUrl: './material-dio-screen.component.html',
  styleUrls: ['./material-dio-screen.component.css'],
  providers: [ChatService]
})


@Injectable()

export class MaterialDioScreenComponent implements OnInit {

  //private socket;

  user_access: any = false;

  // Variable declaration

  family_type: any[] = [];
  family: any[] = [];
  family_levels: any[] = [];

  structure_data: any = [];
  structure_input_data: any = {};

  input_code_new: any = "";


  //input_code: string ="";
  input: any;
  //input_notes: any[] = [];

  selectedRowIndex: any = -1;
  bonus_value: any = [];
  bonuses_deduction_tech_team: any = [];
  bonuses_deduction_tech_team_data: any = [];


  language!: string;
  dataSource = ELEMENT_DATA;
  displayedColumns: string[] = ['position', 'name', 'action'];


  TemplatedSegmentColumns: string[] = [];
  Template_datasource: any = [];


  data: any = {};
  elements: any = [];
  notes: any = [];
  bonuses_deduction: any = [];
  pattern_dance_data: any = {};
  skater_data: any = {};

  halfway_available: any = false;
  halfwayTimer: number = 0;
  time: any = 0;
  halfwayInterval: any;
  secondHalf: any = false;


  wbp_failed_index: any = [];
  review_index: any = [];


  wbp_done: any = false;
  validate_done: any = false;
  finalize_done: any = false;
  ref_score_finalize: any = false;

  halfway_index: any = 99;
  level_data: any = [];

  star_rating_type_data: any = [];

  template_rating_type: any = [];


  possible_family_type_level: any = [];


  constructor(public apiService: ApiService, private snackBar: MatSnackBar, private languageSelector: LanguageSelector, private _chatService: ChatService, private activatedRoute: ActivatedRoute, private _router: Router, public dialog: MatDialog,) {

    this.Template_datasource = new MatTableDataSource;



    this._chatService.onBroadcastResp()
      .subscribe(data => {

        console.log("in broadcast response", data)


        var incoming_data = JSON.parse(JSON.stringify(data));

        switch (incoming_data.method_name) {
          case "SEGEND":

            console.log("Segment end");

            if (this.activatedRoute.snapshot.params.segmentid == data.room) {
              //console.log("room closed")
              this.user_access = false;
            }

            break;

          case "SEGSTART":
            console.log("Segment start");



            if (this.activatedRoute.snapshot.params.segmentid == data.room) {
              //console.log("Room created = " + data.room);
              //this.user_access = true;

              this.snackBar.open("Segment started and data is Coming ...", "", {
                verticalPosition: 'top',
                panelClass: ['green-snackbar']
              });

              // var chat_room: any = {};
              // chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;

              // chat_room["competitorentryid"] = "29de489e-a2a8-4885-b844-12e63fa9c03f";


              // this._chatService.joinRoom(chat_room);



            }


            break;

          case "SEGMENT_START_FINISHED":



            if (this.activatedRoute.snapshot.params.segmentid == data.room) {

              console.log("segment start finsished", incoming_data);

              var chat_room: any = {};
              chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;;

              chat_room["method_name"] = 'NEWCLIENT';
              chat_room["data"] = { 'official_assignment_id': this.activatedRoute.snapshot.params.assignmentid };

              //this._chatService.createRoom(chat_room);

              console.log("time when client send request", new Date().toISOString())

              this._chatService.broadcast(chat_room);
            }


            break;

          case "JOINING_ROOM":
            var temp = JSON.parse(JSON.stringify(data))

            var required_data = temp["returnObj"];
            console.log("JOINING_ROOM", required_data);


            console.log("time when client get server response start data processing", new Date().toISOString())


            var dataObj = JSON.parse(JSON.stringify(required_data));

            // code for checking this official id is valid or not



            if (dataObj.inroom) {
              console.log("room exists and you're in it and here's your data objects!");
              //console.log(dataObj.chatHistoryObj);

              this.wbp_done = false;
              this.level_data = [];

              this.star_rating_type_data = [];

              this.possible_family_type_level = [];
              this.validate_done = false;
              this.finalize_done = false;
              this.ref_score_finalize = false;

              this.wbp_failed_index = [];
              this.review_index = [];

              this.skater_data = {};

              this.halfway_index = 99;
              this.halfway_available = false;
              this.secondHalf = false;

              this.structure_data = [];
              this.structure_input_data = {};
              this.input_code_new = "";
              this.selectedRowIndex = -1;

              this.dataSource = ELEMENT_DATA;


              for (let j = 0; j < this.bonuses_deduction_tech_team_data.length; j++) {

                var element_test = <HTMLInputElement>document.getElementById("bonus_value_" + j)

                if (element_test !== null) {
                  console.log("------------ try to remove bonus ---------------")
                  this.bonus_value = (<HTMLInputElement>document.getElementById("bonus_value_" + j)).value;
                  (<HTMLInputElement>document.getElementById("bonus_value_" + j)).value = String(0);
                }


              }



              this.data = JSON.parse(dataObj.initializationObj);

              console.log("JOINING_ROOM", this.data);

              console.log("category defintion type", this.data.segmentid.categoryid.definitionid.sc_scoringmethod);

              console.log("-----------------", this.data.segmentid.definitionid.sc_elementconfiguration.sc_mode);


              // validation for assigned user using interface 

              console.log("getting sc_num from session", sessionStorage.getItem('scnum'))

              if (sessionStorage.getItem("isOnline") == "true") {
                if (sessionStorage.getItem('scnum') != null) {
                  console.log("logged in", sessionStorage.getItem('scnum'))

                  var official_data = this.data.segmentid.official.filter((record: any) => record.officialassignmentid == this.activatedRoute.snapshot.params.assignmentid);

                  if (official_data.length > 0) {
                    console.log("found in offcial assignment", official_data)


                    console.log("value is ", official_data[0].sc_officialid.sc_scnum)

                    // case 1: AS a DS 

                    var ds_data = this.data.segmentid.categoryid.eventid.dspermissions.filter((record: any) => record.dscontactid == sessionStorage.getItem('contactid'));



                    if ((official_data[0].sc_officialid.sc_scnum == sessionStorage.getItem('scnum') && official_data[0]['role'] == '3B732AFD-FDA6-EC11-983F-00224825E0C8') || ds_data.length > 0) {
                      console.log("you are allowed as official or DS")

                      this.user_access = true;

                    }
                    else {
                      console.log("you are not allowed")

                      this._router.navigate([`/dashboard`]);
                    }

                  }
                  else {


                    console.log("not found in offcial assignment", official_data)

                    // you are not allowed to access

                    this._router.navigate([`/dashboard`]);
                  }

                }
                else {
                  console.log("not logged in", sessionStorage.getItem('scnum'))

                  //this.user_access = false;

                  this._router.navigate([`/login`]);

                  // redirect to error page

                }

              }
              else {
                this.user_access = true;
              }

              // creating columns for table in templated segment

              var columns: any = []

              columns.push("Skater_name");
              for (let k = 0; k < this.data.segmentid.definitionid.sc_elementconfiguration.elements.length; k++) {
                columns.push(this.data.segmentid.definitionid.sc_elementconfiguration.elements[k]['sc_skatingelementdefinitionid']['sc_elementcode']);
              }
              columns.push('Finalize');

              this.TemplatedSegmentColumns = columns;


              // creating row for templated segment


              var rows: any = [];

              for (let k = 0; k < this.data.segmentid.competitors.length; k++) {
                //rows.push({"Skater_name":this.data.segmentid.competitors[k]['sc_competitorid']['sc_name']});

                var row_object: any = {};
                row_object["Skater_name"] = this.data.segmentid.competitors[k]['sc_competitorid']['sc_name'];

                for (let j = 0; j < this.data.segmentid.definitionid.sc_elementconfiguration.elements.length; j++) {
                  row_object[this.data.segmentid.definitionid.sc_elementconfiguration.elements[j]['sc_skatingelementdefinitionid']['sc_elementcode']] = "";

                  //columns.push(this.data.segmentid.definitionid.sc_elementconfiguration.elements[j]['sc_skatingelementdefinitionid']['fam_sc_abbreviatedname']);
                }

                row_object["Finalize"] = false;

                rows.push(row_object);

              }

              this.Template_datasource = rows;


              if (this.data.segmentid.definitionid.sc_elementconfiguration.sc_mode == "947960001") {

                this.apiService.getTemplatedSegInfo({ 'segmentid': this.activatedRoute.snapshot.params.segmentid }).subscribe(
                  (res: any) => {
                    console.log("we got response back fromn an http request in get templated function", res, this.Template_datasource)

                    for (let k = 0; k < this.data.segmentid.competitors.length; k++) {
                      console.log("inside response", k)

                      var skater_data = res.filter((record: any) => record.competitorentryid == this.data.segmentid.competitors[k]["competitorentryid"]);

                      console.log('new notes', skater_data);


                      var element_count = 0;

                      for (let m = 0; m < skater_data[0]["output"].length; m++) {

                        element_count++;

                        var element_defination = this.data.segmentid.definitionid.sc_elementconfiguration.elements.filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == skater_data[0]["output"][m]["sc_skatingelementdefinitionid"]);

                        //console.log('---------->', skater_data[0]["output"][m]["ratingtype"].toString());

                        this.Template_datasource[k][element_defination[0]["sc_skatingelementdefinitionid"]["sc_elementcode"]] = skater_data[0]["output"][m]["ratingtype"].toString();

                      }

                      console.log("-----", element_count)


                      if (element_count == this.data.segmentid.definitionid.sc_elementconfiguration.elements.length) {

                        this.Template_datasource[k]["Finalize"] = true;
                      }
                    }
                  },
                  (error) => {
                    console.log("error coming", error)
                  })
              }

              //code for deciding rating type in dropdown

              var rating_type: any = [];

              for (let j = 0; j < this.data.segmentid.definitionid.sc_elementconfiguration.elements.length; j++) {
                rating_type.push(this.data.segmentid.definitionid.sc_elementconfiguration.elements[j]['sc_skatingelementdefinitionid']['sc_starratingtype'])

              }

              this.template_rating_type = rating_type;
              console.log("888888888888888888888888888", this.Template_datasource, this.template_rating_type)


              if (this.data.segmentid.definitionid.sc_programhalftime != null) {
                this.halfway_available = true;
                console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", this.data.segmentid.definitionid.sc_programhalftime, this.halfway_available)
              }

              this.elements = this.data.segmentid.definitionid.sc_elementconfiguration.elements;


              //this.notes = this.data.segmentid.categoryid.definitionid.sc_skatingdisciplinedefinition.notes;

              var new_notes_filter = this.data.segmentid.categoryid.definitionid.sc_skatingdisciplinedefinition.notes.filter((record: any) => record.sc_skatingelementnoteid.sc_enteredby == '3B732AFD-FDA6-EC11-983F-00224825E0C8');

              console.log('new notes', new_notes_filter);

              this.notes = new_notes_filter;



              // extra due to string structure in json data
              this.pattern_dance_data = this.data.segmentid.patterndanceid;

              this.bonuses_deduction = this.data.segmentid.definitionid.bonuses_deduction;


              // bonus deduction


              this.bonuses_deduction_tech_team = this.bonuses_deduction.filter((record: any) => record.sc_adjustmentdefinition.sc_type == "947960001");


              console.log("bonses before combine", this.bonuses_deduction_tech_team)
              // finding unique bonus name

              var bonus_data: any = [];
              var bonuses: any = [];

              for (let a = 0; a < this.bonuses_deduction_tech_team.length; a++) {
                bonuses.push(this.bonuses_deduction_tech_team[a].sc_adjustmentdefinition.sc_name)
              }

              var uniqueArray: any = bonuses.filter(function (item: any, pos: any, self: any) {
                return self.indexOf(item) == pos;
              })


              // formatting object for front end

              for (let b = 0; b < uniqueArray.length; b++) {

                var bonus_object: any = {};

                var bonus_deduction_match = this.bonuses_deduction.filter((record: any) => record.sc_adjustmentdefinition.sc_name == uniqueArray[b]);
                if (bonus_deduction_match.length >= 1) {
                  bonus_object['sc_name'] = bonus_deduction_match[0].sc_adjustmentdefinition.sc_name;
                  bonus_object['sc_frenchname'] = bonus_deduction_match[0].sc_adjustmentdefinition.sc_frenchname;
                  bonus_object['sc_group'] = bonus_deduction_match[0].sc_adjustmentdefinition.sc_group;
                  bonus_object['sc_skatingadjustmentassociationid'] = bonus_deduction_match[0]["sc_skatingadjustmentassociationid"];
                  bonus_object['value'] = 0;

                }

                bonus_data.push(bonus_object);
                bonus_object = {};

              }


              //console.log("new bonus data", bonus_data);
              this.bonuses_deduction_tech_team_data = bonus_data;

              console.log("bonses", this.bonuses_deduction_tech_team_data)

              // finding family type related to element

              for (let i = 0; i < this.elements.length; i++) {
                let familyType_individual: any = this.elements[i].sc_skatingelementdefinitionid.famtype_sc_name;
                this.family_type.push(familyType_individual);
              }

              var unique_family_type: any = this.family_type.filter(function (elem, index, self) {
                return index === self.indexOf(elem);
              });

              console.log("1", unique_family_type);

              // Logic for arranging family type order-wise

              var family_type_order = <any>{};

              for (let a = 0; a < unique_family_type.length; a++) {

                var order_data = this.elements.filter((record: any) => record.sc_skatingelementdefinitionid.famtype_sc_name == unique_family_type[a]);
                for (let k = 0; k < order_data.length; k++) {
                  family_type_order[unique_family_type[a]] = order_data[k].sc_skatingelementdefinitionid.famtype_sc_order;

                }

              }

              var items = Object.keys(family_type_order).map(function (key) {
                return [key, family_type_order[key]];
              });

              // Sort the array based on the family type 

              // items.sort(function (first, second) {
              //   return first[1] - second[1];
              // });

              const sortedAsc = items.sort((a, b) => {
                if (a[1] === null) {
                  return 1;
                }

                if (b[1] === null) {
                  return -1;
                }

                if (a[1] === b[1]) {
                  return 0;
                }

                return a[1] < b[1] ? -1 : 1;
              });



              console.log("items", sortedAsc);


              var family_type_with_order: any[] = [];

              for (let m = 0; m < items.length; m++) {
                family_type_with_order.push(items[m][0]);
              }

              console.log("new order family type ", family_type_with_order);

              // Finding modifier according new order

              var family_type_with_modifier: any[] = [];
              var family_type_modifier: any = "";

              for (let b = 0; b < family_type_with_order.length; b++) {

                var modifier_data = this.elements.filter((record: any) => record.sc_skatingelementdefinitionid.famtype_sc_name == family_type_with_order[b]);
                for (let c = 0; c < modifier_data.length; c++) {
                  family_type_modifier = modifier_data[c].sc_skatingelementdefinitionid.famtype_sc_modifiers;

                }
                family_type_with_modifier.push(family_type_modifier);
                family_type_modifier = "";

              }

              //console.log("modifier", family_type_with_modifier);

              var family_type_modifiers: any[] = [];

              for (let d = 0; d < family_type_with_modifier.length; d++) {
                var splitted: any[] = [];


                //var modifier = family_type_with_modifier[d].toString()
                var modifier = family_type_with_modifier[d];

                if (modifier == "" || modifier == null) {

                  family_type_modifiers.push(splitted);
                }

                if (modifier != "" && modifier != null) {

                  if (modifier.includes(";") > -1) {
                    splitted = modifier.split(";");
                    family_type_modifiers.push(splitted);
                    splitted = [];
                  }
                  else {
                    family_type_modifiers.push(splitted);
                  }

                }




              }

              //console.log("modifier_array", family_type_modifiers);

              // finding related families using family type

              for (let j = 0; j < family_type_with_order.length; j++) {
                var family_name: string[] = [];

                for (let k = 0; k < this.elements.length; k++) {

                  let family_type_name: any = this.elements[k].sc_skatingelementdefinitionid.famtype_sc_name;

                  var pattern_data: any = this.data["segmentid"]["patterndanceid"];

                  //console.log("pattern dance data",pattern_data);

                  var pattern_dance_def_code = pattern_data["sc_elementcodeprefix"];

                  if (pattern_dance_def_code == undefined) {

                    //console.log("coming in if condition",pattern_dance_def_code)
                    if (family_type_name == family_type_with_order[j]) {
                      family_name.push(this.elements[k].sc_skatingelementdefinitionid.fam_sc_name);
                    }

                  }
                  else {


                    let pattern_dance_code = this.elements[k].sc_skatingelementdefinitionid.sc_patterndancecode;
                    //console.log("coming in else condition",pattern_dance_def_code,pattern_dance_code,this.elements[k].sc_skatingelementdefinitionid)

                    if (family_type_name == family_type_with_order[j] && pattern_dance_code == pattern_dance_def_code) {
                      family_name.push(this.elements[k].sc_skatingelementdefinitionid.fam_sc_name);
                    }

                  }


                }

                this.family[j] = family_name;
              }

              for (let x = 0; x < this.family.length; x++) {
                var unique_family: any = this.family[x].filter(function (elem: any, index: any, self: any) {
                  return index === self.indexOf(elem);
                });
                this.family[x] = unique_family;
              }

              console.log("2", this.family);

              // Logic for arranging family order-wise

              var family_order_array = <any>[];
              for (let p = 0; p < this.family.length; p++) {
                var family_order = <any>{};

                for (let q = 0; q < this.family[p].length; q++) {
                  var family_order_data = this.elements.filter((record: any) => record.sc_skatingelementdefinitionid.fam_sc_name == this.family[p][q]);
                  for (let r = 0; r < family_order_data.length; r++) {
                    family_order[this.family[p][q]] = family_order_data[0].sc_skatingelementdefinitionid.fam_sc_order;
                  }
                }

                family_order_array.push(family_order);
                family_order = {};

              }

              var sorted_family_array_with_key = <any>[];

              for (let s = 0; s < family_order_array.length; s++) {
                var items = Object.keys(family_order_array[s]).map(function (key) {
                  return [key, family_order_array[s][key]];
                });

                // items.sort(function (first, second) {
                //   return first[1] - second[1];
                // });

                items.sort((a, b) => {
                  if (a[1] === null) {
                    return 1;
                  }

                  if (b[1] === null) {
                    return -1;
                  }

                  if (a[1] === b[1]) {
                    return 0;
                  }

                  return a[1] < b[1] ? -1 : 1;
                });


                sorted_family_array_with_key.push(items);


              }

              console.log("order family", sorted_family_array_with_key);


              var family_with_order: any[] = [];

              for (let t = 0; t < sorted_family_array_with_key.length; t++) {
                var single_family_with_order: any[] = [];
                for (let u = 0; u < sorted_family_array_with_key[t].length; u++) {
                  single_family_with_order.push(sorted_family_array_with_key[t][u][0])
                }
                family_with_order.push(single_family_with_order);
                single_family_with_order = [];
              }

              console.log("new order family", family_with_order);

              // finding all possible levels for individual family


              for (let m = 0; m < family_with_order.length; m++) {

                var sc_level_row: any[] = [];

                for (let p = 0; p < family_with_order[m].length; p++) {

                  let name: any = family_with_order[m][p];
                  var family_levels_group: any = this.elements.filter((record: any) => record.sc_skatingelementdefinitionid.fam_sc_name == name);
                  var sc_levels: any[] = [];

                  for (let n = 0; n < family_levels_group.length; n++) {

                    let sc_level: any = family_levels_group[n].sc_skatingelementdefinitionid.sc_level;

                    sc_levels.push(sc_level);
                  }

                  sc_level_row[p] = sc_levels;

                }

                this.family_levels[m] = sc_level_row;
              }


              for (let m = 0; m < this.family_levels.length; m++) {

                var level_row: any[] = [];
                for (let n = 0; n < this.family_levels[m].length; n++) {

                  var unique_sc_level: any = this.family_levels[m][n].filter(function (elem: any, index: any, self: any) {
                    return index === self.indexOf(elem);
                  });

                  unique_sc_level.sort();

                  level_row[n] = unique_sc_level;
                }
                this.family_levels[m] = level_row;

              }

              console.log("3", this.family_levels);

              //  formatting object for html

              var input = <any>[];
              var input_object = <any>{};

              for (let x = 0; x < family_type_with_order.length; x++) {

                input_object['family_type'] = family_type_with_order[x];

                var family_types_id = this.elements.filter((record: any) => record.sc_skatingelementdefinitionid.famtype_sc_name == family_type_with_order[x]);
                if (family_types_id.length > 0) {
                  input_object['family_type_id'] = family_types_id[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"];
                }

                input_object['family_type_modifier'] = family_type_modifiers[x]


                var family_array = <any>[];
                var families = <any>{};

                for (let y = 0; y < family_with_order[x].length; y++) {
                  families['family'] = family_with_order[x][y];

                  // adding 2 more data for abbraviated columns

                  var associated_family = this.elements.filter((record: any) => record.sc_skatingelementdefinitionid.fam_sc_name == family_with_order[x][y]);
                  if (associated_family.length > 0) {
                    families['family_abbreviatedname'] = associated_family[0]["sc_skatingelementdefinitionid"]["fam_sc_abbreviatedname"];
                    families['family_abbreviatednamefr'] = associated_family[0]["sc_skatingelementdefinitionid"]["fam_sc_abbreviatednamefr"];
                  }


                  var level_array = <any>[];
                  var levels = <any>{};

                  for (let z = 0; z < this.family_levels[x][y].length; z++) {


                    //Uncomment this for pattern daqnce

                    var pattern_data: any = this.data["segmentid"]["patterndanceid"];


                    var pattern_dance_code = pattern_data["sc_elementcodeprefix"];


                    if (pattern_dance_code == undefined) {

                      var element_codes = this.elements.filter((record: any) => record.sc_skatingelementdefinitionid.fam_sc_name == family_with_order[x][y] && record.sc_skatingelementdefinitionid.sc_level === this.family_levels[x][y][z] && record.sc_skatingelementdefinitionid.sc_flying == 0 && record.sc_skatingelementdefinitionid.sc_change == 0 && record.sc_skatingelementdefinitionid.sc_throw == 0 && record.sc_skatingelementdefinitionid.sc_takeoffflag === null && record.sc_skatingelementdefinitionid.sc_rotationflag === null && record.sc_skatingelementdefinitionid.sc_valueadjustmentv == 0 && record.sc_skatingelementdefinitionid.sc_synchrocombination == null);
                    }
                    else {
                      var element_codes = this.elements.filter((record: any) => record.sc_skatingelementdefinitionid.fam_sc_name == family_with_order[x][y] && record.sc_skatingelementdefinitionid.sc_level === this.family_levels[x][y][z] && record.sc_skatingelementdefinitionid.sc_patterndancecode == pattern_dance_code && record.sc_skatingelementdefinitionid.sc_flying == 0 && record.sc_skatingelementdefinitionid.sc_change == 0 && record.sc_skatingelementdefinitionid.sc_throw == 0 && record.sc_skatingelementdefinitionid.sc_takeoffflag === null && record.sc_skatingelementdefinitionid.sc_rotationflag === null && record.sc_skatingelementdefinitionid.sc_valueadjustmentv == 0 && record.sc_skatingelementdefinitionid.sc_synchrocombination == null);
                    }

                    //console.log("!!!!!!!!!!!!!!!",element_codes);

                    for (let i = 0; i < element_codes.length; i++) {


                      // if(element_codes[i].sc_skatingelementdefinitionid.sc_patterndancecode != undefined && element_codes[i].sc_skatingelementdefinitionid.sc_patterndancecode != null )
                      // {
                      //   //console.log("asjas",element_codes[i].sc_skatingelementdefinitionid.sc_patterndancecode)

                      //   let mainString = element_codes[i].sc_skatingelementdefinitionid.sc_elementcode;
                      //   let substring = element_codes[i].sc_skatingelementdefinitionid.sc_patterndancecode;
                      //   let result = mainString.replace(substring, "");

                      //   console.log("rerhfekjhr",result);

                      //   levels['element_code'] = result;

                      // }
                      // else
                      // {
                      //   levels['element_code'] = element_codes[i].sc_skatingelementdefinitionid.sc_elementcode;
                      // }

                      levels['element_code'] = element_codes[i].sc_skatingelementdefinitionid.sc_elementcode;
                      levels['sc_starratingtype'] = element_codes[i].sc_skatingelementdefinitionid.sc_starratingtype;


                    }

                    levels['level'] = this.family_levels[x][y][z];


                    level_array.push(levels);

                    levels = {};

                  }
                  families['family_component'] = level_array;

                  family_array.push(families);


                  input_object['family_type_component'] = family_array;


                  families = {};

                }

                input.push(input_object);
                input_object = {};

              }

              console.log("input_data:", input);
              this.input = input;

              // level structure 

              for (let a = 0; a < this.input.length; a++) {
                this.level_data.push(["", "", "", "", "", ""]);
                this.star_rating_type_data.push([""]);
              }

              console.log("this level data", this.level_data);

              console.log("this star_rating_type_data data", this.star_rating_type_data);

              // all possible level for family type


              for (let b = 0; b < this.input.length; b++) {
                var tem_array: any = [];
                for (let c = 0; c < this.input[b]["family_type_component"].length; c++) {
                  for (let d = 0; d < this.input[b]["family_type_component"][c]["family_component"].length; d++) {
                    if (tem_array.includes(this.input[b]["family_type_component"][c]["family_component"][d]["level"]) == false) {
                      var dummy = this.input[b]["family_type_component"][c]["family_component"][d]["level"];

                      if (dummy == "B") {
                        dummy = "0";
                      }
                      tem_array.push(dummy);
                    }
                  }
                }

                this.possible_family_type_level.push(tem_array);


              }

              console.log("new array", this.possible_family_type_level);

              console.log("this level data", this.possible_family_type_level);

              //this.user_access = true;



            }
            else {
              console.log("no room exists for this segment yet");

              this.user_access = false;

            }

            this.snackBar.dismiss();

            console.log("time when client get server response - finish data processing", new Date().toISOString())



            break;

          case "LOAD_SKATER":

            var temp = JSON.parse(JSON.stringify(data))

            console.log("LOAD_SKATER", temp);

            console.log("this skater data before ", this.skater_data);

            this.skater_data = temp["data"];

            console.log("this skater data bonus length", this.bonuses_deduction_tech_team.length, this.skater_data);



            this.structure_data = [];
            this.structure_input_data = {};
            this.input_code_new = "";
            this.selectedRowIndex = -1;

            this.wbp_failed_index = [];
            this.review_index = [];

            this.halfway_index = 99;
            this.secondHalf = false;

            clearInterval(this.halfwayInterval);
            this.time = 0;
            this.halfwayTimer = 0;


            this.wbp_done = false;

            this.validate_done = false;
            this.finalize_done = false;
            this.ref_score_finalize = false;

            this.dataSource = ELEMENT_DATA;

            // removing level from all level buttons

            for (let a = 0; a < this.level_data.length; a++) {
              for (let b = 0; b < this.level_data[a].length; b++) {
                this.level_data[a][b] = "";
              }
            }

            console.log("this level data", this.level_data);

            // removing info from star_rating_type_data

            for (let a = 0; a < this.star_rating_type_data.length; a++) {
              for (let b = 0; b < this.star_rating_type_data[a].length; b++) {
                this.star_rating_type_data[a][b] = "";
              }
            }

            console.log("this star_rating_type_data data", this.star_rating_type_data);

            //console.log("bonuses_deduction_tech_team_data",this.bonuses_deduction_tech_team_data,this.bonus_value);

            if (temp["history"] != true) {
              for (let j = 0; j < this.bonuses_deduction_tech_team_data.length; j++) {

                this.bonus_value = (<HTMLInputElement>document.getElementById("bonus_value_" + j)).value;
                (<HTMLInputElement>document.getElementById("bonus_value_" + j)).value = String(0);
              }
            }



            this.newData = {

              'room': this.activatedRoute.snapshot.params.segmentid,
              'datasource': this.dataSource,
              'role_id': '3B732AFD-FDA6-EC11-983F-00224825E0C8',
              'user_access': false
            }



            // enable screen if 
            const test = Array.from(document.getElementsByClassName('grid-container') as HTMLCollectionOf<HTMLElement>)

            test.forEach((element) => {

              element.style.opacity = '';

              element.style.backgroundColor = '';
              element.style.zIndex = '';
              element.style.pointerEvents = '';


            });

            break;

          case "STOPSKATER":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("STOPSKATER", temp);



            // variables change for new screen

            this.wbp_failed_index = [];
            this.review_index = [];
            this.skater_data = {};
            this.halfway_index = 99;
            this.secondHalf = false;


            this.structure_data = [];
            this.structure_input_data = {};
            this.input_code_new = "";
            this.selectedRowIndex = -1;

            this.wbp_done = false;


            this.validate_done = false;
            this.finalize_done = false;
            this.ref_score_finalize = false;


            clearInterval(this.halfwayInterval);
            this.time = 0;
            this.halfwayTimer = 0;


            this.dataSource = ELEMENT_DATA;

            // removing level from all level buttons

            for (let a = 0; a < this.level_data.length; a++) {
              for (let b = 0; b < this.level_data[a].length; b++) {
                this.level_data[a][b] = "";
              }
            }

            console.log("this level data", this.level_data);

            // removing info from star_rating_type_data

            for (let a = 0; a < this.star_rating_type_data.length; a++) {
              for (let b = 0; b < this.star_rating_type_data[a].length; b++) {
                this.star_rating_type_data[a][b] = "";
              }
            }

            console.log("this star_rating_type_data data", this.star_rating_type_data);


            // other code

            for (let j = 0; j < this.bonuses_deduction_tech_team_data.length; j++) {

              this.bonus_value = (<HTMLInputElement>document.getElementById("bonus_value_" + j)).value;
              (<HTMLInputElement>document.getElementById("bonus_value_" + j)).value = String(0);
            }


            this.newData = {

              'room': this.activatedRoute.snapshot.params.segmentid,
              'datasource': this.dataSource,
              'role_id': '3B732AFD-FDA6-EC11-983F-00224825E0C8',
              'user_access': false
            }

            const test1 = Array.from(document.getElementsByClassName('grid-container') as HTMLCollectionOf<HTMLElement>)

            test1.forEach((element) => {

              element.style.opacity = '';

              element.style.backgroundColor = '';
              element.style.zIndex = '';
              element.style.pointerEvents = '';


            });


            break;


          case "NEWELM":

            console.log("time on NEWELM client request", JSON.parse(JSON.stringify(new Date().toISOString())))

            var temp = JSON.parse(JSON.stringify(data))
            console.log("new element added", temp);

            console.log("structure input data before", this.structure_input_data);

            this.structure_input_data = temp["data"]["input_data"];

            console.log("structure input data after", this.structure_input_data);

            // code for name of element

            var whole_string_data = "";
            for (let x = 0; x < this.structure_input_data["elements"].length; x++) {
              var individual_string = "";

              // if (this.structure_input_data["elements"][x]['Pattern_dance_code'] != "") {
              //   individual_string = individual_string + this.structure_input_data["elements"][x]['Pattern_dance_code'];
              // }

              if (this.structure_input_data["elements"][x]['Flying'] == true) {
                individual_string = individual_string + "F";
              }

              if (this.structure_input_data["elements"][x]['Change'] == true) {
                individual_string = individual_string + "C";
              }

              if (this.structure_input_data["elements"][x]['Element_code'] != "") {
                individual_string = individual_string + this.structure_input_data["elements"][x]['Element_code'];
              }

              if (this.structure_input_data["elements"][x]['Synchro_element_suffix'].length >= 1) {
                var tem = "";
                for (let a = 0; a < this.structure_input_data["elements"][x]['Synchro_element_suffix'].length; a++) {
                  tem = tem + this.structure_input_data["elements"][x]['Synchro_element_suffix'][a];
                }
                individual_string = individual_string + "+" + tem;
              }

              if (this.structure_input_data["elements"][x]['Throw'] == true) {
                individual_string = individual_string + "Th";
              }

              if (this.structure_input_data["elements"][x]['Edge'] != "") {
                individual_string = individual_string + this.structure_input_data["elements"][x]['Edge'];
              }

              if (this.structure_input_data["elements"][x]['Rotation'] != "") {
                individual_string = individual_string + this.structure_input_data["elements"][x]['Rotation'];
              }

              if (this.structure_input_data["elements"][x]['Synchro'] != "") {
                individual_string = individual_string + this.structure_input_data["elements"][x]['Synchro'];
              }



              if (this.structure_input_data["elements"][x]['V'] == true) {
                individual_string = individual_string + "V";
              }

              if (this.structure_input_data["elements"][x]['invalid'] == true) {
                individual_string = individual_string + "*";
              }

              if (this.structure_input_data["elements"][x]['notes'].length >= 1) {

                for (let a = 0; a < this.structure_input_data["elements"][x]['notes'].length; a++) {

                  if (a == 0) {
                    individual_string = individual_string + "+" + this.structure_input_data["elements"][x]['notes'][a];
                  }
                  else {
                    individual_string = individual_string + this.structure_input_data["elements"][x]['notes'][a];
                  }

                  //individual_string = individual_string + "[" + this.structure_input_data["elements"][x]['notes'][a] + "]";
                }

              }

              if (whole_string_data == "") {
                whole_string_data = individual_string;
              }
              else {
                whole_string_data = whole_string_data + "+" + individual_string;
              }


            }

            if (temp["data"]["input_data"]["rep_jump"] == true) {
              whole_string_data = whole_string_data + "+REP";
            }


            if (temp["data"]["input_data"]["rating"] != "") {

              var value = "";

              switch (temp["data"]["input_data"]["rating"]) {
                // EC ACTIVITIES
                case 947960000:

                  console.log("caser bronz");

                  value = "B";

                  break;

                case 947960001:

                  console.log("caser silver");
                  value = "S";

                  break;

                case 947960002:
                  console.log("caser gold");
                  value = "G";

                  break;

                case 947960003:
                  console.log("caser complete");
                  value = "C";
                  break;

                case 947960004:
                  console.log("caser in complete");
                  value = "I/C";
                  break;

                case 947960005:
                  console.log("caser successful");
                  value = "SUC";

                  break;

                case 947960006:
                  console.log("caser unsuccessful");
                  value = "U/S";

                  break;


                default:
                  console.log("no rating value")
                  break;


              }

              whole_string_data = whole_string_data + " [" + value + "]";

            }





            this.input_code_new = whole_string_data;



            //console.log("new element added",JSON.parse(JSON.stringify(this.dataSource.length)));

            // code for local table data fill up

            if (temp["data"]["createdElement"]["position"] > this.dataSource.length) {
              var element_list = <any>[];
              var each_element = <any>{};

              var i = 1;

              for (let b = 0; b < this.dataSource.length; b++) {
                element_list.push(this.dataSource[b]);
                i = i + 1;
              }
              each_element['position'] = i;
              each_element['name'] = this.input_code_new;
              each_element['action'] = '';
              each_element['skateelementid'] = '';
              each_element['elmclip'] = '';


              element_list.push(each_element);

              each_element = {};

              this.input_code_new = "";
              this.dataSource = element_list;

              this.structure_data.push({ "type": temp["data"]["input_data"]["type"], "rep_jump": temp["data"]["input_data"]["rep_jump"], "rating": temp["data"]["input_data"]["rating"], "elements": this.structure_input_data["elements"] })
              //this.structure_data.push(this.structure_input_data["elements"]);
              this.structure_input_data = {};

            }
            else {
              if (this.dataSource[temp["data"]["createdElement"]["position"] - 1]["name"] == "") {
                console.log("insert before coming from local interfaces");
              }
              else {
                console.log("insert before coming from server for history")

                var element_list = <any>[];
                var each_element = <any>{};

                for (let b = 0; b < this.dataSource.length; b++) {

                  if (b < temp["data"]["createdElement"]["position"] - 1) {
                    element_list.push(this.dataSource[b]);

                  }
                  if (b == temp["data"]["createdElement"]["position"] - 1) {

                    each_element['position'] = b + 1;
                    each_element['name'] = '';
                    each_element['action'] = '';
                    each_element['skateelementid'] = '';
                    each_element['elmclip'] = '';

                    element_list.push(each_element);

                    each_element = {};

                    each_element['position'] = b + 2;
                    each_element['name'] = this.dataSource[b].name;
                    each_element['action'] = '';
                    each_element['skateelementid'] = this.dataSource[b].skateelementid;
                    each_element['elmclip'] = this.dataSource[b].elmclip;

                    element_list.push(each_element);
                    each_element = {};

                  }
                  if (b > temp["data"]["createdElement"]["position"] - 1) {
                    each_element['position'] = b + 2;
                    each_element['name'] = this.dataSource[b].name;
                    each_element['action'] = '';
                    each_element['skateelementid'] = this.dataSource[b].skateelementid;
                    each_element['elmclip'] = this.dataSource[b].elmclip;

                    element_list.push(each_element);

                    each_element = {};

                  }


                }

                this.dataSource = element_list;

              }


              var modified_elements = <any>[];

              for (let b = 0; b < this.dataSource.length; b++) {
                if (b != (temp["data"]["createdElement"]["position"] - 1)) {
                  modified_elements.push(this.dataSource[b]);
                }
                else {

                  var edit_element_object = <any>{};

                  edit_element_object['position'] = b + 1;
                  edit_element_object['name'] = this.input_code_new;
                  edit_element_object['action'] = '';
                  edit_element_object['skateelementid'] = '';
                  edit_element_object['elmclip'] = '';


                  modified_elements.push(edit_element_object);


                  edit_element_object = {};

                }
              }



              //this.structure_data.splice(temp["data"]["createdElement"]["position"] - 1, 0, this.structure_input_data["elements"]);
              this.structure_data.splice(temp["data"]["createdElement"]["position"] - 1, 0, { "type": temp["data"]["input_data"]["type"], "rep_jump": temp["data"]["input_data"]["rep_jump"], "rating": temp["data"]["input_data"]["rating"], "elements": this.structure_input_data["elements"] });

              this.structure_input_data = {};

              this.dataSource = modified_elements;

              this.input_code_new = "";
              this.selectedRowIndex = -1;
            }



            this.dataSource[temp["data"]["createdElement"]["position"] - 1]["skateelementid"] = temp["data"]["createdElement"]["newid"]

            console.log("datasource", this.dataSource)
            console.log("datasource", this.structure_data)

            console.log("time on NEWELM client request done", JSON.parse(JSON.stringify(new Date().toISOString())))


            this.newData["datasource"] = this.dataSource;

            break;

          case "CHGELM":

            var temp = JSON.parse(JSON.stringify(data))

            console.log("element chaged", temp, this.input_code_new.length)

            console.log("edit before structure data", this.structure_data)
            console.log("edit before structure input data", this.structure_input_data)




            // local interface change

            var modified_elements = <any>[];

            for (let b = 0; b < this.dataSource.length; b++) {
              if (b != (temp["data"]["position"] - 1)) {
                modified_elements.push(this.dataSource[b]);
              }
              else {

                if (temp["data"]["input_data"].hasOwnProperty('elements')) {
                  console.log("in case for edit ");

                  this.structure_input_data = temp["data"]["input_data"];


                  // code for name of element

                  var whole_string_data = "";


                  for (let x = 0; x < this.structure_input_data["elements"].length; x++) {
                    var individual_string = "";

                    // if (this.structure_input_data["elements"][x]['Pattern_dance_code'] != "") {
                    //   individual_string = individual_string + this.structure_input_data["elements"][x]['Pattern_dance_code'];
                    // }

                    if (this.structure_input_data["elements"][x]['Flying'] == true) {
                      individual_string = individual_string + "F";
                    }

                    if (this.structure_input_data["elements"][x]['Change'] == true) {
                      individual_string = individual_string + "C";
                    }

                    if (this.structure_input_data["elements"][x]['Element_code'] != "") {
                      individual_string = individual_string + this.structure_input_data["elements"][x]['Element_code'];
                    }

                    if (this.structure_input_data["elements"][x]['Synchro_element_suffix'].length >= 1) {
                      var tem = "";
                      for (let a = 0; a < this.structure_input_data["elements"][x]['Synchro_element_suffix'].length; a++) {
                        tem = tem + this.structure_input_data["elements"][x]['Synchro_element_suffix'][a];
                      }
                      individual_string = individual_string + "+" + tem;
                    }

                    if (this.structure_input_data["elements"][x]['Throw'] == true) {
                      individual_string = individual_string + "Th";
                    }

                    if (this.structure_input_data["elements"][x]['Edge'] != "") {
                      individual_string = individual_string + this.structure_input_data["elements"][x]['Edge'];
                    }

                    if (this.structure_input_data["elements"][x]['Rotation'] != "") {
                      individual_string = individual_string + this.structure_input_data["elements"][x]['Rotation'];
                    }

                    if (this.structure_input_data["elements"][x]['Synchro'] != "") {
                      individual_string = individual_string + this.structure_input_data["elements"][x]['Synchro'];
                    }


                    if (this.structure_input_data["elements"][x]['V'] == true) {
                      individual_string = individual_string + "V";
                    }

                    if (this.structure_input_data["elements"][x]['invalid'] == true) {
                      individual_string = individual_string + "*";
                    }

                    if (this.structure_input_data["elements"][x]['notes'].length >= 1) {

                      for (let a = 0; a < this.structure_input_data["elements"][x]['notes'].length; a++) {

                        if (a == 0) {
                          individual_string = individual_string + "+" + this.structure_input_data["elements"][x]['notes'][a];
                        }
                        else {
                          individual_string = individual_string + this.structure_input_data["elements"][x]['notes'][a];
                        }

                        //individual_string = individual_string + "[" + this.structure_input_data["elements"][x]['notes'][a] + "]";
                      }

                    }

                    if (whole_string_data == "") {
                      whole_string_data = individual_string;
                    }
                    else {
                      whole_string_data = whole_string_data + "+" + individual_string;
                    }


                  }

                  if (this.structure_input_data["rep_jump"] == true) {
                    whole_string_data = whole_string_data + "+REP";
                  }


                  if (this.structure_input_data["rating"] != "") {

                    var value = "";

                    switch (this.structure_input_data["rating"]) {
                      // EC ACTIVITIES
                      case 947960000:

                        console.log("caser bronz");

                        value = "B";

                        break;

                      case 947960001:

                        console.log("caser silver");
                        value = "S";

                        break;

                      case 947960002:
                        console.log("caser gold");
                        value = "G";

                        break;

                      case 947960003:
                        console.log("caser complete");
                        value = "C";
                        break;

                      case 947960004:
                        console.log("caser in complete");
                        value = "I/C";
                        break;

                      case 947960005:
                        console.log("caser successful");
                        value = "SUC";

                        break;

                      case 947960006:
                        console.log("caser unsuccessful");
                        value = "U/S";

                        break;


                      default:
                        console.log("no rating value")
                        break;


                    }

                    whole_string_data = whole_string_data + " [" + value + "]";

                    //    whole_string_data = whole_string_data + " [" + this.structure_input_data["rating"]  + "]";
                  }


                  this.input_code_new = whole_string_data;

                  var edit_element_object = <any>{};

                  edit_element_object['position'] = b + 1;
                  edit_element_object['name'] = this.input_code_new;
                  edit_element_object['action'] = '';
                  edit_element_object['skateelementid'] = '';
                  edit_element_object['elmclip'] = '';

                  modified_elements.push(edit_element_object);
                  edit_element_object = {};


                  //this.structure_data.splice(temp["data"]["position"]-1, 1, this.structure_input_data["elements"]);
                  this.structure_data.splice(temp["data"]["position"] - 1, 1, { "type": temp["data"]["input_data"]["type"], "rep_jump": this.structure_input_data["rep_jump"], "rating": this.structure_input_data["rating"], "elements": this.structure_input_data["elements"] });

                  this.structure_input_data = {};


                  this.input_code_new = "";
                  this.selectedRowIndex = -1;

                }
                else {


                  console.log("Will be rare - almost no - this input code new for edit - invalid element");


                  for (let x = 0; x < this.structure_data[temp["data"]["position"] - 1]["elements"].length; x++) {
                    this.structure_data[temp["data"]["position"] - 1]["elements"][x]['invalid'] = temp["data"]["input_data"]["elements"][x]["invalid"];
                  }

                  var whole_string_data = "";


                  for (let x = 0; x < this.structure_data[temp["data"]["position"] - 1]["elements"].length; x++) {
                    var individual_string = "";

                    // if (this.structure_data[temp["data"]["position"] - 1]["elements"][x]['Pattern_dance_code'] != "") {
                    //   individual_string = individual_string + this.structure_data[temp["data"]["position"] - 1]["elements"][x]['Pattern_dance_code'];
                    // }

                    if (this.structure_data[temp["data"]["position"] - 1]["elements"][x]['Flying'] == true) {
                      individual_string = individual_string + "F";
                    }

                    if (this.structure_data[temp["data"]["position"] - 1]["elements"][x]['Change'] == true) {
                      individual_string = individual_string + "C";
                    }

                    if (this.structure_data[temp["data"]["position"] - 1]["elements"][x]['Element_code'] != "") {
                      individual_string = individual_string + this.structure_data[temp["data"]["position"] - 1]["elements"][x]['Element_code'];
                    }

                    if (this.structure_data[temp["data"]["position"] - 1]["elements"][x]['Synchro_element_suffix'].length >= 1) {
                      var tem = "";
                      for (let a = 0; a < this.structure_data[temp["data"]["position"] - 1]["elements"][x]['Synchro_element_suffix'].length; a++) {
                        tem = tem + this.structure_data[temp["data"]["position"] - 1]["elements"][x]['Synchro_element_suffix'][a];
                      }
                      individual_string = individual_string + "+" + tem;
                    }

                    if (this.structure_data[temp["data"]["position"] - 1]["elements"][x]['Throw'] == true) {
                      individual_string = individual_string + "Th";
                    }

                    if (this.structure_data[temp["data"]["position"] - 1]["elements"][x]['Edge'] != "") {
                      individual_string = individual_string + this.structure_data[temp["data"]["position"] - 1]["elements"][x]['Edge'];
                    }

                    if (this.structure_data[temp["data"]["position"] - 1]["elements"][x]['Rotation'] != "") {
                      individual_string = individual_string + this.structure_data[temp["data"]["position"] - 1]["elements"][x]['Rotation'];
                    }

                    if (this.structure_data[temp["data"]["position"] - 1]["elements"][x]['Synchro'] != "") {
                      individual_string = individual_string + this.structure_data[temp["data"]["position"] - 1]["elements"][x]['Synchro'];
                    }


                    if (this.structure_data[temp["data"]["position"] - 1]["elements"][x]['V'] == true) {
                      individual_string = individual_string + "V";
                    }

                    if (this.structure_data[temp["data"]["position"] - 1]["elements"][x]['invalid'] == true) {
                      individual_string = individual_string + "*";
                    }

                    if (this.structure_data[temp["data"]["position"] - 1]["elements"][x]['notes'].length >= 1) {

                      for (let a = 0; a < this.structure_data[temp["data"]["position"] - 1]["elements"][x]['notes'].length; a++) {

                        if (a == 0) {
                          individual_string = individual_string + "+" + this.structure_data[temp["data"]["position"] - 1]["elements"][x]['notes'][a];
                        }
                        else {
                          individual_string = individual_string + this.structure_data[temp["data"]["position"] - 1]["elements"][x]['notes'][a];
                        }

                        //individual_string = individual_string + "[" + this.structure_data[temp["data"]["position"] - 1]["elements"][x]['notes'][a] + "]";
                      }

                    }

                    if (whole_string_data == "") {
                      whole_string_data = individual_string;
                    }
                    else {
                      whole_string_data = whole_string_data + "+" + individual_string;
                    }


                  }

                  if (temp["data"]["input_data"]["rep_jump"] == true) {
                    whole_string_data = whole_string_data + "+REP";
                  }

                  if (temp["data"]["input_data"]["rating"] != "") {

                    var value = "";

                    switch (temp["data"]["input_data"]["rating"]) {
                      // EC ACTIVITIES
                      case 947960000:

                        console.log("caser bronz");

                        value = "B";

                        break;

                      case 947960001:

                        console.log("caser silver");
                        value = "S";

                        break;

                      case 947960002:
                        console.log("caser gold");
                        value = "G";

                        break;

                      case 947960003:
                        console.log("caser complete");
                        value = "C";
                        break;

                      case 947960004:
                        console.log("caser in complete");
                        value = "I/C";
                        break;

                      case 947960005:
                        console.log("caser successful");
                        value = "SUC";

                        break;

                      case 947960006:
                        console.log("caser unsuccessful");
                        value = "U/S";

                        break;


                      default:
                        console.log("no rating value")
                        break;


                    }

                    whole_string_data = whole_string_data + " [" + value + "]";

                    // whole_string_data = whole_string_data + " [" + temp["data"]["input_data"]["rating"]  + "]";
                  }




                  //console.log("whole strig generated",whole_string_data);



                  var invalid_element_object = <any>{};

                  invalid_element_object['position'] = b + 1;
                  invalid_element_object['name'] = whole_string_data;
                  invalid_element_object['action'] = '';
                  invalid_element_object['skateelementid'] = this.dataSource[b]["skateelementid"];
                  invalid_element_object['elmclip'] = this.dataSource[b]["elmclip"];

                  modified_elements.push(invalid_element_object);


                }




              }
            }


            this.dataSource = modified_elements;


            this.dataSource[temp["data"]["position"] - 1]["skateelementid"] = temp["data"]["newid"]

            console.log("datasource", this.dataSource)
            console.log("data structure", this.structure_data)


            this.newData["datasource"] = this.dataSource;

            break;

          case "DELELM":


            var temp = JSON.parse(JSON.stringify(data))
            console.log("element deleted", temp);

            var modified_elements = <any>[];

            for (let b = 0; b < this.dataSource.length; b++) {
              if (b != temp["data"]["position"] - 1) {
                modified_elements.push(this.dataSource[b]);
              }
              else {

                this.structure_data.splice(temp["data"]["position"] - 1, 1);

              }

            }

            for (let c = 0; c < modified_elements.length; c++) {
              modified_elements[c]['position'] = c + 1;
            }

            this.dataSource = modified_elements;


            console.log("datasource", this.dataSource)

            this.newData["datasource"] = this.dataSource;

            break;


          case "HALFWAY_REQUEST":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("element HALFWAY_REQUEST", temp);

            this.halfway_index = temp["data"]["data"]["index"];

            break;


          case "CHECK_UNCHECK_REQUEST":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("CHECK_UNCHECK_REQUEST", temp);

            const index = this.review_index.indexOf(temp["data"]["data"]["index"]);

            if (index > -1) {
              //console.log("in if loop");
              this.review_index.splice(index, 1); // 2nd parameter means remove one item only
            }
            else {
              //console.log("in else loop");
              this.review_index.push(temp["data"]["data"]["index"]);

            }

            console.log("this array data", this.review_index)


            break;

          case "DIOSTATUS":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("Status Update", temp);

            console.log("Status Update1", temp["data"]);
            console.log("Status Update2", temp["data"]["data"]);
            console.log("Status Update3", temp["data"]["data"]["statusmessage"]);

            if (temp["data"]["data"]["statusmessage"] == "validate") {
              clearInterval(this.halfwayInterval);

              this.validate_done = true;

              console.log("coming here0000000")

            }

            if (temp["data"]["data"]["statusmessage"] == "WBP") {

              // code for new names accrding chnage and highlight errors

              this.wbp_done = true;

              this.wbp_failed_index = temp["data"]["data"]["changed_index"];

              for (let a = 0; a < temp["data"]["data"]["changed_data"]["input_data"].length; a++) {

                if (a < this.dataSource.length && a >= 0) {

                  this.dataSource[a]["name"] = this.object_code_generator(temp["data"]["data"]["changed_data"]["input_data"][a])["whole_string"];
                }

                //console.log("Compare",this.object_code_generator(temp["data"]["data"]["changed_data"]["input_data"][a]),this.object_code_generator(temp["data"]["data"]["old_data"][a]));
              }





              // modify current structure of elemetns
              this.structure_data = temp["data"]["data"]["changed_data"]["input_data"];

              console.log("nre structure data", this.structure_data)
            }


            if (temp["data"]["statusmessage"] == "finalize") {
              this.finalize_done = true;
              this.ref_score_finalize = false;
            }

            // if(temp["data"]["statusmessage"] == "finalize")
            // {

            //   // logic for overlaying screen for disable

            //   const test = Array.from(document.getElementsByClassName('grid-container') as HTMLCollectionOf<HTMLElement>)

            //   test.forEach((element) => {

            //     console.log("data in screns", element.style.opacity,element.style.backgroundColor,element.style.zIndex,element.style.pointerEvents)
            //     element.style.opacity = '0.75';

            //     element.style.backgroundColor = '#bebebe';
            //     element.style.zIndex = '9999999';
            //     element.style.pointerEvents = 'none';

            //   });
            // }
            break;

          case "DIOADJCHG":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("DIOADJCHG", temp);

            //var bonus_match = this.bonuses_deduction_tech_team_data.filter((record: any) => record.value == temp["data"]["createdElement"]["sc_skatingadjustmentassociationid"]);



            var tem_data = this.bonuses_deduction_tech_team.filter((record: any) => record.sc_skatingadjustmentassociationid == temp["data"]["createdElement"]["sc_skatingadjustmentassociationid"]);

            //console.log("------------",tem_data);


            for (let i = 0; i < this.bonuses_deduction_tech_team_data.length; i++) {
              if (tem_data.length > 0) {
                if (this.bonuses_deduction_tech_team_data[i]["sc_name"] == tem_data[0]["sc_adjustmentdefinition"]["sc_name"]) {
                  this.bonuses_deduction_tech_team_data[i]["value"] = temp["data"]["createdElement"]["total"];

                  // code for changing local interface
                  (<HTMLInputElement>document.getElementById("bonus_value_" + temp["data"]["createdElement"]["position"])).value = String(+temp["data"]["createdElement"]["total"]);

                }
              }


            }



            console.log("bonuses_deduction_tech_team_data", JSON.parse(JSON.stringify(this.bonuses_deduction_tech_team_data)));


            break;


          case "ELMVIDCLIP":
            var temp = JSON.parse(JSON.stringify(data))
            console.log("ELMVIDCLIP", temp);

            for (let m = 0; m < this.dataSource.length; m++) {
              if (temp["data"]["skateelementid"] == this.dataSource[m]['skateelementid']) {
                if (temp["data"]["clip"].length > 1) {
                  if (temp["data"]["clip"][0] != '') {
                    this.dataSource[m]['elmclip'] = temp["data"]["clip"];

                  }
                  else {
                    this.dataSource[m]['elmclip'] = '';
                  }
                }

              }
            }

            console.log("clip com", this.dataSource);

            this.newData["datasource"] = this.dataSource;

            break;


          case "ELMVIDCLIPDEL":
            var temp = JSON.parse(JSON.stringify(data))
            console.log("ELMVIDCLIPDEL", temp);

            var modified_elements = <any>[];

            for (let k = 0; k < this.dataSource.length; k++) {

              if (this.dataSource[k]["skateelementid"] == temp["data"]["skateelementid"]) {


                let data_example: any = {};


                data_example["position"] = modified_elements.length + 1;
                data_example["name"] = this.dataSource[k]["name"];
                data_example["skateelementid"] = this.dataSource[k]["skateelementid"];
                data_example["elmclip"] = "";
                data_example['action'] = '';

                modified_elements.push(data_example);

              }

              else {

                modified_elements.push(this.dataSource[k]);

              }

            }

            for (let c = 0; c < modified_elements.length; c++) {
              modified_elements[c]['position'] = c + 1;
            }

            this.dataSource = modified_elements;

            this.newData["datasource"] = this.dataSource;

            break;

          case "ERROR_ON_JOIN":

            this.snackBar.open("Please try again to join room", "close", {
              duration: 5000,
              verticalPosition: 'top',
              horizontalPosition: 'right',
              panelClass: ['red-snackbar']
            });

            //this._router.navigate([`/dashboard`]);

            break;

          case 'CLIP_CODE_CHANGE':

            var temp = JSON.parse(JSON.stringify(data))
            console.log("CLIP_CODE_CHANGE", temp);

            var elements_array = <any>[];
            var element_object = <any>{};

            for (let m = 0; m < this.dataSource.length; m++) {

              element_object['position'] = elements_array.length + 1;
              element_object['skateelementid'] = this.dataSource[m].skateelementid;
              element_object['name'] = this.dataSource[m].name;
              element_object['action'] = '';
              if (m <= temp.data.data.details.length - 1) {
                element_object['elmclip'] = temp.data.data.details[m]["elmclip"];
              }
              else {
                element_object['elmclip'] = "";
              }

              elements_array.push(element_object);
              element_object = {};
            }

            this.dataSource = elements_array;

            this.newData["datasource"] = this.dataSource;

            break;


          case "SCORESKATE":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("SCORESKATE", temp);

            this.ref_score_finalize = true;

            const test2 = Array.from(document.getElementsByClassName('grid-container') as HTMLCollectionOf<HTMLElement>)


            test2.forEach((element) => {
              element.style.opacity = '0.75';

              element.style.backgroundColor = '#bebebe';
              element.style.zIndex = '9999999';
              element.style.pointerEvents = 'none';
            });


            break;


          case 'RESCORE':

            var temp = JSON.parse(JSON.stringify(data))
            console.log("RESCORE", temp);

            this.ref_score_finalize = false;

            // enable screen if 
            let test3 = Array.from(document.getElementsByClassName('grid-container') as HTMLCollectionOf<HTMLElement>)

            test3.forEach((element) => {

              element.style.opacity = '';

              element.style.backgroundColor = '';
              element.style.zIndex = '';
              element.style.pointerEvents = '';


            });

            //this.finalize_done = false;

            break;

          default:
            //console.log("Default case");
            break;
        }



      });



  }




  ngOnInit(): void {


    var chat_room: any = {};
    chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;

    chat_room["method_name"] = 'NEWCLIENT';
    chat_room["data"] = { 'official_assignment_id': this.activatedRoute.snapshot.params.assignmentid };

    //this._chatService.createRoom(chat_room);
    this._chatService.broadcast(chat_room);


    // getting language
    this.language = this.languageSelector.getLanguage();



  }

  optionSelectionChange(input: any) {


    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@selection change", input, this.Template_datasource);

    var tem_data_index = this.Template_datasource.findIndex((record: any) => record.Skater_name == input["Skater_name"]);

    console.log("tem data", tem_data_index);

    if (tem_data_index != -1) {
      console.log("index", tem_data_index)

      let count = 0;
      for (let k = 0; k < this.data.segmentid.definitionid.sc_elementconfiguration.elements.length; k++) {
        console.log(this.data.segmentid.definitionid.sc_elementconfiguration.elements[k]['sc_skatingelementdefinitionid']['sc_elementcode'])

        if (input[this.data.segmentid.definitionid.sc_elementconfiguration.elements[k]['sc_skatingelementdefinitionid']['sc_elementcode']] != "") {
          count++;
        }
      }

      console.log("count is", count);

      if (count == this.data.segmentid.definitionid.sc_elementconfiguration.elements.length) {
        this.Template_datasource[tem_data_index]['Finalize'] = true;

        console.log("inside if condition", this.Template_datasource, this.Template_datasource[tem_data_index]['Finalize'])

      }
    }



  }

  ngOnChanges(changes: SimpleChanges) {

    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$coming in ngon changes", changes);

  }

  change_bonus_value(position: any, value: any) {

    //console.log("bonus clicked",position,value);

    if (this.skater_data.hasOwnProperty('skater_data')) {


      this.bonus_value = (<HTMLInputElement>document.getElementById("bonus_value_" + position)).value;
      if (+this.bonus_value + value >= 0) {

        var bonus_output = <any>{};
        var bonuses_id: any = [];
        var bonuses_object: any = {};

        bonus_output['competitor_entry_id'] = this.skater_data["competitorentryid"];
        //bonus_output['competitor_entry_id'] = "123";

        var bonus_match = this.bonuses_deduction.filter((record: any) => record.sc_adjustmentdefinition.sc_name == this.bonuses_deduction_tech_team_data[position].sc_name);

        if (bonus_match.length == 1) {
          bonuses_object['adjustmentassociationid'] = this.bonuses_deduction_tech_team[position].sc_skatingadjustmentassociationid;
          bonuses_object['number'] = +this.bonus_value + value;

          bonuses_id.push(bonuses_object);
          bonus_output['sc_skatingadjustmentassociationid'] = bonuses_id;

        }

        if (bonus_match.length > 1) {

          var bonus_order: any = [];
          var max_applicants: any = [];


          //finding order of same bonus
          for (let a = 0; a < bonus_match.length; a++) {
            bonus_order.push(bonus_match[a].sc_order)
          }
          bonus_order.sort();

          // findind max applicants of related bonus according order
          for (let b = 0; b < bonus_order.length; b++) {
            var tem_data = bonus_match.filter((record: any) => record.sc_order == bonus_order[b]);

            if (tem_data.length >= 1) {
              max_applicants.push(tem_data[0].sc_maximumapplications);

            }

          }

          // for assigning data to next process according order wise
          var new_bonus_data: any = [];

          for (let m = 0; m < max_applicants.length; m++) {
            var check: any = bonus_match.filter((record: any) => record.sc_order == bonus_order[m]);
            if (check.length >= 1) {
              new_bonus_data.push(check[0]);
            }
          }


          // logic for generating bonus output for sc_skatingadjustmentassociationid key

          var total = +this.bonus_value + value;


          for (let m = 0; m < max_applicants.length; m++) {

            bonuses_object['adjustmentassociationid'] = new_bonus_data[m].sc_skatingadjustmentassociationid;


            if (total - max_applicants[m] > 0) {
              if (max_applicants[m] == null || max_applicants[m] == "") {
                bonuses_object['number'] = total;

              }
              else {
                bonuses_object['number'] = max_applicants[m];
                total = total - max_applicants[m];

              }

            }
            else {
              bonuses_object['number'] = total;
              total = 0;
            }


            bonuses_id.push(bonuses_object);
            bonuses_object = {};


          }

          bonus_output['sc_skatingadjustmentassociationid'] = bonuses_id;


        }



        bonus_output['change'] = +this.bonus_value + value;


        //console.log("Bonus Value Chnage", bonus_output);


        for (let i = 0; i < bonus_output["sc_skatingadjustmentassociationid"].length; i++) {
          var adjustmentOutput: any = {};

          adjustmentOutput["competitorentryid"] = this.skater_data["competitorentryid"]
          adjustmentOutput["method_name"] = "DIOADJCHG";
          adjustmentOutput["room"] = this.activatedRoute.snapshot.params.segmentid;

          adjustmentOutput["position"] = position;

          var adjsutment_data: any = {};
          adjsutment_data["competitorentryid"] = this.skater_data["competitorentryid"]
          adjsutment_data['officialassignmentid'] = this.activatedRoute.snapshot.params.assignmentid;
          adjsutment_data["sc_skatingadjustmentassociationid"] = bonus_output["sc_skatingadjustmentassociationid"][i]["adjustmentassociationid"];
          adjsutment_data["value"] = bonus_output["sc_skatingadjustmentassociationid"][i]["number"];

          adjustmentOutput["data"] = adjsutment_data;

          this._chatService.broadcast(adjustmentOutput);
        }

      }


    }



  }

  score_button_click(inputs: any, family_type_index: any) {

    console.log("values coming", inputs, family_type_index);

    // input structure of data

    if (this.skater_data.hasOwnProperty('competitorentryid')) {
      if (!('elements' in this.structure_input_data)) {
        this.structure_input_data["type"] = "default";
        this.structure_input_data["rep_jump"] = false;
        this.structure_input_data["rating"] = "";


        // console.log("this structure data length",this.structure_data,this.structure_data.length);

        // if(this.structure_data.length >= this.halfway_index -1)
        // {
        //   this.structure_input_data["halfway"] = true;
        // }
        // else
        // {
        //   this.structure_input_data["halfway"] = false;
        // }


        this.structure_input_data["elements"] = [];
      }

      var structure_input_object: any = {};

      if (this.data.segmentid.patterndanceid.hasOwnProperty('sc_name')) {
        console.log("Yes pattern dance exist");
        structure_input_object['Pattern_dance_code'] = this.data.segmentid.patterndanceid.sc_elementcodeprefix;
      }
      else {
        console.log("No pattern dance don't exist");
        structure_input_object['Pattern_dance_code'] = "";
      }

      //structure_input_object['Pattern_dance_code'] = "";
      structure_input_object['Flying'] = false;
      structure_input_object['Change'] = false;
      structure_input_object['Element_code'] = inputs;
      structure_input_object['Synchro_element_suffix'] = [];
      structure_input_object['Throw'] = false;
      structure_input_object['Edge'] = "";
      structure_input_object['Rotation'] = "";
      structure_input_object['Synchro'] = "";
      structure_input_object['V'] = false;

      structure_input_object['invalid'] = false;

      if (this.structure_input_data["elements"].length >= 1) {

        if (this.structure_input_data["type"] == "SEQ" || this.structure_input_data["type"] == "COMBO") {
          structure_input_object['invalid'] = true;
        }

      }
      structure_input_object['notes'] = [];

      this.structure_input_data["elements"].push(structure_input_object);

      console.log("button click data", this.structure_input_data);


      this.structuring_data();


      // trying to find element definitions before add for star rating type array making

      if (this.structure_input_data["elements"].length > 0) {
        var tem = this.element_defination(this.structure_input_data["elements"][0]);

        console.log("code genrated", tem);

        var element_availability = this.elements.filter((record: any) => record.sc_skatingelementdefinitionid.sc_elementcode == tem);

        if (element_availability.length >= 1) {
          console.log("yes available", element_availability);

          this.star_rating_type_data[family_type_index][0] = element_availability[0]["sc_skatingelementdefinitionid"]["sc_starratingtype"];

        }


      }

      console.log("this star rarting type", this.star_rating_type_data);


    }


  }


  assessment_level(values: any, index: any) {
    console.log("level score is clicked", values, index);



    if (this.structure_input_data.hasOwnProperty('rating') == true) {
      console.log("comning in if loop");

      this.structure_input_data["rating"] = values;

      this.structuring_data();

    }

    console.log("this strucutre inbput data", this.structure_input_data, this.input);

  }

  // Finding element defination based on button pressed
  element_defination(data: any) {

    var string_element_code = "";

    if (data['Pattern_dance_code'] != "") {
      string_element_code = string_element_code + data['Pattern_dance_code'];
    }

    if (data['Flying'] == true) {
      string_element_code = string_element_code + "F";
    }

    if (data['Change'] == true) {
      string_element_code = string_element_code + "C";
    }

    if (data['Element_code'] != "") {
      string_element_code = string_element_code + data['Element_code'];
    }

    if (data['Synchro_element_suffix'].length >= 1) {
      var tem = "";
      for (let c = 0; c < data['Synchro_element_suffix'].length; c++) {
        tem = tem + data['Synchro_element_suffix'][c];
      }
      string_element_code = string_element_code + "+" + tem;
    }

    if (data['Throw'] == true) {
      string_element_code = string_element_code + "Th";
    }

    if (data['Edge'] != "") {
      string_element_code = string_element_code + data['Edge'];
    }

    if (data['Rotation'] != "") {
      string_element_code = string_element_code + data['Rotation'];
    }

    if (data['V'] == true) {
      string_element_code = string_element_code + "V";
    }

    return string_element_code;

  }


  structuring_data() {

    var whole_string_data = "";

    // string for judges and referee to show in preview without level and 
    //var modified_string = "";

    for (let x = 0; x < this.structure_input_data["elements"].length; x++) {
      var individual_string = "";

      //var extra_string = "";


      // if (this.structure_input_data["elements"][x]['Pattern_dance_code'] != "") {
      //   individual_string = individual_string + this.structure_input_data["elements"][x]['Pattern_dance_code'];
      //   //extra_string = extra_string + this.structure_input_data["elements"][x]['Pattern_dance_code'];

      // }

      if (this.structure_input_data["elements"][x]['Flying'] == true) {
        individual_string = individual_string + "F";
        //extra_string = extra_string + "F";
      }

      if (this.structure_input_data["elements"][x]['Change'] == true) {
        individual_string = individual_string + "C";
        //extra_string = extra_string + "C";
      }

      if (this.structure_input_data["elements"][x]['Element_code'] != "") {
        individual_string = individual_string + this.structure_input_data["elements"][x]['Element_code'];
        //extra_string = extra_string + this.structure_input_data["elements"][x]['Element_code'];
      }

      if (this.structure_input_data["elements"][x]['Synchro_element_suffix'].length >= 1) {
        var tem = "";
        for (let a = 0; a < this.structure_input_data["elements"][x]['Synchro_element_suffix'].length; a++) {
          tem = tem + this.structure_input_data["elements"][x]['Synchro_element_suffix'][a];
        }
        individual_string = individual_string + "+" + tem;
        //extra_string = extra_string + "+" + tem;
      }

      if (this.structure_input_data["elements"][x]['Throw'] == true) {
        individual_string = individual_string + "Th";
        //extra_string = extra_string + "Th";
      }

      if (this.structure_input_data["elements"][x]['Edge'] != "") {
        individual_string = individual_string + this.structure_input_data["elements"][x]['Edge'];
        //extra_string = extra_string + this.structure_input_data["elements"][x]['Edge'];
      }

      if (this.structure_input_data["elements"][x]['Rotation'] != "") {
        individual_string = individual_string + this.structure_input_data["elements"][x]['Rotation'];
        //extra_string = extra_string + this.structure_input_data["elements"][x]['Rotation'];
      }

      if (this.structure_input_data["elements"][x]['Synchro'] != "") {
        individual_string = individual_string + this.structure_input_data["elements"][x]['Synchro'];
        //extra_string = extra_string + this.structure_input_data["elements"][x]['Synchro'];
      }

      if (this.structure_input_data["elements"][x]['V'] == true) {
        individual_string = individual_string + "V";
      }

      if (this.structure_input_data["elements"][x]['invalid'] == true) {
        individual_string = individual_string + "*";
        //extra_string = extra_string + "*";
      }

      if (this.structure_input_data["elements"][x]['notes'].length >= 1) {

        for (let a = 0; a < this.structure_input_data["elements"][x]['notes'].length; a++) {

          // individual_string = individual_string + "[" + this.structure_input_data["elements"][x]['notes'][a] + "]";
          if (a == 0) {
            individual_string = individual_string + "+" + this.structure_input_data["elements"][x]['notes'][a];
            //extra_string = extra_string + "+" + this.structure_input_data["elements"][x]['notes'][a];
          }
          else {
            individual_string = individual_string + this.structure_input_data["elements"][x]['notes'][a];
            //extra_string = extra_string + this.structure_input_data["elements"][x]['notes'][a];
          }

          //extra_string = extra_string + "[" + this.structure_input_data["elements"][x]['notes'][a] + "]";

        }

      }

      if (whole_string_data == "") {
        whole_string_data = individual_string;
      }
      else {
        whole_string_data = whole_string_data + "+" + individual_string;
      }

      // if(modified_string == "")
      // {
      //   modified_string = extra_string;
      // }
      // else
      // {
      //   modified_string = modified_string + "+" + extra_string;
      // }

    }

    if (this.structure_input_data["rep_jump"] == true) {
      whole_string_data = whole_string_data + "+REP";
      //modified_string = modified_string + "+REP"
    }


    if (this.structure_input_data["rating"] != "") {

      var value = "";

      switch (this.structure_input_data["rating"]) {
        // EC ACTIVITIES
        case 947960000:

          console.log("caser bronz");

          value = "B";

          break;

        case 947960001:

          console.log("caser silver");
          value = "S";

          break;

        case 947960002:
          console.log("caser gold");
          value = "G";

          break;

        case 947960003:
          console.log("caser complete");
          value = "C";
          break;

        case 947960004:
          console.log("caser in complete");
          value = "I/C";
          break;

        case 947960005:
          console.log("caser successful");
          value = "SUC";

          break;

        case 947960006:
          console.log("caser unsuccessful");
          value = "U/S";

          break;


        default:
          console.log("no rating value")
          break;


      }

      whole_string_data = whole_string_data + " [" + value + "]";

      //whole_string_data = whole_string_data + " [" + this.structure_input_data["rating"]  + "]";
    }

    this.input_code_new = whole_string_data;

    // // slight modified structure input data 

    // var modified_structure_data = this.structure_input_data;

    // for(let m=0;m<modified_structure_data["elements"].length;m++)
    // {

    //   var element_codes = this.elements.filter((record: any) => record.sc_skatingelementdefinitionid.sc_elementcode == modified_structure_data["elements"][m]["Element_code"] );

    //   modified_structure_data["elements"][m]["famtype_sc_levelposition"] = element_codes[0]["sc_skatingelementdefinitionid"]["famtype_sc_levelposition"];
    //   modified_structure_data["elements"][m]["fam_sc_code"] = element_codes[0]["sc_skatingelementdefinitionid"]["fam_sc_code"];
    //   modified_structure_data["elements"][m]["sc_level"] = element_codes[0]["sc_skatingelementdefinitionid"]["sc_level"];


    //   console.log("aaaaaaaaaaaaaaaaaaaaaaaaa",element_codes);

    // } 

    this._chatService.dio_element_entered({
      "room": this.activatedRoute.snapshot.params.segmentid, "details": {
        "index": this.dataSource.length, "structure_input_data": this.structure_input_data, "input_code": this.input_code_new, "edit_row_index": this.selectedRowIndex, "delete_row_index": -1, "insert_before_index": -1
      }
    });


  }

  modifier_button_click(inputs: any) {



    if (this.skater_data.hasOwnProperty('competitorentryid')) {

      if ('elements' in this.structure_input_data) {
        if (this.structure_input_data["elements"].length >= 1) {
          if (inputs == "F") {
            this.structure_input_data["elements"][this.structure_input_data["elements"].length - 1]['Flying'] = true;
          }
          else if (inputs == "C") {
            this.structure_input_data["elements"][this.structure_input_data["elements"].length - 1]['Change'] = true;
          }
          else if (inputs == "Th") {
            this.structure_input_data["elements"][this.structure_input_data["elements"].length - 1]['Throw'] = true;
          }
          else if (inputs == "e" || inputs == "!") {
            this.structure_input_data["elements"][this.structure_input_data["elements"].length - 1]['Edge'] = inputs;
          }
          else if (inputs == "<" || inputs == "<<" || inputs == "q") {
            this.structure_input_data["elements"][this.structure_input_data["elements"].length - 1]['Rotation'] = inputs;
          }
          else if (inputs == "V") {
            this.structure_input_data["elements"][this.structure_input_data["elements"].length - 1]['V'] = true;
          }
          else if (inputs == "pi" || inputs == "fm" || inputs == "s") {
            if (this.structure_input_data["elements"][this.structure_input_data["elements"].length - 1]['Synchro_element_suffix'].length >= 1) {
              this.structure_input_data["elements"][this.structure_input_data["elements"].length - 1]['Synchro_element_suffix'][0] = inputs;
            }
            else {
              this.structure_input_data["elements"][this.structure_input_data["elements"].length - 1]['Synchro_element_suffix'].push(inputs);
            }

          }
          else if (inputs == "B" || inputs == "1" || inputs == "2" || inputs == "3" || inputs == "4") {

            if (this.structure_input_data["elements"][this.structure_input_data["elements"].length - 1]['Synchro_element_suffix'].length >= 2) {
              this.structure_input_data["elements"][this.structure_input_data["elements"].length - 1]['Synchro_element_suffix'][1] = inputs;
            }
            else {
              this.structure_input_data["elements"][this.structure_input_data["elements"].length - 1]['Synchro_element_suffix'].push(inputs);
            }

          }

          else if (inputs == "down_1" || inputs == "down_2") {
            if (inputs == "down_1") {
              this.structure_input_data["elements"][this.structure_input_data["elements"].length - 1]['Synchro'] = "<";
            }
            if (inputs == "down_2") {
              this.structure_input_data["elements"][this.structure_input_data["elements"].length - 1]['Synchro'] = "<<"
            }
          }
          else {

          }

        }

        //console.log("modifier clicked", this.structure_input_data);
        this.structuring_data();


      }


      console.log("asasas", this.structure_input_data);

    }



  }

  cancel_input() {

    //this.input_notes = [];


    var non_empty_elements = <any>[];

    for (let z = 0; z < this.dataSource.length; z++) {


      if (this.dataSource[z].name != '') {

        non_empty_elements.push(this.dataSource[z]);

      }

    }

    for (let y = 0; y < non_empty_elements.length; y++) {

      non_empty_elements[y].position = y + 1;

    }

    this.dataSource = non_empty_elements;

    this.structure_input_data = {};
    this.input_code_new = "";

    //console.log("current datasourse column values",this.dataSource,this.structure_data[this.selectedRowIndex-1]);

    this._chatService.cancel_button_entered({ "room": this.activatedRoute.snapshot.params.segmentid, "details": { "index": this.dataSource.length, "dataSource": this.dataSource, "row_index": this.selectedRowIndex, "old_structure_input_data": this.structure_data[this.selectedRowIndex - 1] } });


    this.selectedRowIndex = -1;

    // remove rating buttons from each family type

    for (let a = 0; a < this.star_rating_type_data.length; a++) {
      this.star_rating_type_data[a][0] = "";
    }

    console.log("this star_rating_type_data data", this.star_rating_type_data);

  }

  add_element(input: any) {

    // console.log("inputs",input)
    // console.log("input length",this.input_code_new.length)

    if (this.input_code_new.length > 0 && this.skater_data["competitorentryid"] != undefined) {

      var entered_element: any = [];

      for (let a = 0; a < this.structure_input_data["elements"].length; a++) {
        var string_element_code = "";

        // if (this.structure_input_data["elements"][a]['Pattern_dance_code'] != "") {
        //   string_element_code = string_element_code + this.structure_input_data["elements"][a]['Pattern_dance_code'];
        // }

        if (this.structure_input_data["elements"][a]['Flying'] == true) {
          string_element_code = string_element_code + "F";
        }

        if (this.structure_input_data["elements"][a]['Change'] == true) {
          string_element_code = string_element_code + "C";
        }

        if (this.structure_input_data["elements"][a]['Element_code'] != "") {
          string_element_code = string_element_code + this.structure_input_data["elements"][a]['Element_code'];
        }

        if (this.structure_input_data["elements"][a]['Synchro_element_suffix'].length >= 1) {
          var tem = "";
          for (let b = 0; b < this.structure_input_data["elements"][a]['Synchro_element_suffix'].length; b++) {
            tem = tem + this.structure_input_data["elements"][a]['Synchro_element_suffix'][b];
          }
          string_element_code = string_element_code + "+" + tem;
        }

        if (this.structure_input_data["elements"][a]['Throw'] == true) {
          string_element_code = string_element_code + "Th";
        }

        if (this.structure_input_data["elements"][a]['Edge'] != "") {
          string_element_code = string_element_code + this.structure_input_data["elements"][a]['Edge'];
        }

        if (this.structure_input_data["elements"][a]['Rotation'] != "") {
          string_element_code = string_element_code + this.structure_input_data["elements"][a]['Rotation'];
        }

        if (this.structure_input_data["elements"][a]['Synchro'] != "") {
          string_element_code = string_element_code + this.structure_input_data["elements"][a]['Synchro'];
        }

        if (this.structure_input_data["elements"][a]['V'] == true) {
          string_element_code = string_element_code + "V";
        }

        entered_element.push(string_element_code);

      }

      console.log("enterd element during add", entered_element);

      var valid = true;

      for (let z = 0; z < entered_element.length; z++) {

        var element_availability = this.elements.filter((record: any) => record.sc_skatingelementdefinitionid.sc_elementcode == entered_element[z]);

        if (element_availability.length >= 1) {
          //console.log("yes available")
        }
        else {
          valid = false;
        }

      }

      if (this.structure_input_data["type"] == "default") {

        var check = true;
        var seq = false;

        for (let m = 0; m < this.structure_input_data["elements"].length; m++) {
          if (this.structure_input_data["elements"][m]['Element_code'] == "A" || this.structure_input_data["elements"][m]['Element_code'] == "1A" || this.structure_input_data["elements"][m]['Element_code'] == "2A" || this.structure_input_data["elements"][m]['Element_code'] == "3A" || this.structure_input_data["elements"][m]['Element_code'] == "4A" || this.structure_input_data["elements"][m]['Element_code'] == "W" || this.structure_input_data["elements"][m]['Element_code'] == "1W") {

            if (m >= 1 && check == true) {
              check = false;

              var first_element = this.elements.filter((record: any) => record.sc_skatingelementdefinitionid.sc_elementcode == entered_element[m - 1]);

              if (first_element.length >= 1) {
                if (first_element[0].sc_skatingelementdefinitionid.famtype_sc_skatingelementfamilytypeid == "7BFAB449-4C8B-EB11-A812-000D3A8DCA86") {

                  this.structure_input_data["type"] = "SEQ";
                  seq = true;

                }
              }

            }


          }


        }

        if (seq == false) {
          var family_type_info = [];

          for (let k = 0; k < this.structure_input_data["elements"].length; k++) {
            var single_element = this.elements.filter((record: any) => record.sc_skatingelementdefinitionid.sc_elementcode == entered_element[k]);

            if (single_element.length >= 1) {
              family_type_info.push(single_element[0].sc_skatingelementdefinitionid.famtype_sc_skatingelementfamilytypeid);

            }

          }

          var combo_check = true;

          if (family_type_info.length >= 2) {
            for (let j = 0; j < family_type_info.length; j++) {
              if (family_type_info[j] != "7BFAB449-4C8B-EB11-A812-000D3A8DCA86") {
                combo_check = false;
                break;
              }

            }
          }
          else {
            combo_check = false;
          }

          if (combo_check == true) {
            this.structure_input_data["type"] = "COMBO";
          }

        }

      }


      //console.log("data before adding",this.structure_input_data);


      if (input == -1) {

        //console.log("adding data",entered_element)


        if (valid == true) {

          // code for making console data

          var add_element_output = <any>{};
          var element_def_id = <any>[];
          var element_def_object = <any>{};
          var note_def_array = <any>[];

          add_element_output['competitor_entry_id'] = this.skater_data["competitorentryid"];;
          //add_element_output['competitor_entry_id'] = "123";
          add_element_output['type'] = this.structure_input_data.type;

          for (let x = 0; x < entered_element.length; x++) {
            var element_availability = this.elements.filter((record: any) => record.sc_skatingelementdefinitionid.sc_elementcode == entered_element[x]);

            if (element_availability.length >= 1) {
              element_def_object['defination_id'] = element_availability[0].sc_skatingelementdefinitionid.sc_skatingelementdefinitionid;

              for (let i = 0; i < this.structure_input_data["elements"][x]['notes'].length; i++) {
                var notes_definations = this.notes.filter((record: any) => record.sc_skatingelementnoteid.sc_value == this.structure_input_data["elements"][x]['notes'][i])
                if (notes_definations.length >= 1) {
                  note_def_array.push(notes_definations[0]["sc_skatingelementnoteid"]["sc_skatingelementnoteid"]);
                }
              }

              element_def_object['notes_discipline_id'] = note_def_array;
              element_def_object['invalid'] = this.structure_input_data["elements"][x]['invalid'];


            }

            element_def_id.push(element_def_object);
            note_def_array = [];
            element_def_object = {};
          }

          add_element_output['element_def_id'] = element_def_id;


          // logic for emiting socket function old 
          // var added_elemet_socket_data: any = {};
          // added_elemet_socket_data["room"] = this.activatedRoute.snapshot.params.segmentid;

          // added_elemet_socket_data["official"] = this.data.segmentid.official[0].sc_officialid.sc_fullname;
          // added_elemet_socket_data["index"] = this.dataSource.length;
          // added_elemet_socket_data["details"] = add_element_output;
          // this._chatService.AddedElement(added_elemet_socket_data);

          // console.log("added element",added_elemet_socket_data);


          // object for sending reqest to server

          console.log("before making socket function =============== ", this.structure_input_data);


          var add_element: any = {};
          add_element["competitorentryid"] = this.skater_data["competitorentryid"];
          add_element["method_name"] = "NEWELM";
          add_element["room"] = this.activatedRoute.snapshot.params.segmentid;
          add_element["input_data"] = this.structure_input_data;
          add_element["data"] = [];

          for (let k = 0; k < add_element_output["element_def_id"].length; k++) {


            var add_data: any = {};
            add_data["competitorentryid"] = this.skater_data["competitorentryid"];
            add_data["sc_skatingelementdefinitionid"] = add_element_output["element_def_id"][k]["defination_id"];
            add_data["programorder"] = this.dataSource.length + 1;
            add_data["elementcount"] = add_element_output["element_def_id"].length;
            add_data["multitype"] = add_element_output["type"];
            add_data["steporder"] = k + 1;
            add_data["rep_jump"] = this.structure_input_data["rep_jump"];

            add_data["ratingtype"] = this.structure_input_data["rating"];


            // if (this.secondHalf == true) {
            //   add_data["halfwayflag"] = 1;
            // }
            // else {
            //   add_data["halfwayflag"] = 0;
            // }

            console.log("condition check", this.halfway_index >= this.dataSource.length + 1)
            console.log("values", this.halfway_index, this.dataSource.length + 1);


            if (this.dataSource.length + 1 >= this.halfway_index) {
              add_data["halfwayflag"] = 1;
            }
            else {
              add_data["halfwayflag"] = 0;
            }


            add_data["notes"] = add_element_output["element_def_id"][k]["notes_discipline_id"];
            if (add_element_output["element_def_id"][k]["invalid"] == true) {
              add_data["invalid"] = 1;
            }
            else {
              add_data["invalid"] = 0;
            }


            add_element["data"].push(add_data);

          }

          console.log("time on add server request", new Date().toISOString())
          this._chatService.broadcast(add_element);




        }
        else {
          this.snackBar.open("Element combination is not valid", "", {
            duration: 1500,
            horizontalPosition: 'center'
          });
        }

      }
      else {

        //console.log("editing data",entered_element)

        if (valid == true) {

          //var modified_elements = <any>[];
          var edit_element_output = <any>{};

          var element_def_id = <any>[];
          var element_def_object = <any>{};
          var note_def_array = <any>[];

          for (let b = 0; b < this.dataSource.length; b++) {
            if (b != (input - 1)) {
              //modified_elements.push(this.dataSource[b]);
            }
            else {
              var existing_element = this.dataSource[b]['name'];

              //var edit_element_code = this.input_code_new;
              //var edit_element_object = <any>{};

              if (existing_element.length >= 1 && existing_element != "") {

                edit_element_output['skateelementid'] = this.dataSource[b]["skateelementid"];
                edit_element_output['type'] = this.structure_input_data.type;


                for (let x = 0; x < entered_element.length; x++) {
                  var element_availability = this.elements.filter((record: any) => record.sc_skatingelementdefinitionid.sc_elementcode == entered_element[x]);
                  if (element_availability.length >= 1) {

                    for (let i = 0; i < this.structure_input_data["elements"][x]['notes'].length; i++) {
                      var notes_definations = this.notes.filter((record: any) => record.sc_skatingelementnoteid.sc_value == this.structure_input_data["elements"][x]['notes'][i]);
                      if (notes_definations.length >= 1) {
                        note_def_array.push(notes_definations[0]["sc_skatingelementnoteid"]["sc_skatingelementnoteid"]);
                      }
                    }

                    element_def_object['defination_id'] = element_availability[0].sc_skatingelementdefinitionid.sc_skatingelementdefinitionid;

                  }
                  element_def_object['notes_discipline_id'] = note_def_array;
                  element_def_object['invalid'] = this.structure_input_data["elements"][x]['invalid'];


                  element_def_id.push(element_def_object);
                  note_def_array = [];
                  element_def_object = {};
                }

                edit_element_output['replacement_element_def_id'] = element_def_id;

                // edit_element_object['position'] = b + 1;
                // edit_element_object['name'] = this.input_code_new;
                // edit_element_object['action'] = '';
                // edit_element_object['skateelementid'] = '';

                // modified_elements.push(edit_element_object);
                // edit_element_object = {};

                // logic for emiting socket function for edit -- old one

                // var edited_elemet_socket_data: any = {};
                // edited_elemet_socket_data["room"] = this.activatedRoute.snapshot.params.segmentid;
                // edited_elemet_socket_data["official"] = this.data.segmentid.official[0].sc_officialid.sc_fullname;
                // edited_elemet_socket_data["details"] = edit_element_output;
                // edited_elemet_socket_data["index"] = this.selectedRowIndex;
                // this._chatService.EditedElement(edited_elemet_socket_data);

                // console.log("Edited element",edit_element_output);

                //logic for broadcast function

                var edit_element: any = {};
                edit_element["competitorentryid"] = this.skater_data["competitorentryid"];
                edit_element["method_name"] = "CHGELM";
                edit_element["room"] = this.activatedRoute.snapshot.params.segmentid;
                edit_element["input_data"] = this.structure_input_data;
                edit_element["data"] = [];

                for (let k = 0; k < edit_element_output["replacement_element_def_id"].length; k++) {

                  var edit_data: any = {};
                  edit_data["competitorentryid"] = this.skater_data["competitorentryid"];
                  edit_data["sc_skatingelementdefinitionid"] = edit_element_output["replacement_element_def_id"][k]["defination_id"];
                  edit_data["programorder"] = this.selectedRowIndex;
                  edit_data["elementcount"] = edit_element_output["replacement_element_def_id"].length;
                  edit_data["multitype"] = edit_element_output["type"];
                  edit_data["steporder"] = k + 1;
                  edit_data["rep_jump"] = this.structure_input_data["rep_jump"];

                  edit_data["ratingtype"] = this.structure_input_data["rating"];

                  if (this.selectedRowIndex >= this.halfway_index) {
                    edit_data["halfwayflag"] = 1;
                  }
                  else {
                    edit_data["halfwayflag"] = 0;
                  }


                  edit_data["notes"] = edit_element_output["replacement_element_def_id"][k]["notes_discipline_id"];

                  if (edit_element_output["replacement_element_def_id"][k]["invalid"] == true) {
                    edit_data["invalid"] = 1;
                  }
                  else {
                    edit_data["invalid"] = 0;
                  }


                  // edit_data["invalid"] = edit_element_output["replacement_element_def_id"][k]["invalid"];



                  edit_element["data"].push(edit_data);

                }

                this._chatService.broadcast(edit_element);


                // this.structure_data.splice(input - 1, 1, this.structure_input_data["elements"]);
                // this.structure_input_data = {};


              }
              else {

                // edit_element_object['position'] = b + 1;
                // edit_element_object['name'] = this.input_code_new;
                // edit_element_object['action'] = '';
                // edit_element_object['skateelementid'] = '';

                // modified_elements.push(edit_element_object);


                // edit_element_object = {};

                edit_element_output['competitor_entry_id'] = this.skater_data["competitorentryid"];

                //edit_element_output['competitor_entry_id'] = "123";
                edit_element_output['type'] = this.structure_input_data.type;

                edit_element_output['position'] = b + 1;

                for (let x = 0; x < entered_element.length; x++) {
                  var element_availability = this.elements.filter((record: any) => record.sc_skatingelementdefinitionid.sc_elementcode == entered_element[x]);
                  if (element_availability.length >= 1) {

                    for (let i = 0; i < this.structure_input_data["elements"][x]['notes'].length; i++) {
                      var notes_definations = this.notes.filter((record: any) => record.sc_skatingelementnoteid.sc_value == this.structure_input_data["elements"][x]['notes'][i]);
                      if (notes_definations.length >= 1) {
                        note_def_array.push(notes_definations[0]["sc_skatingelementnoteid"]["sc_skatingelementnoteid"]);
                      }
                    }

                    element_def_object['defination_id'] = element_availability[0].sc_skatingelementdefinitionid.sc_skatingelementdefinitionid;

                  }
                  element_def_object['notes_discipline_id'] = note_def_array;
                  element_def_object['invalid'] = this.structure_input_data["elements"][x]['invalid'];

                  element_def_id.push(element_def_object);
                  note_def_array = [];
                  element_def_object = {};

                }

                edit_element_output['element_def_id'] = element_def_id;
                edit_element_output['position'] = b + 1;

                //console.log("New added element", edit_element_output);

                // logic for emiting socket function
                var edit_element: any = {};
                edit_element["competitorentryid"] = this.skater_data["competitorentryid"];
                edit_element["method_name"] = "NEWELM";
                edit_element["room"] = this.activatedRoute.snapshot.params.segmentid;
                edit_element["input_data"] = this.structure_input_data;
                edit_element["data"] = [];

                for (let k = 0; k < edit_element_output["element_def_id"].length; k++) {

                  var edit_data: any = {};
                  edit_data["competitorentryid"] = this.skater_data["competitorentryid"];
                  edit_data["sc_skatingelementdefinitionid"] = edit_element_output["element_def_id"][k]["defination_id"];
                  edit_data["programorder"] = b + 1;
                  edit_data["elementcount"] = edit_element_output["element_def_id"].length;
                  edit_data["multitype"] = edit_element_output["type"];
                  edit_data["steporder"] = k + 1;
                  edit_data["rep_jump"] = this.structure_input_data["rep_jump"];

                  edit_data["ratingtype"] = this.structure_input_data["rating"];


                  if (b + 1 >= this.halfway_index) {
                    edit_data["halfwayflag"] = 1;
                  }
                  else {
                    edit_data["halfwayflag"] = 0;
                  }

                  // if (this.secondHalf == true) {
                  //   edit_data["halfwayflag"] = 1;
                  // }
                  // else {
                  //   edit_data["halfwayflag"] = 0;
                  // }


                  edit_data["notes"] = edit_element_output["element_def_id"][k]["notes_discipline_id"];

                  if (edit_element_output["element_def_id"][k]["invalid"] == true) {
                    edit_data["invalid"] = 1;
                  }
                  else {
                    edit_data["invalid"] = 0;
                  }

                  // edit_data["invalid"] = edit_element_output["element_def_id"][k]["invalid"];

                  edit_element["data"].push(edit_data);


                }

                this._chatService.broadcast(edit_element);

                // this.structure_data.splice(input - 1, 0, this.structure_input_data["elements"]);

                // this.structure_input_data = {};

                // //this.dataSource = modified_elements;

                // this.input_code_new = "";
                // this.selectedRowIndex = -1;

              }

            }

          }



          console.log("this datasourse after edit ot insert before", this.dataSource)



        }
        else {
          this.snackBar.open("Element combination is not valid", "", {
            duration: 1500,
            horizontalPosition: 'center'
          });
        }

      }

    }

  }

  insert_before(input: any) {

    this._chatService.dio_element_entered({ "room": this.activatedRoute.snapshot.params.segmentid, "details": { "index": this.dataSource.length, "structure_input_data": this.structure_input_data, "input_code": this.input_code_new, "edit_row_index": this.selectedRowIndex, "delete_row_index": -1, "insert_before_index": input.position } });

    var element_list = <any>[];
    var each_element = <any>{};

    for (let b = 0; b < this.dataSource.length; b++) {

      if (b < input.position - 1) {
        element_list.push(this.dataSource[b]);

      }
      if (b == input.position - 1) {

        each_element['position'] = b + 1;
        each_element['name'] = '';
        each_element['action'] = '';
        each_element['skateelementid'] = '';
        each_element['elmclip'] = '';


        element_list.push(each_element);

        each_element = {};

        each_element['position'] = b + 2;
        each_element['name'] = this.dataSource[b].name;
        each_element['action'] = '';
        each_element['skateelementid'] = this.dataSource[b].skateelementid;
        each_element['elmclip'] = this.dataSource[b].elmclip;

        element_list.push(each_element);
        each_element = {};

      }
      if (b > input.position - 1) {
        each_element['position'] = b + 2;
        each_element['name'] = this.dataSource[b].name;
        each_element['action'] = '';
        each_element['skateelementid'] = this.dataSource[b].skateelementid;
        each_element['elmclip'] = this.dataSource[b].elmclip;

        element_list.push(each_element);

        each_element = {};

      }


    }

    this.dataSource = element_list;

    this.selectedRowIndex = input.position;

  }

  edit_element(input: any) {

    this.selectedRowIndex = input.position;

  }

  delete_element(positions: any) {


    this._chatService.dio_element_entered({
      "room": this.activatedRoute.snapshot.params.segmentid, "details": {
        "index": this.dataSource.length, "structure_input_data": this.structure_input_data, "input_code": this.input_code_new, "edit_row_index": this.selectedRowIndex, "delete_row_index": positions, "insert_before_index": -1
      }
    });


    var delete_element: any = {};
    delete_element["competitorentryid"] = this.skater_data["competitorentryid"];
    delete_element["method_name"] = "DELELM";
    delete_element["room"] = this.activatedRoute.snapshot.params.segmentid;

    var delete_data: any = {};
    delete_data["competitorentryid"] = this.skater_data["competitorentryid"];
    delete_data["skateelementid"] = this.dataSource[positions]["skateelementid"];
    delete_data["programorder"] = positions + 1;


    delete_element["data"] = delete_data;

    this._chatService.broadcast(delete_element);

    //var modified_elements = <any>[];

    // for (let b = 0; b < this.dataSource.length; b++) {
    //   if (b != positions) {
    //    // modified_elements.push(this.dataSource[b]);
    //   }
    //   else {

    //     // var delete_element_output = <any>{};
    //     // delete_element_output['skateelementid'] = this.dataSource[b]["skateelementid"];
    //     // //delete_element_output['positions'] = +positions+1;
    //     // delete_element_output['competitor_entry_id'] = this.skater_data["competitorentryid"];


    //     //delete_element_output['element_def_id'] = deleted_element[x].sc_skatingelementdefinitionid.sc_skatingelementdefinitionid;

    //     // logic for emiting socket function for delete -- old

    //     // var delete_elemet_socket_data: any = {};
    //     // delete_elemet_socket_data["room"] = this.activatedRoute.snapshot.params.segmentid;
    //     // delete_elemet_socket_data["official"] = this.data.segmentid.official[0].sc_officialid.sc_fullname;
    //     // delete_elemet_socket_data["details"] = delete_element_output;
    //     // this._chatService.DeletedElement(delete_elemet_socket_data);


    //     // logic for socket broadcast function



    //     //console.log("Deleted element",delete_element_output);
    //     //this.structure_data.splice(positions, 1);


    //   }
    // }

    // for (let c = 0; c < modified_elements.length; c++) {
    //   modified_elements[c]['position'] = c + 1;
    // }

    // this.dataSource = modified_elements;

  }

  validate_element() {
    // var validate_element_output = <any>{};

    // validate_element_output['competitor_entry_id'] = this.skater_data["sc_competitorid"];;
    // validate_element_output['status'] = "validate";

    // console.log("Status Update", validate_element_output);

    // logic for socket broadcast function

    if (this.skater_data.hasOwnProperty('competitorentryid')) {
      var validate_element_output: any = {};
      validate_element_output["competitorentryid"] = this.skater_data["competitorentryid"];
      validate_element_output["method_name"] = "DIOSTATUS";
      validate_element_output["room"] = this.activatedRoute.snapshot.params.segmentid;

      var validate_data: any = {};
      validate_data["statusmessage"] = "validate";
      validate_data["official_assignment_id"] = this.activatedRoute.snapshot.params.assignmentid;


      validate_element_output["data"] = validate_data;

      this._chatService.broadcast(validate_element_output);

    }




  }

  finalize() {

    // var finalize_output = <any>{};

    // finalize_output['competitor_entry_id'] = this.skater_data["sc_competitorid"];
    // finalize_output['status'] = "finalize"

    // console.log("Status Update", finalize_output);

    // logic for socket broadcast function
    if (this.skater_data.hasOwnProperty('competitorentryid')) {
      var finalize_output: any = {};
      finalize_output["competitorentryid"] = this.skater_data["competitorentryid"];
      finalize_output["method_name"] = "DIOSTATUS";
      finalize_output["room"] = this.activatedRoute.snapshot.params.segmentid;

      var finalize_data: any = {};
      finalize_data["statusmessage"] = "finalize";
      finalize_data["official_assignment_id"] = this.activatedRoute.snapshot.params.assignmentid;


      finalize_output["data"] = finalize_data;

      this._chatService.broadcast(finalize_output);


    }





  }

  wbp_element() {



    if (this.skater_data.hasOwnProperty('competitorentryid')) {

      console.log("output before", JSON.parse(JSON.stringify(this.structure_data)));
      var old_structure_data: any = JSON.parse(JSON.stringify(this.structure_data));
      var old_structure_data_for_index: any = JSON.parse(JSON.stringify(this.structure_data));

      // code for logic running rules

      let rule_instance = new Wbp_rules();
      var output: any = rule_instance.validation_rules(this.data, this.structure_data, this.dataSource);

      output["event_name"] = this.data["segmentid"]["categoryid"]["eventid"]["enname"];
      output["category_name"] = this.data["segmentid"]["categoryid"]["definitionid"]["sc_name"];
      output["segment_name"] = this.data["segmentid"]["enname"];
      output["competitor_name"] = this.skater_data["skater_data"]["sc_name"];
      output["sc_skatingdisciplinedefinition"] = this.data["segmentid"]["categoryid"]["definitionid"]["sc_skatingdisciplinedefinition"]["sc_name"];


      console.log("this skater data before ", this.skater_data);

      console.log("output", output);

      console.log("this halway index", this.halfway_index);


      // code for sending server request new if invalidation happned

      for (let x = 0; x < output["input_data"].length; x++) {
        var invalidation_happned: any = false;

        if (old_structure_data[x]["rep_jump"] != output["input_data"][x]["rep_jump"]) {
          invalidation_happned = true;

        }
        else {
          //console.log(" else case");


          for (let y = 0; y < output["input_data"][x]["elements"].length; y++) {

            if (old_structure_data[x]["elements"][y]["invalid"] != output["input_data"][x]["elements"][y]["invalid"]) {
              //console.log("invalidation happened",x+1,y+1);
              invalidation_happned = true;

            }

            if (old_structure_data[x]["elements"][y]["notes"].length != output["input_data"][x]["elements"][y]["notes"].length) {
              //console.log("invalidation happened",x+1,y+1);
              console.log("notes changed", old_structure_data[x]["elements"][y]["notes"], output["input_data"][x]["elements"][y]["notes"])

              invalidation_happned = true;

            }


          }


        }

        //console.log("invlaidation happnes here - index",x+1,invalidation_happned)

        if (invalidation_happned == true) {
          //console.log("server git request for this index",x+1);
          var invalid_element: any = {};
          invalid_element["competitorentryid"] = this.skater_data["competitorentryid"];
          invalid_element["method_name"] = "CHGELM";
          invalid_element["room"] = this.activatedRoute.snapshot.params.segmentid;

          invalid_element["data"] = [];

          for (let y = 0; y < output["input_data"][x]["elements"].length; y++) {

            var invalid_data: any = {};
            invalid_data["competitorentryid"] = this.skater_data["competitorentryid"];
            invalid_data["sc_skatingelementdefinitionid"] = output["elements_def"][x]["elements"][y];
            invalid_data["programorder"] = x + 1;
            invalid_data["elementcount"] = output["input_data"][x]["elements"].length;

            invalid_data["rep_jump"] = output["input_data"][x]["rep_jump"];
            old_structure_data[x]["rep_jump"] = output["input_data"][x]["rep_jump"];


            //invalid_data["multitype"] = "default";
            invalid_data["steporder"] = y + 1;

            if (x + 1 > this.halfway_index) {
              invalid_data["halfwayflag"] = 1;
            }
            else {
              invalid_data["halfwayflag"] = 0;
            }

            //invalid_data["halfwayflag"] = 0;

            // making not def array

            var note_def_array: any = [];
            var note_name_array: any = [];

            for (let z = 0; z < output["input_data"][x]["elements"][y]["notes"].length; z++) {
              var notes_definations = this.notes.filter((record: any) => record.sc_skatingelementnoteid.sc_value == output["input_data"][x]["elements"][y]["notes"][z]);
              if (notes_definations.length >= 1) {
                note_def_array.push(notes_definations[0]["sc_skatingelementnoteid"]["sc_skatingelementnoteid"]);
                note_name_array.push(notes_definations[0]["sc_skatingelementnoteid"]["sc_value"])
              }
            }

            invalid_data["notes"] = note_def_array;

            old_structure_data[x]["elements"][y]["notes"] = note_name_array;

            invalid_data["invalid"] = output["input_data"][x]["elements"][y]["invalid"];
            old_structure_data[x]["elements"][y]["invalid"] = output["input_data"][x]["elements"][y]["invalid"];

            invalid_element["data"].push(invalid_data);

          }


          invalid_element["input_data"] = old_structure_data[x];

          this._chatService.broadcast(invalid_element);

        }

      }

      // code for changing bonus value

      if (output["bonuses_increment"].length >= 1) {


        var new_bonuses: any = [];

        for (let x = 0; x < output["bonuses_increment"].length; x++) {
          if (new_bonuses.length == 0) {
            new_bonuses.push({ sc_adjustmentassociationa: output["bonuses_increment"][x]["sc_adjustmentassociationa"], bonus_total: output["bonuses_increment"][x]["bonus_total"] });
          }
          else {
            let index = new_bonuses.findIndex((record: any) => record.sc_adjustmentassociationa == output["bonuses_increment"][x]["sc_adjustmentassociationa"]);

            if (index != -1) {
              new_bonuses[index]["bonus_total"] = new_bonuses[index]["bonus_total"] + output["bonuses_increment"][x]["bonus_total"];
            }
            else {
              new_bonuses.push({ sc_adjustmentassociationa: output["bonuses_increment"][x]["sc_adjustmentassociationa"], bonus_total: output["bonuses_increment"][x]["bonus_total"] });
            }
          }
        }

        console.log("sasasasasasasasasasasasa", new_bonuses);

        console.log("1", this.bonuses_deduction_tech_team);
        console.log("2", this.bonuses_deduction_tech_team_data);

        for (let y = 0; y < new_bonuses.length; y++) {


          var bonus_availability = this.bonuses_deduction_tech_team.filter((record: any) => record.sc_skatingadjustmentassociationid == new_bonuses[y]["sc_adjustmentassociationa"]);

          if (bonus_availability.length >= 1) {

            //console.log("bonus avialable",bonus_availability)

            for (let j = 0; j < this.bonuses_deduction_tech_team_data.length; j++) {
              if (bonus_availability[0]["sc_adjustmentdefinition"]["sc_name"] == this.bonuses_deduction_tech_team_data[j]["sc_name"]) {
                //console.log("bonus position",j,Number(output["bonuses_increment"][y]["bonus_total"]));

                this.change_bonus_value(j, Number(new_bonuses[y]["bonus_total"]));

                // var current_value = (<HTMLInputElement>document.getElementById("bonus_value_" + j)).value;


                // (<HTMLInputElement>document.getElementById("bonus_value_" + j)).value = String(Number(output["bonuses_increment"][y]["bonus_total"])+Number(current_value));

              }
            }
          }

        }
      }


      var changed_index: any = [];

      for (let a = 0; a < output["input_data"].length; a++) {

        if (this.object_code_generator(output["input_data"][a])["whole_string"].localeCompare(this.object_code_generator(old_structure_data_for_index[a])["whole_string"]) != 0) {

          changed_index.push(a + 1);

        }


      }

      // server request
      var wbp_element_output: any = {};
      wbp_element_output["competitorentryid"] = this.skater_data["competitorentryid"];
      wbp_element_output["method_name"] = "DIOSTATUS";
      wbp_element_output["room"] = this.activatedRoute.snapshot.params.segmentid;

      var wbp_data: any = {};
      wbp_data["statusmessage"] = "WBP";
      wbp_data["official_assignment_id"] = this.activatedRoute.snapshot.params.assignmentid;
      wbp_data["changed_data"] = output;
      wbp_data["old_data"] = old_structure_data;
      wbp_data["changed_index"] = changed_index;

      wbp_element_output["data"] = wbp_data;

      this._chatService.broadcast(wbp_element_output);



    }


  }

  invalid_element(positions: any) {


    //var modified_elements = <any>[];

    var element_def_id = <any>[];
    var element_def_object = <any>{};
    var note_def_array = <any>[];


    //logic for console data

    var invalid_element: any = [];


    for (let a = 0; a < this.structure_data[positions]["elements"].length; a++) {
      var string_element_code = "";

      // if (this.structure_data[positions]["elements"][a]['Pattern_dance_code'] != "") {
      //   string_element_code = string_element_code + this.structure_data[positions]["elements"][a]['Pattern_dance_code'];
      // }

      if (this.structure_data[positions]["elements"][a]['Flying'] == true) {
        string_element_code = string_element_code + "F";
      }

      if (this.structure_data[positions]["elements"][a]['Change'] == true) {
        string_element_code = string_element_code + "C";
      }

      if (this.structure_data[positions]["elements"][a]['Element_code'] != "") {
        string_element_code = string_element_code + this.structure_data[positions]["elements"][a]['Element_code'];
      }

      if (this.structure_data[positions]["elements"][a]['Synchro_element_suffix'].length >= 1) {
        var tem = "";
        for (let b = 0; b < this.structure_data[positions]["elements"][a]['Synchro_element_suffix'].length; b++) {
          tem = tem + this.structure_data[positions]["elements"][a]['Synchro_element_suffix'][b];
        }
        string_element_code = string_element_code + "+" + tem;
      }

      if (this.structure_data[positions]["elements"][a]['Throw'] == true) {
        string_element_code = string_element_code + "Th";
      }

      if (this.structure_data[positions]["elements"][a]['Edge'] != "") {
        string_element_code = string_element_code + this.structure_data[positions]["elements"][a]['Edge'];
      }

      if (this.structure_data[positions]["elements"][a]['Rotation'] != "") {
        string_element_code = string_element_code + this.structure_data[positions]["elements"][a]['Rotation'];
      }

      if (this.structure_data[positions]["elements"][a]['Synchro'] != "") {
        string_element_code = string_element_code + this.structure_data[positions]["elements"][a]['Synchro'];
      }


      if (this.structure_data[positions]["elements"][a]['V'] == true) {
        string_element_code = string_element_code + "V";
      }

      invalid_element.push(string_element_code);

    }

    for (let x = 0; x < invalid_element.length; x++) {
      var element_availability = this.elements.filter((record: any) => record.sc_skatingelementdefinitionid.sc_elementcode == invalid_element[x]);
      if (element_availability.length >= 1) {

        for (let i = 0; i < this.structure_data[positions]["elements"][x]['notes'].length; i++) {
          var notes_definations = this.notes.filter((record: any) => record.sc_skatingelementnoteid.sc_value == this.structure_data[positions]["elements"][x]['notes'][i]);
          if (notes_definations.length >= 1) {
            note_def_array.push(notes_definations[0]["sc_skatingelementnoteid"]["sc_skatingelementnoteid"]);
          }
        }

        element_def_object['defination_id'] = element_availability[0].sc_skatingelementdefinitionid.sc_skatingelementdefinitionid;

      }
      element_def_object['notes_discipline_id'] = note_def_array;
      element_def_object['invalid'] = this.structure_data[positions]["elements"][x]['invalid'];


      element_def_id.push(element_def_object);
      note_def_array = [];
      element_def_object = {};

    }


    //console.log("middle part - ",element_def_id);

    console.log("this structure data", this.structure_data);

    // logic for emit socket function

    var invalid_element: any = {};
    invalid_element["competitorentryid"] = this.skater_data["competitorentryid"];
    invalid_element["method_name"] = "CHGELM";
    invalid_element["room"] = this.activatedRoute.snapshot.params.segmentid;


    invalid_element["data"] = [];

    for (let k = 0; k < element_def_id.length; k++) {

      var invalid_data: any = {};
      invalid_data["competitorentryid"] = this.skater_data["competitorentryid"];
      invalid_data["sc_skatingelementdefinitionid"] = element_def_id[k]["defination_id"];
      invalid_data["programorder"] = positions + 1;
      invalid_data["elementcount"] = element_def_id.length;
      invalid_data["rep_jump"] = this.structure_data[positions]["rep_jump"];

      invalid_data["ratingtype"] = this.structure_data[positions]["rating"];


      //invalid_data["multitype"] = "default";
      invalid_data["steporder"] = k + 1;

      if (positions + 1 > this.halfway_index) {
        invalid_data["halfwayflag"] = 1;
      }
      else {
        invalid_data["halfwayflag"] = 0;
      }

      //invalid_data["halfwayflag"] = 0;
      invalid_data["notes"] = element_def_id[k]["notes_discipline_id"];
      invalid_data["invalid"] = 1;

      invalid_element["data"].push(invalid_data);
      this.structure_data[positions]["elements"][k]["invalid"] = 1;

    }

    invalid_element["input_data"] = this.structure_data[positions];

    this._chatService.broadcast(invalid_element);




  }

  invalid_button() {

    if (this.skater_data.hasOwnProperty('competitorentryid')) {

      if ('elements' in this.structure_input_data) {

        this.structure_input_data["elements"][this.structure_input_data["elements"].length - 1]['invalid'] = true;
        this.structuring_data();
      }
    }

  }

  newData = {

    'room': this.activatedRoute.snapshot.params.segmentid,
    'datasource': this.dataSource,
    'role_id': '3B732AFD-FDA6-EC11-983F-00224825E0C8',
    'user_access': false
  }

  video_button() {

    if (this.skater_data.hasOwnProperty('competitorentryid')) {
      this.newData['user_access'] = true;
      const dialogRef = this.dialog.open(dio_video, {
        data: this.newData,

        maxWidth: '100vw',
        maxHeight: '95vh',
        height: '90%',
        width: '95%'

      });

      dialogRef.beforeClosed().subscribe(() => {

        this.newData["user_access"] = false;

      });
    }

  }

  note_input(input: any) {
    var value = input.sc_skatingelementnoteid.sc_value

    if (this.skater_data.hasOwnProperty('competitorentryid')) {

      if ('elements' in this.structure_input_data) {

        if (this.structure_input_data["elements"].length >= 1) {

          this.structure_input_data["elements"][this.structure_input_data["elements"].length - 1]['notes'].push(value);
          this.structuring_data();

        }
      }
    }


  }

  rep_jump_click(value: any) {

    if (this.skater_data.hasOwnProperty('competitorentryid')) {
      if ('elements' in this.structure_input_data) {

        if (this.structure_input_data["elements"].length >= 1) {

          this.structure_input_data["rep_jump"] = true;
          console.log("rep jump clicked", this.structure_input_data);

          this.structuring_data();
        }
      }
    }
  }

  seq_combo_click(value: any) {

    if (this.skater_data.hasOwnProperty('competitorentryid')) {
      if ('elements' in this.structure_input_data) {

        if (this.structure_input_data["elements"].length >= 1) {
          this.structure_input_data["type"] = value;


          if (this.structure_input_data["elements"][this.structure_input_data["elements"].length - 1]['notes'].includes('SEQ') || this.structure_input_data["elements"][this.structure_input_data["elements"].length - 1]['notes'].includes('COMBO')) {
            var seq_index = this.structure_input_data["elements"][this.structure_input_data["elements"].length - 1]['notes'].indexOf('SEQ');

            if (seq_index != -1) {
              this.structure_input_data["elements"][this.structure_input_data["elements"].length - 1]['notes'][seq_index] = value;


            }

            var combo_index = this.structure_input_data["elements"][this.structure_input_data["elements"].length - 1]['notes'].indexOf('COMBO');

            if (combo_index != -1) {
              this.structure_input_data["elements"][this.structure_input_data["elements"].length - 1]['notes'][combo_index] = value;
            }

          }
          else {
            this.structure_input_data["elements"][this.structure_input_data["elements"].length - 1]['notes'].push(value);
          }


          this.structuring_data();

        }
      }

    }




  }

  startTimer() {

    if (this.skater_data.hasOwnProperty('competitorentryid')) {
      this.halfwayInterval = setInterval(() => {
        this.halfwayTimer = this.halfwayTimer + 0.01;

        let minutes: any = Math.floor(Math.floor(this.halfwayTimer) / 60);
        let seconds: any = Math.floor(this.halfwayTimer) % 60;
        let milliseconds: any = Math.floor((((this.halfwayTimer) % 60) % 1) * 100);

        if (seconds < 10) {
          seconds = "0" + seconds;
        }
        if (milliseconds < 10) {
          milliseconds = "0" + milliseconds;
        }

        if (this.halfway_available == true) {

          if (this.secondHalf == false) {

            if (Math.floor(this.halfwayTimer) < this.data.segmentid.definitionid.sc_programhalftime) {
              //console.log("First half")
            }
            else {
              this.secondHalf = true;
              console.log("Second half", this.dataSource);

              // set halfway now

              var halfway_output: any = {};
              halfway_output["competitorentryid"] = this.skater_data["competitorentryid"];
              halfway_output["method_name"] = "HALFWAY_REQUEST";
              halfway_output["room"] = this.activatedRoute.snapshot.params.segmentid;

              var halfway_data: any = {};
              halfway_data["index"] = this.dataSource.length;


              halfway_output["data"] = halfway_data;

              this._chatService.broadcast(halfway_output);

            }
          }

        }

        //console.log("seconds",Math.floor(this.halfwayTimer),this.secondHalf);

        this.time = minutes + ":" + seconds + ":" + milliseconds;
      }, 10);
    }


  }

  stopTimer() {
    if (this.skater_data.hasOwnProperty('competitorentryid')) {
      clearInterval(this.halfwayInterval);
      console.log("coming here")
    }

  }

  resetTimer() {
    if (this.skater_data.hasOwnProperty('competitorentryid')) {

      clearInterval(this.halfwayInterval);
      this.time = 0;
      this.halfwayTimer = 0;
    }

  }

  object_code_generator(incoming_data: any) {

    //console.log("incoming data",incoming_data)

    var whole_string_data = "";
    for (let x = 0; x < incoming_data["elements"].length; x++) {

      var individual_string = "";

      // if (incoming_data["elements"][x]['Pattern_dance_code'] != "") {
      //   individual_string = individual_string + incoming_data["elements"][x]['Pattern_dance_code'];
      // }

      if (incoming_data["elements"][x]['Flying'] == true) {
        individual_string = individual_string + "F";
      }

      if (incoming_data["elements"][x]['Change'] == true) {
        individual_string = individual_string + "C";
      }

      if (incoming_data["elements"][x]['Element_code'] != "") {
        individual_string = individual_string + incoming_data["elements"][x]['Element_code'];
      }

      if (incoming_data["elements"][x]['Synchro_element_suffix'].length >= 1) {
        var tem = "";
        for (let b = 0; b < incoming_data["elements"][x]['Synchro_element_suffix'].length; b++) {
          tem = tem + incoming_data["elements"][x]['Synchro_element_suffix'][b];
        }
        individual_string = individual_string + "+" + tem;
      }

      if (incoming_data["elements"][x]['Throw'] == true) {
        individual_string = individual_string + "Th";
      }

      if (incoming_data["elements"][x]['Edge'] != "") {
        individual_string = individual_string + incoming_data["elements"][x]['Edge'];
      }

      if (incoming_data["elements"][x]['Rotation'] != "") {
        individual_string = individual_string + incoming_data["elements"][x]['Rotation'];
      }

      if (incoming_data["elements"][x]['Synchro'] != "") {
        individual_string = individual_string + incoming_data["elements"][x]['Synchro'];
      }



      if (incoming_data["elements"][x]['V'] == true) {
        individual_string = individual_string + "V";
      }

      if (incoming_data["elements"][x]['invalid'] == true) {
        individual_string = individual_string + "*";
      }

      if (incoming_data["elements"][x]['notes'].length >= 1) {

        for (let c = 0; c < incoming_data["elements"][x]['notes'].length; c++) {



          if (c == 0) {
            individual_string = individual_string + "+" + incoming_data["elements"][x]['notes'][c];

          }
          else {
            individual_string = individual_string + incoming_data["elements"][x]['notes'][c];
          }

        }

      }

      if (whole_string_data == "") {
        whole_string_data = individual_string;
      }
      else {
        whole_string_data = whole_string_data + "+" + individual_string;
      }


    }


    if (incoming_data["rep_jump"] == true) {
      whole_string_data = whole_string_data + "+REP";
    }


    if (incoming_data["rating"] != "") {


      var value = "";

      switch (incoming_data["rating"]) {
        // EC ACTIVITIES
        case 947960000:

          console.log("caser bronz");

          value = "B";

          break;

        case 947960001:

          console.log("caser silver");
          value = "S";

          break;

        case 947960002:
          console.log("caser gold");
          value = "G";

          break;

        case 947960003:
          console.log("caser complete");
          value = "C";
          break;

        case 947960004:
          console.log("caser in complete");
          value = "I/C";
          break;

        case 947960005:
          console.log("caser successful");
          value = "SUC";

          break;

        case 947960006:
          console.log("caser unsuccessful");
          value = "U/S";

          break;


        default:
          console.log("no rating value")
          break;


      }

      whole_string_data = whole_string_data + " [" + value + "]";

      //whole_string_data = whole_string_data + " [" + incoming_data["rating"]  + "]";
    }


    return { "whole_string": whole_string_data }

  }


  halfway_set(value: any) {



    console.log("clicked and index is ", value, this.structure_data);


    var halfway_output: any = {};
    halfway_output["competitorentryid"] = this.skater_data["competitorentryid"];
    halfway_output["method_name"] = "HALFWAY_REQUEST";
    halfway_output["room"] = this.activatedRoute.snapshot.params.segmentid;

    var halfway_data: any = {};
    halfway_data["index"] = value - 1;


    halfway_output["data"] = halfway_data;

    this._chatService.broadcast(halfway_output);



    // for(let k=0;k<this.structure_data.length;k++)
    // {
    //   if(k < value-1)
    //   { 
    //     console.log("k smaller",k)




    //   }
    //   else
    //   {
    //     console.log("k greater",k)
    //   }

    // }




  }


  check_uncheck(value: any) {
    console.log("value any clicked", value);


    var check_uncheck_output: any = {};
    check_uncheck_output["competitorentryid"] = this.skater_data["competitorentryid"];
    check_uncheck_output["method_name"] = "CHECK_UNCHECK_REQUEST";
    check_uncheck_output["room"] = this.activatedRoute.snapshot.params.segmentid;

    var check_data: any = {};
    check_data["index"] = value["position"];


    check_uncheck_output["data"] = check_data;

    this._chatService.broadcast(check_uncheck_output);




  }

  family_button_clicked(value: any, family_type_index: any) {

    console.log("000000000000000000000000", value, family_type_index);

    if (this.skater_data.hasOwnProperty('competitorentryid')) {
      console.log("family button clicked", value, family_type_index, this.input);


      for (let m = 0; m < this.input.length; m++) {
        for (let n = 0; n < this.input[m]["family_type_component"].length; n++) {
          if (this.input[m]["family_type_component"][n]["family"] == value) {

            this.level_data[family_type_index] = ["", "", "", "", "", ""];

            console.log("----------------", this.input[m]["family_type_component"][n]);

            for (let y = 0; y < this.input[m]["family_type_component"][n]["family_component"].length; y++) {

              if (this.input[m]["family_type_component"][n]["family_component"][y]["level"] == null) {
                this.level_data[family_type_index][0] = this.input[m]["family_type_component"][n]["family_component"][y]["element_code"];
              }
              else if (this.input[m]["family_type_component"][n]["family_component"][y]["level"] == 0 || this.input[m]["family_type_component"][n]["family_component"][y]["level"] == "B") {
                this.level_data[family_type_index][1] = this.input[m]["family_type_component"][n]["family_component"][y]["element_code"];
              }
              else if (this.input[m]["family_type_component"][n]["family_component"][y]["level"] == 1) {
                this.level_data[family_type_index][2] = this.input[m]["family_type_component"][n]["family_component"][y]["element_code"];
              }
              else if (this.input[m]["family_type_component"][n]["family_component"][y]["level"] == 2) {
                this.level_data[family_type_index][3] = this.input[m]["family_type_component"][n]["family_component"][y]["element_code"];
              }
              else if (this.input[m]["family_type_component"][n]["family_component"][y]["level"] == 3) {
                this.level_data[family_type_index][4] = this.input[m]["family_type_component"][n]["family_component"][y]["element_code"];
              }
              else if (this.input[m]["family_type_component"][n]["family_component"][y]["level"] == 4) {
                this.level_data[family_type_index][5] = this.input[m]["family_type_component"][n]["family_component"][y]["element_code"];
              }
              else {
                console.log("level is out of scope");
              }
            }



          }
        }



      }

      console.log("this level data", this.level_data);

    }

  }


  insert_rating(input: any) {

    console.log('insert requested', input, this.Template_datasource, this.data.segmentid.definitionid.sc_elementconfiguration.elements);


    for (let k = 0; k < this.data.segmentid.definitionid.sc_elementconfiguration.elements.length; k++) {

      //console.log("current element code", this.data.segmentid.definitionid.sc_elementconfiguration.elements[k]["sc_skatingelementdefinitionid"]["sc_elementcode"])

      if (input[this.data.segmentid.definitionid.sc_elementconfiguration.elements[k]["sc_skatingelementdefinitionid"]["sc_elementcode"]] != "") {
        console.log("rating is available", input[this.data.segmentid.definitionid.sc_elementconfiguration.elements[k]["sc_skatingelementdefinitionid"]["sc_elementcode"]])

        // finding skater_name

        var tem_data = this.data.segmentid.competitors.filter((record: any) => record.sc_competitorid.sc_name == input["Skater_name"]);

        //console.log('new notes', tem_data);


        // var request_object:any = {};

        // request_object["competitorentryid"] = "142152";
        // request_object["method_name"] = "TEM_ELM_ENTER";
        // request_object["room"] = this.activatedRoute.snapshot.params.segmentid;
        
        var request_object = 
          {
            "competitorentryid":tem_data[0]["competitorentryid"],
            "sc_skatingelementdefinitionid":this.data.segmentid.definitionid.sc_elementconfiguration.elements[k]["sc_skatingelementdefinitionid"]["sc_skatingelementdefinitionid"],
            "programorder":k+1,
            "elementcount":1,
            "multitype":"default",
            "steporder":1,
            "rep_jump":false,
            "ratingtype":input[this.data.segmentid.definitionid.sc_elementconfiguration.elements[k]["sc_skatingelementdefinitionid"]["sc_elementcode"]],
            "halfwayflag":0,
            "notes":'',
            "invalid":false,
      

          };

        // this._chatService.broadcast(request_object);

        this.apiService.insertRating(request_object).subscribe(
          (res) => {
            console.log("we got response back fromn an http request", res)


            if (k == this.data.segmentid.definitionid.sc_elementconfiguration.elements.length - 1) {

              this.apiService.httpCalculateSkateScore(tem_data[0]["competitorentryid"]).subscribe(
                (res: any) => {
                  console.log("----------------------------we got response back fromn an http request", res)
                })
            }


            this.apiService.getTemplatedSegInfo({ 'segmentid': this.activatedRoute.snapshot.params.segmentid }).subscribe(
              (res: any) => {
                //console.log("we got response back fromn an http request in get templated function", res, this.Template_datasource)

                for (let k = 0; k < this.data.segmentid.competitors.length; k++) {
                  //console.log("inside response",k)

                  var skater_data = res.filter((record: any) => record.competitorentryid == this.data.segmentid.competitors[k]["competitorentryid"]);

                  //console.log('new notes',skater_data);

                  var element_count = 0;

                  for (let m = 0; m < skater_data[0]["output"].length; m++) {
                    element_count++;
                    //console.log("-----", skater_data[0]["output"][m]["programorder"], skater_data[0]["output"][m]["ratingtype"], skater_data[0]["output"][m]["sc_skatingelementdefinitionid"])

                    var element_defination = this.data.segmentid.definitionid.sc_elementconfiguration.elements.filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == skater_data[0]["output"][m]["sc_skatingelementdefinitionid"]);

                    //console.log('---------->',element_defination[0]["sc_skatingelementdefinitionid"]["sc_elementcode"]);

                    this.Template_datasource[k][element_defination[0]["sc_skatingelementdefinitionid"]["sc_elementcode"]] = skater_data[0]["output"][m]["ratingtype"].toString();

                  }

                  console.log("-----", element_count)


                  if (element_count == this.data.segmentid.definitionid.sc_elementconfiguration.elements.length) {

                    this.Template_datasource[k]["Finalize"] = true;
                  }



                }
              },
              (error) => {
                console.log("error coming", error)
              })
          },
          (error) => {
            console.log("error coming", error)
          })




      }
    }
  }

  noncpc_scoresubmit() {

    console.log("NON CPC Submit", this.finalize_done, this.skater_data);

    var official_data = this.data.segmentid.official.filter((record: any) => record.role == '9A8F5827-FEA6-EC11-983F-00224825E0C8');

    console.log("official data", official_data, official_data.length);

    if (official_data.length == 0) {

      if (this.finalize_done == true) {

        if (this.skater_data.hasOwnProperty('competitorentryid')) {

          // logic for sending status update

          var submit_output: any = {};
          submit_output["competitorentryid"] = this.skater_data["competitorentryid"];
          submit_output["method_name"] = "SCORESKATE";
          submit_output["room"] = this.activatedRoute.snapshot.params.segmentid;

          var submit_data: any = {};
          submit_data["statusmessage"] = "Finalize";
          submit_data["official_assignment_id"] = this.activatedRoute.snapshot.params.assignmentid;
          submit_data["competitorentryid"] = this.skater_data["competitorentryid"]


          submit_output["data"] = submit_data;

          this._chatService.broadcast(submit_output);
          console.log("sumit output", submit_output);

        }

      }
    }
  }
}


@Component({
  selector: 'dio_video_popup',
  templateUrl: './dio_video_popup.html',
  styleUrls:
    ['./dio_video_popup.css']
})
export class dio_video {

  //table_data:any;
  displayedColumns: string[] = ['index', 'elementCode', 'clip'];
  selectedRowIndex: any = -1;
  clip: any;

  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any, private languageSelector: LanguageSelector, private _chatService: ChatService, private activatedRoute: ActivatedRoute) {

    console.log("data coming into pop up", data);
    //this.table_data = data.datasource;

  }


  row_clicked(input: any) {


    //console.log("row data", input)
    // this.index = input.index;
    this.selectedRowIndex = input.position;

    let clip_data: any = {};
    clip_data['clicked'] = true;
    clip_data['data'] = input.elmclip;

    this.clip = clip_data;


  }

  currentMediaTime(time_data: any) {

    //console.log("event coming#####");

    for (let z = 0; z < this.data.datasource.length; z++) {


      if (this.data.datasource[z].elmclip != '') {

        if (this.data.datasource[z].elmclip[0] < (time_data) && this.data.datasource[z].elmclip[1] > (time_data)) {
          document.getElementById('play_element_clip_button_' + (z + 1))?.setAttribute("style", "color:#cc9544;");
        }
        else {
          document.getElementById('play_element_clip_button_' + (z + 1))?.setAttribute("style", "color:#fff;");
        }
      }

    }

  }


  // message_data(name: any) {
  //   //console.log("name", name);
  // }
}


