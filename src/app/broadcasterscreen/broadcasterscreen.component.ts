import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { LanguageSelector } from '../api.languageselector';
import { ChatService } from '../chat_service';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface TopSkaterElementData {
  element: any;
  base: any;
  GOE: any;
  score: any;
  skateelementid: any;
}
export interface CurrentSkaterElementData {
  element: any;
  base: any;
  GOE: any;
  score: any;
  skateelementid: any;
}
export interface PCElementData {
  pc_name: any;
  pc_value: any;
}

export interface TopSkaterPCElementData {
  pc_name: any;
  pc_value: any;
}


export interface CategoryRankingElementData {
  number: any;
  skater_name: any;
  seg_1: any;
  rank1: any;
  seg_2: any;
  rank2: any;
  seg_3: any;
  rank3: any;
  current: any;
}

export interface SegmentRankingElementData {
  number: any,
  name: any;
  TECS: any;
  PCS: any;
  total: any;
}

const TOP_SAKTER_ELEMENT_DATA: TopSkaterElementData[] = [];

const CURRENT_SKATER_ELEMENT_DATA: CurrentSkaterElementData[] = [];

const ELEMENT_PC_DATA: PCElementData[] = [];

const TOP_SKATER_ELEMENT_PC_DATA: PCElementData[] = [];

const RANKING_ELEMENT: CategoryRankingElementData[] = [


];

const SEGMENT_RANKING_ELEMENT: SegmentRankingElementData[] = [];

@Component({
  selector: 'app-broadcasterscreen',
  templateUrl: './broadcasterscreen.component.html',
  styleUrls: ['./broadcasterscreen.component.css']
})
export class BroadcasterscreenComponent implements OnInit {

  current_skater_click: any = false;
  current_skater_data: any = {};
  current_skater_index: any;
  user_access: any = false;
  on_join_data: any = {};

  elements: any = [];
  users: any = [];

  current_skater_extra_data: any = {};
  ranking_category_name: any = {};

  ranking_upates: any = {};
  wbp_failed_index: any = [];

  TopSkaterDataSource: MatTableDataSource<TopSkaterElementData>;
  TopSkaterdisplayedColumns: string[] = ['element', 'base', 'GOE', 'score'];

  CurrentSkaterDataSource: MatTableDataSource<CurrentSkaterElementData>;
  CurrentSkaterdisplayedColumns: string[] = ['element', 'base', 'GOE', 'score'];

  PCdatasource: MatTableDataSource<PCElementData>;
  PCdisplayedColumns: string[] = ['pc_name', 'pc_value'];

  TopSkaterPCdatasource: MatTableDataSource<TopSkaterPCElementData>;
  TopSkaterPCdisplayedColumns: string[] = ['pc_name', 'pc_value'];

  CategoryRankingdatasource: MatTableDataSource<CategoryRankingElementData>;
  CategoryRankingdisplayedColumns: string[] = [];

  SegmentRankingdatasource: MatTableDataSource<SegmentRankingElementData>;
  SegmentRankingdisplayedColumns: string[] = ['number', 'name', 'TECS', 'PCS', 'total'];

