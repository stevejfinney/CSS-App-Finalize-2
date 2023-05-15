const knexconfig = require('../../knexfile');
const knex = require('knex')(knexconfig.development);
const gf = require('../functions/global.functions');
const sc = require('../scoring/scoring.controller');
const got = require('got');
const fs = require('fs')
//knex.raw("PRAGMA foreign_keys = ON;").then(() => {
//    console.log("Foreign Key Check activated.");
//});

const apiUrl = process.env.CLOUD_API_URL;

// build detail sheet
exports.getDetailSheet = (req, res) => {
    return new Promise(function(resolve,reject) {
              
        // components:
        // event details - name, adress, date
        // skate details - name, club, score breakdown (bv, tes, pcs, bonus, deductions, total)
        // skate elements - order, element code, bv, goe, judge goes, score
        // program components - factor, mean, judge pcs, score
        // adjustments - type, value, quantity, score
        var segmentid = req.params.segmentid;
        getEventDetails(segmentid)
        .then((eventObj) => {
            sc.getSegmentInfoBySegment(segmentid)
            .then((segmentObj) => {
                // get all skates for segment
                getSegmentSkates(segmentid)
                .then((skateIds) => {
                    // go through skates and get skate details
                    //console.log("-----this is a skatee data", skateIds)
                    var detailsObj = {};
                    detailsObj.eventDetails = eventObj;
                    var skaterDetails = []
                    for(let [index,skate] of skateIds.entries()) { // this way is supposed to maintain order
                        sc.getSkateInfoExported(skate,segmentObj,index+1)
                        .then((skateObj) => {
                            //console.log(skateObj);
                            skaterDetails.push(skateObj);
                            if(skaterDetails.length === skateIds.length) {
                                //console.log(skaterDetails[1].skater)
                                skaterDetails.sort(function(a, b) {
                                    //return a.skater[0].rank - b.skater[0].rank;
                                    return b.skater[0].totalscore - a.skater[0].totalscore;
                                });
                                
                                detailsObj.skaterDetails = skaterDetails;
                                res.status(200).send(detailsObj);
                            }
                        })
                    }
                })
            })
        })
    })
}

// event details for reports
function getEventDetails(segmentid) {
    return new Promise(function(resolve,reject) {
        knex.select([
            'tbl_events.enname as eventenname',
            'tbl_events.frname as eventfrname',
            'tbl_events.location as eventlocation',
            'tbl_categories.enname as catenname',
            'tbl_categories.frname as catfrname',
            'tbl_categories.startdate as startdate',
            'tbl_categories.enddate as enddate',
            'tbl_segments.enname as segenname',
            'tbl_segments.frname as segfrname',
            'css_sc_skatingcategorydefinition.sc_name as defenname',
            'css_sc_skatingcategorydefinition.sc_frenchname as deffrname',
            'css_sc_skatingdisciplinedefinition.sc_name as discenname',
            'css_sc_skatingdisciplinedefinition.sc_frenchname as discfrname'
        ])
        .from('tbl_events')
        .leftJoin('tbl_categories','tbl_categories.eventid','tbl_events.eventid')
        .leftJoin('tbl_segments','tbl_segments.categoryid','tbl_categories.categoryid')
        .leftJoin('css_sc_skatingcategorydefinition','css_sc_skatingcategorydefinition.sc_skatingcategorydefinitionid','tbl_categories.definitionid')
        .leftJoin('css_sc_skatingdisciplinedefinition','css_sc_skatingdisciplinedefinition.sc_skatingdisciplinedefinitionid','css_sc_skatingcategorydefinition.sc_skatingdisciplinedefinition')
        .where('tbl_segments.segmentid',segmentid)
        .then((eventObj) => {
            resolve(eventObj)
            //console.log("after event execution done", eventObj)
        })
    })
}

// event details for reports
function getSegmentSkates(segmentid) {
    return new Promise(function(resolve,reject) {
        knex.select([
            'competitorentryid',
            'tes',
            'pcs',
            'adj',
            'score'
        ])
        .from('tbl_competitorentry')
        .where('tbl_competitorentry.segmentid',segmentid)
        .orderBy('tbl_competitorentry.score','desc')
        .then((skateObj) => {
            resolve(skateObj)
        })
    })
}

