import { Component, OnInit, Inject, Input, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogConfig } from '@angular/material/dialog';
import { LanguageSelector } from '../api.languageselector';
import { ChatService } from '../chat_service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


export interface Element {
  index: number;
  elementCode: string;
  goeValue: number;
  action: string;
  skateelementid: any;
}
/**
 * @title Basic use of `<table mat-table>`
 */

@Component({
  selector: 'app-judgescreen',
  templateUrl: './judgescreen.component.html',
  styleUrls: ['./judgescreen.component.css']
})

export class JudgescreenComponent implements OnInit {

  official_role_id: any = "469C7509-FEA6-EC11-983F-00224825E0C8";
  clip: any;
  user_access: any = false;
  video_feed: any = false;
  locator_url: any = "";

  on_join_data: any = {};
  skater_data: any = {};
  official_data: any = {};

  wbp_failed_index: any = [];
  review_index: any = [];

  // Variable Declaration for Panel Violation and Program Components
  elements: any = [];
  submit: any = false;

  violationValueNew: any = [];
  program_componentValue: any = [];
  dio_finalized: any = false;

  //Input data
  @Input() violationValue: any = this.violationValueNew;
  //@Input() component: any = 1;

  language!: string;
  //selectedRow: any;

  elements_array = <any>[];

