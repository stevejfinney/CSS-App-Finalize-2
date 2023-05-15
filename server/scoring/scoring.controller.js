const knexconfig = require('../../knexfile');
const knex = require('knex')(knexconfig.development);
const gf = require('../functions/global.functions');
//knex.raw("PRAGMA foreign_keys = ON;").then(() => {
//    console.log("Foreign Key Check activated.");
//});
const { v4: uuidv4 } = require('uuid');
const { isMetaProperty } = require('typescript');
const apiUrl = process.env.CLOUD_API_URL;


// http request / response for calculating element score on the fly
exports.httpCalculateSkateScore = (req, res) => {
    calculateSkateScore(req.params.skateid)
        .then((scoredObj) => {
            res.status(200).send(scoredObj);
        })
}

var calculateSkateScore = exports.calculateSkateScore = (skateid) => {
    // calculate the score of a skate
    //const skateid = skateid;
    return new Promise(function (resolve, reject) {
        var scoreArr = [];

        // get segment info (determines scoring type (ctc, standard), SP/FP, etc)
        getSegmentInfo(skateid)
            .then((segmentObj) => {
                console.log("step 111111", segmentObj);

                //resolve(skateObj);
                /*
                SCORING METHOD VALUES:
                947960000 = Cumulative Points Calculation (CPC)
                947960001 = Assess to Standard
                947960002 = Standard with Ranking
                */
                // get scoring method from segmentObj

                switch (segmentObj[0].scoringmethod) {
                    // Cumulative Points Calculation (CPC)
                    case 947960000:
                        getSkateInfo(skateid, segmentObj)
                            .then((skateObj) => {
                                if (skateObj.length > 0) { // skate has happened
                                    scoreCPCController(segmentObj, skateObj)
                                        .then((scoredObj) => {
                                            //resolve(scoredObj);
                                            // get total element score (grab value from last element)
                                            runningskatescore = scoredObj[(scoredObj.length - 1)].runningskatescore;
                                            scoreArr.push({ base: runningskatescore });
                                            scoreArr.push({ total: runningskatescore });

                                            programComponentScore(skateid)
                                                .then((pcScoredObj) => {

                                                    var pcScore = 0;
                                                    // commented out as total pc score now calced in function
                                                    /*pcScoredObj.forEach((element, index, array) => {
                                                        pcScore += element.score;
                                                    })
                                                    
                                                    pcScore = parseFloat(pcScore).toFixed(2);*/

                                                    pcScore = pcScoredObj[pcScoredObj.length - 1].totalpcscore;

                                                    runningskatescore = parseFloat(runningskatescore) + parseFloat(pcScore);

                                                    runningskatescore = parseFloat((runningskatescore)).toFixed(2);
                                                    scoreArr.push({ pc: pcScore });
                                                    scoreArr.push({ total: runningskatescore });

                                                    getAdjustments(skateid)
                                                        .then((adjustmentsObj) => {
                                                            // get total adjustments value
                                                            runningskatescore = parseFloat(runningskatescore) + parseFloat(adjustmentsObj.totaladjustments); // deductions is a negative so still add!!
                                                            scoreArr.push({ adjustments: adjustmentsObj.totaladjustments });
                                                            scoreArr.push({ total: runningskatescore });

                                                            // multiply total by totalsegment factor (LFACTOR)
                                                            runningskatescore = parseFloat(runningskatescore) * parseFloat(segmentObj[0].totalsegmentfactor);
                                                            scoreArr.push({ lfactor: segmentObj[0].totalsegmentfactor });
                                                            scoreArr.push({ final: runningskatescore });

                                                            // send score
                                                            //res.status(200).send(scoreArr);
                                                            pushScoreToDB(skateid, scoreArr)
                                                                .then(() => {
                                                                    resolve(scoreArr);
                                                                })
                                                        })
                                                })
                                        })
                                        .catch((err) => {
                                            console.log(err); // throw err
                                        });
                                }
                            })
                        break;

                    // Assess to Standard
                    case 947960001:
                        console.log("inside segment 000001")
                        getATSSkateInfo(skateid, segmentObj)
                            .then((skateObj) => {
                                if (skateObj.length > 0) { // skate has happened    
                                    //console.log(skateObj);
                                    getATSRules(segmentObj[0].definitionid)
                                        .then((atsObj) => {
                                            //console.log(atsObj);
                                            scoreATSController(skateid, atsObj, skateObj)
                                                .then((scoreArr1) => {
                                                    //res.status(200).send(scoreArr);
                                                    pushATSScoreToDB(skateid, scoreArr1)
                                                        .then(() => {
                                                            scoreArr.push(scoreArr1)
                                                            resolve(scoreArr);
                                                        })
                                                })
                                                .catch((err) => {
                                                    console.log(err); // throw err
                                                });
                                        })
                                        .catch((err) => {
                                            console.log(err); // throw err
                                        });
                                }
                            })
                        break;

                    // Standard with Ranking
                    case 947960002:
                        console.log("inside segment 000002")
                        getATSSkateInfo(skateid, segmentObj)
                            .then((skateObj) => {
                                if (skateObj.length > 0) { // skate has happened    
                                    scoreSWRController(skateid, segmentObj, skateObj)
                                        .then((scoredObj) => {
                                            pushATSScoreToDB(skateid, scoredObj)
                                                .then(() => {
                                                    scoreArr.push(scoredObj)
                                                    resolve(scoreArr);
                                                })
                                        })
                                        .catch((err) => {
                                            console.log(err); // throw err
                                        });
                                }
                            })
                        break;

                    // Something didn't work...
                    default:
                        //res.status(400).send('unable to score');
                        resolve('unable to score')
                }

                /*
                getSkateInfo(skateid,segmentObj)
                .then((skateObj) => {
                    if(skateObj.length > 0) { // skate has happened
                        
    
                        var runningskatescore = 0;
                        
                        switch(segmentObj[0].scoringmethod) {
    
                            // Cumulative Points Calculation (CPC)
                            case 947960000:
                                scoreCPCController(segmentObj,skateObj)
                                .then((scoredObj) => {
                                    //resolve(scoredObj);
                                    // get total element score (grab value from last element)
                                    runningskatescore = scoredObj[(scoredObj.length - 1)].runningskatescore;
                                    scoreArr.push({base:runningskatescore});
                                    scoreArr.push({total:runningskatescore});
                                    
                                    programComponentScore(skateid)
                                    .then((pcScoredObj) => {
                                        
                                        var pcScore = 0;
                                        // commented out as total pc score now calced in function
                                        pcScore = pcScoredObj[pcScoredObj.length - 1].totalpcscore;
    
                                        runningskatescore = parseFloat(runningskatescore) + parseFloat(pcScore);
                                        
                                        runningskatescore = parseFloat((runningskatescore)).toFixed(2);
                                        scoreArr.push({pc:pcScore});
                                        scoreArr.push({total:runningskatescore});
                                        
                                        getAdjustments(skateid)
                                        .then((adjustmentsObj) => {
                                            // get total adjustments value
                                            runningskatescore = parseFloat(runningskatescore) + parseFloat(adjustmentsObj.totaladjustments); // deductions is a negative so still add!!
                                            scoreArr.push({adjustments:adjustmentsObj.totaladjustments});
                                            scoreArr.push({total:runningskatescore});
                                            
                                            // multiply total by totalsegment factor (LFACTOR)
                                            runningskatescore = parseFloat(runningskatescore) * parseFloat(segmentObj[0].totalsegmentfactor);
                                            scoreArr.push({lfactor:segmentObj[0].totalsegmentfactor});
                                            scoreArr.push({final:runningskatescore});
                                            
                                            // send score
                                            //res.status(200).send(scoreArr);
                                            pushScoreToDB(skateid,scoreArr)
                                            .then(() => {
                                                resolve(scoreArr);
                                            })
                                        })
                                    })
                                })
                                .catch((err) => {
                                    console.log( err); // throw err
                                });
                                break;
                            
                            // Assess to Standard
                            case 947960001:
                                console.log('sd')
                                getATSRules(segmentObj[0].definitionid)
                                .then((atsObj) => {
                                    scoreATSController(skateid,atsObj,skateObj)
                                    .then((scoreArr) => {
                                        //res.status(200).send(scoreArr);
                                        resolve(scoreArr);
                                    })
                                    .catch((err) => {
                                        console.log( err); // throw err
                                    });
                                })
                                .catch((err) => {
                                    console.log( err); // throw err
                                });
                            
                                break;
                            
                            // Standard with Ranking
                            case 947960002:
                                
                                scoreSWRController(skateid,segmentObj,skateObj)
                                .then((scoredObj) => {
                                    // get total element score (grab value from last element)
                                    runningskatescore = scoredObj[(scoredObj.length - 1)].runningskatescore;
                                    scoreArr.push({base:runningskatescore});
                                    scoreArr.push({total:runningskatescore});
                                    
                                    //res.status(200).send(scoreArr);
                                    resolve(scoreArr);
                                })
                                .catch((err) => {
                                    console.log( err); // throw err
                                });
    
                                break;
    
                            // Something didn't work...
                            default:
                                //res.status(400).send('unable to score');
                                resolve('unable to score')
                        }
                    }
                    else {
                        //res.status(400).send(skateObj.error);
                        //reject(skateObj.error)
                        resolve('unable to score')
                    }
                })
                */
            })
            .catch((err) => {
                reject(err); // throw err
            });
    })
}

function pushScoreToDB(skateid, scoreArr) {
    return new Promise(function (resolve, reject) {

        var updateObj = {
            tes: scoreArr[0].base,
            pcs: scoreArr[2].pc,
            adj: scoreArr[4].adjustments,
            score: scoreArr[7].final
        }

        knex('tbl_competitorentry')
            .where({ competitorentryid: skateid })
            .update(updateObj)
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject(err);
            })

    })
}

function pushATSScoreToDB(skateid, scoreArr) {
    return new Promise(function (resolve, reject) {

        console.log(scoreArr)

        var updateObj = {
            score: scoreArr.final
        }

        knex('tbl_competitorentry')
            .where({ competitorentryid: skateid })
            .update(updateObj)
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject(err);
            })

    })
}


exports.httpGetScoreObj = (req, res) => {
    getScoreObj(req.params.skateid)
        .then((scoreObj) => {
            res.status(200).send(scoreObj);
        })
}

var getScoreObj = exports.getScoreObj = (skateid) => {
    return new Promise(function (resolve, reject) {
        knex('tbl_competitorentry')
            .where({ competitorentryid: skateid })
            .then((rows) => {
                resolve(rows[0]);
            })
    })
}


