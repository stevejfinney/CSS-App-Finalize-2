import { Component, OnInit, Inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { LanguageSelector } from '../api.languageselector';
import { ChatService } from '../chat_service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface OfficialElement {
  number: any;
  official_role: any;
  name: any;
}

export interface GroupElement {
  group_name: any;
}

export interface GroupElementDescription {
  number: any;
  Province_name: any;
  competitor_name: any;
}

export interface CallToIceElement {
  number: any;
  status: any;
  competitor_name: any;
}

export interface RankingElement {
  number: any;
  competitor_name: any;
  type: any;
  province_name: any;
  rank: any;
}


const ELEMENT_OFFICIAL_DATA: OfficialElement[] = [];

const ELEMENT_GROUP_DATA: GroupElement[] = [];

const ELEMENT_GROUP_DESCRIPTION: GroupElementDescription[] = [];

const ELEMENT_CALLTOICE: CallToIceElement[] = [];

const ELEMENT_RANKING: RankingElement[] = [];

@Component({
  selector: 'app-announcerscreen',
  templateUrl: './announcerscreen.component.html',
  styleUrls: ['./announcerscreen.component.css']
})
export class AnnouncerscreenComponent implements OnInit {

  // Global variable 
  selectedIndex: any = -1;
  user_access: any = false;
  on_join_data: any = {};
  skater_data: any = {};
  current_skater_index: any;

  current_skater_click: any = false;

  ranking_upates: any = {};
  live_skater_data: any = {};

  // datasource for Official 
  dataSourceOfficial: MatTableDataSource<OfficialElement>;
  displayedColumnsOfficial: string[] = ['number', 'official_role', 'name'];

  // datasource for Group data
  dataSourceGroup: MatTableDataSource<GroupElement>;
  displayedColumnsGroup: string[] = ['group_name'];

  // datasource for Group Description 
  dataSourceGroupDescription: MatTableDataSource<GroupElementDescription>;
  displayedColumnsGroupDescription: string[] = ['number', 'Province_name', 'competitor_name'];

  // datasource for Call To Ice 
  dataSourceCallToIce: MatTableDataSource<CallToIceElement>;
  displayedColumnsCallToIce: string[] = ['number', 'status', 'competitor_name'];


  // datasource for Ranking 
  dataSourceRanking: MatTableDataSource<RankingElement>;
  displayedColumnsRanking: string[] = ['number', 'competitor_name', 'club', 'province_name', 'rank'];


