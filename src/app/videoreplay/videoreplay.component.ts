import { Component, OnInit, Input, Output, EventEmitter,SimpleChanges } from '@angular/core';

import { ChatService } from '../chat_service';
@Component({
  selector: 'app-videoreplay',
  templateUrl: './videoreplay.component.html',
  styleUrls: ['./videoreplay.component.css']
})
export class VideoreplayComponent implements OnInit {

  //Variable Declaration
  myPlayer: any;
  customTimerStart: any;
  customTimerEnd: any;
  buildClipStart: any = 0;
  myInterval: any;


  //Input Data
  @Input() role_id: any;
  @Input() user_access: any;
  @Input() element_clip_clicked: any;
  @Input() room :any;
  @Input() skater_data: any = {};

  @Input() video_feed: any;
  @Input() locator_url:any;

  //Output Data
  @Output() parentFunction: EventEmitter<any> = new EventEmitter();

  @Output() currentMediaTime: EventEmitter<any> = new EventEmitter();

  constructor(private _chatService: ChatService) {

   


      this._chatService.onBroadcastResp()
      .subscribe(data => {

        //console.log("in broadcast response", data)

        var incoming_data = JSON.parse(JSON.stringify(data));

        switch (incoming_data.method_name) {
          case "SEGEND":
            console.log("Segment end");
            clearInterval(this.myInterval);
            this.user_access = false;
           
            break;

          case "LOAD_SKATER":
          
            var temp = JSON.parse(JSON.stringify(data))
            //console.log("LOAD_SKATER",temp);

            if(this.skater_data["competitorentryid"] == temp["data"]["competitorentryid"])
              {
                console.log("same loaded")
              }
              else
              {
                this.customTimerStart = null;
                this.customTimerEnd = null;
                this.buildClipStart = 0;
    
                // timer and clip button clour
    
                if(this.role_id == "49E9C4A5-1EA9-EC11-983F-002248267FC3")
                {
                  document.getElementById('element_clip')?.setAttribute("style", "background-color:'';");
                  document.getElementById('toggle_timer')?.setAttribute("style", "color:#000080;");
                
                }
         
              }
            
            

            break;

          
          case "STARTSKATE":
            var temp = JSON.parse(JSON.stringify(data))
            console.log("STARTSKATE",temp);

            this.customTimerStart = temp["data"]["skatestartvideotime"];
            //this.myPlayer.currentTime(temp["data"]["skatestartvideotime"]);

            break;

          case "STOPSKATE":
            var temp = JSON.parse(JSON.stringify(data))
            console.log("STOPSKATE",temp);

            this.customTimerEnd = temp["data"]["skateendvideotime"];


            break;

          default:
            //console.log("Default case");
            break;
        }



      });

    


  }