/*
FUNCTION TO PULL SEGMENT INFO FOR SKATE

SCORING METHOD VALUES:
947960000 = Cumulative Points Calculation (CPC)
947960001 = Assess to Standard
947960002 = Standard with Ranking
*/
function getSegmentInfo(skateid) {
    return new Promise(function (resolve, reject) {
        knex.select([
            'css_sc_programs.sc_programname as progname',
            'css_sc_skatingdisciplinedefinition.sc_name as discname',
            'css_sc_skatingcategorydefinition.sc_name as catdefname',
            'css_sc_skatingcategorydefinition.sc_scoringmethod as scoringmethod',
            'css_sc_skatingsegmentdefinitions.sc_skatingsegmentdefinitionsid as segdefid',
            'css_sc_skatingsegmentdefinitions.sc_name as segdefname',
            'css_sc_skatingsegmentdefinitions.sc_name as segdefname',
            'css_sc_skatingsegmentdefinitions.sc_programhalftime as halftimeval',
            'css_sc_skatingsegmentdefinitions.sc_halfwaybonusfactor as halfwaybonusfactor',
            'css_sc_skatingsegmentdefinitions.sc_halfwaybonuselementfamilytype as halfwaybonuselementfamilytype',
            'css_sc_skatingsegmentdefinitions.sc_halfwaybonuselementlimit as halfwaybonuselementlimit',
            'tbl_segments.*',
            'css_sc_skatingsegmentdefinitions.sc_elementconfiguration'
        ])
            .from('tbl_segments')
            .leftJoin('tbl_competitorentry', 'tbl_competitorentry.segmentid', 'tbl_segments.segmentid')
            .leftJoin('css_sc_skatingsegmentdefinitions', 'css_sc_skatingsegmentdefinitions.sc_skatingsegmentdefinitionsid', 'tbl_segments.definitionid')
            .leftJoin('css_sc_skatingcategorydefinition', 'css_sc_skatingcategorydefinition.sc_skatingcategorydefinitionid', 'css_sc_skatingsegmentdefinitions.sc_parentcategory')
            .leftJoin('css_sc_programs', 'css_sc_programs.sc_programsid', 'css_sc_skatingcategorydefinition.sc_parentprogram')
            .leftJoin('css_sc_skatingdisciplinedefinition', 'css_sc_skatingdisciplinedefinition.sc_skatingdisciplinedefinitionid', 'css_sc_skatingcategorydefinition.sc_skatingdisciplinedefinition')
            .where('tbl_competitorentry.competitorentryid', skateid)
            .then((rows) => {
                resolve(rows);
            })
            .catch((err) => {
                console.log(err); // throw err
            });
    })
}

exports.getSegmentInfoBySegment = (segmentid) => {
    return new Promise(function (resolve, reject) {
        knex.select([
            'css_sc_programs.sc_programname as progname',
            'css_sc_skatingdisciplinedefinition.sc_name as discname',
            'css_sc_skatingcategorydefinition.sc_name as catdefname',
            'css_sc_skatingcategorydefinition.sc_scoringmethod as scoringmethod',
            'css_sc_skatingsegmentdefinitions.sc_skatingsegmentdefinitionsid as segdefid',
            'css_sc_skatingsegmentdefinitions.sc_name as segdefname',
            'css_sc_skatingsegmentdefinitions.sc_name as segdefname',
            'css_sc_skatingsegmentdefinitions.sc_programhalftime as halftimeval',
            'css_sc_skatingsegmentdefinitions.sc_halfwaybonusfactor as halfwaybonusfactor',
            'css_sc_skatingsegmentdefinitions.sc_halfwaybonuselementfamilytype as halfwaybonuselementfamilytype',
            'css_sc_skatingsegmentdefinitions.sc_halfwaybonuselementlimit as halfwaybonuselementlimit',
            'tbl_segments.*',
            'css_sc_skatingsegmentdefinitions.sc_elementconfiguration'
        ])
            .from('tbl_segments')
            .leftJoin('css_sc_skatingsegmentdefinitions', 'css_sc_skatingsegmentdefinitions.sc_skatingsegmentdefinitionsid', 'tbl_segments.definitionid')
            .leftJoin('css_sc_skatingcategorydefinition', 'css_sc_skatingcategorydefinition.sc_skatingcategorydefinitionid', 'css_sc_skatingsegmentdefinitions.sc_parentcategory')
            .leftJoin('css_sc_programs', 'css_sc_programs.sc_programsid', 'css_sc_skatingcategorydefinition.sc_parentprogram')
            .leftJoin('css_sc_skatingdisciplinedefinition', 'css_sc_skatingdisciplinedefinition.sc_skatingdisciplinedefinitionid', 'css_sc_skatingcategorydefinition.sc_skatingdisciplinedefinition')
            .where('tbl_segments.segmentid', segmentid)
            .then((rows) => {
                resolve(rows);
            })
            .catch((err) => {
                console.log(err); // throw err
            });
    })
}


function getSkaterInfo(skateid) {
    return new Promise(function (resolve, reject) {
        knex.select([
            'css_sc_competitors.*'
        ])
            .from('css_sc_competitors')
            .leftJoin('tbl_competitorentry', 'tbl_competitorentry.sc_competitorid', 'css_sc_competitors.sc_competitorid')
            .where('tbl_competitorentry.competitorentryid', skateid)
            .then((skaterObj) => {
                resolve(skaterObj)
            })
    })
}
/*
FUNCTION PULLS ALL REQUIRED INFO OF SKATE AND ORGANIZES READY FOR SCORING
*/
function getSkateInfo(skateid, segmentObj) {
    return new Promise(function (resolve, reject) {
        // for each row get all judge scores and build object containing:
        // subquery to pull goe values
        var elDefId = knex.ref('tbl_skate_element.sc_skatingelementdefinitionid');
        var goeQuery = knex.raw(
            `(
            select 
                case tbl_goe.goevalue
                    when -5 then sc_goevalueminus5
                    when -4 then sc_goevalueminus4
                    when -3 then sc_goevalueminus3
                    when -2 then sc_goevalueminus2
                    when -1 then sc_goevalueminus1
                    when 0 then 0
                    when 1 then sc_goevalue1
                    when 2 then sc_goevalue2
                    when 3 then sc_goevalue3
                    when 4 then sc_goevalue4
                    when 5 then sc_goevalue5
                end
            from css_sc_skatingelementdefinition where sc_skatingelementdefinitionid = ?
            ) as goevalue`, [elDefId]);

        // subquery to get count of judge scores per skated element
        var skateelementid = knex.ref('tbl_skate_element.skateelementid');
        var judgeCountQuery = knex.raw(
            `(
            select count(goeid) from tbl_goe as go
            left join tbl_officialassignment as oa on oa.officialassignmentid = go.officialassignmentid
            where go.skateelementid = ?
            and oa.includescore = 1
            ) as judgecount`, [skateelementid]);

        var jumpCountQuery = knex.raw(
            `(
            select count(ed.sc_skatingelementdefinitionid) from css_sc_skatingelementdefinition as ed
            left join tbl_skate_element as se on se.sc_skatingelementdefinitionid = ed.sc_skatingelementdefinitionid
            left join css_sc_skatingelementfamily as ef on ef.sc_skatingelementfamilyid = ed.sc_family
            left join css_sc_skatingelementfamilytype as eft on eft.sc_skatingelementfamilytypeid = ef.sc_familytype
            where se.competitorentryid = ?
            and eft.sc_skatingelementfamilytypeid = ?
            and (se.steporder = 1 or se.steporder is null)
            ) as jumpcount`, [skateid, segmentObj[0].halfwaybonuselementfamilytype]
        )
        //console.log(
        knex.select([
            'tbl_skate_element.skateelementid',
            'css_sc_skatingelementdefinition.sc_skatingelementdefinitionid as elementdefinitionid',
            'css_sc_skatingelementdefinition.sc_abbreviatedname as elementname',
            'css_sc_skatingelementdefinition.sc_elementcode as elementcode',
            'tbl_officialassignment.sc_officialid as officialid',
            'tbl_officialassignment.position as position',
            'tbl_goe.goevalue as judgegoe',
            'css_sc_skatingelementdefinition.sc_basevalue as basevalue',
            'css_sc_skatingelementdefinition.sc_basevalue as computedbasevalue',
            goeQuery,
            'tbl_skate_element.programorder',
            'tbl_skate_element.elementcount',
            'tbl_skate_element.multitype',
            'tbl_skate_element.steporder',
            'tbl_skate_element.invalid',
            'css_sc_skatingelementfamily.sc_name as family',
            'css_sc_skatingelementfamilytype.sc_name as familytype',
            'css_sc_skatingelementfamilytype.sc_skatingelementfamilytypeid as familytypeid',
            'tbl_skate_element.halfwayflag',
            'tbl_skate_element.rep_jump',
            judgeCountQuery,
            jumpCountQuery
        ])
            .from('tbl_goe')
            .leftJoin('tbl_skate_element', 'tbl_skate_element.skateelementid', 'tbl_goe.skateelementid')
            .leftJoin('tbl_competitorentry', 'tbl_competitorentry.competitorentryid', 'tbl_skate_element.competitorentryid')
            .leftJoin('css_sc_skatingelementdefinition', 'css_sc_skatingelementdefinition.sc_skatingelementdefinitionid', 'tbl_skate_element.sc_skatingelementdefinitionid')
            .leftJoin('css_sc_skatingelementfamily', 'css_sc_skatingelementfamily.sc_skatingelementfamilyid', 'css_sc_skatingelementdefinition.sc_family')
            .leftJoin('css_sc_skatingelementfamilytype', 'css_sc_skatingelementfamilytype.sc_skatingelementfamilytypeid', 'css_sc_skatingelementfamily.sc_familytype')
            .leftJoin('tbl_officialassignment', 'tbl_officialassignment.officialassignmentid', 'tbl_goe.officialassignmentid')
            .where('tbl_competitorentry.competitorentryid', skateid)
            .andWhere('tbl_officialassignment.includescore', 1)
            .orderBy('tbl_skate_element.programorder', 'asc')
            .orderBy('tbl_skate_element.steporder', 'asc')
            .orderBy('tbl_goe.goevalue', 'desc')//.toSQL().toNative())
            .then((rows) => {
                //console.log(rows)
                // go through the object and build out into type (SINGLE/COMBO/SEQ)
                //{
                //    "programorder": <programorder>,
                //    "halfwayflag": 1,
                //    "multitype": <type>,
                //    "elements": [
                //        {
                //            "steporder": <steporder>,
                //            "skateelementid": "b2e00bae-59ee-4a23-89c7-d8b8c304279f",
                //            "elementname": "3 Flip",
                //            "basevalue": 5.3,,
                //            "computedbasevalue": 5.3,
                //            "goes": [
                //                {
                //                    "officialid": "1143d400-03be-e811-a96a-000d3a144347",
                //                    "judgegoe": -1,
                //                    "goevalue": -0.53
                //                }
                //            ]
                //        }
                //    ]
                //}
                //console.log(rows)
                var skateObj = [];
                if (rows.length > 0) {

                    var counter = 1;
                    var elementsArr = [];
                    var scoreArr = [];
                    var previousProgramOrder = 0;
                    var jumpCount = 0;
                    rows.forEach((item, index, array) => {
                        // if no steporder then set to one
                        if (!item.steporder) item.steporder = 1;

                        // if this is the first step then reset the elementsArr
                        if (item.steporder == 1) elementsArr = [];

                        // if first of this element then reset scoreArr
                        if (counter == 1) scoreArr = [];

                        // start building scoreArr
                        scoreArr.push({
                            officialid: item.officialid,
                            position: item.position,
                            judgegoe: item.judgegoe,
                            goevalue: item.invalid == 1 ? 0 : item.goevalue // if invalid score as 0
                        });
                        //console.log(scoreArr)
                        // build new element object
                        if (item.programorder != previousProgramOrder) {
                            // if we're here it's the first item of this programorder
                            // so we create the top level item in the object

                            // redo...
                            // if familytype = segment halfwaybonustype
                            // count permitted half way bonus element type
                            // count jumps
                            //if(item.familytype == 'Jump') jumpCount++;
                            if (segmentObj[0].halftimeval) { // if segment has a halftime
                                if (item.familytypeid.toLowerCase() == segmentObj[0].halfwaybonuselementfamilytype.toLowerCase()) {
                                    jumpCount++;
                                }
                            }


                            thisElement = {
                                programorder: item.programorder,
                                halfwayflag: item.halfwayflag,
                                repjump: item.rep_jump,
                                multitype: item.multitype ? item.multitype : 'SINGLE',
                                judgecount: item.judgecount,
                                jumpcount: item.jumpcount,
                                //family: item.family,
                                familytype: item.familytype ? item.familytype : NULL,
                                familytypeid: item.familytypeid ? item.familytypeid : NULL
                            };
                            // we also create the first element
                            elementsArr[item.steporder - 1] = {
                                steporder: item.steporder,
                                skateelementid: item.skateelementid,
                                elementdefinitionid: item.elementdefinitionid,
                                elementname: item.elementname,
                                elementcode: item.elementcode,
                                basevalue: item.invalid == 1 ? 0 : item.basevalue, // if invalid score as 0
                                computedbasevalue: item.invalid == 1 ? 0 : item.basevalue, // if invalid score as 0
                                invalid: item.invalid
                            }

                            // redo... permitted halfway bonus element
                            if (segmentObj[0].halftimeval) { // if segment has a halftime
                                if (thisElement.familytypeid.toLowerCase() == segmentObj[0].halfwaybonuselementfamilytype.toLowerCase()) {
                                    thisElement.thisisjump = jumpCount;
                                }
                            }

                            // if it's the last of the element then push the scores in
                            if (counter == item.judgecount) elementsArr[item.steporder - 1].goes = scoreArr;
                        }

                        if (item.programorder == previousProgramOrder) {
                            // if we're here it's another element in the programorder
                            // so we popuplate the elements array
                            elementsArr[item.steporder - 1] = {
                                steporder: item.steporder,
                                skateelementid: item.skateelementid,
                                elementdefinitionid: item.elementdefinitionid,
                                elementname: item.elementname,
                                elementcode: item.elementcode,
                                basevalue: item.invalid == 1 ? 0 : item.basevalue, // if invalid score as 0
                                computedbasevalue: item.invalid == 1 ? 0 : item.basevalue, // if invalid score as 0
                                invalid: item.invalid
                            }

                            // redo... permitted halfway bonus element
                            if (segmentObj[0].halftimeval) { // if segment has a halftime
                                if (thisElement.familytypeid.toLowerCase() == segmentObj[0].halfwaybonuselementfamilytype.toLowerCase()) {
                                    thisElement.thisisjump = jumpCount;
                                }
                            }

                            // if it's the last of the element then push the scores in
                            if (counter == item.judgecount) elementsArr[item.steporder - 1].goes = scoreArr;
                        }

                        if (item.steporder == item.elementcount) {
                            // this is the last step, save to object
                            // update what jump this is (used with elementtype)

                            // COMMENTING OUT AS THIS IS NOW SET ON DIO SCREEN
                            // check if combo / seq

                            //if(elementsArr.length == 2) {
                            //    if((elementsArr[1].family === 'Axel' || elementsArr[1].family === 'Waltz') && elementsArr[1].familytype === 'Jump') {
                            //        thisElement.multitype = 'SEQ';
                            //    }
                            //}
                            //else if(elementsArr.length >= 2) {
                            //    thisElement.multitype = 'COMBO';
                            //}
                            //else {
                            //    thisElement.multitype = 'SINGLE';
                            //}

                            thisElement.elements = elementsArr;
                            skateObj[item.programorder - 1] = thisElement;
                        }

                        if (counter != item.judgecount) counter++; else counter = 1;

                        previousProgramOrder = item.programorder;

                        if (index === rows.length - 1) resolve(skateObj);
                    })
                }
                else {
                    //resolve({error:"no goe"}); // return empty skate if no info
                    resolve(skateObj);
                }
            })
            .catch((err) => {
                console.log(err); // throw err
            });
    })
}

