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
export interface CategoryRankingElementData {
  number: any;
  skater_name: any;
  segment_1: any;
  segment1: any;
  segment_2: any;
  segment2: any
  current: any;
}

export interface SegmentRankingElementData {
  name: any;
  TECS: any;
  PCS: any;
  total: any;
}

const TOP_SAKTER_ELEMENT_DATA: TopSkaterElementData[] = [];

const CURRENT_SKATER_ELEMENT_DATA: CurrentSkaterElementData[] = [];

const ELEMENT_PC_DATA: PCElementData[] = [];

const RANKING_ELEMENT: CategoryRankingElementData[] = [
  { number: 1, skater_name: 'Patel', segment_1: 1.0079, segment1: 'H', segment_2: 1.0079, segment2: 'H', current: 12354 },
  { number: 2, skater_name: 'Patel', segment_1: 1.0079, segment1: 'H', segment_2: 1.0079, segment2: 'H', current: 12354 },
  { number: 3, skater_name: 'Patel', segment_1: 1.0079, segment1: 'H', segment_2: 1.0079, segment2: 'H', current: 12354 },
];

const SEGMENT_RANKING_ELEMENT: SegmentRankingElementData[] = [];
@Component({
  selector: 'app-monitorscreen',
  templateUrl: './monitorscreen.component.html',
  styleUrls: ['./monitorscreen.component.css']
})
export class MonitorscreenComponent implements OnInit {

  current_skater_click: any = false;
  current_skater_data: any = {};
  current_skater_index: any;
  user_access: any = false;
  on_join_data: any = {};

  elements: any = [];
  users: any = [];


  TopSkaterDataSource: MatTableDataSource<TopSkaterElementData>;
  TopSkaterdisplayedColumns: string[] = ['element', 'base', 'GOE', 'score'];

  CurrentSkaterDataSource: MatTableDataSource<CurrentSkaterElementData>;
  CurrentSkaterdisplayedColumns: string[] = ['element', 'base', 'GOE', 'score'];

  PCdatasource: MatTableDataSource<PCElementData>;
  PCdisplayedColumns: string[] = ['pc_name', 'pc_value'];

  CategoryRankingdatasource: MatTableDataSource<CategoryRankingElementData>;
  CategoryRankingdisplayedColumns: string[] = ['number', 'skater_name', 'segment_1', 'segment1', 'segment_2', 'segment2', 'current'];

  SegmentRankingdatasource: MatTableDataSource<SegmentRankingElementData>;
  SegmentRankingdisplayedColumns: string[] = ['number', 'name', 'TECS', 'PCS'];


  constructor(public dialog: MatDialog, private languageSelector: LanguageSelector, private _chatService: ChatService, private activatedRoute: ActivatedRoute, private snackBar: MatSnackBar, public apiService: ApiService, private _router: Router) {

    this.TopSkaterDataSource = new MatTableDataSource;

    this.CurrentSkaterDataSource = new MatTableDataSource;

    this.PCdatasource = new MatTableDataSource;

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

              console.log("room exists and you're in it and here's your data objects!")

              this.on_join_data = JSON.parse(dataObj.initializationObj);

              console.log("on join", this.on_join_data);

              this.user_access = true;

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

                pc_data.push({ "pc_name": this.on_join_data["segmentid"]["definitionid"]["programcomponents"][k]["sc_pctype"]["sc_name"], pc_value: "" });

              }

              this.PCdatasource = pc_data;

              var blank_array: any = [];

              this.CurrentSkaterDataSource = blank_array;