  constructor(private languageSelector: LanguageSelector, private _chatService: ChatService, private activatedRoute: ActivatedRoute, private _router: Router, private snackBar: MatSnackBar, public dialog: MatDialog) {

    this.dataSourceOfficial = new MatTableDataSource;

    this.dataSourceGroup = new MatTableDataSource;

    this.dataSourceGroupDescription = new MatTableDataSource;

    this.dataSourceCallToIce = new MatTableDataSource;

    this.dataSourceRanking = new MatTableDataSource;


    // Socket.io function for broadcast the messages
    this._chatService.onBroadcastResp()
      .subscribe(data => {

        //Convert the object in to stringfy format
        var incoming_data = JSON.parse(JSON.stringify(data));

        switch (incoming_data.method_name) {

          case "JOINING_ROOM":

            var temp = JSON.parse(JSON.stringify(data))

            var required_data = temp["returnObj"];

            // big intialization object in stringify format
            console.log("JOINING_ROOM", required_data);

            var dataObj = JSON.parse(JSON.stringify(required_data));

            //console.log("returned data = " + dataObj.inroom);

            if (dataObj.inroom) {

              //console.log("room exists and you're in it and here's your data objects!")

              this.on_join_data = JSON.parse(dataObj.initializationObj);

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

                    if ((official_data1[0].sc_officialid.sc_scnum == sessionStorage.getItem('scnum') && official_data1[0]['role'] == '98642430-1FA9-EC11-983F-002248267FC3') || ds_data.length > 0) {
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

              this.snackBar.dismiss();

              // -------------------------------- official data ---------------------------------//

              let official_data: any = [];

              var official_order: any = ["F19EFA05-1FA9-EC11-983F-002248267FC3", "DD0D08B3-1EA9-EC11-983F-002248267FC3", "3983AAF1-1EA9-EC11-983F-002248267FC3", "9A8F5827-FEA6-EC11-983F-00224825E0C8", "469C7509-FEA6-EC11-983F-00224825E0C8", "3B732AFD-FDA6-EC11-983F-00224825E0C8", "49E9C4A5-1EA9-EC11-983F-002248267FC3", "38940E18-1FA9-EC11-983F-002248267FC3", "5D920A2A-1FA9-EC11-983F-002248267FC3"]

              var index: any = 1;

              for (let j = 0; j < official_order.length; j++) {

                var official_order_filter = this.on_join_data["segmentid"]["official"].filter((record: any) => record.role == official_order[j]);

                if (official_order_filter.length >= 1) {

                  // For Judge Position 
                  if (j == 4) {

                    let official_filter: any = official_order_filter.sort((a: any, b: any) => a.position - b.position);

                    for (let i = 0; i < official_filter.length; i++) {

                      let official_object: any = {};

                      official_object["number"] = index;
                      official_object["official_role"] = "Judge " + official_filter[i]["position"];
                      official_object["name"] = official_filter[i]["sc_officialid"]["sc_fullname"];
                      official_data.push(official_object);
                      index++;
                    }
                  }
                  // For Other official Role
                  else {
                    for (let i = 0; i < official_order_filter.length; i++) {

                      let official_object: any = {};

                      official_object["number"] = index;

                      switch (official_order[j]) {

                        case "3B732AFD-FDA6-EC11-983F-00224825E0C8":
                          official_object["official_role"] = "Data Input Operator";
                          break;

                        case "9A8F5827-FEA6-EC11-983F-00224825E0C8":
                          official_object["official_role"] = "Referee";
                          break;

                        case "49E9C4A5-1EA9-EC11-983F-002248267FC3":
                          official_object["official_role"] = "Video Replay Operator";
                          break;

                        case "DD0D08B3-1EA9-EC11-983F-002248267FC3":
                          official_object["official_role"] = "Technical Specialist";
                          break;

                        case "3983AAF1-1EA9-EC11-983F-002248267FC3":
                          official_object["official_role"] = "Assistant Technical Specialist";
                          break;

                        case "F19EFA05-1FA9-EC11-983F-002248267FC3":
                          official_object["official_role"] = "Technical Controller";
                          break;

                        case "38940E18-1FA9-EC11-983F-002248267FC3":
                          official_object["official_role"] = "Ice Level Referee";
                          break;

                        case "5D920A2A-1FA9-EC11-983F-002248267FC3":
                          official_object["official_role"] = "Trial Judge";
                          break;

                        default:
                          break;
                      }

                      official_object["name"] = official_order_filter[i]["sc_officialid"]["sc_fullname"];
                      official_data.push(official_object);
                      index++;
                    }
                  }
                }
              }

              // Assign the official data to the datasource 
              this.dataSourceOfficial = official_data;

              // -------------------------------- group data ---------------------------------//


              // for selecting first row by default

              var group_selectrow_data: any = [];

              var group_element = this.on_join_data["segmentid"]["competitors"].filter((record: any) => record.warmupgroup == 1);



              for (let i = 0; i < group_element.length; i++) {

                var group_element_object: any = {};

                group_element_object["number"] = i + 1;
                group_element_object["Province_name"] = group_element[i]["sc_competitorid"]["sc_section"];
                group_element_object["competitor_name"] = group_element[i]["sc_competitorid"]["sc_name"];
                group_element_object["competitorentryid"] = group_element[i]["competitorentryid"]

                group_selectrow_data.push(group_element_object);
              }
              this.dataSourceGroupDescription = group_selectrow_data;

              //console.log(" dtaa source group description", this.dataSourceGroupDescription);

              this.selectedIndex = 1;

              var group_data: any = [];

              for (let i = 0; i < this.on_join_data["segmentid"]["competitors"].length; i++) {

                if (this.on_join_data["segmentid"]["competitors"][i]["warmupgroup"] != null) {

                  group_data.push(this.on_join_data["segmentid"]["competitors"][i]["warmupgroup"])

                }

              }

              //Filter the unique value from the different group type, Ex., group 1, group2. 
              var uniqueArray: any = group_data.filter(function (item: any, pos: any, self: any) {

                return self.indexOf(item) == pos;

              })

              let group_unique_data: any = [];

              for (let j = 0; j < uniqueArray.length; j++) {

                let group_unique_object: any = {};

                group_unique_object["group_name"] = uniqueArray[j];

                var competitors: any = [];

                var group_competitors = this.on_join_data["segmentid"]["competitors"].filter((record: any) => record.warmupgroup == uniqueArray[j]);
                if (group_competitors.length >= 1) {
                  for (let z = 0; z < group_competitors.length; z++) {
                    competitors.push(group_competitors[z]["competitorentryid"])
                  }
                }

                group_unique_object["group_competitors"] = competitors;


                group_unique_data.push(group_unique_object);

              }

              //Assign the group_unique_data to the datasource
              this.dataSourceGroup = group_unique_data;

              //console.log(" dtaa source group", this.dataSourceGroup);


              // -------------------------------- OnIce data ---------------------------------//

              //create a table 
              var onice_data: any = [];

              for (let i = 0; i < this.on_join_data["segmentid"]["competitors"].length; i++) {

                var onice_object: any = {};

                onice_object["number"] = this.on_join_data["segmentid"]["competitors"][i]["warmupgroup"] + "-" + this.on_join_data["segmentid"]["competitors"][i]["sortorder"];

                //console.log("onice", this.on_join_data["segmentid"]["competitors"][i]["onice"]);

                // if (this.on_join_data["segmentid"]["competitors"][i]["onice"] == 1) {

                //   onice_object["status"] = "Active";

                // }

                if (this.on_join_data["segmentid"]["competitors"][i]["score"] == null) {
                  onice_object["status"] = "Pending";

                }
                else {
                  onice_object["status"] = "Completed";
                }


                onice_object["competitor_name"] = this.on_join_data["segmentid"]["competitors"][i]["sc_competitorid"]["sc_name"];
                onice_object["competitor_entry"] = this.on_join_data["segmentid"]["competitors"][i]["competitorentryid"];
                onice_object["score"] = this.on_join_data["segmentid"]["competitors"][i]["score"];
                onice_object["active"] = false;

                onice_data.push(onice_object);

              }
              this.dataSourceCallToIce = onice_data;


              //by default load skater 1 
              this.current_skater_index = 1;

              var competitor_name = this.on_join_data.segmentid.competitors.filter((record: any) => record.sortorder == this.current_skater_index);

              if (competitor_name.length > 0) {

                //console.log("competitor name --------", competitor_name)

                this.skater_data = { competitorentryid: competitor_name[0]["competitorentryid"], skater_data: competitor_name[0]["sc_competitorid"] };

              }

              var chat_room: any = {};

              chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;

              chat_room["skater"] = competitor_name[0]["competitorentryid"];

              chat_room["method_name"] = 'HISTORY_SKATER_DATA';

              this._chatService.broadcast(chat_room);

              var comp_data: any = this.dataSourceCallToIce;

              for (let a = 0; a < comp_data.length; a++) {

                if (comp_data[a]["competitor_entry"] == competitor_name[0]["competitorentryid"]) {

                  comp_data[a]["active"] = true;

                }
                else {
                  comp_data[a]["active"] = false;
                }
              }

              this.dataSourceCallToIce = comp_data;
              console.log("123456,", this.dataSourceCallToIce)

              console.log("onice", onice_data)

              // -------------------------------- Ranking data ---------------------------------//


              var chat_room: any = {};

              chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;;

              chat_room["method_name"] = 'RANKING_DATA';
              chat_room["data"] = { 'official_assignment_id': this.activatedRoute.snapshot.params.assignmentid };

              this._chatService.broadcast(chat_room);

              // var ranking_sort = [];

              // for (let i = 0; i < this.on_join_data["segmentid"]["competitors"].length; i++) {

              //   var ranking_null = this.on_join_data["segmentid"]["competitors"][i]["score"];

              //   if (ranking_null == null) {

              //     ranking_null = 0;

              //   }
              //   var ranking_temp = [this.on_join_data["segmentid"]["competitors"][i]["competitorentryid"], ranking_null]

              //   ranking_sort.push(ranking_temp);

              // }


              // const sortedAsc = ranking_sort.sort((b, a) => {

              //   if (a[1] === null) {
              //     return 1;
              //   }

              //   if (b[1] === null) {
              //     return -1;
              //   }


              //   if (a[1] === b[1]) {
              //     return 0;
              //   }

              //   return a[1] < b[1] ? -1 : 1;

              // });

              // var ranking_temp = [];

              // for (var j = 0; j < sortedAsc.length; j++) {

              //   var ranking_mergesort = this.on_join_data["segmentid"]["competitors"].filter((record: any) => record.competitorentryid == sortedAsc[j][0]);


              //   if (ranking_mergesort.length >= 1) {

              //     ranking_temp.push(ranking_mergesort[0]);

              //   }
              // }

              // let ranking_data: any = [];

              // for (let i = 0; i < ranking_temp.length; i++) {

              //   let ranking_object: any = {};

              //   ranking_object["number"] = i + 1;
              //   ranking_object["competitor_name"] = ranking_temp[i]["sc_competitorid"]["sc_name"];
              //   ranking_object["type"] = ranking_temp[i]["sc_competitorid"]["sc_club"];
              //   ranking_object["province_name"] = ranking_temp[i]["sc_competitorid"]["sc_section"];
              //   ranking_object["rank"] = ranking_temp[i]["score"];
              //   ranking_object["competitorentryid"] = ranking_temp[i]["competitorentryid"];

              //   ranking_data.push(ranking_object);

              // }

              // // Assigning the raning data to the datasource
              // this.dataSourceRanking = ranking_data;
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

              this.dataSourceOfficial = empty_var;
              this.dataSourceGroup = empty_var;
              this.dataSourceGroupDescription = empty_var;
              this.dataSourceCallToIce = empty_var;
              this.dataSourceRanking = empty_var;

              this.skater_data = {};

              this.live_skater_data = {};
            }

            break;

          case "LOAD_SKATER":


            var temp = JSON.parse(JSON.stringify(data))
            console.log("skater loaded is called", data);

            // getting list of ranking
            var chat_room: any = {};

            chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;;

            chat_room["method_name"] = 'RANKING_DATA';
            chat_room["data"] = { 'official_assignment_id': this.activatedRoute.snapshot.params.assignmentid };

            this._chatService.broadcast(chat_room);



            if (this.skater_data["competitorentryid"] == temp["data"]["competitorentryid"] || this.current_skater_click == true) {
              console.log("LOAD_SKATER", temp);

              var competitor_name = this.on_join_data.segmentid.competitors.filter((record: any) => record.competitorentryid == temp["data"]["competitorentryid"]);

              // console.log("compeeeeeeeeeeeeee", competitor_name);


              if (competitor_name.length > 0) {

                this.current_skater_index = competitor_name[0]["sortorder"];
                //console.log("current skatteeer", this.current_skater_index)

              }

              this.skater_data = temp["data"];

              // other updates

              var comp_data: any = this.dataSourceCallToIce;

              for (let a = 0; a < comp_data.length; a++) {

                if (comp_data[a]["competitor_entry"] == temp["data"]["competitorentryid"]) {

                  comp_data[a]["active"] = true;

                } else {
                  comp_data[a]["active"] = false;
                }
              }

              this.dataSourceCallToIce = comp_data;
              //console.log("123456,", this.dataSourceCallToIce)

              this.current_skater_click = false;
            }

            break;

          case "STOPSKATER":

            var temp = JSON.parse(JSON.stringify(data))
            if (this.skater_data["competitorentryid"] == temp["data"]["competitorentryid"]) {

              console.log("STOPSKATER", temp);

              this.skater_data = {};
            }


            var comp_data: any = this.dataSourceCallToIce;


            for (let a = 0; a < comp_data.length; a++) {
              if (comp_data[a]["competitor_entry"] == temp["data"]["skater"] && comp_data[a]["score"] == null) {

                comp_data[a]["status"] = "Pending";
              }

              if (comp_data[a]["competitor_entry"] == temp["data"]["skater"] && comp_data[a]["score"] != null) {

                comp_data[a]["status"] = "Completed";
              }

              //comp_data[a]["active"] = false;

            }

            this.dataSourceCallToIce = comp_data;

            this.live_skater_data = {};

            //console.log("data source after stop skater", this.dataSourceCallToIce);

            break;

          case "DIOSTATUS":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("Status Update", temp);


            break;

          case "RANKING_DATA":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("Ranking Update", temp);

            this.ranking_upates = temp["data"]["output"];

            let ranking_data: any = [];

            for (let i = 0; i < temp["data"]["output"]["category"]["competitors"].length; i++) {

              var competitor_data = this.on_join_data.segmentid.competitors.filter((record: any) => record.sc_competitorid.sc_competitorid == temp["data"]["output"]["category"]["competitors"][i]["sc_competitor_id"]);

              if (competitor_data.length > 0) {

                console.log("competitor name --------", competitor_data)

                let ranking_object: any = {};

                ranking_object["number"] = i + 1;
                ranking_object["competitor_name"] = competitor_data[0]["sc_competitorid"]["sc_name"];
                ranking_object["type"] = competitor_data[0]["sc_competitorid"]["sc_club"];
                ranking_object["province_name"] = competitor_data[0]["sc_competitorid"]["sc_section"];
                ranking_object["rank"] = temp["data"]["output"]["category"]["competitors"][i]["total_score"];
                ranking_object["competitorentryid"] = competitor_data[0]["competitorentryid"];

                ranking_data.push(ranking_object);

              }


            }

            // Assigning the raning data to the datasource
            this.dataSourceRanking = ranking_data;



            var category_data: any = temp["data"]["output"]["category"]["competitors"].findIndex((record: any) => record.sc_competitor_id == this.skater_data["skater_data"]["sc_competitorid"]);

            //console.log("index",category_data);

            if (category_data.length != -1) {
              this.skater_data["category_score"] = temp["data"]["output"]["category"]["competitors"][category_data]["total_score"];
              this.skater_data["rank"] = category_data + 1;
            }

            console.log("skater data", this.skater_data);

            // live skater data update from data specialist

            var category_data: any = temp["data"]["output"]["segment"].filter((record: any) => record.onice == 1);

            console.log("data onice", category_data, category_data.length);

            if (category_data.length >= 1) {
              this.live_skater_data["competitorentryid"] = category_data[0]["competitorentryid"];
              this.live_skater_data["onice"] = category_data[0]["onice"];
              this.live_skater_data["skater_data"] = category_data[0]["skater_data"];

            }

            console.log("live skater data", this.live_skater_data);



            break;

          case "SCORESKATE":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("SCORESKATE", temp);

            var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == this.activatedRoute.snapshot.params.assignmentid);
            console.log("official data", official_data);

            if (official_data.length > 0) {
              if (temp["data"]["statusmessage"] == "SCORESKATER") {

                var comp_data: any = this.dataSourceCallToIce;

                for (let a = 0; a < comp_data.length; a++) {
                  if (comp_data[a]["competitor_entry"] == temp["data"]["competitorentryid"]) {
                    comp_data[a]["score"] = temp["data"]["score"][7]["final"];
                    comp_data[a]["status"] = "Completed";
                  }
                }

                this.dataSourceCallToIce = comp_data;

                console.log("bbb", this.dataSourceCallToIce);



                // update rank table

                // let ranking_data: any = [];

                // for (let i = 0; i < temp["data"]["ranking"]["segment"].length; i++) {

                //   let ranking_object: any = {};

                //   ranking_object["number"] = i + 1;
                //   ranking_object["competitor_name"] = temp["data"]["ranking"]["segment"][i]["skater_data"]["sc_name"];
                //   ranking_object["type"] = temp["data"]["ranking"]["segment"][i]["skater_data"]["sc_club"];
                //   ranking_object["province_name"] = temp["data"]["ranking"]["segment"][i]["skater_data"]["sc_section"];
                //   ranking_object["rank"] = temp["data"]["ranking"]["segment"][i]["score"];
                //   ranking_object["competitorentryid"] = temp["data"]["ranking"]["segment"][i]["competitorentryid"];

                //   ranking_data.push(ranking_object);

                // }

                // // Assigning the raning data to the datasource
                // this.dataSourceRanking = ranking_data;

                // update score


                if (this.skater_data["competitorentryid"] == temp["data"]["competitorentryid"]) {
                  this.skater_data["score"] = temp["data"]["score"][7]["final"];
                }


                var chat_room: any = {};

                chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;;

                chat_room["method_name"] = 'RANKING_DATA';
                chat_room["data"] = { 'official_assignment_id': this.activatedRoute.snapshot.params.assignmentid };

                this._chatService.broadcast(chat_room);


                // alert for score

                if (temp["history"] != true) {
                  var comp_data = this.on_join_data.segmentid.competitors.filter((record: any) => record.competitorentryid == temp["data"]["competitorentryid"]);
                  if (comp_data.length >= 1) {

                    temp["data"]["sc_competitorid"] = comp_data[0]["sc_competitorid"];
                  }

                  const dialogRef = this.dialog.open(score_dialog, {
                    data: temp["data"],


                  });

                  dialogRef.afterClosed().subscribe(result => {
                    console.log('The dialog was closed');
                  });
                }



              }

            }


            break;


          default:
            break;
        }
      });

  }

