const got = require('got');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
var json5 = require('json5');

//const localdbpath = path.join(__dirname, '../db/css21.sqlite3'); // for local checks

const userlocation = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
const CSSAppDir = userlocation+'/CSS Application/db';

/*
// if folder doesn't exist then make it
if (!fs.existsSync(CSSAppDir)){
    fs.mkdirSync(CSSAppDir, { recursive: true });
}
*/

const localdbpath = path.join(CSSAppDir, '../db/css21.sqlite3'); // for local checks

//console.log(localdbpath);
const knexconfig = require('../../knexfile',__dirname);
const knex = require('knex')(knexconfig.development);

const apiUrl = process.env.CLOUD_API_URL
const apiCloudSecret = process.env.CLOUD_API_SECRET

exports.checkDb = (req, res) => {
    // check db file exists and can log in
    try {
        if (fs.existsSync(localdbpath)) {
            // file exists
            if(req === "localCheck") {
                return true;
            }
            else {
                res.status(200).send({'result':'true','error':'none'});
            }
        }
        else {
            if(req === "localCheck") {
                return false;
            }
            else {
                res.status(200).send({'result':'false','error':'File not found'});
            }
        }
    }
    catch(err) {
        console.log(err);
    }
}

exports.rebuildDb = (req, res) => {
    // delete existing file
    var hasErr = '';
    if(fs.existsSync(localdbpath)) {
        // it exists, let's back it up
        var ts = Math.round((new Date()).getTime() / 1000);

        fs.copyFile(localdbpath, `${localdbpath}_backup${ts}`, (err) => {
            if (err) {
                console.log("Error Found:", err);
            }
            else {
                // we only want to rebuild system data tables
                // get data tables
                knex.raw(`SELECT name FROM sqlite_master WHERE type='table';`)
                .then((rows) => {
                    // we only want to run this on css_sc_ tables...
                    for(row of rows) {
                        let table = row.name;
                        if(table.startsWith("css_sc_")) {
                            // empty them
                            knex(table).del()
                            .then((result) => {
                                hasErr = '';
                            })
                            .catch((err) => {
                                hasErr = err;
                            });
                        }
                    }
                })
            }
        }); 
    }
    else { // doens't exist yet so create new
        // use knex migrate function to rebuild db
        //console.log('here');
        // if folder doesn't exist then make it
        if (!fs.existsSync(CSSAppDir)){
            fs.mkdirSync(CSSAppDir, { recursive: true });
        }
        knex.migrate.latest()
        .then(() =>  {
            // migrations are finished
            // structure now exists, on we go!
            hasErr = '';
        })
        .catch((err) => {
            hasErr = err;
        });
    }
    //console.log(`hasErr=${hasErr}`);
    if(hasErr == '') {
        if(req === "localCheck") {
            return true;
        }
        else {
            res.status(200).send(JSON.stringify({'result':'true','error':'none'}));
        }
        
    }
    else {
        if(req === "localCheck") {
            return false;
        }
        else {
            res.status(200).send(JSON.stringify({'result':'true','error':err}));
        }
    }
    
}

exports.checkDbVersion = (req, res) => {
    getApiDbVersions()
    .then((vars) => {
        let varsObj = JSON.parse(vars);
        var prodApiVersion = varsObj.prodVersion;

        knex('tbl_version')
        .limit(1)
        .orderBy('version','desc')
        .then((data) => {
            let thisVersion = data[0].version;
            
            if(thisVersion == prodApiVersion) {
                res.status(200).send(JSON.stringify({'result':'true','error':'none'}));
            }
            else {
                res.status(200).send(JSON.stringify({'result':'false','error':'none'}));
            }
        })
    })

}

exports.updateDefinitions = (req, res) => {
    const tokenObj = req.body;
    // do for each table you are updating
    //console.log(tokenObj);
    fetchData(tokenObj)
    .then(function(response) {
        //console.log(response);
        let versionid = uuidv4();
        
        // update version
        getApiDbVersions()
        .then((vars) => {
            let varsObj = JSON.parse(vars);
            knex('tbl_version')
            .insert({id:versionid,version:varsObj.prodVersion})
            .then(() => {
                res.status(200).send(JSON.stringify({'result':'true','error':'none'}));
            })
            .catch((err) => {
                console.log( err); // throw err
            });
        })
    })
    .catch((err) => {
        res.status(200).send(JSON.stringify({'result':'false','error':err}));
    })
}

exports.scoringToTest = (req, res) => {
    (async () => {
        try {
            const {body} = await got(`${apiUrl}/api/scoringtotest`, {
                headers : { "Authorization" : `Raw ${apiCloudSecret}` }
            });
            res.status(200).send(body);
        }
        catch (error) { // api will send 400 response
            //console.log(error.response);
            res.status(400).send(error.response.body);
        }
        
    })();
}

exports.testToProduction = (req, res) => {
    (async () => {
        try {
            const {body} = await got(`${apiUrl}/api/testtoproduction`, {
                headers : { "Authorization" : `Raw ${apiCloudSecret}` }
            });
            res.status(200).send(body);
        }
        catch (error) { // api will send 400 response
            //console.log(error.response);
            res.status(400).send(error.response.body);
        }
        
    })();
}

async function fetchData(tokenObj) {
    return data = await new Promise((resolve,reject) => {
        // use this nasty query to get table names...
        knex.raw(`SELECT name FROM sqlite_master WHERE type='table';`)
        .then((rows) => {
            // we only want to run this on css_sc_ tables...
            for(row of rows) {
                let table = row.name;
                if(table.startsWith("css_sc_") && (table !== 'css_sc_competitors' && table !== 'css_sc_dataspecialists' && table !== 'css_sc_officials')) { // exclude css_sc_competitors, css_sc_dataspecialists, css_sc_officials
                    // get columns for each table
                    knex(table).columnInfo()
                    .then((columns) => {
                        let columnsArr = Object.entries(columns);
                        let colStr = '';
                        for(col of columnsArr) {
                            if(col[0].startsWith("sc_") || col[0] === 'statecode') {
                                colStr+=`${col[0]},`;
                            }
                        }
                        colStr = colStr.slice(0,-1); // strips final comma
                        // send cols in order to api to get data
                        getCSSData(table,colStr,tokenObj)
                        .then((data) => {
                            //console.log(table);
                            if(data.error) { // error from the server
                                reject(data.error);
                            }
                            else {
                                // now we have the data!!
                                if(JSON.stringify(data).length > 2) { // this means there are values returned from server
                                    // delete current content
                                    knex(table).del()
                                    .then(() => {
                                        // build insert string
                                        const chunkSize = 500;
                                        knex.transaction(function(tr) {
                                            return knex.batchInsert(table, data, chunkSize)
                                            .transacting(tr)
                                            })
                                        .then(function(result) {
                                            console.log(result);
                                        })
                                        .catch(function(error) {
                                            console.log(error);
                                        });
                                    });
                                }
                                else { // no data returned from server, so just clear local table
                                    knex(table).del()
                                    .then((result) => {
                                        //console.log(table+'-'+result);
                                    });
                                }
                            }
                        })
                        .catch((error) => {
                            reject(error);
                        });
                    });
                }
            }
            resolve('done');
        });
    });
}

async function getCSSData(tablename,columns,tokenObj) {
    const {body} = await got.post(`${apiUrl}/fetchData/${tablename}/{${columns}}`, {
        responseType: 'json',
        headers : { "Authorization" : "Bearer " + tokenObj.accessToken }
    });
    return body;
}

async function getApiDbVersions() {
    const {body} = await got(`${apiUrl}/api/envvars`, {
        headers : { "Authorization" : `Raw ${apiCloudSecret}` }
    });
    return body;
}

exports.getInitializationObject = (req, res) => {
    
    var initializationObj = {};
    var compObj = {};
    var segObj = {};

    // file if room file has data ? 
    var room_data_avialable = false;

    if(fs.existsSync('./rooms/'+req.segmentid+'.txt'))
    {  
        if (fs.readFileSync('./rooms/'+req.segmentid+'.txt').length > 0) {       
            room_data_avialable = true;
        } 
    }

    if(room_data_avialable == false)
    {
        console.log("2222222 File hase no data ????????????????",room_data_avialable)

        return new Promise(function(resolve,reject) {
            // also get segmentObj
            knex.select(
                'tbl_segments.segmentid',
                'tbl_segments.categoryid',
                'tbl_segments.definitionid',
                'tbl_segments.enname',
                'tbl_segments.frname',
                'tbl_segments.status',
                'tbl_segments.performanceorder',
                'tbl_segments.warmupnumber',
                'tbl_segments.warmupgroupmaxsize',
                'tbl_segments.wellbalanced',
                'tbl_segments.reviewtime',
                'tbl_segments.totalsegmentfactor',
                'tbl_segments.patterndanceid',
                'tbl_segments.rinkid',
                'tbl_segments.createdon',
                'tbl_segments.modifiedon'
            )
            .from('tbl_segments')
            .where('tbl_segments.segmentid',req.segmentid)
            .then((seg) => {
                segObj = seg[0];
                // get category
                getCategoryInfo(seg[0].categoryid).then((res) => {
                    segObj.categoryid = res;
                    // get element defs
                    return getElementDefinitionsInfo(seg[0].definitionid);
                })
                .then((res) => {
                    segObj.definitionid = res;
                    // get pattern dance info
                    return getPatternDanceInfo(seg[0].patterndanceid);
                })
                .then((res) => {
                    segObj.patterndanceid = res;
                    // get officials
                    return getOfficialsInfo(seg[0].segmentid);
                })    
                .then((res) =>{
                    segObj.official = res;

                    return getCompetitorInfo(seg[0].segmentid);

                })  
                .then((res) =>{
                    segObj.competitors = res;

                    return getRinkInfo(seg[0].rinkid);

                })      
                .then((res) => {
                    
                    if(res.length>0)
                    {
                        segObj.rinkid= res[0];

                    }
                    console.log("----------------this is response from rink -------------")
                    initializationObj.segmentid = segObj;

                     // write JSON string to a file
                     fs.writeFile('./rooms/'+req.segmentid+'.txt', JSON.stringify(initializationObj), (err) => {
                        if (err) {
                            // throw err;
                        }
                        //console.log("3333333333333333 JSON data is saved.");
                        resolve(initializationObj);
                    });

                    
                })
            })
        });


    }
    else
    {

        return new Promise(function(resolve,reject) {
            //console.log("2222222 File hase data ????????????????",room_data_avialable)

            let rawdata = fs.readFileSync('./rooms/'+req.segmentid+'.txt');
            
            try {

                //console.log("asas",rawdata);
                
                //var jsonData = jsonlint.parse(rawdata)
                var jsonData = json5.parse(rawdata);

                console.log("------------------------------------------------------------------")
                console.log(jsonData);

                resolve(jsonData);

            } catch (e) {

                console.log("Server is going to crash here - During intialization object", e.message);
                // Handle the error here
            }

            //resolve(JSON.parse(rawdata));
            
        });

       
    }


   
}

