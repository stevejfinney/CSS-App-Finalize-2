/*
TO USE THIS FILE, INCLUDE AS FOLLOWS:
const gf = require('../functions/global.functions');

FUNCTIONS ARE THEN CALLED USING FOLLOWING SYNTAX:
gf.functionName(objectIn)
.then((objectOut))....continue processing
*/


const knexconfig = require('../../knexfile');
const knex = require('knex')(knexconfig.development);
//knex.raw("PRAGMA foreign_keys = ON;").then(() => {
//    console.log("Foreign Key Check activated.");
//});
const { v4: uuidv4 } = require('uuid');

/*
exports.insertEvent
Inserts new event record and adds default permission of logged in ds
REQUIRES OBJECT:
{
    sc_skatingeventclassid: 'GUID', --ID OF EVENT CLASS (REF: SC_SKATINGEVENTCLASS)
    enname: 'STRING',
    endescription: 'STRING',
    frname: 'STRING',
    frdescription: 'STRING',
    contactid: 'GUID'               --CONTACT ID OF LOGGED IN DS
}
RETURNS:
{
    eventid: 'GUID',
    sc_skatingeventclassid: 'GUID',
    enname: 'STRING',
    endescription: 'STRING',
    frname: 'STRING',
    frdescription: 'STRING',
    createdon: 'DATE ISOString',
    modifiedon: 'DATE ISOString',
    contactid: 'GUID'
}
*/
exports.insertEvent = (eventObj) => {
    return new Promise(function(resolve,reject) {
        //create new uid
        eventObj.eventid = uuidv4();
        //set createdon date
        var createddate = new Date();
        eventObj.createdon = createddate.toISOString();
        eventObj.modifiedon = createddate.toISOString();

        let contactname = eventObj.contactname;
        let contactid = eventObj.contactid;

        // temporarily remove them from the object
        delete eventObj.contactname;
        delete eventObj.contactid;
        
        knex('tbl_events')
        .insert(eventObj)
        .then(() => {
            console.log(process.env.ISONLINE);
            // also create entry in dspermissions table for creator
            if(process.env.ISONLINE === 'true') { // if we're online we need permissions setup
                let permid = uuidv4();
                knex('tbl_dspermissions')
                .insert({dspermissionsid: permid, dscontactid:contactid, dsname:contactname, eventid:eventObj.eventid})
                .then((rows) => {
                    // add contactid back in to object
                    eventObj.contactid = contactid;
                    resolve(eventObj);
                })
            }
            else {
                eventObj.contactid = contactid;
                resolve(eventObj);
            }
        })
        .catch((err) => {
            reject(err);
        });
    })
}

/*
exports.updateEvent
Updates existing event record
REQUIRES OBJECT:
{
    eventid: 'GUID',
    sc_skatingeventclassid: 'GUID', --ID OF EVENT CLASS (REF: SC_SKATINGEVENTCLASS)
    enname: 'STRING',
    endescription: 'STRING',
    frname: 'STRING',
    frdescription: 'STRING',
    startdate: 'DATE ISOString',
    enddate: 'DATE ISOString',
    contactid: 'GUID'               --CONTACT ID OF LOGGED IN DS
}
RETURNS:
{
    eventid: 'GUID',
    sc_skatingeventclassid: 'GUID',
    enname: 'STRING',
    endescription: 'STRING',
    frname: 'STRING',
    frdescription: 'STRING',
    startdate: 'DATE ISOString',
    enddate: 'DATE ISOString',
    modifiedon: 'DATE ISOString',
    contactid: 'GUID'
}
*/
exports.updateEvent = (eventObj) => {
    return new Promise(function(resolve,reject) {
        //set modifieddon date
        var modifiedon = new Date();
        eventObj.modifiedon = modifiedon.toISOString();

        let contactid = eventObj.contactid;

        // temporarily remove them from the object
        delete eventObj.contactid;

        knex('tbl_events')
        .where({ eventid: eventObj.eventid })
        .update(eventObj)
        .then(() => {
            eventObj.contactid = contactid;
            resolve(eventObj);
        })
        .catch((err) => {
            reject(err);
        });
    })
}

