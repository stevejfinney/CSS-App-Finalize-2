const knexconfig = require('../../knexfile',__dirname);
const knex = require('knex')(knexconfig.development);
const gf = require('../functions/global.functions',__dirname);
const { count } = require('console');
//knex.raw("PRAGMA foreign_keys = ON;").then(() => {
//    console.log("Foreign Key Check activated.");
//});
const got = require('got');
const { v4: uuidv4 } = require('uuid');
const apiUrl = process.env.CLOUD_API_URL;
const apiCloudSecret = process.env.CLOUD_API_SECRET

const media_functions = require('../media_service/functions');

const md5 = require('md5');
 

exports.allEvents = (req, res) => {
    
    // if we're online then we need query with permissions check
    if(process.env.ISONLINE === "true") {
        knex.select([
            'tbl_events.*',
            'css_sc_skatingeventclass.sc_name as entypename',
            'css_sc_skatingeventclass.sc_frenchname as frtypename'
        ])
        .from('tbl_events')
        .leftJoin('css_sc_skatingeventclass','tbl_events.sc_skatingeventclassid','css_sc_skatingeventclass.sc_skatingeventclassid')
        .join('tbl_dspermissions','tbl_events.eventid','tbl_dspermissions.eventid') // checks record in permissions table
        .where('tbl_dspermissions.dscontactid',req.body.contactid)
        .orderBy('tbl_events.eventid')
        .then((rows) => {
            // sort languages in to language category
            rows.forEach((row, index, array) => {
                // build languages object
                row.languages = {'en':{name:row.entypename},'fr':{name:row.frtypename}};
                
                // remove other language fields
                delete row.entypename;
                delete row.frtypename;
                
                if(index === array.length-1) {
                    res.status(200).send(rows);
                }
            });
        })
        .catch((err) => {
            console.log( err); // throw err
        });
    }
    else { // no permissions check
        knex.select([
            'tbl_events.*',
            'css_sc_skatingeventclass.sc_name as entypename',
            'css_sc_skatingeventclass.sc_frenchname as frtypename'
        ])
        .from('tbl_events')
        .leftJoin('css_sc_skatingeventclass','tbl_events.sc_skatingeventclassid','css_sc_skatingeventclass.sc_skatingeventclassid')
        .orderBy('tbl_events.eventid')
        .then((rows) => {
            // sort languages in to language category
            rows.forEach((row, index, array) => {
                // build languages object
                row.languages = {'en':{name:row.entypename},'fr':{name:row.frtypename}};
                
                // remove other language fields
                delete row.entypename;
                delete row.frtypename;
                
                if(index === array.length-1) {
                    res.status(200).send(rows);
                }
            });
        })
        .catch((err) => {
            console.log( err); // throw err
        });
    }
    
    
}