async function getUsers(req) {
        
    await  knex.select(
        'css_sc_competitors.sc_competitorid',
        'css_sc_competitors.sc_scnum',
        'css_sc_competitors.sc_status',
        'css_sc_competitors.sc_name',
        'css_sc_competitors.sc_competitortype',
        'css_sc_competitors.sc_club',
        'css_sc_competitors.sc_region',
        'css_sc_competitors.sc_section',
        'css_sc_competitors.sc_biography',
        'css_sc_competitors.sc_account',
        'css_sc_competitors.sc_facebook',
        'css_sc_competitors.sc_instagram',
        'css_sc_competitors.sc_twitter',
        'css_sc_competitors.sc_synchrocategory',
        'css_sc_competitors.sc_trainingsite',
        'css_sc_competitors.sc_competitorteam',
        'css_sc_competitors.createdon',
        'css_sc_competitors.modifiedon'
    )
    .from('tbl_competitorentry')
    .leftJoin('css_sc_competitors','css_sc_competitors.sc_competitorid','tbl_competitorentry.sc_competitorid')
    .where('tbl_competitorentry.competitorentryid',req.competitorentryid);
}

var getRinkInfo = exports.getRinkInfo = (rinkid) => {
    return new Promise(function(resolve,reject) {
        knex('tbl_rink')
        .where('rinkid',rinkid)
        .then((rows) => {

            console.log("should come here for gettign response");
            resolve(rows);
        })
    })
}

var getSkaterObject = exports.getSkaterObject = (req, res) => {

    console.log("request foe getting skater object",req)

   
    
        return new Promise(function(resolve,reject) {

            knex.select(
                'css_sc_competitors.sc_competitorid',
                'css_sc_competitors.sc_scnum',
                'css_sc_competitors.sc_status',
                'css_sc_competitors.sc_name',
                'css_sc_competitors.sc_competitortype',
                'css_sc_competitors.sc_club',
                'css_sc_competitors.sc_region',
                'css_sc_competitors.sc_section',
                'css_sc_competitors.sc_biography',
                'css_sc_competitors.sc_account',
                'css_sc_competitors.sc_facebook',
                'css_sc_competitors.sc_instagram',
                'css_sc_competitors.sc_twitter',
                'css_sc_competitors.sc_synchrocategory',
                'css_sc_competitors.sc_trainingsite',
                'css_sc_competitors.sc_competitorteam',
                'css_sc_competitors.createdon',
                'css_sc_competitors.modifiedon'
            )
            .from('tbl_competitorentry')
            .leftJoin('css_sc_competitors','css_sc_competitors.sc_competitorid','tbl_competitorentry.sc_competitorid')
            .where('tbl_competitorentry.competitorentryid',req.competitorentryid)
            .then((comp) => {
                console.log("&&&&&&&&&&&&& in admin function")
                resolve(comp[0]);
        })
    })
}

function getCategoryInfo(categoryid) {
    var catObj = {};
    return new Promise(function(resolve,reject) {
        knex.select(
            'tbl_categories.categoryid',
            'tbl_categories.eventid',
            'tbl_categories.enname',
            'tbl_categories.frname',
            'tbl_categories.definitionid',
            'tbl_categories.sortorder',
            'tbl_categories.status',
            'tbl_categories.hasreadysegments',
            'tbl_categories.hascompetitors',
            'tbl_categories.hasofficials',
            'tbl_categories.startdate',
            'tbl_categories.enddate',
            'tbl_categories.createdon',
            'tbl_categories.modifiedon'
        )
        .from('tbl_categories')
        .where('tbl_categories.categoryid',categoryid)
        .then((rows) => {
            catObj = rows[0];
            // get event
            return getEventInfo(rows[0].eventid);
        })
        .then((res) => {
            catObj.eventid = res;
            var catid = catObj.definitionid;
            // get definition
            return getDefinitionInfo(catid);
        })
        .then((res) => {
            catObj.definitionid = res;
            resolve(catObj);
        })
        
    })
}

function getPatternDanceInfo(patterndanceid) {
    return new Promise(function(resolve,reject) {
        if(patterndanceid) {
            knex.select(
                'css_sc_skatingpatterndancedefinition.sc_skatingpatterndancedefinitionid',
                'css_sc_skatingpatterndancedefinition.sc_name',
                'css_sc_skatingpatterndancedefinition.sc_frenchname',
                'css_sc_skatingpatterndancedefinition.sc_elementcodeprefix'
            )
            .from('css_sc_skatingpatterndancedefinition')
            .where('css_sc_skatingpatterndancedefinition.sc_skatingpatterndancedefinitionid',patterndanceid)
            .then((rows) => {
                resolve(rows[0]);
            })
        }
        else {
            resolve({});
        }
    })
}

function getOfficialsInfo(segmentid) {
    return new Promise(function(resolve,reject) {
        knex.select(
            'tbl_officialassignment.officialassignmentid',
            'tbl_officialassignment.segmentid',
            'tbl_officialassignment.sc_officialid',
            'tbl_officialassignment.role',
            'tbl_officialassignment.position',
            'tbl_officialassignment.includescore',
            'tbl_officialassignment.createdon',
            'tbl_officialassignment.modifiedon'
        )
        .from('tbl_officialassignment')
        .where('tbl_officialassignment.segmentid',segmentid)
        .then((rows) => {
            var offObj = {};
            // for each official get their details
            rows.forEach((item, index, array) => {
                knex.select(
                    'css_sc_officials.sc_officialid',
                    'css_sc_officials.sc_scnum',
                    'css_sc_officials.sc_fullname',
                    'css_sc_officials.sc_firstname',
                    'css_sc_officials.sc_middlename',
                    'css_sc_officials.sc_lastname',
                    'css_sc_officials.sc_email',
                    'css_sc_officials.sc_homeorg',
                    'css_sc_officials.sc_section',
                    'css_sc_officials.sc_registereduntil',
                    'css_sc_officials.createdon',
                    'css_sc_officials.modifiedon'
                )
                .from('css_sc_officials')
                .where('css_sc_officials.sc_officialid',item.sc_officialid)
                .then((off) => {
                    item.sc_officialid = off[0];
                    if(index === rows.length-1) {
                        resolve(rows);
                    }
                })
            })
        })
    })
}

function getCompetitorInfo(segmentid) {
    return new Promise(function(resolve,reject) {

        knex('tbl_competitorentry')
        .where('segmentid', segmentid)
        .orderBy('sortorder','ASC')
        .then((competitors_entry_res) => {
            
            console.log("competitor data length",competitors_entry_res.length);

            competitors_entry_res.forEach((item, index, array) => {

                knex('css_sc_competitors')
                .where('sc_competitorid', item.sc_competitorid)
                .then((skater_data) => {
                    
                    console.log("skater data length",skater_data.length);

                    item.sc_competitorid = skater_data[0];
                    if(index === competitors_entry_res.length-1) {
                        resolve(competitors_entry_res);
                    }
                    
                })
            });
            
        })
    })
}

function getEventInfo(eventid) {
    return new Promise(function(resolve,reject) {
        knex.select(
            'tbl_events.eventid',
            'tbl_events.sc_skatingeventclassid',
            'tbl_events.isoffline',
            'tbl_events.enname',
            'tbl_events.frname',
            'tbl_events.location',
            'tbl_events.inprogress',
            'tbl_events.createdon',
            'tbl_events.modifiedon'
        )
        .from('tbl_events')
        .where('tbl_events.eventid',eventid)
        .then((rows) => {

            rows.forEach((item, index, array) => {
                

                knex('tbl_dspermissions')
                .where('eventid', item.eventid)
                .then((output) => {
                    item.dspermissions = output;
                    if(index === rows.length-1) {
                        resolve(rows[0]);
                    }  

                })
                .catch((err) => {
                    console.log("error coming",err);
                });


            })

            // resolve(rows[0]);
        })
    })
}

function getDefinitionInfo(catdefinitionid) {
    return new Promise(function(resolve,reject) {
        defObj = {};
        parentObj = {};
        knex.select(
            'css_sc_skatingcategorydefinition.sc_skatingcategorydefinitionid',
            'css_sc_skatingcategorydefinition.sc_scoringmethod',
            'css_sc_skatingcategorydefinition.sc_skatingdisciplinedefinition',
            'css_sc_skatingcategorydefinition.sc_parentprogram',
            'css_sc_skatingcategorydefinition.sc_skatingdisciplinedefinitionname',
            'css_sc_skatingcategorydefinition.sc_name',
            'css_sc_skatingcategorydefinition.sc_frenchname',
            'css_sc_skatingcategorydefinition.sc_parentprogramname'
        )
        .from('css_sc_skatingcategorydefinition')
        .where('css_sc_skatingcategorydefinition.sc_skatingcategorydefinitionid',catdefinitionid)
        .then((rows) => {
            defObj = rows[0];
            defid = rows[0].sc_skatingdisciplinedefinition
            // get parent program
            return getParentInfo(rows[0].sc_parentprogram);
        })
        .then((res) => {
            parentObj = res[0];
            //console.log('skatdefid',defObj.sc_skatingdisciplinedefinition);
            //var defid = defObj.sc_skatingdisciplinedefinition;
            // get discipline definition
            return getDisciplineDefinition(defid);
        })
        .then((res2) => {
            //console.log('skate',res2)
            defObj.sc_skatingdisciplinedefinition = res2;
            defObj.sc_parentprogram = parentObj;
            //console.log(defObj)
            resolve(defObj);
        })
    })
}

function getParentInfo(parentid) {
    return new Promise(function(resolve,reject) {
        knex.select(
            'css_sc_programs.sc_programsid',
            'css_sc_programs.sc_program_key',
            'css_sc_programs.sc_programname',
            'css_sc_programs.sc_description_fr',
            'css_sc_programs.sc_description',
            'css_sc_programs.sc_programname_fr'
        )
        .from('css_sc_programs')
        .where('css_sc_programs.sc_programsid',parentid)
        .then((rows) => {
            resolve(rows);
        })
    })
}

function getDisciplineDefinition(defid) {
    return new Promise(function(resolve,reject) {
        discDefObj = {};
        
        knex.select(
            'css_sc_skatingdisciplinedefinition.sc_skatingdisciplinedefinitionid',
            'css_sc_skatingdisciplinedefinition.sc_name',
            'css_sc_skatingdisciplinedefinition.sc_frenchname'
        )
        .from('css_sc_skatingdisciplinedefinition')
        .where('css_sc_skatingdisciplinedefinition.sc_skatingdisciplinedefinitionid',defid)
        .then((rows) => {
            discDefObj = rows[0];
            // get notes
            return getDiscDefNotes(rows[0].sc_skatingdisciplinedefinitionid);
        })
        .then((res) => {
            //console.log('notes',res);
            discDefObj.notes = res;
            resolve(discDefObj);
        })
    })
}

