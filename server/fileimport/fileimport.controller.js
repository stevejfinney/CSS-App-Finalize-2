const xlsx = require('node-xlsx');
const gf = require('../functions/global.functions');
const compFunctions = require('../competitor/competitor.controller');
const knexconfig = require('../../knexfile');
const { response } = require('express');
//const { getEnabledCategories } = require('trace_events');
//const { resolve } = require('path/posix');
const knex = require('knex')(knexconfig.development);
const got = require('got');
const apiUrl = process.env.CLOUD_API_URL;
const apiCloudSecret = process.env.CLOUD_API_SECRET


//Upload file 
exports.eventUpload = (req, res, next) => {
    let file = req['files'].thumbnail;
    
    // Grab data from excel
    var importObj = xlsx.parse(file.tempFilePath);
    var dataArray = importObj[0].data;

    // remove first row as this is headers
    dataArray.shift();

    //create array of errors
    var errArray = [];
    var dataObject = [];

    var arrayToObj = new Promise((resolve, reject) => {
        
        dataArray.forEach((item, index, array) => {
            // Array setup:
            /*
            // FROM SPREADSHEET
            item[0] = program name
            item[1] = discipline
            item[2] = category definition
            item[3] = group
            item[4] = competitor sc#
            */
            
            // if we have blank row then it will jump out here
            if(typeof item[0] === "undefined") {
                errArray.push(`Empty Row in Import File`);
                resolve();
            }

            // build object based on original array (easier to navigate)
            dataObject[index] = {
                program: item[0].trim(),
                discipline: item[1].trim(),
                category: item[2].trim(),
                group: item[3]?item[3].trim():'',
                competitor: item[4].toString().trim(),
                sc_scnum: item[4].toString().trim()
            }

            // if it's the last one, get out of here!!
            if(index === array.length-1) resolve();
        })
    })

    var getCategoryIds = new Promise((resolve, reject) => {
        var categoryObj = [];

        dataObject.forEach((item, index, array) => {
            var programName = item.program;
            var disciplineName = item.discipline;
            var categoryName = item.category;
            var groupName = item.group;

            //check table definitions
            knex.select('sc_skatingcategorydefinitionid')
                .from('css_sc_skatingcategorydefinition')
                .leftJoin('css_sc_programs', 'css_sc_skatingcategorydefinition.sc_parentprogram', 'css_sc_programs.sc_programsid')
                .leftJoin('css_sc_skatingdisciplinedefinition', 'css_sc_skatingcategorydefinition.sc_skatingdisciplinedefinition', 'css_sc_skatingdisciplinedefinition.sc_skatingdisciplinedefinitionid')
                .where(function(){
                    this.where('css_sc_skatingcategorydefinition.sc_name', categoryName).orWhere('css_sc_skatingcategorydefinition.sc_frenchname', categoryName)
                })
                .andWhere(function(){
                    this.where('css_sc_programs.sc_programname', programName).orWhere('css_sc_programs.sc_programname_fr', programName)
                })
                .andWhere(function(){
                    this.where('css_sc_skatingdisciplinedefinition.sc_name', disciplineName).orWhere('css_sc_skatingdisciplinedefinition.sc_frenchname', disciplineName)
                })
                .then((rows) => {
                    var thisObj =   {
                        eventid:req.params.eventid,
                        definitionid:rows[0].sc_skatingcategorydefinitionid,
                        group:groupName?groupName:'',
                        endescription:`${programName} ${disciplineName} ${categoryName}`
                    };
                    categoryObj.push(thisObj);

                    // also append definitionid to original array
                    //item.push(rows[0].sc_skatingcategorydefinitionid);
                    item.categoryDefinitionId = rows[0].sc_skatingcategorydefinitionid;

                    // if it's the last one, get out of here!!
                    if(index === array.length-1) resolve(categoryObj);
                })
                .catch((err) => {
                    //console.log(err); // throw err
                    errArray.push(`Row ${index+2}: Category [${programName} ${disciplineName} ${categoryName}] not found`);

                    // if it's the last one, get out of here!!
                    if(index === array.length-1) resolve(categoryObj);
                });
        })            
    })

    var getCompetitorIds = new Promise((resolve, reject) => {
        var itemCount = 1;
        for(const item of dataObject) {
            (async () => {
                var competitorNum = item.competitor;
                let fetchParams = { filter: competitorNum };
                try {
                    const competitorResp = await got.post(`${apiUrl}/api/getcompetitorbyscnum`, {
                        json:fetchParams,
                        responseType: 'json',
                        headers : { "Authorization" : `Raw ${apiCloudSecret}` }
                    });
                    item.competitorId = competitorResp.body[0].sc_groupid;
                    item.sc_status = competitorResp.body[0].statecode;
                    item.sc_name = competitorResp.body[0].sc_name;
                    item.sc_competitortype = competitorResp.body[0].sc_grouptype != null ? competitorResp.body[0].sc_grouptype.sc_name : null;
                    item.sc_club = competitorResp.body[0].sc_account != null ? competitorResp.body[0].sc_account.name : null;
                    item.sc_section = competitorResp.body[0].sc_section != null ? competitorResp.body[0].sc_section.sc_name : null;
                    item.sc_biography = competitorResp.body[0].sc_biography;
                    item.sc_account = competitorResp.body[0].sc_account != null ? competitorResp.body[0].sc_account.name : null;
                    item.sc_facebook = competitorResp.body[0].sc_facebookpagename;
                    item.sc_instagram = competitorResp.body[0].sc_instagramprofile;
                    item.sc_twitter = competitorResp.body[0].sc_twitterhandle;
                    item.sc_websiteurl = competitorResp.body[0].sc_website_url;
                    item.sc_synchrocategory = competitorResp.body[0].sc_declaredcurrentcategory != null ? competitorResp.body[0].sc_declaredcurrentcategory.sc_name : null;
                    item.sc_trainingsite = competitorResp.body[0].sc_trainingsite;
                    item.sc_competitorteam = competitorResp.body[0].new_teamid;

                    /*
                    addCompetitor.sc_scnum = item.competitorId;
                    addCompetitor.sc_status = item.statecode;
                    addCompetitor.sc_name = item.sc_name;
                    addCompetitor.sc_competitortype = item.sc_grouptype != null ? item.sc_grouptype.sc_name : null;
                    addCompetitor.sc_club = item.sc_account != null ? item.sc_account.name : null;
                    addCompetitor.sc_section = item.sc_section != null ? item.sc_section.sc_name : null;
                    addCompetitor.sc_biography = item.sc_biography;
                    addCompetitor.sc_account = item.sc_account != null ? item.sc_account.name : null;
                    addCompetitor.sc_facebook = item.sc_facebookpagename;
                    addCompetitor.sc_instagram = item.sc_instagramprofile;
                    addCompetitor.sc_twitter = item.sc_twitterhandle;
                    addCompetitor.sc_websiteurl = item.sc_website_url;
                    addCompetitor.sc_synchrocategory = item.sc_declaredcurrentcategory != null ? item.sc_declaredcurrentcategory.sc_name : null;
                    addCompetitor.sc_trainingsite = item.sc_trainingsite;
                    addCompetitor.sc_competitorteam = item.new_teamid;
                    */
                }
                catch (error) { // api will send 400 response
                    errArray.push(`Skater with SC Num [${competitorNum}] not found`);
                }
                if(itemCount == dataObject.length) resolve(dataObject);
                itemCount++;
            })();
        }
    })

    // convert import array to more manageable object
    arrayToObj.then(() => {
        // get categorydef id's
        if(errArray.length > 0) {
            res.status(400).send({message:JSON.stringify(errArray)});
        }
        else {
            getCategoryIds.then((categoryObj) => {
                // get competitor id's
                getCompetitorIds.then(() => {
                    if(errArray.length > 0) {
                        res.status(400).send({message:JSON.stringify(errArray)});
                    }
                    else {
                        // else carry on!
                        // dedupe based on categoryDefinitionId
                        const uniqueCategoryObj = categoryObj.filter((item, index) => {
                            return index === categoryObj.findIndex(obj => {
                                return JSON.stringify(obj) === JSON.stringify(item);
                            });
                        });

                        // check if definitionid and eventid exist already
                        checkCategoriesExist(uniqueCategoryObj)
                        .then((existingCategoryObj) => {
                            //console.log(existingCategoryObj)
                            // get new list of ONLY NEW categories (strip existing from unique)
                            getNewCategories(uniqueCategoryObj, existingCategoryObj)
                            .then((newCategoriesObj) => {
                                //console.log(newCategoriesObj)
                                // insert new categories into db
                                gf.insertCategories(newCategoriesObj)
                                .then((insertedCategoriesObj) => {
                                    
                                    // join inserted and existing
                                    const allCategoriesObj = existingCategoryObj.concat(insertedCategoriesObj);
                                    
                                    // match inserted categoryid to item in dataObj
                                    //console.log('allCategoriesObj',allCategoriesObj)
                                    buildCompetitorInsertObj(dataObject,allCategoriesObj)
                                    .then((competitorInsertObj) => {
                                        //console.log(competitorInsertObj)
                                        // check if competitor already added to that category
                                        removeExistingCompetitors(competitorInsertObj)
                                        .then((remainingCompetitorsObj) => {
                                            //console.log(remainingCompetitorsObj);
                                            // check local table, if exist update with this info, return with guid
                                            // if don't exist insert, return with guid
                                            //console.log(remainingCompetitorsObj)
                                            var finalCompetitorsObj = new Promise(function(resolve,reject) {
                                                const queries = [];
                                                var returnObj = [];
                                                remainingCompetitorsObj.forEach(competitorObj => {
                                                    const query = new Promise((resolve,reject) => {
                                                        resolve(compFunctions.insertCompetitorFromImport(competitorObj));   
                                                    })
                                                    queries.push(query);
                                                });
                                                
                                                Promise.allSettled(queries) // Once every query is written
                                                    .then((results) => {
                                                        results.forEach((item, index, array) => {
                                                            returnObj.push(item.value);
                                                            /*if (result.status === 'fulfilled') {
                                                            console.log(result.status,result.value);
                                                            } else {
                                                            console.log(result.status,result.reason);
                                                            }*/
                                                            if(index === array.length-1) resolve(returnObj);
                                                        })
                                                    })
                                                    .catch((err) => {
                                                        reject(err);
                                                    });
                                            })

                                            finalCompetitorsObj.then((returnObj) => {
                                                gf.insertCompetitors(returnObj)
                                                .then((competitorsobj) => {
                                                    return next();
                                                })
                                                .catch ((err) => {
                                                    console.log(err); // throw err
                                                });
                                            })
                                            

                                            /*compFunctions.insertCompetitorsImport(remainingCompetitorsObj)
                                            .then((finalCompetitorsObj) => {
                                                // insert to competitorentry table
                                                gf.insertCompetitors(finalCompetitorsObj)
                                                .then((competitorsobj) => {
                                                    return next();
                                                })
                                                .catch ((err) => {
                                                    console.log(err); // throw err
                                                });
                                            })
                                            .catch ((err) => {
                                                console.log(err); // throw err
                                            });*/
                                        })
                                    })
                                })
                            })
                        })
                    }
                })
            })
        }
    })
    .catch ((err) => {
        console.log(err); // throw err
    });
}