  ngOnInit(): void {

    
    this.myPlayer = amp('main-video', {
      autoplay: true,
      controls: false,
      logo: { "enabled": false },
    },
      () => {


        if (this.user_access == true) {

          this.myInterval = setInterval(() => { this.updateTimer() }, 10);
        }



        //Event Listener
        const video: any = document.querySelector('video');

        video?.addEventListener('loadeddata', (event: any) => {
        });

        video?.addEventListener('ratechange', (event: any) => {
          console.log('Rate changed');
        });

        window.onkeydown = (ev: KeyboardEvent): any => {
          if (ev.keyCode == 32) {
            if (this.role_id != "469C7509-FEA6-EC11-983F-00224825E0C8") {
              ev.preventDefault();

              let video_row = document.getElementById('video_player');

              if (!this.myPlayer.paused()) {

                this.myPlayer.pause();

                (video_row!.querySelector('.play_pause') as HTMLInputElement).innerHTML = "play_arrow";
                (video_row!.querySelector('.play_pause') as HTMLInputElement).title = "play";
                video_row!.classList.remove('paused');
              }
              else {
                this.myPlayer.play();

                (video_row!.querySelector('.play_pause') as HTMLInputElement).innerHTML = "pause";
                (video_row!.querySelector('.play_pause') as HTMLInputElement).title = "pause";
                video_row!.classList.add('paused');
              }
            }

          }
          else if (ev.keyCode == 39) {

            if (this.role_id != "469C7509-FEA6-EC11-983F-00224825E0C8") {
              // ev.preventDefault();
              console.log("time", this.myPlayer.currentTime())
              this.myPlayer.currentTime(this.myPlayer.currentTime() + 0.033);

            }
          }
          else if (ev.keyCode == 37) {

            if (this.role_id != "469C7509-FEA6-EC11-983F-00224825E0C8") {
              ev.preventDefault();
              console.log("time", this.myPlayer.currentTime())
              this.myPlayer.currentTime(this.myPlayer.currentTime() - 0.033);
            }
          }
          else {
          }
        }
      });

    if(this.video_feed == true && this.locator_url != "")
    {
      this.myPlayer.src({
        type: "application/vnd.ms-sstr+xml",
        //src: "https:////amssamples.streaming.mediaservices.windows.net/3b970ae0-39d5-44bd-b3a3-3136143d6435/AzureMediaServicesPromo.ism/manifest"
        src: this.locator_url
      });
      
    }
    

    this.myPlayer.addEventListener('error', () => {
      // Handle the error event here

      console.log("error coming");


      if(this.video_feed == true && this.locator_url != "")
      {
        setTimeout(() => { 
          console.log("trying to connect again")
  
          this.myPlayer.src({
          type: "application/vnd.ms-sstr+xml",
          //src: "https://amssamples.streaming.mediaservices.windows.net/3b970ae0-39d5-44bd-b3a3-3136143d6435/AzureMediaServicesPromo.ism/manifest"
          src: this.locator_url
        });
  
        }, 5000);
      }

      



    }); 

  }


  clip_captured() {
    if(this.skater_data.hasOwnProperty('skater_data'))
    {
      if (this.buildClipStart == 0) {
        this.buildClipStart = this.myPlayer.currentTime() ;
        document.getElementById('element_clip')?.setAttribute("style", "background-color:yellow;");
      }
      else {
        var clip_end_time = this.myPlayer.currentTime() ;
  
        if (this.buildClipStart < clip_end_time) {
  
          let time: any = [];
          time.push(this.buildClipStart);
          time.push(clip_end_time);
          this.parentFunction.emit(time);
          document.getElementById('element_clip')?.setAttribute("style", "background-color:'';");
          this.buildClipStart = 0;
        }
        else {
          document.getElementById('element_clip')?.setAttribute("style", "background-color:'';");
          this.buildClipStart = 0;
        }
      }
    }
    
  }

  cancel_last() {

    if (this.buildClipStart != 0) {
      this.buildClipStart = 0;
      document.getElementById('element_clip')?.setAttribute("style", "background-color:'red';");
      console.log("cancel the clip start time")
    }
  }

  ngOnChanges(changes: SimpleChanges) {


    console.log("coming in ngon changes",changes);

    if (this.element_clip_clicked != "" && this.element_clip_clicked != undefined) {
      if (this.element_clip_clicked['data'] != "") {

        this.myPlayer.currentTime(this.element_clip_clicked['data'][0]);
      }
      this.element_clip_clicked['clicked'] = false;
    }

    if (changes.user_access) {
      if(this.user_access == false )
      {
        clearInterval(this.myInterval);
      }

    }



    if (changes.locator_url) {
      console.log("locator is changed",changes);
      if(this.video_feed == true && this.locator_url != "")
      {
        this.myPlayer.src({
          type: "application/vnd.ms-sstr+xml",
          //src: "https:////amssamples.streaming.mediaservices.windows.net/3b970ae0-39d5-44bd-b3a3-3136143d6435/AzureMediaServicesPromo.ism/manifest"
          src: this.locator_url
        });
        
      }
    }
    

    console.log("locator_url",this.locator_url,);

    console.log("changes",changes);

    if (changes.user_access) {
      if(this.user_access == false )
      {
        clearInterval(this.myInterval);
      }

    }
    
    

  }