function getDiscDefNotes(skatingdisciplinedefinitionid) {
    return new Promise(function(resolve,reject) {
        knex.select(
            'css_sc_skatingelementnote_sc_skatingdiscipl.sc_skatingelementnote_sc_skatingdisciplid',
            'css_sc_skatingelementnote_sc_skatingdiscipl.sc_skatingelementnoteid',
            'css_sc_skatingelementnote_sc_skatingdiscipl.sc_skatingdisciplinedefinitionid'
        )
        .from('css_sc_skatingelementnote_sc_skatingdiscipl')
        .where('css_sc_skatingelementnote_sc_skatingdiscipl.sc_skatingdisciplinedefinitionid',skatingdisciplinedefinitionid)
        .then((rows) => {
            if(rows.length > 0) {
                rows.forEach((item, index, array) => {
                    knex.select(
                        'css_sc_skatingelementnote.sc_skatingelementnoteid',
                        'css_sc_skatingelementnote.sc_name',
                        'css_sc_skatingelementnote.sc_namefr',
                        'css_sc_skatingelementnote.sc_value',
                        'css_sc_skatingelementnote.sc_enteredby'
                    )
                    .from('css_sc_skatingelementnote')
                    .where('css_sc_skatingelementnote.sc_skatingelementnoteid',item.sc_skatingelementnoteid)
                    .then((row) => {
                        item.sc_skatingelementnoteid = row[0];
                        if(index === rows.length-1) {
                            resolve(rows);
                        }
                    })
                })
            }
            else {
                resolve([]);
            }
        })
    })
}

function getElementDefinitionsInfo(defid) {
    return new Promise(function(resolve,reject) {
        var elDefObj = {};
        knex.select(
            'css_sc_skatingsegmentdefinitions.sc_skatingsegmentdefinitionsid',
            'css_sc_skatingsegmentdefinitions.sc_elementconfiguration',
            'css_sc_skatingsegmentdefinitions.sc_parentcategory',
            'css_sc_skatingsegmentdefinitions.sc_totalsegmentfactor',
            'css_sc_skatingsegmentdefinitions.sc_elementconfigurationname',
            'css_sc_skatingsegmentdefinitions.sc_parentcategoryname',
            'css_sc_skatingsegmentdefinitions.sc_name',
            'css_sc_skatingsegmentdefinitions.sc_frenchname',
            'css_sc_skatingsegmentdefinitions.sc_order',
            'css_sc_skatingsegmentdefinitions.sc_reviewtime',
            'css_sc_skatingsegmentdefinitions.sc_programtime',
            'css_sc_skatingsegmentdefinitions.sc_warmuptime',
            'css_sc_skatingsegmentdefinitions.sc_programhalftime',
            'css_sc_skatingsegmentdefinitions.sc_warmupgroupmaximumsize'
        )
        .from('css_sc_skatingsegmentdefinitions')
        .where('css_sc_skatingsegmentdefinitions.sc_skatingsegmentdefinitionsid',defid)
        .then((rows) => {
            elDefObj = rows[0];
            return getElementConfig(rows[0].sc_elementconfiguration);
        })
        .then((res) => {
            //console.log(res)
            elDefObj.sc_elementconfiguration = res;
            return getProgramComponents(defid);
        })
        .then((res) => {
            elDefObj.programcomponents = res;
            return getBonusDeductions(defid);
        })
        .then((res) => {
            elDefObj.bonuses_deduction = res;
            return getWBP(defid);
        })
        .then((res) => {
            elDefObj.well_balanced = res;
            resolve(elDefObj);
        })
    })
}

function getProgramComponents(defid) {
    return new Promise(function(resolve,reject) {
        knex.select(
            'css_sc_skatingprogramcomponentdefinition.sc_skatingprogramcomponentdefinitionid',
            'css_sc_skatingprogramcomponentdefinition.sc_pctype',
            'css_sc_skatingprogramcomponentdefinition.sc_parentsegment',
            'css_sc_skatingprogramcomponentdefinition.sc_name',
            'css_sc_skatingprogramcomponentdefinition.sc_pointvalue',
            'css_sc_skatingprogramcomponentdefinition.statecode'
        )
        .from('css_sc_skatingprogramcomponentdefinition')
        .where('css_sc_skatingprogramcomponentdefinition.sc_parentsegment',defid)
        .andWhere('css_sc_skatingprogramcomponentdefinition.statecode',0)
        .then((rows) => {
            if(rows.length > 0) {
                rows.forEach((item, index, array) => {
                    knex.select(
                        'css_sc_skatingprogramcomponenttype.sc_skatingprogramcomponenttypeid',
                        'css_sc_skatingprogramcomponenttype.sc_name',
                        'css_sc_skatingprogramcomponenttype.sc_frenchname',
                        'css_sc_skatingprogramcomponenttype.sc_order',
                    )
                    .from('css_sc_skatingprogramcomponenttype')
                    .where('css_sc_skatingprogramcomponenttype.sc_skatingprogramcomponenttypeid',item.sc_pctype)
                    .then((row) => {
                        item.sc_pctype = row[0];

                        if(index === rows.length-1) {

                           // sorting response based on sc_order in program component table


                        //    rows.sort(function(a, b) {
                        //     let orderA = a["sc_pctype"]["sc_order"];
                        //     let orderB = b["sc_pctype"]["sc_order"];

                        //     if (orderA === '' || orderA === null) {
                        //       return 1;
                        //     }
                        //     if (orderB === '' || orderB === null) {
                        //       return -1;
                        //     }
                        //     return orderA - orderB;
                        //   });


                            // var temp = rows.sort(function(a, b) {
                            //     return (a["sc_pctype"]["sc_order"]===null)-(b["sc_pctype"]["sc_order"]===null) || +(a["sc_pctype"]["sc_order"]>b["sc_pctype"]["sc_order"])||-(a["sc_pctype"]["sc_order"]<b["sc_pctype"]["sc_order"]);
                            // });

                            console.log("************************************* In program components",rows);
                            
                            // rows = temp;

                            resolve(rows);
                        }
                    })
                })
            }
            else {
                resolve([]);
            }
        })
        
    })
}

function getBonusDeductions(defid) {
    return new Promise(function(resolve,reject) {
        knex.select(
            'css_sc_skatingadjustmentassociation.sc_skatingadjustmentassociationid',
            'css_sc_skatingadjustmentassociation.sc_segmentdefinition',
            'css_sc_skatingadjustmentassociation.sc_adjustmentdefinition',
            'css_sc_skatingadjustmentassociation.sc_maximumapplications',
            'css_sc_skatingadjustmentassociation.sc_name',
            'css_sc_skatingadjustmentassociation.sc_pointvalue',
            'css_sc_skatingadjustmentassociation.sc_segmentdefinitionname',
            'css_sc_skatingadjustmentassociation.sc_adjustmentdefinitionname',
            'css_sc_skatingadjustmentassociation.sc_order'
        )
        .from('css_sc_skatingadjustmentassociation')
        .where('css_sc_skatingadjustmentassociation.sc_segmentdefinition',defid)
        .then((rows) => {
            if(rows.length > 0) {
                rows.forEach((item, index, array) => {
                    knex.select(
                        'css_sc_skatingadjustmentdefinition.sc_skatingadjustmentdefinitionid',
                        'css_sc_skatingadjustmentdefinition.sc_group',
                        'css_sc_skatingadjustmentdefinition.sc_type',
                        'css_sc_skatingadjustmentdefinition.sc_name',
                        'css_sc_skatingadjustmentdefinition.sc_frenchname',
                        'css_sc_skatingadjustmentdefinition.statecode'

                    )
                    .from('css_sc_skatingadjustmentdefinition')
                    .where('css_sc_skatingadjustmentdefinition.sc_skatingadjustmentdefinitionid',item.sc_adjustmentdefinition)
                    .andWhere('css_sc_skatingadjustmentdefinition.statecode',0)
                    .then((row) => {
                        item.sc_adjustmentdefinition = row[0];
                        if(index === rows.length-1) {
                            resolve(rows);
                        }
                    })
                })
            }
            else {
                resolve([]);
            }
        })
        
    })
}

function getWBP(defid) {

    var data = [];

    return new Promise(function(resolve,reject) {
        /* CODE HERE WHEN WELL BALANCES PROGRAM AVAILABLE */
        knex('css_sc_skatingprogramvalidation')
        .where('sc_skatingsegmentdefinitions', defid)
        .andWhere('statecode',0)
        .orderBy('sc_order','ASC')
        .then((res) => {
            
            data = res;
            
        })
        .then(() => {
            
            // for adding info related "css_sc_wbp_elementdefinitionsa"

            data.forEach((item, index, array) => {

                knex('css_sc_wbp_elementdefinitionsa')
                .where('sc_skatingprogramvalidationid', item.sc_skatingprogramvalidationid)
                .then((res_wbp_elementdefinitionsa) => {
    
                    item["sc_wbp_elementdefinitionsaid"] = res_wbp_elementdefinitionsa;
                })
                    
            })

        })
        .then(() => {
            
            // for adding info related "css_sc_wbp_elementdefinitionsb"

            data.forEach((item, index, array) => {

                knex('css_sc_wbp_elementdefinitionsb')
                .where('sc_skatingprogramvalidationid', item.sc_skatingprogramvalidationid)
                .then((res_wbp_elementdefinitionsb) => {
    
                    item["sc_wbp_elementdefinitionsbid"] = res_wbp_elementdefinitionsb;
                })
                    
            })

        })
        .then(() => {
            
            // for adding info related "css_sc_wbp_elementdefinitionsc"

            data.forEach((item, index, array) => {

                knex('css_sc_wbp_elementdefinitionsc')
                .where('sc_skatingprogramvalidationid', item.sc_skatingprogramvalidationid)
                .then((res_wbp_elementdefinitionsc) => {
    
                    item["sc_wbp_elementdefinitionscid"] = res_wbp_elementdefinitionsc;
                })
                    
            })

        })
        .then(() => {
            
            // for adding info related "css_sc_wbp_elementdefinitionsc"

            data.forEach((item, index, array) => {

                knex('css_sc_wbp_elementdefinitionsd')
                .where('sc_skatingprogramvalidationid', item.sc_skatingprogramvalidationid)
                .then((res_wbp_elementdefinitionsd) => {
    
                    item["sc_wbp_elementdefinitionsdid"] = res_wbp_elementdefinitionsd;
                })
                    
            })

        })
        .then(() => {
            
            // for adding info related "css_sc_wbp_skatingelementfamiliesa"

            data.forEach((item, index, array) => {

                knex('css_sc_wbp_skatingelementfamiliesa')
                .where('sc_skatingprogramvalidationid', item.sc_skatingprogramvalidationid)
                .then((res_wbp_skatingelementfamiliesa) => {
    
                    item["sc_wbp_skatingelementfamiliesaid"] = res_wbp_skatingelementfamiliesa;
                })
                    
            })

        })
        .then(() => {
            
            // for adding info related "css_sc_wbp_skatingelementfamiliesa"

            data.forEach((item, index, array) => {

                knex('css_sc_wbp_skatingelementfamiliesb')
                .where('sc_skatingprogramvalidationid', item.sc_skatingprogramvalidationid)
                .then((res_wbp_skatingelementfamiliesb) => {
    
                    item["sc_wbp_skatingelementfamiliesbid"] = res_wbp_skatingelementfamiliesb;
                })
                    
            })

        })
        .then(() => {
            
            // for adding info related "css_sc_wbp_skatingelementfamilytypesa"

            data.forEach((item, index, array) => {

                knex('css_sc_wbp_skatingelementfamilytypesa')
                .where('sc_skatingprogramvalidationid', item.sc_skatingprogramvalidationid)
                .then((res_wbp_skatingelementfamilytypesa) => {
    
                    item["sc_wbp_skatingelementfamilytypesa"] = res_wbp_skatingelementfamilytypesa;
                })
                    
            })

        })
        .then(() => {
           
            resolve(data);
        })
    
      
    })
}



