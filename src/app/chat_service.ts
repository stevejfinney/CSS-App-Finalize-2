import { Injectable } from "@angular/core";
import io from 'socket.io-client';
import { Observable } from "rxjs";
import { ApiService } from './api.service';

@Injectable()

export class ChatService {

    private socket;

    constructor(public apiService: ApiService) {


        var isOnline = sessionStorage.getItem("isOnline");
        var appPort = sessionStorage.getItem("appPort");

        if (isOnline === "true") {
            this.socket = io('https://sc-css.azurewebsites.net');
        }
        else {
            this.socket = io('http://localhost:' + appPort);
        }


       

    }






    // Messages from referee

    refereeMessage(data: any) {
        this.socket.emit('message_details', data);
    }

    // referee messages broadcast to room

    referee_messages_broadcast() {
        let observable = new Observable<({ room: any, message_details: any })>(observer => {
            this.socket.on('message_broadcast', (data) => {
                observer.next(data);
            });
            return () => { this.socket.disconnect() }
        });
        return observable;
    }


    // without add dio brodcast combination

    dio_element_entered(data: any) {
        this.socket.emit('dio_element_entered', data);
    }

    dio_entered_element_changed() {
        let observable = new Observable<({ room: any, details: any })>(observer => {
            this.socket.on('dio_element_changed', (data) => {
                observer.next(data);
            });
            return () => { this.socket.disconnect() }
        });
        return observable;
    }

    // on cancel in dio undo changes to interfaces

    cancel_button_entered(data: any) {
        this.socket.emit('cancel_button_clicked', data);
    }

    cancel_button_response() {
        let observable = new Observable<({ room: any, details: any })>(observer => {
            this.socket.on('cancel_button_click_response', (data) => {
                observer.next(data);
            });
            return () => { this.socket.disconnect() }
        });
        return observable;
    }


    /*
    BROADCAST FUNCTION
    */

    // create room


    

    // testing function end

    broadcast(data: any) {


        this.socket.emit('broadcast', data, (response: any) => {
            console.log("********* execution broadcast function end", response, new Date().toISOString());


        });

    }

    onBroadcastResp() {
        let observable = new Observable<({ room: String })>(observer => {

            this.socket.on('broadcast response', (data) => {

                //console.log("time on broadcast response before sending data to observer",new Date().toISOString())


                observer.next(data);
                //observer.complete()
                //setTimeout(()=> observer.complete(),5000);

            });
            return () => { this.socket.disconnect() }
        });
        return observable;
    }







    //  serverResponded(){
    //      let observable = new Observable<({room:String,name:String,deleted_data_details:any})>(observer=>{
    //          this.socket.on('deleted element update',(data)=>{
    //              observer.next(data);
    //          });
    //          return()=>{this.socket.disconnect()}
    //      });
    //      return observable;
    //  }


    // //Goe value count
    // goeValueCount(data: any) {
    //     this.socket.emit('goe count', data);
    // }


    // refereeStatusGoeCount() {
    //     let observable = new Observable<({ room: String, position: any, goe_count: any })>(observer => {
    //         this.socket.on('referee status goe count', (data) => {
    //             observer.next(data);
    //         });
    //         return () => { this.socket.disconnect() }
    //     });
    //     return observable;
    // }


}