  playPause() {
    let video_row = document.getElementById('controls');
    if (!this.myPlayer.paused()) {
      this.myPlayer.pause();
      (video_row!.querySelector('.play_pause') as HTMLInputElement).innerHTML = "play_arrow";
      (video_row!.querySelector('.play_pause') as HTMLInputElement).title = "play";
      video_row!.classList.remove('paused');
    }
    else {
      this.myPlayer.play();
      (video_row!.querySelector('.play_pause') as HTMLInputElement).innerHTML = "pause";
      (video_row!.querySelector('.play_pause') as HTMLInputElement).title = "pause";
      video_row!.classList.add('paused');
    }
  }

  toggleTime() {

    if(this.skater_data.hasOwnProperty('skater_data'))
    {

      let time = this.myPlayer.currentTime();

    if (!this.customTimerStart) {
      document.getElementById('toggle_timer')?.setAttribute("style", "color:red;");
      this.customTimerStart = time;

      // emit socket function 

      var timer_start_output :any = {};
      timer_start_output["competitorentryid"] = this.skater_data["competitorentryid"];
      timer_start_output["method_name"] = "STARTSKATE";
      timer_start_output["room"] = this.room;
  
      var timer_data :any = {};
      timer_data["competitorentryid"] = this.skater_data["competitorentryid"];
      timer_data["segmentid"] = this.room;
      timer_data["skatestartvideotime"] = this.customTimerStart;
    
      timer_start_output["data"] = timer_data;
  
      this._chatService.broadcast(timer_start_output);

      
    }
    else if (!this.customTimerEnd) {

      if(time>this.customTimerStart)
      {
        console.log(this.customTimerStart,"-------------- comaprision --------------",time);
        console.log("end time greater or not",time>this.customTimerStart);
  
        document.getElementById('toggle_timer')?.setAttribute("style", "color:blue;");
        this.customTimerEnd = time;
  
        // emit socket function 
  
        var timer_start_output :any = {};
        timer_start_output["competitorentryid"] = this.skater_data["competitorentryid"];
        timer_start_output["method_name"] = "STOPSKATE";
        timer_start_output["room"] = this.room;
    
        var timer_data :any = {};
        timer_data["competitorentryid"] = this.skater_data["competitorentryid"];
        timer_data["segmentid"] = this.room;
        timer_data["skateendvideotime"] = this.customTimerEnd;
      
        timer_start_output["data"] = timer_data;
    
        this._chatService.broadcast(timer_start_output);
  
  
      }
      
    }
    else {

      // var timing_object: any = {};
      // timing_object['start_time'] = this.customTimerStart;
      // timing_object['end_time'] = this.customTimerEnd;

      // console.log("Timer done :", timing_object);


      document.getElementById('toggle_timer')?.setAttribute("style", "color:#000080;");
      this.customTimerStart = null;
      this.customTimerEnd = null;
    }

    }
    
  }