function getElementConfig(configid) {
    var elConfObj = {};
    return new Promise(function(resolve,reject) {
        knex.select(
            'css_sc_skatingelementconfiguration.sc_skatingelementconfigurationid',
            'css_sc_skatingelementconfiguration.sc_mode',
            'css_sc_skatingelementconfiguration.sc_name'
        )
        .from('css_sc_skatingelementconfiguration')
        .where('css_sc_skatingelementconfiguration.sc_skatingelementconfigurationid',configid)
        .then((rows) => {
            elConfObj = rows[0];
            return getElements(configid);
        })
        .then((res) => {
            //console.log(res);
            elConfObj.elements = res;
            resolve(elConfObj);
        })
    })
}

function getElements(configid) {
    return new Promise(function(resolve,reject) {
        knex.select(
            'css_sc_skatingelementconfiguration_sc_skati.sc_skatingelementconfiguration_sc_skatiid',
            'css_sc_skatingelementconfiguration_sc_skati.sc_skatingelementconfigurationid',
            'css_sc_skatingelementconfiguration_sc_skati.sc_skatingelementdefinitionid'
        )
        .from('css_sc_skatingelementconfiguration_sc_skati')
        .where('css_sc_skatingelementconfiguration_sc_skati.sc_skatingelementconfigurationid',configid)
        .then((rows) => {
            //console.log(rows);
            if(rows.length > 0) {
                var els = {};
                rows.forEach((item, index, array) => {
                    //console.log(item.sc_skatingelementdefinitionid)
                    knex.select(
                        'css_sc_skatingelementdefinition.sc_skatingelementdefinitionid',
                        'css_sc_skatingelementdefinition.sc_starratingtype',
                        'css_sc_skatingelementdefinition.sc_flying',
                        'css_sc_skatingelementdefinition.sc_change',
                        'css_sc_skatingelementdefinition.sc_valueadjustmentv',
                        'css_sc_skatingelementdefinition.sc_throw',
                        'css_sc_skatingelementdefinition.sc_family',
                        'css_sc_skatingelementdefinition.sc_longname',
                        'css_sc_skatingelementdefinition.sc_longnamefrench',
                        'css_sc_skatingelementdefinition.sc_goevalueminus5',
                        'css_sc_skatingelementdefinition.sc_goevalueminus4',
                        'css_sc_skatingelementdefinition.sc_goevalueminus3',
                        'css_sc_skatingelementdefinition.sc_goevalueminus2',
                        'css_sc_skatingelementdefinition.sc_goevalueminus1',
                        'css_sc_skatingelementdefinition.sc_basevalue',
                        'css_sc_skatingelementdefinition.sc_goevalue1',
                        'css_sc_skatingelementdefinition.sc_goevalue2',
                        'css_sc_skatingelementdefinition.sc_goevalue3',
                        'css_sc_skatingelementdefinition.sc_goevalue4',
                        'css_sc_skatingelementdefinition.sc_goevalue5',
                        'css_sc_skatingelementdefinition.sc_takeoffflag',
                        'css_sc_skatingelementdefinition.sc_familyname',
                        'css_sc_skatingelementdefinition.sc_patterndancecode',
                        'css_sc_skatingelementdefinition.sc_elementcodecalculated',
                        'css_sc_skatingelementdefinition.sc_abbreviatedname',
                        'css_sc_skatingelementdefinition.sc_synchrocombination',
                        'css_sc_skatingelementdefinition.sc_level',
                        'css_sc_skatingelementdefinition.sc_abbreviatednamefrench',
                        'css_sc_skatingelementdefinition.sc_rotationflag',
                        'css_sc_skatingelementdefinition.sc_elementcode',
                        'css_sc_skatingelementfamily.sc_skatingelementfamilyid as fam_sc_skatingelementfamilyid',
                        'css_sc_skatingelementfamily.sc_familytype as fam_sc_familytype',
                        'css_sc_skatingelementfamily.sc_code as fam_sc_code',
                        'css_sc_skatingelementfamily.sc_name as fam_sc_name',
                        'css_sc_skatingelementfamily.sc_internalnote as fam_sc_internalnote',
                        'css_sc_skatingelementfamily.sc_frenchname as fam_sc_frenchname',
                        'css_sc_skatingelementfamily.sc_order as fam_sc_order',
                        'css_sc_skatingelementfamily.sc_abbreviatedname as fam_sc_abbreviatedname',
                        'css_sc_skatingelementfamily.sc_abbreviatednamefr as fam_sc_abbreviatednamefr',
                        'css_sc_skatingelementfamilytype.sc_skatingelementfamilytypeid as famtype_sc_skatingelementfamilytypeid',
                        'css_sc_skatingelementfamilytype.sc_name as famtype_sc_name',
                        'css_sc_skatingelementfamilytype.sc_frenchname as famtype_sc_frenchname',
                        'css_sc_skatingelementfamilytype.sc_order as famtype_sc_order',
                        'css_sc_skatingelementfamilytype.sc_modifiers as famtype_sc_modifiers',
                        'css_sc_skatingelementfamilytype.sc_levelposition as famtype_sc_levelposition',
                    )
                    .from('css_sc_skatingelementdefinition')
                    .leftJoin('css_sc_skatingelementfamily','css_sc_skatingelementfamily.sc_skatingelementfamilyid','css_sc_skatingelementdefinition.sc_family')
                    .leftJoin('css_sc_skatingelementfamilytype','css_sc_skatingelementfamilytype.sc_skatingelementfamilytypeid','css_sc_skatingelementfamily.sc_familytype')
                    .where('css_sc_skatingelementdefinition.sc_skatingelementdefinitionid',item.sc_skatingelementdefinitionid)
                    .then((row) => {
                        // get family for row[0]
                        els = row[0];

                        /*
                        return getFamily(row[0].sc_family);
                    })
                    .then((resfam) => {
                        //console.log(res)
                        els.sc_family = resfam;
                        
                        */
                        //els.sc_family = index;
                        item.sc_skatingelementdefinitionid = els;
                        //console.log(item)
                        if(index === rows.length-1) {
                            resolve(rows);
                        }
                    })
                })
            }
            else {
                resolve([]);
            }
        })
    })
}

function getFamily(famid) {
    return new Promise(function(resolve,reject) {
        //resolve({famid:famid,index:index})
        /*
        knex('tbl_competitorentry')
        .then((ste)  => {
            resolve({famid:famid})
        })
        */
        knex.select(
            'css_sc_skatingelementfamily.sc_skatingelementfamilyid',
            'css_sc_skatingelementfamily.sc_familytype',
            'css_sc_skatingelementfamily.sc_code',
            'css_sc_skatingelementfamily.sc_name',
            'css_sc_skatingelementfamily.sc_internalnote',
            'css_sc_skatingelementfamily.sc_frenchname',
            'css_sc_skatingelementfamily.sc_order'
        )
        .from('css_sc_skatingelementfamily')
        .where('css_sc_skatingelementfamily.sc_skatingelementfamilyid',famid)
        .then((rowss) => {
            console.log(rowss[0].sc_skatingelementfamilyid)
            resolve(rowss[0])
            /*
            // get family type details
            knex.select(
                'css_sc_skatingelementfamilytype.sc_skatingelementfamilytypeid',
                'css_sc_skatingelementfamilytype.sc_name',
                'css_sc_skatingelementfamilytype.sc_frenchname',
                'css_sc_skatingelementfamilytype.sc_order',
                'css_sc_skatingelementfamilytype.sc_modifiers'
            )
            .from('css_sc_skatingelementfamilytype')
            .where('css_sc_skatingelementfamilytype.sc_skatingelementfamilytypeid',rowss[0].sc_familytype)
            .then((ress) => {
                rowss[0].sc_familytype = ress[0];
                resolve(rowss[0]);
            })
          */  
        })
        .catch((err) => {
            console.log(err)
        })
    })
}

exports.getSkaterOnIce = (req, res) => {
    return new Promise(function(resolve,reject) {
        // check db for active skater for segment
        var segmentid = req.segmentid;
        var respObj = {};
        knex('tbl_competitorentry')
        .where('segmentid',segmentid)
        .andWhere('onice',1)
        .then((row) => {

            console.log("get skater on ice",row)
            //console.log("get skater on ice",row[0].competitorentryid)

            // if we have a skater get the object
            if(row.length > 0) {
                respObj.onice = true;
                getSkaterObject(row[0])
                .then((skaterObj) => {
                    respObj.skaterObj = skaterObj;
                    respObj["competitorentryid"] = row[0].competitorentryid;
                    
                    resolve(respObj);
                })
            }
            else {
                respObj.onice = false;
                resolve(respObj);
            }
        })
        .catch((err) => {
            resolve({error:err});
        })
    })
}

exports.getChatHistory = (req, res) => {

    console.log("get chhat history",req)
    return new Promise(function(resolve,reject) {
        var entryid = req.entryid;
        var chatResp = {};
        if(entryid) {
            // get chat history
            chatResp.hashistory = true;
            

            knex('tbl_msg_log')
            .where('segmentid',req.segmentid)

            .andWhere(function() {
                this.where('competitorentryid',entryid).orWhere('competitorentryid','')
              })

            .orderBy('timestamp','asc')
            .then((chatRes) => {

                chatResp.chatResp = chatRes;
                resolve(chatResp);
            })

          
            
        }
        else {

            //console.log("5555555555555555555 This is else case 66666666666666666666")
            knex('tbl_msg_log')
            .where('segmentid',req.segmentid)
            .orderBy('timestamp','asc')
            .then((res) => {
                
                var data = [];
                for(let i=0;i<res.length;i++)
                {

                    if(res[i]["competitorentryid"] == null || res[i]["competitorentryid"] == undefined || res[i]["competitorentryid"] == "")
                    {
                        data.push(res[i]);
                    }
                }

                //console.log("5555555555555555555 This is else case 66666666666666666666",data.length)

                if(data.length>0)
                {
                  
                    chatResp.hashistory = true;
                    chatResp.chatResp = data;
                    resolve(chatResp);
                }
                else
                {  
                    chatResp.hashistory = false;
                    resolve(chatResp)

                }
               

            });

          
        }
        
        // // check db for active skater for segment
        // resolve({obj:competitorentryid});
    })
}