  constructor(public dialog: MatDialog, private languageSelector: LanguageSelector, private _chatService: ChatService, private activatedRoute: ActivatedRoute, private snackBar: MatSnackBar, public apiService: ApiService, private _router: Router) {

    this.TopSkaterDataSource = new MatTableDataSource;

    this.CurrentSkaterDataSource = new MatTableDataSource;

    this.PCdatasource = new MatTableDataSource;

    this.TopSkaterPCdatasource = new MatTableDataSource;

    this.CategoryRankingdatasource = new MatTableDataSource;

    this.SegmentRankingdatasource = new MatTableDataSource;

    this._chatService.onBroadcastResp()
      .subscribe((data: any) => {

        //Convert the object in to stringfy format
        var incoming_data = JSON.parse(JSON.stringify(data));

        switch (incoming_data.method_name) {


          case "JOINING_ROOM":

            var temp = JSON.parse(JSON.stringify(data))

            var required_data = temp["returnObj"];

            // big intialization object in stringify format
            console.log("JOINING_ROOM", required_data);

            var dataObj = JSON.parse(JSON.stringify(required_data));

            console.log("returned data = " + dataObj.inroom);

            if (dataObj.inroom) {


              // other code 
              console.log("room exists and you're in it and here's your data objects!")

              this.on_join_data = JSON.parse(dataObj.initializationObj);

              // sorting pc component

              this.on_join_data.segmentid.definitionid.programcomponents.sort(function (a: any, b: any) {
                let orderA = a["sc_pctype"]["sc_order"];
                let orderB = b["sc_pctype"]["sc_order"];

                if (orderA === '' || orderA === null) {
                  return 1;
                }
                if (orderB === '' || orderB === null) {
                  return -1;
                }
                return orderA - orderB;
              });


              console.log("^^^^^^^^^^^^ This on join data after sort pc value", this.on_join_data);


              console.log("on join", this.on_join_data);


              // validation for assigned user using interface 

              console.log("getting sc_num from session", sessionStorage.getItem('scnum'))

              if (sessionStorage.getItem("isOnline") == "true") {
                if (sessionStorage.getItem('scnum') != null) {
                  console.log("logged in", sessionStorage.getItem('scnum'))

                  var official_data1 = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == this.activatedRoute.snapshot.params.assignmentid);

                  if (official_data1.length > 0) {
                    console.log("found in offcial assignment", official_data1)


                    console.log("value is ", official_data1[0].sc_officialid.sc_scnum)

                    // case 1: AS a DS 

                    var ds_data = this.on_join_data.segmentid.categoryid.eventid.dspermissions.filter((record: any) => record.dscontactid == sessionStorage.getItem('contactid'));



                    if ((official_data1[0].sc_officialid.sc_scnum == sessionStorage.getItem('scnum') && official_data1[0]['role'] == '6A9D2736-8B66-ED11-9562-00224828DA82') || ds_data.length > 0) {
                      console.log("you are allowed as official or DS")

                      this.user_access = true;

                    }
                    else {
                      console.log("you are not allowed")

                      this._router.navigate([`/dashboard`]);
                    }

                  }
                  else {


                    console.log("not found in offcial assignment", official_data1)

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


              //this.user_access = true;
              this.wbp_failed_index = [];

              this.current_skater_index = 1;

              var competitor_name = this.on_join_data.segmentid.competitors.filter((record: any) => record.sortorder == this.current_skater_index);

              if (competitor_name.length > 0) {
                this.current_skater_data = { competitorentryid: competitor_name[0]["competitorentryid"], skater_data: competitor_name[0]["sc_competitorid"] };
              }

              var chat_room: any = {};

              chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;

              chat_room["skater"] = competitor_name[0]["competitorentryid"];

              chat_room["method_name"] = 'HISTORY_SKATER_DATA';

              this._chatService.broadcast(chat_room);

              // pc data fill up

              var pc_data: any = [];

              for (let k = 0; k < this.on_join_data["segmentid"]["definitionid"]["programcomponents"].length; k++) {

                pc_data.push({ "pc_name": this.on_join_data["segmentid"]["definitionid"]["programcomponents"][k]["sc_pctype"]["sc_name"], pc_value: "", sc_skatingprogramcomponentdefinitionid: this.on_join_data["segmentid"]["definitionid"]["programcomponents"][k]["sc_skatingprogramcomponentdefinitionid"] });

              }

              this.PCdatasource = pc_data;

              this.TopSkaterPCdatasource = pc_data;

              var blank_array: any = [];

              this.CurrentSkaterDataSource = blank_array;

              this.snackBar.dismiss();

              // current skater extra data

              this.current_skater_extra_data = { "segment_rank": "", "TES": "", "PCS": "", "score": "", "segment_score": "", "category_rank": "", "category_score": "", "finalize": false, "total_offcials": "", "official_submitted": 0, "bonus": 0, "deduction": 0 };

              // get ranking data for bottom 2 tables

              var chat_room: any = {};

              chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;;

              chat_room["method_name"] = 'RANKING_DATA';
              chat_room["data"] = { 'official_assignment_id': this.activatedRoute.snapshot.params.assignmentid };

              this._chatService.broadcast(chat_room);



            }

            break;

          case "SEGSTART":

            console.log("Segment start");

            if (this.activatedRoute.snapshot.params.segmentid == data.room) {

              //this.user_access = true;

              this.snackBar.open("Segment started and data is Coming ...", "", {
                verticalPosition: 'top',
                horizontalPosition: "center",
                panelClass: ['green-snackbar']
              });

              var blank_array: any = [];

              this.CurrentSkaterDataSource = blank_array;

              this.current_skater_extra_data = { "segment_rank": "", "TES": "", "PCS": "", "score": "", "segment_score": "", "category_rank": "", "category_score": "", "finalize": false, "total_offcials": "", "official_submitted": 0, "bonus": 0, "deduction": 0 };

              this.wbp_failed_index = [];


              // var chat_room: any = {};

              // chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;
              // chat_room["method_name"] = 'NEWCLIENT';
              // chat_room["data"] = { 'official_assignment_id': this.activatedRoute.snapshot.params.assignmentid };

              // this._chatService.broadcast(chat_room);

            }

            break;

          case "SEGMENT_START_FINISHED":

            if (this.activatedRoute.snapshot.params.segmentid == data.room) {

              console.log("segment start finsished", incoming_data);

              var chat_room: any = {};

              chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;
              chat_room["method_name"] = 'NEWCLIENT';
              chat_room["data"] = { 'official_assignment_id': this.activatedRoute.snapshot.params.assignmentid };

              this._chatService.broadcast(chat_room);

            }
            break;

          case "SEGEND":

            console.log("Segment end");

            if (this.activatedRoute.snapshot.params.segmentid == data.room) {
              console.log("room closed")
              this.user_access = false;

              var empty_var: any = [];

              // Emprty the variable on segment end
              this.TopSkaterDataSource = empty_var;
              this.CurrentSkaterDataSource = empty_var;
              this.PCdatasource = empty_var;
              this.TopSkaterDataSource = empty_var;
              //this.BroadCasterdatasource = empty_var;
              this.CategoryRankingdatasource = empty_var;
              this.SegmentRankingdatasource = empty_var;

              this.current_skater_data = {};

              this.current_skater_extra_data = {};

            }

            break;

          case "LOAD_SKATER":

            var temp = JSON.parse(JSON.stringify(data))


            // getting list of ranking
            var chat_room: any = {};

            chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;;

            chat_room["method_name"] = 'RANKING_DATA';
            chat_room["data"] = { 'official_assignment_id': this.activatedRoute.snapshot.params.assignmentid };

            this._chatService.broadcast(chat_room);

            if (this.current_skater_data["competitorentryid"] == temp["data"]["competitorentryid"] || this.current_skater_click == true) {


              console.log("LOAD_SKATER", temp, this.current_skater_data);

              this.current_skater_data = temp["data"];


              var load_skater = this.on_join_data.segmentid.competitors.filter((record: any) => record.competitorentryid == temp["data"]["competitorentryid"]);

              if (load_skater[0].sortorder != 0) {

                this.current_skater_index = load_skater[0].sortorder;

              }

              var blank_array: any = [];

              this.CurrentSkaterDataSource = blank_array;

              this.current_skater_extra_data = { "segment_rank": "", "TES": "", "PCS": "", "score": "", "segment_score": "", "category_rank": "", "category_score": "", "finalize": false, "total_offcials": "", "official_submitted": 0, "bonus": 0, "deduction": 0 };

              this.wbp_failed_index = [];

            }

            this.current_skater_click = false;

            break;

          case "STOPSKATER":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("STOPSKATER", temp);

            break;

          case "DIOSTATUS":

            var temp = JSON.parse(JSON.stringify(data));

            if (this.current_skater_data["competitorentryid"] == temp["data"]["competitorentryid"]) {

              console.log("Status Update", temp);

              if (temp["data"]["data"]["statusmessage"] == "finalize") {
                this.current_skater_extra_data["finalize"] = true;

                console.log("here coming", this.current_skater_extra_data)

              }

              // for highlighting changes

              if (temp["data"]["data"]["statusmessage"] == "WBP") {
                for (let k = 0; k < temp["data"]["data"]["changed_index"].length; k++) {
                  if (this.wbp_failed_index.includes(temp["data"]["data"]["changed_index"][k]) == false) {
                    this.wbp_failed_index.push(temp["data"]["data"]["changed_index"][k]);
                  }
                }
                //this.wbp_failed_index = temp["data"]["data"]["changed_index"];
              }

            }

            break;

          case "NEWELM":


            var temp = JSON.parse(JSON.stringify(data))

            if (this.current_skater_data["competitorentryid"] == temp["data"]["competitorentryid"]) {
              console.log("new element added", temp);

              //console.log("dat----------", this.object_code_generator(temp["data"]["input_data"]));


              console.log("this.dataSource.data", this.CurrentSkaterDataSource, (<any>this.CurrentSkaterDataSource).length);

              if (temp["data"]["createdElement"]["position"] > (<any>this.CurrentSkaterDataSource).length) {
                console.log("data in add coming from server")

                var elements_array = <any>[];
                var element_object = <any>{};

                for (let k = 0; k < (<any>this.CurrentSkaterDataSource).length; k++) {

                  element_object['index'] = elements_array.length + 1;
                  element_object['skateelementid'] = (<any>this.CurrentSkaterDataSource)[k].skateelementid;
                  // { element: 1, base: 1, GOE: 1, score: 45 }
                  element_object['element'] = (<any>this.CurrentSkaterDataSource)[k].element;
                  element_object['base'] = (<any>this.CurrentSkaterDataSource)[k].base;
                  element_object['GOE'] = (<any>this.CurrentSkaterDataSource)[k].GOE;
                  element_object['score'] = (<any>this.CurrentSkaterDataSource)[k].score;

                  elements_array.push(element_object);
                  element_object = {};


                }

                element_object['index'] = elements_array.length + 1;
                element_object['skateelementid'] = temp["data"]["createdElement"]["newid"];
                element_object['element'] = this.object_code_generator(temp["data"]["input_data"])["whole_string"];
                element_object['base'] = "--";
                element_object['GOE'] = "--";
                element_object['score'] = "--";

                elements_array.push(element_object);
                element_object = {};



              }
              else {
                console.log("data source lenght less than");

                var elements_array = <any>[];
                var element_object = <any>{};


                for (let k = 0; k < (<any>this.CurrentSkaterDataSource).length; k++) {

                  if (k < temp["data"]["createdElement"]["position"] - 1) {
                    elements_array.push((<any>this.CurrentSkaterDataSource)[k]);

                  }

                  if (k == temp["data"]["createdElement"]["position"] - 1) {

                    element_object['index'] = elements_array.length + 1;
                    element_object['skateelementid'] = temp["data"]["createdElement"]["newid"];
                    // { element: 1, base: 1, GOE: 1, score: 45 }
                    element_object['element'] = this.object_code_generator(temp["data"]["input_data"])["whole_string"];
                    element_object['base'] = "--";
                    element_object['GOE'] = "--";
                    element_object['score'] = "--";

                    elements_array.push(element_object);
                    element_object = {};


                    element_object['index'] = elements_array.length + 1;
                    element_object['skateelementid'] = (<any>this.CurrentSkaterDataSource)[k].skateelementid;
                    // { element: 1, base: 1, GOE: 1, score: 45 }
                    element_object['element'] = (<any>this.CurrentSkaterDataSource)[k].element;
                    element_object['base'] = (<any>this.CurrentSkaterDataSource)[k].base;
                    element_object['GOE'] = (<any>this.CurrentSkaterDataSource)[k].GOE;
                    element_object['score'] = (<any>this.CurrentSkaterDataSource)[k].score;

                    elements_array.push(element_object);
                    element_object = {};

                  }


                  if (k > temp["data"]["createdElement"]["position"] - 1) {

                    element_object['index'] = elements_array.length + 1;
                    element_object['skateelementid'] = (<any>this.CurrentSkaterDataSource)[k].skateelementid;
                    // { element: 1, base: 1, GOE: 1, score: 45 }
                    element_object['element'] = (<any>this.CurrentSkaterDataSource)[k].element;
                    element_object['base'] = (<any>this.CurrentSkaterDataSource)[k].base;
                    element_object['GOE'] = (<any>this.CurrentSkaterDataSource)[k].GOE;
                    element_object['score'] = (<any>this.CurrentSkaterDataSource)[k].score;

                    elements_array.push(element_object);
                    element_object = {};

                  }



                }


              }

              this.CurrentSkaterDataSource = elements_array;

            }

            break;


          case "CHGELM":

            var temp = JSON.parse(JSON.stringify(data))

            console.log("element chaged", temp);


            if (this.current_skater_data["competitorentryid"] == temp["data"]["competitorentryid"]) {


              (<any>this.CurrentSkaterDataSource)[temp["data"]["position"] - 1]["skateelementid"] = temp["data"]["newid"];

              if (temp["data"]["input_data"].hasOwnProperty('elements')) {
                console.log("***************** elements are there ****************");


                if ("elements" in temp["data"]["input_data"]) {
                  (<any>this.CurrentSkaterDataSource)[temp["data"]["position"] - 1]["element"] = this.object_code_generator(temp["data"]["input_data"])["whole_string"];
                }


                console.log("datasource after", JSON.parse(JSON.stringify(this.CurrentSkaterDataSource)));


              }
              else {
                console.log("***************** elements are not  ****************");

                // let output_string:any = "";

                // var rep_jump_available = false;

                // for(let m=0;m<temp["data"]["req_data"].length;m++)
                // {
                //   var def_data = this.on_join_data.segmentid.definitionid.sc_elementconfiguration.elements.filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == temp["data"]["req_data"][m]["sc_skatingelementdefinitionid"]);

                //   if (def_data.length > 0) {
                //     output_string = output_string + def_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"];
                //   }

                //   if(temp["data"]["req_data"][m]["invalid"] == 1)
                //   {
                //     output_string = output_string + "*";
                //   }

                //   if(temp["data"]["req_data"][m]["notes"] != "")
                //   {
                //     const noteArray = temp["data"]["req_data"][m]["notes"].split(",");

                //     for(let n=0;n<noteArray.length;n++)
                //     {
                //       var note_data = this.on_join_data.segmentid.categoryid.definitionid.sc_skatingdisciplinedefinition.notes.filter((record: any) => record.sc_skatingelementnoteid.sc_skatingelementnoteid == noteArray[n]);
                //       if (note_data.length > 0) {

                //         if(n==0)
                //         {

                //           output_string = output_string + "+" + note_data[0]["sc_skatingelementnoteid"]["sc_value"];
                //         }
                //         else
                //         {
                //           output_string = output_string  + note_data[0]["sc_skatingelementnoteid"]["sc_value"];

                //         }


                //       }

                //     }
                //   }

                //   if(m != temp["data"]["req_data"].length-1)
                //   {
                //     output_string = output_string + "+";
                //   }

                //   if(temp["data"]["req_data"][m]["rep_jump"] == true)
                //   {
                //     rep_jump_available = true;
                //   }


                // }


                // if(rep_jump_available == true)
                // {
                //   output_string = output_string + "+REP";
                // }

                // console.log("output atring",output_string);

                // (<any>this.CurrentSkaterDataSource)[temp["data"]["position"] - 1]["element"] = output_string;

              }



              if (this.wbp_failed_index.includes(temp["data"]["position"]) == false) {
                this.wbp_failed_index.push(temp["data"]["position"]);
              }

              console.log("after change highlight ^^^^^^^^^^^^^", this.wbp_failed_index);

            }


            break;

          case "DELELM":


            var temp = JSON.parse(JSON.stringify(data));
            console.log("element deleted", temp);

            if (this.current_skater_data["competitorentryid"] == temp["data"]["competitorentryid"]) {
              var modified_elements = <any>[];

              for (let b = 0; b < (<any>this.CurrentSkaterDataSource).length; b++) {

                //console.log("lopppp", b)
                if (b < temp["data"]["position"] - 1) {

                  modified_elements.push((<any>this.CurrentSkaterDataSource)[b]);
                }

                else if (b == temp["data"]["position"] - 1) {

                  //console.log("else if deleted")

                }
                else {
                  modified_elements.push((<any>this.CurrentSkaterDataSource)[b]);

                }
              }

              for (let c = 0; c < modified_elements.length; c++) {
                modified_elements[c]['index'] = c + 1;
              }

              this.CurrentSkaterDataSource = modified_elements;

              console.log("datasource after", JSON.parse(JSON.stringify(this.CurrentSkaterDataSource)));

              // updating TES after 

              var total = 0;
              for (let m = 0; m < (<any>this.CurrentSkaterDataSource).length; m++) {


                if ((<any>this.CurrentSkaterDataSource)[m].score != "--") {
                  total = Number(total) + Number((<any>this.CurrentSkaterDataSource)[m].score);
                }

              }


              this.current_skater_extra_data["TES"] = Number(total).toFixed(2);
              this.current_skater_extra_data["score"] = (Number(this.current_skater_extra_data["TES"]) + Number(this.current_skater_extra_data["PCS"])).toFixed(2);

              console.log("total after element score", this.current_skater_extra_data["TES"]);

            }


            break;


          case "JUDGESTATUS":
            var temp = JSON.parse(JSON.stringify(data))
            console.log("JUDGESTATUS", temp);


            var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["data"]["official_assignment_id"]);

            console.log("official data", official_data);
            if (official_data.length > 0) {
              if (temp["data"]["data"]["competitorentryid"] == this.current_skater_data["competitorentryid"]) {
                if (temp["data"]["data"]["statusmessage"] == "Submit") {
                  if (temp["data"]["data"]["submit"] == true) {
                    this.current_skater_extra_data["official_submitted"] = Number(this.current_skater_extra_data["official_submitted"]) + 1;
                  }
                  else {
                    this.current_skater_extra_data["official_submitted"] = Number(this.current_skater_extra_data["official_submitted"]) - 1;
                  }

                }
              }
            }

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


          case "CURRENT_ELEMENT_SCORE":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("temp1235", temp);
            console.log("this.dataSource.data.................", this.CurrentSkaterDataSource);


            if (this.current_skater_data["competitorentryid"] == temp["data"]["competitorentryid"]) {

              var current_elements_array = <any>[];
              var current_element_object = <any>{};

              for (let k = 0; k < (<any>this.CurrentSkaterDataSource).length; k++) {

                if ((<any>this.CurrentSkaterDataSource)[k].skateelementid == temp["data"]["response"][0]["skateelementid"]) {




                  current_element_object['index'] = current_elements_array.length + 1;
                  current_element_object['skateelementid'] = (<any>this.CurrentSkaterDataSource)[k].skateelementid;
                  current_element_object['element'] = (<any>this.CurrentSkaterDataSource)[k].element;


                  current_element_object['base'] = Number(temp["data"]["response"][0]["basevalue"]).toFixed(2);
                  if (temp["data"]["response"][0].hasOwnProperty("trimmedmean") == true) {
                    current_element_object['GOE'] = Number(temp["data"]["response"][0]["trimmedmean"]).toFixed(2);
                  }
                  else {
                    current_element_object['GOE'] = "";
                  }

                  if (temp["data"]["response"][0].hasOwnProperty("calculatedscore") == true) {
                    current_element_object['score'] = Number(temp["data"]["response"][0]["calculatedscore"]).toFixed(2);
                  }
                  else {
                    current_element_object['score'] = "";
                  }


                  current_elements_array.push(current_element_object);
                  current_element_object = {};

                }
                else {


                  current_element_object['index'] = current_elements_array.length + 1;
                  current_element_object['skateelementid'] = (<any>this.CurrentSkaterDataSource)[k].skateelementid;
                  current_element_object['element'] = (<any>this.CurrentSkaterDataSource)[k].element;
                  current_element_object['base'] = (<any>this.CurrentSkaterDataSource)[k].base;
                  current_element_object['GOE'] = (<any>this.CurrentSkaterDataSource)[k].GOE;
                  current_element_object['score'] = (<any>this.CurrentSkaterDataSource)[k].score;
                  current_elements_array.push(current_element_object);
                  current_element_object = {};
                }
              }

              this.CurrentSkaterDataSource = current_elements_array;


              console.log("CurrentSkaterDataSource", this.CurrentSkaterDataSource)
              // updating TES after 

              var total = 0;
              for (let m = 0; m < (<any>this.CurrentSkaterDataSource).length; m++) {


                if ((<any>this.CurrentSkaterDataSource)[m].score != "--") {
                  total = Number(total) + Number((<any>this.CurrentSkaterDataSource)[m].score);
                }

              }



              this.current_skater_extra_data["TES"] = Number(total).toFixed(2);

              this.current_skater_extra_data["score"] = (Number(this.current_skater_extra_data["TES"]) + Number(this.current_skater_extra_data["PCS"])).toFixed(2);

              console.log("total after element score", this.current_skater_extra_data["TES"]);

            }


            break;

          case "INDIVIDUAL_PC_SCORE":

            var temp = JSON.parse(JSON.stringify(data))
            console.log(" individual coming ", temp);
            console.log("this.dataSource.data.................", this.PCdatasource);

            if (this.current_skater_data["competitorentryid"] == temp["data"]["competitorentryid"]) {

              for (let z = 0; z < temp["data"]["response"].length; z++) {

                var individual_pcs_array = <any>[];

                for (let k = 0; k < (<any>this.PCdatasource).length; k++) {


                  var individual_pcs_object = <any>{};


                  if ((<any>this.PCdatasource)[k].sc_skatingprogramcomponentdefinitionid == temp["data"]["response"][z]["sc_skatingprogramcomponentdefinitionid"]) {


                    individual_pcs_object['pc_name'] = (<any>this.PCdatasource)[k]["pc_name"];
                    individual_pcs_object['pc_value'] = Number(temp["data"]["response"][z]["pcscore"]).toFixed(2);
                    individual_pcs_object['sc_skatingprogramcomponentdefinitionid'] = (<any>this.PCdatasource)[k]["sc_skatingprogramcomponentdefinitionid"];


                  }
                  else {
                    individual_pcs_object['pc_name'] = (<any>this.PCdatasource)[k]["pc_name"];
                    individual_pcs_object['pc_value'] = (<any>this.PCdatasource)[k]["pc_value"];
                    individual_pcs_object['sc_skatingprogramcomponentdefinitionid'] = (<any>this.PCdatasource)[k]["sc_skatingprogramcomponentdefinitionid"];

                  }

                  individual_pcs_array.push(individual_pcs_object);

                }

                this.PCdatasource = individual_pcs_array;

              }

              // updating PCS after 

              console.log("pc datasource", this.PCdatasource);

              var total = 0;
              for (let m = 0; m < (<any>this.PCdatasource).length; m++) {

                if ((<any>this.PCdatasource)[m].pc_value != "") {
                  total = Number(total) + Number((<any>this.PCdatasource)[m].pc_value);
                }

              }

              console.log("total after element score", total);

              this.current_skater_extra_data["PCS"] = Number(total).toFixed(2);
              this.current_skater_extra_data["score"] = (Number(this.current_skater_extra_data["TES"]) + Number(this.current_skater_extra_data["PCS"])).toFixed(2);



            }




            break;


          case "RANKING_DATA":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("Ranking Update", temp);

            this.ranking_upates = temp["data"]["output"];

            // segment ranking

            var segment_ranking_array = <any>[];

            for (let k = 0; k < temp["data"]["output"]["segment"].length; k++) {


              var individual_segment_object = <any>{};


              individual_segment_object['number'] = segment_ranking_array.length + 1;

              var skate_data: any = this.on_join_data["segmentid"]["competitors"].filter((record: any) => record.sc_competitorid.sc_competitorid == temp["data"]["output"]["segment"][k]["sc_competitorid"]);

              console.log("skate data for segment _____________________", skate_data);

              if (skate_data.length >= 1) {
                individual_segment_object['name'] = skate_data[0]["sc_competitorid"]["sc_name"];
              }

              //individual_segment_object['name'] = temp["data"]["output"]["segment"][k]["skater_data"]["sc_name"];

              if (temp["data"]["output"]["segment"][k]["tes"] != null) {
                individual_segment_object['TECS'] = temp["data"]["output"]["segment"][k]["tes"];
              }
              else {
                individual_segment_object['TECS'] = "--";
              }


              if (temp["data"]["output"]["segment"][k]["tes"] != null) {
                individual_segment_object['PCS'] = temp["data"]["output"]["segment"][k]["pcs"];
              }
              else {
                individual_segment_object['PCS'] = "--";
              }


              individual_segment_object['total'] = Number(temp["data"]["output"]["segment"][k]["score"]).toFixed(2);


              segment_ranking_array.push(individual_segment_object);

            }

            this.SegmentRankingdatasource = segment_ranking_array;


            console.log("segement ranking", this.SegmentRankingdatasource);

            // category ranking

            var category_ranking_array = <any>[];

            for (let m = 0; m < temp["data"]["output"]["category"]["competitors"].length; m++) {


              var individual_category_object = <any>{};

              individual_category_object['number'] = category_ranking_array.length + 1;



              var skate_data: any = this.on_join_data["segmentid"]["competitors"].filter((record: any) => record.sc_competitorid.sc_competitorid == temp["data"]["output"]["category"]["competitors"][m]["sc_competitor_id"]);

              console.log("skate data for category _____________________", skate_data);

              if (skate_data.length >= 1) {
                individual_category_object['skater_name'] = skate_data[0]["sc_competitorid"]["sc_name"];
              }


              if (temp["data"]["output"]["category"]["competitors"][m]["segment1"] != 0) {
                individual_category_object['seg_1'] = Number(temp["data"]["output"]["category"]["competitors"][m]["segment1"]).toFixed(2);
                individual_category_object['rank1'] = temp["data"]["output"]["category"]["competitors"][m]["segment1_rank"];
              }
              else {
                individual_category_object['seg_1'] = "";
                individual_category_object['rank1'] = "";
              }




              if (temp["data"]["output"]["category"]["all_segments"].length > 1) {
                if (temp["data"]["output"]["category"]["competitors"][m]["segment2"] != 0) {
                  individual_category_object['seg_2'] = Number(temp["data"]["output"]["category"]["competitors"][m]["segment2"]).toFixed(2);
                  individual_category_object['rank2'] = temp["data"]["output"]["category"]["competitors"][m]["segment2_rank"];

                }
                else {
                  individual_category_object['seg_2'] = "";
                  individual_category_object['rank2'] = "";
                }

              }
              else {
                individual_category_object['seg_2'] = "";
                individual_category_object['rank2'] = "";
              }

              if (temp["data"]["output"]["category"]["all_segments"].length > 2) {
                if (temp["data"]["output"]["category"]["competitors"][m]["segment3"] != 0) {
                  individual_category_object['seg_3'] = Number(temp["data"]["output"]["category"]["competitors"][m]["segment3"]).toFixed(2);
                  individual_category_object['rank3'] = temp["data"]["output"]["category"]["competitors"][m]["segment3_rank"];

                }
                else {
                  individual_category_object['seg_3'] = "";
                  individual_category_object['rank3'] = "";
                }

              }
              else {
                individual_category_object['seg_3'] = "";
                individual_category_object['rank3'] = "";
              }


              individual_category_object['current'] = Number(temp["data"]["output"]["category"]["competitors"][m]["total_score"]).toFixed(2);

              category_ranking_array.push(individual_category_object)


            }

            this.CategoryRankingdatasource = category_ranking_array;

            console.log("category ranking data", this.CategoryRankingdatasource);


            // code for showing only few columns based on possible segments in category tab and category ranking


            if (temp["data"]["output"]["category"]["all_segments"].length == 1) {

              this.CategoryRankingdisplayedColumns = ['number', 'skater_name', 'seg_1', 'rank1', 'current'];

            }
            else if (temp["data"]["output"]["category"]["all_segments"].length == 2) {
              this.CategoryRankingdisplayedColumns = ['number', 'skater_name', 'seg_1', 'rank1', 'seg_2', 'rank2', 'current'];
            }
            else if (temp["data"]["output"]["category"]["all_segments"].length == 3) {
              this.CategoryRankingdisplayedColumns = ['number', 'skater_name', 'seg_1', 'rank1', 'seg_2', 'rank2', 'seg_3', 'rank3', 'current'];
            }
            else {
              console.log("else case");
            }


            console.log("CategoryRankingdisplayedColumns", this.CategoryRankingdisplayedColumns);


            // loaded skater's category rank

            console.log("current skater data", this.current_skater_data);

            var category_data_index: any = temp["data"]["output"]["category"]["competitors"].findIndex((record: any) => record.sc_competitor_id == this.current_skater_data["skater_data"]["sc_competitorid"]);

            console.log("index in category", category_data_index);

            if (category_data_index != -1) {
              if (temp["data"]["output"]["category"]["competitors"][category_data_index]["total_score"] != 0) {
                this.current_skater_extra_data["category_rank"] = category_data_index + 1;
                this.current_skater_extra_data["category_score"] = Number(temp["data"]["output"]["category"]["competitors"][category_data_index]["total_score"]).toFixed(2);
              }

            }


            // now code for total offcials who will submit

            console.log("this on join data", this.on_join_data);

            var official_data: any = this.on_join_data["segmentid"]["official"].filter((record: any) => record.role == '469C7509-FEA6-EC11-983F-00224825E0C8' || (record.role == '9A8F5827-FEA6-EC11-983F-00224825E0C8' && record.includescore == 1));

            this.current_skater_extra_data["total_offcials"] = official_data.length;

            // code for name in category tab

            var name: any = [];
            for (let n = 0; n < temp["data"]["output"]["category"]["all_segments"].length; n++) {

              name.push(temp["data"]["output"]["category"]["all_segments"][n]["enname"]);

            }
            this.ranking_category_name = name.join(" & ");



            break;

          case "SCORESKATE":

            var temp = JSON.parse(JSON.stringify(data))

            console.log("should come here", temp);

            if (this.current_skater_data["competitorentryid"] == temp["data"]["competitorentryid"]) {

              // this.current_skater_extra_data["official_submitted"] = Number(this.current_skater_extra_data["official_submitted"]) +1;

              var segment_data_index: any = temp["data"]["ranking"]["segment"].findIndex((record: any) => record.competitorentryid == temp["data"]["competitorentryid"]);

              console.log("index in segment", segment_data_index);
              if (segment_data_index != -1) {
                this.current_skater_extra_data["segment_rank"] = segment_data_index + 1;
                if (temp["data"]["score"].length > 1) {
                  this.current_skater_extra_data["segment_score"] = Number(temp["data"]["score"][7]["final"]).toFixed(2);
                }
                if (temp["data"]["score"].length == 1) {
                  this.current_skater_extra_data["segment_score"] = Number(temp["data"]["score"][0]["final"]).toFixed(2);
                }
              }



            }

            var chat_room: any = {};

            chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;;

            chat_room["method_name"] = 'RANKING_DATA';
            chat_room["data"] = { 'official_assignment_id': this.activatedRoute.snapshot.params.assignmentid };

            this._chatService.broadcast(chat_room);



            break;

          case "REFEREESTATUS":
            var temp = JSON.parse(JSON.stringify(data))
            console.log("REFEREESTATUS", temp);


            var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["data"]["official_assignment_id"]);

            console.log("official data", official_data);

            if (official_data.length > 0) {
              if (temp["data"]["data"]["competitorentryid"] == this.current_skater_data["competitorentryid"] && official_data[0]["includescore"] == 1) {
                if (temp["data"]["data"]["statusmessage"] == "Submit") {
                  if (temp["data"]["data"]["submit"] == true) {
                    this.current_skater_extra_data["official_submitted"] = Number(this.current_skater_extra_data["official_submitted"]) + 1;
                  }
                  else {
                    this.current_skater_extra_data["official_submitted"] = Number(this.current_skater_extra_data["official_submitted"]) - 1;
                  }

                }
              }
            }


            break;

          case "DIOADJCHG":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("DIOADJCHG recents", temp);

            this.current_skater_extra_data["bonus"] = temp["data"]["createdElement"]["broadcaster_bonus"];
            this.current_skater_extra_data["deduction"] = temp["data"]["createdElement"]["broadcaster_deduction"];

            break;

          case "REFADJ":
            var temp = JSON.parse(JSON.stringify(data))
            console.log("REFADJ recents", temp);

            this.current_skater_extra_data["bonus"] = temp["data"]["createdElement"]["broadcaster_bonus"];
            this.current_skater_extra_data["deduction"] = temp["data"]["createdElement"]["broadcaster_deduction"];


            break;

          default:
            break;
        }
      });
  }