/*
SCORING CPC CONTROLLER
*/
function scoreCPCController(segmentObj, skateObj) {

    var returnedScore = [];

    return new Promise(function (resolve, reject) {

        if (segmentObj[0].discname.toLowerCase().includes('singles') || segmentObj[0].discname.toLowerCase().includes('pairs')) {
            //console.log('single/pairs')
            //console.log(skateObj[0].elements)
            calculateScoreCPCSinglesPairs(segmentObj[0], skateObj)
                .then((scoredObj) => {
                    resolve(scoredObj);
                })
        }
        else if (segmentObj[0].discname.toLowerCase().includes('dance')) {
            //console.log('dance')
            //console.log(skateObj[0].elements[0].goes)
            //calculateScoreCPCSinglesPairs(segmentObj[0],skateObj)
            calculateScoreCPCIceDance(segmentObj[0], skateObj)
                .then((scoredObj) => {
                    resolve(scoredObj);
                })
        }
        else {
            //console.log('other')
            //calculateScoreCPCOther(segmentObj[0],skateObj)
            calculateScoreCPCSinglesPairs(segmentObj[0], skateObj)
                .then((scoredObj) => {
                    resolve(scoredObj);
                })
        }

    })
}


/*
FUNCTION TO SCORE SINGLES/PAIRS JUNION/SENIOR SPECIFIC
*/
function calculateScoreCPCSinglesPairs(segmentObj, skateObj) {

    return new Promise(function (resolve, reject) {

        // set runningskatescore
        var runningskatescore = 0;

        // loop through each element in skate
        skateObj.forEach((element, index, array) => {

            // set basevalue
            var itemcomputedbasevalue = 0;

            // set trimmed mean
            var trimmedmean = 0;

            // set highest bv flag - used to score combos
            var highestbv = 0; // element place in array
            var prevbv = 0;

            // in SEQ, if both elements are solo jumps, multiply second jump basevalue by 0.7
            if (element.multitype == 'SEQ') {
                if (element.elements[0].elementcode.charAt(0) === '1' && element.elements[1].elementcode.charAt(0) === '1') {
                    //element.elements[1].computedbasevalue = parseFloat((element.elements[1].basevalue * 0.7)).toFixed(2);
                    element.elements[1].computedbasevalue = element.elements[1].basevalue * 0.7;
                }
            }

            // go through each item in element first pass
            // this is to get element base values, and trim hi/low judge scores, get trimmed mean
            element.elements.forEach((item, index, array) => {
                //console.log(item)
                // set elementrunningvalue
                var elementrunningvalue = 0;

                //var judgecount = element.judgecount;

                // invalid elements have zero bv
                /*if(item.invalid == 1) {
                    item.basevalue = 0
                }*/

                if (item.basevalue > prevbv) {
                    highestbv = index;
                    prevbv = item.basevalue;
                }

                // repeat jump, gets multiplied by 0.7
                if (element.repjump == 1) {
                    //item.computedbasevalue = parseFloat(item.computedbasevalue).toFixed(2) * 0.7
                    item.computedbasevalue = item.computedbasevalue * 0.7
                }

                // halfway bonus
                if (element.halfwayflag == 1 && segmentObj.halfwaybonuselementfamilytype) {
                    if ((element.familytypeid == segmentObj.halfwaybonuselementfamilytype) && (element.thisisjump > (element.jumpcount - segmentObj.halfwaybonuselementlimit))) {
                        //item.computedbasevalue = parseFloat(item.computedbasevalue) * parseFloat(segmentObj.halfwaybonusfactor);
                        item.computedbasevalue = item.computedbasevalue * segmentObj.halfwaybonusfactor;
                    }
                }

                // add all basevalues  for items in element
                //itemcomputedbasevalue = (parseFloat(itemcomputedbasevalue) + parseFloat(item.computedbasevalue));
                //itemcomputedbasevalue = parseFloat(itemcomputedbasevalue).toFixed(2);
                itemcomputedbasevalue = itemcomputedbasevalue + item.computedbasevalue;
                //console.log(item.computedbasevalue)
                //console.log(itemcomputedbasevalue)
                var judgecount = 1;

                if (typeof item.goes != "undefined") {

                    judgecount = item.goes.length;

                    // more than 4 judges, remove highest and lowest scores per element
                    if (judgecount >= 5) {
                        // remove last (highest)
                        item.goes.splice((element.judgecount - 1), 1);
                        // remove first (lowest)
                        item.goes.splice(0, 1);

                        //judgecount = judgecount - 2;
                    }
                    // grab again after splice
                    judgecount = item.goes.length;
                }

                // calculate trimmed mean for elements
                // add judge scores and get average (2dp)
                if (item.goes) {
                    item.goes.forEach((goe, index, array) => {
                        //elementrunningvalue = parseFloat(elementrunningvalue) + parseFloat(parseFloat(goe.goevalue).toFixed(2));
                        elementrunningvalue = elementrunningvalue + goe.goevalue;
                        //console.log(elementrunningvalue)
                    })
                }
                //elementrunningvalue = parseFloat(elementrunningvalue).toFixed(2);

                roundingval = elementrunningvalue / parseInt(judgecount);

                if (roundingval < 0)
                    trimmedmean = parseFloat(Math.floor(roundingval * 100) / 100).toFixed(2);
                else
                    trimmedmean = parseFloat(roundingval).toFixed(2);
                //trimmedmean = parseFloat((elementrunningvalue / parseInt(judgecount))).toFixed(2);
                //console.log(elementrunningvalue / parseInt(judgecount));
                //console.log(trimmedmean)
                item.trimmedmean = parseFloat(trimmedmean.toString());
                //console.log(item)

                //prevbv = item.basevalue;

            })

            element.elementcomputedbasevalue = itemcomputedbasevalue;
            //element.elementcomputedbasevalue = element.elements[highestbv].basevalue;

            // calculate actual element score
            // add goe from item with highest bv to overall element bv
            //console.log(element.elementcomputedbasevalue)
            //console.log(element.elements[highestbv].trimmedmean)

            //element.calculatedscore = parseFloat((parseFloat(element.elementcomputedbasevalue) + parseFloat(element.elements[highestbv].trimmedmean))).toFixed(2);
            element.calculatedscore = element.elementcomputedbasevalue + element.elements[highestbv].trimmedmean;

            //console.log(element.calculatedscore)

            //runningskatescore = parseFloat((runningskatescore + element.calculatedscore)).toFixed(2);
            runningskatescore = parseFloat(runningskatescore.toString()) + parseFloat(element.calculatedscore.toString());

            //console.log(element.calculatedscore)

            // ongoing overall score of skate (last element will have final total)
            element.runningskatescore = runningskatescore;
            element.trimmedmean = element.elements[highestbv].trimmedmean;

            //console.log(`steve added this ${element.runningskatescore}`)

            if (index === skateObj.length - 1) resolve(skateObj);
        })
    })
}