exports.eventById = (req, res) => {
    knex('tbl_events')
    .where('eventid',req.params.eventid)
    .then((rows) => {
        // sort languages in to language category
        rows.forEach((row, index, array) => {
            // build languages object
            row.languages = {'en':{name:row.enname},'fr':{name:row.frname}};
            
            // remove other language fields
            delete row.enname;
            //delete row.endescription;
            delete row.frname;
            //delete row.frdescription;
            
            if(index === array.length-1) {
                res.status(200).send(rows);
            }
        });
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.eventBySegmentId = (req, res) => {
    knex("tbl_events")
    .leftJoin('tbl_categories','tbl_categories.eventid','tbl_events.eventid')
    .leftJoin('tbl_segments','tbl_segments.categoryid','tbl_categories.categoryid')
    .where('tbl_segments.segmentid', req.params.segmentid)
    .then((rows) => {
        res.status(200).send(rows);
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.insertEvent = (req, res, next) => {
    gf.insertEvent(req.body)
    .then((eventObj) => {
        req.body = eventObj;
        return next();
    })
    .catch((err) => {
        console.log( err); // throw err
    })
}

exports.updateEvent = (req, res, next) => {
    gf.updateEvent(req.body)
    .then((eventObj) => {
        req.body = eventObj;
        return next();
    })
    .catch((err) => {
        console.log( err); // throw err
    })
}

exports.deleteEvent = (req, res) => {
    knex('tbl_events')
    .where({ eventid: req.params.eventid })
    .del()
    .then((rows) => {
        res.status(200).send(String(rows));
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.allEventClasses = (req, res) => {
    knex('css_sc_skatingeventclass')
    .orderBy('sc_name')
    .then((rows) => {
        rows.forEach((row, index, array) => {
            // build languages object
            row.languages = {'en':{name:row.sc_name},'fr':{name:row.sc_frenchname}};
            
            // remove other language fields
            delete row.sc_name;
            delete row.sc_frenchname;
            
            if(index === array.length-1) {
                res.status(200).send(rows);
            }
        });
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.eventPermissions = (req, res) => {
    knex('tbl_dspermissions')
    .where({eventid: req.params.eventid})
    .then((rows) => {
        res.status(200).send(rows);
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.getDataSpecialists = (req, res) => {
    (async () => {
        
        if(req.body.env === 'online') {
            try {
                const {body} = await got.post(`${apiUrl}/api/getdataspecialists`, {
                    responseType: 'json',
                    headers : { "Authorization" : `Raw ${apiCloudSecret}` }
                });
                
                var offObj = [];
                // loop through response and map to correct field names
                body.forEach((row, index, array) => {
                    var rowObj = {};

                    rowObj.sc_dataspecialistid = body[index]["contactid"];
                    rowObj.sc_fullname = body[index]["fullname"]
                    
                    console.log(rowObj);
                    offObj.push(rowObj);

                    if(index === array.length-1) {
                        res.status(200).send(offObj);
                    }
                })
            }
            catch (error) { // api will send 400 response
                console.log(error);
                res.status(400).send(error.response);
            }
        }
        else {
            knex('css_sc_dataspecialists')
            .orderBy('sc_fullname')
            .then((rows) => {
                res.status(200).send(rows);
            })
            .catch((err) => {
                console.log( err); // throw err
            });
        }
    })();
}

exports.insertPerm = (req, res, next) => {

    // check official exists in system
    knex.select().from('css_sc_dataspecialists').where('sc_dataspecialistid',req.body.dscontactid)
    .then((dsObj) => {
        if(dsObj.length > 0) { // exists
            // create permission
            knex('tbl_dspermissions')
            .where({eventid:req.body.eventid ,dscontactid:req.body.dscontactid })
            .then((rows) => {
                if(rows.length === 0) {
                    let dspermissionsid = uuidv4();
                    req.body.dspermissionsid = dspermissionsid;
                    knex('tbl_dspermissions')
                    .insert(req.body)
                    .then((result) => {
                        req.params.eventid = req.body.eventid;
                        return next();
                    })
                    .catch((err) => {
                        console.log( err); // throw err
                    });
                }
                else {
                    res.sendStatus(400);
                }
            })
            .catch((err) => {
                console.log( err); // throw err
            })
        }
        else {
            // doesn't exist so add locally
            var createddate = new Date();
            
            var insertObj = {
                sc_dataspecialistid:req.body.dscontactid,
                sc_fullname:req.body.dsname,
                createdon:createddate.toISOString(),
                modifiedon:createddate.toISOString()
            }

            knex('css_sc_dataspecialists')
            .insert(insertObj)
            .then((rows) => {
                // create permission
                knex('tbl_dspermissions')
                .where({eventid:req.body.eventid ,dscontactid:req.body.dscontactid })
                .then((rows) => {
                    if(rows.length === 0) {
                        let dspermissionsid = uuidv4();
                        req.body.dspermissionsid = dspermissionsid;
                        knex('tbl_dspermissions')
                        .insert(req.body)
                        .then((result) => {
                            req.params.eventid = req.body.eventid;
                            return next();
                        })
                        .catch((err) => {
                            console.log( err); // throw err
                        });
                    }
                    else {
                        res.sendStatus(400);
                    }
                })
                .catch((err) => {
                    console.log( err); // throw err
                })
            })
        }
    })
    
    
}

exports.deletePerm = (req, res, next) => {
    knex('tbl_dspermissions')
    .where({ dspermissionsid: req.params.dspermissionsid })
    .del()
    .then((rows) => {
        // deleted - let's send new select
        return next();
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.judgeAssignmentsByScnum = (req, res) => {
    const today = new Date();
    today.setHours(0,0,0,0); // set to start of day
    
    knex.select([
        'tbl_officialassignment.*',
        'tbl_categories.startdate as startdate',
        'tbl_categories.enddate as enddate',
        'tbl_categories.enname as group_enname',
        'tbl_categories.frname as group_frname',
        'css_sc_skatingcategorydefinition.sc_name as cat_enname',
        'css_sc_skatingcategorydefinition.sc_frenchname as cat_frname',
        'css_sc_skatingdisciplinedefinition.sc_name as dis_enname',
        'css_sc_skatingdisciplinedefinition.sc_frenchname as dis_frname',
        'tbl_segments.enname as seg_enname',
        'tbl_segments.frname as seg_frname',
        'tbl_events.enname as ev_enname',
        'tbl_events.frname as ev_frname',
        'css_sc_skatingofficialrole.sc_name as role_enname',
        'css_sc_skatingofficialrole.sc_frenchname as role_frname'
    ])
    .from('tbl_officialassignment')
    .leftJoin('css_sc_officials','css_sc_officials.sc_officialid','tbl_officialassignment.sc_officialid')
    .leftJoin('tbl_segments','tbl_segments.segmentid','tbl_officialassignment.segmentid')
    .leftJoin('tbl_categories','tbl_categories.categoryid','tbl_segments.categoryid')
    .leftJoin('css_sc_skatingcategorydefinition','tbl_categories.definitionid','css_sc_skatingcategorydefinition.sc_skatingcategorydefinitionid')
    .leftJoin('css_sc_skatingdisciplinedefinition','css_sc_skatingdisciplinedefinition.sc_skatingdisciplinedefinitionid','css_sc_skatingcategorydefinition.sc_skatingdisciplinedefinition')
    .leftJoin('tbl_events','tbl_events.eventid','tbl_categories.eventid')
    .leftJoin('css_sc_skatingofficialrole','css_sc_skatingofficialrole.sc_skatingofficialroleid','tbl_officialassignment.role')
    .where('css_sc_officials.sc_scnum', req.body.scnum)
    //.where('tbl_categories.startdate','>=',today.toISOString())
    .orderBy('tbl_categories.startdate','asc')
    .then((rows) => {
        if(rows.length > 0) {
            // sort languages in to language category
            rows.forEach((row, index, array) => {
                // build languages object
                row.languages = {
                                'en':{
                                    eventname:row.ev_enname,
                                    catname:row.cat_enname,
                                    segname:row.seg_enname,
                                    rolename:row.role_enname,
                                    groupname:row.group_enname,
                                    disname:row.dis_enname
                                },
                                'fr':{
                                    eventname:row.ev_frname,
                                    catname:row.cat_frname,
                                    segname:row.seg_frname,
                                    rolename:row.role_frname,
                                    groupname:row.group_frname,
                                    disname:row.dis_frname
                                }};
                
                // remove other language fields
                delete row.cat_enname;
                delete row.cat_frname;
                delete row.seg_enname;
                delete row.seg_frname;
                delete row.role_enname;
                delete row.role_frname;
                delete row.ev_enname;
                delete row.ev_frname;
                delete row.group_enname;
                delete row.group_frname;
                
                if(index === array.length-1) {

                    
                    //console.log("rows before dashboard laod",rows);
                    
                
                    // sorting based on columns
                    var temp = rows.sort(function (a, b) {
                        if(a['startdate'] != null && a['startdate'] != "" && a["languages"]["en"]["eventname"] != null && a["languages"]["en"]["eventname"] != "" && a["languages"]["en"]["catname"] != null && a["languages"]["en"]["catname"] != "" && a["languages"]["en"]["segname"] != null && a["languages"]["en"]["segname"] != "") return new Date(a.startdate) - new Date(b.startdate) || a["languages"]["en"]["eventname"].localeCompare(b["languages"]["en"]["eventname"]) || a["languages"]["en"]["catname"].localeCompare(b["languages"]["en"]["catname"]) || a["languages"]["en"]["segname"].localeCompare(b["languages"]["en"]["segname"])  || a.position - b.position;
                        else return -1;

                        });
                    
                    rows = temp;

                    res.status(200).send(rows);
                }
            });
        }
        else {
            res.status(200).send(rows);
        }
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.getRinksByEvent = (req, res) => {

    console.log("get rink by event request",req.body);

    knex('tbl_rink')
    .where({eventid: req.params.eventid})
    .then((rows) => {
        res.status(200).send(rows);
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.insertRink = (req, res, next) => {

    console.log("create live event",req.body);

    //create new uid
    req.body.rinkid = uuidv4();
    var createddate = new Date();
    req.body.createdon = createddate.toISOString();
    req.body.modifiedon = createddate.toISOString();

    if(req?.body?.videofeed == 1)
    {
        var values = date_time_format();

        // const output = 'output';
        // const output_name = `${output}-${values['date']}-${values['time']}`;

        // const locator = 'locator';
        // const locator_name = `${locator}-${values['date']}-${values['time']}`;

        // const asset = 'liveevent';
        // const asset_name = `${asset}-${md5(req.body.rinkid)}-${values['date']}-${values['time']}`;


        //console.log("output",output_name);
        //console.log("locator",locator_name);
        //console.log("asset",asset_name);



          media_functions.create_event(md5(req.body.rinkid))
            .then((res) => {
              console.log("done",res);

              if(res?.completed == true)
              {
                console.log("endpoints url",res?.output?.input?.endpoints)
                
                if(res?.output?.input?.endpoints.length>0)
                {
                    let previewEndpoint = res?.output?.input.endpoints[0].url;
                    console.log("The preview url is:");
                    console.log(previewEndpoint);

                    req.body.injest_url = previewEndpoint;


                    knex('tbl_rink')
                    .insert(req.body)
                    .then((eventObj) => {
                        req.params.eventid = req.body.eventid;
                        return next();
                    })
                    .catch((err) => {
                        console.log( err);// throw err
                    })
                  

                }

              }
              

            });
    }
    else
    {
        //set createdon date
        
        
        knex('tbl_rink')
        .insert(req.body)
        .then((eventObj) => {
            req.params.eventid = req.body.eventid;
            return next();
        })
        .catch((err) => {
            console.log( err); // throw err
        })
    }

   

    
    
}


function date_time_format()
{
    const now = new Date();

    // format date as YYYYMMDD
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // format time as HHMMSS
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeStr = `${hours}${minutes}${seconds}`;

    return {"date":dateStr,"time":timeStr};
}


exports.updateRink = (req, res, next) => {
    //set modified date
    var createddate = new Date();
    req.body.modifiedon = createddate.toISOString();

    knex('tbl_rink')
    .where({ rinkid:req.body.rinkid })
    .update(req.body)
    .then((eventObj) => {
        req.params.eventid = req.body.eventid;
        return next();
    })
    .catch((err) => {
        console.log( err); // throw err
    })
}

exports.startRink = (req, res, next) => {

    console.log("reqest coming in api",req.body);
    
    
    if(req.body.videofeed == 1)
    {

        var values = date_time_format();

        const asset = 'liveevent';
        const asset_name = `${asset}-${md5(req.body.rinkid)}-${values['date']}-${values['time']}`;

        const output = 'output';
        const output_name = `${output}-${values['date']}-${values['time']}`;

        const locator = 'locator';
        const locator_name = `${locator}-${values['date']}-${values['time']}`;

        console.log("output name is ",output_name);
        console.log("locator name is ",locator_name);
        console.log("asset name is ",asset_name);
        

        media_functions.create_asset(asset_name)
        .then((asset_res) => {
            console.log("assest creation",asset_res);

            if(asset_res?.completed == true)
            {
            console.log("yes");
            
            //update asset name in database

            
                media_functions.create_locator(asset_name,locator_name)
                .then((locator_res) => {
                console.log("done",locator_res);

                if(locator_res?.completed == true)
                {
                    
                    console.log("response coming",locator_res);

                    if(locator_res.hasOwnProperty('output'))
                    {
                        console.log("locator id is here",locator_res['output'].streamingLocatorId);
                        
                        var access_url = "https://cssvideosystem-cact.streaming.media.azure.net/" + locator_res['output'].streamingLocatorId  + "/vfrt.ism/manifest";

                        // save access url in database 
                        

                        media_functions.create_output(md5(req.body.rinkid),output_name,asset_name)
                        .then((ouput_res) => {
                            console.log("ouput creation done",ouput_res);
                
                            if(ouput_res?.completed == true)
                            {
                                media_functions.start_event(md5(req.body.rinkid))
                                .then((list_response) => {
                                    console.log("done",list_response);
                                    if(list_response?.completed == true)
                                    {
                
                                        console.log("live event started ---------------------");
                                        
                                        media_functions.start_streaming_endpoint()
                                        .then((endpoint_response) => {
                                            
                                            console.log("done",endpoint_response);
                
                                            if(endpoint_response?.completed == true)
                                            {
                
                                                var createddate = new Date();
                                                req.body.modifiedon = createddate.toISOString();
                                            
                                                knex('tbl_rink')
                                                .where({ rinkid:req.body.rinkid })
                                                .update({islive:1,modifiedon:req.body.modifiedon,locator_url:access_url,assets:asset_name})
                                                .then((rink) => {
                                                    if(rink ==1)
                                                    {
                                                        res.status(200).send({"completed":true,"ouptut":rink});
                                                    }
                                                    
                                                })
                                                .catch((err) => {
                                                    console.log( err); // throw err
                                                })
                
                                            }
                
                                        });
                
                                    
                
                                    }
                
                                });
                        
                            }
                            
                        });


                    }

                }

                });


            }

        });


       


        
       
    
    }
   
}


exports.stopRink = (req, res, next) => {

    console.log("reqest coming in api",req.body);
    
    if(req.body.videofeed == 1)
    {

        media_functions.stop_event(md5(req.body.rinkid))
        .then((list_response) => {
            console.log("done",list_response);
            if(list_response?.completed == true)
            {
                console.log("live event stopped ---------------------");
                
                var createddate = new Date();
                req.body.modifiedon = createddate.toISOString();
            
                knex('tbl_rink')
                .where({ rinkid:req.body.rinkid })
                .update({islive:0,modifiedon:req.body.modifiedon})
                .then((rink) => {
                    if(rink ==1)
                    {
                        res.status(200).send({"completed":true,"ouptut":rink});
                    }
                    
                })
                .catch((err) => {
                    console.log( err); // throw err
                })
                
                // media_functions.stop_streaming_endpoint()
                // .then((endpoint_response) => {
                    
                //     console.log("done",endpoint_response);

                  


                // });

                

            }

        });

        
    }

    

}


exports.deleteRink = (req, res, next) => {

    media_functions.events_list()
    .then((list_response) => {
      console.log("done",list_response);
      if(list_response?.completed == true)
      {

        var list_event = [];
        list_response['output'].forEach((element) => {
            list_event.push(element?.name)
            

          });

         // for await (const each of data) {
        //     console.log("assasas",each)
        //     all_events.push(each.name);

        // }

        console.log("asd",list_event);

        console.log("endpoints url",list_response?.output);
        console.log(md5(req.params.rinkid));
        
        if(list_event.includes(md5(req.params.rinkid)))
        {
            console.log("yes");

            media_functions.delete_event(md5(req.params.rinkid))
            .then((delete_response) => {
                console.log("done 2 ",delete_response);

                if(delete_response?.completed == true)
                {
                    console.log("event deleted")

                    knex('tbl_rink')
                    .where({ rinkid: req.params.rinkid })
                    .del()
                    .then((rows) => {
                        // deleted - let's send new select
                        return next();
                    })
                    .catch((err) => {
                        console.log( err); // throw err
                    });

                }

            });

        }
        else
        {
            console.log("no");

            knex('tbl_rink')
            .where({ rinkid: req.params.rinkid })
            .del()
            .then((rows) => {
                // deleted - let's send new select
                return next();
            })
            .catch((err) => {
                console.log( err); // throw err
            });

        }
        
      }

    })

}

exports.getRinkById = (req, res) => {
    knex('tbl_rink')
    .where({ rinkid: req.params.rinkid })
    .then((rows) => {
        res.status(200).send(rows);
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.toggleEventInprogress = (req, res) => {
    var eventid = req.body.eventid;
    var inprogress = req.body.inprogress;
    if(inprogress == 1) {
        // if we are switching this on then need to check status of event before activation
        checkEventStatus(eventid)
        .then((response) => {
            // if response is true then set event active
            if(response.pass == 'true') {
                knex('tbl_events')
                .where({ eventid:eventid })
                .update({inprogress:inprogress})
                .then((rows) => {
                    res.status(200).send({response:'ok'});
                })
                .catch((err) => {
                    console.log( err); // throw err
                })
            }
            else {
                res.status(200).send({response:'fail'});
            }
        })
        .catch((err) => {
            console.log( err); // throw err
        })
    }
    else {
        // if switching off then just switch it off
        knex('tbl_events')
        .where({ eventid:eventid })
        .update({inprogress:inprogress})
        .then((rows) => {
            // if inprogress=0 then set all skaters off ice
            knex('tbl_competitorentry')
            .update('onice',0)
            .whereIn(
                'competitorentryid', function() {
                    this.select('competitorentryid')
                    .from('tbl_competitorentry')
                    .leftJoin('tbl_segments','tbl_segments.segmentid','tbl_competitorentry.segmentid')
                    .leftJoin('tbl_categories','tbl_categories.categoryid','tbl_segments.categoryid')
                    .where('tbl_categories.eventid',eventid);
                }
            )
            .then(() => {
                res.status(200).send({response:'ok'});
            })
        })
        .catch((err) => {
            console.log( err); // throw err
        })
    }
}


/*
CHECK IF EVENT IS READY TO RUN
*/
function checkEventStatus(eventid) {
    
    return new Promise(function(resolve,reject) {
        
        // subquery to get segment skater count
        var segmentid = knex.ref('tbl_segments.segmentid');
        var skaterCountQuery = knex.raw(
            `(select count(competitorentryid) 
            from tbl_competitorentry 
            where segmentid = ?) as skatercount`,[segmentid]);

        var officialCountQuery = knex.raw(
            `(select count(officialassignmentid) 
            from tbl_officialassignment 
            where segmentid = ?) as officialcount`,[segmentid]);
        
        // check event has segment with skaters and officials
        knex.select([
            'tbl_segments.segmentid',
            skaterCountQuery,
            officialCountQuery
        ])
        .from('tbl_segments')
        .leftJoin('tbl_categories','tbl_categories.categoryid','tbl_segments.categoryid')
        .where('tbl_categories.eventid', eventid)
        .then((rows) => {
            var respObj = {pass:'true'};
            
            // check each row, and check values > 0
            if(rows.length > 0) {
                rows.forEach((element, index, array) => {
                    if(element.skatercount == 0) respObj = {pass:'false'};
                    if(element.officialcount == 0) respObj = {pass:'false'};
                    if(index === rows.length-1) resolve(respObj);
                })
            }
            else {
                // fail it
                respObj = {pass:'false'};
                resolve(respObj);
            }
            
        })
        .catch((err) => {
            console.log( err); // throw err
        })
    })
}

