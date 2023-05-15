const knexconfig = require('../../knexfile');
const knex = require('knex')(knexconfig.development);
const gf = require('../functions/global.functions');
//knex.raw("PRAGMA foreign_keys = ON;").then(() => {
//    console.log("Foreign Key Check activated.");
//});
const { v4: uuidv4 } = require('uuid');
const { response } = require('express');
const apiUrl = process.env.CLOUD_API_URL;


exports.categoriesByEvent = (req, res) => {
    knex.select([
        'tbl_categories.*',
        'css_sc_programs.sc_programname as enprogramname',
        'css_sc_programs.sc_programname_fr as frprogramname',
        'css_sc_skatingdisciplinedefinition.sc_name as endiscname',
        'css_sc_skatingdisciplinedefinition.sc_frenchname as frdiscname',
        'css_sc_skatingcategorydefinition.sc_name as encatdefname',
        'css_sc_skatingcategorydefinition.sc_frenchname as frcatdefname'
    ])
    .from('tbl_categories')
    .leftJoin('css_sc_skatingcategorydefinition','tbl_categories.definitionid','css_sc_skatingcategorydefinition.sc_skatingcategorydefinitionid')
    .leftJoin('css_sc_programs','css_sc_skatingcategorydefinition.sc_parentprogram','css_sc_programs.sc_programsid')
    .leftJoin('css_sc_skatingdisciplinedefinition','css_sc_skatingcategorydefinition.sc_skatingdisciplinedefinition','css_sc_skatingdisciplinedefinition.sc_skatingdisciplinedefinitionid')
    .where('tbl_categories.eventid',req.params.eventid)
    .then((rows) => {
        rows.forEach((row, index, array) => {
            // build languages object
            row.languages = {
                                'en':{
                                        name:row.enname,
                                        progname:row.enprogramname,
                                        discname:row.endiscname,
                                        catdefname:row.encatdefname
                                    },
                                'fr':{
                                        name:row.frname,
                                        progname:row.frprogramname,
                                        discname:row.frdiscname,
                                        catdefname:row.frcatdefname
                                    }
                            };
            
            // remove other language fields
            delete row.enname;
            delete row.frname;
            delete row.enprogramname;
            delete row.frprogramname
            delete row.endiscname;
            delete row.frdiscname;
            delete row.encatdefname;
            delete row.frcatdefname
            
            if(index === array.length-1) {
                res.status(200).send(rows);
            }
        });
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.categoryById = (req, res) => {
    //console.log(req.params.categoryid);
    knex.select([
        'tbl_categories.*',
        'css_sc_programs.sc_programsid as programid',
        'css_sc_programs.sc_programname as enprogramname',
        'css_sc_programs.sc_programname_fr as frprogramname',
        'css_sc_skatingdisciplinedefinition.sc_skatingdisciplinedefinitionid as disciplineid',
        'css_sc_skatingdisciplinedefinition.sc_name as endiscname',
        'css_sc_skatingdisciplinedefinition.sc_frenchname as frdiscname',
        'css_sc_skatingcategorydefinition.sc_name as encatdefname',
        'css_sc_skatingcategorydefinition.sc_frenchname as frcatdefname'
    ])
    .from('tbl_categories')
    .leftJoin('css_sc_skatingcategorydefinition','tbl_categories.definitionid','css_sc_skatingcategorydefinition.sc_skatingcategorydefinitionid')
    .leftJoin('css_sc_programs','css_sc_skatingcategorydefinition.sc_parentprogram','css_sc_programs.sc_programsid')
    .leftJoin('css_sc_skatingdisciplinedefinition','css_sc_skatingcategorydefinition.sc_skatingdisciplinedefinition','css_sc_skatingdisciplinedefinition.sc_skatingdisciplinedefinitionid')
    .where('categoryid',req.params.categoryid)
    .then((rows) => {
        rows.forEach((row, index, array) => {
            // build languages object
            row.languages = {
                'en':{
                        name:row.enname,
                        progname:row.enprogramname,
                        discname:row.endiscname,
                        catdefname:row.encatdefname
                    },
                'fr':{
                        name:row.frname,
                        progname:row.frprogramname,
                        discname:row.frdiscname,
                        catdefname:row.frcatdefname
                    }
            };

            // remove other language fields
            delete row.enname;
            delete row.frname;
            delete row.enprogramname;
            delete row.frprogramname
            delete row.endiscname;
            delete row.frdiscname;
            delete row.encatdefname;
            delete row.frcatdefname

            if(index === array.length-1) {
                res.status(200).send(rows);
            }
        });
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.getPrograms = (req, res) => {
    knex('css_sc_programs')
    .orderBy('sc_programname','asc')
    .then((rows) => {
        rows.forEach((row, index, array) => {
            // build languages object
            row.languages = {
                                'en':{
                                        name:row.sc_programname,
                                        description:row.sc_description
                                    },
                                'fr':{
                                        name:row.sc_programname_fr,
                                        description:row.sc_description_fr
                                    }
                            };
            
            // remove other language fields
            delete row.sc_programname;
            delete row.sc_description;
            delete row.sc_programname_fr;
            delete row.sc_description_fr;

            if(index === array.length-1) {
                res.status(200).send(rows);
            }
        });
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.getDisciplines = (req, res) => {
    knex('css_sc_skatingdisciplinedefinition')
    .orderBy('sc_name','asc')
    .then((rows) => {
        rows.forEach((row, index, array) => {
            // build languages object
            row.languages = {
                                'en':{
                                        name:row.sc_name
                                    },
                                'fr':{
                                        name:row.sc_frenchname
                                    }
                            };
            
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

exports.getDefinitionsByParent = (req, res) => {
    knex('css_sc_skatingcategorydefinition')
    .where({sc_parentprogram: req.params.programid, sc_skatingdisciplinedefinition: req.params.disciplineid})
    .orderBy('sc_name','asc')
    .then((rows) => {
        rows.forEach((row, index, array) => {
            // build languages object
            row.languages = {
                                'en':{
                                        name:row.sc_name
                                    },
                                'fr':{
                                        name:row.sc_frenchname
                                    }
                            };
            
            // remove other language fields
            delete row.sc_name;
            delete row.sc_frenchname;

            getLabels(row.sc_skatingcategorydefinitionid)
            .then((labels) => {
                row.labels = labels
                //console.log(row.sc_skatingcategorydefinitionid,labels)
                if(index === array.length-1) {
                    //console.log(rows)
                    res.status(200).send(rows);
                }
            })
        });
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

function getLabels(catdefid) {
    return new Promise(function(resolve,reject) {
        // get labels
        knex.select([
            'css_sc_skatingcategorylabels.sc_skatingcategorylabelsid as sc_skatingcategorylabelsid',
            'css_sc_skatingcategorylabels.sc_forced as sc_forced',
            'css_sc_skatingcategorylabels.sc_name as sc_name',
            'css_sc_skatingcategorylabeldefinition.sc_name as enlabelname',
            'css_sc_skatingcategorylabeldefinition.sc_frenchname as frlabelname'
        ])
        .from('css_sc_skatingcategorylabels')
        .leftJoin('css_sc_skatingcategorylabeldefinition','css_sc_skatingcategorylabeldefinition.sc_skatingcategorylabeldefinitionid','css_sc_skatingcategorylabels.sc_labeldefinition')
        .where('css_sc_skatingcategorylabels.sc_parentcategory',catdefid)
        .orderBy('sc_forced')
        .then((labels) => {
            //console.log(labels)
            labels.forEach((label,index,array) => {
                // build languages object
                label.languages = {
                    'en':{
                            name:label.enlabelname
                        },
                    'fr':{
                            name:label.frlabelname
                        }
                };

                // remove other language fields
                delete label.enlabelname;
                delete label.frlabelname;
            })

            resolve(labels);
        })
    })
}


exports.insertCategory = (req, res, next) => {
    gf.insertCategory(req.body)
    .then((categoryObj) => {
        // event id passed on to next
        req.params.eventid = categoryObj.eventid;
        req.body = categoryObj;
        return next();
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.insertCategories = (req, res) => {
    gf.insertCategories(req.body)
    .then((categoryObj) => {
        // send it back!
        res.status(200).send(categoryObj);
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

/* MOVED TO GLOBAL FUNCTION
exports.insertSegments = (req, res, next) => {
    //console.log(req.body);
    // get segments for this category
    knex('sc_skatingsegmentdefinitions')
    .where({sc_parentcategory: req.body.definitionid})
    .orderBy('sc_order', 'asc')
    .then((data) => {
        if(data.length > 0) { // there are records for this category
            // create records in segment table
            for (row of data) {
                let segid = uuidv4();
                //console.log(row);
                knex('tbl_segments')
                .insert({
                    segmentid: segid,
                    categoryid: req.body.categoryid,
                    definitionid: row.sc_skatingsegmentdefinitionsid,
                    enname: row.sc_name,
                    frname: row.sc_frenchname,
                    performanceorder: row.sc_order,
                    createdon: req.body.createdon,
                    modifiedon: req.body.modifiedon
                })
                .then(() => {
                    //console.log(segid);
                })
                .catch((err) => {
                    console.log( err); // throw err
                });
            }
        }
        return next();
    })
}
*/
exports.updateCategory = (req, res, next) => {
    gf.updateCategory(req.body)
    .then((categoryObj) => {
        // event id passed on to next
        req.params.eventid = categoryObj.eventid;
        req.body = categoryObj;
        return next();
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.deleteCategory = (req, res, next) => {
    // set param for next call
    //req.params.eventid = req.body.eventid;
    
    knex('tbl_categories')
    .where({ categoryid: req.params.categoryid })
    .del()
    .then((rows) => {
        // deleted - let's send new select
        return next();
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.deleteSegments = (req, res, next) => {
    knex('tbl_segments')
    .where({ categoryid: req.params.categoryid })
    .del()
    .then(() => {
        return next();
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}