/*
FUNCTION TO SCORE ICE DANCE SPECIFIC
*/
function calculateScoreCPCIceDance(segmentObj, skateObj) {
    //console.log(segmentObj)
    return new Promise(function (resolve, reject) {

        // set runningskatescore
        var runningskatescore = 0;

        // loop through each element in skate
        skateObj.forEach((element, index, array) => {

            // set basevalue
            var itemcomputedbasevalue = 0;

            // set trimmed mean
            var trimmedmean = 0;

            // set runningtrimmedmean
            var runningtrimmedmean = 0;

            // go through each item in element first pass
            // this is to get element base values, and trim hi/low judge scores, get trimmed mean
            element.elements.forEach((item, index, array) => {

                // set elementrunningvalue
                var elementrunningvalue = 0;

                if (typeof item.goes != "undefined") {

                    var judgecount = item.goes.length;

                    if (judgecount >= 5) {
                        // remove last (highest)
                        item.goes.splice((element.judgecount - 1), 1);
                        // remove first (lowest)
                        item.goes.splice(0, 1);

                        //judgecount = judgecount -2;
                    }
                    // grab again after splice
                    judgecount = item.goes.length;
                }

                // add all basevalues  for items in element
                //itemcomputedbasevalue = (parseFloat(itemcomputedbasevalue) + parseFloat(item.computedbasevalue));
                //itemcomputedbasevalue = parseFloat(itemcomputedbasevalue).toFixed(2);

                itemcomputedbasevalue = itemcomputedbasevalue + item.computedbasevalue;

                // calculate trimmed mean for elements
                // add judge scores and get average (2dp)
                if (item.goes) {
                    item.goes.forEach((goe, index, array) => {
                        //elementrunningvalue = parseFloat(elementrunningvalue) + parseFloat(parseFloat(goe.goevalue).toFixed(2));
                        elementrunningvalue = elementrunningvalue + goe.goevalue;
                    })
                }

                //elementrunningvalue = parseFloat(elementrunningvalue).toFixed(2);

                roundingval = elementrunningvalue / parseInt(judgecount);

                if (roundingval < 0)
                    trimmedmean = parseFloat(Math.floor(roundingval * 100) / 100).toFixed(2);
                else
                    trimmedmean = parseFloat(roundingval).toFixed(2);

                //trimmedmean = parseFloat((elementrunningvalue / judgecount)).toFixed(2);
                //item.trimmedmean = trimmedmean;
                item.trimmedmean = parseFloat(trimmedmean.toString());

                runningtrimmedmean = runningtrimmedmean + item.trimmedmean;
            })

            element.elementcomputedbasevalue = itemcomputedbasevalue;
            element.trimmedmean = runningtrimmedmean;

            //element.calculatedscore = parseFloat((parseFloat(element.elementcomputedbasevalue) + parseFloat(element.trimmedmean))).toFixed(2);
            element.calculatedscore = element.elementcomputedbasevalue + element.trimmedmean;

            //runningskatescore = parseFloat((runningskatescore + element.calculatedscore)).toFixed(2);
            runningskatescore = parseFloat(runningskatescore.toString()) + parseFloat(element.calculatedscore.toString());

            // ongoing overall score of skate (last element will have final total)
            element.runningskatescore = runningskatescore;

            //console.log(skateObj)
            if (index === skateObj.length - 1) resolve(skateObj);
        })
    })
}

/*
FUNCTION TO SCORE ALL OTHER CPC SEGMENTS
*/
function calculateScoreCPCOther(segmentObj, skateObj) {
    //console.log(segmentObj)
    return new Promise(function (resolve, reject) {

        // set runningskatescore
        var runningskatescore = 0;

        // loop through each element in skate
        skateObj.forEach((element, index, array) => {

            // set basevalue
            var itemcomputedbasevalue = 0;

            // set trimmed mean
            var trimmedmean = 0;

            // set highest bv flag
            var highestbv = 0; // element place in array
            var prevbv = 0;

            var judgecount = element.judgecount;

            // go through each item in element first pass
            // this is to get element base values, and trim hi/low judge scores, get trimmed mean
            element.elements.forEach((item, index, array) => {

                // set elementrunningvalue
                var elementrunningvalue = 0;

                if (item.basevalue > prevbv) {
                    highestbv = index;
                }

                // add all basevalues  for items in element
                itemcomputedbasevalue = itemcomputedbasevalue + item.computedbasevalue;

                // more than 4 judges, remove highest and lowest scores per element
                if (judgecount >= 5) {
                    // remove last (highest)
                    item.goes.splice((element.judgecount - 1), 1);
                    // remove first (lowest)
                    item.goes.splice(0, 1);

                    judgecount = judgecount - 2;
                }

                // calculate trimmed mean for elements
                // add judge scores and get average (2dp)
                item.goes.forEach((goe, index, array) => {
                    elementrunningvalue = elementrunningvalue + goe.goevalue;
                })

                trimmedmean = parseFloat((elementrunningvalue / judgecount).toFixed(2));
                item.trimmedmean = trimmedmean;

                prevbv = item.basevalue;

            })

            element.elementcomputedbasevalue = itemcomputedbasevalue;

            // calculate actual element score
            // add goe from item with highest bv to overall element bv
            element.calculatedscore = parseFloat((element.elementcomputedbasevalue + element.elements[highestbv].trimmedmean).toFixed(2));

            runningskatescore = parseFloat((runningskatescore + element.calculatedscore).toFixed(2));

            // ongoing overall score of skate (last element will have final total)
            element.runningskatescore = runningskatescore;

            if (index === skateObj.length - 1) resolve(skateObj);
        })
    })
}


/*
programComponentScore
*/
function programComponentScore(skateid) {
    return new Promise(function (resolve, reject) {
        getProgramComponentInfo(skateid)
            .then((pcObj) => {
                calculateProgramComponentScore(pcObj)
                    .then((pcScoredObj) => {
                        resolve(pcScoredObj);
                    })
            })
    })
}

/*
FUNCTION TO GET PROGRAM COMPONENT SCORES
*/
function getProgramComponentInfo(skateid) {

    return new Promise(function (resolve, reject) {
        // get counts of PC elements (how many submitted scores)
        // subquery to get count of judge scores per skated element
        knex('tbl_programcomponent').select(knex.raw(`sc_skatingprogramcomponentdefinitionid, count(programcomponentid) as thecount`))
            .where('competitorentryid', skateid)
            .groupBy(`sc_skatingprogramcomponentdefinitionid`)
            .then((countObj) => {

                //console.log(countObj)

                // pull program component information
                //console.log(
                knex.select([
                    'tbl_programcomponent.programcomponentid as programcomponentid',
                    'tbl_programcomponent.officialassignmentid as officialassignmentid',
                    'tbl_programcomponent.sc_skatingprogramcomponentdefinitionid as sc_skatingprogramcomponentdefinitionid',
                    'css_sc_skatingprogramcomponentdefinition.sc_name as pcname',
                    'css_sc_skatingprogramcomponenttype.sc_name as pctypename',
                    'tbl_programcomponent.value as pcjudgevalue',
                    'css_sc_skatingprogramcomponentdefinition.sc_pointvalue as pcpointvalue',
                    'tbl_officialassignment.position as position'
                ])
                    .from('tbl_programcomponent')
                    .leftJoin('css_sc_skatingprogramcomponentdefinition', 'css_sc_skatingprogramcomponentdefinition.sc_skatingprogramcomponentdefinitionid', 'tbl_programcomponent.sc_skatingprogramcomponentdefinitionid')
                    .leftJoin('css_sc_skatingprogramcomponenttype', 'css_sc_skatingprogramcomponenttype.sc_skatingprogramcomponenttypeid', 'css_sc_skatingprogramcomponentdefinition.sc_pctype')
                    .leftJoin('tbl_officialassignment', 'tbl_officialassignment.officialassignmentid', 'tbl_programcomponent.officialassignmentid')
                    .where('tbl_programcomponent.competitorentryid', skateid)
                    .andWhere('tbl_officialassignment.includescore', 1) // only pull those included in score
                    .orderBy('css_sc_skatingprogramcomponentdefinition.sc_skatingprogramcomponentdefinitionid')
                    .orderBy('pcjudgevalue', 'asc')//.toSQL().toNative())
                    .then((rows) => {
                        //console.log(rows);
                        if (rows.length > 0) {
                            var prevEl = '';
                            var pcValArr = [];
                            var pcArr = [];
                            var counter = 1;

                            var pccount = 0;

                            // count number of sc_skatingprogramcomponentdefinitionid???  for loop of scores?
                            rows.forEach((element, index, array) => {

                                pccount = 0;
                                var pccountObj = {};
                                // get pccount by finding value of defid in countObj
                                pccountObj = countObj.find(({ sc_skatingprogramcomponentdefinitionid }) => sc_skatingprogramcomponentdefinitionid === element.sc_skatingprogramcomponentdefinitionid)
                                pccount = pccountObj.thecount;
                                //console.log(pccount)

                                if (element.sc_skatingprogramcomponentdefinitionid != prevEl) {
                                    // we are grouping by component so only need this once for each one
                                    thisEl = {
                                        sc_skatingprogramcomponentdefinitionid: element.sc_skatingprogramcomponentdefinitionid,
                                        pcname: element.pcname,
                                        pctypename: element.pctypename,
                                        factor: element.pcpointvalue
                                    };

                                    // drop first score in
                                    pcValArr.push({
                                        judgescore: element.pcjudgevalue,
                                        position: element.position
                                    });
                                }
                                else {
                                    // drop in other scores for matching components
                                    pcValArr.push({
                                        judgescore: element.pcjudgevalue,
                                        position: element.position
                                    });
                                }

                                if (counter == pccount) {
                                    // we are at max number for each component type so push to array
                                    thisEl.scores = pcValArr;
                                    pcArr.push(thisEl);
                                    // reset counter and scores array
                                    counter = 0;
                                    pcValArr = [];
                                }

                                prevEl = element.sc_skatingprogramcomponentdefinitionid;
                                counter++;

                                if (index === rows.length - 1) resolve(pcArr);
                            })
                        }
                        else {
                            // no pc's yet
                            resolve(pcArr);
                        }
                    })
                    .catch((err) => {
                        console.log(err); //// throw err
                    });
            })
            .catch((err) => {
                console.log(err); //// throw err
            });
    })
}

