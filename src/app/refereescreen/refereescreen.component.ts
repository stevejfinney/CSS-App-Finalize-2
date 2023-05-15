import { Component, OnInit, Inject, Input, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
//import json_test_data from '../../../data.json';
import { LanguageSelector } from '../api.languageselector';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChatService } from '../chat_service';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from '../api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
//import { JudgeScreenProgramComponent } from '../judgescreen/judgescreen.component';

export interface Element {
  index: number;
  elementCode: string;
  refGOEValue: number;
  action: string;
  skateelementid: any;
}

@Component({
  selector: 'app-refereescreen',
  templateUrl: './refereescreen.component.html',
  styleUrls: ['./refereescreen.component.css']
})
export class RefereescreenComponent implements OnInit {

  official_role_id: any = "9A8F5827-FEA6-EC11-983F-00224825E0C8";
  clip: any;
  on_join_data: any = {};
  user_access: any = false;
  video_feed:any = false;
  locator_url:any = "";
  skater_data: any = {};

  wbp_failed_index: any = [];
  review_index: any = [];
  submit: any = false;
  notes: any = [];

  //Declaration of the variables
  //elements = json_test_data.segmentid.definitionid.sc_elementconfiguration.elements;
  elements: any = [];

  violationValueNew: any = [];
  refereeViolationValueNew: any = [];
  program_componentValue: any = [];
  dio_finalized: any = false;
  finalize_flash: any = false;

  judgeGoeCount: any = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  judgePcCount: any = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  judgePosition: any = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  judgeStatus: any = ['progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress'];
  judgeOnline: any = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  refOnline: any = [0];
  refPosition: any = [0];

  refGoeCount: any = [0];
  refPcCount: any = [0];
  refereeStatus: any = ['progress'];



  users: any = [];

  //Input data
  @Input() violationValue: any = this.violationValueNew;
  @Input() refereeViolationValue: any = this.refereeViolationValueNew;
  //@Input() component: any = 1;

  language!: string;
  //selectedRow: any;

  elements_array = <any>[];

