import { Component, OnInit, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { ApiService } from '../api.service';
import { LanguageSelector } from '../api.languageselector';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SkateComponent } from '../skate/skate.component';
import { ChatService } from '../chat_service';
import { MatSnackBar } from '@angular/material/snack-bar';


export interface PeriodicElement1 {
  order: any;
  warmup_group: any;
  name: any;
  sc_num: any;
}

const ELEMENT_DATA: PeriodicElement1[] = [

];

@Component({
  selector: 'app-segment',
  templateUrl: './segment.component.html',
  styleUrls: ['./segment.component.css']
})
export class SegmentComponent implements OnInit, OnDestroy {


  displayedColumns: string[] = ['order', 'warmup_group', 'name', 'sc_num', 'action','score','re-score'];
  table_skater_data = ELEMENT_DATA;

  timeLeft!: number;
  interval: any;
  running: boolean = false;
  startText = 'start';

  skateToggleKey: any;
  otherSkaterOnIce: any;
  runSegmentToggle: any;
  runStreamToggle: any;
  language!: string;
  segmentid!: string;
  segment = [] as any;
  competitors = [] as any;
  next_disable: any = true;
  previous_disable: any = true;

  live_Disabled:any = false;
  loadingSpinner:any = false;


  officials_list:any = [];

  competitor_locked:any=[];


  constructor(private apiService: ApiService, private languageSelector: LanguageSelector, private fb: FormBuilder, private activatedRoute: ActivatedRoute, private router: Router, public dialog: MatDialog, private _chatService: ChatService, private snackBar: MatSnackBar) {

    this._chatService.onBroadcastResp()
      .subscribe(data => {

        var incoming_data = JSON.parse(JSON.stringify(data));

        console.log("in broadcast response", data)

        switch (incoming_data.method_name) {

          case "SEGSTART":

            if (this.activatedRoute.snapshot.params.segmentid == data.room) {

              console.log("Segment start");

              this.snackBar.open("Segment started and data is Coming ...", "", {
                verticalPosition: 'top',
                horizontalPosition: "center",
                panelClass: ['green-snackbar']
              });


              this.apiService.getSegmentCompetitors(this.activatedRoute.snapshot.params.segmentid).subscribe(
                (competitors) => {
                  this.competitors = competitors;

                  this.table_skater_data = this.competitors;

                  this.competitors.forEach((comp: any) => {
                    if (comp.onice == 1) {
                      this.otherSkaterOnIce = true;

                    }
                  })
                }
              )



            }




            break;


          case "SEGEND":

            if (this.activatedRoute.snapshot.params.segmentid == data.room) {

              console.log("Segment end");
              this.otherSkaterOnIce = false;

              this.next_disable = true;
              this.previous_disable = true;

            }

            break;


          case "LOAD_SKATER":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("LOAD_SKATER", temp);

            //Auto scrollable accordig to goe value entered



            var index: any = -1;

            for (let i = 0; i < this.competitors.length; i++) {
              if (temp["data"]["competitorentryid"] == this.competitors[i]["competitorentryid"]) {
                index = i;

                var rows = document.querySelectorAll('#element_table tr');

                rows[index].scrollIntoView({
                  behavior: 'smooth',
                  block: 'center'
                });

              }
            }



            this.next_disable = false;
            this.previous_disable = false;

            if (index != -1) {
              if (index == this.competitors.length - 1) {
                this.next_disable = true;
              }
              else if (index == 0) {
                this.previous_disable = true;
              }
              else {
                this.next_disable = false;
                this.previous_disable = false
              }

            }

            console.log("&&&&&&&&&&&&&&&&&&& this competitors &&&&&&&&&&&&&&", this.competitors)


            break;



          case "STOPSKATER":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("STOPSKATER", temp);



            this.next_disable = true;
            this.previous_disable = true;



            break;

          case "JOINING_ROOM":

            this.snackBar.dismiss();

            break;

          case "SCORESKATE":

            var temp = JSON.parse(JSON.stringify(data))
            console.log("score skate is called",temp);

            console.log("urrent table iright side",this.table_skater_data);
            
            if(!temp.hasOwnProperty('history'))
            {
              this.apiService.getSegmentCompetitors(this.activatedRoute.snapshot.params.segmentid).subscribe(
                (competitors) => {
                  
                  console.log("competitors data",competitors);
                  
                  this.competitors = competitors;
          
                  this.table_skater_data = this.competitors;

                });

            } 

            var index = this.competitor_locked.findIndex((record:any) => record.competitorentryid == temp['data']['competitorentryid']);
            
            if(index != -1)
            {
              this.competitor_locked[index]['locked'] = true;
            }

            console.log("new array",JSON.parse(JSON.stringify(this.competitor_locked)));


            
            break;


          case 'RESCORE':
            
            var temp = JSON.parse(JSON.stringify(data))
            console.log("RESCORE", temp);


            this.apiService.getSegmentCompetitors(this.activatedRoute.snapshot.params.segmentid).subscribe(
              (competitors) => {
                
                console.log("competitors data",competitors);
                
                
                this.competitors = competitors;
                this.table_skater_data = this.competitors;
              })

            var index = this.competitor_locked.findIndex((record:any) => record.competitorentryid == temp['data']['skater']);
            
            if(index != -1)
            {
              this.competitor_locked[index]['locked'] = false;
            }

            console.log("new array",this.competitor_locked);


            break;


          default:
            //console.log('you shouldn\'t see this');
            break;
        }

      });



  }