/*function getCompetitorIds(dataObject) {
    return new Promise(function(resolve,reject) {
        // for each row in dataobject...
        dataObject.forEach((item, index, array) => {
            // get competitorid
            pullIdFromCRM(item.competitor,index)
            .then((row) => {
                if(row.error) {
                    // if it's errored on a skater, then get out
                    item.error = row.error;
                    if(index === array.length-1) resolve(dataObject);
                }
                else {
                    item.competitorId = row.competitorId;
                    if(index === array.length-1) resolve(dataObject);
                }
            })
            .catch((err) => {
                console.log(err);
                resolve(err);
            })
        })
    })
}

function pullIdFromCRM(compid,ind) {
    return new Promise(function(resolve,reject) {
    (async () => {
        try {
            console.log(compid)
            const body = await got.post(`${apiUrl}/api/getcompetitorbyscnum`, {
                json:{filter:compid},
                responseType: 'json',
                headers : { "Authorization" : `Raw ${apiCloudSecret}` }
            });
            console.log(body[0])
            //return {competitorId:body[0].sc_groupid};
            resolve({competitorId:body[0].sc_groupid})
        }
        catch (error) { // api will send 400 response
            //return {error:`Row ${ind+2}: Competitor [${compid}] not found`};
            resolve({error:`Row ${ind+2}: Competitor [${compid}] not found`})
        }
    })
})
}*/