  goeValue: any[] = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];

  constructor(public dialog: MatDialog, private languageSelector: LanguageSelector, private _chatService: ChatService, private activatedRoute: ActivatedRoute, private snackBar: MatSnackBar, public apiService: ApiService, private _router: Router) {


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
                horizontalPosition: "center",
                panelClass: ['green-snackbar']
              });

              // var chat_room: any = {};
              // chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;

              // chat_room["competitorentryid"] = "29de489e-a2a8-4885-b844-12e63fa9c03f";


              // this._chatService.joinRoom(chat_room);

              // var chat_room: any = {};
              // chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;;

              // chat_room["method_name"] = 'NEWCLIENT';
              // chat_room["data"] = { 'official_assignment_id': this.activatedRoute.snapshot.params.assignmentid };

              // //this._chatService.createRoom(chat_room);
              // this._chatService.broadcast(chat_room);


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
              this._chatService.broadcast(chat_room);

            }
            break;

          case "NEWELM":


            var temp = JSON.parse(JSON.stringify(data))
            console.log("new element added", temp);


            //console.log("datasource",this.dataSource)

            // code generating based on level and modifier 

            var whole_string_data = "";

            if (temp["data"]["input_data"].hasOwnProperty('elements') == true) {
              for (let x = 0; x < temp["data"]["input_data"]["elements"].length; x++) {

                var element_codes = this.on_join_data.segmentid.definitionid.sc_elementconfiguration.elements.filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == temp["data"]["createdElement"]["element_definitions"][x]);

                console.log("element code data", element_codes);


                temp["data"]["input_data"]["elements"][x]["famtype_sc_levelposition"] = element_codes[0]["sc_skatingelementdefinitionid"]["famtype_sc_levelposition"];
                temp["data"]["input_data"]["elements"][x]["fam_sc_code"] = element_codes[0]["sc_skatingelementdefinitionid"]["fam_sc_code"];
                temp["data"]["input_data"]["elements"][x]["sc_level"] = element_codes[0]["sc_skatingelementdefinitionid"]["sc_level"];

                var individual_string = "";

                if (temp["data"]["input_data"]["elements"][x]['Pattern_dance_code'] != "") {
                  individual_string = individual_string + temp["data"]["input_data"]["elements"][x]['Pattern_dance_code'];

                }

                if (temp["data"]["input_data"]["elements"][x]['Flying'] == true) {
                  individual_string = individual_string + "F";

                }

                if (temp["data"]["input_data"]["elements"][x]['Change'] == true) {
                  individual_string = individual_string + "C";

                }


                if (temp["data"]["input_data"]["elements"][x]['Element_code'] != "") {

                  if (element_codes[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == '7BFAB449-4C8B-EB11-A812-000D3A8DCA86' || element_codes[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == 'ABC41C05-4730-ED11-9DB1-0022482D319B') {
                    individual_string = individual_string + temp["data"]["input_data"]["elements"][x]['Element_code'];
                  }
                  else {
                    individual_string = individual_string + temp["data"]["input_data"]["elements"][x]["fam_sc_code"];
                  }


                }


                if (temp["data"]["input_data"]["elements"][x]['Synchro_element_suffix'].length >= 1) {
                  var tem1 = "";
                  for (let a = 0; a < temp["data"]["input_data"]["elements"][x]['Synchro_element_suffix'].length; a++) {
                    tem1 = tem1 + temp["data"]["input_data"]["elements"][x]['Synchro_element_suffix'][a];
                  }
                  individual_string = individual_string + "+" + tem1;

                }

                if (temp["data"]["input_data"]["elements"][x]['Throw'] == true) {
                  individual_string = individual_string + "Th";

                }

                if (temp["data"]["input_data"]["elements"][x]['Edge'] != "") {
                  individual_string = individual_string + temp["data"]["input_data"]["elements"][x]['Edge'];

                }

                if (temp["data"]["input_data"]["elements"][x]['Rotation'] != "") {
                  individual_string = individual_string + temp["data"]["input_data"]["elements"][x]['Rotation'];

                }

                if (temp["data"]["input_data"]["elements"][x]['Synchro'] != "") {
                  individual_string = individual_string + temp["data"]["input_data"]["elements"][x]['Synchro'];

                }

                if (temp["data"]["input_data"]["elements"][x]['invalid'] == true) {
                  individual_string = individual_string + "*";

                }

                if (temp["data"]["input_data"]["elements"][x]['notes'].length >= 1) {

                  for (let a = 0; a < temp["data"]["input_data"]["elements"][x]['notes'].length; a++) {

                    // individual_string = individual_string + "[" + this.structure_input_data["elements"][x]['notes'][a] + "]";
                    if (a == 0) {
                      individual_string = individual_string + "+" + temp["data"]["input_data"]["elements"][x]['notes'][a];

                    }
                    else {
                      individual_string = individual_string + temp["data"]["input_data"]["elements"][x]['notes'][a];

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

              }

              if (temp["data"]["input_data"]["rep_jump"] == true) {
                whole_string_data = whole_string_data + "+REP";
              }
            }

            console.log("whole string ready for use", whole_string_data);

            // old code


            if (temp["data"]["createdElement"]["position"] > this.dataSource.length) {
              console.log("data in add coming from server")

              var elements_array = <any>[];
              var element_object = <any>{};

              for (let k = 0; k < this.dataSource.length; k++) {

                element_object['index'] = elements_array.length + 1;
                element_object['skateelementid'] = this.dataSource[k].skateelementid;
                element_object['elementCode'] = this.dataSource[k].elementCode;

                element_object['refGOEValue'] = this.dataSource[k].refGOEValue;
                element_object['status'] = this.dataSource[k].status;
                element_object['elmclip'] = this.dataSource[k].elmclip;
                element_object['structure_input_data'] = this.dataSource[k].structure_input_data;

                elements_array.push(element_object);
                element_object = {};


              }

              element_object['index'] = elements_array.length + 1;
              element_object['skateelementid'] = temp["data"]["createdElement"]["newid"];
              element_object['elementCode'] = whole_string_data;

              element_object['refGOEValue'] = "";
              element_object['status'] = "completed";
              element_object['elmclip'] = "";
              element_object['structure_input_data'] = temp["data"]["input_data"];

              elements_array.push(element_object);
              element_object = {};

              this.dataSource = elements_array;

            }
            else {
              if (this.dataSource[temp["data"]["createdElement"]["position"] - 1]["status"] == "completed") {
                console.log("data in add coming for insert before but from server")

                var elements_array = <any>[];
                var element_object = <any>{};

                for (let k = 0; k < this.dataSource.length; k++) {

                  if (k < temp["data"]["createdElement"]["position"] - 1) {

                    element_object['index'] = elements_array.length + 1;
                    element_object['skateelementid'] = this.dataSource[k]["skateelementid"];
                    element_object['elementCode'] = this.dataSource[k]["elementCode"];
                    element_object['refGOEValue'] = this.dataSource[k]["refGOEValue"];
                    element_object['status'] = this.dataSource[k]["status"];
                    element_object['elmclip'] = this.dataSource[k]["elmclip"];
                    element_object['structure_input_data'] = this.dataSource[k].structure_input_data;

                    elements_array.push(element_object);
                    element_object = {};
                  }
                  else if (k == temp["data"]["createdElement"]["position"] - 1) {
                    element_object['index'] = elements_array.length + 1;
                    element_object['skateelementid'] = temp["data"]["createdElement"]["newid"];
                    element_object['elementCode'] = whole_string_data;
                    element_object['refGOEValue'] = "";
                    element_object['status'] = "completed";
                    element_object['elmclip'] = "";
                    element_object['structure_input_data'] = temp["data"]["input_data"]


                    elements_array.push(element_object);
                    element_object = {};

                    element_object['index'] = elements_array.length + 1;
                    element_object['skateelementid'] = this.dataSource[k]["skateelementid"];
                    element_object['elementCode'] = this.dataSource[k]["elementCode"];
                    element_object['refGOEValue'] = this.dataSource[k]["refGOEValue"];
                    element_object['status'] = this.dataSource[k]["status"];
                    element_object['elmclip'] = this.dataSource[k]["elmclip"];
                    element_object['structure_input_data'] = this.dataSource[k].structure_input_data;


                    elements_array.push(element_object);
                    element_object = {};

                  }
                  else {
                    element_object['index'] = elements_array.length + 1;
                    element_object['skateelementid'] = this.dataSource[k]["skateelementid"];
                    element_object['elementCode'] = this.dataSource[k]["elementCode"];
                    element_object['refGOEValue'] = this.dataSource[k]["refGOEValue"];
                    element_object['status'] = this.dataSource[k]["status"];
                    element_object['elmclip'] = this.dataSource[k]["elmclip"];
                    element_object['structure_input_data'] = this.dataSource[k].structure_input_data;


                    elements_array.push(element_object);
                    element_object = {};
                  }


                }



                this.dataSource = elements_array;


              }
              if (this.dataSource[temp["data"]["createdElement"]["position"] - 1]["status"] == "Active") {
                console.log("data in add coming from local")

                this.dataSource[temp["data"]["createdElement"]["position"] - 1]["skateelementid"] = temp["data"]["createdElement"]["newid"]
                this.dataSource[temp["data"]["createdElement"]["position"] - 1]['elementCode'] = whole_string_data;

                this.dataSource[temp["data"]["createdElement"]["position"] - 1]['structure_input_data'] = temp["data"]["input_data"];
                //element_object['structure_input_data'] = temp["data"]["input_data"]



                console.log("datasource before new elm", JSON.parse(JSON.stringify(this.dataSource)));

                // logic for sending goe values which were remain pending due to in process element


                for (let i = 0; i < this.dataSource.length; i++) {

                  if (this.dataSource[i]['status'] == "Active" && this.dataSource[i]['refGOEValue'] !== "" && this.dataSource[i]["skateelementid"] != "") {
                    // var goeOutput: any = {};

                    // goeOutput['skateelementid'] = this.dataSource[i]["skateelementid"];
                    // goeOutput['officialassignmentid'] =this.activatedRoute.snapshot.params.assignmentid;
                    // goeOutput['refGOEValue'] = this.dataSource[i]['refGOEValue'];
                    // console.log("Add GOE from Referee to Element", goeOutput);

                    var goeOutput: any = {};
                    goeOutput["competitorentryid"] = this.skater_data["competitorentryid"];
                    goeOutput["method_name"] = "REFGOE";
                    goeOutput["room"] = this.activatedRoute.snapshot.params.segmentid;

                    // number of goe values added
                    var refgoeCount: any = 0;
                    for (let i = 0; i < this.dataSource.length; i++) {

                      if (this.dataSource[i].refGOEValue !== "") {
                        refgoeCount++;
                      }
                    }

                    console.log("count", refgoeCount)


                    goeOutput["goe_count"] = refgoeCount;


                    var goe_data: any = {};
                    goe_data["skateelementid"] = this.dataSource[i]["skateelementid"];
                    goe_data["officialassignmentid"] = this.activatedRoute.snapshot.params.assignmentid;
                    goe_data['goevalue'] = this.dataSource[i]['refGOEValue'];


                    goeOutput["data"] = goe_data;

                    this._chatService.broadcast(goeOutput);
                  }

                }

                this.dataSource[temp["data"]["createdElement"]["position"] - 1]['status'] = "completed";



              }
            }
            //dio_element_added = true;




            console.log("datasource after", JSON.parse(JSON.stringify(this.dataSource)));

            this.newData["dataSource"] = this.dataSource;


            break;

          case "CHGELM":


            var temp = JSON.parse(JSON.stringify(data))

            console.log("element chaged", temp)

            this.dataSource[temp["data"]["position"] - 1]["skateelementid"] = temp["data"]["newid"]

            // console.log("datasource",this.dataSource)

            var whole_string_data = "";

            if (temp["data"]["input_data"].hasOwnProperty('elements') == true) {
              for (let x = 0; x < temp["data"]["input_data"]["elements"].length; x++) {

                var element_codes = this.on_join_data.segmentid.definitionid.sc_elementconfiguration.elements.filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == temp["data"]["element_definitions"][x]);

                console.log("element code data", element_codes);


                temp["data"]["input_data"]["elements"][x]["famtype_sc_levelposition"] = element_codes[0]["sc_skatingelementdefinitionid"]["famtype_sc_levelposition"];
                temp["data"]["input_data"]["elements"][x]["fam_sc_code"] = element_codes[0]["sc_skatingelementdefinitionid"]["fam_sc_code"];
                temp["data"]["input_data"]["elements"][x]["sc_level"] = element_codes[0]["sc_skatingelementdefinitionid"]["sc_level"];

                var individual_string = "";

                if (temp["data"]["input_data"]["elements"][x]['Pattern_dance_code'] != "") {
                  individual_string = individual_string + temp["data"]["input_data"]["elements"][x]['Pattern_dance_code'];

                }

                if (temp["data"]["input_data"]["elements"][x]['Flying'] == true) {
                  individual_string = individual_string + "F";

                }

                if (temp["data"]["input_data"]["elements"][x]['Change'] == true) {
                  individual_string = individual_string + "C";

                }


                if (temp["data"]["input_data"]["elements"][x]['Element_code'] != "") {

                  if (element_codes[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == '7BFAB449-4C8B-EB11-A812-000D3A8DCA86' || element_codes[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == 'ABC41C05-4730-ED11-9DB1-0022482D319B') {
                    individual_string = individual_string + temp["data"]["input_data"]["elements"][x]['Element_code'];
                  }
                  else {
                    individual_string = individual_string + temp["data"]["input_data"]["elements"][x]["fam_sc_code"];
                  }


                }


                if (temp["data"]["input_data"]["elements"][x]['Synchro_element_suffix'].length >= 1) {
                  var tem1 = "";
                  for (let a = 0; a < temp["data"]["input_data"]["elements"][x]['Synchro_element_suffix'].length; a++) {
                    tem1 = tem1 + temp["data"]["input_data"]["elements"][x]['Synchro_element_suffix'][a];
                  }
                  individual_string = individual_string + "+" + tem1;

                }

                if (temp["data"]["input_data"]["elements"][x]['Throw'] == true) {
                  individual_string = individual_string + "Th";

                }

                if (temp["data"]["input_data"]["elements"][x]['Edge'] != "") {
                  individual_string = individual_string + temp["data"]["input_data"]["elements"][x]['Edge'];

                }

                if (temp["data"]["input_data"]["elements"][x]['Rotation'] != "") {
                  individual_string = individual_string + temp["data"]["input_data"]["elements"][x]['Rotation'];

                }

                if (temp["data"]["input_data"]["elements"][x]['Synchro'] != "") {
                  individual_string = individual_string + temp["data"]["input_data"]["elements"][x]['Synchro'];

                }

                if (temp["data"]["input_data"]["elements"][x]['invalid'] == true) {
                  individual_string = individual_string + "*";

                }

                if (temp["data"]["input_data"]["elements"][x]['notes'].length >= 1) {

                  for (let a = 0; a < temp["data"]["input_data"]["elements"][x]['notes'].length; a++) {

                    // individual_string = individual_string + "[" + this.structure_input_data["elements"][x]['notes'][a] + "]";
                    if (a == 0) {
                      individual_string = individual_string + "+" + temp["data"]["input_data"]["elements"][x]['notes'][a];

                    }
                    else {
                      individual_string = individual_string + temp["data"]["input_data"]["elements"][x]['notes'][a];

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

              }

              if (temp["data"]["input_data"]["rep_jump"] == true) {
                whole_string_data = whole_string_data + "+REP";
              }
            }

            console.log("whole string ready for use", whole_string_data);


            // old code 


            this.dataSource[temp["data"]["position"] - 1]['elementCode'] = whole_string_data;

            this.dataSource[temp["data"]["position"] - 1]['structure_input_data'] = temp["data"]["input_data"];

            this.dataSource[temp["data"]["position"] - 1]['status'] = "completed";

            console.log("datasource after", JSON.parse(JSON.stringify(this.dataSource)));

            this.newData["dataSource"] = this.dataSource;

            // highlighting edited element

            if (this.wbp_failed_index.includes(temp["data"]["position"]) == false) {
              this.wbp_failed_index.push(temp["data"]["position"]);
            }

            break;

          case "DELELM":


            var temp = JSON.parse(JSON.stringify(data))
            console.log("element deleted", temp);

            var modified_elements = <any>[];

            for (let b = 0; b < this.dataSource.length; b++) {

              //console.log("lopppp", b)
              if (b < temp["data"]["position"] - 1) {

                modified_elements.push(this.dataSource[b]);
              }

              else if (b == temp["data"]["position"] - 1) {

                //console.log("else if deleted")

              }
              else {
                modified_elements.push(this.dataSource[b]);

              }
            }

            for (let c = 0; c < modified_elements.length; c++) {
              modified_elements[c]['index'] = c + 1;
            }

            this.dataSource = modified_elements;

            console.log("datasource after", this.dataSource);


            this.newData["dataSource"] = this.dataSource;

            // event for informing other user that is goe count is affected do to this ?

            var goe_count_output: any = {};
            goe_count_output["competitorentryid"] = this.skater_data["competitorentryid"];
            goe_count_output["method_name"] = "REF_GOE_COUNT_UPDATE";
            goe_count_output["room"] = this.activatedRoute.snapshot.params.segmentid;


            var count = 0;
            for (let i = 0; i < this.dataSource.length; i++) {

              if (this.dataSource[i].refGOEValue !== '' && this.dataSource[i]["status"] == 'completed') {
                count++;
              }

            }

            var goe_data: any = {};
            goe_data["assignmentid"] = this.activatedRoute.snapshot.params.assignmentid;
            goe_data["count"] = count;
            //clip_code_data["insert"] = false;


            goe_count_output["data"] = goe_data;

            this._chatService.broadcast(goe_count_output);

            break;


          case "DIOSTATUS":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("Status Update", temp);

            if (temp["data"]["data"]["statusmessage"] == "WBP") {
              for (let k = 0; k < temp["data"]["data"]["changed_index"].length; k++) {
                if (this.wbp_failed_index.includes(temp["data"]["data"]["changed_index"][k]) == false) {
                  this.wbp_failed_index.push(temp["data"]["data"]["changed_index"][k]);
                }
              }
              //this.wbp_failed_index = temp["data"]["data"]["changed_index"];
            }

            console.log("this wbp index", this.wbp_failed_index);

            if (temp["data"]["data"]["statusmessage"] == "finalize") {
              this.dio_finalized = true;
            }

            break;

          case "JUDGEPC":
            var temp = JSON.parse(JSON.stringify(data))
            console.log("JUDGEPC", temp);

            var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["req_data"]["officialassignmentid"]);

            console.log("official data", official_data);
            if (official_data.length > 0) {
              this.judgePcCount[official_data[0].position - 1] = temp["data"]["pc_count"];
            }
            else {
              console.log("******** Official table has no record");

            }

            break;

          case "JUDGEGOE":
            var temp = JSON.parse(JSON.stringify(data))
            console.log("JUDGEGOE", temp);

            var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["official_assignment_id"]);

            console.log("official data", official_data);
            if (official_data.length > 0) {
              this.judgeGoeCount[official_data[0].position - 1] = temp["data"]["goe_count"];
            }
            else {
              console.log("******** Official table has no record");

            }


            break;

          case "JUDGESTATUS":
            var temp = JSON.parse(JSON.stringify(data))
            console.log("JUDGESTATUS", temp);


            var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["data"]["official_assignment_id"]);

            console.log("official data", official_data);
            if (official_data.length > 0) {
              if (temp["data"]["data"]["competitorentryid"] == this.skater_data.competitorentryid) {
                if (temp["data"]["data"]["statusmessage"] == "Submit") {

                  if (temp["data"]["data"]["submit"] == true) {
                    this.judgeStatus[official_data[0].position - 1] = "completed";
                  }
                  else {
                    this.judgeStatus[official_data[0].position - 1] = "progress";
                  }



                  var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.role == '469C7509-FEA6-EC11-983F-00224825E0C8' || record.role == '9A8F5827-FEA6-EC11-983F-00224825E0C8');

                  console.log("official data", official_data, official_data.length);


                  var possible_official_submitted = 0;
                  console.log("1223", this.judgePosition)

                  console.log("1223", this.judgeStatus)

                  for (let k = 0; k < this.judgeStatus.length; k++) {
                    if (this.judgePosition[k] == 1) {
                      if (this.judgeStatus[k] == "completed") {
                        possible_official_submitted = possible_official_submitted + 1;
                      }
                    }
                  }

                  for (let k = 0; k < this.refereeStatus.length; k++) {
                    if (this.refPosition[k] == 1) {
                      if (this.refereeStatus[k] == "completed") {
                        possible_official_submitted = possible_official_submitted + 1;
                      }
                    }
                  }

                  // compare variables officials vs submitted

                  if (official_data.length == possible_official_submitted && official_data.length != 0) {
                    console.log("Button should be flashing ***********************************************");
                    this.finalize_flash = true;


                  }
                  else {
                    this.finalize_flash = false;
                  }


                  console.log("submitted count", possible_official_submitted)


                }
              }

            }
            else {
              console.log("******** Official table has no record");

            }

            break;

          case "REFADJ":
            var temp = JSON.parse(JSON.stringify(data))

            if (temp["data"]["req_data"]["officialassignmentid"] == this.activatedRoute.snapshot.params.assignmentid) {

              console.log("REFADJ", temp);

              var Panel_violation: any;
              var selected_element: any;

              //Panel violations, Filter the data according to sc_type = "947960000"
              Panel_violation = this.on_join_data.segmentid.definitionid.bonuses_deduction;
              selected_element = Panel_violation.filter((record: any) => record.sc_adjustmentdefinition.sc_type == "947960000");

              for (var i = 0; i < selected_element.length; i++) {

                if (selected_element[i]["sc_skatingadjustmentassociationid"] == temp["data"]["req_data"]["sc_skatingadjustmentassociationid"]) {
                  this.violationValueNew[i] = temp["data"]["req_data"]["value"];
                }

              }

              var referee_element = Panel_violation.filter((record: any) => record.sc_adjustmentdefinition.sc_type == "947960002");
              for (var i = 0; i < referee_element.length; i++) {
                if (referee_element[i]["sc_skatingadjustmentassociationid"] == temp["data"]["req_data"]["sc_skatingadjustmentassociationid"]) {
                  this.refereeViolationValue[i] = temp["data"]["req_data"]["value"];
                }
                //this.refereeViolationValue.push(0);
              }


            }


            break;

          case "REFPC":
            var temp = JSON.parse(JSON.stringify(data))

            if (temp["data"]["req_data"]["officialassignmentid"] == this.activatedRoute.snapshot.params.assignmentid) {
              console.log("REFPC", temp);

              var program_component: any;

              //Program Component, check the data accroding to length
              program_component = this.on_join_data.segmentid.definitionid.programcomponents;
              for (var i = 0; i < program_component.length; i++) {

                if (program_component[i]["sc_skatingprogramcomponentdefinitionid"] == temp["data"]["req_data"]["sc_skatingprogramcomponentdefinitionid"]) {
                  this.program_componentValue[i] = temp["data"]["req_data"]["value"];
                }

              }
            }

            var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["req_data"]["officialassignmentid"]);

            console.log("official data", official_data);
            if (official_data.length > 0) {
              this.refPcCount[0] = temp["data"]["pc_count"];
            }
            else {
              console.log("******** Official table has no record");

            }



            break;

          case "REFGOE":
            var temp = JSON.parse(JSON.stringify(data))

            if (temp["data"]["officialassignmentid"] == this.activatedRoute.snapshot.params.assignmentid) {

              console.log("REFGOE", temp);

              // var modifyData = this.dataSource;
              // modifyData[this.selectedRowIndex - 1]['refGOEValue'] = temp["data"]["goevalue"];;
              // this.dataSource = modifyData;


              for (let i = 0; i < this.dataSource.length; i++) {
                if (this.dataSource[i]["skateelementid"] == temp["data"]["skate_element_id"]) {

                  this.dataSource[i]['refGOEValue'] = temp["data"]["goevalue"];


                }
              }

              console.log("this datasource after goe", this.dataSource)


            }

            var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["officialassignmentid"]);

            console.log("official data", official_data);
            if (official_data.length > 0) {
              this.refGoeCount[0] = temp["data"]["goe_count"];
            }
            else {
              console.log("******** Official table has no record");

            }


            break;

          case "REFEREESTATUS":
            var temp = JSON.parse(JSON.stringify(data))
            console.log("REFEREESTATUS", temp);


            if (temp["data"]["data"]["official_assignment_id"] == this.activatedRoute.snapshot.params.assignmentid) {
              if (temp["data"]["data"]["competitorentryid"] == this.skater_data.competitorentryid) {


                if (temp["data"]["data"]["statusmessage"] == "Submit") {


                  if (temp["data"]["data"]["submit"] == true) {
                    var disSubmit = <HTMLInputElement>document.getElementById("submit");
                    disSubmit.style.backgroundColor = "#cb3a3a", "important";
                    disSubmit.style.color = "#443c3c", "important";
                    this.refereeStatus[0] = "completed";
                    this.submit = true;
                  }
                  else {
                    var disSubmit = <HTMLInputElement>document.getElementById("submit");
                    disSubmit.style.backgroundColor = "";
                    disSubmit.style.color = "";
                    this.refereeStatus[0] = "progress";
                    this.submit = false;
                  }




                  //disSubmit.disabled = true;


                  // check logic for flashing finalize button



                  // short code

                  // total officals 

                  var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.role == '469C7509-FEA6-EC11-983F-00224825E0C8' || record.role == '9A8F5827-FEA6-EC11-983F-00224825E0C8');

                  console.log("official data", official_data, official_data.length);


                  // offcials submitted

                  var possible_official_submitted = 0;


                  for (let k = 0; k < this.judgeStatus.length; k++) {
                    if (this.judgePosition[k] == 1) {
                      if (this.judgeStatus[k] == "completed") {
                        possible_official_submitted = possible_official_submitted + 1;
                      }
                    }
                  }

                  for (let k = 0; k < this.refereeStatus.length; k++) {
                    if (this.refPosition[k] == 1) {
                      if (this.refereeStatus[k] == "completed") {
                        possible_official_submitted = possible_official_submitted + 1;
                      }
                    }
                  }

                  console.log("submitted count", possible_official_submitted)

                  // comparing both if same then highlight buttons

                  //console.log("condition",official_data.length == possible_official_submitted)
                  if (official_data.length == possible_official_submitted && official_data.length != 0) {
                    console.log("Button should be flashing ***********************************************")
                    this.finalize_flash = true;
                  }
                  else {
                    this.finalize_flash = false;
                  }


                }

                console.log("refstatus ", temp);
              }
            }

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

          case "SCORESKATE":

            var temp = JSON.parse(JSON.stringify(data))
            //console.log("SCORESKATE", temp);


            if (temp["data"]["official_assignment_id"] == this.activatedRoute.snapshot.params.assignmentid) {
              console.log("SCORESKATE", temp);
            }

            var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["official_assignment_id"]);

            console.log("official data", official_data);
            if (official_data.length > 0) {
              if (temp["data"]["competitorentryid"] == this.skater_data.competitorentryid) {
                if (temp["data"]["statusmessage"] == "SCORESKATER") {
                  // this.refereeStatus[0] = "completed";

                  var disSubmit = <HTMLInputElement>document.getElementById("finalize");
                  disSubmit.style.backgroundColor = "#cb3a3a", "important";
                  disSubmit.style.color = "#443c3c", "important";
                  disSubmit.disabled = true;

                  this.finalize_flash = false;

                  const test = Array.from(document.getElementsByClassName('grid-container') as HTMLCollectionOf<HTMLElement>)

                  test.forEach((element) => {

                    element.style.opacity = '0.75';
                    element.style.backgroundColor = '#bebebe';
                    element.style.zIndex = '9999999';
                    element.style.pointerEvents = 'none';

                  });

                }
              }

            }
            else {
              console.log("******** Official table has no record");

            }





            break;

          case 'RESCORE':

            var temp = JSON.parse(JSON.stringify(data))
            console.log("RESCORE", temp);

            // enable screen if 
            let test3 = Array.from(document.getElementsByClassName('grid-container') as HTMLCollectionOf<HTMLElement>)

            test3.forEach((element) => {

              element.style.opacity = '';

              element.style.backgroundColor = '';
              element.style.zIndex = '';
              element.style.pointerEvents = '';


            });


            // default finalize button colour 
            var disSubmit = <HTMLInputElement>document.getElementById("finalize");
            disSubmit.style.backgroundColor = "";
            disSubmit.style.color = "";
            disSubmit.disabled = false;


            this.finalize_flash = true;

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



            break;

          case "LOAD_SKATER":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("LOAD_SKATER", temp);

            // varible change for new skater
            this.clip = [];
            this.wbp_failed_index = [];
            this.review_index = [];
            this.submit = false;

            for (let i = 0; i < this.violationValueNew.length; i++) {
              this.violationValueNew[i] = 0;
            }

            for (let i = 0; i < this.refereeViolationValueNew.length; i++) {
              this.refereeViolationValueNew[i] = 0;
            }

            for (let i = 0; i < this.program_componentValue.length; i++) {
              this.program_componentValue[i] = -1;
            }

            this.elements_array = [];
            this.dio_finalized = false;
            this.finalize_flash = false;

            const ELEMENT_DATA: Element[] = this.elements_array;
            this.dataSource = ELEMENT_DATA;

            this.selectedRowIndex = -1;
            this.skater_data = temp["data"];

            this.judgeGoeCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.judgePcCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.judgeStatus = ['progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress'];

            this.refGoeCount = [0];
            this.refPcCount = [0];
            this.refereeStatus = ['progress'];



            this.newData = {
              'data': this.on_join_data,
              'violationValue': this.violationValueNew,
              'programComponent': this.program_componentValue,
              'refereeViolationValue': this.refereeViolationValueNew,
              'skater_data': this.skater_data,
              'assignmentid': this.activatedRoute.snapshot.params.assignmentid,
              'room': this.activatedRoute.snapshot.params.segmentid,
              'judgeGoeCount': this.judgeGoeCount,
              'judgePcCount': this.judgePcCount,
              'dataSource': this.dataSource,
              'judgeStatus': this.judgeStatus,
              'judgePosition': this.judgePosition,
              'judgeOnline': this.judgeOnline,
              'refPosition': this.refPosition,
              'refGoeCount': this.refGoeCount,
              'refPcCount': this.refPcCount,
              'refereeStatus': this.refereeStatus,
              'refOnline': this.refOnline
            }

            // enable screen and  change button color

            var disSubmit = <HTMLInputElement>document.getElementById("submit");
            disSubmit.style.backgroundColor = "";
            disSubmit.style.color = "";
            disSubmit.disabled = false;

            var disSubmit = <HTMLInputElement>document.getElementById("finalize");
            disSubmit.style.backgroundColor = "";
            disSubmit.style.color = "";
            disSubmit.disabled = false;

            const test1 = Array.from(document.getElementsByClassName('grid-container') as HTMLCollectionOf<HTMLElement>)

            test1.forEach((element) => {

              element.style.opacity = '';

              element.style.backgroundColor = '';
              element.style.zIndex = '';
              element.style.pointerEvents = '';


            });



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


              // varible change for new skater
              this.clip = [];
              this.wbp_failed_index = [];
              this.review_index = [];
              this.submit = false;

              this.dio_finalized = false;
              this.finalize_flash = false;

              for (let i = 0; i < this.violationValueNew.length; i++) {
                this.violationValueNew[i] = 0;
              }

              for (let i = 0; i < this.refereeViolationValueNew.length; i++) {
                this.refereeViolationValueNew[i] = 0;
              }

              for (let i = 0; i < this.program_componentValue.length; i++) {
                this.program_componentValue[i] = -1;
              }

              this.elements_array = [];

              const ELEMENT_DATA1: Element[] = this.elements_array;
              this.dataSource = ELEMENT_DATA1;

              this.selectedRowIndex = -1;
              this.skater_data = {};

              this.judgeGoeCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
              this.judgePcCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
              this.judgeStatus = ['progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress'];

              this.refGoeCount = [0];
              this.refPcCount = [0];
              this.refereeStatus = ['progress'];



              this.on_join_data = JSON.parse(dataObj.initializationObj)

              var new_notes_filter = this.on_join_data.segmentid.categoryid.definitionid.sc_skatingdisciplinedefinition.notes.filter((record: any) => record.sc_skatingelementnoteid.sc_enteredby == '9A8F5827-FEA6-EC11-983F-00224825E0C8');

              console.log('new notes', new_notes_filter);

              this.notes = new_notes_filter;


              // validation for assigned user using interface 

              console.log("getting sc_num from session", sessionStorage.getItem('scnum'))

              if (sessionStorage.getItem("isOnline") == "true") {
                if (sessionStorage.getItem('scnum') != null) {
                  console.log("logged in", sessionStorage.getItem('scnum'))

                  var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == this.activatedRoute.snapshot.params.assignmentid);

                  if (official_data.length > 0) {
                    console.log("found in offcial assignment", official_data)


                    console.log("value is ", official_data[0].sc_officialid.sc_scnum)

                    // case 1: AS a DS 

                    var ds_data = this.on_join_data.segmentid.categoryid.eventid.dspermissions.filter((record: any) => record.dscontactid == sessionStorage.getItem('contactid'));



                    if ((official_data[0].sc_officialid.sc_scnum == sessionStorage.getItem('scnum') && official_data[0]['role'] == '9A8F5827-FEA6-EC11-983F-00224825E0C8') || ds_data.length > 0) {
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





              this.newData["data"] = this.on_join_data;

              //this.user_access = true;

              // variable for setting video
              console.log("rink id",this.on_join_data.segmentid.rinkid);
              if(this.on_join_data.segmentid.rinkid != null)
              {
                if(this.on_join_data.segmentid.rinkid.hasOwnProperty('videofeed'))
                {
                  
                  this.locator_url = this.on_join_data.segmentid.rinkid.locator_url;
                  this.video_feed = true;

                }
              }

              // code execution after getting object
              this.elements = this.on_join_data.segmentid.definitionid.sc_elementconfiguration.elements;

              var Panel_violation: any;
              var selected_element: any;
              var program_component: any;

              //Panel violations, Filter the data according to sc_type = "947960000"
              Panel_violation = this.on_join_data.segmentid.definitionid.bonuses_deduction;
              selected_element = Panel_violation.filter((record: any) => record.sc_adjustmentdefinition.sc_type == "947960000");

              for (var i = 0; i < selected_element.length; i++) {

                this.violationValueNew.push(0);
              }

              var referee_element = Panel_violation.filter((record: any) => record.sc_adjustmentdefinition.sc_type == "947960002");
              for (var i = 0; i < referee_element.length; i++) {

                this.refereeViolationValue.push(0);
              }

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
            else {
              console.log("no room exists for this segment yet");

              this.user_access = false;
            }
            this.snackBar.dismiss();
            break;

          case "ELMVIDCLIPDEL":
            var temp = JSON.parse(JSON.stringify(data))
            console.log("ELMVIDCLIPDEL", temp);

            var modified_elements = <any>[];

            for (let k = 0; k < this.dataSource.length; k++) {

              if (this.dataSource[k]["skateelementid"] == temp["data"]["skateelementid"]) {


                let data_example: any = {};

                data_example["index"] = modified_elements.length + 1;
                data_example["elementCode"] = this.dataSource[k]["elementCode"];
                data_example["skateelementid"] = this.dataSource[k]["skateelementid"];
                data_example["elmclip"] = "";
                data_example['refGOEValue'] = this.dataSource[k]["refGOEValue"];
                data_example["status"] = this.dataSource[k]["status"];
                data_example["structure_input_data"] = this.dataSource[k]["structure_input_data"];


                modified_elements.push(data_example);

              }

              else {

                modified_elements.push(this.dataSource[k]);

              }

            }

            for (let c = 0; c < modified_elements.length; c++) {
              modified_elements[c]['index'] = c + 1;
            }

            this.dataSource = modified_elements;

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


            this.newData["judgeOnline"] = this.judgeOnline;
            console.log("users data after disconnect", this.users);


            break;


          case 'CLIP_CODE_CHANGE':

            var temp = JSON.parse(JSON.stringify(data))
            console.log("CLIP_CODE_CHANGE", temp);


            var elements_array = <any>[];
            var element_object = <any>{};

            for (let m = 0; m < this.dataSource.length; m++) {

              element_object['index'] = elements_array.length + 1;
              element_object['skateelementid'] = this.dataSource[m].skateelementid;
              element_object['elementCode'] = this.dataSource[m].elementCode;

              if (m <= temp.data.data.details.length - 1) {
                element_object['elmclip'] = temp.data.data.details[m]["elmclip"];
              }
              else {
                element_object['elmclip'] = "";
              }


              element_object['refGOEValue'] = this.dataSource[m].refGOEValue;

              element_object['status'] = this.dataSource[m].status;
              element_object['structure_input_data'] = this.dataSource[m].structure_input_data;



              elements_array.push(element_object);
              element_object = {};
            }

            this.dataSource = elements_array;

            console.log("please check this", this.dataSource);

            break;

          case 'GOE_COUNT_UPDATE':

            var temp = JSON.parse(JSON.stringify(data))
            console.log("GOE_COUNT_UPDATE", temp);

            var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["data"]["assignmentid"]);

            console.log("official data", official_data);
            if (official_data.length > 0) {
              this.judgeGoeCount[official_data[0].position - 1] = temp["data"]["data"]["count"];
            }
            else {
              console.log("******** Official table has no record");

            }



            break;

          case 'REF_GOE_COUNT_UPDATE':

            var temp = JSON.parse(JSON.stringify(data))
            console.log("REF_GOE_COUNT_UPDATE", temp);


            var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["data"]["assignmentid"]);

            console.log("official data", official_data);
            if (official_data.length > 0) {
              this.refGoeCount[0] = temp["data"]["data"]["count"];
            }
            else {
              console.log("******** Official table has no record");

            }

            break;


          case "STOPSKATER":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("STOPSKATER", temp);


            // varible change for new skater
            this.clip = [];
            this.dio_finalized = false;
            this.finalize_flash = false;
            this.review_index = [];
            this.wbp_failed_index = [];
            this.submit = false;


            for (let i = 0; i < this.violationValueNew.length; i++) {
              this.violationValueNew[i] = 0;
            }

            for (let i = 0; i < this.refereeViolationValueNew.length; i++) {
              this.refereeViolationValueNew[i] = 0;
            }

            for (let i = 0; i < this.program_componentValue.length; i++) {
              this.program_componentValue[i] = -1;
            }

            this.elements_array = [];

            const ELEMENT_DATA1: Element[] = this.elements_array;
            this.dataSource = ELEMENT_DATA1;

            this.selectedRowIndex = -1;
            this.skater_data = {};

            this.judgeGoeCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.judgePcCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.judgeStatus = ['progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress', 'progress'];

            this.refGoeCount = [0];
            this.refPcCount = [0];
            this.refereeStatus = ['progress'];



            this.newData = {
              'data': this.on_join_data,
              'violationValue': this.violationValueNew,
              'programComponent': this.program_componentValue,
              'refereeViolationValue': this.refereeViolationValueNew,
              'skater_data': this.skater_data,
              'assignmentid': this.activatedRoute.snapshot.params.assignmentid,
              'room': this.activatedRoute.snapshot.params.segmentid,
              'judgeGoeCount': this.judgeGoeCount,
              'judgePcCount': this.judgePcCount,
              'dataSource': this.dataSource,
              'judgeStatus': this.judgeStatus,
              'judgePosition': this.judgePosition,
              'judgeOnline': this.judgeOnline,
              'refPosition': this.refPosition,
              'refGoeCount': this.refGoeCount,
              'refPcCount': this.refPcCount,
              'refereeStatus': this.refereeStatus,
              'refOnline': this.refOnline
            }

            // change color of button and enable screen if not

            var disSubmit = <HTMLInputElement>document.getElementById("submit");
            disSubmit.style.backgroundColor = "";
            disSubmit.style.color = "";
            disSubmit.disabled = false;

            var disSubmit = <HTMLInputElement>document.getElementById("finalize");
            disSubmit.style.backgroundColor = "";
            disSubmit.style.color = "";
            disSubmit.disabled = false;

            const test2 = Array.from(document.getElementsByClassName('grid-container') as HTMLCollectionOf<HTMLElement>)

            test2.forEach((element) => {

              element.style.opacity = '';

              element.style.backgroundColor = '';
              element.style.zIndex = '';
              element.style.pointerEvents = '';


            });


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

          default:
            console.log("Default case");
            break;
        }



      });




    this._chatService.dio_entered_element_changed()
      .subscribe(coming_data => {

        console.log("-------- coming in dio enter", coming_data);

        // code generating based on level and modifier 

        var whole_string_data = "";

        if (coming_data["details"]["structure_input_data"].hasOwnProperty('elements') == true) {
          for (let x = 0; x < coming_data["details"]["structure_input_data"]["elements"].length; x++) {

            var element_codes = this.elements.filter((record: any) => record.sc_skatingelementdefinitionid.sc_elementcode == coming_data["details"]["structure_input_data"]["elements"][x]["Element_code"]);

            //console.log("ashjshjsa",element_codes);

            coming_data["details"]["structure_input_data"]["elements"][x]["famtype_sc_levelposition"] = element_codes[0]["sc_skatingelementdefinitionid"]["famtype_sc_levelposition"];
            coming_data["details"]["structure_input_data"]["elements"][x]["fam_sc_code"] = element_codes[0]["sc_skatingelementdefinitionid"]["fam_sc_code"];
            coming_data["details"]["structure_input_data"]["elements"][x]["sc_level"] = element_codes[0]["sc_skatingelementdefinitionid"]["sc_level"];



            var individual_string = "";

            if (coming_data["details"]["structure_input_data"]["elements"][x]['Pattern_dance_code'] != "") {
              individual_string = individual_string + coming_data["details"]["structure_input_data"]["elements"][x]['Pattern_dance_code'];

            }

            if (coming_data["details"]["structure_input_data"]["elements"][x]['Flying'] == true) {
              individual_string = individual_string + "F";

            }

            if (coming_data["details"]["structure_input_data"]["elements"][x]['Change'] == true) {
              individual_string = individual_string + "C";

            }

            // modification needed for level remove
            if (coming_data["details"]["structure_input_data"]["elements"][x]['Element_code'] != "") {

              if (element_codes[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == '7BFAB449-4C8B-EB11-A812-000D3A8DCA86' || element_codes[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == 'ABC41C05-4730-ED11-9DB1-0022482D319B') {
                individual_string = individual_string + coming_data["details"]["structure_input_data"]["elements"][x]['Element_code'];
              }
              else {
                individual_string = individual_string + coming_data["details"]["structure_input_data"]["elements"][x]["fam_sc_code"];
              }
              //console.log(element_codes[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"]);

              //individual_string = individual_string + coming_data["details"]["structure_input_data"]["elements"][x]['Element_code'];



            }

            if (coming_data["details"]["structure_input_data"]["elements"][x]['Synchro_element_suffix'].length >= 1) {
              var tem = "";
              for (let a = 0; a < coming_data["details"]["structure_input_data"]["elements"][x]['Synchro_element_suffix'].length; a++) {
                tem = tem + coming_data["details"]["structure_input_data"]["elements"][x]['Synchro_element_suffix'][a];
              }
              individual_string = individual_string + "+" + tem;

            }

            if (coming_data["details"]["structure_input_data"]["elements"][x]['Throw'] == true) {
              individual_string = individual_string + "Th";

            }

            if (coming_data["details"]["structure_input_data"]["elements"][x]['Edge'] != "") {
              individual_string = individual_string + coming_data["details"]["structure_input_data"]["elements"][x]['Edge'];

            }

            if (coming_data["details"]["structure_input_data"]["elements"][x]['Rotation'] != "") {
              individual_string = individual_string + coming_data["details"]["structure_input_data"]["elements"][x]['Rotation'];

            }

            if (coming_data["details"]["structure_input_data"]["elements"][x]['Synchro'] != "") {
              individual_string = individual_string + coming_data["details"]["structure_input_data"]["elements"][x]['Synchro'];

            }


            if (coming_data["details"]["structure_input_data"]["elements"][x]['invalid'] == true) {
              individual_string = individual_string + "*";

            }

            if (coming_data["details"]["structure_input_data"]["elements"][x]['notes'].length >= 1) {

              for (let a = 0; a < coming_data["details"]["structure_input_data"]["elements"][x]['notes'].length; a++) {

                // individual_string = individual_string + "[" + this.structure_input_data["elements"][x]['notes'][a] + "]";
                if (a == 0) {
                  individual_string = individual_string + "+" + coming_data["details"]["structure_input_data"]["elements"][x]['notes'][a];

                }
                else {
                  individual_string = individual_string + coming_data["details"]["structure_input_data"]["elements"][x]['notes'][a];

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



          }

          if (coming_data["details"]["structure_input_data"]["rep_jump"] == true) {
            whole_string_data = whole_string_data + "+REP";
          }

        }

        //console.log("new generated code",whole_string_data);

        // generating tables

        if (coming_data.details.edit_row_index == -1) {

          if (coming_data.details.insert_before_index == -1) {

            if (coming_data.details.delete_row_index == -1) {

              if (coming_data.details.index == this.dataSource.length) {

                var elements_array = <any>[];
                var element_object = <any>{};

                for (let k = 0; k < this.dataSource.length; k++) {

                  element_object['index'] = elements_array.length + 1;
                  element_object['skateelementid'] = this.dataSource[k].skateelementid;
                  element_object['elementCode'] = this.dataSource[k].elementCode;

                  element_object['refGOEValue'] = this.dataSource[k].refGOEValue;
                  element_object['status'] = this.dataSource[k].status;
                  element_object['elmclip'] = this.dataSource[k].elmclip;
                  element_object['structure_input_data'] = this.dataSource[k].structure_input_data;


                  elements_array.push(element_object);
                  element_object = {};

                }

                element_object['index'] = elements_array.length + 1;
                element_object['skateelementid'] = "";
                element_object['elementCode'] = whole_string_data;

                element_object['refGOEValue'] = "";
                element_object['status'] = "Active";
                element_object['elmclip'] = "";
                element_object['structure_input_data'] = coming_data.details.structure_input_data;


                elements_array.push(element_object);
                element_object = {};

                this.dataSource = elements_array;

                console.log("thiasd ddaasd", this.dataSource);

              }

              // code when adding mor than one like A +2T
              if (coming_data.details.index < this.dataSource.length) {

                this.dataSource[coming_data.details.index]['elementCode'] = whole_string_data;
                this.dataSource[coming_data.details.index]['status'] = "Active";

                this.dataSource[coming_data.details.index]['structure_input_data'] = coming_data.details.structure_input_data;

                console.log("2nd ", this.dataSource);

              }
            }
          }
        }

        else {
          if (coming_data.details.input_code != "") {

            if (coming_data.details.edit_row_index <= this.dataSource.length) {


              this.dataSource[coming_data.details.edit_row_index - 1]['skateelementid'] = '';
              this.dataSource[coming_data.details.edit_row_index - 1]['elementCode'] = whole_string_data;
              this.dataSource[coming_data.details.edit_row_index - 1]['status'] = "Active";

              this.dataSource[coming_data.details.edit_row_index - 1]['structure_input_data'] = coming_data.details.structure_input_data;


            }
          }
        }

        if (coming_data.details.insert_before_index != -1) {

          var modified_elements = <any>[];

          for (let b = 0; b < this.dataSource.length; b++) {

            if (b < coming_data.details.insert_before_index - 1) {

              modified_elements.push(this.dataSource[b]);
            }

            else if (b == coming_data.details.insert_before_index - 1) {

              let data_example: any = {};

              data_example["index"] = modified_elements.length + 1;
              data_example["elementCode"] = "";
              data_example["skateelementid"] = "";
              data_example["elmclip"] = "";
              data_example["refGOEValue"] = "";

              data_example["structure_input_data"] = "";
              data_example['status'] = "Active";

              modified_elements.push(data_example);

              data_example = {};

              data_example["index"] = modified_elements.length + 1;
              data_example["elementCode"] = this.dataSource[b]["elementCode"];
              data_example["skateelementid"] = this.dataSource[b]["skateelementid"];
              data_example["elmclip"] = this.dataSource[b]["elmclip"];
              data_example["refGOEValue"] = this.dataSource[b]["refGOEValue"];
              data_example['status'] = this.dataSource[b]["status"];
              data_example['structure_input_data'] = this.dataSource[b]["structure_input_data"];

              modified_elements.push(data_example);
            }

            else {

              let data_example: any = {};

              data_example["index"] = modified_elements.length + 1;
              data_example["elementCode"] = this.dataSource[b]["elementCode"];
              data_example["skateelementid"] = this.dataSource[b]["skateelementid"];
              data_example["elmclip"] = this.dataSource[b]["elmclip"];
              data_example["refGOEValue"] = this.dataSource[b]["refGOEValue"];
              data_example['status'] = this.dataSource[b].status;
              data_example['structure_input_data'] = this.dataSource[b]["structure_input_data"];

              modified_elements.push(data_example);
            }
          }
          this.dataSource = modified_elements;
        }

      });


    this._chatService.cancel_button_response()
      .subscribe(coming_data => {

        console.log("cancel button clicked", coming_data);

        if (coming_data.details.row_index != -1) {

          if (coming_data.details.index < this.dataSource.length) {
            console.log("for insertt before");
            var modified_elements = <any>[];

            for (let b = 0; b < this.dataSource.length; b++) {

              if (b == coming_data.details.row_index - 1) {


              }
              else {
                let data_example: any = {};

                data_example["index"] = modified_elements.length + 1;
                data_example["elementCode"] = this.dataSource[b].elementCode;
                data_example["skateelementid"] = this.dataSource[b]["skateelementid"];
                data_example["elmclip"] = this.dataSource[b]["elmclip"];
                data_example['status'] = this.dataSource[b]['status'];
                data_example['refGOEValue'] = this.dataSource[b].refGOEValue;
                data_example['structure_input_data'] = this.dataSource[b]["structure_input_data"];



                modified_elements.push(data_example);
              }


            }

            this.dataSource = modified_elements;
            this.elements_array = this.dataSource;

          }
          else {
            console.log("for edit", this.dataSource);

            var modified_elements = <any>[];

            for (let b = 0; b < this.dataSource.length; b++) {

              if (b == coming_data.details.row_index - 1) {
                let data_example: any = {};

                data_example["index"] = modified_elements.length + 1;
                data_example["elementCode"] = coming_data.details.dataSource[b].name;
                data_example["skateelementid"] = coming_data.details.dataSource[b].skateelementid;

                data_example["elmclip"] = this.dataSource[b]["elmclip"];
                data_example['status'] = "completed";
                data_example['refGOEValue'] = this.dataSource[b].refGOEValue;

                data_example['structure_input_data'] = coming_data.details.old_structure_input_data;


                modified_elements.push(data_example);

              }
              else {
                let data_example: any = {};

                data_example["index"] = modified_elements.length + 1;
                data_example["elementCode"] = this.dataSource[b].elementCode;
                data_example["skateelementid"] = this.dataSource[b].skateelementid;
                data_example["elmclip"] = this.dataSource[b]["elmclip"];
                data_example['status'] = this.dataSource[b].status;
                data_example['refGOEValue'] = this.dataSource[b].refGOEValue;
                data_example['structure_input_data'] = this.dataSource[b]["structure_input_data"];



                modified_elements.push(data_example);
              }


            }

            this.dataSource = modified_elements;
            this.elements_array = this.dataSource;

            console.log("datasource changed", this.dataSource);

          }

        }
        else {

          console.log("normal case");

          var modified_elements = <any>[];

          for (let b = 0; b < this.dataSource.length; b++) {

            if (b < coming_data.details.dataSource.length) {
              let data_example: any = {};

              data_example["index"] = modified_elements.length + 1;
              data_example["elementCode"] = coming_data.details.dataSource[b].name;
              data_example["skateelementid"] = this.dataSource[b]["skateelementid"];
              data_example["elmclip"] = this.dataSource[b]["elmclip"];

              data_example['refGOEValue'] = this.dataSource[b].refGOEValue;

              data_example['status'] = this.dataSource[b].status;
              data_example['structure_input_data'] = this.dataSource[b].structure_input_data;

              modified_elements.push(data_example);

            }


          }

          this.dataSource = modified_elements;
          this.elements_array = this.dataSource;
          console.log("this datasource", this.dataSource);


        }

      });


  }

  displayedColumns: string[] = ['index', 'elementCode', 'refGOEValue', 'elmclip'];
  dataSource: any = [];
  //index = this.elements.length;
  selectedRowIndex: any = -1;
  name_testing: any = "Active";



  ngOnInit(): void {

    // joining room with Id
    // var chat_room: any = {};
    // chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;
    // chat_room["official"] = json_test_data.segmentid.offical.sc_officialid.sc_fullname;
    // chat_room["official_assignment_id"] = this.activatedRoute.snapshot.params.assignmentid;
    // chat_room["competitorentryid"] = "29de489e-a2a8-4885-b844-12e63fa9c03f";

    // this._chatService.joinRoom(chat_room);

    var chat_room: any = {};
    chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;;

    chat_room["method_name"] = 'NEWCLIENT';
    chat_room["data"] = { 'official_assignment_id': this.activatedRoute.snapshot.params.assignmentid };

    //this._chatService.createRoom(chat_room);
    this._chatService.broadcast(chat_room);


    this.language = this.languageSelector.getLanguage();


    const ELEMENT_DATA: Element[] = this.elements_array;

    //Variable declaration 
    this.dataSource = ELEMENT_DATA;

  }

  // no needed may be
  element_data: any = this.elements[0];

  //Element Click Event For Auto Selection Of The Next Row
  element_click(input: any) {
    if (this.skater_data.hasOwnProperty('competitorentryid')) {
      //this.index = input.index;
      this.selectedRowIndex = input.index;


      const index = this.wbp_failed_index.indexOf(input.index);
      if (index > -1) { // only splice array when item is found
        this.wbp_failed_index.splice(index, 1); // 2nd parameter means remove one item only
      }


      let clip_data: any = {};
      clip_data['clicked'] = true;
      clip_data['data'] = this.dataSource[this.selectedRowIndex - 1].elmclip;

      this.clip = clip_data;
    }

  }

  // GoeValueClicked function for Referee
  refereeGOE(index: any, input: any) {

    if (this.skater_data.hasOwnProperty('competitorentryid')) {
      if (this.selectedRowIndex != -1) {


        var goeOutput: any = {};
        var modifyData = this.dataSource;
        modifyData[this.selectedRowIndex - 1]['refGOEValue'] = input;
        this.dataSource = modifyData;

        const index = this.wbp_failed_index.indexOf(this.selectedRowIndex);
        if (index > -1) { // only splice array when item is found
          this.wbp_failed_index.splice(index, 1); // 2nd parameter means remove one item only
        }


        if (this.dataSource[this.selectedRowIndex - 1]['status'] == "completed") {

          // goeOutput['skateelementid'] = "12345";
          // goeOutput['officialassignmentid'] = this.activatedRoute.snapshot.params.assignmentid;
          // goeOutput['goebutton'] = input;

          // console.log("Add GOE from referee to Element:", goeOutput);

          // logic for emiting socket function

          var goeOutput: any = {};
          goeOutput["competitorentryid"] = this.skater_data["competitorentryid"];
          goeOutput["method_name"] = "REFGOE";
          goeOutput["room"] = this.activatedRoute.snapshot.params.segmentid;

          // number of goe values added
          var refgoeCount: any = 0;
          for (let i = 0; i < this.dataSource.length; i++) {

            if (this.dataSource[i].refGOEValue !== "") {
              refgoeCount++;
            }
          }

          console.log("count", refgoeCount)


          goeOutput["goe_count"] = refgoeCount;

          var goe_data: any = {};
          goe_data["skateelementid"] = this.dataSource[this.selectedRowIndex - 1]['skateelementid'];
          goe_data["officialassignmentid"] = this.activatedRoute.snapshot.params.assignmentid;
          goe_data['goevalue'] = input;


          goeOutput["data"] = goe_data;

          this._chatService.broadcast(goeOutput);

        }

        //Auto scrollable accordig to goe value entered
        var rows = document.querySelectorAll('#element_table tr');

        rows[this.selectedRowIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });


        if (this.dataSource.length == this.selectedRowIndex) {
        }

        //Go to the next row
        else {
          this.selectedRowIndex = this.selectedRowIndex + 1;
          //this.index = this.index + 1;
        }


      }
    }


  }


  data = this.on_join_data;

  newData = {
    'data': this.on_join_data,
    'violationValue': this.violationValueNew,
    'programComponent': this.program_componentValue,
    'refereeViolationValue': this.refereeViolationValueNew,
    'skater_data': this.skater_data,
    'assignmentid': this.activatedRoute.snapshot.params.assignmentid,
    'room': this.activatedRoute.snapshot.params.segmentid,
    'judgeGoeCount': this.judgeGoeCount,
    'judgePcCount': this.judgePcCount,
    'dataSource': this.dataSource,
    'judgeStatus': this.judgeStatus,
    'judgePosition': this.judgePosition,
    'judgeOnline': this.judgeOnline,
    'refPosition': this.refPosition,
    'refGoeCount': this.refGoeCount,
    'refPcCount': this.refPcCount,
    'refereeStatus': this.refereeStatus,
    'refOnline': this.refOnline
  }

  // Open dialog box for scoreSummary
  refereeScoreSummary() {
    if (this.skater_data.hasOwnProperty('competitorentryid')) {
      const dialogRef = this.dialog.open(RefereeScreenScoreSummary, {
        data: this.newData,
        height: '500px',
        width: '1200px',
      });
    }
  }


  // Open dialog box for Referee Violations
  refereeADJ() {
    if (this.skater_data.hasOwnProperty('competitorentryid')) {
      const dialogRef = this.dialog.open(RefereeScreenViolation, {
        data: this.newData,
        height: '500px',
        width: '1200px',
      });
    }
  }

  // Open dialog box for PC
  refereePC() {
    if (this.skater_data.hasOwnProperty('competitorentryid')) {
      const dialogRef = this.dialog.open(RefereeScreenProgramComponent, {
        data: this.newData,
        height: '500px',
        width: '900px',
      });
    }
  }

  onJudgeStatus() {
    if (this.skater_data.hasOwnProperty('competitorentryid')) {
      const dialogRef = this.dialog.open(refJudgeStatusScreen, {
        data: this.newData,
        height: '500px',
        width: '1200px',
      }
      );
    }
  }

  //Submit a element data
  refereeOnFinalize() {

    if (this.dio_finalized == true) {

      if (this.skater_data.hasOwnProperty('competitorentryid')) {
        // logic for sending goe values which were remain pending due to in process element


        for (let i = 0; i < this.dataSource.length; i++) {

          if (this.dataSource[i]['status'] == "Active" && this.dataSource[i]['refGOEValue'] != "") {

            var goeOutput: any = {};
            goeOutput["competitorentryid"] = this.skater_data["competitorentryid"];
            goeOutput["method_name"] = "REFGOE";
            goeOutput["room"] = this.activatedRoute.snapshot.params.segmentid;


            var goe_data: any = {};
            goe_data["skateelementid"] = this.dataSource[i]["skateelementid"];
            goe_data["officialassignmentid"] = this.activatedRoute.snapshot.params.assignmentid;
            goe_data['goevalue'] = this.dataSource[i]['refGOEValue'];


            goeOutput["data"] = goe_data;

            this._chatService.broadcast(goeOutput);
          }
        }

        // total officals 

        var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.role == '469C7509-FEA6-EC11-983F-00224825E0C8' || record.role == '9A8F5827-FEA6-EC11-983F-00224825E0C8');

        console.log("official data", official_data, official_data.length);


        // offcials submitted

        var possible_official_submitted = 0;


        for (let k = 0; k < this.judgeStatus.length; k++) {
          if (this.judgePosition[k] == 1) {
            if (this.judgeStatus[k] == "completed") {
              possible_official_submitted = possible_official_submitted + 1;
            }
          }
        }

        for (let k = 0; k < this.refereeStatus.length; k++) {
          if (this.refPosition[k] == 1) {
            if (this.refereeStatus[k] == "completed") {
              possible_official_submitted = possible_official_submitted + 1;
            }
          }
        }

        console.log("submitted count", possible_official_submitted)


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



        if (official_data.length != 0) {
          if (official_data.length == possible_official_submitted) {
            console.log("all judges submitteed");

            this._chatService.broadcast(submit_output);


          }
          else {
            console.log("Not submitteed");

            const dialogRef = this.dialog.open(ConfirmationDialog, {

              data: { "new_data": this.newData, "submit_output": submit_output },
              width: '420px',
            });


          }
        }






      }

    }



    // let submit: any = {};
    // submit['officialassignmentid'] = this.activatedRoute.snapshot.params.assignmentid;
    // submit['submit'] = true;
    // console.log("Referee Status Update on Submit Elements:", submit)

    // logic for emiting socket function


  }

  //Submit a element data
  refereeOnSubmit() {
    if (this.skater_data.hasOwnProperty('competitorentryid')) {

      for (let i = 0; i < this.dataSource.length; i++) {

        if (this.dataSource[i]['status'] == "Active" && this.dataSource[i]['refGOEValue'] != "") {

          var goeOutput: any = {};
          goeOutput["competitorentryid"] = this.skater_data["competitorentryid"];
          goeOutput["method_name"] = "REFGOE";
          goeOutput["room"] = this.activatedRoute.snapshot.params.segmentid;


          var goe_data: any = {};
          goe_data["skateelementid"] = this.dataSource[i]["skateelementid"];
          goe_data["officialassignmentid"] = this.activatedRoute.snapshot.params.assignmentid;
          goe_data['goevalue'] = this.dataSource[i]['refGOEValue'];


          goeOutput["data"] = goe_data;

          this._chatService.broadcast(goeOutput);
        }

      }

      if (this.submit == false) {
        this.submit = true;
      }
      else {
        this.submit = false;
      }

      // logic for sending status update

      console.log("referee submitted");

      var submit_output: any = {};
      submit_output["competitorentryid"] = this.skater_data["competitorentryid"];
      submit_output["method_name"] = "REFEREESTATUS";
      submit_output["room"] = this.activatedRoute.snapshot.params.segmentid;

      var submit_data: any = {};
      submit_data["statusmessage"] = "Submit";
      submit_data["official_assignment_id"] = this.activatedRoute.snapshot.params.assignmentid;
      submit_data["competitorentryid"] = this.skater_data["competitorentryid"]
      submit_data["submit"] = this.submit;

      submit_output["data"] = submit_data;

      this._chatService.broadcast(submit_output);
    }
  }


  //Help 
  refereeOnHelp() {
    let help: any = {};
    help['help'] = true;
    console.log("Referee Do you need a Help??", help)
  }

  messages_popup() {
    if (this.skater_data.hasOwnProperty('competitorentryid')) {
      //console.log("message pop up");
      const dialogRef = this.dialog.open(refereeMessage, {
        data: this.newData,
        height: '330px',
        width: '420px',
      }
      );
    }

  }

  currentMediaTime(time_data: any) {

    for (let z = 0; z < this.dataSource.length; z++) {


      if (this.dataSource[z].elmclip != '') {

        if (this.dataSource[z].elmclip[0] < (time_data) && this.dataSource[z].elmclip[1] > (time_data)) {
          document.getElementById('play_element_clip_button_' + (z + 1))?.setAttribute("style", "color:#cc9544;");

        }
        else {
          document.getElementById('play_element_clip_button_' + (z + 1))?.setAttribute("style", "color:#fff;");
        }
      }

    }

  }

  refOnNotes(inputs: any) {
    console.log("notes clicked", inputs);

    if (this.selectedRowIndex != -1) {
      console.log("asasdad", this.selectedRowIndex, this.dataSource[this.selectedRowIndex - 1]);


      this.dataSource[this.selectedRowIndex - 1]["structure_input_data"]["elements"][this.dataSource[this.selectedRowIndex - 1]["structure_input_data"]["elements"].length - 1]["notes"].push(inputs["sc_skatingelementnoteid"]["sc_value"])

      console.log("updated value", this.dataSource, this.notes);

      var dummy = [];

      for (let k = 0; k < this.dataSource[this.selectedRowIndex - 1]["structure_input_data"]["elements"].length; k++) {

        var note_def_array = [];

        for (let j = 0; j < this.dataSource[this.selectedRowIndex - 1]["structure_input_data"]["elements"][k]["notes"].length; j++) {

          var notes_definations = this.on_join_data.segmentid.categoryid.definitionid.sc_skatingdisciplinedefinition.notes.filter((record: any) => record.sc_skatingelementnoteid.sc_value == this.dataSource[this.selectedRowIndex - 1]["structure_input_data"]["elements"][k]["notes"][j]);

          console.log("note def", notes_definations);

          if (notes_definations.length > 0) {
            note_def_array.push(notes_definations[0]["sc_skatingelementnoteid"]["sc_skatingelementnoteid"]);
          }

        }

        dummy.push(note_def_array);


      }

      console.log("updated value 2", dummy);


      // generate eleemnt def array

      var entered_element: any = [];

      for (let a = 0; a < this.dataSource[this.selectedRowIndex - 1]["structure_input_data"]["elements"].length; a++) {

        var string_element_code = "";

        // if (this.dataSource[this.selectedRowIndex-1]["structure_input_data"]["elements"][a]['Pattern_dance_code'] != "") {
        //   string_element_code = string_element_code + this.dataSource[this.selectedRowIndex-1]["structure_input_data"]["elements"][a]['Pattern_dance_code'];
        // }

        if (this.dataSource[this.selectedRowIndex - 1]["structure_input_data"]["elements"][a]['Flying'] == true) {
          string_element_code = string_element_code + "F";
        }

        if (this.dataSource[this.selectedRowIndex - 1]["structure_input_data"]["elements"][a]['Change'] == true) {
          string_element_code = string_element_code + "C";
        }

        if (this.dataSource[this.selectedRowIndex - 1]["structure_input_data"]["elements"][a]['Element_code'] != "") {
          string_element_code = string_element_code + this.dataSource[this.selectedRowIndex - 1]["structure_input_data"]["elements"][a]['Element_code'];
        }

        if (this.dataSource[this.selectedRowIndex - 1]["structure_input_data"]["elements"][a]['Synchro_element_suffix'].length >= 1) {
          var tem = "";
          for (let b = 0; b < this.dataSource[this.selectedRowIndex - 1]["structure_input_data"]["elements"][a]['Synchro_element_suffix'].length; b++) {
            tem = tem + this.dataSource[this.selectedRowIndex - 1]["structure_input_data"]["elements"][a]['Synchro_element_suffix'][b];
          }
          string_element_code = string_element_code + "+" + tem;
        }

        if (this.dataSource[this.selectedRowIndex - 1]["structure_input_data"]["elements"][a]['Throw'] == true) {
          string_element_code = string_element_code + "Th";
        }

        if (this.dataSource[this.selectedRowIndex - 1]["structure_input_data"]["elements"][a]['Edge'] != "") {
          string_element_code = string_element_code + this.dataSource[this.selectedRowIndex - 1]["structure_input_data"]["elements"][a]['Edge'];
        }

        if (this.dataSource[this.selectedRowIndex - 1]["structure_input_data"]["elements"][a]['Rotation'] != "") {
          string_element_code = string_element_code + this.dataSource[this.selectedRowIndex - 1]["structure_input_data"]["elements"][a]['Rotation'];
        }

        if (this.dataSource[this.selectedRowIndex - 1]["structure_input_data"]["elements"][a]['Synchro'] != "") {
          string_element_code = string_element_code + this.dataSource[this.selectedRowIndex - 1]["structure_input_data"]["elements"][a]['Synchro'];
        }

        if (this.dataSource[this.selectedRowIndex - 1]["structure_input_data"]["elements"][a]['V'] == true) {
          string_element_code = string_element_code + "V";
        }

        entered_element.push(string_element_code);

      }

      console.log("entered element array", entered_element);

      var def_array = [];

      for (let m = 0; m < entered_element.length; m++) {
        var element_definations = this.on_join_data.segmentid.definitionid.sc_elementconfiguration.elements.filter((record: any) => record.sc_skatingelementdefinitionid.sc_elementcode == entered_element[m]);

        console.log("ele def", element_definations);

        if (element_definations.length > 0) {
          def_array.push(element_definations[0]["sc_skatingelementdefinitionid"]["sc_skatingelementdefinitionid"]);
        }

      }

      console.log("array of all definatio for this master elembt", def_array);




      var edit_element: any = {};
      edit_element["competitorentryid"] = this.skater_data["competitorentryid"];
      edit_element["method_name"] = "CHGELM";
      edit_element["room"] = this.activatedRoute.snapshot.params.segmentid;


      edit_element["input_data"] = this.dataSource[this.selectedRowIndex - 1]["structure_input_data"];
      edit_element["data"] = [];



      for (let k = 0; k < this.dataSource[this.selectedRowIndex - 1]["structure_input_data"]["elements"].length; k++) {

        var edit_data: any = {};
        edit_data["competitorentryid"] = this.skater_data["competitorentryid"];
        edit_data["programorder"] = this.selectedRowIndex;
        edit_data["sc_skatingelementdefinitionid"] = def_array[k];

        edit_data["notes"] = dummy[k];

        edit_element["data"].push(edit_data);



      }


      this._chatService.broadcast(edit_element);


    }


  }
}


@Component({
  selector: 'referee_message',
  templateUrl: './refereescreen_messages.html',
})
export class refereeMessage implements OnInit {


  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any, private languageSelector: LanguageSelector, private _chatService: ChatService, private activatedRoute: ActivatedRoute) {

    console.log("data coming in message ---------", data);
  }

  ngOnInit() {
  }

  message_data(name: any) {
    console.log("name", name);

    // if(name == "Missing Goe marks")
    // {

    // }
    //this._chatService.refereeMessage({ "room": this.data.room, "name": name });
  }
}