              this.snackBar.dismiss();

            }

            break;

          case "SEGSTART":

            console.log("Segment start");

            if (this.activatedRoute.snapshot.params.segmentid == data.room) {

              this.user_access = true;

              this.snackBar.open("Segment started and data is Coming ...", "", {
                verticalPosition: 'top',
                horizontalPosition: "center",
                panelClass: ['green-snackbar']
              });

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
              this.CategoryRankingdatasource = empty_var;
              this.SegmentRankingdatasource = empty_var;

              this.current_skater_data = {};

            }

            break;

          case "LOAD_SKATER":

            var temp = JSON.parse(JSON.stringify(data))

            if (this.current_skater_data["competitorentryid"] == temp["data"]["competitorentryid"] || this.current_skater_click == true) {


              console.log("LOAD_SKATER", temp, this.current_skater_data);

              this.current_skater_data = temp["data"];


              var load_skater = this.on_join_data.segmentid.competitors.filter((record: any) => record.competitorentryid == temp["data"]["competitorentryid"]);

              if (load_skater[0].sortorder != 0) {

                this.current_skater_index = load_skater[0].sortorder;

              }

              var blank_array: any = [];

              this.CurrentSkaterDataSource = blank_array;
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

            }

            break;

          case "NEWELM":


            var temp = JSON.parse(JSON.stringify(data))

            if (this.current_skater_data["competitorentryid"] == temp["data"]["competitorentryid"]) {

              console.log("new element added", temp);

              console.log("dat----------", this.object_code_generator(temp["data"]["input_data"]));


              console.log("this.dataSource.data", this.CurrentSkaterDataSource, (<any>this.CurrentSkaterDataSource).length);

              if (temp["data"]["createdElement"]["position"] > (<any>this.CurrentSkaterDataSource).length) {
                console.log("data in add coming from server")

                var elements_array = <any>[];
                var element_object = <any>{};

                for (let k = 0; k < (<any>this.CurrentSkaterDataSource).length; k++) {

                  element_object['index'] = elements_array.length + 1;
                  element_object['skateelementid'] = (<any>this.CurrentSkaterDataSource)[k].skateelementid;
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

                this.CurrentSkaterDataSource = elements_array;

              }
              else {
                console.log("data source lenght less than")
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


            var current_elements_array = <any>[];
            var current_element_object = <any>{};

            for (let k = 0; k < (<any>this.CurrentSkaterDataSource).length; k++) {

              if ((<any>this.CurrentSkaterDataSource)[k].skateelementid == temp["data"][0]["skateelementid"]) {

                console.log("coming in to if loop Object.............")


                current_element_object['index'] = current_elements_array.length + 1;
                current_element_object['skateelementid'] = (<any>this.CurrentSkaterDataSource)[k].skateelementid;
                current_element_object['element'] = (<any>this.CurrentSkaterDataSource)[k].element;
                current_element_object['base'] = temp["data"][0]["basevalue"];
                current_element_object['GOE'] = temp["data"][0]["trimmedmean"];
                current_element_object['score'] = temp["data"][0]["calculatedscore"];;
                current_elements_array.push(current_element_object);
                current_element_object = {};

              }
              else {

                console.log("coming in to else loop Object.............")

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

      if (incoming_data["elements"][x]['Pattern_dance_code'] != "") {
        individual_string = individual_string + incoming_data["elements"][x]['Pattern_dance_code'];
      }

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

          individual_string = individual_string + "[" + incoming_data["elements"][x]['notes'][c] + "]";
        }

      }

      if (whole_string_data == "") {
        whole_string_data = individual_string;
      }
      else {
        whole_string_data = whole_string_data + "+" + individual_string;
      }


    }


    if (incoming_data["elements"][0]["rep_jump"] == true) {
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


      }
    }
  }


  prevButtonClick() {

    if (this.current_skater_index > 1) {

      this.current_skater_index = this.current_skater_index - 1;

      var competitor_name = this.on_join_data.segmentid.competitors.filter((record: any) => record.sortorder == this.current_skater_index);

      console.log("1234", competitor_name);

      if (competitor_name.length > 0) {
        this.current_skater_data = { competitorentryid: competitor_name[0]["competitorentryid"], skater_data: competitor_name[0]["sc_competitorid"] };

        var chat_room: any = {};
        chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;
        chat_room["skater"] = competitor_name[0]["competitorentryid"];

        chat_room["method_name"] = 'HISTORY_SKATER_DATA';
        //this._chatService.createRoom(chat_room);
        this._chatService.broadcast(chat_room);

        console.log("current skater", this.current_skater_data);

        console.log("next", this.current_skater_index);

      }
      console.log("prev", this.current_skater_index)
    }
  }

  current_skater() {

    console.log("current skater", this.current_skater_data);

    this.current_skater_click = true;


    var chat_room: any = {};

    chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;;
    chat_room["method_name"] = 'CURRENT_SKATER_DATA';
    chat_room["data"] = { 'official_assignment_id': this.activatedRoute.snapshot.params.assignmentid };

    this._chatService.broadcast(chat_room);




  }

}

