const knexconfig = require('../../knexfile');
const knex = require('knex')(knexconfig.development);
const gf = require('../functions/global.functions');
//knex.raw("PRAGMA foreign_keys = ON;").then(() => {
//    console.log("Foreign Key Check activated.");
//});
const got = require('got');
const { v4: uuidv4 } = require('uuid');
const { receiveMessageOnPort } = require('worker_threads');
const apiUrl = process.env.CLOUD_API_URL;
const apiCloudSecret = process.env.CLOUD_API_SECRET


exports.getSearchCompetitors = (req, res) => {
    // new call to crm to pull competitors
    (async () => {
        
        if(req.body.env === 'online') {
            try {
                const {body} = await got.post(`${apiUrl}/api/getcompetitorsearch`, {
                    json:req.body,
                    responseType: 'json',
                    headers : { "Authorization" : `Raw ${apiCloudSecret}` }
                });
                res.status(200).send(body);
            }
            catch (error) { // api will send 400 response
                //console.log(error.response);
                res.status(400).send(error.response);
            }
        }
        else {
            knex('css_sc_competitors')
            .where('sc_name', 'like', `%${req.body.filter}%`)
            .orWhere('sc_scnum', 'like', `%${req.body.filter}%`)
            .limit(req.body.pageSize)
            .orderBy('sc_name',req.body.sort)
            .then((rows) => {
                res.status(200).send(rows);
            })
            .catch((err) => {
                console.log( err); // throw err
            });
        }
    })();
}