@Component({
  selector: 'refereescreen_judgestatus',
  templateUrl: './refereescreen_judgestatus.html',
  styleUrls:
    ['./refereescreen_judgestatus.css']


})
export class refJudgeStatusScreen implements OnInit {

  message_boardcast: any = "";

  checkSelectAllCheckbox = false;
  indeterminate = false;
  tasks: any = []

  all_selected = false;

  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any, private languageSelector: LanguageSelector, private _chatService: ChatService, private activatedRoute: ActivatedRoute) {


    // Finding on positions judge are assigned
    var officials = data.data.segmentid.official.filter((record: any) => record.role == "469C7509-FEA6-EC11-983F-00224825E0C8");

    // for sorting judges based on position
    officials.sort((a: any, b: any) => a.position - b.position);


    if (officials.length > 0) {

      for (let i = 0; i < officials.length; i++) {
        var temp: any = {};

        temp["name"] = "J";
        temp["position"] = officials[i]["position"] - 1;
        temp["officialassignmentid"] = officials[i]["officialassignmentid"];
        temp["selected"] = false;

        this.tasks.push(temp);


      }
    }





    console.log("data..,,..", data)

    console.log("checkbox data..,,..", this.tasks)

  }

  ngOnInit() {
  }

  all_user() {
    if (this.all_selected == false) {
      for (let i = 0; i < this.tasks.length; i++) {
        this.tasks[i]["selected"] = true;
      }
      this.all_selected = true;
    }
    else {
      for (let i = 0; i < this.tasks.length; i++) {
        this.tasks[i]["selected"] = false;
      }
      this.all_selected = false;
    }
  }

  select_user(data: any) {

    for (let i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i]["officialassignmentid"] == data["officialassignmentid"]) {
        if (this.tasks[i]["selected"] == false) {
          this.tasks[i]["selected"] = true;
        }
        else {
          this.tasks[i]["selected"] = false;
        }
      }
    }

    var count = 0;
    for (let i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i]["selected"] == true) {
        count++;
      }
    }

    if (count == this.tasks.length) {
      this.all_selected = true;
    }
    else {
      this.all_selected = false;
    }

  }





  message_submit() {
    var user_selected = this.tasks.filter((task: any) => task.selected);

    //console.log("done is clicked",user_selected,this.message_boardcast)

    if (user_selected.length > 0 && this.message_boardcast != "") {

      var message_output: any = {};
      message_output["competitorentryid"] = this.data.skater_data["competitorentryid"];
      message_output["method_name"] = "PANELMSG";
      message_output["room"] = this.data.room;

      var temp: any = {};
      temp["users"] = user_selected;
      temp["message"] = this.message_boardcast;

      message_output["data"] = temp;

      this._chatService.broadcast(message_output);

      for (let i = 0; i < this.tasks.length; i++) {
        this.tasks[i]["selected"] = false;
      }

    }



  }
}