function calculateProgramComponentScore(pcObj) {

    return new Promise(function (resolve, reject) {
        //console.log(pcObj)
        var score = 0;
        scorePCObj = [];
        var totalpcscore = 0;
        if (typeof pcObj != "undefined") {

            pcObj.forEach((element, index, array) => {

                // calculate trimmed mean for each component
                var judgeCount = element.scores.length;

                var factor = element.factor;

                // more than 4 judges, remove highest and lowest scores per element
                if (judgeCount >= 5) {
                    // remove last (highest)
                    element.scores.splice((judgeCount - 1), 1);
                    // remove first (lowest)
                    element.scores.splice(0, 1);
                }

                // get this again if it's been trimmed
                judgeCount = element.scores.length;

                // multiply each judge pc x factor
                var sum = 0;
                var trimmedmean = 0;

                // get trimmed mean for each element
                element.scores.forEach((item, index, array) => {
                    sum += item.judgescore;
                })


                roundingval = sum / judgeCount;

                // code ensures rounding away from zero whether pos or neg
                if (roundingval < 0)
                    trimmedmean = parseFloat(Math.floor(roundingval * 100) / 100).toFixed(2);
                else
                    trimmedmean = parseFloat(roundingval).toFixed(2);

                //trimmedmean = parseFloat(sum / judgeCount).toFixed(2);

                // multiply trimmed mean by factor
                //score = parseFloat((parseFloat(trimmedmean) * parseFloat(factor))).toFixed(2);
                score = trimmedmean * factor;

                //score = parseFloat(score.toString()).toFixed(2);

                totalpcscore += score

                scorePCObj.push({
                    id: element.sc_skatingprogramcomponentdefinitionid,
                    name: element.pctypename,
                    score: parseFloat(score).toFixed(2),
                    totalpcscore: parseFloat(totalpcscore).toFixed(2),
                    trimmedmean: trimmedmean
                });

                if (index === pcObj.length - 1) resolve(scorePCObj);
            })
        }
        else {
            // no pc's yet so return 0
            resolve(scorePCObj);
        }
    })
}


function calculateDetailedProgramComponentScore(pcObj) {

    return new Promise(function (resolve, reject) {
        var scoreObj = [];
        var score = 0;
        if (typeof pcObj != "undefined") {

            pcObj.forEach((element, index, array) => {

                // calculate trimmed mean for each component
                var judgeCount = element.scores.length;

                var factor = element.factor;

                // more than 4 judges, remove highest and lowest scores per element
                if (judgeCount >= 5) {
                    // remove last (highest)
                    element.scores.splice((judgeCount - 1), 1);
                    // remove first (lowest)
                    element.scores.splice(0, 1);
                }

                // get this again if it's been trimmed
                judgeCount = element.scores.length;

                // multiply each judge pc x factor
                var sum = 0;
                var trimmedmean = 0;

                // get trimmed mean for each element
                element.scores.forEach((item, index, array) => {
                    sum += item.judgescore;
                })

                trimmedmean = parseFloat(sum / judgeCount).toFixed(2);

                // multiply trimmed mean by factor
                score = parseFloat((parseFloat(trimmedmean) * parseFloat(factor))).toFixed(2);

                scoreObj[index] = {
                    sc_skatingprogramcomponentdefinitionid: element.sc_skatingprogramcomponentdefinitionid,
                    pctypename: element.pctypename,
                    pcscore: score
                }

                if (index === pcObj.length - 1) resolve(scoreObj);
                //if(index === pcObj.length-1) resolve({runningpcscore:element.runningpcscore});
            })
        }
        else {
            // no pc's yet so return 0
            resolve(scoreObj);
        }
    })
}


// BONUSES AND DEDUCTIONS
function getAdjustments(skateid) {

    return new Promise(function (resolve, reject) {

        knex.select([
            'tbl_adjustments.*',
            'css_sc_skatingadjustmentassociation.sc_maximumapplications as sc_maximumapplications',
            'css_sc_skatingadjustmentassociation.sc_pointvalue as sc_pointvalue',
            'css_sc_skatingadjustmentdefinition.sc_skatingadjustmentdefinitionid as sc_skatingadjustmentdefinitionid',
            'css_sc_skatingadjustmentdefinition.sc_name as adjustmentenname',
            'css_sc_skatingadjustmentdefinition.sc_frenchname as adjustmentfrname'
        ])
            .from('tbl_adjustments')
            .leftJoin('css_sc_skatingadjustmentassociation', 'css_sc_skatingadjustmentassociation.sc_skatingadjustmentassociationid', 'tbl_adjustments.sc_skatingadjustmentassociationid')
            .leftJoin('css_sc_skatingadjustmentdefinition', 'css_sc_skatingadjustmentdefinition.sc_skatingadjustmentdefinitionid', 'css_sc_skatingadjustmentassociation.sc_adjustmentdefinition')
            .where('tbl_adjustments.competitorentryid', skateid)
            .orderBy('tbl_adjustments.sc_skatingadjustmentassociationid', 'asc')
            .then((rows) => {
                //console.log(rows)
                var adjustObj = [];
                if (rows.length > 0) {
                    var totalAdjustments = 0;
                    var totalDeductions = 0;
                    var totalBonuses = 0;
                    var prevAdj = '';
                    var sameCount = 1;
                    adjustObj = [];
                    var thisvalue = 0;
                    rows.forEach((element, index, array) => {

                        // check adjustment type can't go above maximum applications value for that adjustment
                        if (prevAdj === element.sc_skatingadjustmentassociationid && element.sc_maximumapplications !== null) {
                            sameCount++;
                            if (sameCount <= element.sc_maximumapplications) {
                                thisvalue = element.value * element.sc_pointvalue;
                                totalAdjustments += thisvalue;
                                if (thisvalue < 0)
                                    totalDeductions += thisvalue;
                                else
                                    totalBonuses += thisvalue;
                            }
                        }
                        else {
                            thisvalue = element.value * element.sc_pointvalue;
                            totalAdjustments += thisvalue;

                            if (thisvalue < 0)
                                totalDeductions += thisvalue;
                            else
                                totalBonuses += thisvalue;

                            sameCount = 1; // reset this to 1 as we have different adjustment to previous checked
                        }

                        adjustObj.push({
                            enname: element.adjustmentenname,
                            frname: element.adjustmentfrname,
                            value: element.sc_pointvalue,
                            quantity: element.value,
                            score: thisvalue
                        })

                        prevAdj = element.sc_skatingadjustmentassociationid;

                        if (index === rows.length - 1) resolve({
                            details: adjustObj,
                            totaladjustments: totalAdjustments,
                            deductions: totalDeductions,
                            bonuses: totalBonuses
                        });
                    })
                }
                else {
                    resolve({ details: adjustObj, totaladjustments: 0 });
                }
            })
            .catch((err) => {
                console.log(err); // throw err
            });
    })
}

/*
GET AND ORGANIZE ATS SKATE
Assess To Standard
*/
function getATSSkateInfo(skateid, segmentObj) {
    return new Promise(function (resolve, reject) {
        knex.select([
            'tbl_skate_element.skateelementid',
            'tbl_skate_element.sc_skatingelementdefinitionid',
            'tbl_skate_element.programorder',
            'tbl_skate_element.ratingtype',
            'css_sc_skatingelementdefinition.sc_elementcode',
            'css_sc_skatingelementdefinition.sc_basevalue'
        ])
            .from('tbl_skate_element')
            .leftJoin('css_sc_skatingelementdefinition', 'css_sc_skatingelementdefinition.sc_skatingelementdefinitionid', 'tbl_skate_element.sc_skatingelementdefinitionid')
            .where('tbl_skate_element.competitorentryid', skateid)
            .then((rows) => {
                resolve(rows);
            })

    })
}

/*
Assess To Standard RULES FUNCTION
Pulls details of ATS rules for segment
*/
function getATSRules(segmentid) {

    return new Promise(function (resolve, reject) {

        // convert criteria integer to actual text, and add integer to start of string so can sort
        var criterionText = knex.raw(
            `case
            when sc_criterionlevel = 947960000 then '3-Bronze'
            when sc_criterionlevel = 947960001 then '2-Silver'
            when sc_criterionlevel = 947960002 then '1-Gold'
            when sc_criterionlevel = 947960003 then '4-Successful'
            end as criteria`)

        knex.select([
            '*',
            criterionText
        ])
            .from('css_sc_skatingstandardscriteria')
            .where('sc_segment', segmentid)
            .orderBy('criteria', 'asc')
            .then((rows) => {
                resolve(rows);
            })
            .catch((err) => {
                console.log(err); // throw err
            });
    })
}

function scoreATSController(skateid, atsObj, skateObj) {

    return new Promise(function (resolve, reject) {

        /*
        3 - Gold
        2 - Silver
        1 - Bronze
        0 - ???
        */
        getSTARAwardCounts(skateObj, atsObj)
            .then((awardObj) => {
                //console.log(awardObj)
                // we have rules and count of awards, so we can calculate overall assessment
                getFinalAssessment(atsObj, awardObj)
                    .then((scoredObj) => {
                        resolve(scoredObj);
                    })
                    .catch((err) => {
                        console.log(err); // throw err
                    });
            })
            .catch((err) => {
                console.log(err); // throw err
            });
    })

}