exports.insertElement = (req, res) => {
    return new Promise(function(resolve,reject) {
        console.log("new data add request",req);
        
        console.log("time in admin controller - step 1",new Date().toISOString())
       
    
        // first check if element already exists in that position
        // if it does then move everything else +1 in position
        knex('tbl_skate_element')
        .where('competitorentryid',req[0].competitorentryid)
        .andWhere('programorder',req[0].programorder)
        .then((res) => {
          

            if(res.length >0) {
                // if this exists pull all of the skate with same or higher program order
                console.log("time in admin controller - step 2",new Date().toISOString())

              
                knex('tbl_skate_element')
                .where('competitorentryid',req[0].competitorentryid)
                .andWhere('programorder','>=',req[0].programorder)
                .orderBy('programorder','asc')
                .then((skate) => {

                    for(let i=0;i<req.length;i++)
                    {

                        req[i]["skateelementid"] = uuidv4();
                        req[i]["elementstart"] =null;
                        req[i]["elementend"] =null;
                        
                        req[i]["notes"] = req[i]["notes"].join(',');


                        //set createdon  date
                        var createddate = new Date();
                        req[i]["createdon"] = createddate.toISOString();
                        req[i]["modifiedon"] = createddate.toISOString();

                        console.log("time in admin controller - step 3",new Date().toISOString())

                        
                        // insert new one
                        knex('tbl_skate_element')
                        .insert(req[i])
                        .then(() => {
                            if(i == req.length-1)
                            {
                                console.log("time in admin controller - step 4",new Date().toISOString())
                                // renumber those higher than this new one (+1 programorder)
                                skate.forEach((item, index, array) => {
                                    
                                    knex('tbl_skate_element')
                                    .where('skateelementid',item.skateelementid)
                                    .update({programorder:item.programorder+1})
                                    .then(() => {
                                        if(index === skate.length-1) {

                                            // logic for retrun fist skate element id in combination od sun elements

                                            
                                            knex('tbl_skate_element')
                                            .where('competitorentryid',req[0].competitorentryid)
                                            .andWhere('programorder',req[0].programorder)
                                            .orderBy('steporder','asc')
                                            .then((data) =>{
                                                if(data.length>0)
                                                {
                                                    console.log("time in admin controller - step 5",new Date().toISOString())
                                           
                                                    resolve({newid:data[0].skateelementid,position:req[0].programorder});
                                                }
                                            })
                                        }
                                    })
                                })
                            }
                        })
                    
                    }                    

                })

                
            }
            else {
                // nothing matches to simply insert

                for(let i=0;i<req.length;i++)
                {

                    req[i]["skateelementid"] = uuidv4();
                    req[i]["elementstart"] =null;
                    req[i]["elementend"] =null;

                    //console.log("notes",req[i]["notes"])
                    
                    
                    //set createdon date
                    var createddate = new Date();
                    req[i]["createdon"] = createddate.toISOString();
                    req[i]["modifiedon"] = createddate.toISOString();

                    req[i]["notes"] = req[i]["notes"].join(',');
                    
                    console.log("time in admin controller - step 6",new Date().toISOString())
                                 
                    console.log("insert request start",req[i]);
                    knex('tbl_skate_element')
                    .insert(req[i])
                    .then(() => {
                        
                        if(i == req.length-1)
                        {
                            console.log("time in admin controller - step 7",new Date().toISOString())
                                           
                             knex('tbl_skate_element')
                            .where('competitorentryid',req[0].competitorentryid)
                            .andWhere('programorder',req[0].programorder)
                            .orderBy('steporder','asc')
                            .then((data) =>{
                               
                                if(data.length>0)
                                {
                                    console.log("time in admin controller - step 8",new Date().toISOString())
                                           
                                    resolve({newid:data[0].skateelementid,position:req[0].programorder});
                                }
                            })
                        }
                    })
                }

               
            }
        })
    })
}


exports.insertTemplatedElement = (req, res) => {
    return new Promise(function(resolve,reject) {
        console.log("new data add request",req);
        
        knex('tbl_skate_element')
        .where('competitorentryid',req[0].competitorentryid)
        .andWhere('programorder',req[0].programorder)
        .then((res) => {
          

            if(res.length >0) {
                console.log("already available")

                //set createdon  date
                var createddate = new Date();
                req[0]["modifiedon"] = createddate.toISOString();

                knex('tbl_skate_element')
                .where('competitorentryid',req[0].competitorentryid)
                .andWhere('programorder',req[0].programorder)
                .update({
                    sc_skatingelementdefinitionid:req[0].sc_skatingelementdefinitionid,
                    programorder:req[0].programorder,
                    multitype:req[0].multitype,
                    steporder:req[0].steporder,
                    rep_jump:req[0].rep_jump,
                    ratingtype:req[0].ratingtype,
                    halfwayflag:req[0].halfwayflag,
                    elementstart:req[0].elementstart,
                    elementend:req[0].elementend,
                    elementcount:req[0].elementcount,
                    notes:req[0].notes,
                    invalid:req[0].invalid,
                    modifiedon:req[0].modifiedon
                })
                .then(() => {
                    console.log("value upated")
                    resolve({position:req[0].programorder,"rating":req[0].ratingtype,competitorentryid:req[0].competitorentryid});
                    
                })


            }
            else
            {
                console.log('ypu have to insert');

                req[0]["skateelementid"] = uuidv4();
                req[0]["elementstart"] =null;
                req[0]["elementend"] =null;
                
                //set createdon  date
                var createddate = new Date();
                req[0]["createdon"] = createddate.toISOString();
                req[0]["modifiedon"] = createddate.toISOString();

                console.log("time in admin controller - step 3",new Date().toISOString())

                
                // insert new one
                knex('tbl_skate_element')
                .insert(req[0])
                .then(() => {
                    
                    console.log("added in database");

                    resolve({position:req[0].programorder,"rating":req[0].ratingtype,competitorentryid:req[0].competitorentryid});
                    
                    
                });


            }
        });

    })
}


exports.insertTemplatedElementApi = (req, response) => {

    console.log("request coming in controller",req.body);

    
    knex('tbl_skate_element')
        .where('competitorentryid',req.body.competitorentryid)
        .andWhere('programorder',req.body.programorder)
        .then((res) => {
          

            if(res.length >0) {
                console.log("already available")

                //set createdon  date
                var createddate = new Date();
                req.body["modifiedon"] = createddate.toISOString();

                knex('tbl_skate_element')
                .where('competitorentryid',req.body.competitorentryid)
                .andWhere('programorder',req.body.programorder)
                .update({
                    sc_skatingelementdefinitionid:req.body.sc_skatingelementdefinitionid,
                    programorder:req.body.programorder,
                    multitype:req.body.multitype,
                    steporder:req.body.steporder,
                    rep_jump:req.body.rep_jump,
                    ratingtype:req.body.ratingtype,
                    halfwayflag:req.body.halfwayflag,
                    elementstart:req.body.elementstart,
                    elementend:req.body.elementend,
                    elementcount:req.body.elementcount,
                    notes:req.body.notes,
                    invalid:req.body.invalid,
                    modifiedon:req.body.modifiedon
                })
                .then(() => {
                    console.log("value upated")
                    response.status(200).send(["value changed "]);

                })


            }
            else
            {
                console.log('ypu have to insert');

                req.body["skateelementid"] = uuidv4();
                req.body["elementstart"] =null;
                req.body["elementend"] =null;
                
                //set createdon  date
                var createddate = new Date();
                req.body["createdon"] = createddate.toISOString();
                req.body["modifiedon"] = createddate.toISOString();

                console.log("time in admin controller - step 3",new Date().toISOString())

                
                // insert new one
                knex('tbl_skate_element')
                .insert(req.body)
                .then(() => {
                    
                    console.log("added in database");
                    response.status(200).send(["value added "]);

                    
                    
                });


            }

           
        });



};


exports.getTemplatedSegSkaterInfo = (req, response) => 
{   
     console.log("request coming in  templated segment controller", req.body.segmentid);
        
        var output_data = [];

        knex('tbl_competitorentry')
        .where('segmentid', req.body.segmentid)
        .then((res) => {
            
            for(let k=0;k<res.length;k++)
            {
                
                console.log("new case",k == res.length -1)
                knex('tbl_skate_element')
                .where('competitorentryid', res[k].competitorentryid)
                .orderBy('programorder','asc')
                .then((output) => {

                    
                     
                    output_data.push({"competitorentryid":res[k].competitorentryid,"output":output});

                    
                    if(k == res.length -1)
                    {
                        response.status(200).send(output_data);   
                    }
                })
            }
        }) 
        .catch((err) => {
            console.log("error coming",err);
         });
};



exports.changeElement = (req, res) => {
    return new Promise(function(resolve,reject) {
        
        //fuctions use existing id to update element defination
           
        knex('tbl_skate_element')
        .where('competitorentryid',req[0].competitorentryid)
        .andWhere('programorder',req[0].programorder)
        .orderBy('steporder','asc')
        .then((elements) => {   

            if(elements.length >0)
            {

                for(let i=0;i<req.length;i++)
                {
                    req[i]["notes"] = req[i]["notes"].join(',');
                    
                }
                
                // First case - Example : Replace "A+2T" with "1S"
                // second case - Example : Replace "A+2T" with "2S+1Li"
                // third case - Example : Replace "A+2T" with "2S+1Li+1A"

                if(req.length < elements.length)
                {
                    //console.log("samller then existing");

                    elements.forEach((item, index, array) => {
                    
                        var createddate = new Date();
                        modifiedon = createddate.toISOString();

                        if(index <= req.length -1)
                        {
                            knex('tbl_skate_element')
                            .where('skateelementid',item.skateelementid)
                            .update({
                                sc_skatingelementdefinitionid:req[index].sc_skatingelementdefinitionid,
                                programorder:req[index].programorder,
                                multitype:req[index].multitype,
                                steporder:req[index].steporder,
                                rep_jump:req[index].rep_jump,
                                ratingtype:req[index].ratingtype,
                                halfwayflag:req[index].halfwayflag,
                                elementstart:req[index].elementstart,
                                elementend:req[index].elementend,
                                elementcount:req[index].elementcount,
                                notes:req[index].notes,
                                invalid:req[index].invalid,
                                modifiedon:modifiedon
                            })
                            .then(() => {
                                
                            })
                        }
                        else
                        {
                            
                            knex('tbl_skate_element')
                            .where('skateelementid',item.skateelementid)
                            .del()
                            .then(() => {


                                knex('tbl_goe')
                                .where('skateelementid',item.skateelementid)
                                .del()
                                .then(() => {

                                    if(index == elements.length -1 )
                                    {
                                        resolve({newid:elements[0].skateelementid,position:elements[0].programorder});
                                    }
                                    
                                })

                                
                                
                            })                

                        }

                    })

                }
                else if( req.length == elements.length )
                {
                    //console.log("equal then existing");

                    elements.forEach((item, index, array) => {
                    
                        var createddate = new Date();
                        modifiedon = createddate.toISOString();

                        knex('tbl_skate_element')
                        .where('skateelementid',item.skateelementid)
                        .update({
                            sc_skatingelementdefinitionid:req[index].sc_skatingelementdefinitionid,
                            programorder:req[index].programorder,
                            multitype:req[index].multitype,
                            steporder:req[index].steporder,
                            rep_jump:req[index].rep_jump,
                            ratingtype:req[index].ratingtype,
                            halfwayflag:req[index].halfwayflag,
                            elementstart:req[index].elementstart,
                            elementend:req[index].elementend,
                            elementcount:req[index].elementcount,
                            notes:req[index].notes,
                            invalid:req[index].invalid,
                            modifiedon:modifiedon
                        })
                        .then(() => {
                            if(index === elements.length-1)
                            {
                                resolve({newid:elements[0].skateelementid,position:elements[0].programorder});
                            }
                            
                        })
                    
                    })


                }
                else
                {

                    //console.log("greater then existing");

                    var count = 0;
                    var official_id = [];

                    if(elements.length >0)
                    {
                        knex('tbl_goe')
                        .where('skateelementid',elements[0]["skateelementid"])
                        .then((goe_data) => {

                            goe_data.forEach((item5, index5, array5) => {
                                
                                official_id.push([item5.officialassignmentid,item5.goevalue]);

                            })

                        });
                    }

                    elements.forEach((item, index, array) => {
                    
                        count ++;

                    });

                    console.log("counts 0000000000",count);

                    elements.forEach((item, index, array) => {
                    
                        var createddate = new Date();
                        modifiedon = createddate.toISOString();

                       

                        if(index <= req.length -1)
                        {
                            knex('tbl_skate_element')
                            .where('skateelementid',item.skateelementid)
                            .update({
                                sc_skatingelementdefinitionid:req[index].sc_skatingelementdefinitionid,
                                programorder:req[index].programorder,
                                multitype:req[index].multitype,
                                steporder:req[index].steporder,
                                rep_jump:req[index].rep_jump,
                                ratingtype:req[index].ratingtype,
                                halfwayflag:req[index].halfwayflag,
                                elementstart:req[index].elementstart,
                                elementend:req[index].elementend,
                                elementcount:req[index].elementcount,
                                notes:req[index].notes,
                                invalid:req[index].invalid,
                                modifiedon:modifiedon
                            })
                            .then(() => {
                                
                               
                                if(index == elements.length-1 )
                                {
                                    console.log("should come here ~~~~~~~~~~~~~",req.length-1);
                                    for(let i = count;i<req.length;i++)
                                    {
                                        req[i]["skateelementid"] = uuidv4();
                                        //set createdon date
                                        var createddate = new Date();
                                        req[i]["createdon"] = createddate.toISOString();
                                        req[i]["modifiedon"] = createddate.toISOString();

                                        knex('tbl_skate_element')
                                        .insert(req[i])
                                        .then(() => {

                                            for(let m=0;m<official_id.length;m++)
                                            {
                                                var new_goe = {};
                                                new_goe["goeid"] = uuidv4();
                                                new_goe["skateelementid"] = req[i]["skateelementid"];


                                                new_goe["officialassignmentid"] = official_id[m][0];
                                                new_goe["goevalue"] = official_id[m][1];

                                                new_goe["createdon"] = createddate.toISOString();
                                                new_goe["modifiedon"] = createddate.toISOString();

                                                knex('tbl_goe')
                                                .insert(new_goe)
                                                .then(() => {

                                                    if(i == req.length-1 && m == official_id.length-1)
                                                    {

                                                        console.log("Should vome ^^^^^^^^^^^^^^^^^^^^^",official_id);

                                                        resolve({newid:elements[0].skateelementid,position:elements[0].programorder});
                                                    }

                                                });
                                            }

                                            
                                            

                                            
                                        })
                                    }

                                }

                            })
                        }
                        
                        //count ++;

                    })

                    
                   
                }
            }
            
        
        })

       

        // ** old function
        // knex('tbl_skate_element')
        // .where('skateelementid',req.skateelementid)
        // .update({
        //     sc_skatingelementdefinitionid:req.sc_skatingelementdefinitionid,
        //     programorder:req.programorder,
        //     multitype:req.multitype,
        //     steporder:req.steporder,
        //     halfwayflag:req.halfwayflag,
        //     elementstart:req.elementstart,
        //     elementend:req.elementend,
        //     elementcount:req.elementcount,
        //     notes:req.notes,
        //     invalid:req.invalid,
        //     modifiedon:req.modifiedon
        // })
        // .then(() => {
        //     var responseMsg = {success:'true'};
        //     resolve(responseMsg);
        // })
    })
}