@Component({
  selector: 'refereescreen_scoresummary',
  templateUrl: './refereescreen_scoresummary.html',
  styleUrls:
    ['./refereescreen_scoresummary.css']


})
export class RefereeScreenScoreSummary implements OnInit {

  //Variable declaration
  score_summary_pc: any;
  score_summary_pv: any;
  referee_pv: any;
  language!: string;

  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any, private languageSelector: LanguageSelector, private _chatService: ChatService, private activatedRoute: ActivatedRoute) {

    //Filter the data according to Program component 
    var program_component = data['data'].segmentid.definitionid.programcomponents;
    this.score_summary_pc = program_component;

    //Filter the data according to Panel Violation
    var Panel_violation = data['data'].segmentid.definitionid.bonuses_deduction;
    var selected_element = Panel_violation.filter((record: any) => record.sc_adjustmentdefinition.sc_type == "947960000");
    this.score_summary_pv = selected_element;

    var refree_element = Panel_violation.filter((record: any) => record.sc_adjustmentdefinition.sc_type == "947960002");
    this.referee_pv = refree_element;


  }

  ngOnInit() {
    this.language = this.languageSelector.getLanguage();
  }

  sampleData = this.data;
}


@Component({
  selector: 'refereescreen_violation',
  templateUrl: './refereescreen_violation.html',
  styleUrls:
    ['./refereescreen_violation.css']


})
export class RefereeScreenViolation implements OnInit {