  ngOnInit(): void {

    this.TopSkaterDataSource.data = TOP_SAKTER_ELEMENT_DATA;

    this.CurrentSkaterDataSource.data = CURRENT_SKATER_ELEMENT_DATA;

    //this.BroadCasterdatasource.data = BROADCASTER_DATA;

    this.CategoryRankingdatasource.data = RANKING_ELEMENT;



    this.SegmentRankingdatasource.data = SEGMENT_RANKING_ELEMENT;

    //Room joining request for server
    var chat_room: any = {};

    chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;;
    chat_room["method_name"] = 'NEWCLIENT';
    chat_room["data"] = { 'official_assignment_id': this.activatedRoute.snapshot.params.assignmentid };

    this._chatService.broadcast(chat_room);
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

      if (incoming_data["elements"][x]['V'] == true) {
        individual_string = individual_string + "V";
      }

      if (incoming_data["elements"][x]['invalid'] == true) {
        individual_string = individual_string + "*";
      }

      if (incoming_data["elements"][x]['notes'].length >= 1) {

        for (let c = 0; c < incoming_data["elements"][x]['notes'].length; c++) {

          //individual_string = individual_string + "[" + incoming_data["elements"][x]['notes'][c] + "]";

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


    return { "whole_string": whole_string_data }

  }

  nextButtonClick() {


    if (this.current_skater_index < this.on_join_data["segmentid"]["competitors"].length) {

      this.current_skater_index = this.current_skater_index + 1;

      var competitor_name = this.on_join_data.segmentid.competitors.filter((record: any) => record.sortorder == this.current_skater_index);

      console.log("1234", competitor_name)

      if (competitor_name.length > 0) {

        // code for removing data when next skater is loaded in case of they have no history

        var blank_array: any = [];

        this.CurrentSkaterDataSource = blank_array;

        this.current_skater_extra_data = { "segment_rank": "", "TES": "", "PCS": "", "score": "", "segment_score": "", "category_rank": "", "category_score": "", "finalize": false, "total_offcials": "", "official_submitted": 0, "bonus": 0, "deduction": 0 };


        var pc_data: any = [];

        for (let k = 0; k < (<any>this.PCdatasource).length; k++) {

          pc_data.push({ "pc_name": (<any>this.PCdatasource)[k]["pc_name"], pc_value: "", sc_skatingprogramcomponentdefinitionid: (<any>this.PCdatasource)[k]["sc_skatingprogramcomponentdefinitionid"] });

        }

        this.PCdatasource = pc_data;

        // old code
        this.current_skater_data = { competitorentryid: competitor_name[0]["competitorentryid"], skater_data: competitor_name[0]["sc_competitorid"] };

        var chat_room: any = {};
        chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;
        chat_room["skater"] = competitor_name[0]["competitorentryid"];

        chat_room["method_name"] = 'HISTORY_SKATER_DATA';
        //this._chatService.createRoom(chat_room);
        this._chatService.broadcast(chat_room);

        var blank_array: any = [];
        this.CurrentSkaterDataSource = blank_array;

        console.log("coming here", this.CurrentSkaterDataSource.data)

        console.log("current skater", this.current_skater_data);

        console.log("next", this.current_skater_index);

        // updating category rank if avialable

        console.log("stored ranks", this.ranking_upates);


        var category_data_index: any = this.ranking_upates["category"]["competitors"].findIndex((record: any) => record.sc_competitor_id == this.current_skater_data["skater_data"]["sc_competitorid"]);

        console.log("index in category", category_data_index);

        if (category_data_index != -1) {
          if (this.ranking_upates["category"]["competitors"][category_data_index]["total_score"] != 0) {
            this.current_skater_extra_data["category_rank"] = category_data_index + 1;
            this.current_skater_extra_data["category_score"] = Number(this.ranking_upates["category"]["competitors"][category_data_index]["total_score"]).toFixed(2);;
          }

        }

        // now code for total offcials who will submit

        console.log("this on join data", this.on_join_data);

        var official_data: any = this.on_join_data["segmentid"]["official"].filter((record: any) => record.role == '469C7509-FEA6-EC11-983F-00224825E0C8' || (record.role == '9A8F5827-FEA6-EC11-983F-00224825E0C8' && record.includescore == 1));

        this.current_skater_extra_data["total_offcials"] = official_data.length;


      }
    }
  }


  prevButtonClick() {

    if (this.current_skater_index > 1) {

      this.current_skater_index = this.current_skater_index - 1;

      var competitor_name = this.on_join_data.segmentid.competitors.filter((record: any) => record.sortorder == this.current_skater_index);

      console.log("1234", competitor_name);

      if (competitor_name.length > 0) {

        var blank_array: any = [];

        this.CurrentSkaterDataSource = blank_array;
        this.current_skater_extra_data = { "segment_rank": "", "TES": "", "PCS": "", "score": "", "segment_score": "", "category_rank": "", "category_score": "", "finalize": false, "total_offcials": "", "official_submitted": 0, "bonus": 0, "deduction": 0 };


        var pc_data: any = [];

        for (let k = 0; k < (<any>this.PCdatasource).length; k++) {

          pc_data.push({ "pc_name": (<any>this.PCdatasource)[k]["pc_name"], pc_value: "", sc_skatingprogramcomponentdefinitionid: (<any>this.PCdatasource)[k]["sc_skatingprogramcomponentdefinitionid"] });

        }

        this.PCdatasource = pc_data;


        this.current_skater_data = { competitorentryid: competitor_name[0]["competitorentryid"], skater_data: competitor_name[0]["sc_competitorid"] };

        var chat_room: any = {};
        chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;
        chat_room["skater"] = competitor_name[0]["competitorentryid"];

        chat_room["method_name"] = 'HISTORY_SKATER_DATA';
        //this._chatService.createRoom(chat_room);
        this._chatService.broadcast(chat_room);

        console.log("current skater", this.current_skater_data);

        console.log("next", this.current_skater_index);


        // updating category rank if avialable

        console.log("stored ranks", this.ranking_upates);


        var category_data_index: any = this.ranking_upates["category"]["competitors"].findIndex((record: any) => record.sc_competitor_id == this.current_skater_data["skater_data"]["sc_competitorid"]);

        console.log("index in category", category_data_index);

        if (category_data_index != -1) {
          if (this.ranking_upates["category"]["competitors"][category_data_index]["total_score"] != 0) {
            this.current_skater_extra_data["category_rank"] = category_data_index + 1;
            this.current_skater_extra_data["category_score"] = Number(this.ranking_upates["category"]["competitors"][category_data_index]["total_score"]).toFixed(2);
          }

        }

        // now code for total offcials who will submit

        console.log("this on join data", this.on_join_data);

        var official_data: any = this.on_join_data["segmentid"]["official"].filter((record: any) => record.role == '469C7509-FEA6-EC11-983F-00224825E0C8' || (record.role == '9A8F5827-FEA6-EC11-983F-00224825E0C8' && record.includescore == 1));

        this.current_skater_extra_data["total_offcials"] = official_data.length;


      }
    }
  }

  current_skater() {

    console.log("current skater", this.current_skater_data);

    this.current_skater_click = true;

    var pc_data: any = [];

    for (let k = 0; k < (<any>this.PCdatasource).length; k++) {

      pc_data.push({ "pc_name": (<any>this.PCdatasource)[k]["pc_name"], pc_value: "", sc_skatingprogramcomponentdefinitionid: (<any>this.PCdatasource)[k]["sc_skatingprogramcomponentdefinitionid"] });

    }

    this.PCdatasource = pc_data;

    var blank_array: any = [];

    this.CurrentSkaterDataSource = blank_array;
    this.current_skater_extra_data = { "segment_rank": "", "TES": "", "PCS": "", "score": "", "segment_score": "", "category_rank": "", "category_score": "", "finalize": false, "total_offcials": "", "official_submitted": 0 };




    var chat_room: any = {};

    chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;;
    chat_room["method_name"] = 'CURRENT_SKATER_DATA';
    chat_room["data"] = { 'official_assignment_id': this.activatedRoute.snapshot.params.assignmentid };

    this._chatService.broadcast(chat_room);




  }
}



@Component({
  selector: 'monitor_official_summary1',
  templateUrl: './monitor_official_summary.html',
  styleUrls:
    ['./monitor_official_summary.css']
})
export class MonitorOfficialSummary1 implements OnInit {

  data: any;
  on_join_data: any = {};
  skater_data: any = {};

  program_componentValue: any = [];

  refPosition: any = [0];
  refGoeCount: any = [0];
  refPcCount: any = [0];
  refereeStatus: any = ['progress'];

  judgePosition: any = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  judgeGoeCount: any = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  judgePcCount: any = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  judgeStatus: any = ['progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress'];

  users: any = [];
  judgeOnline: any = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  refOnline: any = [0];

  dataSource: any = 0;

  constructor(private languageSelector: LanguageSelector, private _chatService: ChatService, private activatedRoute: ActivatedRoute) {


    this._chatService.onBroadcastResp()
      .subscribe(data => {
        var incoming_data = JSON.parse(JSON.stringify(data));

        //console.log("in broadcast response", data)

        switch (incoming_data.method_name) {

          case "SEGSTART":
            console.log("Segment start");

            // if (this.activatedRoute.snapshot.params.segmentid == data.room) {

            //   // var chat_room: any = {};
            //   // chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;

            //   // chat_room["method_name"] = 'NEWCLIENT';
            //   // chat_room["data"] = { 'official_assignment_id': '' };

            //   // //this._chatService.createRoom(chat_room);
            //   // this._chatService.broadcast(chat_room);

            // }


            break;

          case "JOINING_ROOM":
            var temp2 = JSON.parse(JSON.stringify(data))

            var required_data = temp2["returnObj"];
            console.log("JOINING_ROOM", required_data);

            var dataObj = JSON.parse(JSON.stringify(required_data));


            console.log("returned data = " + dataObj.inroom);


            if (dataObj.inroom) {
              console.log("room exists and you're in it and here's your data objects!")
              console.log(dataObj.initializationObj);
              console.log(dataObj.chatHistoryObj);


              this.on_join_data = JSON.parse(dataObj.initializationObj)

              var program_component: any;

              this.program_componentValue = [];
              //Program Component, check the data accroding to length
              program_component = this.on_join_data.segmentid.definitionid.programcomponents;
              for (var i = 0; i < program_component.length; i++) {

                this.program_componentValue.push(-1);
              }


              // Finding on positions judge are assigned


              var officials = this.on_join_data.segmentid.official.filter((record: any) => record.role == "469C7509-FEA6-EC11-983F-00224825E0C8");

              if (officials.length > 0) {
                // console.log("officials",officials);

                for (let i = 0; i < officials.length; i++) {
                  this.judgePosition[officials[i]["position"] - 1] = 1;

                }
              }

              // Finding on positions referees are assigned

              var officials = this.on_join_data.segmentid.official.filter((record: any) => record.role == "9A8F5827-FEA6-EC11-983F-00224825E0C8");

              if (officials.length > 0) {
                // console.log("officials",officials);

                for (let i = 0; i < officials.length; i++) {
                  this.refPosition[0] = 1;

                }
              }

            }

            break;

          case "JUDGEGOE":
            var temp = JSON.parse(JSON.stringify(data))
            console.log("JUDGEGOE", temp);

            console.log("JUDGEGOE123456", this.on_join_data);

            if (this.on_join_data.hasOwnProperty('segmentid')) {
              var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["official_assignment_id"]);

              console.log("official data", official_data);

              if (official_data.length > 0) {
                this.judgeGoeCount[official_data[0].position - 1] = temp["data"]["goe_count"];
              }
              else {
                console.log("******** Official table has no record");

              }

            }


            break;

          case "JUDGEPC":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("JUDGEPC", temp);

            if (this.on_join_data.hasOwnProperty('segmentid')) {
              var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["req_data"]["officialassignmentid"]);

              console.log("official data", official_data);
              if (official_data.length > 0) {
                this.judgePcCount[official_data[0].position - 1] = temp["data"]["pc_count"];
              }
              else {
                console.log("******** Official table has no record");

              }
            }



            break;

          case "LOAD_SKATER":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("LOAD_SKATER", temp);



            for (let i = 0; i < this.program_componentValue.length; i++) {
              this.program_componentValue[i] = -1;
            }

            this.skater_data = temp["data"];

            this.judgeGoeCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.judgePcCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.judgeStatus = ['progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress'];

            this.refGoeCount = [0];
            this.refPcCount = [0];
            this.refereeStatus = ['progress'];
            this.dataSource = 0;




            this.data = {


              "programComponent": this.program_componentValue,
              "skater_data": this.skater_data,
              "room": this.activatedRoute.snapshot.params.segmentid,
              "judgeGoeCount": this.judgeGoeCount,
              "judgePcCount": this.judgePcCount,
              "dataSource": this.dataSource,
              "judgeStatus": this.judgeStatus,
              "judgePosition": this.judgePosition,
              "judgeOnline": this.judgeOnline,
              "refPosition": this.refPosition,
              "refGoeCount": this.refGoeCount,
              "refPcCount": this.refPcCount,
              "refereeStatus": this.refereeStatus,
              "refOnline": this.refOnline
            };

            break;


          case "JUDGESTATUS":
            var temp = JSON.parse(JSON.stringify(data))
            console.log("JUDGESTATUS", temp);

            if (this.on_join_data.hasOwnProperty('segmentid')) {

              var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["official_assignment_id"]);

              console.log("official data", official_data);
              if (official_data.length > 0) {
                if (temp["data"]["competitorentryid"] == this.skater_data.competitorentryid) {
                  if (temp["data"]["statusmessage"] == "Submit") {
                    this.judgeStatus[official_data[0].position - 1] = "completed";
                  }
                }

              }
              else {
                console.log("******** Official table has no record");

              }

            }


            break;



          case "REFEREESTATUS":
            var temp = JSON.parse(JSON.stringify(data))
            console.log("REFEREESTATUS", temp);


            // var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["data"]["official_assignment_id"]);

            // console.log("official data", official_data);
            // if (official_data.length > 0) {
            //   if (temp["data"]["data"]["competitorentryid"] == this.skater_data.competitorentryid) {
            //     if (temp["data"]["data"]["statusmessage"] == "Submit") {
            //       this.judgeStatus[official_data[0].position - 1] = "completed";
            //     }
            //   }

            // }
            // else {
            //   console.log("******** Official table has no record");

            // }

            break;

          case "REFGOE":
            var temp = JSON.parse(JSON.stringify(data))

            if (this.on_join_data.hasOwnProperty('segmentid')) {

              var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["officialassignmentid"]);

              console.log("official data", official_data);
              if (official_data.length > 0) {
                this.refGoeCount[0] = temp["data"]["goe_count"];
              }
              else {
                console.log("******** Official table has no record");

              }


            }



            break;


          case "REFPC":
            var temp = JSON.parse(JSON.stringify(data))


            if (this.on_join_data.hasOwnProperty('segmentid')) {
              var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["req_data"]["officialassignmentid"]);

              console.log("official data", official_data);
              if (official_data.length > 0) {
                this.refPcCount[0] = temp["data"]["pc_count"];
              }
              else {
                console.log("******** Official table has no record");

              }
            }




            break;

          case "SCORESKATE":

            var temp = JSON.parse(JSON.stringify(data))

            if (this.on_join_data.hasOwnProperty('segmentid')) {

              var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["official_assignment_id"]);

              console.log("official data", official_data);
              if (official_data.length > 0) {
                if (temp["data"]["competitorentryid"] == this.skater_data.competitorentryid) {
                  if (temp["data"]["statusmessage"] == "SCORESKATER") {
                    this.refereeStatus[0] = "completed";
                  }
                }

              }
              else {
                console.log("******** Official table has no record");

              }

            }