exports.deleteElement = (req, res) => {
    return new Promise(function(resolve,reject) {
        
        //set modifiedon date
        var createddate = new Date();
        req.createdon = createddate.toISOString();
        req.modifiedon = createddate.toISOString();

        // get all elements after the one being deleted as they need new order
        knex('tbl_skate_element')
        .where('competitorentryid',req.competitorentryid)
        .andWhere('programorder','>=',req.programorder)
        .orderBy('programorder','asc')
        .then((skate) => {
            // delete all subsequent elements if avilbale
            
            knex('tbl_skate_element')
            .where('competitorentryid',req.competitorentryid)
            .andWhere('programorder',req.programorder)
            .then((elements) => {
                
                // delete each element

                elements.forEach((item, index, array) => {
                    knex('tbl_skate_element')
                    .where('skateelementid',item.skateelementid)
                    .del()
                    .then(() => {

                        knex('tbl_goe')
                        .where('skateelementid',item.skateelementid)
                        .del()
                        .then(() => {

                            if(index === elements.length-1) {
                                // renumber those higher than this new one (-1 programorder)
                                skate.forEach((item1, index1, array) => {
                                    knex('tbl_skate_element')
                                    .where('skateelementid',item1.skateelementid)
                                    .update({programorder:item1.programorder-1})
                                    .then(() => {
                                        if(index1 === skate.length-1) {
                                            var responseMsg = {success:'true'};
                                            resolve(responseMsg);
                                        }
                                    })
                                })
    
                            
                            }
                            
                        })

                        
                    })

                })
            })

        })
    })
}

exports.videoClipElement = (req, res) => {
    return new Promise(function(resolve,reject) {
        
        //set modifiedon date
        var createddate = new Date();
        req.modifiedon = createddate.toISOString();
        
        knex('tbl_skate_element')
        .where('skateelementid',req.skateelementid)
        .update({
            elementstart:req.elementstart,
            elementend:req.elementend,
            modifiedon:req.modifiedon
        })
        .then(() => {
            var responseMsg = {"clip":[req.elementstart,req.elementend],"skateelementid":req.skateelementid};
            resolve(responseMsg);
        })
    })
}


exports.insertGOE = (req, res) => {
    return new Promise(function(resolve,reject) {
        //create new uid
        

        //set modifiedon date
        var createddate = new Date();
        req.createdon = createddate.toISOString();
        req.modifiedon = createddate.toISOString();
        

        knex('tbl_goe')
        .where('skateelementid',req.skateelementid)
        .andWhere('officialassignmentid',req.officialassignmentid)
        .then((goes) => {

            if(goes.length >0)
            {
                console.log("edit")

                knex('tbl_skate_element')
                .where('skateelementid',req.skateelementid)
                .then((current_skate_element) => {
                    console.log("------------- current elements",current_skate_element)

                    if(current_skate_element.length>0)
                    {
                        knex('tbl_skate_element')
                        .where('competitorentryid',current_skate_element[0]["competitorentryid"])
                        .andWhere('programorder',current_skate_element[0]["programorder"])
                        .orderBy('steporder', 'desc')
                        .then((all_skate_element) => {
                            console.log("--------------- full element combination",all_skate_element)


                            all_skate_element.forEach((item, index, array) => {

                                let id = uuidv4();
                                
                                
                                console.log("request",req);
                                
                                knex('tbl_goe')
                                .where('skateelementid',item.skateelementid)
                                .andWhere('officialassignmentid',req.officialassignmentid)
                                .update({
                                
                                    goevalue:req.goevalue,
                                
                                    modifiedon:req.modifiedon
                                })
                                .then(() => {
                                    
                                    if(index == all_skate_element.length-1)
                                    {
                                        resolve({newid:id});
                                    }

                                    
                                })

                               

                            })


                        })

                    }
                })

                // knex('tbl_goe')
                // .where('skateelementid',goes[0].skateelementid)
                // .andWhere('officialassignmentid',goes[0].officialassignmentid)
                // .update({
                   
                //     goevalue:req.goevalue,
                   
                //     modifiedon:req.modifiedon
                // })
                // .then(() => {
                //     resolve({newid:goes[0].goeid});
                // })
            }
            else
            {
                
                knex('tbl_skate_element')
                .where('skateelementid',req.skateelementid)
                .then((current_skate_element) => {
                    console.log("------------- current elements",current_skate_element)

                    if(current_skate_element.length>0)
                    {
                        knex('tbl_skate_element')
                        .where('competitorentryid',current_skate_element[0]["competitorentryid"])
                        .andWhere('programorder',current_skate_element[0]["programorder"])
                        .orderBy('steporder', 'desc')
                        .then((all_skate_element) => {
                            console.log("--------------- full element combination",all_skate_element)


                            all_skate_element.forEach((item, index, array) => {

                                let id = uuidv4();
                                
                                
                                console.log("request",req);
                                
                                
                                knex('tbl_goe')
                                .insert({"skateelementid":item.skateelementid,"officialassignmentid":req.officialassignmentid,"goevalue":req.goevalue,"createdon":req.createdon,"modifiedon":req.modifiedon,"goeid":id})
                                .then(() => {

                                    if(index == all_skate_element.length-1)
                                    {
                                        resolve({newid:req.goeid});
                                    }
                                    
                                })

                            })


                        })

                    }
                })

                
            }
        })

       
    })
}