  ngOnInit(): void {

    this.dataSourceOfficial.data = ELEMENT_OFFICIAL_DATA;

    this.dataSourceGroup.data = ELEMENT_GROUP_DATA;

    this.dataSourceGroupDescription.data = ELEMENT_GROUP_DESCRIPTION;

    this.dataSourceCallToIce.data = ELEMENT_CALLTOICE;

    this.dataSourceRanking.data = ELEMENT_RANKING;

    //Room joining request for server
    var chat_room: any = {};

    chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;;

    chat_room["method_name"] = 'NEWCLIENT';
    chat_room["data"] = { 'official_assignment_id': this.activatedRoute.snapshot.params.assignmentid };

    this._chatService.broadcast(chat_room);
  }

  // event for group selection and group data according to the selection
  group_click(data: any) {

    var group_element = this.on_join_data["segmentid"]["competitors"].filter((record: any) => record.warmupgroup == data["group_name"]);

    var group_element_data: any = [];

    for (let i = 0; i < group_element.length; i++) {

      var group_element_object: any = {};

      group_element_object["number"] = i + 1;
      group_element_object["Province_name"] = group_element[i]["sc_competitorid"]["sc_section"];
      group_element_object["competitor_name"] = group_element[i]["sc_competitorid"]["sc_name"];
      group_element_object["competitorentryid"] = group_element[i]["competitorentryid"]

      group_element_data.push(group_element_object);
    }
    this.dataSourceGroupDescription = group_element_data;

    console.log("aaaa", this.dataSourceGroupDescription);


    this.selectedIndex = data["group_name"]
  }