  ngOnInit(): void {



    var chat_room: any = {};
    chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;;

    chat_room["method_name"] = 'NEWCLIENT';
    chat_room["data"] = {};

    this._chatService.broadcast(chat_room);


    let segmentid = this.activatedRoute.snapshot.params.segmentid;
    this.segmentid = segmentid;

    this.language = this.languageSelector.getLanguage();

    this.runSegmentToggle = false;
    this.runStreamToggle = false;
    this.otherSkaterOnIce = false;

    this.apiService.getSegmentById(segmentid).subscribe(
      (segment) => {
        this.segment = segment;

        console.log("seg data",segment);

        // check if segment running
        if (this.segment[0].inprogress == 1) {
          this.runSegmentToggle = true;
          // if this is true, rejoin the existing room
          // var chat_room: any = {};
          // chat_room["room"] = segmentid;

          // this._chatService.joinRoom(chat_room);

          var chat_room: any = {};
          chat_room["room"] = segmentid;

          chat_room["method_name"] = 'NEWCLIENT';
          //this._chatService.createRoom(chat_room);
          this._chatService.broadcast(chat_room);

        }



        // set warmup timer

        this.timeLeft = this.segment[0].sc_warmuptime;

        // set toggle for live stream
        this.apiService.getLiveFeedStatus(this.segment[0].rinkid).subscribe(
          (feedlive) => {
            var resp = JSON.parse(JSON.stringify(feedlive));
            console.log("rink data",resp);
            if (resp.feedlive == 1) {
              this.runStreamToggle = true;
            }
          });
      }
    );

    this.apiService.getSegmentCompetitors(segmentid).subscribe(
      (competitors) => {
        
        console.log("competitors data",competitors);
        
        
        this.competitors = competitors;

        // code for new array contain locked / unlocked
        for(let i =0;i<this.competitors.length;i++)
        {
          this.competitor_locked.push({'competitorentryid':this.competitors[i]['competitorentryid'],'locked':false});
        }

        console.log("new array data",this.competitor_locked);

        this.table_skater_data = this.competitors;


        this.competitors.forEach((comp: any) => {
          if (comp.onice == 1) {
            this.otherSkaterOnIce = true;
            //document.getElementById("current_skater_id")!.innerHTML = comp.competitorentryid;
          }
        })
      }
    )

    this.apiService.getOfficialsBySegment(segmentid).subscribe(
      (segment) => {
      
        console.log("askjkdj",segment);

        this.officials_list = segment;

    });

  }