exports.insertAdjustment = (req, res) => {
    return new Promise(function(resolve,reject) {

        knex('tbl_adjustments')
        .where('competitorentryid',req.competitorentryid)
        .andWhere('officialassignmentid',req.officialassignmentid)
        .andWhere('sc_skatingadjustmentassociationid',req.sc_skatingadjustmentassociationid)
        .then((res) => {

            //set modifiedon date
            var createddate = new Date();
            req.modifiedon = createddate.toISOString();

            if(res.length >0)
            {
                knex('tbl_adjustments')
                .where('adjustmentid',res[0].adjustmentid)
                .update({
                    value:req.value
                })
                .then(() => {

                    var association_id = [];

                    // console.log("`````````````````````````````````")
                    knex('css_sc_skatingadjustmentassociation')
                    .where('sc_skatingadjustmentassociationid',req.sc_skatingadjustmentassociationid)
                    .then((adjust_data) => {
                        if(adjust_data.length >0)
                        {
                            knex('css_sc_skatingadjustmentassociation')
                            .where('sc_adjustmentdefinition',adjust_data[0]["sc_adjustmentdefinition"])
                            .andWhere('sc_segmentdefinition',adjust_data[0]["sc_segmentdefinition"])
                            .then((possible_associaltions) => {
                                if(possible_associaltions.length >0)
                                {
                                    possible_associaltions.forEach((item, index, array) => {
                                        association_id.push(item.sc_skatingadjustmentassociationid)
                                    })
                                }

                                let total = 0;
                                association_id.forEach((item1, index1, array1) => {
                                    knex('tbl_adjustments')
                                    .where('competitorentryid',req.competitorentryid)
                                    .andWhere('officialassignmentid',req.officialassignmentid)
                                    .andWhere('sc_skatingadjustmentassociationid',item1)
                                    .then((res_after_update) => {
                                        if(res_after_update.length >0)
                                        {
                                            //console.log("index",index1,"values ----------------",res_after_update[0]["value"])
                                            total = total + res_after_update[0]["value"];
                                            if(index1 == association_id.length-1 )
                                            {

                                                knex.select(
                                                'tbl_adjustments.sc_skatingadjustmentassociationid',
                                                'tbl_adjustments.value',
                                                'css_sc_skatingadjustmentdefinition.sc_group',
                                                'css_sc_skatingadjustmentdefinition.sc_name'
                                                )
                                                .from('tbl_adjustments')
                                                .leftJoin('css_sc_skatingadjustmentassociation','css_sc_skatingadjustmentassociation.sc_skatingadjustmentassociationid','tbl_adjustments.sc_skatingadjustmentassociationid')
                                                .leftJoin('css_sc_skatingadjustmentdefinition','css_sc_skatingadjustmentdefinition.sc_skatingadjustmentdefinitionid','css_sc_skatingadjustmentassociation.sc_adjustmentdefinition')
                                                .where('tbl_adjustments.competitorentryid',req.competitorentryid)
                                                .then((row) => {
                                                    
                                                    

                                                    var bonus = 0;
                                                    var deduction = 0;

                                                    for(let k=0;k<row.length;k++)
                                                    {
                                                        if(row[k]["sc_group"] == 947960000)
                                                        {
                                                            bonus = bonus + row[k]["value"]
                                                        }

                                                        if(row[k]["sc_group"] == 947960001)
                                                        {
                                                            deduction = deduction + row[k]["value"]
                                                        }

                                                    }
                                                    console.log("%%%%%%%%%%% see here %%%%%%%%",row,bonus,deduction);

                                                    resolve({total:total,"broadcaster_bonus":bonus,"broadcaster_deduction":deduction});
                                                
                                                });
                                                                        

                                               
                                            }
                                        }
                                    })

                                })

                                // resolve({ids:association_id});
                            })
                        }
                    
                    
                    })

                    
                })

            }
            else
            {
                //create new uid
                req.adjustmentid = uuidv4();

                req.createdon = createddate.toISOString();
                
                console.log("data in adjustment",req);
                knex('tbl_adjustments')
                .insert(req)
                .then(() => {

                    var association_id = [];

                    // console.log("`````````````````````````````````")
                    knex('css_sc_skatingadjustmentassociation')
                    .where('sc_skatingadjustmentassociationid',req.sc_skatingadjustmentassociationid)
                    .then((adjust_data) => {
                        if(adjust_data.length >0)
                        {
                            knex('css_sc_skatingadjustmentassociation')
                            .where('sc_adjustmentdefinition',adjust_data[0]["sc_adjustmentdefinition"])
                            .andWhere('sc_segmentdefinition',adjust_data[0]["sc_segmentdefinition"])
                            .then((possible_associaltions) => {
                                if(possible_associaltions.length >0)
                                {
                                    possible_associaltions.forEach((item, index, array) => {
                                        association_id.push(item.sc_skatingadjustmentassociationid)
                                    })
                                }

                                let total = 0;
                                association_id.forEach((item1, index1, array1) => {
                                    knex('tbl_adjustments')
                                    .where('competitorentryid',req.competitorentryid)
                                    .andWhere('officialassignmentid',req.officialassignmentid)
                                    .andWhere('sc_skatingadjustmentassociationid',item1)
                                    .then((res_after_update) => {
                                        if(res_after_update.length >0)
                                        {
                                            //console.log("values ----------------",res_after_update[0]["value"])
                                            total = total + res_after_update[0]["value"];
                                            if(index1 == association_id.length-1 )
                                            {
                                                knex.select(
                                                    'tbl_adjustments.sc_skatingadjustmentassociationid',
                                                    'tbl_adjustments.value',
                                                    'css_sc_skatingadjustmentdefinition.sc_group',
                                                    'css_sc_skatingadjustmentdefinition.sc_name'
                                                    )
                                                    .from('tbl_adjustments')
                                                    .leftJoin('css_sc_skatingadjustmentassociation','css_sc_skatingadjustmentassociation.sc_skatingadjustmentassociationid','tbl_adjustments.sc_skatingadjustmentassociationid')
                                                    .leftJoin('css_sc_skatingadjustmentdefinition','css_sc_skatingadjustmentdefinition.sc_skatingadjustmentdefinitionid','css_sc_skatingadjustmentassociation.sc_adjustmentdefinition')
                                                    .where('tbl_adjustments.competitorentryid',req.competitorentryid)
                                                    .then((row) => {
                                                        
                                                        
    
                                                        var bonus = 0;
                                                        var deduction = 0;
    
                                                        for(let k=0;k<row.length;k++)
                                                        {
                                                            if(row[k]["sc_group"] == 947960000)
                                                            {
                                                                bonus = bonus + row[k]["value"]
                                                            }
    
                                                            if(row[k]["sc_group"] == 947960001)
                                                            {
                                                                deduction = deduction + row[k]["value"]
                                                            }
    
                                                        }
                                                        console.log("%%%%%%%%%%% see here %%%%%%%%",row,bonus,deduction);
    
                                                        resolve({total:total,"broadcaster_bonus":bonus,"broadcaster_deduction":deduction});
                                                    
                                                    });

                                                // resolve({total:total});
                                            }
                                        }
                                    })

                                })
                                
                            })
                        }
                    
                    
                    })

                    
                })

            }
        })

        
    })
}

// exports.updateAdjustment = (req, res) => {
//     return new Promise(function(resolve,reject) {
//         //set modifiedon date
//         var createddate = new Date();
//         req.modifiedon = createddate.toISOString();
        
//         knex('tbl_adjustments')
//         .where('adjustmentid',req.adjustmentid)
//         .update({
//             value:req.value,
//             modifiedon:req.modifiedon
//         })
//         .then(() => {
//             var responseMsg = {success:'true'};
//             resolve(responseMsg);
//         })
//     })
// }


exports.insertPC = (req, res) => {
    return new Promise(function(resolve,reject) {
        

        knex('tbl_programcomponent')
        .where('competitorentryid',req.competitorentryid)
        .andWhere('officialassignmentid',req.officialassignmentid)
        .andWhere('sc_skatingprogramcomponentdefinitionid',req.sc_skatingprogramcomponentdefinitionid)
        .then((res) => {

            //set modifiedon date
            var createddate = new Date();
            req.modifiedon = createddate.toISOString();

            if(res.length >0)
            {
                knex('tbl_programcomponent')
                .where('programcomponentid',res[0].programcomponentid)
                .update({
                    value:req.value
                })
                .then(() => {
                    resolve({newid:res[0].programcomponentid});
                })

            }
            else
            {
                //create new uid
                req.programcomponentid = uuidv4();

                req.createdon = createddate.toISOString();
                
                knex('tbl_programcomponent')
                .insert(req)
                .then(() => {
                    resolve({newid:req.programcomponentid});
                })

            }
        })


        //create new uid
        // req.programcomponentid = uuidv4();

        // //set modifiedon date
        // var createddate = new Date();
        // req.createdon = createddate.toISOString();
        // req.modifiedon = createddate.toISOString();
        
        // knex('tbl_programcomponent')
        // .insert(req)
        // .then(() => {
        //     resolve({newid:req.programcomponentid});
        // })


    })
}


exports.update_score = (req, res) => {
    return new Promise(function(resolve,reject) {
      
        knex('tbl_competitorentry')
        .where('competitorentryid',req.competitorentryid)
        .then((res) => {

            //set modifiedon date
            var createddate = new Date();
            req.modifiedon = createddate.toISOString();

            if(res.length >0)
            {
                knex('tbl_competitorentry')
                .where('competitorentryid',req.competitorentryid)
                .update({
                    score:req.score
                })
                .then(() => {
                    resolve({'status':"done"});
                })

            }

            
            
        })

        

       
    })
}


// function for halfway

exports.halfway_update = (req, res) => {
    return new Promise(function(resolve,reject) {
      
       console.log("req coming",req)
       
       var skate_element = [];

       knex('tbl_skate_element')
        .where('competitorentryid',req.competitorentryid)
        .andWhere('programorder','>',req.index)
        .orderBy('programorder','asc')
        .then((data) => {

            //set modifiedon date
            var createddate = new Date();
            req.modifiedon = createddate.toISOString();
               
            console.log("ccc",data)

            if(data.length > 0)
            {

                data.forEach((item, index, array) => {
                
                    knex('tbl_skate_element')
                    .where('skateelementid',item.skateelementid)
                    .update({
                        halfwayflag:1
                    })
                    .then(() => {
    
                        skate_element.push(item.skateelementid);
    
                        if(index == data.length-1)
                        {
    
                            console.log("aaaaaaaaaaaaaaaaaaaaaaa",index);
    
                            knex('tbl_skate_element')
                            .where('competitorentryid',req.competitorentryid)
                            .andWhere('programorder','<=',req.index)
                            .orderBy('programorder','asc')
                            .then((first_half) => {
    
                                console.log("bbbbbbbbbbb ",first_half);
    
                                if(first_half.length>=1)
                                {
                                    first_half.forEach((item1, index1, array1) => {
                                
                                        if(item1.halfwayflag == 1)
                                        {
                                            skate_element.push(item1.skateelementid); 
                                        }
    
                                        knex('tbl_skate_element')
                                        .where('skateelementid',item1.skateelementid)
                                        .update({
                                            halfwayflag:0
                                        })
                                        .then(() => {
    
                                            if(index1 == first_half.length-1)
                                            {
                                                resolve(skate_element)
                                            }
                                            
                                        })
                                        
                                        
        
                                    })
                                }
                                else
                                {
                                    resolve(skate_element)
                                }
                                
                            })
    
                        }
    
    
                    })
                    
    
                });
            }
            else
            {
                console.log("coming here")

                knex('tbl_skate_element')
                .where('competitorentryid',req.competitorentryid)
                .andWhere('programorder','<=',req.index)
                .orderBy('programorder','asc')
                .then((first_half) => {

                    console.log("bbbbbbbbbbb ",first_half);

                    if(first_half.length>=1)
                    {
                        first_half.forEach((item1, index1, array1) => {
                    
                            if(item1.halfwayflag == 1)
                            {
                                skate_element.push(item1.skateelementid); 
                            }

                            knex('tbl_skate_element')
                            .where('skateelementid',item1.skateelementid)
                            .update({
                                halfwayflag:0
                            })
                            .then(() => {

                                if(index1 == first_half.length-1)
                                {
                                    resolve(skate_element)
                                }
                                
                            })
                            
                            

                        })
                    }
                    else
                    {
                        resolve(skate_element)
                    }
                    
                })
                
            }
            
        });

    })
}



// function for top

var competitors_ranking = exports.competitors_ranking = (segmentid) => {
    
    return new Promise(function(resolve,reject) {

        segment_ranking(segmentid)
        .then((response) => {
            
           
            category_ranking(segmentid)
            .then((data) => {

                
                //console.log("111111111111111111111111111111",data)

                var temp = {"segment":response,"category":data};
                resolve(temp);
            })
        })
    })
}


var segment_ranking = exports.segment_ranking = (segmentid) => {
    
    return new Promise(function(resolve,reject) {

        knex('tbl_competitorentry')
        .where('segmentid',segmentid)
        .orderBy('score','desc')
        .then((res) => {
            
            
            res.forEach((item, index, array) => {

                knex('css_sc_competitors')
                .where('sc_competitorid', item.sc_competitorid)
                .then((skater_data) => {

                    item["skater_data"] = skater_data[0];

                    if(index === res.length-1) {
                        resolve(res);
                    }
                    
                })
            });

                
            

        })


    })
}