  nextButtonClick() {

    if (this.current_skater_index < this.on_join_data["segmentid"]["competitors"].length) {

      this.current_skater_index = this.current_skater_index + 1;

      console.log("next button press");

      var competitor_name = this.on_join_data.segmentid.competitors.filter((record: any) => record.sortorder == this.current_skater_index);

      console.log("1234", competitor_name);
      if (competitor_name.length > 0) {
        this.skater_data = { competitorentryid: competitor_name[0]["competitorentryid"], skater_data: competitor_name[0]["sc_competitorid"] };

        // grabing data from ranking table like points for category and rank

        var category_data_index: any = this.ranking_upates["category"]["competitors"].findIndex((record: any) => record.sc_competitor_id == competitor_name[0]["sc_competitorid"]["sc_competitorid"]);

        console.log("index in category", category_data_index);

        if (category_data_index != -1) {
          this.skater_data["category_score"] = this.ranking_upates["category"]["competitors"][category_data_index]["total_score"];
          this.skater_data["rank"] = category_data_index + 1;
        }


        // grabing history

        var chat_room: any = {};
        chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;
        chat_room["skater"] = competitor_name[0]["competitorentryid"];

        chat_room["method_name"] = 'HISTORY_SKATER_DATA';
        //this._chatService.createRoom(chat_room);
        this._chatService.broadcast(chat_room);

        console.log("skater", this.skater_data);

        console.log("next", this.current_skater_index);

        var comp_data: any = this.dataSourceCallToIce;

        for (let a = 0; a < comp_data.length; a++) {

          if (comp_data[a]["competitor_entry"] == competitor_name[0]["competitorentryid"]) {

            comp_data[a]["active"] = true;

          } else {
            comp_data[a]["active"] = false;
          }
        }

        this.dataSourceCallToIce = comp_data;
        console.log("123456,", this.dataSourceCallToIce)

        this.current_skater_click = false;

      }
    }


  }