  startTimer() {
    this.running = !this.running;
    if (this.running) {
      this.startText = 'stop';
      // SEND MESSAGE VIA CHAT ROOM
      // sendmessage('WARMUPSTART')
      this.interval = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        }
        else {
          this.resetTimer();
        }
      }, 1000)
    }
    else {
      this.startText = 'resume';
      // SEND MESSAGE VIA CHAT ROOM
      // sendmessage('WARMUPPAUSE')
      clearInterval(this.interval);
    }
  }

  resetTimer() {
    clearInterval(this.interval);
    this.startText = 'start';
    // SEND MESSAGE VIA CHAT ROOM
    // sendmessage('WARMUPRESET')
    this.timeLeft = this.segment[0].sc_warmuptime;
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  

  toggleStream(event: any, rinkid: any) {
    var islive = (event == true) ? 1 : 0;
    var params = { rinkid: rinkid, islive: islive,segmentid:this.activatedRoute.snapshot.params.segmentid,videofeed:this.segment[0]['videofeed']}
    // update rink feed is live field

    if(islive == 1)
    {
      this.live_Disabled = true;
      this.loadingSpinner = true;

      //console.log("is 1 ")
       this.apiService.startRink(params).subscribe(
      (res) => {
          console.log("startevent finished",res);
          this.live_Disabled = false;
          this.loadingSpinner = false;
      });

    }
    else
    {
      //console.log("is 0 ")
      this.live_Disabled = true;
      this.loadingSpinner = true;

      this.apiService.stopRink(params).subscribe(
        (res) => {
            console.log("end  finished",res);

            this.live_Disabled = false;
            this.loadingSpinner = false;

        })
    }
    
    
  }

  rescore_clicked(input:any)
  {
    console.log("restore button clciked",input);

    var chat_room: any = {};
    chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;

    chat_room["method_name"] = 'RESCORE';
    chat_room["skater"] = input['competitorentryid'];
    
    this._chatService.broadcast(chat_room);

  }
  


  toggleSegment(event: any, segmentid: any) {
    var inprogress = (event == true) ? 1 : 0;
    var params = { segmentid: segmentid, inprogress: inprogress }
    var curskaterid = document.getElementById("current_skater_id")!.innerHTML;

    var chat_room: any = {};
    chat_room["room"] = segmentid;

    // update event inprogress field
    // checks event has segment with skaters and officials
    this.apiService.setSegmentInProgress(params).subscribe(
      (res) => {
        var resp = JSON.parse(JSON.stringify(res));
        if (resp.response == 'fail') {
          alert('Unable to start event. Missing competitors or officials.');
          this.runSegmentToggle = false;
        }
        else {
          if (inprogress == 1) {
            // send chat event
            chat_room["method_name"] = 'SEGSTART';
            //this._chatService.createRoom(chat_room);
            this._chatService.broadcast(chat_room);
          }
          else {
            // send chat event
            chat_room["method_name"] = 'SEGEND';
            //this._chatService.closeRoom(chat_room);
            this._chatService.broadcast(chat_room);
            // also cancel skater if one on ice
            if (curskaterid != '') {
              this.skateToggle('stop', segmentid, curskaterid);
            }
          }
        }
      },
      (error) => {
        console.log(error.error.body);
      }
    )
  }

  skateToggle(command: any, segmentid: any, competitorentryid: any) {

    //var curSkaterId = competitorentryid;
    //var curSkaterName = document.getElementById(`name${competitorentryid}`)!.innerHTML;

    this.apiService.toggleSkater({ segmentid: segmentid, competitorentryid: competitorentryid }).subscribe(
      (res) => {

        console.log("response comes after operation", res);

        // write this logic only for doing some basic work
        if (command == "stop") {
          //console.log("[[[[[ In toogle skate stop ")
          for (let i = 0; i < this.competitors.length; i++) {
            if (this.competitors[i]["competitorentryid"] == competitorentryid) {
              this.competitors[i]["onice"] = 0;

              this.table_skater_data = this.competitors;
            }

          }
          this.otherSkaterOnIce = false;


          console.log("stop is called");

          // logic for emit socket function
          var chat_room: any = {};
          chat_room["room"] = segmentid;
          chat_room["skater"] = competitorentryid;

          chat_room["method_name"] = 'STOPSKATER';

          this._chatService.broadcast(chat_room);

        }

        if (command == "start") {

          // const dialogRef = this.dialog.open(SkateComponent, {
          //   height: '70%',
          //   width: '60%',
          //   data: {
          //     dataKey: { competitorentryid: competitorentryid, segmentid: segmentid }
          //   }
          // });

          // logic for change in local screen
          for (let i = 0; i < this.competitors.length; i++) {
            if (this.competitors[i]["competitorentryid"] == competitorentryid) {
              this.competitors[i]["onice"] = 1;
              this.table_skater_data = this.competitors;
            }

          }
          this.otherSkaterOnIce = true;

          // logic for emit socket function
          var chat_room: any = {};
          chat_room["room"] = segmentid;
          chat_room["skater"] = competitorentryid;

          chat_room["method_name"] = 'NEWSKATER';

          this._chatService.broadcast(chat_room);

        }

        // =================== old code which was written by Steve  ==================

        // this.competitors = res;
        // this.otherSkaterOnIce = false;
        // this.competitors.forEach((comp: any) => {
        //     if(comp.onice == 1) {
        //         this.otherSkaterOnIce = true;
        //     }
        // })
        // switch(command) {
        //     case 'start':
        //         document.getElementById("current_skater_id")!.innerHTML = competitorentryid;
        //         console.log(`SKATERSTART: ${competitorentryid}`);
        //         // send chat event
        //         // MADE UP FUNCTION NAME
        //         // sendChatEvent('SKATERSTART','comp.competitorentryid')
        //         break;
        //     case 'stop':
        //         document.getElementById("current_skater_id")!.innerHTML = '';
        //         console.log(`SKATERSTOP: ${competitorentryid}`);
        //         // send chat event
        //         // MADE UP FUNCTION NAME
        //         // sendChatEvent('SKATERSTART','comp.competitorentryid')
        //         break;
        // }
      })
  }

  next() {
    console.log("next clicked", this.competitors)

    var index: any = -1;

    for (let i = 0; i < this.competitors.length; i++) {
      console.log("each competitor ", this.competitors[i], this.competitors[i]["onice"]);

      if (this.competitors[i]["onice"] == 1) {
        console.log("current competitor ", i, this.competitors.length);

        if (i != this.competitors.length - 1) {
          this.competitors[i]["onice"] = 0;

          this.table_skater_data = this.competitors;

          this.otherSkaterOnIce = false;

          this.apiService.toggleSkater({ segmentid: this.activatedRoute.snapshot.params.segmentid, competitorentryid: this.competitors[i]["competitorentryid"] }).subscribe(
            (res) => {

              console.log("response comes after operation", res);

            });

          index = i;

        }

      }
    }

    console.log("index value", index, this.competitors)

    if (index != -1) {

      this.competitors[index + 1]["onice"] = 1;
      this.table_skater_data = this.competitors;

      this.otherSkaterOnIce = true;

      this.apiService.toggleSkater({ segmentid: this.activatedRoute.snapshot.params.segmentid, competitorentryid: this.competitors[index + 1]["competitorentryid"] }).subscribe(
        (res) => {

          console.log("response comes after operation", res);

          // logic for emit socket function
          var chat_room: any = {};
          chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;;
          chat_room["skater"] = this.competitors[index + 1]["competitorentryid"];

          chat_room["method_name"] = 'NEWSKATER';

          this._chatService.broadcast(chat_room);

        });


      console.log("inside if loop", this.competitors[index + 1]);




    }

    console.log("at the end of nect button", this.competitors);

  }


  previous() {
    console.log("previous clicked", this.competitors)


    var index: any = -1;

    for (let i = 0; i < this.competitors.length; i++) {
      console.log("each competitor ", this.competitors[i], this.competitors[i]["onice"]);

      if (this.competitors[i]["onice"] == 1) {
        console.log("current competitor ", i, this.competitors.length);

        if (i != 0) {
          this.competitors[i]["onice"] = 0;
          this.table_skater_data = this.competitors;

          this.otherSkaterOnIce = false;
          index = i;


          this.apiService.toggleSkater({ segmentid: this.activatedRoute.snapshot.params.segmentid, competitorentryid: this.competitors[i]["competitorentryid"] }).subscribe(
            (res) => {

              console.log("response comes after operation", res);

            });


        }

      }
    }

    console.log("index value", index, this.competitors)

    if (index != -1) {

      this.competitors[index - 1]["onice"] = 1;
      this.table_skater_data = this.competitors;
      this.otherSkaterOnIce = true;


      this.apiService.toggleSkater({ segmentid: this.activatedRoute.snapshot.params.segmentid, competitorentryid: this.competitors[index - 1]["competitorentryid"] }).subscribe(
        (res) => {

          console.log("response comes after operation", res);

          // logic for emit socket function
          var chat_room: any = {};
          chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;;
          chat_room["skater"] = this.competitors[index - 1]["competitorentryid"];

          chat_room["method_name"] = 'NEWSKATER';

          this._chatService.broadcast(chat_room);
        });




    }

    console.log("at the end of nect button", this.competitors);


  }

}