  goeValue: any[] = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];;

  constructor(public dialog: MatDialog, private languageSelector: LanguageSelector, private _chatService: ChatService, private activatedRoute: ActivatedRoute, private _router: Router, private snackBar: MatSnackBar) {

    this._chatService.dio_entered_element_changed()
      .subscribe(coming_data => {

        //console.log("request coming", coming_data);

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

        //console.log("request coming",coming_data);


        // normal code

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

                  element_object['goeValue'] = this.dataSource[k].goeValue;
                  element_object['status'] = this.dataSource[k].status;
                  element_object['elmclip'] = this.dataSource[k].elmclip;

                  elements_array.push(element_object);
                  element_object = {};

                }

                element_object['index'] = elements_array.length + 1;
                element_object['skateelementid'] = "";
                element_object['elementCode'] = whole_string_data;

                element_object['goeValue'] = "";
                element_object['status'] = "Active";
                element_object['elmclip'] = "";

                elements_array.push(element_object);
                element_object = {};

                this.dataSource = elements_array;

              }

              // code when adding mor than one like A +2T
              if (coming_data.details.index < this.dataSource.length) {

                this.dataSource[coming_data.details.index]['elementCode'] = whole_string_data;
                this.dataSource[coming_data.details.index]['status'] = "Active";
              }
            }
          }
        }

        else {

          if (coming_data.details.input_code != "") {
            //console.log("in else looppp...")

            if (coming_data.details.edit_row_index <= this.dataSource.length) {

              this.dataSource[coming_data.details.edit_row_index - 1]['skateelementid'] = '';
              this.dataSource[coming_data.details.edit_row_index - 1]['elementCode'] = whole_string_data;
              this.dataSource[coming_data.details.edit_row_index - 1]['status'] = "Active";

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
              data_example["goeValue"] = "";
              data_example['status'] = "Active";

              modified_elements.push(data_example);

              data_example = {};

              data_example["index"] = modified_elements.length + 1;
              data_example["elementCode"] = this.dataSource[b]["elementCode"];
              data_example["skateelementid"] = this.dataSource[b]["skateelementid"];
              data_example["elmclip"] = this.dataSource[b]["elmclip"];
              data_example["goeValue"] = this.dataSource[b]["goeValue"];
              data_example['status'] = this.dataSource[b]["status"];

              modified_elements.push(data_example);
            }

            else {

              let data_example: any = {};

              data_example["index"] = modified_elements.length + 1;
              data_example["elementCode"] = this.dataSource[b]["elementCode"];


              data_example["skateelementid"] = this.dataSource[b]["skateelementid"];

              data_example["elmclip"] = this.dataSource[b]["elmclip"];
              data_example["goeValue"] = this.dataSource[b]["goeValue"];
              data_example['status'] = this.dataSource[b]["status"];

              modified_elements.push(data_example);
            }
          }
          this.dataSource = modified_elements;


        }


        //console.log("datasource before", JSON.parse(JSON.stringify(this.dataSource)));


      });


    this._chatService.cancel_button_response()
      .subscribe(coming_data => {

        console.log("cancel button clicked", coming_data);

        if (coming_data.details.row_index != -1) {

          if (coming_data.details.index < this.dataSource.length) {
            //console.log("for insertt before");
            var modified_elements = <any>[];

            for (let b = 0; b < this.dataSource.length; b++) {

              if (b == coming_data.details.row_index - 1) {
              }
              else {
                let data_example: any = {};

                data_example["index"] = modified_elements.length + 1;
                data_example["elementCode"] = this.dataSource[b].elementCode;
                data_example["skateelementid"] = this.dataSource[b].skateelementid;
                data_example["elmclip"] = this.dataSource[b]["elmclip"];

                data_example['goeValue'] = this.dataSource[b].goeValue;

                data_example['status'] = this.dataSource[b].status;


                modified_elements.push(data_example);
              }


            }

            this.dataSource = modified_elements;
            this.elements_array = this.dataSource;

          }
          else {
            //console.log("for edit", this.dataSource);
            //console.log("for edit coming data",coming_data );

            var modified_elements = <any>[];

            for (let b = 0; b < this.dataSource.length; b++) {

              if (b == coming_data.details.row_index - 1) {
                let data_example: any = {};

                data_example["index"] = modified_elements.length + 1;
                data_example["elementCode"] = coming_data.details.dataSource[b].name;
                data_example["skateelementid"] = coming_data.details.dataSource[b].skateelementid;
                data_example["elmclip"] = this.dataSource[b]["elmclip"];

                data_example['goeValue'] = this.dataSource[b].goeValue;
                data_example['status'] = "completed";

                modified_elements.push(data_example);

              }
              else {
                let data_example: any = {};

                data_example["index"] = modified_elements.length + 1;
                data_example["elementCode"] = this.dataSource[b].elementCode;
                data_example["skateelementid"] = this.dataSource[b].skateelementid;
                data_example["elmclip"] = this.dataSource[b]["elmclip"];

                data_example['goeValue'] = this.dataSource[b].goeValue;
                data_example['status'] = this.dataSource[b].status;

                modified_elements.push(data_example);
              }


            }

            this.dataSource = modified_elements;
            this.elements_array = this.dataSource;

            //console.log("for edit after", this.dataSource);
          }

        }
        else {

          console.log("normal case at the end add");

          var modified_elements = <any>[];

          for (let b = 0; b < this.dataSource.length; b++) {

            if (b < coming_data.details.dataSource.length) {
              let data_example: any = {};

              data_example["index"] = modified_elements.length + 1;
              data_example["elementCode"] = coming_data.details.dataSource[b].name;
              data_example["skateelementid"] = this.dataSource[b]["skateelementid"];
              data_example["elmclip"] = this.dataSource[b]["elmclip"];

              data_example['goeValue'] = this.dataSource[b].goeValue;

              data_example['status'] = this.dataSource[b].status;

              modified_elements.push(data_example);

            }


          }

          this.dataSource = modified_elements;
          this.elements_array = this.dataSource;

        }

        //console.log("cancel button clicked in end", this.dataSource);

      });


    this._chatService.onBroadcastResp()
      .subscribe(data => {


        var incoming_data = JSON.parse(JSON.stringify(data));

        switch (incoming_data.method_name) {
          case "SEGEND":

            console.log("Segment end");

            if (this.activatedRoute.snapshot.params.segmentid == data.room) {
              console.log("room closed")
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
            }
            break;


          case "SEGMENT_START_FINISHED":

            if (this.activatedRoute.snapshot.params.segmentid == data.room) {

              console.log("segment start finsished", incoming_data);

              var chat_room: any = {};
              chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;

              chat_room["method_name"] = 'NEWCLIENT';
              chat_room["data"] = { 'official_assignment_id': this.activatedRoute.snapshot.params.assignmentid };

              //this._chatService.createRoom(chat_room);
              this._chatService.broadcast(chat_room);

            }
            break;


          case "NEWELM":


            var temp = JSON.parse(JSON.stringify(data))
            console.log("new element added", temp);

            //console.log("before data sourse", this.dataSource, this.dataSource.length)

            //console.log("datasourse before doing any operation", JSON.parse(JSON.stringify(this.dataSource)));


            // code generating based on level and modifier 

            var whole_string_data = "";

            if (temp["data"]["input_data"].hasOwnProperty('elements') == true) {
              for (let x = 0; x < temp["data"]["input_data"]["elements"].length; x++) {

                var element_codes = this.on_join_data.segmentid.definitionid.sc_elementconfiguration.elements.filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == temp["data"]["createdElement"]["element_definitions"][x]);

                //console.log("element code data", element_codes);


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
                  var tem = "";
                  for (let a = 0; a < temp["data"]["input_data"]["elements"][x]['Synchro_element_suffix'].length; a++) {
                    tem = tem + temp["data"]["input_data"]["elements"][x]['Synchro_element_suffix'][a];
                  }
                  individual_string = individual_string + "+" + tem;

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

            //console.log("whole string ready for use", whole_string_data);
            // new element old listener code



            // 3 place this is used
            if (temp["data"]["createdElement"]["position"] > this.dataSource.length) {
              //console.log("data in add coming from server")


              var elements_array = <any>[];
              var element_object = <any>{};

              for (let k = 0; k < this.dataSource.length; k++) {

                element_object['index'] = elements_array.length + 1;
                element_object['skateelementid'] = this.dataSource[k].skateelementid;
                element_object['elementCode'] = this.dataSource[k].elementCode;

                element_object['goeValue'] = this.dataSource[k].goeValue;
                element_object['status'] = this.dataSource[k].status;
                element_object['elmclip'] = this.dataSource[k].elmclip;

                elements_array.push(element_object);
                element_object = {};

              }

              element_object['index'] = elements_array.length + 1;
              element_object['skateelementid'] = temp["data"]["createdElement"]["newid"];
              element_object['elementCode'] = whole_string_data;

              element_object['goeValue'] = "";
              element_object['status'] = "completed";
              element_object['elmclip'] = "";

              elements_array.push(element_object);
              element_object = {};

              this.dataSource = elements_array;

            }
            else {


              if (this.dataSource[temp["data"]["createdElement"]["position"] - 1]["status"] == "completed") {
                //console.log("data in add coming for insert before but from server", temp)


                var elements_array = <any>[];
                var element_object = <any>{};

                for (let k = 0; k < this.dataSource.length; k++) {

                  if (k < temp["data"]["createdElement"]["position"] - 1) {

                    element_object['index'] = elements_array.length + 1;
                    element_object['skateelementid'] = this.dataSource[k]["skateelementid"];
                    element_object['elementCode'] = this.dataSource[k]["elementCode"];
                    element_object['goeValue'] = this.dataSource[k]["goeValue"];
                    element_object['status'] = this.dataSource[k]["status"];
                    element_object['elmclip'] = this.dataSource[k]["elmclip"];

                    elements_array.push(element_object);
                    element_object = {};
                  }
                  else if (k == temp["data"]["createdElement"]["position"] - 1) {
                    element_object['index'] = elements_array.length + 1;
                    element_object['skateelementid'] = temp["data"]["createdElement"]["newid"];
                    element_object['elementCode'] = whole_string_data;
                    element_object['goeValue'] = "";
                    element_object['status'] = "completed";
                    element_object['elmclip'] = "";

                    elements_array.push(element_object);
                    element_object = {};

                    element_object['index'] = elements_array.length + 1;
                    element_object['skateelementid'] = this.dataSource[k]["skateelementid"];
                    element_object['elementCode'] = this.dataSource[k]["elementCode"];
                    element_object['goeValue'] = this.dataSource[k]["goeValue"];
                    element_object['status'] = this.dataSource[k]["status"];
                    element_object['elmclip'] = this.dataSource[k]["elmclip"];

                    elements_array.push(element_object);
                    element_object = {};

                  }
                  else {
                    element_object['index'] = elements_array.length + 1;
                    element_object['skateelementid'] = this.dataSource[k]["skateelementid"];
                    element_object['elementCode'] = this.dataSource[k]["elementCode"];
                    element_object['goeValue'] = this.dataSource[k]["goeValue"];
                    element_object['status'] = this.dataSource[k]["status"];
                    element_object['elmclip'] = this.dataSource[k]["elmclip"];

                    elements_array.push(element_object);
                    element_object = {};
                  }


                }



                this.dataSource = elements_array;


              }

              if (this.dataSource[temp["data"]["createdElement"]["position"] - 1]["status"] == "Active") {
                //console.log("data in add coming from local")


                this.dataSource[temp["data"]["createdElement"]["position"] - 1]["skateelementid"] = temp["data"]["createdElement"]["newid"]
                this.dataSource[temp["data"]["createdElement"]["position"] - 1]['elementCode'] = whole_string_data;


                // logic for sending goe values which were remain pending due to in process element
                //console.log("datasource before new elm", JSON.parse(JSON.stringify(this.dataSource)));



                for (let i = 0; i < this.dataSource.length; i++) {


                  if (this.dataSource[i]['status'] == "Active" && this.dataSource[i]['goeValue'] !== "" && this.dataSource[i]["skateelementid"] != "") {

                    // code for goes sending request to server


                    var goeOutput: any = {};
                    goeOutput["competitorentryid"] = this.skater_data["competitorentryid"];
                    goeOutput["method_name"] = "JUDGEGOE";
                    goeOutput["room"] = this.activatedRoute.snapshot.params.segmentid;

                    var goeCount: any = 0;
                    for (let i = 0; i < this.dataSource.length; i++) {
                      //console.log("inside for loop", this.dataSource[i].goeValue);
                      //console.log("inside for loop --- ", this.dataSource[i].goeValue != "");

                      if (this.dataSource[i].goeValue !== "") {
                        //console.log("Inside if condition")
                        goeCount++;
                      }
                    }

                    //console.log("count", goeCount)


                    goeOutput["goe_count"] = goeCount;

                    var goe_data: any = {};
                    goe_data["skateelementid"] = this.dataSource[i]['skateelementid'];
                    goe_data["officialassignmentid"] = this.activatedRoute.snapshot.params.assignmentid;
                    goe_data['goevalue'] = this.dataSource[i]['goeValue'];


                    goeOutput["data"] = goe_data;

                    this._chatService.broadcast(goeOutput);

                    // change status after sending request

                    this.dataSource[i]['status'] = "completed";


                  }
                }


                this.dataSource[temp["data"]["createdElement"]["position"] - 1]['status'] = "completed";


              }



            }

            //dio_element_added = true;

            //console.log("datasource after new elm", JSON.parse(JSON.stringify(this.dataSource)));

            break;

          case "CHGELM":


            var temp = JSON.parse(JSON.stringify(data))

            console.log("element chaged", temp)


            this.dataSource[temp["data"]["position"] - 1]["skateelementid"] = temp["data"]["newid"]

            //console.log("datasource",this.dataSource)


            var whole_string_data = "";

            if (temp["data"]["input_data"].hasOwnProperty('elements') == true) {
              for (let x = 0; x < temp["data"]["input_data"]["elements"].length; x++) {

                var element_codes = this.on_join_data.segmentid.definitionid.sc_elementconfiguration.elements.filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == temp["data"]["element_definitions"][x]);

                //console.log("element code data", element_codes);


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
                  var tem = "";
                  for (let a = 0; a < temp["data"]["input_data"]["elements"][x]['Synchro_element_suffix'].length; a++) {
                    tem = tem + temp["data"]["input_data"]["elements"][x]['Synchro_element_suffix'][a];
                  }
                  individual_string = individual_string + "+" + tem;

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

            //console.log("whole string ready for use", whole_string_data);


            //updating interface

            this.dataSource[temp["data"]["position"] - 1]['elementCode'] = whole_string_data;


            this.dataSource[temp["data"]["position"] - 1]['status'] = "completed";

            //console.log("datasource after", JSON.parse(JSON.stringify(this.dataSource)));

            // logic for highlight edited things

            if (this.wbp_failed_index.includes(temp["data"]["position"]) == false) {
              this.wbp_failed_index.push(temp["data"]["position"]);
            }


            //console.log("after change highlight ^^^^^^^^^^^^^", this.wbp_failed_index);

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

            //console.log("datasource after", this.dataSource);

            // event for informing other user that is goe count is affected do to this ?

            var goe_count_output: any = {};
            goe_count_output["competitorentryid"] = this.skater_data["competitorentryid"];
            goe_count_output["method_name"] = "GOE_COUNT_UPDATE";
            goe_count_output["room"] = this.activatedRoute.snapshot.params.segmentid;


            var count = 0;
            for (let i = 0; i < this.dataSource.length; i++) {

              if (this.dataSource[i].goeValue !== '' && this.dataSource[i]["status"] == 'completed') {
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


            if (temp["data"]["data"]["statusmessage"] == "finalize") {
              this.dio_finalized = true;
            }

            break;

          case "JUDGEGOE":

            var temp = JSON.parse(JSON.stringify(data))


            if (temp["data"]["official_assignment_id"] == this.activatedRoute.snapshot.params.assignmentid) {

              console.log("JUDGEGOE", temp);


              for (let i = 0; i < this.dataSource.length; i++) {
                if (this.dataSource[i]["skateelementid"] == temp["data"]["skate_element_id"]) {

                  this.dataSource[i]['goeValue'] = temp["data"]["goevalue"];


                }
              }

              //console.log("this datasource after goe", this.dataSource)

            }



            break;

          case "JUDGESTATUS":

            var temp = JSON.parse(JSON.stringify(data))

            if (temp["data"]["data"]["official_assignment_id"] == this.activatedRoute.snapshot.params.assignmentid) {
              if (temp["data"]["data"]["competitorentryid"] == this.skater_data.competitorentryid) {


                if (temp["data"]["data"]["statusmessage"] == "Submit") {

                  if (temp["data"]["data"]["submit"] == true) {
                    var disSubmit = <HTMLInputElement>document.getElementById("submit");
                    disSubmit.style.backgroundColor = "#cb3a3a", "important";
                    disSubmit.style.color = "#443c3c", "important";
                    this.submit = true;
                  }
                  else {
                    var disSubmit = <HTMLInputElement>document.getElementById("submit");
                    disSubmit.style.backgroundColor = "";
                    disSubmit.style.color = "";
                    this.submit = false;
                  }

                }

                console.log("JUDGESTATUS", temp, temp["data"]["data"]["submit"]);
              }
            }


            break;

          case "JUDGEPC":

            var temp = JSON.parse(JSON.stringify(data))


            if (temp["data"]["req_data"]["officialassignmentid"] == this.activatedRoute.snapshot.params.assignmentid) {
              console.log("JUDGEPC", temp);

              var program_component: any;

              program_component = this.on_join_data.segmentid.definitionid.programcomponents;
              for (var i = 0; i < program_component.length; i++) {
                if (program_component[i]["sc_skatingprogramcomponentdefinitionid"] == temp["data"]["req_data"]["sc_skatingprogramcomponentdefinitionid"]) {
                  this.program_componentValue[i] = temp["data"]["req_data"]["value"];
                }

              }
            }

            break;

          case "JUDGEADJ":

            var temp = JSON.parse(JSON.stringify(data))

            if (temp["data"]["req_data"]["officialassignmentid"] == this.activatedRoute.snapshot.params.assignmentid) {
              console.log("JUDGEADJ", temp);

              var Panel_violation: any;
              var selected_element: any;

              Panel_violation = this.on_join_data.segmentid.definitionid.bonuses_deduction;
              selected_element = Panel_violation.filter((record: any) => record.sc_adjustmentdefinition.sc_type == "947960000");

              for (let i = 0; i < selected_element.length; i++) {
                if (selected_element[i]["sc_skatingadjustmentassociationid"] == temp["data"]["req_data"]["sc_skatingadjustmentassociationid"]) {
                  this.violationValueNew[i] = temp["data"]["req_data"]["value"];
                }
              }
            }

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

            //console.log("clip com", this.dataSource);

            break;

          case "LOAD_SKATER":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("LOAD_SKATER", temp);

            this.clip = [];
            this.wbp_failed_index = [];
            this.review_index = [];

            this.dio_finalized = false;
            this.submit = false;

            for (let i = 0; i < this.violationValueNew.length; i++) {
              this.violationValueNew[i] = 0;
            }

            for (let i = 0; i < this.program_componentValue.length; i++) {
              this.program_componentValue[i] = -1;
            }

            // this.violationValueNew = [];
            // this.program_componentValue = [];
            this.elements_array = [];

            const ELEMENT_DATA: Element[] = this.elements_array;
            this.dataSource = ELEMENT_DATA;

            this.selectedRowIndex = -1;
            this.skater_data = temp["data"];

            this.newData = {
              'data': this.on_join_data,
              'violationValue': this.violationValueNew,
              'programComponent': this.program_componentValue,
              'skater_data': this.skater_data,
              'assignmentid': this.activatedRoute.snapshot.params.assignmentid,
              'room': this.activatedRoute.snapshot.params.segmentid
            }
            //this.newData["skater_data"] = this.skater_data;

            // change color of button and enable screen if not

            var disSubmit = <HTMLInputElement>document.getElementById("submit");
            disSubmit.style.backgroundColor = "";
            disSubmit.style.color = "";
            disSubmit.disabled = false;

            const test = Array.from(document.getElementsByClassName('grid-container') as HTMLCollectionOf<HTMLElement>)

            test.forEach((element) => {
              element.style.opacity = '';

              element.style.backgroundColor = '';
              element.style.zIndex = '';
              element.style.pointerEvents = '';
            });


            break;

          case "JOINING_ROOM":
            var temp = JSON.parse(JSON.stringify(data))

            var required_data = temp["returnObj"];
            console.log("JOINING_ROOM", required_data);

            var dataObj = JSON.parse(JSON.stringify(required_data));
            //console.log(data.inroom)

            //.log("returned data = " + dataObj.inroom);
            if (dataObj.inroom) {
              //console.log("room exists and you're in it and here's your data objects!")
              console.log(dataObj.initializationObj);
              console.log(dataObj.chatHistoryObj);

              this.clip = [];
              this.wbp_failed_index = [];
              this.review_index = [];

              this.dio_finalized = false;
              this.submit = false;

              this.elements_array = [];

              const ELEMENT_DATA1: Element[] = this.elements_array;
              this.dataSource = ELEMENT_DATA1;

              this.selectedRowIndex = -1;
              this.skater_data = {};


              this.on_join_data = JSON.parse(dataObj.initializationObj);

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

                    if ((official_data[0].sc_officialid.sc_scnum == sessionStorage.getItem('scnum') && official_data[0]['role'] == '469C7509-FEA6-EC11-983F-00224825E0C8') || ds_data.length > 0) {

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


              // console.log("^^^^^^^^^^^^ This on join data after sort pc value", this.on_join_data);

              this.newData["data"] = this.on_join_data;

              //add comment
              //this.user_access = true;

              // official data

              var temp_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == this.activatedRoute.snapshot.params.assignmentid);
              //  console.log("offcial info", temp_data);


              if (temp_data.length > 0) {
                this.official_data = temp_data[0];


                //console.log("offcial data", this.official_data);

              }

              console.log("rink id", this.on_join_data.segmentid.rinkid);
              if (this.on_join_data.segmentid.rinkid != null) {
                if (this.on_join_data.segmentid.rinkid.hasOwnProperty('videofeed')) {

                  this.locator_url = this.on_join_data.segmentid.rinkid.locator_url;
                  this.video_feed = true;

                }
              }

              // code execution after getting object
              this.elements = this.on_join_data.segmentid.definitionid.sc_elementconfiguration.elements;
              //declaration of the PV and PC
              var Panel_violation: any;
              var program_component: any;
              var selected_element: any;
              //Panel violations, Filter the data according to sc_type = "947960000"
              Panel_violation = this.on_join_data.segmentid.definitionid.bonuses_deduction;
              selected_element = Panel_violation.filter((record: any) => record.sc_adjustmentdefinition.sc_type == "947960000");
              for (var i = 0; i < selected_element.length; i++) {
                this.violationValueNew.push(0);
              }
              //Program Component, check the data accroding to length
              program_component = this.on_join_data.segmentid.definitionid.programcomponents;
              for (var i = 0; i < program_component.length; i++) {
                this.program_componentValue.push(-1);
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
                data_example['goeValue'] = this.dataSource[k]["goeValue"];
                data_example["status"] = this.dataSource[k]["status"];



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


          case 'CLIP_CODE_CHANGE':

            var temp = JSON.parse(JSON.stringify(data))
            console.log("CLIP_CODE_CHANGE", temp);


            var elements_array = <any>[];
            var element_object = <any>{};

            for (let m = 0; m < this.dataSource.length; m++) {

              //  console.log("something changed123 in loop", data.details, m);
              element_object['index'] = elements_array.length + 1;
              element_object['skateelementid'] = this.dataSource[m].skateelementid;
              element_object['elementCode'] = this.dataSource[m].elementCode;
              if (m <= temp.data.data.details.length - 1) {
                element_object['elmclip'] = temp.data.data.details[m]["elmclip"];
              }
              else {
                element_object['elmclip'] = "";
              }


              //element_object['elmclip'] = "12";
              element_object['goeValue'] = this.dataSource[m].goeValue;
              element_object['status'] = this.dataSource[m]["status"];

              elements_array.push(element_object);
              element_object = {};
            }

            this.dataSource = elements_array;

            //console.log("this datasource after video clip", this.dataSource)
            break;


          case "STOPSKATER":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("STOPSKATER", temp)

            this.clip = [];
            this.dio_finalized = false;
            this.review_index = [];
            this.wbp_failed_index = [];
            this.submit = false;



            for (let i = 0; i < this.violationValueNew.length; i++) {
              this.violationValueNew[i] = 0;
            }

            for (let i = 0; i < this.program_componentValue.length; i++) {
              this.program_componentValue[i] = -1;
            }

            this.elements_array = [];

            const ELEMENT_DATA1: Element[] = this.elements_array;
            this.dataSource = ELEMENT_DATA1;

            this.selectedRowIndex = -1;
            this.skater_data = {};

            this.newData = {
              'data': this.on_join_data,
              'violationValue': this.violationValueNew,
              'programComponent': this.program_componentValue,
              'skater_data': this.skater_data,
              'assignmentid': this.activatedRoute.snapshot.params.assignmentid,
              'room': this.activatedRoute.snapshot.params.segmentid
            }

            // change color of button and enable screen if not

            var disSubmit = <HTMLInputElement>document.getElementById("submit");
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



          case "PANELMSG":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("PANELMSG", temp);

            for (let j = 0; j < temp["data"]["data"]["users"].length; j++) {
              if (temp["data"]["data"]["users"][j]["officialassignmentid"] == this.activatedRoute.snapshot.params.assignmentid) {

                if (temp["data"]["data"]["message"] == "Please hurry up..!") {
                  this.snackBar.open(temp["data"]["data"]["message"], "close", {
                    duration: 10000,
                    verticalPosition: 'top',
                    panelClass: ['red-snackbar']
                  });
                }
                else {
                  this.snackBar.open(temp["data"]["data"]["message"], "close", {
                    duration: 10000,
                    verticalPosition: 'top',
                    panelClass: ['yellow-snackbar']
                  });
                }
              }
            }

            break;

          case "SCORESKATE":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("SCORESKATE", temp);

            const test1 = Array.from(document.getElementsByClassName('grid-container') as HTMLCollectionOf<HTMLElement>)

            test1.forEach((element) => {
              element.style.opacity = '0.75';

              element.style.backgroundColor = '#bebebe';
              element.style.zIndex = '9999999';
              element.style.pointerEvents = 'none';
            });


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

            //console.log("this array data", this.review_index)

            break;


          default:
            console.log("Default case");
            break;
        }



      });



    this._chatService.referee_messages_broadcast()
      .subscribe(coming_data => {

        //console.log("referee message coming = ", coming_data.room, " and message_details = ", coming_data.message_details);

        if (coming_data.message_details == "Please hurry Up!") {
          this.snackBar.open(coming_data.message_details, "close", {
            duration: 100000,
            verticalPosition: 'top',
            panelClass: ['red-snackbar']
          });
        }
        else {
          this.snackBar.open(coming_data.message_details, "close", {
            duration: 100000,
            verticalPosition: 'top',
            panelClass: ['yellow-snackbar']
          });
        }
      });
  }




  displayedColumns: string[] = ['index', 'elementCode', 'goeValue', 'elmclip'];
  dataSource: any;
  //index = this.elements.length;
  selectedRowIndex: any = -1;
  name_testing: any = "Active";

  ngOnInit(): void {

    console.log("starting here", sessionStorage.getItem("isOnline"))

    var chat_room: any = {};
    chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;;

    chat_room["method_name"] = 'NEWCLIENT';
    chat_room["data"] = { 'official_assignment_id': this.activatedRoute.snapshot.params.assignmentid };

    //this._chatService.createRoom(chat_room);
    this._chatService.broadcast(chat_room);


    this.language = this.languageSelector.getLanguage();

    //console.log("All Element Array: ", elements_array);

    const ELEMENT_DATA: Element[] = this.elements_array;
    this.dataSource = ELEMENT_DATA;

  }


  // no needed may be
  element_data: any = this.elements[0];

  // Element Click Event For Auto Selection Of The Next Row

  element_click(input: any) {

    if (this.skater_data.hasOwnProperty('competitorentryid')) {
      //console.log("row data", input)
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

  // GoeValueClicked function fFor Selecting a GoeValue

  JudgeGOE(index: any, input: any) {

    if (this.skater_data.hasOwnProperty('competitorentryid')) {
      if (this.selectedRowIndex != -1) {

        var goeOutput: any = {};
        var modifyData = this.dataSource;
        modifyData[this.selectedRowIndex - 1]['goeValue'] = input;
        this.dataSource = modifyData;

        const index = this.wbp_failed_index.indexOf(this.selectedRowIndex);
        if (index > -1) { // only splice array when item is found
          this.wbp_failed_index.splice(index, 1); // 2nd parameter means remove one item only
        }

        if (this.dataSource[this.selectedRowIndex - 1]['status'] == "completed") {

          // logic for emiting socket function

          var goeOutput: any = {};
          goeOutput["competitorentryid"] = this.skater_data["competitorentryid"];
          goeOutput["method_name"] = "JUDGEGOE";
          goeOutput["room"] = this.activatedRoute.snapshot.params.segmentid;

          // logic for sending extra details for referee



          //console.log("ths datasourse for count", JSON.parse(JSON.stringify(this.dataSource)));

          var goeCount: any = 0;
          for (let i = 0; i < this.dataSource.length; i++) {
            // console.log("inside for loop", this.dataSource[i].goeValue);
            // console.log("inside for loop --- ", this.dataSource[i].goeValue != "");
            // console.log("inside for loop", this.dataSource[i].goeValue == 0);


            if (this.dataSource[i].goeValue !== '') {
              //console.log("Inside if condition")
              goeCount++;
            }

          }

          //console.log("count", goeCount)


          goeOutput["goe_count"] = goeCount;

          var goe_data: any = {};
          goe_data["skateelementid"] = this.dataSource[this.selectedRowIndex - 1]['skateelementid'];
          goe_data["officialassignmentid"] = this.activatedRoute.snapshot.params.assignmentid;
          goe_data['goevalue'] = input;


          goeOutput["data"] = goe_data;

          this._chatService.broadcast(goeOutput);

        }

        var rows = document.querySelectorAll('#element_table tr');

        rows[this.selectedRowIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

        // Automatic Increment of the index according to GOE value entered

        // if (this.dataSource.length == this.index) {
        //   //Do nothing
        // }
        if (this.dataSource.length == this.selectedRowIndex) {

        }
        //Go to the next row
        else {
          this.selectedRowIndex = this.selectedRowIndex + 1;
          // this.index = this.index + 1;
        }
      }
    }



  }


  data = this.on_join_data;

  newData = {
    'data': this.on_join_data,
    'violationValue': this.violationValueNew,
    'programComponent': this.program_componentValue,
    'skater_data': this.skater_data,
    'assignmentid': this.activatedRoute.snapshot.params.assignmentid,
    'room': this.activatedRoute.snapshot.params.segmentid
  }


  // Open dialog box for scoreSummary
  judgeScoreSummary() {
    if (this.skater_data.hasOwnProperty('competitorentryid')) {
      const dialogRef = this.dialog.open(JudgeScreenScoreSummary, {
        data: this.newData,
        height: '500px',
        width: '900px',
      });
    }
  }


  // Open dialog box for onViolations
  judgeADJ() {
    if (this.skater_data.hasOwnProperty('competitorentryid')) {
      const dialogRef = this.dialog.open(JudgeScreenViolation, {
        data: this.newData,
        height: '500px',
        width: '900px',
      });
    }
  }

  // Open dialog box for onProgramComponents
  judgePC() {
    if (this.skater_data.hasOwnProperty('competitorentryid')) {
      const dialogRef = this.dialog.open(JudgeScreenProgramComponent, {
        data: this.newData,
        height: '500px',
        width: '900px',
      });
    }
  }

  //Submit elements
  judgeOnSubmit() {
    // let submit: any = {};
    // submit['officialassignmentid'] = json_test_data.segmentid.offical.officialassignmentid;
    // submit['submit'] = true;
    // console.log("Judge Status Update on Submit Elements: ", submit)

    // logic for emiting socket function

    if (this.skater_data.hasOwnProperty('competitorentryid')) {

      // logic for sending goe values which were remain pending due to in process element - if remaining in any use case

      for (let i = 0; i < this.dataSource.length; i++) {


        if (this.dataSource[i]['status'] == "Active" && this.dataSource[i]['goeValue'] !== "") {

          // code for goes sending request to server

          var goeOutput: any = {};
          goeOutput["competitorentryid"] = this.skater_data["competitorentryid"];
          goeOutput["method_name"] = "JUDGEGOE";
          goeOutput["room"] = this.activatedRoute.snapshot.params.segmentid;

          var goe_data: any = {};
          goe_data["skateelementid"] = this.dataSource[i]['skateelementid'];
          goe_data["officialassignmentid"] = this.activatedRoute.snapshot.params.assignmentid;
          goe_data['goevalue'] = this.dataSource[i]['goeValue'];


          goeOutput["data"] = goe_data;

          this._chatService.broadcast(goeOutput);

          // change status after sending request

          this.dataSource[i]['status'] = "completed";


        }
      }


      var temp = this.submit;
      var value;

      if (temp == false) {
        value = true;
      }
      else {
        value = false;
      }


      //console.log("request coming",this.newData);

      //console.log("condition checked",this.newData.programComponent.includes(-1));

      var goeCount: any = 0;
      for (let i = 0; i < this.dataSource.length; i++) {


        if (this.dataSource[i].goeValue !== '') {
          goeCount++;
        }

      }

      //console.log("count", goeCount)


      // logic for status update
      var submit_output: any = {};
      submit_output["competitorentryid"] = this.skater_data["competitorentryid"];
      submit_output["method_name"] = "JUDGESTATUS";
      submit_output["room"] = this.activatedRoute.snapshot.params.segmentid;

      var submit_data: any = {};
      submit_data["statusmessage"] = "Submit";
      submit_data["official_assignment_id"] = this.activatedRoute.snapshot.params.assignmentid;
      submit_data["competitorentryid"] = this.skater_data["competitorentryid"];
      submit_data["submit"] = value;

      submit_output["data"] = submit_data;


      if (value == true) {

        if (this.newData.programComponent.includes(-1) == true || goeCount != this.dataSource.length) {
          //console.log("data is missing")

          const dialogRef = this.dialog.open(JudgeConfirmationDialog, {
            data: submit_output,
            width: '450px'
          });


        }
        else {
          //console.log("data is complete");
          // trigger server request
          this._chatService.broadcast(submit_output);

        }


      }
      else {
        // trigger server request
        //console.log("server reuqest to form else loop");

        this._chatService.broadcast(submit_output);
      }






    }


  }

  //judge help function 
  judgeOnHelp() {
    // let help: any = {};
    // help['help'] = true;
    // console.log("Judge Do you need a Help?", help)

    // logic for socket broadcast function

    var help_output: any = {};
    help_output["competitorentryid"] = this.skater_data["competitorentryid"];
    help_output["method_name"] = "JUDGESTATUS";
    help_output["room"] = this.activatedRoute.snapshot.params.segmentid;

    var help_data: any = {};
    help_data["statusmessage"] = "Help";
    help_data["official_assignment_id"] = this.activatedRoute.snapshot.params.assignmentid;


    help_output["data"] = help_data;

    this._chatService.broadcast(help_output);

  }

  parentFunction(data: any) {
    console.log("Judge screen parent function")
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

}

@Component({
  selector: 'judgescreen_scoresummary',
  templateUrl: './judgescreen_scoresummary.html',
  styleUrls: ['./judgescreen_scoresummary.css']
})

export class JudgeScreenScoreSummary implements OnInit {

  //Variable declaration
  score_summary_pc: any;
  score_summary_pv: any;
  language!: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private languageSelector: LanguageSelector) {

    //Filter the data according to Program component
    var program_component = data['data']["segmentid"]["definitionid"]["programcomponents"];
    this.score_summary_pc = program_component;

    //Filter the data according to Panel Violation
    var Panel_violation = data['data']["segmentid"]["definitionid"]["bonuses_deduction"];
    var selected_element = Panel_violation.filter((record: any) => record["sc_adjustmentdefinition"]["sc_type"] == "947960000");
    this.score_summary_pv = selected_element;
  }

  ngOnInit(): void {
    this.language = this.languageSelector.getLanguage();
  }
  sampleData = this.data;
}


@Component({
  selector: 'judgescreen_violation',
  templateUrl: './judgescreen_violation.html',
  styleUrls:
    ['./judgescreen_violation.css']


})
export class JudgeScreenViolation implements OnInit {

  language!: string;

  @Input() panel: any;
  @Input() violationValue: any = [];

  onAdd = new EventEmitter();

  //Button click event for panel violation
  onButtonClick() {
    this.onAdd.emit({
      panel: this.panel,
      violationValue: this.violationValue
    });
  }
  score_summary_pv: any;

  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any, private languageSelector: LanguageSelector, private _chatService: ChatService, private activatedRoute: ActivatedRoute) {

    //console.log("data coming in violation", data);


    var Panel_violation = data['data']["segmentid"]["definitionid"]["bonuses_deduction"];
    var selected_element = Panel_violation.filter((record: any) => record["sc_adjustmentdefinition"]["sc_type"] == "947960000");
    for (var i = 0; i < selected_element.length; i++) {
      //var temp = "";
      this.violationValue.push(this.data['violationValue'][i]);

    }

    this.score_summary_pv = selected_element;
    data = this.data;
  }

  ngOnInit() {
    this.language = this.languageSelector.getLanguage();
  }
  onOptionsSelected(value: any, position: any) {


    //logic for emitting violation values

    if (this.data["skater_data"].hasOwnProperty('skater_data')) {


      let pc_violation: any = this.score_summary_pv[position]["sc_skatingadjustmentassociationid"];

      // console.log("pc values",this.score_summary_pv[position]);

      let panel: any = {};
      panel['sc_skatingadjustmentdefinitionid'] = pc_violation;
      panel['competitorentryid'] = pc_violation;
      panel['officialassignmentid'] = pc_violation;
      panel['value'] = value;

      this.panel = panel;
      this.violationValue[position] = parseInt(value);
      this.onButtonClick();
      this.data['violationValue'] = this.violationValue;
      this.violationValue = this.violationValue;


      var violationOutput: any = {};
      violationOutput["competitorentryid"] = this.data["skater_data"]["competitorentryid"];
      violationOutput["method_name"] = "JUDGEADJ";
      violationOutput["room"] = this.data["room"];

      var violation_data: any = {};
      violation_data["competitorentryid"] = this.data["skater_data"]["competitorentryid"];
      violation_data['officialassignmentid'] = this.data["assignmentid"];
      violation_data["sc_skatingadjustmentassociationid"] = pc_violation;
      violation_data["value"] = value;

      violationOutput["data"] = violation_data;

      this._chatService.broadcast(violationOutput);


      //console.log("new data after option change", this.violationValue);

    }


  }

}

@Component({
  selector: 'judgescreen_programcomponent',
  templateUrl: './judgescreen_programcomponent.html',
  styleUrls:
    ['./judgescreen_programcomponent.css']


})
export class JudgeScreenProgramComponent implements OnInit {
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

  constructor(public dialog: MatDialog, private dialogRef: MatDialogRef<JudgeScreenProgramComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private languageSelector: LanguageSelector, private _chatService: ChatService, private activatedRoute: ActivatedRoute) {

    //console.log("data coming into pc", data);

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

    //console.log("this selected row index", this.selectedRowIndex);

    if (this.data["skater_data"].hasOwnProperty('skater_data')) {

      var pc_output = (<HTMLInputElement>document.getElementById("program_component" + this.selectedRowIndex)).value;
      var decimal = +pc_output + item;
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


      // local change


      this.program_componentValue[this.selectedRowIndex] = this.pc_score;

      this.onButtonClick();
      this.data['programComponent'] = this.program_componentValue;

      //console.log("new data after pc change", this.program_componentValue);


      // logic for emitiing socket function

      var pcOutput: any = {};
      pcOutput["competitorentryid"] = this.data["skater_data"]["competitorentryid"];
      pcOutput["method_name"] = "JUDGEPC";
      pcOutput["room"] = this.data["room"];

      var pc_count: any = 0;
      for (let i = 0; i < this.program_componentValue.length; i++) {
        if (this.program_componentValue[i] != -1) {
          //console.log("inside if condition");
          pc_count++;
        }
      }

      //console.log("pc count -- ", pc_count);

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
  selector: 'judge_confirmation',
  templateUrl: './judge_confirmation.html',
  styleUrls:
    ['./judge_confirmation.css']
})

export class JudgeConfirmationDialog {

  constructor(public dialog: MatDialog, private dialogRef: MatDialogRef<JudgeConfirmationDialog>, @Inject(MAT_DIALOG_DATA) public data: any, private languageSelector: LanguageSelector, private _chatService: ChatService, private activatedRoute: ActivatedRoute) {

    //console.log("data coming into confimation box", data);

  }

  confirmed() {
    //console.log("Confirmed",this.data);

    this._chatService.broadcast(this.data);

  }


}