function buildCompetitorInsertObj(dataObject, insertedCategories) {
    return new Promise(function(resolve,reject) {
        var competitorInsertObj = [];
        //console.log('cats',insertedCategories)
        dataObject.forEach((item, index, array) => {
            var result = insertedCategories.find(obj => {
                return obj.value.definitionid === item.categoryDefinitionId && obj.value.enname === item.group;
            })
            //console.log(index + '-' + result.value.categoryid);

            //competitorInsertObj.push({categoryid:result.value.categoryid, competitorid:item.competitorId});

            item.categoryid = result.value.categoryid;
            competitorInsertObj.push(item);

            // if it's the last one, get out of here!!
            if(index === array.length-1) resolve(competitorInsertObj);
        })
    })
}


function checkCategoriesExist(uniqueCategoryObj) {
    return new Promise(function(resolve,reject) {
        var existingCategoryObj = [];
        uniqueCategoryObj.forEach((item, index, array) => {
            knex.select('categoryid')
            .from('tbl_categories')
            .where({eventid: item.eventid, definitionid: item.definitionid, enname: item.group})
            .limit(1)
            .then((row) => {
                existingCategoryObj.push({value: {eventid: item.eventid, definitionid: item.definitionid, enname: item.group, categoryid: row[0].categoryid}});

                // if it's the last one, get out of here!!
                if(index === array.length-1) resolve(existingCategoryObj);
            })
            .catch((err) => {
                // if it's the last one, get out of here!!
                if(index === array.length-1) resolve(existingCategoryObj);
            })
        })
    })
}