  language!: string;

  @Input() panel: any;
  @Input() violationValue: any = [];
  @Input() refereeViolationValue: any = [];

  onAdd = new EventEmitter();

  //Button click event for panel violation
  onButtonClick() {
    this.onAdd.emit({
      panel: this.panel,
      violationValue: this.violationValue,
      refereeViolationValue: this.refereeViolationValue
    });
  }
  score_summary_pv: any;
  referee_pv: any;
  bonus_value: any;


  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any, private languageSelector: LanguageSelector, private _chatService: ChatService, private activatedRoute: ActivatedRoute) {

    console.log("data coming violation on pop up", data);
    //Left Part
    var Panel_violation = data['data'].segmentid.definitionid.bonuses_deduction;
    var selected_element = Panel_violation.filter((record: any) => record.sc_adjustmentdefinition.sc_type == "947960000");
    for (var i = 0; i < selected_element.length; i++) {
      var temp = "";
      this.violationValue.push(this.data['violationValue'][i]);

    }

    this.score_summary_pv = selected_element;

    // Right part
    var referee_element = Panel_violation.filter((record: any) => record.sc_adjustmentdefinition.sc_type == "947960002");
    for (var i = 0; i < referee_element.length; i++) {
      this.refereeViolationValue.push(this.data['refereeViolationValue'][i]);

    }
    this.referee_pv = referee_element;
    data = this.data;
  }


  ngOnInit() {
    this.language = this.languageSelector.getLanguage();
  }

  onOptionsSelected(value: any, position: any) {

    //logic for emitting violation values

    if (this.data["skater_data"].hasOwnProperty('skater_data')) {
      let pc_violation: any = this.score_summary_pv[position]["sc_skatingadjustmentassociationid"];
      let panel: any = {};
      panel['sc_skatingadjustmentdefinitionid'] = pc_violation;
      panel['competitorentryid'] = pc_violation;
      panel['officialassignmentid'] = pc_violation;
      panel['value'] = value;
      //console.log("Violation value change", panel)


      var violationOutput: any = {};
      violationOutput["competitorentryid"] = this.data["skater_data"]["competitorentryid"];
      violationOutput["method_name"] = "REFADJ";
      violationOutput["room"] = this.data["room"];

      var violation_data: any = {};
      violation_data["competitorentryid"] = this.data["skater_data"]["competitorentryid"];
      violation_data['officialassignmentid'] = this.data["assignmentid"];
      violation_data["sc_skatingadjustmentassociationid"] = pc_violation;
      violation_data["value"] = value;

      violationOutput["data"] = violation_data;

      this._chatService.broadcast(violationOutput);

      this.panel = panel;
      this.violationValue[position] = parseInt(value);
      this.onButtonClick();
      this.data['violationValue'] = this.violationValue;
      this.violationValue = this.violationValue;
    }
  }

  violation_decrement(position: any, value: any) {

    if (this.data["skater_data"].hasOwnProperty('skater_data')) {
      this.bonus_value = (<HTMLInputElement>document.getElementById("violation_value" + position)).value;
      if (+this.bonus_value + value >= 0) {
        (<HTMLInputElement>document.getElementById("violation_value" + position)).value = String(+this.bonus_value + value);


        let pc_violation: any = this.referee_pv[position]["sc_skatingadjustmentassociationid"];

        let refree: any = {};

        refree['sc_skatingadjustmentdefinitionid'] = pc_violation;
        refree['competitorentryid'] = pc_violation;
        refree['officialassignmentid'] = pc_violation;
        refree['value'] = +this.bonus_value + value;

        //console.log("Referee Violation value changed", refree)
        // this.referee_pv = refree;

        var violationRefOutput: any = {};
        violationRefOutput["competitorentryid"] = this.data["skater_data"]["competitorentryid"];
        violationRefOutput["method_name"] = "REFADJ";
        violationRefOutput["room"] = this.data["room"];

        var violation_ref_data: any = {};
        violation_ref_data["competitorentryid"] = this.data["skater_data"]["competitorentryid"];
        violation_ref_data['officialassignmentid'] = this.data["assignmentid"];
        violation_ref_data["sc_skatingadjustmentassociationid"] = pc_violation;
        violation_ref_data["value"] = +this.bonus_value + value;

        violationRefOutput["data"] = violation_ref_data;

        this._chatService.broadcast(violationRefOutput);

        this.refereeViolationValue[position] = parseInt(+this.bonus_value + value);
        this.onButtonClick();
        this.data['refereeViolationValue'] = this.refereeViolationValue;
        this.refereeViolationValue = this.refereeViolationValue;
      }

    }
  }
}