function getSTARAwardCounts(skateObj, atsObj) {

    return new Promise(function (resolve, reject) {

        /*
        SC_RULETYPE VALUES:
        947960000 - Count Rating Values
        947960001 - Specific Element Rating Value
        947960002 - Count Rating Values (Hierarchical)
        947960003 - Specific Element Rating Value (Hierarchical)
        */

        var goldCount = 0;
        var silverCount = 0;
        var bronzeCount = 0;
        var successCount = 0;

        // grab rules that check for specific element
        var elementCheckObj = atsObj.filter(item => (item.sc_ruletype === 947960003 || item.sc_ruletype === 947960001));
        var pcObj = [];
        var pcInt = 0;
        var isPass = 0;

        // count ratings
        skateObj.forEach((element, index, array) => {
            switch (element.ratingtype) {
                case 947960002:
                    goldCount++;
                    break;
                case 947960001:
                    silverCount++;
                    break;
                case 947960000:
                    bronzeCount++;
                    break;
                default:
                    successCount++
            }

            // check pc
            // also check for specific pc rules
            // look in elementCheckObj for sc_targetelement
            elementCheckObj.find(function (el, index) {
                if (el.sc_targetelement === element.sc_skatingelementdefinitionid) {

                    // test if pass / fail - if score greater or equal then targetrating its a pass
                    if (element.ratingtype >= el.sc_targetrating)
                        isPass = 1;
                    else
                        isPass = 0;

                    // add it to the prog comp object
                    pcObj.push({ pctype: element.elementcode, levelrequired: el.sc_targetrating, levelachieved: element.ratingtype, pass: isPass });
                    return true;
                }
            })

            if (index === skateObj.length - 1) resolve({ gold: goldCount, silver: silverCount, bronze: bronzeCount, successful: successCount, progcomps: pcObj });
        })



        /* old code */
        /*
        // go through skateObj
        skateObj.forEach((element, index, array) => {
            
            // count gold / silver / bronze / successful
            switch(element.elements[0].goes[0].judgegoe) { // only one set of goe's and only one element in each step
                case 3:
                    goldCount++;
                    break;
                case 2:
                    silverCount++;
                    break;
                case 1:
                    bronzeCount++;
                    break;
                default:
                    successCount++;
            }

            // also check for specific pc rules
            // look in elementCheckObj for sc_targetelement
            elementCheckObj.find(function(el,index) {
                if(el.sc_targetelement === element.elements[0].elementdefinitionid) {
                    
                    // convert targetrating to integer to match goe (previously criterionlevel??)
                    switch(el.sc_targetrating) { // we're looking to be this or better
                        case 947960002: // gold
                            pcInt = 3;
                            break;
                        case 947960001: // silver
                            pcInt = 2;
                            break;
                        case 947960000: // bronze
                            pcInt = 1;
                            break;
                        case 947960003: // else
                        default:
                            pcInt = 0;
                    }

                    // test if pass / fail - if score greater or equal then targetrating its a pass
                    if(element.elements[0].goes[0].judgegoe >= pcInt)
                        isPass = 1;
                    else
                        isPass = 0;

                    // add it to the prog comp object
                    pcObj.push({pctype:element.elements[0].elementcode,levelrequired:pcInt,levelachieved:element.elements[0].goes[0].judgegoe,pass:isPass});
                    return true;
                }
            })
            
            if(index === skateObj.length-1) resolve({gold:goldCount,silver:silverCount,bronze:bronzeCount,successful:successCount,progcomps:pcObj});
        })
        */
    })
}

function getFinalAssessment(atsObj, awardObj) {
    // get params from atsObj
    /*
    sc_criterionlevel:
    947960000 = 'Bronze'
    947960001 = 'Silver'
    947960002 = 'Gold'
    947960003 = 'Successful'

    sc_ruletype:
    947960000 = 'Count Rating Values'
    947960001 = 'Specific Element Rating Value'
    947960002 = 'Count Rating Values (Hierarchical)'
    947960003 = 'Specific Element Rating Value (Hierarchical)'

    sc_requiredcounttype:
    947960000 = 'Minimum' - count must be at least this value
    947960001 = 'Maximum' - count must be no more than this value
    */

    var goldPass = false;
    var silverPass = false;
    var bronzePass = false;
    var successPass = false;
    var pcGoldPass = false;
    var pcSilverPass = false;
    var pcBronzePass = false;
    var pcSuccessPass = false;
    var final = '';

    // get count of prog comps
    var numPc = awardObj.progcomps.length;

    //debugging
    //awardObj.gold = 7;
    //awardObj.silver = 7;


    return new Promise(function (resolve, reject) {
        //console.log(awardObj)
        //console.log(atsObj)
        atsObj.forEach((element, index, array) => {

            // go through each criteria and check if true
            // 'count value' rule types
            if (element.sc_ruletype == 947960000 || element.sc_ruletype == 947960002) {
                // get criterion string
                switch (element.sc_criterionlevel) {
                    case 947960002:
                        switch (element.sc_requiredcounttype) {
                            case 947960000:
                                if (awardObj.gold >= element.sc_requiredcount) goldPass = true;
                                break;
                            case 947960001:
                                if (awardObj.gold <= element.sc_requiredcount) goldPass = true;
                                break;
                        }
                        break;
                    case 947960001:
                        switch (element.sc_requiredcounttype) {
                            case 947960000:
                                if (awardObj.silver >= element.sc_requiredcount) silverPass = true;
                                break;
                            case 947960001:
                                if (awardObj.silver <= element.sc_requiredcount) silverPass = true;
                                break;
                        }
                        break;
                    case 947960000:
                        switch (element.sc_requiredcounttype) {
                            case 947960000:
                                if (awardObj.bronze >= element.sc_requiredcount) bronzePass = true;
                                break;
                            case 947960001:
                                if (awardObj.bronze <= element.sc_requiredcount) bronzePass = true;
                                break;
                        }
                        break;
                    case 947960003:
                    default:
                        successPass = true;
                }
            }

            // 'specific element' rule types
            if (element.sc_ruletype == 947960001 || element.sc_ruletype == 947960003) {

                awardObj.progcomps.forEach((pcEl, index, array) => {

                    //debugging
                    //pcEl.pass = 0;

                    switch (element.sc_criterionlevel) {
                        case 947960002:
                            if (pcEl.pass == 0) // if failed then set gold pass to false
                                goldPass = false;
                            break;
                        case 947960001:
                            if (pcEl.pass == 0) // if failed then set gold pass to false
                                silverPass = false;
                            break;
                        case 947960000:
                            if (pcEl.pass == 0) // if failed then set gold pass to false
                                bronzePass = false;
                            break;
                        case 947960003:
                        default:
                            successPass = true;
                    }
                })
            }

            if (index === atsObj.length - 1) {
                /*
                if(goldPass && (numPc > 0 && pcGoldPass)) final = 'gold'
                if(silverPass && final == '' && (numPc && pcSilverPass)) final = 'silver'
                if(bronzePass && final == '' && (numPc && pcBronzePass)) final = 'bronze'
                if(final == '') final = 'successful'
                */

                /*if(goldPass) final = 'gold'
                if(silverPass && final == '') final = 'silver'
                if(bronzePass && final == '') final = 'bronze'
                if(final == '') final = 'successful'*/

                if (goldPass) final = 947960002
                if (silverPass && final == '') final = 947960001
                if (bronzePass && final == '') final = 947960000
                if (final == '') final = 947960005

                resolve({ final: final });
            }
        })


    })
}

/*
SCORING SWR CONTROLLER
*/
function scoreSWRController(skateid, segmentObj, skateObj) {

    var returnedScore = [];

    return new Promise(function (resolve, reject) {

        calculateScoreSWR(segmentObj[0], skateObj)
            .then((scoredObj) => {
                resolve(scoredObj);
            })
    })
}

/*
FUNCTION TO SCORE STANDARD WITH RANKING (LIKE CPC) SEGMENTS

SCORED SIMILAR TO ATS (G,S,B) BUT RANKED HOW?

PROGRAM COMPONENTS ARE TREATED IN SAME WAY AS SKATING ELEMENTS SO NO EXTRA PROCESSING REQUIRED
*/
function calculateScoreSWR(segmentObj, skateObj) {
    //console.log(segmentObj)
    return new Promise(function (resolve, reject) {

        // set runningskatescore
        var runningskatescore = 0;

        // loop through each element in skate
        skateObj.forEach((element, index, array) => {

            var elscore = 0;
            var elrating = 0;
            // for each skate element, add bv and rating

            // scores for g / s / b
            switch (element.ratingtype) {
                case 947960002: // gold
                    elrating = 3;
                    break;
                case 947960001: // silver
                    elrating = 2;
                    break;
                case 947960000: // bronze
                    elrating = 1;
                    break;
                case 947960003: // anything else
                default:
                    elrating = 0;
            }

            element.rating = elrating;
            elscore = element.sc_basevalue + elrating;

            // calculate actual element score
            // add goe from item with highest bv to overall element bv
            element.calculatedscore = parseFloat(elscore.toFixed(2));

            runningskatescore = parseFloat((runningskatescore + element.calculatedscore).toFixed(2));

            // ongoing overall score of skate (last element will have final total)
            element.runningskatescore = runningskatescore;

            if (index === skateObj.length - 1) resolve({ final: runningskatescore });
        })
    })
}


exports.getElementById = (req, res) => {
    knex.select(
        'sc_longname',
        'sc_longnamefrench'
    )
        .from('css_sc_skatingelementdefinition')
        .where({ sc_skatingelementdefinitionid: req.params.elementid })
        .then((rows) => {
            rows.forEach((row, index, array) => {
                // build languages object
                row.languages = {
                    'en': {
                        name: row.sc_longname
                    },
                    'fr': {
                        name: row.sc_longnamefrench
                    }
                };

                // remove other language fields
                delete row.sc_longname;
                delete row.sc_longnamefrench;

                if (index === array.length - 1) {
                    res.status(200).send(rows);
                }
            });
        })
        .catch((err) => {
            console.log(err); // throw err
        })
}

// http request / response for calculating element score on the fly
exports.httpCalculateElementScore = (req, res) => {
    calculateElementScore(req.params.skateelementid)
        .then((scoredObj) => {
            res.status(200).send(scoredObj);
        })
}