            break;


          case "USER_JOINED":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("USER_JOINED", temp, this.on_join_data);

            if (temp.hasOwnProperty('history')) {
              console.log("from history")

              this.users.push([temp["data"]["socket_id"], temp["data"]["official_assignment_id"]]);
              // console.log("USERS ARRAY",this.users);


              var user_available = false;

              var users_data = [];

              for (let i = 0; i < this.users.length; i++) {
                if (this.users[i][1] == temp["data"]["official_assignment_id"]) {
                  this.users[i][0] = temp["data"]["socket_id"];
                  available = true;
                }
                users_data.push(this.users[i][1])

              }

              if (user_available == false) {
                this.users.push([temp["data"]["socket_id"], temp["data"]["official_assignment_id"]]);
              }

              // logic for removing repeating data

              var unique_user: any = users_data.filter(function (elem, index, self) {
                return index === self.indexOf(elem);
              });

              console.log("unique users", unique_user);




              var new_array = [];
              for (let k = 0; k < unique_user.length; k++) {

                var tem = this.users.filter((record: any) => record[1] == unique_user[k]);

                console.log("user data", tem);

                new_array.push([tem[0][0], unique_user[k]])


              }

              this.users = new_array;

              if (this.on_join_data.hasOwnProperty('segmentid')) {

                var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["official_assignment_id"]);

                console.log("official data", official_data);
                if (official_data.length > 0) {
                  if (official_data[0]["role"] == "469C7509-FEA6-EC11-983F-00224825E0C8") {
                    this.judgeOnline[official_data[0].position - 1] = 1;
                  }

                  if (official_data[0]["role"] == "9A8F5827-FEA6-EC11-983F-00224825E0C8") {
                    this.refOnline[0] = 1;
                  }
                }

              }