@Component({
  selector: 'refereescreen_programcomponent',
  templateUrl: './refereescreen_programcomponent.html',
  styleUrls:
    ['./refereescreen_programcomponent.css']


})
export class RefereeScreenProgramComponent implements OnInit {
  @Input() program_componentValue: any = [];
  onAdd = new EventEmitter();

  //Button click event for program component
  onButtonClick() {
    this.onAdd.emit({
      program_componentValue: this.program_componentValue
    });
  }


  // Varibale declaration
  program_com: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0];
  program_comdecimal: any[] = [.00, .25, .50, .75];
  pc_score: any = "";
  selectedRowIndex: any = 0;
  score_summary_pc: any;
  language!: string;

  constructor(public dialog: MatDialog, private dialogRef: MatDialogRef<RefereeScreenProgramComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private languageSelector: LanguageSelector, private _chatService: ChatService, private activatedRoute: ActivatedRoute) {

    console.log("data coming into pc", data);

    var program_component = data['data'].segmentid.definitionid.programcomponents;

    for (var i = 0; i < program_component.length; i++) {
      this.program_componentValue.push(this.data['programComponent'][i]);
    }

    data = this.data;
    this.score_summary_pc = program_component;
    this.selectedRowIndex == 0;
    this.dialogRef.afterOpened().subscribe(() => {

      if (this.selectedRowIndex == 0) {
        (<HTMLInputElement>document.getElementById("pc_label" + "0")).style.backgroundColor = "#F2789F";
      }
    })


  }

  ngOnInit() {
    this.language = this.languageSelector.getLanguage();
  }

  //highlight a row
  programComponentName(index: any, item: any) {

    this.selectedRowIndex = index;
    for (let i = 0; i < this.score_summary_pc.length; i++) {
      if (this.selectedRowIndex == i) {
        (<HTMLInputElement>document.getElementById("pc_label" + i)).style.backgroundColor = "#F2789F";
      } else {
        (<HTMLInputElement>document.getElementById("pc_label" + i)).style.backgroundColor = "khaki";
      }
    }
  }
  //function for whole number 
  valueClicked(index: any, item: any) {
    this.pc_score = "";
    var temp = this.pc_score;
    temp = temp + item.toString();
    this.pc_score = temp;
    (<HTMLInputElement>document.getElementById("program_component" + this.selectedRowIndex)).value = String(this.pc_score);

  }

  //function for decimal value 
  valueClickedDecimal(index: any, item: any) {

    console.log("this selected row index", this.selectedRowIndex);

    if (this.data["skater_data"].hasOwnProperty('skater_data')) {

      var pc_output = (<HTMLInputElement>document.getElementById("program_component" + this.selectedRowIndex)).value;
      var decimal = +pc_output + item;
      //this.pc_score = decimal;
      this.pc_score = decimal.toFixed(2);

      if (this.pc_score > 10) {

        this.pc_score = 10.00;
      }
      (<HTMLInputElement>document.getElementById("program_component" + this.selectedRowIndex)).value = this.pc_score;


      // let component: any = {};
      // component['sc_skatingprogramcomponentdefinitionid'] = this.score_summary_pc[this.selectedRowIndex]["sc_skatingprogramcomponentdefinitionid"];
      // component['competitorentryid'] = this.data['data']["competitorentryid"];
      // component['officialassignmentid'] =  this.activatedRoute.snapshot.params.assignmentid;
      // component['value'] = this.pc_score;
      // console.log("Program Component Value Added", component)

      // logic for change local
      this.program_componentValue[this.selectedRowIndex] = this.pc_score;

      this.onButtonClick();
      this.data['programComponent'] = this.program_componentValue;

      console.log("new data after pc change", this.program_componentValue);


      // logic for emitiing socket function

      var pcOutput: any = {};
      pcOutput["competitorentryid"] = this.data["skater_data"]["competitorentryid"];
      pcOutput["method_name"] = "REFPC";
      pcOutput["room"] = this.data["room"];


      var pc_count: any = 0;
      for (let i = 0; i < this.program_componentValue.length; i++) {
        if (this.program_componentValue[i] != -1) {
          console.log("inside if condition");
          pc_count++;
        }
      }

      console.log("pc count -- ", pc_count);

      pcOutput["pc_count"] = pc_count;

      var pc_data: any = {};
      pc_data["competitorentryid"] = this.data["skater_data"]["competitorentryid"];
      pc_data['officialassignmentid'] = this.data["assignmentid"];
      pc_data["sc_skatingprogramcomponentdefinitionid"] = this.score_summary_pc[this.selectedRowIndex]["sc_skatingprogramcomponentdefinitionid"];
      pc_data["value"] = this.pc_score;

      pcOutput["data"] = pc_data;

      this._chatService.broadcast(pcOutput);





      if (this.selectedRowIndex < this.score_summary_pc.length - 1) {
        this.selectedRowIndex = this.selectedRowIndex + 1;

      }

      for (let i = 0; i < this.score_summary_pc.length; i++) {
        if (this.selectedRowIndex == i) {
          (<HTMLInputElement>document.getElementById("pc_label" + i)).style.backgroundColor = "#F2789F";
        } else {
          (<HTMLInputElement>document.getElementById("pc_label" + i)).style.backgroundColor = "khaki";
        }
      }


    }


  }

}


