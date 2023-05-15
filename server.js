const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
require('custom-env').env('dev', __dirname);
const http = require('http');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const md5 = require('md5');


//const sample_data = require('./input2.json');  

const msglog = require('./server/msglog/msglog.controller');
const scoringController = require('./server/scoring/scoring.controller');


// Added for socket io
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server,{
    cors: {origin : '*'},
    maxHttpBufferSize: 1e8
});

const media_functions = require('./server/media_service/functions');

// function for socket conection
//var requests = [];


io.on('connection',(socket)=>{

    console.log("new connection made",socket.id);
    //console.log("rooms",io.sockets.adapter.rooms);

    socket.on('client request', function(data,callback){
        callback({
            status: "ok",
            data:data
          });

    });


    
    socket.on('broadcast', function(data,callback) {
        //console.log(data);
        
       
        try 
        {

            console.log("********* execution started function",new Date().toISOString());

            var dbController = require('./server/dbadmin/dbadmin.controller');
            switch(data.method_name) {
                // EC ACTIVITIES
                case 'ACK': // message acknowledgement
                    console.log('message acknowledgement');
                    break;
                
                case 'SEGSTART': // start segment
                    console.log('start segment');
                    // segment has been updated in db already (see segment.component.ts this.apiService.setSegmentInProgress(params))
                    
                    // check video stream
                    /* CODE REQUIRED HERE */

                    // create room
                    // creates new room with segmentid as name
                    socket.join(data.room);
                    io.emit('broadcast response',{method_name:data.method_name,room:data.room});

                    // callback({
                    //     status: "ok",
                    //     method_name:data["method_name"]
                    // });

                    if(!fs.existsSync('./rooms/'+data.room+'.txt'))
                    {
        
                        fs.writeFile('./rooms/'+data.room+'.txt','', (err) => {
                            if (err) {
                                // throw err;
                            }
                            console.log("JSON data is saved.");
                        });
                    }

                    var dbController = require('./server/dbadmin/dbadmin.controller');
                        

                        

                    dbController.getInitializationObject({segmentid:data.room})
                        .then((initializationObj) => {
                        
                            io.emit('broadcast response',{method_name:"SEGMENT_START_FINISHED",room:data.room});
                            

                        });
                  

                    break;
                
                case 'SEGEND': // end segment
                    console.log('end segment');
                    
                    // remove all users, closes room
                    io.socketsLeave(data.room);
                    io.emit('broadcast response',{method_name:data.method_name,room:data.room});

                    if (fs.existsSync('./rooms/'+data.room+'.txt')) 
                    {
                        fs.unlink('./rooms/'+data.room+'.txt', function (err) {
                            if (err) // throw err;
                            // if no error, file has been deleted successfully
                            console.log('File deleted!');
                        });
                    }
                    

                    callback({
                        status: "ok",
                        method_name:data["method_name"]
                    });
                    
                    break;
            
                case 'NEWSKATER': // new skater - return skater obj
                    console.log('new skater',data);
                    // return skaterobj via chat to update screens

                    var dbController = require('./server/dbadmin/dbadmin.controller');

                    var skater_info = {competitorentryid:data.skater};
                        
                    dbController.getSkaterObject({competitorentryid:data.skater})
                
                    .then((skaterObj) => {

                        skater_info["skater_data"] = skaterObj;

                        return dbController.getChatHistory({entryid:data.skater,segmentid:data.room})

                       
                    }).then((chatHistory) => {


                        console.log("!!!!! skater on ice history avialable ???");

                        if(chatHistory.hashistory == true) {    

                            
                            var count = 0;
                            for(let i=0;i<chatHistory.chatResp.length;i++)
                            {
                                if(chatHistory["chatResp"][i]["competitorentryid"] != "" )
                                {
                                    count++;
                                }
                            }
                            console.log("Yes it has",chatHistory.chatResp.length,chatHistory.hashistory,count);
                            

                            if(count >0)
                            {
                                for(let j=0;j<chatHistory["chatResp"].length;j++)
                                {
                                    
                                    var message = JSON.parse(chatHistory["chatResp"][j]["message"]);

                                    io.in(data.room).emit(message["event"],{method_name:message["data"]["method_name"],data:message["response"],history:true});

                            
                                }    
                            }
                            else
                            {
                                data["method_name"] = "LOAD_SKATER";

                                msglog.insertMsg({segmentid:data.room,competitorentryid:data.skater,message:{event:'broadcast response',data:data,response:skater_info}});

                               
                                console.log("data in skater",new Date().toISOString(),data);
                        
                        
                                io.in(data.room).emit('broadcast response',{method_name:"LOAD_SKATER",data:skater_info});


                            }

                            // dbController.competitors_ranking(data.room).then((ranking_data) => {
  
                            //     var respData = {output:ranking_data};
                                 
                            //     io.in(data.room).emit('broadcast response',{method_name:"RANKING_DATA",data:respData});
                                                         
                            //    })
                            
                        }
                         
                    
                        // callback({
                        //     status: "ok",
                        //     method_name:data["method_name"]
                        // });
                        console.log("********* execution finished callback",new Date().toISOString());

                    });
                


                    break;
                
                case 'NEWCLIENT': // client joined / re-joined - return chat history
                    console.log('client joined-------------',data);
                    
                    
                    // data.room - does this exist?
                    var room = data.room;
                    
                    if (io.sockets.adapter.rooms.has(room)) {
                        console.log(`${socket.id} tried to join ${room} and it exists!`);

                        
                        socket.join(room);
                        
                        

                        // get initialization object
                        var returnObj = {inroom:true};

                        var dbController = require('./server/dbadmin/dbadmin.controller');
                        

                        

                    dbController.getInitializationObject({segmentid:room})
                        .then((initializationObj) => {
                            
                            const result = JSON.stringify(initializationObj);

                            returnObj.initializationObj = result;
                          
                            
                            // if a skater is on the ice already this will return a full object
                            // if not it will return an empty object
                            return dbController.getSkaterOnIce({segmentid:room})
                        })
                        // is skater already loaded and on ice?
                        // check by looking for active skater... ????? HOW ?????
                        .then((skaterObj) => {
                            // if object has contents then we also need to grab chat history for this skate
                            
                            console.log("skater is on ice",skaterObj);

                            if(skaterObj.onice == true) {
                                returnObj.skaterObj = skaterObj;
                                entryid = skaterObj.competitorentryid;
                            }
                            else {
                                entryid = '';
                            }

                            console.log("in fetching history",entryid);
                            
                            return dbController.getChatHistory({entryid:entryid,segmentid:data.room})
                        })
                        .then((chatObj) => {
                            
                            console.log("8888888888888888888 after fetch history",chatObj.hashistory);
                            io.in(socket.id).emit('broadcast response',{method_name:"JOINING_ROOM",returnObj});
                            
                            
                            if(chatObj.hashistory == true)
                            {
                                console.log("----------------- Chat response",chatObj["chatResp"].length,)
                                for(let j=0;j<chatObj["chatResp"].length;j++)
                                {
                                    
                                    var message = JSON.parse(chatObj["chatResp"][j]["message"]);
                                    //console.log("history transfer - ",j,message["data"]["method_name"],chatObj["chatResp"][j]["segmentid"])
                                   
                                  
                                    io.in(socket.id).emit(message["event"],{method_name:message["data"]["method_name"],data:message["response"],history:true});

                            
                                }
                            }
                            else
                            {
                                console.log("no history")
                            }

                            var send = data.data;

                            if(send != undefined && send != "")
                            {
                                send["socket_id"] = socket.id;
                                io.in(data.room).emit('broadcast response',{method_name:"USER_JOINED",send});    

                                data["method_name"] = "USER_JOINED";
                                msglog.insertMsg({segmentid:data.room,competitorentryid:"",message:{event:'broadcast response',data:data,response:send}});

                            }
                           
                            
                            callback({
                                status: "ok",
                                method_name:data["method_name"]
                            });

                            console.log("time when server do response",new Date().toISOString());
                        })

                    
                    } else {
                        console.log(`${socket.id} tried to join ${room} but the room does not exist`);
                        // Socket.join is not executed, hence the room not created.
                        
                        var returnObj = {
                            inroom:false
                        }

                        // return to user
                        //socket.emit('room not joined',returnObj)
                        io.in(socket.id).emit('broadcast response',{method_name:"ERROR_ON_JOIN",returnObj});
                            
                    };
                    
                    break;

                
                case 'STOPSKATER':

                    io.in(data.room).emit('broadcast response',{method_name:"STOPSKATER",data:data});
                    
                    break;

                case 'RESCORE':

                    console.log("data coming into rescore fucntion ***************************",data)

                    var resData = {'skater':data.skater,'unlock':true};

                    dbController.update_score({competitorentryid:data.skater,score:''}).then((res_coming) => {
                        
                        if(res_coming.hasOwnProperty('status'))
                        {
                            console.log("score updated");

                            msglog.insertMsg({segmentid:data.room,competitorentryid:data.skater,message:{"event":"broadcast response","data":{"method_name":"RESCORE"},"response":resData}})
                            .then((res)=>{
                                console.log("res",res);
                                if(res?.success == true)
                                {
                                    io.in(data.room).emit('broadcast response', { method_name: data.method_name, data: resData });
                                
                                }
                            });

                        }
                    })
                                        
                    

                    
                    break;
                
                // JUDGE ACTIVITIES
                case 'JUDGEGOE': // add goe to element
                    console.log('add goe',data);
                    var newGOEObj = data.data; // if it exists then grab it
                    // add new element to tbl_skate_element
                    /*
                    insert requirements
                    tbl_goe
                    {
                        `skateelementid` text,
                        `officialassignmentid` text,
                        `goevalue` integer
                    }
                    returns
                    {
                        `goeid` text,// created element
                    }
                    */
                    
                    dbController.insertGOE(newGOEObj)
                    .then((createdElement) => {

                        console.log("saasassaas",createdElement)

                        if(createdElement.hasOwnProperty('newid'))
                        {

                            var respData = {createdElement:createdElement,goevalue:newGOEObj.goevalue,skate_element_id:newGOEObj.skateelementid,official_assignment_id:newGOEObj.officialassignmentid,goe_count:data["goe_count"],competitorentryid:data["competitorentryid"]}
                        
                            msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:respData}})
                            .then((res)=>{

                                console.log("res",res);
                                if(res?.success == true)
                                {
                                    // emit response
                                    io.in(data.room).emit('broadcast response', { method_name: data.method_name, data: respData });
                                                                
                                    //score update based on goe entered
                                        
                                    
                                    scoringController.calculateElementScore(newGOEObj.skateelementid).then((response) => {
                                        
                                        var output = {"competitorentryid":data.competitorentryid,"response":response};

                                        
                                        console.log("1234567890-234567890", response);

                                        
                                        data["method_name"] = "CURRENT_ELEMENT_SCORE";

                                        msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:output}})
                                        .then((res2)=>{
                                            if(res2?.success == true)
                                            {
                                                io.in(data.room).emit('broadcast response', { method_name: "CURRENT_ELEMENT_SCORE", data: output });

                                            }

                                        });
                                    })
                                    
                                    
                                    //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~", temp);

                                    ///console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~", scoringController.calculateElementScore("080970a4-075e-400e-83e2-a71a5ad6278c"));
                                    
                                }

                            });
                           

                            
                        }
                        

                    })
                    break;
                
                case 'JUDGEADJ': // panel violation                    
                    console.log('panel violation');
                    var newAdjObj = data.data; // if it exists then grab it
                    // add new element to tbl_skate_element
                    /*
                    insert requirements
                    tbl_adjustments
                    {
                        `competitorentryid`	TEXT,
                        `officialassignmentid` TEXT,
                        `sc_skatingadjustmentassociationid`	TEXT,
                        `value` INTEGER
                    }
                    returns
                    {
                        `adjustmentid` text,// created element
                    }
                    */
                    
                    dbController.insertAdjustment(newAdjObj)
                    .then((createdElement) => {

                        if(createdElement.hasOwnProperty('total'))
                        {
                            // update chat and clients
                            //newElementObj.skateelementid = createdElement.newid;
                            //data.newElementObj = newElementObj;

                            // response data
                            var respData = {createdElement:createdElement,req_data:data.data,competitorentryid:data["competitorentryid"]}
                            // emit response
                        
                            msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:respData}})
                            .then((res)=>{
                                console.log("res",res);
                                if(res?.success == true)
                                {
                                    io.in(data.room).emit('broadcast response',{method_name:data.method_name,data:respData});
                                }
                            });

                           
                        }
                      
                    })
                    break;
                
                case 'JUDGEPC': // program component
                    console.log('program component');
                    var newPCObj = data.data; // if it exists then grab it
                    // add new element to tbl_skate_element
                    /*
                    insert requirements
                    tbl_programcomponent
                    {
                        "competitorentryid"	text,
                        "officialassignmentid"	text,
                        "sc_skatingprogramcomponentdefinitionid"	text,
                        "value"	float
                    }
                    returns
                    {
                        `programcomponentid` text,// created element
                    }
                    */
                    
                    dbController.insertPC(newPCObj)
                    .then((createdElement) => {
                        console.log(createdElement.newid)

                        if(createdElement.hasOwnProperty('newid'))
                        {
                            // update chat and clients
                            //newElementObj.skateelementid = createdElement.newid;
                            //data.newElementObj = newElementObj;

                            // response data
                            var respData = {createdElement:createdElement,req_data:data.data,pc_count:data.pc_count,competitorentryid:data["competitorentryid"]}
                            // emit response
                            msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:respData}})
                            .then((res)=>{
                                console.log("res",res);
                                if(res?.success == true)
                                {
                                    io.in(data.room).emit('broadcast response',{method_name:data.method_name,data:respData});


                                    scoringController.calculateDetailedPCScore(newPCObj.competitorentryid).then((response) => {

                                        var output = {"competitorentryid":data.competitorentryid,"response":response};


                                        console.log("response ----------------------- ",response)


                                      
                                        data["method_name"] = "INDIVIDUAL_PC_SCORE";

                                        msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:output}})
                                        .then((res2)=>{
                                            console.log("res",res2);
                                            if(res2?.success == true)
                                            {
                                                io.in(data.room).emit('broadcast response', { method_name: "INDIVIDUAL_PC_SCORE", data: output });
                                            }
                                        });


                                    });
                                }
                            });


                            

                        }
                        

                    })
                    break;
                
                case 'JUDGESTATUS': // status update - help / submit etc
                    console.log('status update');
                    
                    // expects 'status_message' in data
                    /*
                    {
                        statusmessage: 'STRING VALUE'
                    }
                    */

                    // message to appropriate clients
                    // var statusmessage = data.statusmessage;

                    var respData = {data:data.data,competitorentryid:data["competitorentryid"]}
                        // emit response
                    //msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:respData}});

                    
                    msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:respData}})
                    .then((res)=>{
                        console.log("res",res);
                        if(res?.success == true)
                        {
                            io.in(data.room).emit('broadcast response',{method_name:data.method_name,data:respData});
                        }
                    });


                    
                    break;

                
                case 'GOE_COUNT_UPDATE': // message to user / panel

                    msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:data}})
                    .then((res)=>{
                        console.log("res",res);
                        if(res?.success == true)
                        {
                            io.in(data.room).emit('broadcast response',{method_name:data.method_name,data:data});
                        }
                    });
                    

                    break;

                // REFEREE ACTIVITIES

                case 'REFPC': // program component
                    console.log('program component');
                    var newPCObj = data.data; // if it exists then grab it
                    // add new element to tbl_skate_element
                    /*
                    insert requirements
                    tbl_programcomponent
                    {
                        "competitorentryid"	text,
                        "officialassignmentid"	text,
                        "sc_skatingprogramcomponentdefinitionid"	text,
                        "value"	float
                    }
                    returns
                    {
                        `programcomponentid` text,// created element
                    }
                    */
                    
                    dbController.insertPC(newPCObj)
                    .then((createdElement) => {

                        if(createdElement.hasOwnProperty('newid'))
                        {
                            console.log(createdElement.newid)
                            // update chat and clients
                            //newElementObj.skateelementid = createdElement.newid;
                            //data.newElementObj = newElementObj;
                            // response data
                            var respData = {createdElement:createdElement,req_data:data.data,pc_count:data.pc_count}
                            // emit response
                            msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:respData}})
                            .then((res)=>{
                                console.log("res",res);
                                if(res?.success == true)
                                {
                                    io.in(data.room).emit('broadcast response',{method_name:data.method_name,data:respData});
    
                                    scoringController.calculateDetailedPCScore(newPCObj.competitorentryid).then((response) => {
                                    
                                        var output = {"competitorentryid":data.competitorentryid,"response":response};
                                
                                        console.log("response from referee ----------------------- ",response)
            
                                        data["method_name"] = "INDIVIDUAL_PC_SCORE";
            
                                        msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:output}})
                                        .then((res2)=>{
                                            console.log("res",res2);
                                            if(res2?.success == true)
                                            {
                                                io.in(data.room).emit('broadcast response', { method_name: "INDIVIDUAL_PC_SCORE", data: output });
            
                                            }
                                        });
            
                                    });
                                }
                            });
    
                            
                        }
                       

                    })
                    break;

                case 'REFGOE': // add goe to element
                    console.log('add goe referee');
                    var newGOEObj = data.data; // if it exists then grab it
                    // add new element to tbl_skate_element
                    /*
                    insert requirements
                    tbl_goe
                    {
                        `skateelementid` text,
                        `officialassignmentid` text,
                        `goevalue` integer
                    }
                    returns
                    {
                        `goeid` text,// created element
                    }
                    */
                    
                    dbController.insertGOE(newGOEObj)
                    .then((createdElement) => {
                        console.log(createdElement.newid)
                        
                        if(createdElement.hasOwnProperty('newid'))
                        {
                            // update chat and clients
                            //newElementObj.skateelementid = createdElement.newid;
                            //data.newElementObj = newElementObj;

                            // response data
                            var respData = {createdElement:createdElement,goevalue:newGOEObj.goevalue,skate_element_id:newGOEObj.skateelementid,officialassignmentid:newGOEObj.officialassignmentid,goe_count:data["goe_count"]}
                            // emit response
                            msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:respData}})
                            .then((res)=>{
                                console.log("res",res);
                                if(res?.success == true)
                                {
                                    io.in(data.room).emit('broadcast response',{method_name:data.method_name,data:respData});

                                    // score update based on goe entered
                                    
                                    scoringController.calculateElementScore(newGOEObj.skateelementid).then((response) => {
                                        
        
                                        var output = {"competitorentryid":data.competitorentryid,"response":response};
        
                                        
                                        console.log("1234567890-234567890", response);
                                        response["competitorentryid"] = data.competitorentryid;
        
                                        
                                        data["method_name"] = "CURRENT_ELEMENT_SCORE";
        
                                        msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:output}})
                                        .then((res2)=>{
                                            console.log("res",res2);
                                            if(res2?.success == true)
                                            {
                                                io.in(data.room).emit('broadcast response', { method_name: "CURRENT_ELEMENT_SCORE", data: output });
        
                                            }
                                        });

                                        
                                    })

                                }
                            });
        

                            
                        }
                        
                   
                   
                    })
                    break;
            

                case 'REFADJ': // ref violation
                    console.log('ref violation');
                    var newAdjObj = data.data; // if it exists then grab it
                    // add new element to tbl_skate_element
                    /*
                    insert requirements
                    tbl_adjustments
                    {
                        `competitorentryid`	TEXT,
                        `officialassignmentid` TEXT,
                        `sc_skatingadjustmentassociationid`	TEXT,
                        `value` INTEGER
                    }
                    returns
                    {
                        `adjustmentid` text,// created element
                    }
                    */
                    
                    dbController.insertAdjustment(newAdjObj)
                    .then((createdElement) => {
                        console.log(createdElement.newid)
                        
                        if(createdElement.hasOwnProperty('total'))
                        {
                            // update chat and clients
                            //newElementObj.skateelementid = createdElement.newid;
                            //data.newElementObj = newElementObj;
                           
                            // response data
                            var respData = {createdElement:createdElement,req_data:data.data,competitorentryid:data.competitorentryid}
                            // emit response
                            msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:respData}})
                            .then((res)=>{
                                console.log("res",res);
                                if(res?.success == true)
                                {
                                    io.in(data.room).emit('broadcast response',{method_name:data.method_name,data:respData});
                                }
                            });

                            
                            
                        }
                       

                    })
                    break;
                
            
                case 'REFEREESTATUS': 
                    // status update - help / submit etc
                    
                    console.log('status update from referee');
                    
                    // message to appropriate clients
                    // var statusmessage = data.statusmessage;

                    var respData = {data:data.data,competitorentryid:data["competitorentryid"]}
                        // emit response
                    //msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:respData}});

                    
                    msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:respData}})
                    .then((res)=>{
                        console.log("res",res);
                        if(res?.success == true)
                        {
                            io.in(data.room).emit('broadcast response',{method_name:data.method_name,data:respData});
                        }
                    });

                    
                    break;


                case 'SCORESKATE': // final score submission
                    console.log('final score submission *********************',data);

                    scoringController.calculateSkateScore(data.competitorentryid).then((output) => {
                           console.log("Step 1!!!!!!!!!!", output)
                            for(let k=0;k<output.length;k++)
                            {
                                
                                if(Object.keys(output[k])[0] == "final")
                                {
                                
                                    dbController.update_score({competitorentryid:data.competitorentryid,score:Object.values(output[k])[0]}).then((res_coming) => {
                                        
                                        if(res_coming.hasOwnProperty('status'))
                                        {

                                            dbController.competitors_ranking(data.room).then((ranking_data) => {


                                                console.log("response coming in calcuate 7&&&&&&&&&&&&&&&&&&&&",output);
                                                
                                                if(ranking_data.hasOwnProperty('segment'))
                                                {
                                                    //var respData = {competitorentryid:data.competitorentryid,official_assignment_id:data.data.official_assignment_id,statusmessage:'SCORESKATER',score:output,ranking:ranking_data};
                    
                                                    var respData = {competitorentryid:data.competitorentryid,official_assignment_id:data.data.official_assignment_id,statusmessage:'SCORESKATER',score:output,ranking:ranking_data};
                        
                                                    // send to EC
                                                    msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:respData}}).then((res) => {
                                                        console.log("data inserted in msg log",res)
        
        
                                                        if(res?.success == true)
                                                        {
                                                            // NOT SURE HOW TO SPECIFY THIS!!
                                                            io.in(data.room).emit('broadcast response',{method_name:data.method_name,data:respData});
        
        
                                                            setTimeout(() => {
                                                                console.log('This code runs after 60 seconds.');
        
                                                                // code for creating mp4 file based on competitor entry
                            
                                                                dbController.getCompetitorinfoWithSegment({"competitorentryid":data.competitorentryid}).then((comp_info) => {
                                                
                                                                    console.log("server.js get response",comp_info);
        
                                                                    if(comp_info.length>0)
                                                                    {
                                                                        console.log("skater start time",comp_info[0]['skatestartvideotime'],typeof(comp_info[0]['skatestartvideotime']),comp_info[0]['skatestartvideotime']-30);
        
        
                                                                        if(comp_info[0]["video_url"] == "" || comp_info[0]["video_url"] == null)
                                                                        {
                                                                            console.log("have to create job")
        
                                                                            if(comp_info[0]["score"] != "" && comp_info[0]["score"] != null && comp_info[0]["skatestartvideotime"] != "" && comp_info[0]["skatestartvideotime"] != null && comp_info[0]["skateendvideotime"] != "" && comp_info[0]["skateendvideotime"] != null)
                                                                            {
                                                                                console.log("it has all thing available")
                                                                                
                                                                                if(comp_info[0]["rinkid"] != "" && comp_info[0]["rinkid"] != null)
                                                                                {
        
                                                                                    dbController.getRinkInfo(comp_info[0]["rinkid"]).then((rink_res)=>{
                                                                                        //console.log("rink response",rink_res)
        
                                                                                        if(rink_res.length>0)
                                                                                        {
                                                                                            // check video feed is on
        
                                                                                            if(rink_res[0]["videofeed"] ==1 && rink_res[0]["islive"] ==1)
                                                                                            {
                                                                                                console.log("procedd now",md5(comp_info[0]["competitorentryid"]));
        
                                                                                                media_functions.create_asset(md5(comp_info[0]["competitorentryid"]))
                                                                                                .then((asset_response) => {
        
                                                                                                    console.log("asset is created",asset_response)
                                                                                                    if(asset_response["completed"] == true)
                                                                                                    {
                                                                                                        console.log("values from asset",asset_response["output"]["container"],asset_response["output"]["storageAccountName"])
        
                                                                                                        var values = media_functions.date_time_format();
        
                                                                                                        var job_name =  process.env.AZURE_TRANSFORM_NAME + "_Job_" + values['date'] +"-"+values["time"]
        
                                                                                                        console.log("job name",job_name)
        
                                                                                                        
        
        
                                                                                                        // start time should be less than 30 seconds from vro time
                                                                                                        var start_time = comp_info[0]['skatestartvideotime'] - 30;
                                                                                                        var end_time = comp_info[0]['skateendvideotime'];
        
                                                                                                        if(start_time<0)
                                                                                                        {
                                                                                                            start_time = 0;
                                                                                                        }
                                                                                                        console.log("new start time",start_time);
        
                                                                                                        dbController.referee_submit_time_after_vro({"competitorentryid":data.competitorentryid}).then((time_output) => {
                                                                                                            if(time_output['completed'] == true)
                                                                                                            {
                                                                                                                console.log("interval time",time_output,Math.ceil(time_output['time_interval']));
                                                                                                                end_time = end_time + time_output['time_interval'] +30;
        
                                                                                                                console.log("new end time is ",end_time);
        
                                                                                                                media_functions.create_job(rink_res[0]["assets"],md5(comp_info[0]["competitorentryid"]),start_time,end_time,job_name)
                                                                                                                .then((job_res) => {
        
                                                                                                                    console.log("job is created",job_res)
                                                                                                                    if(job_res["completed"] == true)
                                                                                                                    {
                                                                                                                        
                                                                                                                        dbController.insertOrUpdateTransformJobRequest({"competitorentryid":comp_info[0]["competitorentryid"],"state":"started","assets":rink_res[0]["assets"]}).then((insert_job_res)=>{
                                                                                                                            console.log("completed insert in job request table")
        
                                                                                                                            if(insert_job_res.hasOwnProperty('completed'))
                                                                                                                            {
                                                                                                                                async function progress_check() {
                                                                                                                                
                                                                                                                                    const progress_update = await media_functions.job_progress_check(job_name);
                                                                                    
                                                                                    
                                                                                                                                    console.log("Done!");
                                                                                                                                    console.log(" get ouptu details",progress_update);
                                                                                    
                                                                                                                                    if(progress_update["completed"] == true)
                                                                                                                                    {
                                                                                                                                        console.log("this is the output of progress checker",progress_update["output"]["state"])
                                                                                    
                                                                                                                                        if(progress_update["output"]["state"] == "Finished")
                                                                                                                                        {
                                                                                                                                            console.log("in this case entry should be deletd")
        
                                                                                                                                            
        
                                                                                                                                            media_functions.setContainerAccessBlob(asset_response["output"]["storageAccountName"],asset_response["output"]["container"])
                                                                                                                                            .then((access_res) => {
                                                                                                                                                
                                                                                                                                                if(access_res["completed"] == true)
                                                                                                                                                {
                                                                                                                                                    
                                                                                                                                                    var video_url = "https://" + asset_response["output"]["storageAccountName"]+ ".blob.core.windows.net/" + asset_response["output"]["container"] + "/video_3500000_1280x720_4500.mp4";
                                                                                                                                                    console.log("access changed",video_url)
        
        
                                                                                                                                                    dbController.updateVideoUrl({"competitorentryid":comp_info[0]["competitorentryid"],"video_url":video_url}).then((update_url_res)=>{
                                                                                                                                                
                                                                                                                                                            
                                                                                                                                                            if(update_url_res.hasOwnProperty('completed'))
                                                                                                                                                            {
                                                                                                                                                                dbController.deleteTransformJobRequest({"competitorentryid":comp_info[0]["competitorentryid"]}).then((delete_job_res)=>{
                                                                                                                                                
                                                                                                                                                
                                                                                                                                                                    if(delete_job_res.hasOwnProperty('completed'))
                                                                                                                                                                    {
                                                                                                                                                                        
                                                                                                                                                                        console.log("delete completed")
                                                                                                                                                                        console.log("all steps completed user can use now video url to see clip")
        
                                                                                                                                                                    }
                                                                                                                                                                })
        
                                                                                                                                                            
                                                                                                                                                            }
                                                                                                                                                        });
        
        
                                                                                                                                                }
                                                                                                                                            })
        
        
        
                                                                                                                                        }
                                                                                                                                        if(progress_update["output"]["state"] == "Canceled" || progress_update["output"]["state"] == "Error")
                                                                                                                                        {
                                                                                                                                            console.log("in this case status in database should be chnaged");
        
                                                                                                                                            dbController.insertOrUpdateTransformJobRequest({"competitorentryid":comp_info[0]["competitorentryid"],"state":progress_update["output"]["state"],"assets":rink_res[0]["assets"]}).then((update_job_res)=>{
                                                                                                                    
                                                                                                                    
                                                                                                                                                if(update_job_res.hasOwnProperty('completed'))
                                                                                                                                                {
                                                                                                                                                    console.log("Job has went into error stage - you ca notify user if you want")
                                                                                                                                                    
        
                                                                                                                                                }
        
                                                                                                                                            })
        
                                                                                                                                        }
                                                                                                                                    }
                                                                                    
                                                                                                                                
                                                                                                                                }
                                                                                    
                                                                                                                                progress_check();
                                                                                                                            }
                                                                                                                        
        
                                                                                                                                
                                                                                                                        })
                                                                                                                        
                                                                                                                    }
                                                                                                                });
                                                                                                                
                                                                                                            }
                                                                                                    
        
                                                                                                        })
                                                                                                        
        
                                                                                                    }
                                                                                                });
        
        
                                                                                                
        
                                                                                                
        
                                                                                            }
                                                                                        }
                                                                                    })
                                                                                }
                                                                                
        
                                                                            }
                                                                            
                                                                        }
                                                                    
                                                                    }
                                                                    
                                                                });
                                                                
                                                            }, 60000);
        
                                                            
        
                                                        }
        
                                                        
                                                        
                                                    });

                                                }
                                                
                
                                             });

                                        }
                                        
                                    });
                                   
                                }
                            }

                        


                    });

                    // send message
                   
                    break;
                
                case 'PANELMSG': // message to user / panel
                    //console.log('777777777777777 message to user / panel 777777777777777777',data);
                   
                    io.in(data.room).emit('broadcast response',{method_name:data.method_name,data:data});

                    break;

                
                case 'REF_GOE_COUNT_UPDATE': // message to user / panel

                    msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:data}})
                    .then((res)=>{
                        console.log("res",res);
                        if(res?.success == true)
                        {
                            io.in(data.room).emit('broadcast response',{method_name:data.method_name,data:data});
                        }
                    });

                    

                    break;
                    
                // DIO ACTIVITIES
                case 'NEWELM': // request new element
                    console.log('request new element------------',data);
                    console.log("time on add server request in server.js",new Date().toISOString())
                    
                    var newElementObj = data.data; // if it exists then grab it
                    // add new element to tbl_skate_element
                    /*
                    insert requirements
                    tbl_skate_element
                    {
                        `competitorentryid` text, // competitorentryid guid
                        `sc_skatingelementdefinitionid` text, // guid
                        `programorder` integer, // order in program
                        `elementcount` integer, // num elements in multiptype
                        `multitype` text, // ['COMBO','SEQ']
                        `steporder` integer, // order in multitype
                        `halfwayflag` integer, // 1/0 (true/false)
                        `elementstart` integer, // timestamp for video
                        `elementend` integer // timestamp for video
                    }
                    returns
                    {
                        `skateelementid` text // created element - first one in the element combination 
                    }
                    
                    var dataSample = [
                        {
                            competitorentryid:'c714c237-167f-4f61-ad5f-60494dd2c71c',
                            sc_skatingelementdefinitionid:'F2327C16-9C90-EB11-B1AC-000D3A1B1808',
                            programorder:10,
                            elementcount:2,
                            multitype:'COMBO',
                            steporder:1,
                            halfwayflag:0,
                            notes:"EF5B9D47-BEA0-EC11-B400-000D3A582625",
                            invalid:0,
                            elementstart:50,
                            elementend:55
                        },
                        {
                            competitorentryid:'c714c237-167f-4f61-ad5f-60494dd2c71c',
                            sc_skatingelementdefinitionid:'88347C16-9C90-EB11-B1AC-000D3A1B1808',
                            programorder:10,
                            elementcount:2,
                            multitype:'COMBO',
                            steporder:2,
                            halfwayflag:0,
                            notes:"",
                            invalid:0,
                            elementstart:50,
                            elementend:55
                        }
                    ]
                    newElementObj = dataSample;
                    */
                
                    

                    dbController.insertElement(newElementObj)
                    .then((createdElement) => {
                        
                        if(createdElement.hasOwnProperty('newid'))
                        {   

                            console.log(createdElement.newid)

                            // update chat and clients
                            //newElementObj.skateelementid = createdElement.newid;
                            //data.newElementObj = newElementObj;

                            var element_def = [];
                            for(let k=0;k<newElementObj.length;k++)
                            {
                                element_def.push(newElementObj[k]["sc_skatingelementdefinitionid"])
                            }

                            createdElement["element_definitions"] = element_def;

                            // response data
                            var respData = {createdElement:createdElement,input_data:data["input_data"],competitorentryid:data["competitorentryid"]}
                            // emit response

                            msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:respData}})
                            .then((res)=>{
                                console.log("res",res);
                                if(res?.success == true)
                                {
                                    console.log("time on add server response in server.js",new Date().toISOString())
                                    
                                    io.in(data.room).emit('broadcast response',{method_name:data.method_name,data:respData});

                                    // score update after insert

                                    // socre update after new score
                                    scoringController.calculateElementScore(createdElement.newid).then((response) => {
                                        
                                        var output = {"competitorentryid":data.competitorentryid,"response":response};
                                        

                                        console.log("1234567890-234567890", output);
                                        
                                        data["method_name"] = "CURRENT_ELEMENT_SCORE";

                                        msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:output}})
                                        .then((res2)=>{
                                            console.log("res",res2);
                                            if(res2?.success == true)
                                            {
                                                io.in(data.room).emit('broadcast response', { method_name: "CURRENT_ELEMENT_SCORE", data: output });

                                            }
                                        });
                                    })
                                }
                            });


                            
                            
                        }

                        

                    
                    })
                    break;
                
                case 'CHGELM': // request change element
                    console.log('request change element',data);

                    var elementObj = data.data; // if it exists then grab it
                    // add new element to tbl_skate_element
                    /*
                    change requirements
                    tbl_skate_element
                    {
                        `skateelementid` text // created element
                    }
                    returns
                    {
                        'success' boolean // true / false
                        // for checking purpose transfering skateelement id
                    }
                    */

                    dbController.changeElement(elementObj)
                    .then((changeResponse) => {

                        if(changeResponse.hasOwnProperty('newid'))
                        {

                            var respData = changeResponse;
                            //respData["req_data"] = data.data;
                            respData["input_data"] = data["input_data"];
                            respData["competitorentryid"]=data["competitorentryid"]
                            
    
                            var element_def = [];
                            for(let k=0;k<elementObj.length;k++)
                            {
                                element_def.push(elementObj[k]["sc_skatingelementdefinitionid"])
                            }
    
                            respData["element_definitions"] = element_def;
    
                            msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:respData}})
                            .then((res)=>{
                                console.log("res",res);
                                if(res?.success == true)
                                {

                                    // emit response
                                    io.in(data.room).emit('broadcast response',{method_name:data.method_name,data:respData});
            
                                    console.log("new change #############################",respData);
            
            
                                    // socre update after new score
                                    scoringController.calculateElementScore(respData.newid).then((response) => {
                                        
                                        var output = {"competitorentryid":data.competitorentryid,"response":response};
                                        
            
                                        console.log("1234567890-234567890", output);
            
                                        
                                        data["method_name"] = "CURRENT_ELEMENT_SCORE";
            
                                        msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:output}})
                                        .then((res2)=>{
                                            console.log("res",res2);
                                            if(res2?.success == true)
                                            {
                                                io.in(data.room).emit('broadcast response', { method_name: "CURRENT_ELEMENT_SCORE", data: output });
            
                                            }
                                        });

            
                                    })

                                }
                            });

                            

                        }


                    })
                    break;
                
                case 'DELELM': // request delete element
                    console.log('request delete element');
                    var elementObj = data.data; // if it exists then grab it

                    dbController.deleteElement(elementObj)
                    .then((changeResponse) => {

                        if(changeResponse.hasOwnProperty('success'))
                        {
                            console.log("change response",changeResponse);

                            var respData = {res:changeResponse,position:elementObj.programorder,competitorentryid:data["competitorentryid"]};
    
                            msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:respData}})
                            .then((res)=>{
                                console.log("res",res);
                                if(res?.success == true)
                                {
                                    // emit response
                                    io.in(data.room).emit('broadcast response',{method_name:data.method_name,data:respData});
                                    
                                }
                            });

                           

                        }
                        
                    })

                    break;
                
                case 'ELMCOMPOSE': // in progress element update
                    console.log('in progress element update');
                    // ???? clarify ????
                    break;
                
                case 'HALFWAY_REQUEST':
                    
                    console.log('request halfway element------------',data);

                    var respData = {data:data.data,competitorentryid:data["competitorentryid"]}
                
                
                    
                    
                    dbController.halfway_update({"competitorentryid":data.competitorentryid,"index":data["data"]["index"]})
                    .then((output_data) => {
                        
                        msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:respData}})
                        .then((res)=>{
                            console.log("res",res);
                            if(res?.success == true)
                            {
                                io.in(data.room).emit('broadcast response',{method_name:data.method_name,data:respData});


                                console.log("response coming back",output_data);

                                for(let k=0;k<output_data.length;k++)
                                {
                                    scoringController.calculateElementScore(output_data[k]).then((response) => {
                                    
                                        var output = {"competitorentryid":data.competitorentryid,"response":response};
                                        
            
                                        console.log("1234567890-234567890", output);
            
                                        
                                        data["method_name"] = "CURRENT_ELEMENT_SCORE";
            
                                        msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:output}})
                                        .then((res2)=>{
                                            console.log("res2",res2);
                                            if(res2?.success == true)
                                            {
                                                io.in(data.room).emit('broadcast response', { method_name: "CURRENT_ELEMENT_SCORE", data: output });
            
                                            }
                                        });

                                    })
                                }
                            }
                        });

                        
                        
                    
                    });

                    break;

                case 'DIOADJCHG': // adjustment changes - bonus / deductions
                    console.log('adjustment changes',data);
                    var newAdjObj = data.data; // if it exists then grab it
                    // update existing adjustments
                    // expecting guid of adjutment being edited
                    /*
                    {
                        adjustmentid: text,
                        value: int
                    }
                    returns
                    {
                        'success' boolean // true / false
                    }
                    */

                

                    // dbController.updateAdjustment(newAdjObj)
                    // .then((changeResponse) => {
                    //     var respData = changeResponse;
                    //     // emit response
                    //     io.in(socket.id).emit('broadcast response',{method_name:data.method_name,data:respData});
                    // })

                    dbController.insertAdjustment(newAdjObj)
                    .then((createdElement) => {

                        if(createdElement.hasOwnProperty('total'))
                        {
                            // update chat and clients
                            //newElementObj.skateelementid = createdElement.newid;
                            //data.newElementObj = newElementObj;
                            // response data
                            createdElement["position"] = data.position;
                            createdElement["value"] = newAdjObj.value;
                            createdElement['sc_skatingadjustmentassociationid'] = data["data"]["sc_skatingadjustmentassociationid"];
                            createdElement["competitorentryid"] = data["competitorentryid"];
                            

                            var respData = {createdElement:createdElement}
                            // emit response

                            msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:respData}})
                            .then((res)=>{
                                console.log("res",res);
                                if(res?.success == true)
                                {
                                    io.in(data.room).emit('broadcast response',{method_name:data.method_name,data:respData});
                                }
                            });

                            

                        }

                        
                    })

                    // update chat and clients
                    break;
                
                case 'DIOSTATUS': // status update - review / wbp run / finalized
                    console.log('status update');
                    // status message to clients for screen updates
                    // expecting message
                    /*
                    {
                        statusmessage: string (review / wbp run / finalized)
                    }
                    */

                    if(data["data"]["statusmessage"] == "WBP")
                    {
                        console.log("errors are coming in server file )))))))))))))))))))",data["data"]["changed_data"]["errors"])

                        dbController.wbp_error_log(data)
                        .then((output) => {
                            console.log("WBP text file status ",output);
                        });

                       
                    }

                 
                    // send to user

                    //var score = Math.floor(Math.random() * (100 - 0 + 1) + 0);

                    var respData = {"competitorentryid":data.competitorentryid, "statusmessage":data["data"]["statusmessage"], "official_assignment_id":data["data"]["official_assignment_id"],data:data["data"]};

                    msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:respData}})
                    .then((res)=>{
                        console.log("res",res);
                        if(res?.success == true)
                        {
                            io.in(data.room).emit('broadcast response',{method_name:data.method_name,data:respData});
                    
                        }
                    });
                    // dbController.update_score({competitorentryid:data.competitorentryid,score:score});
                   
                    
                    break;

                
                case 'CHECK_UNCHECK_REQUEST':
                
                    console.log('request CHECK_UNCHECK_REQUEST element------------',data);

                    var respData = {data:data.data,competitorentryid:data["competitorentryid"]}
                
                
                    msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:respData}})
                    .then((res)=>{
                        console.log("res",res);
                        if(res?.success == true)
                        {
                            io.in(data.room).emit('broadcast response',{method_name:data.method_name,data:respData});
                        }
                    });

                    
                    
                    break;


                case 'TEM_ELM_ENTER':

                    console.log("server has recieved request",data);

                    dbController.insertTemplatedElement(data.data)
                    .then((createdElement) => {
                        
                        console.log("^^^^^^^^^^^^^^^^^ OPERATION DONE",createdElement);

                        
                    });

                    break;
                // VRO ACTIVITIES
                case 'ELMVIDCLIP': // define video clip - start / end time
                    console.log('define video clip');
                    // log start and / or end time of skate element in stream
                    var elementObj = data.data; 

                    dbController.videoClipElement(elementObj)
                    .then((changeResponse) => {

                        console.log("sddda",changeResponse);
                        if(changeResponse.hasOwnProperty('skateelementid'))
                        {
                            var respData = changeResponse;
                    
                            // emit response
                            msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:respData}})
                            .then((res)=>{
                                console.log("res",res);
                                if(res?.success == true)
                                {
                                    
                                    io.in(data.room).emit('broadcast response',{method_name:data.method_name,data:respData});
                            
                                }
                            });

                        }   
                        
                    })

                    break;
                
                case 'ELMVIDCLIPDEL':

                    console.log('delete video clip');
                    // log start and / or end time of skate element in stream
                    var elementObj = data.data; 

                    dbController.videoClipElement(elementObj)
                    .then((changeResponse) => {

                        if(changeResponse.hasOwnProperty('skateelementid'))
                        {
                            console.log("sddda",changeResponse);

                            var respData = changeResponse;
                            // emit response
                            msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:respData}})
                            .then((res)=>{
                                console.log("res",res);
                                if(res?.success == true)
                                {
                                    io.in(data.room).emit('broadcast response',{method_name:data.method_name,data:respData});
                                }
                            });

                            
                        }
                        
                    })


                    break;


                case 'STARTSKATE': // start skate timer
                    console.log('start skate timer');
                    // message clients with start of timer (and time?)

                    var elementObj = data.data; 

                    dbController.startSkate(elementObj)
                    .then((changeResponse) => {

                        console.log("here",changeResponse);
                        if(changeResponse.hasOwnProperty('success'))
                        {

                            changeResponse["skatestartvideotime"] = data.data["skatestartvideotime"];
                            var respData = changeResponse;
                            // emit response
                            msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:respData}})
                            .then((res)=>{
                                console.log("res",res);
                                if(res?.success == true)
                                {
                                    io.in(data.room).emit('broadcast response',{method_name:data.method_name,data:respData});

                                }
                            });

                            
                        }

                      
                    })

                    // emit response
                    //io.in(socket.id).emit('broadcast response',{method_name:data.method_name});
                    break;
                
                case 'STOPSKATE': // stop skate timer
                    console.log('stop skate timer');
                    // message clients to stop timer

                    var elementObj = data.data; 

                    dbController.stopSkate(elementObj)
                    .then((changeResponse) => {
                        if(changeResponse.hasOwnProperty('success'))
                        {
                            changeResponse["skateendvideotime"] = data.data["skateendvideotime"];

                            var respData = changeResponse;
    
                            
                            msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:respData}})
                            .then((res)=>{
                                console.log("res",res);
                                if(res?.success == true)
                                {
                                    io.in(data.room).emit('broadcast response',{method_name:data.method_name,data:respData});
                                }
                            });
                            // emit response
                            
                        }
                       
                    })

                    // emit response
                    //io.in(socket.id).emit('broadcast response',{method_name:data.method_name});
                    break;

                
                case 'CLIP_CODE_CHANGE': // message to user / panel

                    msglog.insertMsg({segmentid:data.room,competitorentryid:data.competitorentryid,message:{event:'broadcast response',data:data,response:data}})
                    .then((res)=>{
                        console.log("res",res);
                        if(res?.success == true)
                        {
                            io.in(data.room).emit('broadcast response',{method_name:data.method_name,data:data});

                        }
                    });


                    break;

                
                // CASE FOR BROADCASTER
                case 'HISTORY_SKATER_DATA':
                    console.log('new skater history', data);
                    
                    //var dbController = require('./server/dbadmin/dbadmin.controller');

                    
                    dbController.getChatHistory({entryid:data.skater,segmentid:data.room})
                
                        .then((chatHistory) => {

                            if (chatHistory["hashistory"] == true) {
                                
                                for(let j=0;j<chatHistory["chatResp"].length;j++)
                                {
                                    
                                    var message = JSON.parse(chatHistory["chatResp"][j]["message"]);

                                    
                                    if (chatHistory["chatResp"][j]["competitorentryid"] != "") {
                                                   
                                        // console.log("987654321", chatHistory["chatResp"][j]["competitorentryid"] != "")  
                                        // console.log("metodsdfghjkl", message["data"]["method_name"]);
                                        
                                        io.in(socket.id).emit(message["event"], { method_name: message["data"]["method_name"], data: message["response"], history: true });   
                                    
                                    }


                            
                                } 

                            }
                            //console.log("------------ chat history",chatHistory, chatHistory.chatResp.length);
                    
                    });
                    
                    break;
                
                case 'CURRENT_SKATER_DATA':
                    
                console.log("#########################current skater data request");

                dbController.getSkaterOnIce({segmentid:data.room})
                        .then((skaterObj) => {
						
						console.log("skater data",skaterObj);

                        if(skaterObj.onice == true) {
                           
                            entryid = skaterObj.competitorentryid;

                            dbController.getChatHistory({entryid:entryid,segmentid:data.room})
                                .then((chatObj) => {
                                
                                //console.log("chatobj",chatObj);
                                
                                if(chatObj.hashistory == true)
                                    {
                                    
                                        for(let j=0;j<chatObj["chatResp"].length;j++)
                                        {
                                            
                                            //console.log("history transfer - ",j,chatObj["chatResp"][j]["message"])
                                            var message = JSON.parse(chatObj["chatResp"][j]["message"]);

                                            console.log("name",message["data"]["method_name"]);
                                            io.in(socket.id).emit(message["event"],{method_name:message["data"]["method_name"],data:message["response"],history:true});

                                    
                                        }
                                    }
                                    
                                })

                        }

						})

                    break;

                
                // CASE FOR RANKING HISTORY
                case 'RANKING_DATA':
                        
                        console.log("ranking data request",data);

                        dbController.competitors_ranking(data.room).then((ranking_data) => {

                            if(ranking_data.hasOwnProperty('segment'))
                            {
                                var respData = {output:ranking_data};

                                io.in(socket.id).emit('broadcast response',{method_name:data.method_name,data:respData});
    
                            }
                         
                        });

                    break;


                default:
                    console.log('you shouldn\'t see this');
                    break;
            }

            
        
            console.log("************* execution finished",new Date().toISOString());


        }
        catch (error) 
        {   
            console.error("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Error coming ~~~~~~~~~~~~~~~~~~~~~~~~~~~~",error);
           
        }
    


        
        
    });

    // socket.on('load skater', function(data) {
    //     // send skater details to judge screens
    //     console.log(data)
    //     var dbController = require('./server/dbadmin/dbadmin.controller');
    //     dbController.getSkaterObject({competitorentryid:data.skater})
    //     .then((skaterObj) => {
    //         //console.log(skaterObj)
    //         data.skater = skaterObj;

    //         // send first message to chatlog
    //         msglog.insertMsg({competitorentryid:data.skater,message:{event:'SKATER LOADED',data:data}});

    //         io.in(socket.id).emit('skater loaded',{room:data.room,skater:data.skater});
    //     });
    // });

    // socket.on('join room', function(data) {
    //     // data.room - does this exist?
    //     var room = data.room;
    //     var official = data.assignmentid;
    //     var competitorentryid = data.competitorentryid;
        
    //     if (io.sockets.adapter.rooms.has(room)) {
    //         console.log(`${socket.id} tried to join ${room} and it exists!`);
    //         socket.join(room);
            
    //         // get initialization object
    //         var returnObj = {inroom:true};

    //         var dbController = require('./server/dbadmin/dbadmin.controller');

    //         dbController.getInitializationObject({segmentid:room})
    //         .then((initializationObj) => {
				
	// 			/*const getCircularReplacer = () => {
	// 				const seen = new WeakSet();
	// 				return (key, value) => {
	// 					if (typeof value === 'object' && value !== null) {
	// 						if (seen.has(value)) {
	// 							return;
	// 						}
	// 						seen.add(value);
	// 					}
	// 					return value;
	// 				};
	// 			};*/

    //             //console.log(initializationObj);
				
	// 			const result = JSON.stringify(initializationObj);//, getCircularReplacer());

    //             //console.log(result);
    //             returnObj.initializationObj = result;
	// 			returnObj.inroom = true;
				
    //             //returnObj.initializationObj = initializationObj;
    //             //socket.emit('room joined',stringify(returnObj))
	// 			socket.emit('room joined',returnObj);
				
    //             //socket.emit('room joined',JSON.stringify(returnObj, getCircularReplacer()));
    //             //return msglog.getMsgs({competitorentryid:competitorentryid});
    //         })
    //         /*.then((chatHistoryObj) => {
    //             //console.log(chatHistoryObj)
    //             returnObj.chatHistoryObj = chatHistoryObj;

    //             // send first message to chatlog
    //             msglog.insertMsg({competitorentryid:competitorentryid,message:{event:'USER JOINED',data:data}});

    //             // return to user
    //             //socket.emit('room joined',returnObj)
    //         })*/

    //         /*
    //         AFTER ROOM JOIN, AND INITIALIZATION OBJECT SENT, NEED TO CHECK IF SKATER ACTIVE
    //         THEN GET SKATER OBJECT, AND CHAT HISTORY
    //         */

    //     } else {
    //         console.log(`${socket.id} tried to join ${room} but the room does not exist`);
    //         // Socket.join is not executed, hence the room not created.
            
    //         var returnObj = {
    //             inroom:false
    //         }

    //         // return to user
    //         socket.emit('room not joined',returnObj)
    //     };
        
    // });

    // socket.on('join', function(data){


    //     socket.join(data.room);
    //     console.log("user joined room",data.room);

    //     io.in(socket.id).emit('getting data from server',{object_data:sample_data});

       

    //     socket.broadcast.to(data.room).emit('new user joined',{room:data.room,message:' user has joined this room',name:data.official});
        
    // });

    // socket.on('added element', function(data){
    
    //     // send first message to chatlog
    //     msglog.insertMsg({competitorentryid:'31ae4278-9167-4464-ae15-b1adfc86efbc',message:{event:'ELEMENT ADDED',data:data}});

    //     io.in(data.room).emit('new element added',{room:data.room,name:data.official,added_data_details:data.details,index:data.index});
    // });


    // socket.on('edited element', function(data){
     
    //     // send first message to chatlog
    //     msglog.insertMsg({competitorentryid:'31ae4278-9167-4464-ae15-b1adfc86efbc',message:{event:'ELEMENT EDITED',data:data}});

    //     io.in(data.room).emit('element edited update',{room:data.room,name:data.official,edited_data_details:data.details,index:data.index});
    // });

    // socket.on('deleted element', function(data){
     
    //     // send first message to chatlog
    //     msglog.insertMsg({competitorentryid:'31ae4278-9167-4464-ae15-b1adfc86efbc',message:{event:'ELEMENT DELETED',data:data}});

    //     io.in(data.room).emit('deleted element update',{room:data.room,name:data.official,deleted_data_details:data.details});
    // });
    
    socket.on('message_details', function(data){
    
       
        io.in(data.room).emit('message_broadcast',{room:data.room,message_details:data.name});

    });

    // socket.on('video_clip_captured', function(data){

    //     io.in(data.room).emit('video_clip_broadcast',{room:data.room,details:data.details});

    // });

    // socket.on('element_clip_code_change', function(data){

    //     io.in(data.room).emit('video_clip_code_changed',{room:data.room,details:data.details});

    // });

    socket.on('dio_element_entered', function(data){

        io.in(data.room).emit('dio_element_changed',{room:data.room,details:data.details});

    });

    socket.on('cancel_button_clicked', function(data){

        io.in(data.room).emit('cancel_button_click_response',{room:data.room,details:data.details});

    });

    // socket.on('goe count', function (data) {
    //     console.log("data....", data)

    //     io.in(data.room).emit('referee status goe count',{room:data.room,position:data.position, goe_count:data.goe_count});

    // });

    socket.on('disconnecting', function(){

        // send room message that client is leaving room

        
        console.log("88888888888888888888888888888888 Room disconnected - ",socket.id)

        var room = "";
        io.sockets.adapter.rooms.forEach((value, key) => {
            //console.log(value); // 👉️ Chile country, 30 age
            
            

            if(value.has(socket.id) == true)
            {
                if(key.length >25)
                {
                    room = key;
                    //console.log('Key is this 222222222',key);
                }
                
            }

          });

        var info = {}; 
        info["method_name"] = "USER_DISCONNECTED";

        var response_send = {};
        response_send["id"] = socket.id; 
        
        if(room != undefined && room != "" && room != null)
        {
            msglog.insertMsg({segmentid:room,competitorentryid:"",message:{event:'broadcast response',data:info,response:response_send}});
        }
        

        //io.in(room).emit('broadcast response',{method_name:data.method_name,data:data});

        io.in(room).emit('broadcast response', {method_name:"USER_DISCONNECTED",id: socket.id});

        // socket.rooms.forEach(function(room){
        //     io.in(room).emit('broadcast response', {method_name:"USER_DISCONNECTED",id: socket.id});
        // });

    });

    socket.on('disconnect',function(){

      console.log("disconnectefd _________________________________________________________")
    });
})