var calculateElementScore = exports.calculateElementScore = (skateelementid) => {

    return new Promise(function (resolve, reject) {
        var scoreArr = [];
        // get competitorentryid
        knex('competitorentryid').from('tbl_skate_element').where('skateelementid', skateelementid)
            .then((rows) => {
                getSegmentInfo(rows[0].competitorentryid) // get segment info
                    .then((segmentObj) => {
                        getElementInformation(skateelementid, segmentObj) // get programorder, element count for this elementid
                            .then((elementObj) => {
                                //resolve(elementObj)
                                if (elementObj.length > 0) { // we have goes...
                                    scoreCPCController(segmentObj, elementObj)
                                        .then((scoredObj) => {
                                            //console.log(scoredObj[0].elements[0].goes)
                                            // get total element score (grab value from last element)
                                            //console.log(elementObj)
                                            runningskatescore = parseFloat(parseFloat(scoredObj[(scoredObj.length - 1)].runningskatescore).toFixed(2));
                                            scoreArr.push({
                                                basevalue: parseFloat(scoredObj[0].elementcomputedbasevalue),
                                                trimmedmean: parseFloat(scoredObj[0].trimmedmean),
                                                calculatedscore: runningskatescore,
                                                skateelementid: skateelementid
                                            });
                                            resolve(scoreArr);
                                        })
                                }
                                else { // we don't have goes...
                                    // get basevalue
                                    getBasevalue(segmentObj, skateelementid)
                                        .then((rows) => {
                                            scoreArr.push({
                                                basevalue: rows.basevalue,
                                                trimmedmean: 0,
                                                calculatedscore: 0,
                                                skateelementid: skateelementid
                                            });
                                            resolve(scoreArr);
                                        })
                                }
                            })
                    })
            })
    })
}

function getBasevalue(segmentObj, elementid) {
    return new Promise(function (resolve, reject) {
        knex.select([
            't2.programorder',
            't2.steporder',
            't2.elementcount',
            't2.halfwayflag',
            't2.invalid',
            'css_sc_skatingelementdefinition.sc_basevalue as basevalue',
            't2.competitorentryid'
        ])
            .from('tbl_skate_element as t1')
            .leftJoin('tbl_skate_element as t2', function () {
                this
                    .on('t2.competitorentryid', '=', 't1.competitorentryid')
                    .andOn('t2.programorder', '=', 't1.programorder')
            })
            .leftJoin('css_sc_skatingelementdefinition', 'css_sc_skatingelementdefinition.sc_skatingelementdefinitionid', 't2.sc_skatingelementdefinitionid')
            .where('t1.skateelementid', elementid)
            .orderBy('t2.steporder', 'asc')
            .then((rows) => {
                var bv = 0;
                rows.forEach((row, index, array) => {
                    // use segmentobj to get halfway calcs
                    bv = bv + row.basevalue;
                    if (index === array.length - 1) resolve({ basevalue: parseFloat(bv.toFixed(2)) })
                })
            })
    })
}

function getElementInformation(elementid, segmentObj) {
    return new Promise(function (resolve, reject) {

        // get GOEs for element
        // subquery to pull goe values
        var elDefId = knex.ref('t2.sc_skatingelementdefinitionid');
        var selectedgoevalue = knex.raw(
            `(
            select 
                case tbl_goe.goevalue
                    when -5 then sc_goevalueminus5
                    when -4 then sc_goevalueminus4
                    when -3 then sc_goevalueminus3
                    when -2 then sc_goevalueminus2
                    when -1 then sc_goevalueminus1
                    when 0 then 0
                    when 1 then sc_goevalue1
                    when 2 then sc_goevalue2
                    when 3 then sc_goevalue3
                    when 4 then sc_goevalue4
                    when 5 then sc_goevalue5
                end
            from css_sc_skatingelementdefinition where sc_skatingelementdefinitionid = ?
            ) as goevalue`, [elDefId]);

        // subquery to get count of judge scores per skated element
        var skateelementid = knex.ref('t2.skateelementid');
        var judgeCountQuery = knex.raw(
            `(
            select count(goeid) from tbl_goe as go
            left join tbl_officialassignment as oa on oa.officialassignmentid = go.officialassignmentid
            where go.skateelementid = ?
            and oa.includescore = 1
            ) as judgecount`, [skateelementid]);

        //console.log(
        knex.select([
            't2.programorder',
            't2.steporder',
            't2.elementcount',
            't2.halfwayflag',
            't2.rep_jump',
            't2.invalid',
            'css_sc_skatingelementdefinition.sc_basevalue as basevalue',
            selectedgoevalue,
            'tbl_goe.goevalue as judgegoe',
            judgeCountQuery,
            't2.competitorentryid',
            'css_sc_skatingelementfamily.sc_name as family',
            'css_sc_skatingelementfamilytype.sc_name as familytype',
            'css_sc_skatingelementfamilytype.sc_skatingelementfamilytypeid as familytypeid'
        ])
            .from('tbl_skate_element as t1')
            .leftJoin('tbl_skate_element as t2', function () {
                this
                    .on('t2.competitorentryid', '=', 't1.competitorentryid')
                    .andOn('t2.programorder', '=', 't1.programorder')
            })
            .leftJoin('css_sc_skatingelementdefinition', 'css_sc_skatingelementdefinition.sc_skatingelementdefinitionid', 't2.sc_skatingelementdefinitionid')
            .leftJoin('tbl_goe', 'tbl_goe.skateelementid', 't2.skateelementid')
            .leftJoin('css_sc_skatingelementfamily', 'css_sc_skatingelementfamily.sc_skatingelementfamilyid', 'css_sc_skatingelementdefinition.sc_family')
            .leftJoin('css_sc_skatingelementfamilytype', 'css_sc_skatingelementfamilytype.sc_skatingelementfamilytypeid', 'css_sc_skatingelementfamily.sc_familytype')
            .leftJoin('tbl_officialassignment', 'tbl_officialassignment.officialassignmentid', 'tbl_goe.officialassignmentid')
            .where('t1.skateelementid', elementid)
            .andWhere('tbl_officialassignment.includescore', 1)
            .orderBy('t2.steporder', 'asc')
            .orderBy('goevalue', 'asc')//.toSQL().toNative())
            .then((rows) => {
                var skateObj = [];
                //console.log(rows)
                if (rows.length > 0) {
                    var counter = 1;
                    var elementsArr = [];
                    var scoreArr = [];
                    var previousProgramOrder = 0;
                    var jumpCount = 0;

                    var jumpHTObj = [];
                    // this contains jumpcount & thisisjump for element as it stands in current skate progress

                    // get half time infor
                    getJumpHalfTimeDetails(elementid, segmentObj[0].halfwaybonuselementfamilytype)
                        .then((htrows) => {
                            jumpHTObj = htrows;
                            //jumpHTObj = {jumpcount:0,thisisjump:0}

                            rows.forEach((item, index, array) => {
                                // if no steporder then set to one
                                if (!item.steporder) item.steporder = 1;

                                // if this is the first step then reset the elementsArr
                                if (item.steporder == 1) elementsArr = [];

                                // if first of this element then reset scoreArr
                                if (counter == 1) scoreArr = [];

                                // start building scoreArr
                                scoreArr.push({
                                    judgegoe: item.judgegoe,
                                    goevalue: item.invalid == 1 ? 0 : item.goevalue // if invalid score as 0
                                });

                                // build new element object
                                if (item.programorder != previousProgramOrder) {
                                    // if we're here it's the first item of this programorder
                                    // so we create the top level item in the object

                                    // count jumps
                                    /*if(segmentObj[0].halftimeval && item.halfwayflag) { // if segment has a halftime
                                        if(item.familytypeid.toLowerCase() == segmentObj[0].halfwaybonuselementfamilytype.toLowerCase()) {
                                            //jumpHTObj[0] = getJumpHalfTimeDetails(elementid,item.competitorentryid,segmentObj[0].halfwaybonuselementfamilytype);
                                            //var jumpHTobj = asyncGetJumpHalfTimeDetails(elementid,item.competitorentryid,segmentObj[0].halfwaybonuselementfamilytype)
                                            //console.log('h1',jumpHTObj)
                                            (async () => console.log(await asyncGetJumpHalfTimeDetails(elementid,item.competitorentryid,segmentObj[0].halfwaybonuselementfamilytype)))()
                                        }
                                    }*/

                                    thisElement = {
                                        programorder: item.programorder,
                                        halfwayflag: item.halfwayflag,
                                        repjump: item.rep_jump,
                                        //multitype: item.multitype ? item.multitype : 'SINGLE',
                                        judgecount: item.judgecount,
                                        //jumpcount: item.jumpcount,
                                        //family: item.family,
                                        familytype: item.familytype ? item.familytype : NULL,
                                        familytypeid: item.familytypeid ? item.familytypeid : NULL,
                                        competitorentryid: item.competitorentryid
                                    };
                                    // we also create the first element
                                    elementsArr[item.steporder - 1] = {
                                        steporder: item.steporder,
                                        //skateelementid: item.skateelementid,
                                        //elementdefinitionid: item.elementdefinitionid,
                                        //elementname: item.elementname,
                                        //elementcode: item.elementcode,
                                        basevalue: item.invalid == 1 ? 0 : item.basevalue, // if invalid score as 0
                                        computedbasevalue: item.invalid == 1 ? 0 : item.basevalue,
                                        //family: item.family,
                                        //familytype: item.familytype
                                        invalid: item.invalid
                                    }

                                    // redo... permitted halfway bonus element
                                    if (segmentObj[0].halftimeval && item.halfwayflag) { // if segment has a halftime
                                        if (thisElement.familytypeid.toLowerCase() == segmentObj[0].halfwaybonuselementfamilytype.toLowerCase()) {
                                            thisElement.thisisjump = jumpHTObj.thisisjump;
                                            thisElement.jumpcount = jumpHTObj.jumpcount;
                                        }
                                    }

                                    // if it's the last of the element then push the scores in
                                    if (counter == item.judgecount) elementsArr[item.steporder - 1].goes = scoreArr;
                                }

                                if (item.programorder == previousProgramOrder) {
                                    // if we're here it's another element in the programorder
                                    // so we popuplate the elements array
                                    elementsArr[item.steporder - 1] = {
                                        steporder: item.steporder,
                                        //skateelementid: item.skateelementid,
                                        //elementdefinitionid: item.elementdefinitionid,
                                        //elementname: item.elementname,
                                        //elementcode: item.elementcode,
                                        basevalue: item.invalid == 1 ? 0 : item.basevalue,
                                        computedbasevalue: item.invalid == 1 ? 0 : item.basevalue,
                                        //family: item.family,
                                        //familytype: item.familytype
                                        invalid: item.invalid
                                    }

                                    // redo... permitted halfway bonus element
                                    if (segmentObj[0].halftimeval && item.halfwayflag) { // if segment has a halftime
                                        if (thisElement.familytypeid.toLowerCase() == segmentObj[0].halfwaybonuselementfamilytype.toLowerCase()) {
                                            //thisElement.thisisjump = jumpHTObj.thisisjump;
                                            //thisElement.jumpcount = jumpHTObj.jumpcount;
                                        }
                                    }

                                    // if it's the last of the element then push the scores in
                                    if (counter == item.judgecount) elementsArr[item.steporder - 1].goes = scoreArr;
                                }

                                if (item.steporder == item.elementcount) {
                                    // this is the last step, save to object


                                    // COMMENTING OUT AS THIS IS NOW SET ON DIO SCREEN
                                    // check if combo / seq

                                    //if(elementsArr.length == 2) {
                                    //    if((elementsArr[1].family === 'Axel' || elementsArr[1].family === 'Waltz') && elementsArr[1].familytype === 'Jump') {
                                    //        thisElement.multitype = 'SEQ';
                                    //    }
                                    //}
                                    //else if(elementsArr.length >= 2) {
                                    //    thisElement.multitype = 'COMBO';
                                    //}
                                    //else {
                                    //    thisElement.multitype = 'SINGLE';
                                    //}

                                    thisElement.elements = elementsArr;
                                    // we are only returning for one element so this...
                                    skateObj[0] = thisElement;
                                    // and not this (as in actual scoring code)...
                                    //skateObj[item.programorder-1] = thisElement;
                                }

                                if (counter != item.judgecount) counter++; else counter = 1;

                                previousProgramOrder = item.programorder;

                                if (index === rows.length - 1) {
                                    //console.log(skateObj)
                                    resolve(skateObj);
                                }
                            })
                        })

                    //
                    //var judgecount = rows[0].judgecount
                    //var scorejudgecount = judgecount;

                    //if(judgecount >= 5) {
                    //    // remove last (highest)
                    //    rows.splice(judgecount - 1,1);
                    //    // remove first (lowest)
                    //    rows.splice(0,1);
                    //    scorejudgecount = judgecount - 2;
                    //}

                    //var total = 0;
                    //var mean = 0;

                    //rows.forEach((item, index, array) => {
                    //    total = total + item.calcgoevalue;
                    //})

                    //total = total.toFixed(2);

                    //if(total > 0)
                    //    mean = (total/scorejudgecount).toFixed(2);

                    ////rows.push({total:total,mean:mean});
                    //res.status(200).send(rows);

                    //// return skatelementid, mean goe
                    ////res.status(200).send({skatelementid:req.params.skateelementid,mean:mean});

                }
                else {
                    resolve(skateObj);
                }
            })
    })
}