/* exports.insertCategory
Inserts new category record and related segments (if any)
REQUIRES OBJECT:
{
    eventid: 'GUID',                --ID OF PARENT EVENT
    definitionid: 'GUID',           --ID OF SELECTED CATEGORY DEFINITION (REF: SC_SKATINGCATEGORYDEFINITION)
    group: 'STRING',                --GROUP NAME --or--
    enname: 'STRING',               --ALIAS FOR GROUP
    endescription: 'STRING',
    frname: 'STRING',               --ALIAS FOR GROUP
    frdescription: 'STRING',
    status: 'STRING',
    startdate: 'DATE ISOString',
    enddate: 'DATE ISOString',
}
RETURNS:
{
    categoryid: 'GUID',             --ID OF CREATED CATEGORY
    eventid: 'GUID',                --ID OF PARENT EVENT
    definitionid: 'GUID',           --ID OF SELECTED CATEGORY DEFINITION (REF: SC_SKATINGCATEGORYDEFINITION)
    group: 'STRING',                --GROUP NAME --or--
    enname: 'STRING',               --ALIAS FOR GROUP
    endescription: 'STRING',
    frname: 'STRING',               --ALIAS FOR GROUP
    frdescription: 'STRING',
    status: 'STRING',
    startdate: 'DATE ISOString',
    enddate: 'DATE ISOString',
    createdon: 'DATE ISOString',
    modifiedon: 'DATE ISOString'
}
*/
var insertCategory = exports.insertCategory = (categoryObj) => {
    return new Promise(function(resolve,reject) {
        //create new uid
        categoryObj.categoryid = uuidv4();
        //set createdon date
        var createddate = new Date();
        categoryObj.createdon = createddate.toISOString();
        categoryObj.modifiedon = createddate.toISOString();
        
        // remove disciplineid and programid from the object
        delete categoryObj.disciplineid;
        delete categoryObj.programid;

        if("group" in categoryObj) {
            categoryObj.enname = categoryObj.group;
            delete categoryObj.group;
        }

        if("groupfr" in categoryObj) {
            categoryObj.frname = categoryObj.groupfr;
            delete categoryObj.groupfr;
        }

        getForcedLabels(categoryObj.definitionid)
        .then((thelabels) => {
            if(!categoryObj.hasOwnProperty('labels')) {
                categoryObj.labels = thelabels; // only repopulating if labels is empty (will be an import)
                if(thelabels.length == 0) {
                    categoryObj.labels = null;
                }
            }
            
            //console.log(categoryObj)
            //knex('tbl_categories').insert(categoryObj)
            knex('tbl_categories').insert({
                categoryid:categoryObj.categoryid,
                eventid:categoryObj.eventid,
                enname:categoryObj.enname,
                endescription:categoryObj.endescription,
                definitionid:categoryObj.definitionid,
                labels:categoryObj.labels,
                createdon:categoryObj.createdon,
                modifiedon:categoryObj.modifiedon
            })
            .then(() => {
                // insert default segments here
                knex('css_sc_skatingsegmentdefinitions')
                .where({sc_parentcategory: categoryObj.definitionid})
                .orderBy('sc_order', 'asc')
                .then((data) => {
                    if(data.length > 0) { // there are records for this category
                        // create records in segment table
                        insertSegments(data,categoryObj)
                        .then((results) => {
                            //console.log(results);
                            resolve(categoryObj);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                    }
                })
                //resolve(categoryObj);
            })
            .catch((err) => {
                reject(err);
            });
        })
    })
}

function getForcedLabels(defid) {
    return new Promise(function(resolve,reject) {
        var labelArr = [];
        knex.select([
            "sc_skatingcategorylabelsid"
        ])
        .from("css_sc_skatingcategorylabels")
        .where("sc_parentcategory",defid)
        .andWhere("sc_forced","1")
        .then((rows) => {
            if(rows.length > 0) {
                rows.forEach((row,index,array) => {
                    labelArr.push(row.sc_skatingcategorylabelsid);
                    if(index === array.length-1) {
                        resolve(labelArr.toString());
                    }
                })
            }
            else
                resolve(labelArr);
        })
        .catch((err) => {
            reject(err);
        });
    })
}

exports.insertCategories = (categorysObj) => {
    return new Promise(function(resolve,reject) {
        const queries = [];
        categorysObj.forEach(categoryObj => {
            const query = new Promise((resolve,reject) => {
                resolve(insertCategory(categoryObj));   
            })
            queries.push(query);
        });
        
        /*
        .allSettled returns array including status of promise (fulfilled / rejected):
        eg>
        [
            {
            status: 'fulfilled',
            value: {
                eventid: 'test98cd-1feb-4425-a5aa-445e6ec854bc',
                definitionid: 'F3BCFDD1-E18B-EB11-A812-000D3A8DC0F1',
                categoryid: '649ca9a0-b5eb-4364-aecc-ae82c1cfd559',
                enname: 'Test 1',
                endescription: 'Desc 1',
                frname: 'Test 1',
                frdescription: 'Desc 1',
                createdon: '2021-09-10T19:26:40.662Z',
                modifiedon: '2021-09-10T19:26:40.662Z'
                }
            },
            {
            status: 'rejected',
            value: {
                eventid: 'test98cd-1feb-4425-a5aa-445e6ec854bc',
                definitionid: 'F3BCFDD1-E18B-EB11-A812-000D3A8DC0F1',
                categoryid: 'd71184ce-51b7-4393-bc8b-1cac4b976053',
                enname: 'Test 2',
                endescription: 'Desc 2',
                frname: 'Test 1',
                frdescription: 'Desc 1',
                createdon: '2021-09-10T19:26:40.664Z',
                modifiedon: '2021-09-10T19:26:40.664Z'
                }
            }
        ]
        */
        Promise.allSettled(queries) // Once every query is written
            .then((results) => {
                //console.log(results);
                resolve(results);
            })
            .catch((err) => {
                reject(err);
            });
    })
}

/* exports.updateCategory
Updates existing category
REQUIRES OBJECT:
{
    categoryid: 'GUID',             --ID OF CREATED CATEGORY
    eventid: 'GUID',                --ID OF PARENT EVENT
    definitionid: 'GUID',           --ID OF SELECTED CATEGORY DEFINITION (REF: SC_SKATINGCATEGORYDEFINITION)
    enname: 'STRING',               --ALIAS FOR GROUP
    endescription: 'STRING',
    frname: 'STRING',               --ALIAS FOR GROUP
    frdescription: 'STRING',    
    status: 'STRING',
    startdate: 'DATE ISOString',
    enddate: 'DATE ISOString'
}
RETURNS:
{
    categoryid: 'GUID',             --ID OF CREATED CATEGORY
    eventid: 'GUID',                --ID OF PARENT EVENT
    definitionid: 'GUID',           --ID OF SELECTED CATEGORY DEFINITION (REF: SC_SKATINGCATEGORYDEFINITION)
    enname: 'STRING',               --ALIAS FOR GROUP
    endescription: 'STRING',
    frname: 'STRING',               --ALIAS FOR GROUP
    frdescription: 'STRING',   
    status: 'STRING',
    startdate: 'DATE ISOString',
    enddate: 'DATE ISOString',
    createdon: 'DATE ISOString',
    modifiedon: 'DATE ISOString'
}
*/
exports.updateCategory = (categoryObj) => {
    return new Promise(function(resolve,reject) {
        //set modifieddon date
        var modifiedon = new Date();
        categoryObj.modifiedon = modifiedon.toISOString();

        // remove disciplineid and programid from the object
        delete categoryObj.disciplineid;
        delete categoryObj.programid;
        
        knex('tbl_categories')
        .where({ categoryid: categoryObj.categoryid })
        .update(categoryObj)
        .then(() => {
            resolve(categoryObj);
        })
        .catch((err) => {
            reject(err);
        });
    })
}


/* exports.insertSegment
Inserts new segment
REQUIRES OBJECT:
{
    categoryid: 'GUID',         --ID OF PARENT CATEGORY
    definitionid: 'GUID',       --ID OF SELECTED SEGMENT DEFINITION (REF: SC_SKATINGSEGMENTDEFINITIONS)
    enname: 'STRING',
    frname: 'STRING',
    performanceorder: INTEGER,
    programtime: 'STRING',      --FORMAT 'mm:ss'
    programhalftime: 'STRING',  --FORMAT 'mm:ss'
    warmuptime: 'STRING',       --FORMAT 'mm:ss'
    warmupnumber: INTEGER,
    wellbalanced: 'STRING',     --VALUES 'yes','no;
    reviewtime: 'STRING',        --FORMAT 'mm:ss'
    startdate: 'DATE ISOString',
    enddate: 'DATE ISOString'
}
RETURNS:
{
    segmentid: 'GUID',          --ID OF CREATED SEGMENT
    categoryid: 'GUID',         --ID OF PARENT CATEGORY
    definitionid: 'GUID',       --ID OF SELECTED SEGMENT DEFINITION (REF: SC_SKATINGSEGMENTDEFINITIONS)
    enname: 'STRING',
    frname: 'STRING',
    performanceorder: INTEGER,
    programtime: 'STRING',      --FORMAT 'mm:ss'
    programhalftime: 'STRING',  --FORMAT 'mm:ss'
    warmuptime: 'STRING',       --FORMAT 'mm:ss'
    warmupnumber: INTEGER,
    wellbalanced: 'STRING',     --VALUES 'yes','no;
    reviewtime: 'STRING',       --FORMAT 'mm:ss'
    startdate: 'DATE ISOString',
    enddate: 'DATE ISOString',
    createdon: 'DATE ISOString',
    modifiedon: 'DATE ISOString'
}
*/
var insertSegment = exports.insertSegment = (segmentObj) => {
    return new Promise(function(resolve,reject) {
        // delete mins and secs
        /*delete segmentObj.programtimemins;
        delete segmentObj.programtimesecs;
        delete segmentObj.programhalftimemins;
        delete segmentObj.programhalftimesecs;
        delete segmentObj.warmuptimemins;
        delete segmentObj.warmuptimesecs;*/
        delete segmentObj.reviewtimemins;
        delete segmentObj.reviewtimesecs;
        
        //create new uid
        segmentObj.segmentid = uuidv4();
        //set createdon date
        var createddate = new Date();
        segmentObj.createdon = createddate.toISOString();
        segmentObj.modifiedon = createddate.toISOString();
        
        knex('tbl_segments')
        .insert(segmentObj)
        .then(() => {
            resolve(segmentObj);
        })
        .catch((err) => {
            reject(err);
        });
    })
}

/* exports.insertSegments
Inserts multiple segments
REQUIRES OBJECT:
As insertSegment but wrap multiple objects in square brackets
[
]
*/
var insertSegments = exports.insertSegments = (segmentsObj,categoryObj) => {
    return new Promise(function(resolve,reject) {
        const queries = [];
        segmentsObj.forEach(segmentObj => {
            
            // build segment object
            const query = new Promise((resolve,reject) => {
                let segid = uuidv4();
                var segmentInsertObj =  {
                    segmentid: segid,
                    categoryid: categoryObj.categoryid,
                    definitionid: segmentObj.sc_skatingsegmentdefinitionsid,
                    enname: segmentObj.sc_name,
                    frname: segmentObj.sc_frenchname,
                    performanceorder: segmentObj.sc_order ? segmentObj.sc_order : 0,
                    //programtime: segmentObj.sc_programtime ? segmentObj.sc_programtime : 0,
                    //programhalftime: segmentObj.sc_programhalftime ? segmentObj.sc_programhalftime : 0,
                    //warmuptime: segmentObj.sc_warmuptime ? segmentObj.sc_warmuptime : 0,
                    warmupgroupmaxsize: segmentObj.sc_warmupgroupmaximumsize ? segmentObj.sc_warmupgroupmaximumsize : 3,
                    wellbalanced: segmentObj.sc_wellbalancedprogram ? segmentObj.sc_wellbalancedprogram : 'no',
                    reviewtime: segmentObj.sc_reviewtime ? segmentObj.sc_reviewtime : 0,
                    totalsegmentfactor: segmentObj.sc_totalsegmentfactor ? segmentObj.sc_totalsegmentfactor : 1.0,
                    patterndanceid: segmentObj.patterndanceid ? segmentObj.patterndanceid : '',
                    createdon: categoryObj.createdon,
                    modifiedon: categoryObj.modifiedon
                }
                
                resolve(insertSegment(segmentInsertObj));   
            })
            queries.push(query);
        });
        
        Promise.allSettled(queries) // Once every query is written
            .then((results) => {
                //console.log(results);
                resolve(results);
            })
            .catch((err) => {
                reject(err);
            });
    })
}

/*exports.updateSegment
Updates existing segment
REQUIRES OBJECT:
{
    segmentid: 'GUID',          --ID OF UPDATED SEGMENT
    categoryid: 'GUID',         --ID OF PARENT CATEGORY
    definitionid: 'GUID',       --ID OF SELECTED SEGMENT DEFINITION (REF: SC_SKATINGSEGMENTDEFINITIONS)
    enname: 'STRING',
    frname: 'STRING',
    performanceorder: INTEGER,
    programtime: 'STRING',      --FORMAT 'mm:ss'
    programhalftime: 'STRING',  --FORMAT 'mm:ss'
    warmuptime: 'STRING',       --FORMAT 'mm:ss'
    warmupnumber: INTEGER,
    wellbalanced: 'STRING',     --VALUES 'yes','no;
    reviewtime: 'STRING',       --FORMAT 'mm:ss'
}
RETURNS:
{
    segmentid: 'GUID',          --ID OF UPDATED SEGMENT
    categoryid: 'GUID',         --ID OF PARENT CATEGORY
    definitionid: 'GUID',       --ID OF SELECTED SEGMENT DEFINITION (REF: SC_SKATINGSEGMENTDEFINITIONS)
    enname: 'STRING',
    frname: 'STRING',
    performanceorder: INTEGER,
    programtime: 'STRING',      --FORMAT 'mm:ss'
    programhalftime: 'STRING',  --FORMAT 'mm:ss'
    warmuptime: 'STRING',       --FORMAT 'mm:ss'
    warmupnumber: INTEGER,
    wellbalanced: 'STRING',     --VALUES 'yes','no;
    reviewtime: 'STRING',       --FORMAT 'mm:ss',
    modifiedon: 'DATE ISOString'
}
*/
exports.updateSegment = (segmentObj) => {
    return new Promise(function(resolve,reject) {
        // delete mins and secs
        /*delete segmentObj.programtimemins;
        delete segmentObj.programtimesecs;
        delete segmentObj.programhalftimemins;
        delete segmentObj.programhalftimesecs;
        delete segmentObj.warmuptimemins;
        delete segmentObj.warmuptimesecs;*/
        delete segmentObj.reviewtimemins;
        delete segmentObj.reviewtimesecs;
        
        //set modifiedon date
        var modifiedon = new Date();
        segmentObj.modifiedon = modifiedon.toISOString();
        
        knex('tbl_segments')
        .where({ segmentid: segmentObj.segmentid })
        .update(segmentObj)
        .then(() => {
            resolve(segmentObj);
        })
        .catch((err) => {
            reject(err);
        });
    })
}


/*exports.insertCompetitor
Insert competitor in to segment
REQUIRES OBJECT:
{
    categoryid: 'GUID',         --ID OF PARENT CATEGORY
    competitorid: 'GUID'        --ID OF SELECTED COMPETITOR
}
RETURNS:
{
    categoryid: 'GUID',
    competitorid: 'GUID',
    createdon: 'DATE ISOString',
    modifiedon: 'DATE ISOString'
}
*/
var insertCompetitor = exports.insertCompetitor = (competitorObj) => {
    return new Promise(function(resolve,reject) {
        //set createdon date
        var createddate = new Date();
        competitorObj.createdon = createddate.toISOString();
        competitorObj.modifiedon = createddate.toISOString();
        
        //console.log(competitorObj)
        // get segments for category

        knex.select('segmentid')
        .from('tbl_segments')
        .where({ categoryid: competitorObj.categoryid })
        .then((results) => {
            results.forEach((row, index, array) => {
                let competitorentryid = uuidv4();
                
                knex('tbl_competitorentry')
                .insert({
                    competitorentryid: competitorentryid,
                    segmentid: row.segmentid,
                    sc_competitorid: competitorObj.sc_competitorid,
                    sortorder: 0,
                    createdon: competitorObj.createdon,
                    modifiedon: competitorObj.modifiedon
                })
                .then(() => {
                    // if it's the last one, get out of here!!
                    if(index === array.length-1) resolve(competitorObj);
                })
                .catch((err) => {
                    // if it's the last one, get out of here!!
                    if(index === array.length-1) resolve();
                });
            })
        })
        .catch((err) => {
            reject(err);
        });
    })
}

exports.insertCompetitors = (competitorsObj) => {
    return new Promise(function(resolve,reject) {
        const queries = [];
        competitorsObj.forEach(competitorObj => {
            const query = new Promise((resolve,reject) => {
                resolve(insertCompetitor(competitorObj));   
            })
            queries.push(query);
        });
        
        Promise.allSettled(queries) // Once every query is written
            .then((results) => {
                //console.log(results);
                resolve(results);
            })
            .catch((err) => {
                reject(err);
            });
    })
}