              //console.log(" 777777777777777 new array 777777777777777",new_array)
              console.log("777777777777777 Users array 777777777777777", this.users);
            }
            else {

              this.users.push([temp["send"]["socket_id"], temp["send"]["official_assignment_id"]]);


              var available = false;
              var users_data_2 = [];

              for (let i = 0; i < this.users.length; i++) {
                if (this.users[i][1] == temp["send"]["official_assignment_id"]) {
                  this.users[i][0] = temp["send"]["socket_id"];
                  available = true;
                }
                users_data_2.push(this.users[i][1])

              }

              if (available == false) {
                this.users.push([temp["send"]["socket_id"], temp["senc"]["official_assignment_id"]]);
              }




              // logic for removing repeating data

              var unique_user: any = users_data_2.filter(function (elem, index, self) {
                return index === self.indexOf(elem);
              });

              console.log("unique users", unique_user);




              var new_array = [];
              for (let k = 0; k < unique_user.length; k++) {

                var tem = this.users.filter((record: any) => record[1] == unique_user[k]);

                console.log("user data", tem);

                new_array.push([tem[0][0], unique_user[k]])


              }

              this.users = new_array;


              if (this.on_join_data.hasOwnProperty('segmentid')) {

                var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["send"]["official_assignment_id"]);

                console.log("official data", official_data);
                if (official_data.length > 0) {
                  if (official_data[0]["role"] == "469C7509-FEA6-EC11-983F-00224825E0C8") {
                    this.judgeOnline[official_data[0].position - 1] = 1;
                  }

                  if (official_data[0]["role"] == "9A8F5827-FEA6-EC11-983F-00224825E0C8") {
                    this.refOnline[0] = 1;
                  }

                }

              }

            }


            console.log("44444444444 Users array 4444444444", this.users);


            break;


          case "USER_DISCONNECTED":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("USER_DISCONNECTED", temp);

            if (temp.hasOwnProperty('history')) {

              var users_data = [];

              for (let i = 0; i < this.users.length; i++) {
                if (this.users[i][0] != temp["data"]["id"]) {
                  users_data.push(this.users[i])
                }
                else {
                  if (this.on_join_data.hasOwnProperty('segmentid')) {

                    var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == this.users[i][1]);

                    console.log("official data", official_data);
                    if (official_data.length > 0) {
                      if (official_data[0]["role"] == "469C7509-FEA6-EC11-983F-00224825E0C8") {
                        this.judgeOnline[official_data[0].position - 1] = 0;

                      }

                      if (official_data[0]["role"] == "9A8F5827-FEA6-EC11-983F-00224825E0C8") {
                        this.refOnline[0] = 0;
                      }

                    }

                  }
                }

              }
              this.users = users_data;
              console.log("from history", this.users)


            }
            else {
              console.log("No history")

              var users_data = [];

              for (let i = 0; i < this.users.length; i++) {
                if (this.users[i][0] != temp["id"]) {
                  users_data.push(this.users[i])
                }
                else {
                  if (this.on_join_data.hasOwnProperty('segmentid')) {

                    var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == this.users[i][1]);

                    console.log("official data", official_data);
                    if (official_data.length > 0) {
                      if (official_data[0]["role"] == "469C7509-FEA6-EC11-983F-00224825E0C8") {
                        this.judgeOnline[official_data[0].position - 1] = 0;

                      }
                      if (official_data[0]["role"] == "9A8F5827-FEA6-EC11-983F-00224825E0C8") {
                        this.refOnline[0] = 0;
                      }


                    }

                  }
                }

              }
              this.users = users_data;

            }


            this.data["judgeOnline"] = this.judgeOnline;
            console.log("users data after disconnect", this.users);


            break;


          case "NEWELM":


            var temp = JSON.parse(JSON.stringify(data))
            console.log("new element added", temp);

            this.dataSource = this.dataSource + 1;

            this.data["dataSource"] = this.data["dataSource"] + 1;

            console.log("new data ______________", this.data["dataSource"])

            break;

          case "DELELM":


            var temp = JSON.parse(JSON.stringify(data))
            console.log(" element deleted", temp);

            this.dataSource = this.dataSource - 1;
            this.data["dataSource"] = this.dataSource;
            break;


          case 'GOE_COUNT_UPDATE':

            var temp = JSON.parse(JSON.stringify(data))
            console.log("GOE_COUNT_UPDATE", temp);


            if (this.on_join_data.hasOwnProperty('segmentid')) {

              var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["data"]["assignmentid"]);

              console.log("official data", official_data);
              if (official_data.length > 0) {
                this.judgeGoeCount[official_data[0].position - 1] = temp["data"]["data"]["count"];
              }
              else {
                console.log("******** Official table has no record");

              }

            }

            break;

          case 'REF_GOE_COUNT_UPDATE':

            var temp = JSON.parse(JSON.stringify(data))
            console.log("REF_GOE_COUNT_UPDATE", temp);


            if (this.on_join_data.hasOwnProperty('segmentid')) {

              var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["data"]["assignmentid"]);

              console.log("official data", official_data);
              if (official_data.length > 0) {
                this.refGoeCount[0] = temp["data"]["data"]["count"];
              }
              else {
                console.log("******** Official table has no record");

              }

            }


            break;



          case "STOPSKATER":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("STOPSKATER", temp);

            for (let i = 0; i < this.program_componentValue.length; i++) {
              this.program_componentValue[i] = -1;
            }

            this.skater_data = {};

            this.judgeGoeCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.judgePcCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.judgeStatus = ['progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress'];

            this.refGoeCount = [0];
            this.refPcCount = [0];
            this.refereeStatus = ['progress'];
            this.dataSource = 0;




            this.data = {


              "programComponent": this.program_componentValue,
              "skater_data": this.skater_data,
              "room": this.activatedRoute.snapshot.params.segmentid,
              "judgeGoeCount": this.judgeGoeCount,
              "judgePcCount": this.judgePcCount,
              "dataSource": this.dataSource,
              "judgeStatus": this.judgeStatus,
              "judgePosition": this.judgePosition,
              "judgeOnline": this.judgeOnline,
              "refPosition": this.refPosition,
              "refGoeCount": this.refGoeCount,
              "refPcCount": this.refPcCount,
              "refereeStatus": this.refereeStatus,
              "refOnline": this.refOnline
            };


            break;




          default:
            //console.log('you shouldn\'t see this');
            break;
        }

      });




    this.data = {


      "programComponent": this.program_componentValue,
      "skater_data": this.skater_data,
      "room": this.activatedRoute.snapshot.params.segmentid,
      "judgeGoeCount": this.judgeGoeCount,
      "judgePcCount": this.judgePcCount,
      "dataSource": this.dataSource,
      "judgeStatus": this.judgeStatus,
      "judgePosition": this.judgePosition,
      "judgeOnline": this.judgeOnline,
      "refPosition": this.refPosition,
      "refGoeCount": this.refGoeCount,
      "refPcCount": this.refPcCount,
      "refereeStatus": this.refereeStatus,
      "refOnline": this.refOnline
    };



  }

  ngOnInit() {

    var chat_room: any = {};
    chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;

    chat_room["method_name"] = 'NEWCLIENT';
    chat_room["data"] = { 'official_assignment_id': '234' };

    //this._chatService.createRoom(chat_room);
    this._chatService.broadcast(chat_room);

  }

  ngOnChanges() {
  }



}