// confirmation dialog

@Component({
  selector: 'referee_confirmation',
  templateUrl: './referee_confirmation.html',
  styleUrls:
    ['./referee_confirmation.css']
})

export class ConfirmationDialog {

  pending_submit: any = [];
  goe_missing: any = [];
  pc_missing: any = [];


  constructor(public dialog: MatDialog, private dialogRef: MatDialogRef<ConfirmationDialog>, @Inject(MAT_DIALOG_DATA) public data: any, private languageSelector: LanguageSelector, private _chatService: ChatService, private activatedRoute: ActivatedRoute) {

    console.log("data coming into confimation box", data);

    // Finding on positions judge are assigned
    var officials = data["new_data"]["data"]["segmentid"]["official"].filter((record: any) => record.role == "469C7509-FEA6-EC11-983F-00224825E0C8");

    console.log("officials filter", officials);

    var positions = [];

    for (let i = 0; i < officials.length; i++) {
      positions.push(officials[i]["position"]);
    }

    console.log("positions", positions);

    // var remaining_submit_position = [];
    for (let m = 0; m < data["new_data"]["judgeStatus"].length; m++) {
      if (data["new_data"]["judgeStatus"][m] == 'progress' && positions.includes(m + 1) == true) {
        this.pending_submit.push(m + 1);
      }
    }

    console.log("pending submit", this.pending_submit);


    //var goe_missing = [];

    for (let n = 0; n < data["new_data"]["judgeGoeCount"].length; n++) {
      if (data["new_data"]["judgeGoeCount"][n] != data["new_data"]["dataSource"].length && positions.includes(n + 1) == true) {
        this.goe_missing.push([n + 1, data["new_data"]["dataSource"].length - data["new_data"]["judgeGoeCount"][n]]);
      }
    }

    console.log("Goe missing", this.goe_missing);

    //var pc_missing = [];

    for (let x = 0; x < data["new_data"]["judgePcCount"].length; x++) {
      if (data["new_data"]["judgePcCount"][x] != data["new_data"]["data"]["segmentid"]["definitionid"]["programcomponents"].length && positions.includes(x + 1) == true) {
        this.pc_missing.push([x + 1, data["new_data"]["data"]["segmentid"]["definitionid"]["programcomponents"].length - data["new_data"]["judgePcCount"][x]]);
      }
    }

    console.log("PC missing", this.pc_missing);

  }

  confirmed() {
    console.log("Confirmed", this.data);

    this._chatService.broadcast(this.data["submit_output"]);

  }

}