@Component({
  selector: 'monitor_official_summary',
  templateUrl: './monitor_official_summary.html',
  styleUrls:
    ['./monitor_official_summary.css']
})
export class MonitorOfficialSummary implements OnInit {

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

        console.log("in broadcast response", data)

        switch (incoming_data.method_name) {

          case "SEGSTART":
            console.log("Segment start");

            if (this.activatedRoute.snapshot.params.segmentid == data.room) {

              var chat_room: any = {};
              chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;

              chat_room["method_name"] = 'NEWCLIENT';
              chat_room["data"] = { 'official_assignment_id': '' };

              //this._chatService.createRoom(chat_room);
              this._chatService.broadcast(chat_room);

            }


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

            var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["official_assignment_id"]);

            console.log("official data", official_data);

            if (official_data.length > 0) {
              this.judgeGoeCount[official_data[0].position - 1] = temp["data"]["goe_count"];
            }
            else {
              console.log("******** Official table has no record");

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

            break;


          case "REFGOE":
            var temp = JSON.parse(JSON.stringify(data))


            var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["officialassignmentid"]);

            console.log("official data", official_data);
            if (official_data.length > 0) {
              this.refGoeCount[0] = temp["data"]["goe_count"];
            }
            else {
              console.log("******** Official table has no record");

            }


            break;


          case "REFPC":
            var temp = JSON.parse(JSON.stringify(data))



            var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["req_data"]["officialassignmentid"]);

            console.log("official data", official_data);
            if (official_data.length > 0) {
              this.refPcCount[0] = temp["data"]["pc_count"];
            }
            else {
              console.log("******** Official table has no record");

            }



            break;

          case "SCORESKATE":

            var temp = JSON.parse(JSON.stringify(data))


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

            this.data["dataSource"] = this.dataSource;

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

          case "CURRENT_ELEMENT_SCORE":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("temp1235", temp);
            console.log("this.dataSource.data.................", this.dataSource);


            var current_elements_array = <any>[];
            var current_element_object = <any>{};

            for (let k = 0; k < (<any>this.dataSource).length; k++) {

              if ((<any>this.dataSource)[k].skateelementid == temp["data"][0]["skateelementid"]) {




                current_element_object['index'] = current_elements_array.length + 1;
                current_element_object['skateelementid'] = (<any>this.dataSource)[k].skateelementid;
                current_element_object['element'] = (<any>this.dataSource)[k].element;
                current_element_object['base'] = temp["data"][0]["basevalue"];
                current_element_object['GOE'] = temp["data"][0]["trimmedmean"];
                current_element_object['score'] = temp["data"][0]["calculatedscore"];;
                current_elements_array.push(current_element_object);
                current_element_object = {};

              }
              else {


                current_element_object['index'] = current_elements_array.length + 1;
                current_element_object['skateelementid'] = (<any>this.dataSource)[k].skateelementid;
                current_element_object['element'] = (<any>this.dataSource)[k].element;
                current_element_object['base'] = (<any>this.dataSource)[k].base;
                current_element_object['GOE'] = (<any>this.dataSource)[k].GOE;
                current_element_object['score'] = (<any>this.dataSource)[k].score;
                current_elements_array.push(current_element_object);
                current_element_object = {};
              }
            }

            this.dataSource = current_elements_array;

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
  }

  ngOnChanges() {
  }



}