  prevButtonClick() {
    if (this.current_skater_index > 1) {

      this.current_skater_index = this.current_skater_index - 1;

      var competitor_name = this.on_join_data.segmentid.competitors.filter((record: any) => record.sortorder == this.current_skater_index);

      console.log("1234", competitor_name);

      if (competitor_name.length > 0) {
        this.skater_data = { competitorentryid: competitor_name[0]["competitorentryid"], skater_data: competitor_name[0]["sc_competitorid"] };


        // grabing data from ranking table like points for category and rank

        var category_data_index: any = this.ranking_upates["category"]["competitors"].findIndex((record: any) => record.sc_competitor_id == competitor_name[0]["sc_competitorid"]["sc_competitorid"]);

        console.log("index in category", category_data_index);

        if (category_data_index != -1) {
          this.skater_data["category_score"] = this.ranking_upates["category"]["competitors"][category_data_index]["total_score"];
          this.skater_data["rank"] = category_data_index + 1;
        }



        var chat_room: any = {};
        chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;
        chat_room["skater"] = competitor_name[0]["competitorentryid"];

        chat_room["method_name"] = 'HISTORY_SKATER_DATA';
        //this._chatService.createRoom(chat_room);
        this._chatService.broadcast(chat_room);

        console.log("current skater", this.skater_data);

        console.log("pre", this.current_skater_index);


        var comp_data: any = this.dataSourceCallToIce;

        for (let a = 0; a < comp_data.length; a++) {

          if (comp_data[a]["competitor_entry"] == competitor_name[0]["competitorentryid"]) {

            comp_data[a]["active"] = true;

          } else {
            comp_data[a]["active"] = false;
          }
        }

        this.dataSourceCallToIce = comp_data;
        console.log("123456,", this.dataSourceCallToIce)

        this.current_skater_click = false;
      }
    }
  }