const isonline = (process.env.ISONLINE == 'true' ? true : false);

/* LOCAL ONLY */
if(!isonline) {
    /* DB CHECKS AND SOME SETUP */
    const dbController = require('./server/dbadmin/dbadmin.controller');

    if(!dbController.checkDb("localCheck")) { // "localCheck" var just lets db functions know to return locally rather than send result via http
        if(!dbController.rebuildDb("localCheck")) {  // if not found then create
            console.log("Database creation failed");
        }
    }
}

// configuring express
app.use(fileUpload({ 
      useTempFiles: true, 
      tempFileDir: '/tmp/'
}));

app.use(cors());
app.use(express.json()); // use json
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    } else {
        return next();
    }
});


/**** UNCOMMENT THIS SECTION TO USE ANGULAR AS STATIC INSIDE EXPRESS ****/
/*  THE FOLLOWING SETTINGS RUN ANGULAR INSIDE EXPRESS AS ONE APP. */
// Point static path to dist
//app.use(express.static(path.join(__dirname, 'dist')));
/**** UNCOMMENT THIS SECTION TO USE ANGULAR AS STATIC INSIDE EXPRESS ****/


/**** ALSO REMOVE proxy.config.json AND EDIT package.json "start" LINE TO REMOVE CALL TO proxy.config ****/