exports.calculatePCScore = (req, res) => {

    // have skateid, pull running PC score
    programComponentScore(req.params.skateid)
        .then((pcScoredObj) => {
            pcScoredObj.competitorentryid = req.params.skateid;
            res.status(200).send(pcScoredObj);
        })

}


function getJumpHalfTimeDetails(elementid, familytypeid) {

    return new Promise(function (resolve, reject) {

        var jumpcount = 0;
        var thisisjump = 0;
        var prevprogord = 0;
        // get HT info for current progress
        knex.select([
            'se2.skateelementid',
            'se2.programorder',
            'se2.elementcount',
            'se2.steporder'
        ])
            .from('tbl_skate_element as se1')
            .leftJoin('tbl_skate_element as se2', 'se2.competitorentryid', 'se1.competitorentryid')
            .leftJoin('css_sc_skatingelementdefinition', 'css_sc_skatingelementdefinition.sc_skatingelementdefinitionid', 'se2.sc_skatingelementdefinitionid')
            .leftJoin('css_sc_skatingelementfamily', 'css_sc_skatingelementfamily.sc_skatingelementfamilyid', 'css_sc_skatingelementdefinition.sc_family')
            .leftJoin('css_sc_skatingelementfamilytype', 'css_sc_skatingelementfamilytype.sc_skatingelementfamilytypeid', 'css_sc_skatingelementfamily.sc_familytype')
            .where('se1.skateelementid', elementid)
            .andWhere('css_sc_skatingelementfamilytype.sc_skatingelementfamilytypeid', familytypeid)
            .orderBy('se2.programorder', 'asc')
            .then((rows) => {
                if (rows.length > 0) {
                    rows.forEach((item, index, array) => {

                        if (prevprogord != item.programorder) {
                            // this is the same combo don't update count
                            jumpcount++;
                        }

                        if (item.skateelementid === elementid) {
                            thisisjump = jumpcount;
                        }

                        prevprogord = item.programorder;

                        if (index === array.length - 1) resolve({ jumpcount: jumpcount, thisisjump: thisisjump });
                    })
                }
                else {
                    resolve({ jumpcount: 0, thisisjump: 0 })
                }
                // return number of jumps, and number this element is in jump array
            })

    })

}

// new code

exports.httpCalculateDetailedPCScore = (req, res) => {

    calculateDetailedPCScore(req.params.skateid)
        .then((response) => {
            res.status(200).send(response);
        })
}

var calculateDetailedPCScore = exports.calculateDetailedPCScore = (skateid) => {

    return new Promise(function (resolve, reject) {

        // have skateid, pull running PC score
        getProgramComponentInfo(skateid)
            .then((pcObj) => {

                calculateDetailedProgramComponentScore(pcObj)
                    .then((pcScoredObj) => {

                        resolve(pcScoredObj);

                    })
            })

    })

}


// skate info for reporting, sorted by judge panel position
exports.getSkateInfoExported = (skate, segmentObj, rank) => {
    return new Promise(function (resolve, reject) {
        var skateid = skate.competitorentryid;

        var runningskatescore = 0;
        getSkaterInfo(skateid)
            .then((skaterObj) => {
                //console.log(skaterObj)
                getSkateInfo(skateid, segmentObj)
                    .then((skateObj) => {
                        // we're going to create a copy for the full scoring code as it will strip highest / lowest goe
                        // and we need them all for the report
                        var originalSkate = JSON.parse(JSON.stringify(skateObj));
                        //console.log(skateObj)
                        // score full skate
                        scoreCPCController(segmentObj, originalSkate)
                            .then((scoredObj) => {
                                runningskatescore = parseFloat(parseFloat(scoredObj[scoredObj.length - 1].runningskatescore).toFixed(2));

                                const fullObj = {};
                                fullObj.skater = skaterObj;
                                fullObj.skater[0].rank = rank;
                                fullObj.skater[0].tes = runningskatescore;
                                //console.log(fullObj)

                                // pcs
                                getProgramComponentInfo(skateid)
                                    .then((pcObj) => {
                                        //console.log(pcObj)
                                        var originalPcObj = JSON.parse(JSON.stringify(pcObj));

                                        // sort pcs by jodge position
                                        originalPcObj.forEach((pc, index, array) => {
                                            var numEls = pc.scores.length;
                                            pc.scores.sort(function (a, b) {
                                                return a.position - b.position;
                                            });
                                        })

                                        calculateProgramComponentScore(pcObj)
                                            .then((pcScoredObj) => {

                                                var pcScore = 0;
                                                pcScore = parseFloat(parseFloat(pcScoredObj[pcScoredObj.length - 1].totalpcscore).toFixed(2));

                                                runningskatescore = runningskatescore + parseFloat(pcScore);

                                                // go through originalPcObj and drop in matching score and trimmedmean from pcScoredObj
                                                originalPcObj.forEach((pc, index, array) => {
                                                    //pc.sc_skatingprogramcomponentdefinitionid
                                                    pcScoredObj.forEach((pcs, index2, array2) => {
                                                        if (pc.sc_skatingprogramcomponentdefinitionid === pcs.id) {
                                                            pc.mean = parseFloat(parseFloat(pcs.trimmedmean).toFixed(2));
                                                            pc.score = parseFloat(parseFloat(pcs.score).toFixed(2));
                                                        }
                                                    })
                                                })

                                                //fullObj.score.pcs = pcScore;
                                                fullObj.skater[0].pcs = originalPcObj;

                                                fullObj.skater[0].pcscore = pcScore;

                                                // adjustments
                                                getAdjustments(skateid)
                                                    .then((adjustmentsObj) => {
                                                        //console.log(adjustmentsObj)
                                                        // get total adjustments value
                                                        var adj = parseFloat(parseFloat(adjustmentsObj.totaladjustments).toFixed(2));

                                                        runningskatescore = runningskatescore + adj; // deductions is a negative so still add!!
                                                        //fullObj.score.adjustments = adjustmentsObj.totaladjustments;
                                                        fullObj.skater[0].adjustments = adjustmentsObj.totaladjustments;

                                                        // multiply total by totalsegment factor (LFACTOR)
                                                        runningskatescore = runningskatescore * segmentObj[0].totalsegmentfactor;

                                                        fullObj.skater[0].lfactor = segmentObj[0].totalsegmentfactor;
                                                        fullObj.skater[0].totalscore = runningskatescore;
                                                        fullObj.skater[0].deductions = adjustmentsObj.deductions ? adjustmentsObj.deductions : 0;
                                                        fullObj.skater[0].bonuses = adjustmentsObj.bonuses ? adjustmentsObj.bonuses : 0;

                                                        if (adjustmentsObj.details.length > 0) {
                                                            fullObj.skater[0].adjustments = adjustmentsObj.details;
                                                        }

                                                        // score / bv for each element for all judges
                                                        skateObj.forEach((progElement, index, array) => {

                                                            // build combined string
                                                            var numEls = progElement.elements.length;
                                                            var elementCode = "";

                                                            for (var x = 0; x < numEls; x++) {
                                                                elementCode = elementCode + progElement.elements[x].elementcode + "+";

                                                                // while we're in here, sort goes by judge position
                                                                progElement.elements[x].goes.sort(function (a, b) {
                                                                    return a.position - b.position;
                                                                });
                                                            }
                                                            elementCode = elementCode.slice(0, -1)
                                                            progElement.fullelementcode = elementCode;

                                                            // score each element for judge rows
                                                            calculateElementScore(progElement.elements[0].skateelementid)
                                                                .then((score) => {
                                                                    // put score in progElement
                                                                    progElement.bv = score[0].basevalue;
                                                                    progElement.score = score[0].calculatedscore;
                                                                    progElement.goe = score[0].trimmedmean;
                                                                    //console.log(progElement);

                                                                    if (index === array.length - 1) {
                                                                        fullObj.skater[0].skate = skateObj;
                                                                        resolve(fullObj);
                                                                    }
                                                                })
                                                        })
                                                    })
                                            })
                                    })
                            })
                    })
            })
    })
}
