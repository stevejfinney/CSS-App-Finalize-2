const knexconfig = require('../../knexfile');
const knex = require('knex')(knexconfig.development);
const gf = require('../functions/global.functions');
//knex.raw("PRAGMA foreign_keys = ON;").then(() => {
//    console.log("Foreign Key Check activated.");
//});
const got = require('got');
const { v4: uuidv4 } = require('uuid');
const apiUrl = process.env.CLOUD_API_URL;
const apiCloudSecret = process.env.CLOUD_API_SECRET


exports.getSearchOfficialsLocal = (req, res) => {
    // new call to crm to pull officials
    (async () => {
        knex('css_sc_officials')
            .where('sc_fullname', 'like', `%${req.body.filter}%`)
            .orWhere('sc_scnum', 'like', `%${req.body.filter}%`)
            .limit(req.body.pageSize)
            .orderBy('sc_fullname',req.body.sort)
            .then((rows) => {
                res.status(200).send(rows);
            })
            .catch((err) => {
                console.log( err); // throw err
            });
    })();
}

exports.getSearchOfficials = (req, res) => {
    // new call to crm to pull officials
    (async () => {
        
        if(req.body.env === 'online') {
            try {
                const {body} = await got.post(`${apiUrl}/api/getofficialsearch`, {
                    json:req.body,
                    responseType: 'json',
                    headers : { "Authorization" : `Raw ${apiCloudSecret}` }
                });
                
                var offObj = [];
                // loop through response and map to correct field names
                body.forEach((row, index, array) => {
                    var rowObj = {};

                    rowObj.sc_officialid = body[index]["contactid"];
                    rowObj.sc_scnum = body[index]["sc_skatecanadaid"];
                    rowObj.sc_fullname = body[index]["fullname"]
                    rowObj.sc_firstname = body[index]["firstname"]
                    rowObj.sc_middlename = body[index]["middlename"]
                    rowObj.sc_lastname = body[index]["lastname"]
                    rowObj.sc_email = body[index]["emailaddress1"]
                    rowObj.sc_homeorg = body[index]["_sc_primaryclubaffiliation_value@OData.Community.Display.V1.FormattedValue"];
                    rowObj.sc_section = body[index]["sc_primaryclubaffiliation"]["sc_section"]["sc_name"]
                    rowObj.sc_registereduntil = body[index]["sc_registereduntil"]
                    
                    console.log(rowObj);
                    offObj.push(rowObj);

                    if(index === array.length-1) {
                        res.status(200).send(offObj);
                    }
                })
            }
            catch (error) { // api will send 400 response
                //console.log(error.response);
                res.status(400).send(error.response);
            }
        }
        else {
            // send empty
            res.status(200).send({});
        }
    })();
}