  current_skater() {
    var chat_room: any = {};
    this.current_skater_click = true;

    chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;;
    chat_room["method_name"] = 'CURRENT_SKATER_DATA';
    chat_room["data"] = { 'official_assignment_id': this.activatedRoute.snapshot.params.assignmentid };

    this._chatService.broadcast(chat_room);



  }
}


@Component({
  selector: 'score_dialog',
  templateUrl: './score.html',
  styleUrls:
    ['./score.css']
})
export class score_dialog {

  output: any = {};

  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any, private languageSelector: LanguageSelector, private _chatService: ChatService, private activatedRoute: ActivatedRoute) {

    console.log("data coming into pop up", data);
    //this.table_data = data.datasource;

    this.output["name"] = data["sc_competitorid"]["sc_name"];
    this.output["section"] = data["sc_competitorid"]['sc_section'];
    this.output["segment_score"] = data["score"][7]["final"];

    // segment rank
    var segment_index: any = data["ranking"]["segment"].findIndex((record: any) => record.competitorentryid == data["competitorentryid"]);

    console.log("category index", segment_index);

    this.output["segment_rank"] = segment_index + 1;


    // category rank
    var category_index: any = data["ranking"]["category"]["competitors"].findIndex((record: any) => record.sc_competitor_id == data["sc_competitorid"]["sc_competitorid"]);

    console.log("category index", category_index);

    this.output["category_score"] = data["ranking"]["category"]["competitors"][category_index]["total_score"];
    this.output["category_rank"] = category_index + 1;
  }

}