  updateTimer() {

    if(this.user_access == true)
    {
     
      this.myPlayer.muted(true);
      let currentVideoTime = this.myPlayer.currentTime().toFixed(2);

      const video_payer = document.querySelector('.controls');

      

        const fieldset_timer = document.querySelector('#fieldset_timer');

        (fieldset_timer!.querySelector('.current1') as HTMLInputElement).innerHTML = `${currentVideoTime}`;
      
      //(video_payer!.querySelector('.current') as HTMLInputElement).innerHTML = `${currentVideoTime}`;


      let time = this.myPlayer.currentTime();

      this.currentMediaTime.emit(time);

      if (this.customTimerStart) {

        let minutes: any = Math.floor(Math.floor(time - this.customTimerStart) / 60);
        let seconds: any = Math.floor(time - this.customTimerStart) % 60;
        let milliseconds: any = Math.floor((((time - this.customTimerStart) % 60) % 1) * 100);

        if (seconds < 10) {
          seconds = "0" + seconds;
        }
        if (milliseconds < 10) {
          milliseconds = "0" + milliseconds;
        }

        
        if(minutes>=0 && seconds>=0 &&  milliseconds >=0 )
        {
          (video_payer!.querySelector('.current_custom_timer') as HTMLInputElement).innerHTML = `${minutes}:${seconds}:${milliseconds}`;

        }
       
        document.getElementById('current_custom_timer_end')?.setAttribute("style", "display:inline-block;");

      }
      else {
        (video_payer!.querySelector('.current_custom_timer') as HTMLInputElement).innerHTML = "Stopped";

        document.getElementById('current_custom_timer_end')?.setAttribute("style", "display:none;");

        (video_payer!.querySelector('.current_custom_timer_end') as HTMLInputElement).innerHTML = `0:00`;

      }

      if (this.customTimerEnd) {
        let minutes: any = Math.floor(Math.floor(this.customTimerEnd - this.customTimerStart) / 60);
        let seconds: any = Math.floor(this.customTimerEnd - this.customTimerStart) % 60;
        let milliseconds: any = Math.floor((((this.customTimerEnd - this.customTimerStart) % 60) % 1) * 100);
        if (seconds < 10) {
          seconds = "0" + seconds;
        }
        if (milliseconds < 10) {
          milliseconds = "0" + milliseconds;
        }

        if(minutes>=0 && seconds>=0 &&  milliseconds >=0 )
        {
          (video_payer!.querySelector('.current_custom_timer_end') as HTMLInputElement).innerHTML = `${minutes}:${seconds}:${milliseconds}`;
        }
        
      }

    }

    
  }

  goLive() {
    let video_row = document.getElementById('video_player');
    (video_row!.querySelector('video') as HTMLVideoElement).playbackRate = 1.0;

    if(this.video_feed == true && this.locator_url != "")
    {
      
    const currentWindow = this.myPlayer.currentPlayableWindow();
    if (currentWindow) {
      this.myPlayer.currentTime(currentWindow.endInSec);
    
    }

    }
    if (this.myPlayer.paused()) {
      this.myPlayer.play();
    }

    setTimeout(() => {
    }, 5000);

    (document.getElementById("go_live") as HTMLImageElement).src = "assets/live.png";
  }

  muteUnmute() {
    let video_row = document.getElementById('controls');
    if (!this.myPlayer.muted()) {
      this.myPlayer.muted(true);
      (video_row!.querySelector('.volume') as HTMLInputElement).innerHTML = "volume_off";
      (video_row!.querySelector('.volume_range') as HTMLInputElement).value = "0";
    }
    else {
      this.myPlayer.muted(false);
      (video_row!.querySelector('.volume') as HTMLInputElement).innerHTML = "volume_up";
      (video_row!.querySelector('.volume_range') as HTMLInputElement).value = "75";
    }

    (document.getElementById("go_live") as HTMLImageElement).src = "assets/live-white.png";
  }

  seek(seconds: any) {
    this.myPlayer.currentTime(this.myPlayer.currentTime() + seconds);

    // we have to keep it
    (document.getElementById("go_live") as HTMLImageElement).src = "assets/live-white.png";
  }

  changeVolume(value: any) {

    this.myPlayer.volume(value / 100);
    let video_row = document.getElementById('controls');

    if (value == 0) {
      (video_row!.querySelector('.volume') as HTMLInputElement).innerHTML = "volume_off";
    }
    else if (value < 50) {
      (video_row!.querySelector('.volume') as HTMLInputElement).innerHTML = "volume_down";
    }
    else {
      (video_row!.querySelector('.volume') as HTMLInputElement).innerHTML = "volume_up";
    }
  }

  change_playbackRate(value: any) {
    let video_row = document.getElementById('video_player');
    (video_row!.querySelector('video') as HTMLVideoElement).playbackRate = value;
  }
}