// load routes
const DbFunctionsRouter = require('./server/dbadmin/routes.config', __dirname);
const AuthFunctionsRouter = require('./server/auth/routes.config', __dirname);
const EventFunctionsRouter = require('./server/event/routes.config', __dirname);
const CategoryFunctionsRouter = require('./server/category/routes.config', __dirname);
const SegmentFunctionsRouter = require('./server/segment/routes.config', __dirname);
const CompetitorFunctionsRouter = require('./server/competitor/routes.config', __dirname);
const OfficialFunctionsRouter = require('./server/official/routes.config', __dirname);
const FileImportFunctionsRouter = require('./server/fileimport/routes.config', __dirname);
const ScoringFunctionsRouter = require('./server/scoring/routes.config', __dirname);
const ReportsFunctionsRouter = require('./server/reporting/routes.config', __dirname);


// get the routes
DbFunctionsRouter.routesConfig(app);
AuthFunctionsRouter.routesConfig(app);
EventFunctionsRouter.routesConfig(app);
CategoryFunctionsRouter.routesConfig(app);
SegmentFunctionsRouter.routesConfig(app);
CompetitorFunctionsRouter.routesConfig(app);
OfficialFunctionsRouter.routesConfig(app);
FileImportFunctionsRouter.routesConfig(app);
ScoringFunctionsRouter.routesConfig(app);
ReportsFunctionsRouter.routesConfig(app);


/**** UNCOMMENT THIS SECTION TO USE ANGULAR AS STATIC INSIDE EXPRESS ****/
// Catch all other routes and return the index file
//app.get('*', (req, res) => {
//    res.sendFile(path.join(__dirname, 'dist/index.html'));
//});
/**** UNCOMMENT THIS SECTION TO USE ANGULAR AS STATIC INSIDE EXPRESS ****/


/* Get port from environment and store in Express */
const port = process.env.PORT || process.env.APP_PORT;
server.listen(port, () => console.log(`API running on ${process.env.APP_ENV} at ${port}!`));


app.use(express.static(path.join(__dirname,'./dist')));

app.get('/en/*', (req, res) => res.sendFile(path.join(__dirname,'dist/en/index.html')));
app.get('/fr/*', (req, res) => res.sendFile(path.join(__dirname,'dist/fr/index.html')));


module.exports = app;