exports.getAllCompetitors = (req, res) => {
    knex('css_sc_competitors')
    .limit(100)
    .orderBy('sc_name','asc')
    .then((rows) => {
        res.status(200).send(rows);
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.insertCompetitor = (req, res, next) => {
    
    //set createdon date
    var createddate = new Date();

    // map fields to css_sc_competitors table fields
    addCompetitor = {};
    
    var compid;
    if(req.body.sc_competitorid)
        compid = req.body.sc_competitorid;
    else
        compid = req.body.sc_groupid;
        
    console.log(compid);
    
    // we need to add to css_sc_competitors
    
    // if competitor exists
    knex.select().from('css_sc_competitors').where('sc_competitorid',compid)
    .then((competitorObj) => {
        if(competitorObj.length > 0) { // exists
            addCompetitor = competitorObj;
            addCompetitor.categoryid = req.body.categoryid;
            addCompetitor.competitorid = compid; // required for global insertCompetitor function
            addCompetitor.sc_competitorid = compid;

            // insert to competitorentry using existing
            gf.insertCompetitor(addCompetitor)
            .then((competitorObj) => {
                req.params.categoryid = req.body.categoryid;
                return next();
            })
            .catch((err) => {
                console.log( err); // throw err
            });
        }
        else { // doesn't exist
            // map fields to css_sc_competitors table fields
            addCompetitor.sc_competitorid = compid;
            addCompetitor.sc_scnum = req.body.new_teamid;
            addCompetitor.sc_status = req.body.statecode;
            addCompetitor.sc_name = req.body.sc_name;
            addCompetitor.sc_competitortype = req.body.sc_grouptype != null ? req.body.sc_grouptype.sc_name : null;
            addCompetitor.sc_club = req.body.sc_account != null ? req.body.sc_account.name : null;
            addCompetitor.sc_section = req.body.sc_section != null ? req.body.sc_section.sc_name : null;
            addCompetitor.sc_biography = req.body.sc_biography;
            addCompetitor.sc_account = req.body.sc_account != null ? req.body.sc_account.name : null;
            addCompetitor.sc_facebook = req.body.sc_facebookpagename;
            addCompetitor.sc_instagram = req.body.sc_instagramprofile;
            addCompetitor.sc_twitter = req.body.sc_twitterhandle;
            addCompetitor.sc_websiteurl = req.body.sc_website_url;
            addCompetitor.sc_synchrocategory = req.body.sc_declaredcurrentcategory != null ? req.body.sc_declaredcurrentcategory.sc_name : null;
            addCompetitor.sc_trainingsite = req.body.sc_trainingsite;
            addCompetitor.sc_competitorteam = req.body.new_teamid;
            addCompetitor.createdon = createddate.toISOString();
            addCompetitor.modifiedon = createddate.toISOString();

            // insert competitor to comps table and then add to competitorentryid
            knex('css_sc_competitors')
            .insert(addCompetitor)
            .then((rows) => {
                //console.log(rows)
                addCompetitor.categoryid = req.body.categoryid;
                addCompetitor.competitorid = compid; // required for global insertCompetitor function
                gf.insertCompetitor(addCompetitor)
                .then((competitorObj) => {
                    req.params.categoryid = req.body.categoryid;
                    return next();
                })
                .catch((err) => {
                    console.log( err); // throw err
                });
            })
            .catch((err) => {
                console.log( err); // throw err
            });
        }
    })
}

exports.insertCompetitors = (req, res) => {
    gf.insertCompetitors(req.body)
    .then((competitorObj) => {
        // send it back!
        res.status(200).send(competitorObj);
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.getCompetitorsByCategory = (req, res) => {
    knex.select('css_sc_competitors.sc_scnum','css_sc_competitors.sc_name')
    .from('css_sc_competitors')
    .leftJoin('tbl_competitorentry','tbl_competitorentry.sc_competitorid','css_sc_competitors.sc_competitorid')
    .leftJoin('tbl_segments','tbl_segments.segmentid','tbl_competitorentry.segmentid')
    .leftJoin('tbl_categories','tbl_categories.categoryid','tbl_segments.categoryid')
    .where({'tbl_categories.categoryid':req.params.categoryid})
    .groupBy('css_sc_competitors.sc_scnum','css_sc_competitors.sc_name')
    .orderBy('css_sc_competitors.sc_name','asc')
    .then((rows) => {
        res.status(200).send(rows);
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.getCompetitorByCompetitorentry = (req, res) => {
    knex.select(
        'tbl_competitorentry.*',
        'css_sc_competitors.sc_name as skatername',
        'css_sc_competitors.sc_club as clubname',
        'tbl_segments.reviewtime as reviewtime'
    )
    .from('tbl_competitorentry')
    .leftJoin('css_sc_competitors','css_sc_competitors.sc_competitorid','tbl_competitorentry.sc_competitorid')
    .leftJoin('tbl_segments','tbl_segments.segmentid','tbl_competitorentry.segmentid')
    .where({'tbl_competitorentry.competitorentryid':req.params.competitorentryid})
    .then((rows) => {
        res.status(200).send(rows);
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.insertCompetitorFromImport = (item) => {
    return new Promise(function(resolve,reject) {
        
        // check local table, if exist update with this info, return with guid
        // if don't exist insert, return with guid
        //set createdon date
        var createddate = new Date();
        item.createdon = createddate.toISOString();
        item.modifiedon = createddate.toISOString();

        knex.select().from('css_sc_competitors').where('sc_scnum',item.sc_scnum)
        .then((competitorObj) => {
            if(competitorObj.length > 0) { // exists
                item.sc_competitorid = competitorObj[0].sc_competitorid;
                updateObj = item;

                // delete what we don't need in db
                delete updateObj.program;
                delete updateObj.discipline;
                delete updateObj.category;
                delete updateObj.group;
                delete updateObj.competitor;
                delete updateObj.categoryDefinitionId;
                delete updateObj.competitorId;
                var catid = updateObj.categoryid;
                delete updateObj.categoryid;
                

                knex('css_sc_competitors')
                .where({ sc_competitorid: competitorObj[0].sc_competitorid })
                .update(updateObj)
                .then(() => {
                    // we're done, get out
                    item.categoryid = catid;
                    resolve(item);
                })
                .catch((err) => {
                    console.log( err); // throw err
                });
            }
            else { // doesn't exist
                item.sc_competitorid = uuidv4();
                //console.log(item.sc_competitorid)

                // map fields to css_sc_competitors table fields
                var addCompetitor = {};

                // map fields to css_sc_competitors table fields and insert
                addCompetitor.sc_competitorid = item.sc_competitorid;
                addCompetitor.sc_scnum = item.sc_scnum;
                addCompetitor.sc_status = item.sc_status;
                addCompetitor.sc_name = item.sc_name;
                addCompetitor.sc_competitortype = item.sc_competitortype != null ? item.sc_competitortype : null;
                addCompetitor.sc_club = item.sc_club != null ? item.sc_club : null;
                addCompetitor.sc_section = item.sc_section != null ? item.sc_section : null;
                addCompetitor.sc_biography = item.sc_biography;
                addCompetitor.sc_account = item.sc_account != null ? item.sc_account : null;
                addCompetitor.sc_facebook = item.sc_facebook;
                addCompetitor.sc_instagram = item.sc_instagram;
                addCompetitor.sc_twitter = item.sc_twitter;
                addCompetitor.sc_websiteurl = item.sc_websiteurl;
                addCompetitor.sc_synchrocategory = item.sc_synchrocategory != null ? item.sc_synchrocategory : null;
                addCompetitor.sc_trainingsite = item.sc_trainingsite;
                addCompetitor.sc_competitorteam = item.sc_competitorteam;
                addCompetitor.createdon = createddate.toISOString();
                addCompetitor.modifiedon = createddate.toISOString();

                var catid = item.categoryid;
    
                // insert competitor to comps table and then add to competitorentryid
                knex('css_sc_competitors')
                .insert(addCompetitor)
                .then((rows) => {
                    // update original object
                    // we're done, get out
                    item.categoryid = catid;
                    resolve(item);
                })
                .catch((err) => {
                    console.log( err); // throw err
                });
            }
        })

        
    })
}