var category_ranking = exports.category_ranking = (segmentid) => {
    
    return new Promise(function(resolve,reject) {

        knex('tbl_segments')
        .where('segmentid',segmentid)
        .then((res) => {
            
            if(res.length>=1)
            {
                knex('tbl_segments')
                .where('categoryid',res[0]["categoryid"])
                .orderBy('performanceorder')
                .then((total_segment) => {
                    console.log("total segments",total_segment);

                    var output_data = {};
                    output_data["category_id"]= res[0]["categoryid"];
                    output_data["all_segments"] = [];
                    
                    output_data["competitors"] = [];

                    total_segment.forEach((item, index, array) => {

                        output_data["all_segments"].push({"definition":item.definitionid,"enname":item.enname,"frname":item.frname,"order":item.performanceorder});

                        knex('tbl_competitorentry')
                        .where('segmentid', item.segmentid)
                        .orderBy('score','desc')
                        .then((competitor_data) => {
                            
                            
                            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~",competitor_data.length)

                            
                            competitor_data.forEach((item1, index1, array1) => {

                                //console.log("for each loop",index1);
                                
                                let available_data = output_data["competitors"].findIndex(record => record.sc_competitor_id == item1.sc_competitorid);
                                //console.log("avialable flag -------",available_data);

                                if(available_data == -1)
                                {
                                    //console.log("inside if condition",index1);

                                    var object = {};
                                    //object["segmentid"] = item.segmentid;
                                    object["sc_competitor_id"] = item1.sc_competitorid;

                                    var name = "segment"+(index+1)+"";
                                    object[name] = Number(item1.score);

                                    var rank = "segment"+(index+1)+"_rank";
                                    object[rank] = index1+1;

                                    
                                    object["total_score"] = Number(item1.score);

                                    output_data["competitors"].push(object);
                                }
                                else
                                {

                                    //console.log("inside else condition",index1);

                                    var name = "segment"+(index+1)+"";
                                    output_data["competitors"][available_data][name] = Number(item1.score);

                                    var rank = "segment"+(index+1)+"_rank";
                                    
                                    output_data["competitors"][available_data][rank] = index1+1;

                                    output_data["competitors"][available_data]["total_score"] = Number(output_data["competitors"][available_data]["total_score"]) + Number(item1.score);
                                }
                                
                                //console.log("after each loop --- ",output_data["competitors"].length);
                            })
                            
                            
                          //console.log("updated list +++++++++++++++++",output_data["competitors"].length);

                            // item["skater_data"] = skater_data[0];
        
                            if(index === total_segment.length-1 ) {
                                
                                
                                //console.log("updated list +++++++++++++++++",output_data)

                                var sorted = output_data["competitors"].sort(({total_score:a}, {total_score:b}) => b-a);
                                
                                output_data["competitors"] = sorted;


                                //resolve(output_data);


                                output_data["competitors"].forEach((item2, index2, array2) => {

                                    //console.log("item 2",item2);

                                    knex('css_sc_competitors')
                                    .where('sc_competitorid', item2.sc_competitor_id)
                                    .then((skater_data) => {
                    
                                        
                                        output_data["competitors"][index2]["skater_data"] = skater_data[0];
                    
                                        if(index2 === output_data["competitors"].length-1) {
                                            
                                            resolve(output_data);
                                        }
                                        
                                    })
                                });

                                


                            }
                            
                        })
                    })


                })
            }

           
            

        })


    })
}

exports.startSkate = (req, res) => {
    return new Promise(function(resolve,reject) {
        //create new uid
        
        //req.goeid = uuidv4();

        //set modifiedon date
        var createddate = new Date();
        //req.createdon = createddate.toISOString();
        req.modifiedon = createddate.toISOString();
        

        knex('tbl_competitorentry')
        .where('competitorentryid',req.competitorentryid)
        .andWhere('segmentid',req.segmentid)
        .then((data) => {
            if(data.length >0)
            {
               
                knex('tbl_competitorentry')
                .where('competitorentryid',data[0].competitorentryid)
                .andWhere('segmentid',data[0].segmentid)
                .update({

                    skatestartvideotime:req.skatestartvideotime,
                    modifiedon:req.modifiedon
                })
                .then(() => {
                    resolve({success:'true'});
                })

            }
           
        })

       
    })
}


exports.stopSkate = (req, res) => {
    return new Promise(function(resolve,reject) {
        //create new uid
        
        //req.goeid = uuidv4();

        //set modifiedon date
        var createddate = new Date();
        //req.createdon = createddate.toISOString();
        req.modifiedon = createddate.toISOString();
        

        knex('tbl_competitorentry')
        .where('competitorentryid',req.competitorentryid)
        .andWhere('segmentid',req.segmentid)
        .then((data) => {
            if(data.length >0)
            {
               
                knex('tbl_competitorentry')
                .where('competitorentryid',data[0].competitorentryid)
                .andWhere('segmentid',data[0].segmentid)
                .update({

                    skateendvideotime:req.skateendvideotime,
                    modifiedon:req.modifiedon
                })
                .then(() => {
                    resolve({success:'true'});
                })

            }
           
        })

       
    })
}


exports.wbp_error_log = (req, res) => {
    return new Promise(function(resolve,reject) {
        

        console.log("db admin --------------------------- is called",req);

        if(req["data"]["changed_data"]["errors"].length >=1)
        {
            let text = "==========================================================================================\n";
            
            text = text + "\nEvent name      : " + req["data"]["changed_data"]["event_name"];
            text = text + "\nCategory name   : " + req["data"]["changed_data"]["category_name"];
            text = text + "\nDiscipline name : " + req["data"]["changed_data"]["sc_skatingdisciplinedefinition"];
            text = text + "\nSegment name    : " + req["data"]["changed_data"]["segment_name"];
            text = text + "\nCompetitor name : " + req["data"]["changed_data"]["competitor_name"];
            
            text = text + "\n\nWBP rules error:\n";

            

            for(let m=0;m<req["data"]["changed_data"]["errors"].length;m++)
            {
                
                text = text + "\n" +(m+1) + ") Rule: " + req["data"]["changed_data"]["errors"][m]["rule_type"] + " (Order - " + req["data"]["changed_data"]["errors"][m]["order"] + ")\n";
                text = text + "\t- " + req["data"]["changed_data"]["errors"][m]["error"];

                for(let n=m+1;n<req["data"]["changed_data"]["errors"].length;n++)
                {
                    if(req["data"]["changed_data"]["errors"][m]["order"] == req["data"]["changed_data"]["errors"][n]["order"])
                    {
                        text = text + "\n\t- " + req["data"]["changed_data"]["errors"][n]["error"];
                        m= m+1;
                    }
                    else
                    {
                        break;
                    }


                }

                text = text + "\n";
                
            }

            text = text + "\n\n\n";

            fs.appendFile('./rooms/wbp.txt', text, function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("The text was appended to the file!");
                resolve({success:'true'});
            });

        }
        
        
       
    })
}


// function helping in validation before creating job

var getCompetitorinfoWithSegment = exports.getCompetitorinfoWithSegment = (req, res) => {

    console.log("request foe getCompetitorinfoWithSegment skater object",req)

   
    
        return new Promise(function(resolve,reject) {

            knex('tbl_competitorentry')
            knex.select(

                'competitorentryid',
                'tbl_competitorentry.segmentid',
                'score',
                'skatestartvideotime',
                'skateendvideotime',
                'video_url',
                'tbl_segments.rinkid',

                
            )
            .from('tbl_competitorentry')

            .leftJoin('tbl_segments','tbl_segments.segmentid','tbl_competitorentry.segmentid')
            .where('tbl_competitorentry.competitorentryid',req.competitorentryid)
            .then((rows) => {

                console.log("should come here for gettign response");
                resolve(rows);
            })
            


        
    })
}


// function for inserting entry into job request table

var insertOrUpdateTransformJobRequest = exports.insertOrUpdateTransformJobRequest = (req, res) => {

    console.log("request foe insertTransformJobRequest skater object",req)

    return new Promise(function(resolve,reject) {
       
        req.requestid = uuidv4();
        var createddate = new Date();
        req.createdon = createddate.toISOString();
        req.modifiedon = createddate.toISOString();
        
        console.log("values set",req);

        knex('tbl_transform_job_request')
        .where('competitorentryid',req.competitorentryid)
        .then((output) => {
            if(output.length >0)
            {
                console.log("already has data")

                knex('tbl_transform_job_request')
                .where('competitorentryid',req.competitorentryid)
                .update({

                    state:req.state,
                    modifiedon:req.modifiedon
                })
                .then(() => {
                    resolve({"completed":true})
                })

            }
            else
            {
                console.log("insert recoed")

                knex('tbl_transform_job_request')
                .insert(req)
                .then(() => {
                    console.log("completed set");
                    
                    resolve({"completed":true})

                    
                })
                .catch((err) => {
                    console.log("in error",err)
                    
                });

            }
        }).catch((err) => {
            console.log("in error",err)
            
        });

       
       
    })
}


var deleteTransformJobRequest = exports.deleteTransformJobRequest = (req, res) => {

    console.log("request foe insertTransformJobRequest skater object",req)

    return new Promise(function(resolve,reject) {

        knex('tbl_transform_job_request')
        .where('competitorentryid',req.competitorentryid)
        .del()
        .then(() => {
            resolve({"completed":true})
        })
        .catch((err) => {
            console.log("in error",err)
            
        });

       
    })
}

var updateVideoUrl = exports.updateVideoUrl = (req, res) => {

    console.log("request foe updateVideoUrl skater object",req)

    return new Promise(function(resolve,reject) {

       
        var createddate = new Date();
        req.modifiedon = createddate.toISOString();

        knex('tbl_competitorentry')
        .where('competitorentryid',req.competitorentryid)
        .update({

            video_url:req.video_url,
            modifiedon:req.modifiedon
        })
        .then(() => {
            resolve({"completed":true})
        })
        .catch((err) => {
            console.log("in error",err)
            
        });

       
    })
}

var referee_submit_time_after_vro = exports.referee_submit_time_after_vro = (req) => {
    return new Promise(function(resolve,reject) {
        knex('tbl_msg_log')
        .where('competitorentryid',req.competitorentryid)
        .orderBy('timestamp','ASC')
        .then((rows) => {

            console.log("should come here for gettign response",rows.length);
            if(rows.length>0)
            {   
                var ref_scored = false;
                //var vro_stopped = false;

                var vro_stop_time = 0;
                var referee_score_time = 0;

                rows.forEach((item, index, array) => {
                    
                    var message = JSON.parse(item['message']);
                    
                    if(message['data']['method_name'] == 'STOPSKATE')
                    {
                        // if(vro_stopped == false)
                        // {
                        //     vro_stopped = true;
                            
                        // }

                        vro_stop_time = item['timestamp'];
                        console.log("vro time updated");
                        
                    }   
                    if(message['data']['method_name'] == 'SCORESKATE')
                    {
                        if(ref_scored == false)
                        {
                            ref_scored = true;
                            referee_score_time = item['timestamp']
                        }
                        
                    }

                    
                })

                if(vro_stop_time != 0 && referee_score_time != 0 )
                {
                    
                    console.log("each time",vro_stop_time,referee_score_time)

                    if(referee_score_time > vro_stop_time)
                    {
                        var intervalSeconds = (referee_score_time - vro_stop_time) / 1000;
                        console.log("this will happen only once",intervalSeconds)

                        resolve({"completed":true,"time_interval":intervalSeconds});
                    }
                    

                }

                
            }

            
        })
        .catch((err) => {
            console.log("error coming in time calculating",err);
        })
    })
}