exports.insertOfficial = (req, res, next) => {
    //set createdon date
    var createddate = new Date();
    req.body.createdon = createddate.toISOString();
    req.body.modifiedon = createddate.toISOString();
    
    //console.log(req.body)
    var officialid = req.body.formObj.officialid;
    
    // check official exists in system
    knex.select().from('css_sc_officials').where('sc_officialid',officialid)
    .then((officialObj) => {
        if(officialObj.length > 0) { // exists
            // get segments for category
            knex.select('segmentid')
            .from('tbl_segments')
            .where({ categoryid: req.body.formObj.categoryid })
            .then((results) => {
                results.forEach((row, index, array) => {
                    let officialassignmentid = uuidv4();
                    
                    knex('tbl_officialassignment')
                    .insert({
                        officialassignmentid: officialassignmentid,
                        segmentid: row.segmentid,
                        sc_officialid: officialid,
                        role: req.body.formObj.officialrole,
                        includescore: req.body.formObj.includescore,
                        position: req.body.formObj.officialposition,
                        createdon: req.body.createdon,
                        modifiedon: req.body.modifiedon
                    })
                    .then(() => {
                        req.params.categoryid = req.body.formObj.categoryid;
                        if(index === array.length-1) return next();
                        
                    })
                    .catch((err) => {
                        req.params.categoryid = req.body.formObj.categoryid;
                        if(index === array.length-1) return next();
                    });
                })
            })
            .catch((err) => {
                console.log( err); // throw err
            });
        }
        else { // doesn't exist
            // insert competitor to comps table and then add to competitorentryid
            req.body.officialObj.createdon = createddate.toISOString();
            req.body.officialObj.modifiedon = createddate.toISOString();
            
            knex('css_sc_officials')
            .insert(req.body.officialObj)
            .then((rows) => {
                //console.log(rows)
                // get segments for category
                knex.select('segmentid')
                .from('tbl_segments')
                .where({ categoryid: req.body.formObj.categoryid })
                .then((results) => {
                    results.forEach((row, index, array) => {
                        let officialassignmentid = uuidv4();
                        
                        knex('tbl_officialassignment')
                        .insert({
                            officialassignmentid: officialassignmentid,
                            segmentid: row.segmentid,
                            sc_officialid: officialid,
                            role: req.body.formObj.officialrole,
                            includescore: req.body.formObj.includescore,
                            position: req.body.formObj.officialposition,
                            createdon: req.body.createdon,
                            modifiedon: req.body.modifiedon
                        })
                        .then(() => {
                            req.params.categoryid = req.body.formObj.categoryid;
                            if(index === array.length-1) return next();
                            
                        })
                        .catch((err) => {
                            req.params.categoryid = req.body.formObj.categoryid;
                            if(index === array.length-1) return next();
                        });
                    })
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

exports.getOfficialsByCategory = (req, res) => {
    knex.select(
        'css_sc_officials.sc_scnum',
        'css_sc_officials.sc_fullname',
        'tbl_officialassignment.role',
        'css_sc_skatingofficialrole.sc_name as enname',
        'css_sc_skatingofficialrole.sc_frenchname as frname',
        'tbl_officialassignment.position as position'
        )
    .from('css_sc_officials')
    .leftJoin('tbl_officialassignment','tbl_officialassignment.sc_officialid','css_sc_officials.sc_officialid')
    .leftJoin('tbl_segments','tbl_segments.segmentid','tbl_officialassignment.segmentid')
    .leftJoin('tbl_categories','tbl_categories.categoryid','tbl_segments.categoryid')
    .leftJoin('css_sc_skatingofficialrole','css_sc_skatingofficialrole.sc_skatingofficialroleid','tbl_officialassignment.role')
    .where({'tbl_categories.categoryid':req.params.categoryid})
    .groupBy('css_sc_officials.sc_scnum','css_sc_officials.sc_fullname','css_sc_skatingofficialrole.sc_name','css_sc_skatingofficialrole.sc_frenchname','tbl_officialassignment.position','tbl_officialassignment.role')
    .orderBy('sc_fullname','asc')
    .then((rows) => {
        rows.forEach((row, index, array) => {
            // build languages object
            row.languages = {
                                'en':{
                                        name:row.enname
                                    },
                                'fr':{
                                        name:row.frname
                                    }
                            };
            
            // remove other language fields
            delete row.enname;
            delete row.frname;
            
            if(index === array.length-1) {
                res.status(200).send(rows);
            }
        });
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.getOfficialRoles = (req, res) => {
    knex('css_sc_skatingofficialrole')
    .orderBy('sc_name','asc')
    .where('statecode',0)
    .then((rows) => {
        rows.forEach((row, index, array) => {
            // build languages object
            row.languages = {
                                'en':{
                                        name:row.sc_name,
                                        abbrname:row.sc_abbreviatedname
                                    },
                                'fr':{
                                        name:row.sc_frenchname,
                                        abbrname:row.sc_frenchabbreviatedname
                                    }
                            };
            
            // remove other language fields
            delete row.sc_name;
            delete row.sc_abbreviatedname;
            delete row.sc_frenchname;
            delete row.sc_frenchabbreviatedname;
            
            if(index === array.length-1) {
                res.status(200).send(rows);
            }
        });
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.getOfficialPosition = (req, res) => {
    knex.select('officialassignmentid','role','position','sc_fullname')
    .from('tbl_officialassignment')
    .leftJoin('css_sc_officials','css_sc_officials.sc_officialid','tbl_officialassignment.sc_officialid')
    .where({officialassignmentid:req.params.officialassignmentid})
    .then((rows) => {
        res.status(200).send(rows);
    })
    .catch((err) => {
        console.log( err); // throw err
    });    
}

exports.updateOfficialAssignment = (req, res) => {
    knex('tbl_officialassignment')
    .where({officialassignmentid:req.body.officialassignmentid})
    .update({position:req.body.officialposition,role:req.body.officialrole})
    .then((rows) => {
        res.status(200).send({result: rows});
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}