//get startingOrderData
exports.getStartingOrderData = (req, res) => {
    return new Promise(function (resolve, reject) {
        var output = {};
        getEventDetails(req.params.segmentid)
            .then((eventObj) => {
                getCompetitorsList(req.params.segmentid)
                    .then((list) => {
                        output = eventObj[0];
                        output['competitors'] = list;
                        res.status(200).send(output);
                        //console.log("inside a offiical data status code", output);
                    })
            });
    })
}

//get a competitorslist for startingOrder
function getCompetitorsList(segmentid) {
    return new Promise(function (resolve, reject) {
        knex('tbl_competitorentry')
            .leftJoin('css_sc_competitors', 'css_sc_competitors.sc_competitorid', 'tbl_competitorentry.sc_competitorid')
            .where('segmentid', segmentid)
            .orderBy('sortorder', 'ASC')
            .then((competitors_entry_res) => {
                resolve(competitors_entry_res)
            })
    })
}

//get Official Data
exports.getOfficialData = (req, res) => {
    return new Promise(function (resolve, reject) {
        var output = {};
        getEventDetails(req.params.segmentid)
            .then((eventObj) => {
                output = eventObj[0];
                getOfficialList(req.params.segmentid)
                    .then((rows) => {
                        output['officials'] = rows;
                        res.status(200).send(output);
                        //console.log("inside a offiical data status code", output);
                    })
            })
    })
}


//get Official List for Official Data 
function getOfficialList(segmentid) {
        return new Promise(function (resolve, reject) {
        knex.select(
            'tbl_officialassignment.officialassignmentid',
            'tbl_officialassignment.segmentid',
            'tbl_officialassignment.sc_officialid',
            'tbl_officialassignment.role',
            'tbl_officialassignment.position',
            'css_sc_officials.sc_fullname',
            'css_sc_officials.sc_section',
            'css_sc_skatingofficialrole.sc_name'
        )
            .from('tbl_officialassignment')
            .where('tbl_officialassignment.segmentid', segmentid)
            .leftJoin('css_sc_officials', 'css_sc_officials.sc_officialid', 'tbl_officialassignment.sc_officialid')
            .leftJoin('css_sc_skatingofficialrole', 'css_sc_skatingofficialrole.sc_skatingofficialroleid', 'tbl_officialassignment.role')

            .then((rows) => {
                resolve(rows);
                var offObj = {};
                // for each official get their details
                rows.forEach((item, index, array) => {
                    knex.select(
                        'css_sc_officials.sc_officialid',
                        'css_sc_officials.sc_fullname',
                        'css_sc_officials.sc_section',
                    )
                        .from('css_sc_officials')
                        .where('css_sc_officials.sc_officialid', item.sc_officialid)
                        .then((off) => {
                            item.sc_officialid = off[0];
                            if (index === rows.length - 1) {
                                resolve(rows);
                            }
                        })
                })
            })
    })

}


//get Assess to Standard Segment Results
exports.getAssessToStandardSegment = (req, res) => {
    console.log("ATS Step 1")
    return new Promise(function (resolve, reject) {
        console.log("ATS Step 2");

        var output = {};
        getEventDetails(req.params.segmentid)
            .then((eventObj) => {
                output = eventObj[0];

                //console.log("output --------",output)

                getCompetitorsList(req.params.segmentid)
                .then((list) => {
                    console.log("output --------",list)

                    if(list.length>0)
                    {

                    }
                })
                // getOfficialList(req.params.segmentid)
                //     .then((rows) => {
                //         output['officials'] = rows;
                //         res.status(200).send(output);
                //         //console.log("inside a offiical data status code", output);
                //     })
            })

    })
}


exports.test_function = (req, res) => {

    console.log(" coming ");

    const options = {
        method: 'GET',
        url: 'http://localhost:5000/abc',
        searchParams: {
          segment_id: '1f3d9609-dad4-42b7-8a5b-df4ca87b5dd8',
          report_name:'test'
        }
      };

      got(options)
  .then(response => {
    console.log(response);

    console.log(response.rawBody);

    res.contentType('application/pdf');

    res.send(response.rawBody);
  })
  .catch(error => {
    console.error(error);
  });
  
}