function getNewCategories(uniqueCategoryObj, existingCategoryObj) {
    return new Promise(function(resolve,reject) {
        var newCategoriesObj = [...uniqueCategoryObj];
        var counter = 0;
        for(var i=uniqueCategoryObj.length-1; i>=0; i--) {
            var result = existingCategoryObj.find(obj => {
                return obj.value.definitionid === uniqueCategoryObj[i].definitionid && obj.value.enname === uniqueCategoryObj[i].group;
            })
            if(result) newCategoriesObj.splice(i,1);

            counter++;
            
            if(counter === uniqueCategoryObj.length) resolve(newCategoriesObj);
        }
    })
}

function removeExistingCompetitors(competitorsObj) {
    return new Promise(function(resolve,reject) {
        getExistingCompetitors(competitorsObj).then((existingCompsObj) => {
            var newCompsObj = [...competitorsObj];
            //console.log(existingCompsObj);
            //console.log(newCompsObj);
            var counter = 0;
            for(var i=competitorsObj.length-1; i>=0; i--) {
                var result = existingCompsObj.find(obj => {
                    return obj.categoryid === competitorsObj[i].categoryid && obj.competitorid === competitorsObj[i].competitorid;
                })
                
                if(result) newCompsObj.splice(i,1);
                
                counter++;
            
                if(counter === competitorsObj.length) resolve(newCompsObj);
            }
        })
        
        
    })
}

function getExistingCompetitors(competitorsObj) {
    return new Promise(function(resolve,reject) {
        var existingCompsObj = [];
        competitorsObj.forEach((item, index, array) => {
            knex.select('competitorentryid')
            .from('tbl_competitorentry')
            .leftJoin('tbl_segments','tbl_competitorentry.segmentid','tbl_segments.segmentid')
            .where({'tbl_competitorentry.sc_competitorid': item.competitorid, 'tbl_segments.categoryid':item.categoryid})
            .then((row) => {
                //console.log(row);
                if(row.length > 0) {
                    existingCompsObj.push({competitorid:item.competitorid, categoryid:item.categoryid});
                }
                // if it's the last one, get out of here!!
                if(index === competitorsObj.length-1) resolve(existingCompsObj);
            })
            .catch((err) => {
                // if it's the last one, get out of here!!
                if(index === competitorsObj.length-1) resolve(existingCompsObj);
            })
        })
    })
}