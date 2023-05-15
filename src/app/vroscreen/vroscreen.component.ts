import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
//import json_test_data from '../../../data.json';
import { LanguageSelector } from '../api.languageselector';
import { ChatService } from '../chat_service';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ActivatedRoute, Router } from '@angular/router';

export interface Element {
  index: number;
  elementCode: string;
  elmclip: any;
  skateelementid: any;
}
@Component({
  selector: 'app-vroscreen',
  templateUrl: './vroscreen.component.html',
  styleUrls: ['./vroscreen.component.css']
})
export class VROScreenComponent implements OnInit {


  elements: any = [];

  elements_array = <any>[];

  @Input() component: any = 1;

  official_role_id: any = "49E9C4A5-1EA9-EC11-983F-002248267FC3";
  clip: any;
  user_access: any = false;
  video_feed:any = false;
  locator_url:any = "";

  skater_data: any = {};
  wbp_failed_index: any = [];
  dio_finalized: any = false;
  review_index: any = [];

  room: any = this.activatedRoute.snapshot.params.segmentid;
  on_join_data: any = {};

  language!: string;
  //selectedRow: any;

  constructor(public dialog: MatDialog, private languageSelector: LanguageSelector, private _chatService: ChatService, private activatedRoute: ActivatedRoute, private snackBar: MatSnackBar, private _router: Router) {


    this._chatService.onBroadcastResp()
      .subscribe(data => {

        //console.log("in broadcast response", data)

        var incoming_data = JSON.parse(JSON.stringify(data));

        switch (incoming_data.method_name) {
          case "SEGEND":
            console.log("Segment end");

            if (this.activatedRoute.snapshot.params.segmentid == data.room) {
              this.user_access = false;
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

              // var chat_room: any = {};
              // chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;

              // chat_room["competitorentryid"] = "29de489e-a2a8-4885-b844-12e63fa9c03f";


              // this._chatService.joinRoom(chat_room);

              // var chat_room: any = {};
              // chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;;

              // chat_room["method_name"] = 'NEWCLIENT';
              // chat_room["data"] = { 'official_assignment_id': this.activatedRoute.snapshot.params.assignmentid };


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


              this._chatService.broadcast(chat_room);


            }
            break;


          case "NEWELM":


            var temp = JSON.parse(JSON.stringify(data))
            console.log("new element added", temp);

            //this.dataSource[temp["data"]["createdElement"]["position"]-1]["status"] = "completed"; 


            console.log("datasource", this.dataSource)

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

            console.log("whole string ready for use", whole_string_data);

            // old  code



            if (temp["data"]["createdElement"]["position"] < this.dataSource.length) {



              if (this.dataSource[temp["data"]["createdElement"]["position"] - 1]["status"] == "completed") {

                console.log("data in add coming for insert before but from server")

                var elements_array = <any>[];
                var element_object = <any>{};

                for (let k = 0; k < this.dataSource.length - 1; k++) {

                  if (k < temp["data"]["createdElement"]["position"] - 1) {

                    element_object['index'] = elements_array.length + 1;
                    element_object['skateelementid'] = this.dataSource[k]["skateelementid"];
                    element_object['elementCode'] = this.dataSource[k]["elementCode"];
                    element_object['status'] = this.dataSource[k]["status"];
                    element_object['elmclip'] = this.dataSource[k]["elmclip"];

                    elements_array.push(element_object);
                    element_object = {};
                  }
                  else if (k == temp["data"]["createdElement"]["position"] - 1) {
                    element_object['index'] = elements_array.length + 1;
                    element_object['skateelementid'] = temp["data"]["createdElement"]["newid"];
                    element_object['elementCode'] = whole_string_data;
                    element_object['status'] = "completed";
                    element_object['elmclip'] = this.dataSource[k]["elmclip"];

                    elements_array.push(element_object);
                    element_object = {};

                    element_object['index'] = elements_array.length + 1;
                    element_object['skateelementid'] = this.dataSource[k]["skateelementid"];
                    element_object['elementCode'] = this.dataSource[k]["elementCode"];
                    element_object['status'] = this.dataSource[k]["status"];
                    element_object['elmclip'] = this.dataSource[k + 1]["elmclip"];

                    elements_array.push(element_object);
                    element_object = {};

                  } else {
                    element_object['index'] = elements_array.length + 1;
                    element_object['skateelementid'] = this.dataSource[k]["skateelementid"];
                    element_object['elementCode'] = this.dataSource[k]["elementCode"];
                    element_object['status'] = this.dataSource[k]["status"];
                    element_object['elmclip'] = this.dataSource[k + 1]["elmclip"];

                    elements_array.push(element_object);
                    element_object = {};
                  }


                }

                if (elements_array[elements_array.length - 1].elmclip != "" || elements_array[elements_array.length - 1].elementCode != "") {


                  element_object['index'] = elements_array.length + 1;;
                  element_object['skateelementid'] = '';
                  element_object['elementCode'] = '';
                  element_object['elmclip'] = '';
                  element_object['status'] = '';

                  elements_array.push(element_object);
                  element_object = {};



                }

                this.dataSource = elements_array;
                this.elements_array = this.dataSource;


              }
              if (this.dataSource[temp["data"]["createdElement"]["position"] - 1]["status"] == "Active") {

                console.log("data in add coming from local")

                this.dataSource[temp["data"]["createdElement"]["position"] - 1]["skateelementid"] = temp["data"]["createdElement"]["newid"]
                this.dataSource[temp["data"]["createdElement"]["position"] - 1]['elementCode'] = whole_string_data;

                if (this.dataSource[this.dataSource.length - 1].elmclip != "" || this.dataSource[this.dataSource.length - 1].elementCode != "") {
                  var elements_array = <any>[];
                  var element_object = <any>{};


                  element_object['index'] = elements_array.length + 1;;
                  element_object['skateelementid'] = '';
                  element_object['elementCode'] = '';
                  element_object['elmclip'] = '';
                  element_object['status'] = '';

                  elements_array.push(element_object);
                  element_object = {};

                  const ELEMENT_DATA: Element[] = this.elements_array.concat(elements_array);

                  this.elements_array.push(elements_array[0]);

                  //console.log("element data", ELEMENT_DATA);
                  //Variable declaration 
                  this.dataSource = ELEMENT_DATA;


                }



                // add logic to send vroclips only if skate element is defined



                for (let i = 0; i < this.dataSource.length; i++) {
                  if (this.dataSource[i]['skateelementid']) {
                    var clipOutput: any = {};
                    clipOutput["competitorentryid"] = this.skater_data["competitorentryid"];
                    clipOutput["method_name"] = "ELMVIDCLIP";
                    clipOutput["room"] = this.activatedRoute.snapshot.params.segmentid;

                    var clip_data: any = {};
                    clip_data["skateelementid"] = this.dataSource[i]['skateelementid'];

                    if (this.dataSource[i]['elmclip'] != "") {
                      clip_data["elementstart"] = this.dataSource[i]['elmclip'][0];
                      clip_data['elementend'] = this.dataSource[i]['elmclip'][1];
                    }

                    if (this.dataSource[i]['elmclip'] == "") {
                      clip_data["elementstart"] = "";
                      clip_data['elementend'] = "";
                    }



                    clipOutput["data"] = clip_data;

                    this._chatService.broadcast(clipOutput);

                    // change status after sending request

                    this.dataSource[i]['status'] = "completed";

                  }
                }

                this.dataSource[temp["data"]["createdElement"]["position"] - 1]['status'] = "completed";

                this.elements_array = this.dataSource;


              }

            }
            else {

              console.log("data in add coming from server")

              this.dataSource[temp["data"]["createdElement"]["position"] - 1]["skateelementid"] = temp["data"]["createdElement"]["newid"]
              this.dataSource[temp["data"]["createdElement"]["position"] - 1]['elementCode'] = whole_string_data;

              if (this.dataSource[this.dataSource.length - 1].elmclip != "" || this.dataSource[this.dataSource.length - 1].elementCode != "") {
                var elements_array = <any>[];
                var element_object = <any>{};


                element_object['index'] = this.elements_array.length + 1;;
                element_object['skateelementid'] = '';
                element_object['elementCode'] = '';
                element_object['elmclip'] = '';
                element_object['status'] = '';

                elements_array.push(element_object);
                element_object = {};

                const ELEMENT_DATA: Element[] = this.elements_array.concat(elements_array);

                this.elements_array.push(elements_array[0]);

                //console.log("element data", ELEMENT_DATA);
                //Variable declaration 
                this.dataSource = ELEMENT_DATA;


                //For highlight the process element code
                // for (let i = 0; i < this.dataSource.length; i++) {

                //   if (this.dataSource[i]['status'] == "Active" && this.dataSource[i]['elmclip'] != "") {

                //     var goeOutput: any = {};

                //     goeOutput['skateelementid'] = "12345";
                //     goeOutput['officialassignmentid'] = json_test_data.segmentid.offical.officialassignmentid;
                //     goeOutput['elmclip'] = this.dataSource[i]['elmclip'];
                //     console.log("Add CLIP from VRO to Element", goeOutput);

                //   }
                //   this.dataSource[data.index - 1]['status'] = "completed";

                //   console.log("datasource after 2", JSON.parse(JSON.stringify(this.dataSource)));
                // }
              }



              // add logic to send vroclips only if skate element is defined

              // for (let i = 0; i < this.dataSource.length; i++) {
              //   if (this.dataSource[i]['status'] == "Active" && this.dataSource[i]['elmclip'] != "" && this.dataSource[i]['skateelementid']) {
              //     var clipOutput :any = {};
              //     clipOutput["competitorentryid"] = this.skater_data["competitorentryid"];
              //     clipOutput["method_name"] = "ELMVIDCLIP";
              //     clipOutput["room"] = this.activatedRoute.snapshot.params.segmentid;

              //     var clip_data :any = {};
              //     clip_data["skateelementid"] = this.dataSource[i]['skateelementid'];
              //     clip_data["elementstart"] = this.dataSource[i]['elmclip'][0];
              //     clip_data['elementend'] = this.dataSource[i]['elmclip'][1];

              //     clipOutput["data"] = clip_data;

              //     this._chatService.broadcast(clipOutput);

              //     // change status after sending request

              //     this.dataSource[i]['status'] = "completed";

              //   }
              // }

              this.dataSource[temp["data"]["createdElement"]["position"] - 1]['status'] = "completed";



            }

            //dio_element_added = true;

            console.log("datasource after new element", this.dataSource)

            // var clip_code_output :any = {};
            // clip_code_output["competitorentryid"] = this.skater_data["competitorentryid"];
            // clip_code_output["method_name"] = "CLIP_CODE_CHANGE";
            // clip_code_output["room"] = this.activatedRoute.snapshot.params.segmentid;

            // var clip_code_data :any = {};
            // clip_code_data["details"] = this.dataSource;
            // //clip_code_data["insert"] = true;


            // clip_code_output["data"] = clip_code_data;

            // this._chatService.broadcast(clip_code_output);

            //console.log("datasource after 2", JSON.parse(JSON.stringify(this.dataSource)));



            break;

          case "CHGELM":


            var temp = JSON.parse(JSON.stringify(data))

            console.log("element chaged", temp)

            this.dataSource[temp["data"]["position"] - 1]["skateelementid"] = temp["data"]["newid"]
            //this.dataSource[temp["data"]["position"]-1]["status"] = "completed"; 

            //console.log("datasource",this.dataSource)

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

            // code  old 


            this.dataSource[temp["data"]["position"] - 1]['elementCode'] = whole_string_data;

            this.dataSource[temp["data"]["position"] - 1]['status'] = "completed";

            console.log("datasource after", JSON.parse(JSON.stringify(this.dataSource)));

            // highlighting edited element

            if (this.wbp_failed_index.includes(temp["data"]["position"]) == false) {
              this.wbp_failed_index.push(temp["data"]["position"]);
            }


            break;

          case "DELELM":


            var temp = JSON.parse(JSON.stringify(data))
            console.log("element deleted", temp);

            var modified_elements = <any>[];


            for (let b = 0; b < this.dataSource.length - 1; b++) {

              //console.log("lopppp", b)
              if (b < temp["data"]["position"] - 1) {

                modified_elements.push(this.dataSource[b]);
              }

              else if (b == temp["data"]["position"] - 1) {


                //console.log("else if deleted")


                let data_example: any = {};

                data_example["index"] = modified_elements.length;
                data_example["elementCode"] = this.dataSource[b + 1]["elementCode"];
                data_example["skateelementid"] = this.dataSource[b + 1]["skateelementid"];
                data_example["elmclip"] = this.dataSource[b]["elmclip"];
                data_example['status'] = "completed";

                modified_elements.push(data_example);


              }
              else {

                //console.log("else deleted")
                let data_example: any = {};

                data_example["index"] = modified_elements.length;
                data_example["elementCode"] = this.dataSource[b + 1]["elementCode"];
                data_example["skateelementid"] = this.dataSource[b + 1]["skateelementid"];
                data_example["elmclip"] = this.dataSource[b]["elmclip"];
                data_example['status'] = "completed";

                modified_elements.push(data_example);


              }
            }



            for (let c = 0; c < modified_elements.length; c++) {
              modified_elements[c]['index'] = c + 1;

            }

            if (modified_elements.length > 0) {
              if (modified_elements[modified_elements.length - 1].elmclip != "" || modified_elements[modified_elements.length - 1].elementCode != "") {
                let data_example: any = {};

                data_example["index"] = modified_elements.length + 1;
                data_example["elementCode"] = "";
                data_example["skateelementid"] = "";
                data_example["elmclip"] = "";
                data_example["status"] = "";

                modified_elements.push(data_example);
              }
            }

            else {
              let data_example: any = {};

              data_example["index"] = modified_elements.length + 1;
              data_example["elementCode"] = "";
              data_example["skateelementid"] = "";
              data_example["elmclip"] = "";
              data_example["status"] = "";

              modified_elements.push(data_example);
            }

            this.dataSource = modified_elements;
            this.elements_array = this.dataSource;


            // clip or code changed 

            if (!temp.hasOwnProperty('history')) {

              var clip_code_output: any = {};
              clip_code_output["competitorentryid"] = this.skater_data["competitorentryid"];
              clip_code_output["method_name"] = "CLIP_CODE_CHANGE";
              clip_code_output["room"] = this.activatedRoute.snapshot.params.segmentid;

              var clip_code_data: any = {};
              clip_code_data["details"] = this.dataSource;
              //clip_code_data["insert"] = true;


              clip_code_output["data"] = clip_code_data;

              this._chatService.broadcast(clip_code_output);


            }


            //this._chatService.element_clip_or_code_change({ "room": this.activatedRoute.snapshot.params.segmentid, "details": this.dataSource });


            console.log("datasource", this.dataSource)


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

          case "ELMVIDCLIP":


            var temp = JSON.parse(JSON.stringify(data))
            console.log("ELMVIDCLIP", temp);

            for (let i = 0; i < this.dataSource.length; i++) {
              if (this.dataSource[i]["skateelementid"] == temp["data"]["skateelementid"]) {
                if (this.dataSource[i]["elmclip"] == "") {
                  console.log("history case");

                  if (temp["data"]["clip"][0] != '') {
                    this.dataSource[i].elmclip = temp["data"]["clip"];

                    this.elements_array[i].elmclip = temp["data"]["clip"];

                    console.log("this data source check", this.dataSource);

                    //console.log("this data source check element array", this.elements_array);

                    if (this.dataSource[this.dataSource.length - 1].elmclip != "") {

                      var elements_array = <any>[];
                      var element_object = <any>{};

                      element_object['index'] = this.elements_array.length + 1;;
                      element_object['skateelementid'] = '';
                      element_object['elementCode'] = '';
                      element_object['elmclip'] = '';
                      element_object['status'] = '';


                      elements_array.push(element_object);
                      element_object = {};

                      const ELEMENT_DATA: Element[] = this.elements_array.concat(elements_array);

                      this.elements_array.push(elements_array[0]);

                      console.log("element data", ELEMENT_DATA);

                      //Variable declaration 

                      this.dataSource = ELEMENT_DATA;
                    }

                  }


                }
                else {
                  console.log("normal case");
                }
              }
            }

            console.log("after video clip", JSON.parse(JSON.stringify(this.dataSource)));
            break;

          case "STARTSKATE":
            var temp = JSON.parse(JSON.stringify(data))
            console.log("STARTSKATE", temp);

            break;

          // case "STOPSKATE":
          //   var temp = JSON.parse(JSON.stringify(data))
          //   console.log("STOPSKATE", temp);



          //   break;

          case "ELMVIDCLIPDEL":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("ELMVIDCLIPDEL", temp);

            console.log("before video clip", JSON.parse(JSON.stringify(this.dataSource)));


            var modified_elements = <any>[];

            for (let k = 0; k < this.dataSource.length; k++) {

              if (this.dataSource[k]["skateelementid"] == temp["data"]["skateelementid"]) {


                let data_example: any = {};

                data_example["index"] = modified_elements.length + 1;
                data_example["elementCode"] = this.dataSource[k]["elementCode"];
                data_example["skateelementid"] = this.dataSource[k]["skateelementid"];
                data_example["elmclip"] = "";
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
            this.elements_array = this.dataSource;



            console.log("datasource after clip deleted", this.dataSource);

            break;

          case "LOAD_SKATER":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("LOAD_SKATER", temp);

            this.skater_data = temp["data"];
            this.wbp_failed_index = [];
            this.review_index = [];

            // variable change for new skater

            this.clip = [];
            this.elements_array = [];
            this.dio_finalized = false;


            var elements_array = <any>[];
            var element_object = <any>{};

            if (this.elements.length == 0) {
              for (let k = 0; k < 1; k++) {
                element_object['index'] = k + 1;
                element_object['skateelementid'] = "";
                element_object['elementCode'] = "";
                element_object['elmclip'] = '';
                element_object['status'] = '';
                elements_array.push(element_object);
                element_object = {};
              }
            }

            const ELEMENT_DATA: Element[] = this.elements_array.concat(elements_array);

            this.elements_array.push(elements_array[0]);

            //console.log("element data", ELEMENT_DATA);


            //Variable declaration 
            this.dataSource = ELEMENT_DATA;

            this.selectedRowIndex = 1;

            const test = Array.from(document.getElementsByClassName('grid-container') as HTMLCollectionOf<HTMLElement>)

            test.forEach((element) => {
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
              this.on_join_data = JSON.parse(dataObj.initializationObj);
              console.log("room exists and you're in it and here's your data objects!")
              console.log(dataObj.initializationObj);
              console.log(dataObj.chatHistoryObj);

              this.skater_data = {};
              this.dio_finalized = false;

              this.clip = [];
              this.wbp_failed_index = [];
              this.review_index = [];

              this.elements_array = [];


              var elements_array = <any>[];
              var element_object = <any>{};

              if (this.elements.length == 0) {
                for (let k = 0; k < 1; k++) {
                  element_object['index'] = k + 1;
                  element_object['skateelementid'] = "";
                  element_object['elementCode'] = "";
                  element_object['elmclip'] = '';
                  element_object['status'] = '';
                  elements_array.push(element_object);
                  element_object = {};
                }
              }

              const ELEMENT_DATA1: Element[] = this.elements_array.concat(elements_array);

              this.elements_array.push(elements_array[0]);

              //console.log("element data", ELEMENT_DATA);


              //Variable declaration 
              this.dataSource = ELEMENT_DATA1;

              this.selectedRowIndex = 1;


              this.on_join_data = JSON.parse(dataObj.initializationObj)


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



                    if ((official_data[0].sc_officialid.sc_scnum == sessionStorage.getItem('scnum') && official_data[0]['role'] == '49E9C4A5-1EA9-EC11-983F-002248267FC3') || ds_data.length > 0) {
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

              // video is available or not
              
              console.log("rink id",this.on_join_data.segmentid.rinkid);
              if(this.on_join_data.segmentid.rinkid != null)
              {
                if(this.on_join_data.segmentid.rinkid.hasOwnProperty('videofeed'))
                {
                  
                  this.locator_url = this.on_join_data.segmentid.rinkid.locator_url;
                  this.video_feed = true;

                }
              }

              //this.user_access = true;


            }
            else {
              console.log("no room exists for this segment yet");

              this.user_access = false;
            }
            this.snackBar.dismiss();

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


          case "STOPSKATER":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("STOPSKATER", temp);




            // variable change for new skater

            this.skater_data = {};
            this.dio_finalized = false;
            this.review_index = [];
            this.wbp_failed_index = [];

            this.clip = [];
            this.elements_array = [];


            var elements_array = <any>[];
            var element_object = <any>{};

            if (this.elements.length == 0) {
              for (let k = 0; k < 1; k++) {
                element_object['index'] = k + 1;
                element_object['skateelementid'] = "";
                element_object['elementCode'] = "";
                element_object['elmclip'] = '';
                element_object['status'] = '';
                elements_array.push(element_object);
                element_object = {};
              }
            }

            const ELEMENT_DATA1: Element[] = this.elements_array.concat(elements_array);

            this.elements_array.push(elements_array[0]);

            //console.log("element data", ELEMENT_DATA);


            //Variable declaration 
            this.dataSource = ELEMENT_DATA1;

            this.selectedRowIndex = 1;


            const test1 = Array.from(document.getElementsByClassName('grid-container') as HTMLCollectionOf<HTMLElement>)

            test1.forEach((element) => {
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


          case "SCORESKATE":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("SCORESKATE", temp);

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

            // enable screen if 
            let test3 = Array.from(document.getElementsByClassName('grid-container') as HTMLCollectionOf<HTMLElement>)

            test3.forEach((element) => {

              element.style.opacity = '';

              element.style.backgroundColor = '';
              element.style.zIndex = '';
              element.style.pointerEvents = '';


            });


            break;


          default:
            console.log("Default case");
            break;
        }



      });


    // this._chatService.onRoomCreation()
    //   .subscribe(data => {

    //     if (this.activatedRoute.snapshot.params.segmentid == data.room) {
    //       console.log("Room created = " + data.room);
    //       this.user_access = true;

    //       var chat_room: any = {};
    //       chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;
    //       chat_room["competitorentryid"] = "29de489e-a2a8-4885-b844-12e63fa9c03f";

    //       this._chatService.joinRoom(chat_room);

    //     }


    //   });

    // this._chatService.onRoomClosed()
    //   .subscribe(data => {

    //     if (this.activatedRoute.snapshot.params.segmentid == data.room) {
    //       console.log("room closed")
    //       this.user_access = false;
    //     }

    //   });

    // this._chatService.OnConnectDataFromServer()
    //   .subscribe(coming_data => {

    //     console.log("all object data", coming_data.object_data);
    //     this.on_join_data = coming_data.object_data;
    //   });


    this._chatService.dio_entered_element_changed()
      .subscribe(coming_data => {


        // code generating based on level and modifier 

        var whole_string_data = "";

        if (coming_data["details"]["structure_input_data"].hasOwnProperty('elements') == true) {
          for (let x = 0; x < coming_data["details"]["structure_input_data"]["elements"].length; x++) {

            var element_codes = this.on_join_data.segmentid.definitionid.sc_elementconfiguration.elements.filter((record: any) => record.sc_skatingelementdefinitionid.sc_elementcode == coming_data["details"]["structure_input_data"]["elements"][x]["Element_code"]);

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

        console.log("new generated code", whole_string_data);



        if (coming_data.details.insert_before_index != -1) {

          var modified_elements = <any>[];

          for (let b = 0; b < this.dataSource.length - 1; b++) {

            if (b < coming_data.details.insert_before_index - 1) {

              modified_elements.push(this.dataSource[b]);
            }
            else if (b == coming_data.details.insert_before_index - 1) {

              let data_example: any = {};

              data_example["index"] = modified_elements.length + 1;
              data_example["elementCode"] = "";
              data_example["skateelementid"] = "";
              data_example["elmclip"] = this.dataSource[b]["elmclip"];
              data_example['status'] = "Active";


              modified_elements.push(data_example);

              data_example = {};

              data_example["index"] = modified_elements.length + 1;
              data_example["elementCode"] = this.dataSource[b]["elementCode"];
              data_example["skateelementid"] = this.dataSource[b]["skateelementid"];
              data_example["elmclip"] = this.dataSource[b + 1]["elmclip"];
              data_example['status'] = this.dataSource[b]["status"];
              modified_elements.push(data_example);
            }

            else {

              let data_example: any = {};

              data_example["index"] = modified_elements.length + 1;

              data_example["elementCode"] = this.dataSource[b]["elementCode"];
              data_example["skateelementid"] = this.dataSource[b]["skateelementid"];
              data_example["elmclip"] = this.dataSource[b + 1]["elmclip"];
              data_example['status'] = this.dataSource[b]["status"];

              modified_elements.push(data_example);
            }
          }

          if (modified_elements[modified_elements.length - 1].elmclip != "" || modified_elements[modified_elements.length - 1].elementCode != "") {
            let data_example: any = {};

            data_example["index"] = modified_elements.length + 1;
            data_example["elementCode"] = "";
            data_example["skateelementid"] = "";
            data_example["elmclip"] = "";
            data_example['status'] = "";
            modified_elements.push(data_example);
          }

          this.dataSource = modified_elements;
          this.elements_array = this.dataSource;

          //console.log("data after insert before", this.elements_array)
        }



        if (coming_data.details.edit_row_index == -1) {

          if (coming_data.details.index < this.dataSource.length) {

            if (coming_data.details.insert_before_index == -1) {

              if (coming_data.details.delete_row_index == -1) {
                this.dataSource[coming_data.details.index]['elementCode'] = whole_string_data;

                //this.dataSource[coming_data.details.index]['skateelementid'] = "";
                this.dataSource[coming_data.details.index]['status'] = "Active";

                //console.log("datasource before in elementchanged", JSON.parse(JSON.stringify(this.dataSource)));
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

            }
          }

        }
        // if (coming_data.details.delete_row_index != -1) {

        //   // console.log("in delete",coming_data);
        //   // console.log("in delete",JSON.parse(JSON.stringify(this.dataSource)));

        //   var modified_elements = <any>[];


        //   for (let b = 0; b < this.dataSource.length -1; b++) {

        //     //console.log("lopppp", b)
        //     if (b < coming_data.details.delete_row_index) {

        //       modified_elements.push(this.dataSource[b]);
        //     }

        //     else if (b == coming_data.details.delete_row_index) {


        //       //console.log("else if deleted")


        //       let data_example: any = {};

        //       data_example["index"] = modified_elements.length;
        //       data_example["elementCode"] = this.dataSource[b+1]["elementCode"];
        //       data_example["skateelementid"] = this.dataSource[b+1]["skateelementid"];
        //       data_example["elmclip"] = this.dataSource[b]["elmclip"];
        //       data_example['status'] = "completed";

        //       modified_elements.push(data_example);


        //     }
        //     else {

        //       //console.log("else deleted")
        //       let data_example: any = {};

        //       data_example["index"] = modified_elements.length;
        //       data_example["elementCode"] = this.dataSource[b+1]["elementCode"];
        //       data_example["skateelementid"] = this.dataSource[b+1]["skateelementid"];
        //       data_example["elmclip"] = this.dataSource[b]["elmclip"];
        //       data_example['status'] = "completed";

        //       modified_elements.push(data_example);


        //     }
        //   }



        //   for (let c = 0; c < modified_elements.length; c++) {
        //       modified_elements[c]['index'] = c + 1;

        //   }



        //   // console.log("modified elements", JSON.parse(JSON.stringify(modified_elements)));
        //   // console.log("modified elements", JSON.parse(JSON.stringify(modified_elements.length)));

        //   if(modified_elements.length > 0)
        //   {
        //     if (modified_elements[modified_elements.length - 1].elmclip != "" || modified_elements[modified_elements.length - 1].elementCode != "") {
        //       let data_example: any = {};

        //       data_example["index"] = modified_elements.length + 1;
        //       data_example["elementCode"] = "";
        //       data_example["skateelementid"] = "";
        //       data_example["elmclip"] = "";
        //       data_example["status"] = "";

        //       modified_elements.push(data_example);
        //     }
        //   }

        //   else
        //   {
        //     let data_example: any = {};

        //     data_example["index"] = modified_elements.length + 1;
        //     data_example["elementCode"] = "";
        //     data_example["skateelementid"] = "";
        //     data_example["elmclip"] = "";
        //     data_example["status"] = "";

        //     modified_elements.push(data_example);
        //   }



        //   this.dataSource = modified_elements;
        //   this.elements_array = this.dataSource;

        //  }


        if (this.selectedRowIndex > this.dataSource.length || this.selectedRowIndex < 0) {
          this.selectedRowIndex = this.dataSource.length;
        }

        // Inform other interface that preview element has clips or not

        var clip_code_output: any = {};
        clip_code_output["competitorentryid"] = this.skater_data["competitorentryid"];
        clip_code_output["method_name"] = "CLIP_CODE_CHANGE";
        clip_code_output["room"] = this.activatedRoute.snapshot.params.segmentid;

        var clip_code_data: any = {};
        clip_code_data["details"] = this.dataSource;
        //clip_code_data["insert"] = false;


        clip_code_output["data"] = clip_code_data;

        this._chatService.broadcast(clip_code_output);


        //this._chatService.element_clip_or_code_change({ "room": this.activatedRoute.snapshot.params.segmentid, "details": this.dataSource });
        console.log("dio entered element", this.dataSource)

      });


    // this._chatService.newElementAdded()
    //   .subscribe(data => {

    //     console.log("newelement added time datasource", this.dataSource)

    //     console.log("new element added", data);

    //     //var dio_element_added = false




    //   });

    // this._chatService.newEditedElement()
    //   .subscribe(data => {
    //     console.log("Edited element", data);

    //   });


    this._chatService.cancel_button_response()
      .subscribe(coming_data => {

        console.log("cancel button clicked", coming_data);

        if (coming_data.details.row_index != -1) {

          console.log("for insertt before");

          var modified_elements = <any>[];

          for (let b = 0; b < this.dataSource.length; b++) {


            if (b < coming_data.details.dataSource.length) {
              if (b < coming_data.details.row_index - 1) {
                modified_elements.push(this.dataSource[b]);
              }
              else if (b == coming_data.details.row_index - 1) {


                let data_example: any = {};

                data_example["index"] = modified_elements.length + 1;
                data_example["elementCode"] = coming_data.details.dataSource[b].name;
                data_example["skateelementid"] = coming_data.details.dataSource[b].skateelementid;
                data_example["elmclip"] = this.dataSource[b]["elmclip"];
                data_example['status'] = "completed";

                modified_elements.push(data_example);


              }
              else {
                let data_example: any = {};

                data_example["index"] = modified_elements.length + 1;
                data_example["elementCode"] = coming_data.details.dataSource[b].name;
                data_example["skateelementid"] = coming_data.details.dataSource[b].skateelementid;
                data_example["elmclip"] = this.dataSource[b]["elmclip"];
                data_example['status'] = this.dataSource[b]["status"];

                modified_elements.push(data_example);
              }
              //this.dataSource[b]["elementCode"] =  coming_data.details.dataSource[b]["name"];
            }
            else {
              if (this.dataSource[b]["elmclip"] != "") {
                let data_example: any = {};

                data_example["index"] = modified_elements.length + 1;
                data_example["elementCode"] = "";
                data_example["skateelementid"] = "";
                data_example["elmclip"] = this.dataSource[b]["elmclip"];
                data_example['status'] = "";

                modified_elements.push(data_example);
              }

            }

          }

          if (modified_elements[modified_elements.length - 1].elmclip != "" || modified_elements[modified_elements.length - 1].elementCode != "") {
            let data_example: any = {};

            data_example["index"] = modified_elements.length + 1;
            data_example["elementCode"] = "";
            data_example["skateelementid"] = "";
            data_example["elmclip"] = "";
            data_example['status'] = "";
            modified_elements.push(data_example);
          }

          this.dataSource = modified_elements;
          this.elements_array = this.dataSource;

          console.log("insert before in cancel", this.dataSource);

        }
        else {
          var modified_elements = <any>[];

          for (let b = 0; b < this.dataSource.length; b++) {

            if (b < coming_data.details.dataSource.length) {
              let data_example: any = {};

              data_example["index"] = modified_elements.length + 1;
              data_example["elementCode"] = coming_data.details.dataSource[b].name;
              data_example["skateelementid"] = this.dataSource[b]["skateelementid"];;
              data_example["elmclip"] = this.dataSource[b]["elmclip"];
              data_example['status'] = this.dataSource[b]["status"];

              modified_elements.push(data_example);

            }
            else {
              if (this.dataSource[b]["elmclip"] != "") {
                let data_example: any = {};

                data_example["index"] = modified_elements.length + 1;
                data_example["elementCode"] = "";
                data_example["skateelementid"] = "";
                data_example["elmclip"] = this.dataSource[b]["elmclip"];
                data_example['status'] = "";
                modified_elements.push(data_example);
              }
            }


          }

          if (modified_elements.length >= 1) {
            if (modified_elements[modified_elements.length - 1].elmclip != "" || modified_elements[modified_elements.length - 1].elementCode != "") {
              let data_example: any = {};

              data_example["index"] = modified_elements.length + 1;
              data_example["elementCode"] = "";
              data_example["skateelementid"] = "";
              data_example["elmclip"] = "";
              data_example['status'] = "";
              modified_elements.push(data_example);
            }
          }
          else {
            let data_example: any = {};

            data_example["index"] = modified_elements.length + 1;
            data_example["elementCode"] = "";
            data_example["skateelementid"] = "";
            data_example["elmclip"] = "";
            data_example['status'] = "";
            modified_elements.push(data_example);
          }


          this.dataSource = modified_elements;
          this.elements_array = this.dataSource;

        }

        if (this.selectedRowIndex > this.dataSource.length || this.selectedRowIndex < 0) {
          this.selectedRowIndex = this.dataSource.length;
        }


        // Inform other interface that cancel button effct on order of clips

        var clip_code_output: any = {};
        clip_code_output["competitorentryid"] = this.skater_data["competitorentryid"];
        clip_code_output["method_name"] = "CLIP_CODE_CHANGE";
        clip_code_output["room"] = this.activatedRoute.snapshot.params.segmentid;

        var clip_code_data: any = {};
        clip_code_data["details"] = this.dataSource;
        //clip_code_data["insert"] = false;


        clip_code_output["data"] = clip_code_data;

        this._chatService.broadcast(clip_code_output);

        //this._chatService.element_clip_or_code_change({ "room": this.activatedRoute.snapshot.params.segmentid, "details": this.dataSource });



      });
  }

  displayedColumns: string[] = ['index', 'elementCode', 'elmclip'];
  dataSource: any;
  //index = 1;
  selectedRowIndex: any = 1;
  name_testing: any = "Active";

  //temp_hold_data: any = "";


  ngOnInit(): void {

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

    var elements_array = <any>[];
    var element_object = <any>{};

    if (this.elements.length == 0) {
      for (let k = 0; k < 1; k++) {
        element_object['index'] = k + 1;
        element_object['skateelementid'] = "";
        element_object['elementCode'] = "";
        element_object['elmclip'] = '';
        element_object['status'] = '';
        elements_array.push(element_object);
        element_object = {};
      }
    }

    const ELEMENT_DATA: Element[] = this.elements_array.concat(elements_array);

    this.elements_array.push(elements_array[0]);

    //console.log("element data", ELEMENT_DATA);


    //Variable declaration 
    this.dataSource = ELEMENT_DATA;
  }

  element_data: any = this.elements[0];

  // Element click event for automatic next row selection
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

  data = this.on_join_data;

  //Help 
  OnHelp() {
    let help: any = {};
    help['help'] = true;
    console.log("Help?", help)
  }

  parentFunction(data: any) {

    //console.log("in clip add row index", this.selectedRowIndex);
    //console.log("in clip add datasource", this.dataSource);

    if (this.skater_data.hasOwnProperty('competitorentryid')) {
      console.log("selected row index", this.selectedRowIndex);

      // local change
      this.dataSource[this.selectedRowIndex - 1].elmclip = data;

      this.elements_array[this.selectedRowIndex - 1].elmclip = data;

      console.log("this data source check", this.dataSource);

      if (this.dataSource[this.selectedRowIndex - 1].elmclip == "") {
        // let clip_add_data: any = {};
        // clip_add_data['skateelementid'] = this.dataSource[this.selectedRowIndex - 1].skateelementid;
        // clip_add_data['start_time'] = data[0];
        // clip_add_data['end_time'] = data[1];

        // console.log("Clip added", clip_add_data);

        // logic for emiting socket function

        if (this.dataSource[this.selectedRowIndex - 1].skateelementid != "" && this.dataSource[this.selectedRowIndex - 1].status == "completed") {
          var clipOutput: any = {};
          clipOutput["competitorentryid"] = this.skater_data["competitorentryid"];
          clipOutput["method_name"] = "ELMVIDCLIP";
          clipOutput["room"] = this.activatedRoute.snapshot.params.segmentid;

          var clip_data: any = {};
          clip_data["skateelementid"] = this.dataSource[this.selectedRowIndex - 1]['skateelementid'];
          clip_data["elementstart"] = data[0];
          clip_data['elementend'] = data[1];

          clipOutput["data"] = clip_data;

          this._chatService.broadcast(clipOutput);
        }


      }
      else {
        // let clip_add_data: any = {};
        // clip_add_data['skateelementid'] = this.dataSource[this.selectedRowIndex - 1].skateelementid;
        // clip_add_data['start_time'] = data[0];
        // clip_add_data['end_time'] = data[1];

        // console.log("Clip edited", clip_add_data);

        //logic for emiting socket function
        if (this.dataSource[this.selectedRowIndex - 1].skateelementid != "" && this.dataSource[this.selectedRowIndex - 1].status == "completed") {
          var clipOutput: any = {};
          clipOutput["competitorentryid"] = this.skater_data["competitorentryid"];
          clipOutput["method_name"] = "ELMVIDCLIP";
          clipOutput["room"] = this.activatedRoute.snapshot.params.segmentid;

          var clip_data: any = {};
          clip_data["skateelementid"] = this.dataSource[this.selectedRowIndex - 1]['skateelementid'];
          clip_data["elementstart"] = data[0];
          clip_data['elementend'] = data[1];

          clipOutput["data"] = clip_data;

          this._chatService.broadcast(clipOutput);
        }

        if (this.dataSource[this.selectedRowIndex - 1].status == "Active" && this.dataSource[this.selectedRowIndex - 1].elmclip.length == 2) {
          var clip_code_output: any = {};
          clip_code_output["competitorentryid"] = this.skater_data["competitorentryid"];
          clip_code_output["method_name"] = "CLIP_CODE_CHANGE";
          clip_code_output["room"] = this.activatedRoute.snapshot.params.segmentid;

          var clip_code_data: any = {};
          clip_code_data["details"] = this.dataSource;
          //clip_code_data["insert"] = false;


          clip_code_output["data"] = clip_code_data;

          this._chatService.broadcast(clip_code_output);
        }


      }





      //console.log("this data source check element array", this.elements_array);

      if (this.dataSource[this.dataSource.length - 1].elmclip != "") {

        var elements_array = <any>[];
        var element_object = <any>{};

        element_object['index'] = this.elements_array.length + 1;;
        element_object['skateelementid'] = '';
        element_object['elementCode'] = '';
        element_object['elmclip'] = '';
        element_object['status'] = '';


        elements_array.push(element_object);
        element_object = {};

        const ELEMENT_DATA: Element[] = this.elements_array.concat(elements_array);

        this.elements_array.push(elements_array[0]);

        console.log("element data", ELEMENT_DATA);

        //Variable declaration 

        this.dataSource = ELEMENT_DATA;
      }

      if (this.dataSource.length != this.selectedRowIndex) {
        this.selectedRowIndex = this.selectedRowIndex + 1;
        //this.index = this.index + 1;
      }

      //this._chatService.element_video_clip({ "room": this.activatedRoute.snapshot.params.segmentid, "details": this.dataSource });   
    }


  }

  currentMediaTime(time_data: any) {

    for (let z = 0; z < this.dataSource.length; z++) {

      if (this.dataSource[z].elmclip != '') {

        if (this.dataSource[z].elmclip[0] < (time_data) && this.dataSource[z].elmclip[1] > (time_data)) {
          document.getElementById('play_element_clip_button_' + (z + 1))?.setAttribute("style", "color:#cc9544;");
        }
        else {
          document.getElementById('play_element_clip_button_' + (z + 1))?.setAttribute("style", "display:none;");
        }
      }

    }

  }

  onDelete(index: any) {
    console.log("deleted clip", JSON.parse(JSON.stringify(this.dataSource)));

    if (this.skater_data.hasOwnProperty('competitorentryid')) {
      var modified_elements = <any>[];

      for (let k = 0; k < this.dataSource.length; k++) {
        if (k == index - 1) {
          if (this.dataSource[k].elmclip != '' && this.dataSource[k]["elementCode"] != '') {
            //this.dataSource[index - 1].elmclip = '';

            let data_example: any = {};

            data_example["index"] = modified_elements.length + 1;
            data_example["elementCode"] = this.dataSource[k]["elementCode"];
            data_example["skateelementid"] = this.dataSource[k]["skateelementid"];
            data_example["elmclip"] = "";
            data_example["status"] = this.dataSource[k]["status"];

            modified_elements.push(data_example);

            // let output: any = {};
            // //output['element_def_id'] = this.dataSource[index - 1].skatingelementdefinitionid;

            // output['skateelementid'] = this.dataSource[index - 1].skateelementid;

            // console.log("clip deleted", output);



            if (this.dataSource[index - 1].skateelementid != "" && this.dataSource[index - 1].status == "completed") {
              var clipOutput: any = {};
              clipOutput["competitorentryid"] = this.skater_data["competitorentryid"];
              clipOutput["method_name"] = "ELMVIDCLIPDEL";
              clipOutput["room"] = this.activatedRoute.snapshot.params.segmentid;

              var clip_data: any = {};
              clip_data["skateelementid"] = this.dataSource[index - 1]['skateelementid'];
              clip_data["elementstart"] = "";
              clip_data['elementend'] = "";

              clipOutput["data"] = clip_data;

              this._chatService.broadcast(clipOutput);
            }

          }

        }
        else {

          modified_elements.push(this.dataSource[k]);


        }

      }

      for (let c = 0; c < modified_elements.length; c++) {
        modified_elements[c]['index'] = c + 1;
      }

      if (this.dataSource.length > modified_elements.length) {
        //console.log("length compare data source big")
        this.selectedRowIndex = this.selectedRowIndex - 1;
      }
      this.dataSource = modified_elements;
      this.elements_array = this.dataSource;

      console.log("deleted clip after datasource", JSON.parse(JSON.stringify(this.dataSource)));

      // inform other rooms that clip is delated 

      var clip_code_output: any = {};
      clip_code_output["competitorentryid"] = this.skater_data["competitorentryid"];
      clip_code_output["method_name"] = "CLIP_CODE_CHANGE";
      clip_code_output["room"] = this.activatedRoute.snapshot.params.segmentid;

      var clip_code_data: any = {};
      clip_code_data["details"] = this.dataSource;


      clip_code_output["data"] = clip_code_data;

      this._chatService.broadcast(clip_code_output);


      //this._chatService.element_clip_or_code_change({ "room": this.activatedRoute.snapshot.params.segmentid, "details": this.dataSource });

    }



  }
}