@Pipe({
  name: "formatTime"
})
export class FormatTimePipe implements PipeTransform {
  transform(value: number): string {
    const minutes: number = Math.floor(value / 60);
    return (
      (minutes) +
      ":" +
      ("00" + Math.floor(value - minutes * 60)).slice(-2)
    );
  }
}


@Component({
  selector: 'segment_summary',
  templateUrl: './segment_summary.html',
  styleUrls:
    ['./segment_summary.css']


})
export class SegmentSummary implements OnInit {

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

            //   var chat_room: any = {};
            //   chat_room["room"] = this.activatedRoute.snapshot.params.segmentid;

            //   chat_room["method_name"] = 'NEWCLIENT';
            //   chat_room["data"] = { 'official_assignment_id': '' };

            //   //this._chatService.createRoom(chat_room);
            //   this._chatService.broadcast(chat_room);

            // }


            break;

          case "SEGMENT_START_FINISHED":

            if (this.activatedRoute.snapshot.params.segmentid == data.room) {

              console.log("segment start finsished",incoming_data);

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


            var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["data"]["official_assignment_id"]);

            console.log("official data", official_data);
        
            if (official_data.length > 0) {
              if (temp["data"]["data"]["competitorentryid"] == this.skater_data.competitorentryid) {
                if (temp["data"]["data"]["statusmessage"] == "Submit") {

                  if(temp["data"]["data"]["submit"] == true)
                  {
                    this.judgeStatus[official_data[0].position - 1] = "completed";
                  }
                  else
                  {
                    this.judgeStatus[official_data[0].position - 1] = "progress";
                  }


                  // this.judgeStatus[official_data[0].position - 1] = "completed";
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


          case "REFEREESTATUS":
            var temp = JSON.parse(JSON.stringify(data))
            console.log("REFEREESTATUS", temp);

            var official_data = this.on_join_data.segmentid.official.filter((record: any) => record.officialassignmentid == temp["data"]["data"]["official_assignment_id"]);

            console.log("official data", official_data);
            if (official_data.length > 0) {
              if (temp["data"]["data"]["competitorentryid"] == this.skater_data.competitorentryid) {
                if (temp["data"]["data"]["statusmessage"] == "Submit") 
                {
                  if(temp["data"]["data"]["submit"] == true)
                  {
                    this.refereeStatus[0] = "completed";
                  }
                  else
                  {
                    this.refereeStatus[0] = "progress";
                  }
                  
                }
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
    //console.log("change haqppens",this.newData)


  }



}
