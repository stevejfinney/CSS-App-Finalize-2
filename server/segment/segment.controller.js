const e = require('cors');
const knexconfig = require('../../knexfile');
const knex = require('knex')(knexconfig.development);
const gf = require('../functions/global.functions');
//knex.raw("PRAGMA foreign_keys = ON;").then(() => {
//    console.log("Foreign Key Check activated.");
//});
const { v4: uuidv4 } = require('uuid');
const apiUrl = process.env.CLOUD_API_URL;

const isonline = (process.env.ISONLINE == 'true' ? true : false);

const media_functions = require('../media_service/functions');
const md5 = require('md5');

exports.segmentsByCategory = (req, res) => {
    // have to have seperate calls for online (mssql) and offline (sqlite)
    if(isonline) {
        knex.raw(`
        select tbl_segments.*,
        css_sc_skatingpatterndancedefinition.sc_name as engpdname, 
        css_sc_skatingpatterndancedefinition.sc_frenchname as frpdname,
        tbl_rink.name as rinkname,
        css_sc_skatingelementconfiguration.sc_mode as elconfig
        from tbl_segments 
        left join css_sc_skatingpatterndancedefinition on convert(varchar(36),css_sc_skatingpatterndancedefinition.sc_skatingpatterndancedefinitionid) = tbl_segments.patterndanceid 
        left join tbl_rink on tbl_rink.rinkid = tbl_segments.rinkid
        left join css_sc_skatingsegmentdefinitions on css_sc_skatingsegmentdefinitions.sc_skatingsegmentdefinitionsid = tbl_segments.definitionid
        left join css_sc_skatingelementconfiguration on css_sc_skatingelementconfiguration.sc_skatingelementconfigurationid = css_sc_skatingsegmentdefinitions.sc_elementconfiguration
        where categoryid = '${req.params.categoryid}' order by performanceorder asc
        `)
        .then((rows) => {
            rows.forEach((row, index, array) => {
                // build languages object
                row.languages = {
                                    'en':{
                                            name:row.enname,
                                            pdname:row.engpdname
                                        },
                                    'fr':{
                                            name:row.frname,
                                            pdname:row.frpdname
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
    else {
        knex.select(
            'tbl_segments.*',
            'css_sc_skatingpatterndancedefinition.sc_name as engpdname',
            'css_sc_skatingpatterndancedefinition.sc_frenchname as frpdname',
            'tbl_rink.name as rinkname',
            'css_sc_skatingelementconfiguration.sc_mode as elconfig'
        )
        .from('tbl_segments')
        .leftJoin('css_sc_skatingpatterndancedefinition','css_sc_skatingpatterndancedefinition.sc_skatingpatterndancedefinitionid','=','tbl_segments.patterndanceid')
        .leftJoin('tbl_rink','tbl_rink.rinkid','tbl_segments.rinkid')
        .leftJoin('css_sc_skatingsegmentdefinitions','css_sc_skatingsegmentdefinitions.sc_skatingsegmentdefinitionsid','tbl_segments.definitionid')
        .leftJoin('css_sc_skatingelementconfiguration','css_sc_skatingelementconfiguration.sc_skatingelementconfigurationid','css_sc_skatingsegmentdefinitions.sc_elementconfiguration')
        .where('categoryid',req.params.categoryid)
        .orderBy('performanceorder','asc')
        .then((rows) => {
            rows.forEach((row, index, array) => {
                // build languages object
                row.languages = {
                                    'en':{
                                            name:row.enname,
                                            pdname:row.engpdname
                                        },
                                    'fr':{
                                            name:row.frname,
                                            pdname:row.frpdname
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
}

exports.availableSegmentsByCategory = (req, res) => {
    knex.select('css_sc_skatingsegmentdefinitions.*')
    .from('css_sc_skatingsegmentdefinitions')
    .leftJoin('tbl_categories','tbl_categories.definitionid','css_sc_skatingsegmentdefinitions.sc_parentcategory')
    .where('tbl_categories.categoryid',req.params.categoryid)
    .orderBy('sc_order','asc')
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

exports.segmentById = (req, res) => {
    knex.select(
        'tbl_segments.*',
        'css_sc_skatingsegmentdefinitions.*',
        'tbl_rink.name as rinkname',
        'tbl_rink.videofeed as videofeed',
        'tbl_rink.islive as islive'
        )
    .from('tbl_segments')
    .leftJoin('tbl_rink','tbl_rink.rinkid','tbl_segments.rinkid')
    .leftJoin('css_sc_skatingsegmentdefinitions','css_sc_skatingsegmentdefinitions.sc_skatingsegmentdefinitionsid','tbl_segments.definitionid')
    .where('tbl_segments.segmentid',req.params.segmentid)
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

exports.updateSegmentOrder = (req, res) => {
    
    knex.transaction(trx => {
        const queries = [];
        req.body.forEach(segment => {
            const query = knex('tbl_segments')
                .where('segmentid', segment.segmentid)
                .update('performanceorder',segment.performanceorder)
                .transacting(trx); // This makes every update be in the same transaction
            queries.push(query);
        });
        
        Promise.all(queries) // Once every query is written
            .then(trx.commit) // We try to execute all of them
            .catch(trx.rollback); // And rollback in case any of them goes wrong
    })
    .then((resp) => {
        res.status(200).send(resp);
    });
}

exports.insertSegment = (req, res, next) => {
    gf.insertSegment(req.body)
    .then((segmentObj) => {
        // event id passed on to next
        req.params.categoryid = segmentObj.categoryid;
        req.body = segmentObj;
        return next();
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.insertSegments = (req, res) => {
    gf.insertSegments(req.body)
    .then((segmentsObj) => {
        console.log(segmentsObj);
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.updateSegment = (req, res, next) => {
    gf.updateSegment(req.body)
    .then((segmentObj) => {
        // event id passed on to next
        req.params.categoryid = segmentObj.categoryid;
        req.body = segmentObj;
        return next();
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.deleteSegment = (req, res, next) => {
    knex('tbl_segments')
    .where({ segmentid: req.params.segmentid })
    .del()
    .then((rows) => {
        // deleted - let's send new select
        return next();
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.getPcFactors = (req, res) => {
    knex.select(
        'css_sc_skatingprogramcomponentdefinition.*',
        'css_sc_skatingprogramcomponenttype.sc_name as pt_enname',
        'css_sc_skatingprogramcomponenttype.sc_frenchname as pt_frname',
    )
    .from('css_sc_skatingprogramcomponentdefinition')
    .leftJoin('css_sc_skatingprogramcomponenttype','css_sc_skatingprogramcomponenttype.sc_skatingprogramcomponenttypeid','css_sc_skatingprogramcomponentdefinition.sc_pctype')
    .where('css_sc_skatingprogramcomponentdefinition.sc_parentsegment',req.params.definitionid)
    .orderBy('sc_name','asc')
    .then((rows) => {
        if(rows.length > 0) {
            rows.forEach((row, index, array) => {
                // build languages object
                row.languages = {
                                    'en':{
                                            pt_name:row.pt_enname
                                        },
                                    'fr':{
                                            pt_name:row.pt_frname
                                        }
                                };
                
                // remove other language fields
                delete row.pt_enname;
                delete row.pt_frname;
                
                if(index === array.length-1) {
                    res.status(200).send(rows);
                }
            });
        }
        else {
            res.status(200).send({error:'no rows'});
        }
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.getStandardsCriteria = (req, res) => {
    knex.select(
        'css_sc_skatingstandardscriteria.*',
        'css_sc_skatingelementdefinition.sc_longname as enname',
        'css_sc_skatingelementdefinition.sc_longnamefrench as frname',
    )
    .from('css_sc_skatingstandardscriteria')
    .leftJoin('css_sc_skatingelementdefinition','css_sc_skatingelementdefinition.sc_skatingelementdefinitionid','css_sc_skatingstandardscriteria.sc_targetelement')
    .where('css_sc_skatingstandardscriteria.sc_segment',req.params.definitionid)
    .then((rows) => {
        if(rows.length > 0) {
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
        }
        else {
            res.status(200).send({error:'no rows'});
        }
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.getSegmentDefinitionDefaults = (req, res) => {
    knex('css_sc_skatingsegmentdefinitions')
    .where('sc_skatingsegmentdefinitionsid',req.params.definitionid)
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

exports.getSegmentCompetitors = (req, res) => {
    knex.select(
        'tbl_competitorentry.competitorentryid',
        'tbl_competitorentry.segmentid as segmentid',
        'tbl_competitorentry.sc_competitorid',
        'tbl_competitorentry.sortorder',
        'tbl_competitorentry.subgroup',
        'tbl_competitorentry.warmupgroup',
        'tbl_competitorentry.onice',
        'tbl_competitorentry.score',
        'css_sc_competitors.sc_name',
        'css_sc_competitors.sc_scnum'
    )
    .from('tbl_competitorentry')
    .leftJoin('css_sc_competitors','css_sc_competitors.sc_competitorid','tbl_competitorentry.sc_competitorid')
    .where('tbl_competitorentry.segmentid',req.params.segmentid)
    .orderBy('tbl_competitorentry.sortorder','asc')
    .then((rows) => {
        res.status(200).send(rows);
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.updateSegmentCompetitorOrder = (req, res) => {
    knex.transaction(trx => {
        const queries = [];
        req.body.forEach(segment => {
            const query = knex('tbl_competitorentry')
                .where('competitorentryid', segment.competitorentryid)
                .update('sortorder',segment.sortorder)
                .transacting(trx); // This makes every update be in the same transaction
            queries.push(query);
        });
        
        Promise.all(queries) // Once every query is written
            .then(trx.commit) // We try to execute all of them
            .catch(trx.rollback); // And rollback in case any of them goes wrong
    })
    .then((resp) => {
        res.status(200).send(resp);
    });
}

exports.deleteCompetitorEntry = (req, res, next) => {
    knex('tbl_competitorentry')
    .where({ competitorentryid: req.params.competitorentryid })
    .del()
    .then((rows) => {
        // deleted - let's send new select
        return next();
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.randomSortOrder = (req, res, next) => {
    // get competitors
    knex.select('competitorentryid')
    .from('tbl_competitorentry')
    .where({ segmentid: req.params.segmentid })
    .then((rows) => {
        // shuffle them
        shuffle(rows)
        .then((rows) => {
            var len = rows.length;
            for(i=0; i<len; i++) {
                rows[i].sortorder = i+1;
            }
            knex.transaction(trx => {
                const queries = [];
                rows.forEach(row => {
                    const query = knex('tbl_competitorentry')
                        .where('competitorentryid', row.competitorentryid)
                        .update('sortorder', row.sortorder)
                        .transacting(trx); // This makes every update be in the same transaction
                    queries.push(query);
                });
                
                Promise.all(queries) // Once every query is written
                    .then(trx.commit) // We try to execute all of them
                    .catch(trx.rollback); // And rollback in case any of them goes wrong
            })
            .then(() => {
                return next();
            });
        });
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.sortWarmupGroups = (req, res, next) => {
    // get segment details
    knex('tbl_segments')
    .where({ segmentid: req.params.segmentid })
    .then((rows) => {
        const maxGroupSize = rows[0].warmupgroupmaxsize;
        // get competitors for seg
        knex.select()
        .from('tbl_competitorentry')
        .where({ segmentid: req.params.segmentid })
        .orderBy('sortorder','asc')
        .then((comps) => {
            // how many competitors
            var numComps = comps.length;
            
            numgroups = Math.ceil(numComps/maxGroupSize);

            // if number of comps < max size,
            // we return 2 groups rather than 1 single group
            if (numComps <= maxGroupSize) {
                numgroups = 2;
            }

            var a = [];
            s = numComps;
            while (s--)
                a.unshift(s);
            var groups = chunkify(a,numgroups);
            
            // groups contains an array of the group break down
            // [5, 5] for example - two groups of 5 if there are 10 skaters, and max group size of 6

            // now to iterate through that groups array and populate competitor records based on group
            var compsCounter = 0;
            //console.log(groups)
            
            for(y=0;y<groups.length;y++) {
                var gCount = 0;
                while(gCount < groups[y]) {
                    comps[compsCounter].warmupgroup = y+1;
                    gCount++;
                    compsCounter++;
                }
            }

            knex.transaction(trx => {
                const queries = [];
                comps.forEach(row => {
                    const query = knex('tbl_competitorentry')
                        .where('competitorentryid', row.competitorentryid)
                        .update('warmupgroup', row.warmupgroup)
                        .transacting(trx); // This makes every update be in the same transaction
                    queries.push(query);
                });
                
                Promise.all(queries) // Once every query is written
                    .then(trx.commit) // We try to execute all of them
                    .catch(trx.rollback); // And rollback in case any of them goes wrong
            })
            .then(() => {
                return next();
            });
        });
    })
    .catch((err) => {
        console.log( err); // throw err
    });
    
}

function chunkify(a, numgroups) {
    
	// if one competitor
    if (numgroups < 2)
        return [a];

	var len = a.length,
            out = [],
            i = 0,
            size;

    if (len % numgroups === 0) {
        size = Math.floor(len / numgroups);
        while (i < len) {
            arr = a.slice(i, i += size);
			out.push(arr.length);
        }
    }

    else {
        while (i < len) {
            size = Math.ceil((len - i) / numgroups--);
            arr = a.slice(i, i += size);
			out.push(arr.length);
        }
    }
	
	// flip that array
	out.reverse();
    return out;
}

async function shuffle(array) {
    return data = await new Promise((resolve,reject) => {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
        
            // swap elements array[i] and array[j]
            // we use "destructuring assignment" syntax to achieve that
            // you'll find more details about that syntax in later chapters
            // same can be written as:
            // let t = array[i]; array[i] = array[j]; array[j] = t
            [array[i], array[j]] = [array[j], array[i]];
        }
        resolve(array);
    });
}

exports.sortRankedGroups = (req, res, next) => {
    // get prev segment competitors in order of highest to last
    knex.raw(
        `select * from tbl_competitorentry
        where segmentid = 
        (select segmentid from tbl_segments where categoryid = (select categoryid from tbl_segments where segmentid = ?) and performanceorder = ((select performanceorder from tbl_segments where segmentid = ?) - 1))
        order by score desc`,
        [req.params.segmentid,req.params.segmentid]
    )
    .then((rows) => {
        console.log(rows)
        if(rows.length < 1) {
            // no other segments, get out of here
            return next();
        }
        else {
            // reorder
            var len = rows.length;
            for(i=0; i<len; i++) {
                rows[i].sortorder = i+1;
            }
            
            // save
            knex.transaction(trx => {
                const queries = [];
                rows.forEach(row => {
                    const query = knex('tbl_competitorentry')
                        .where('sc_competitorid', row.sc_competitorid)
                        .andWhere('segmentid', req.params.segmentid)
                        .update('sortorder', row.sortorder)
                        .transacting(trx); // This makes every update be in the same transaction
                    queries.push(query);
                });
                
                Promise.all(queries) // Once every query is written
                    .then(trx.commit) // We try to execute all of them
                    .catch(trx.rollback); // And rollback in case any of them goes wrong
            })
            .then(() => {
                return next();
            });
        }
    })

}

exports.sortPDGroups = (req, res, next) => {
    // get number of dances in segment

    // split into that number of groups
    // get segment details
    //knex.raw(`select segmentid from tbl_segments where categoryid = (select categoryid from tbl_segments where segmentid = ?)`,[req.params.segmentid])
    // only pulls actual pattern dance segments
    knex.raw(`
        select s1.segmentid from tbl_segments as s1
        left join css_sc_skatingsegmentdefinitions as s2 on s2.sc_skatingsegmentdefinitionsid = s1.definitionid
        where s1.categoryid = (select categoryid from tbl_segments where segmentid = ?)
        and s2.sc_patterndancesegment = 1`,[req.params.segmentid])
    .then((rows) => {
        const numDances = rows.length;
        //console.log(rows)
        // get competitors for seg
        knex.select()
        .from('tbl_competitorentry')
        .where({ segmentid: req.params.segmentid })
        .orderBy('sortorder','asc')
        .then((comps) => {
            // how many competitors
            var numComps = comps.length;
            
            numgroups = numDances;

            var a = [];
            s = numComps;
            while (s--)
                a.unshift(s);
            var groups = chunkify(a,numgroups);
            
            // groups contains an array of the group break down
            // [5, 5] for example - two groups of 5 if there are 10 skaters, and max group size of 6

            // now to iterate through that groups array and populate competitor records based on group
            var compsCounter = 0;
            //console.log(groups)
            
            for(y=0;y<groups.length;y++) {
                var gCount = 0;
                while(gCount < groups[y]) {
                    comps[compsCounter].subgroup = y+1;
                    gCount++;
                    compsCounter++;
                }
            }

            knex.transaction(trx => {
                const queries = [];
                comps.forEach(row => {
                    const query = knex('tbl_competitorentry')
                        .where('competitorentryid', row.competitorentryid)
                        .update('subgroup', row.subgroup)
                        .transacting(trx); // This makes every update be in the same transaction
                    queries.push(query);
                });
                
                Promise.all(queries) // Once every query is written
                    .then(trx.commit) // We try to execute all of them
                    .catch(trx.rollback); // And rollback in case any of them goes wrong
            })
            .then(() => {
                return next();
            });
        });
    })
    .catch((err) => {
        console.log( err); // throw err
    });

}

exports.cyclePDGroups = (req, res, next) => {
    // get current order
    knex('tbl_competitorentry')
    .where({ segmentid: req.params.segmentid })
    .orderBy('sortorder','asc')
    .then((rows) => {
        // move current first group to end of array
        var curGroup = rows[0].subgroup;
        // get items to move
        const moveItems = rows.filter(row => row.subgroup === curGroup);
        
        // delete these from current
        for(x=0;x<rows.length;x++) {
            for(y=0;y<moveItems.length;y++) {
                if(rows[x].competitorentryid === moveItems[y].competitorentryid) {
                    rows.splice(x,1)
                }
            }
        }

        // push them to end
        for(y=0;y<moveItems.length;y++) {
            rows.push(moveItems[y])
        }
        
        // reorder
        var len = rows.length;
        for(i=0; i<len; i++) {
            rows[i].sortorder = i+1;
        }
        // save
        knex.transaction(trx => {
            const queries = [];
            rows.forEach(row => {
                const query = knex('tbl_competitorentry')
                    .where('competitorentryid', row.competitorentryid)
                    .update('sortorder', row.sortorder)
                    .transacting(trx); // This makes every update be in the same transaction
                queries.push(query);
            });
            
            Promise.all(queries) // Once every query is written
                .then(trx.commit) // We try to execute all of them
                .catch(trx.rollback); // And rollback in case any of them goes wrong
        })
        .then(() => {
            return next();
        });
    }) 
}

exports.revSortOrder = (req, res, next) => {
    // reverse current saved sort order
    // get current skaters in reverse order
    knex.select('competitorentryid')
    .from('tbl_competitorentry')
    .where({ segmentid: req.params.segmentid })
    .orderBy('sortorder','desc')
    .then((rows) => {
        // reorder
        var len = rows.length;
        for(i=0; i<len; i++) {
            rows[i].sortorder = i+1;
        }
        // save
        knex.transaction(trx => {
            const queries = [];
            rows.forEach(row => {
                const query = knex('tbl_competitorentry')
                    .where('competitorentryid', row.competitorentryid)
                    .update('sortorder', row.sortorder)
                    .transacting(trx); // This makes every update be in the same transaction
                queries.push(query);
            });
            
            Promise.all(queries) // Once every query is written
                .then(trx.commit) // We try to execute all of them
                .catch(trx.rollback); // And rollback in case any of them goes wrong
        })
        .then(() => {
            return next();
        });
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.prevSortOrder = (req, res, next) => {
    var thissegmentid = req.params.segmentid;
    // get ranking of skaters in previous
    knex.raw(`select segmentid from tbl_segments where categoryid = (select categoryid from tbl_segments where segmentid = ?) and performanceorder = ((select performanceorder from tbl_segments where segmentid = ?) - 1)`,[thissegmentid,thissegmentid])
    .then((rows) => {
        if(rows.length < 1) {
            // no other segments, get out of here
            return next();
        }
        else {
            var prevsegmentid = rows[0].segmentid;
            // get ranked order of competitors from segment and reorder in reverse

            knex('tbl_competitorentry')
            .where({ segmentid: prevsegmentid })
            .orderBy('sortorder','asc')
            .then((rows2) => {
                if(rows2.length < 1) {
                    // no competitors get out!
                    return next();
                }
                else {
                    // reorder
                    /*var len = rows2.length;
                    for(i=0; i<len; i++) {
                        rows2[i].sortorder = i+1;
                    }*/
                    // save
                    knex.transaction(trx => {
                        const queries = [];
                        rows2.forEach(row => {
                            const query = knex('tbl_competitorentry')
                                .where('sc_competitorid', row.sc_competitorid)
                                .andWhere('segmentid', thissegmentid)
                                .update('sortorder', row.sortorder)
                                .update('warmupgroup', row.warmupgroup)
                                .update('subgroup', row.subgroup)
                                .transacting(trx); // This makes every update be in the same transaction
                            queries.push(query);
                        });
                        
                        Promise.all(queries) // Once every query is written
                            .then(trx.commit) // We try to execute all of them
                            .catch(trx.rollback); // And rollback in case any of them goes wrong
                    })
                    .then(() => {
                        return next();
                    });
                }
            })
        }
    })
}

exports.getSegmentOfficials = (req, res) => {
    knex.select(
        'tbl_officialassignment.officialassignmentid',
        'css_sc_officials.sc_fullname',
        'css_sc_officials.sc_scnum',
        'tbl_officialassignment.role',
        'tbl_officialassignment.position',
        'css_sc_skatingofficialrole.sc_name as enname',
        'css_sc_skatingofficialrole.sc_frenchname as frname',
    )
    .from('tbl_officialassignment')
    .leftJoin('css_sc_officials','css_sc_officials.sc_officialid','tbl_officialassignment.sc_officialid')
    .leftJoin('css_sc_skatingofficialrole','css_sc_skatingofficialrole.sc_skatingofficialroleid','tbl_officialassignment.role')
    .where('tbl_officialassignment.segmentid',req.params.segmentid)
    .orderBy('css_sc_officials.sc_fullname','asc')
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

exports.deleteOfficialAssignment = (req, res, next) => {
    knex('tbl_officialassignment')
    .where({ officialassignmentid: req.params.officialassignmentid })
    .del()
    .then((rows) => {
        // deleted - let's send new select
        return next();
    })
    .catch((err) => {
        console.log( err); // throw err
    });
}

exports.getPatternDances = (req, res) => {
    knex('css_sc_skatingpatterndancedefinition')
    .orderBy('sc_name')
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

// exports.toggleRinkLiveFeedStatus = (req, res) => {
    
//     // NEED TO ADD FURTHER FEED CHECKS HERE
//     // SUCH AS LINKS TO AZURE API?????
//     // BUT FOR NOW A SIMPLE TOGGLE
    
//     knex('tbl_rink')
//     .where({ rinkid:req.body.rinkid })
//     .update({islive:req.body.islive})
//     .then((rows) => {
//         if(req.body.islive == 1) {
//             var resp = 'on';
//         }
//         else {
//             var resp = 'off';
//         }
//         res.status(200).send({response:resp});
//     })
//     .catch((err) => {
//         console.log( err); // throw err
//     })
// }

exports.getLiveFeedStatus = (req, res) => {
    knex('tbl_rink')
    .where({ rinkid:req.params.rinkid, islive:1 })
    .then((rows) => {
        if(rows.length > 0) {
            var resp = {feedlive:1}
        }
        else {
            var resp = {feedlive:0}
        }
        res.status(200).send(resp);
    })
    .catch((err) => {
        console.log( err); // throw err
    })
}

// toggle skater on / off ice
exports.toggleSkater = (req, res) => {
    var onice = 1;
    // get current onice status
    knex.select('onice')
    .from('tbl_competitorentry')
    .where({ competitorentryid:req.params.competitorentryid })
    .then((rows) => {
        // if onice then set to 0, else keep as 1
        if(rows[0].onice == 1) {
            onice = 0;
        }
        // then update
        //console.log(onice)
        knex('tbl_competitorentry')
        .where({ competitorentryid:req.params.competitorentryid })
        .update({onice:onice})
        .then((rows) => {
            res.status(200).send({response:'ok'});
        })
        .catch((err) => {
            console.log( err); // throw err
        })
    })
    .catch((err) => {
        console.log( err); // throw err
    })
}

exports.toggleSegmentInprogress = (req, res) => {
    var segmentid = req.body.segmentid;
    var inprogress = req.body.inprogress;
    if(inprogress == 1) {
        // if we are switching this on then need to check status of event before activation
        checkSegmentStatus(segmentid)
        .then((response) => {
            // if response is true then set event active
            if(response.pass == 'true') {
                knex('tbl_segments')
                .where({ segmentid:segmentid })
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
        knex('tbl_segments')
        .where({ segmentid:segmentid })
        .update({inprogress:inprogress})
        .then((rows) => {

            // if inprogress=0 then set all skaters off ice
            
            knex('tbl_competitorentry')
            .where({segmentid:segmentid})
            .then((rows3) => {

                console.log("rows for coming 3",rows3)
                // var respObj = {pass:'true'};
                
                // // check each row, and check values > 0
                if(rows3.length > 0) {
                    rows3.forEach((element, index, array) => {

                     
                        knex('tbl_competitorentry')
                        .where({competitorentryid:element["competitorentryid"]})
                        .update({'onice':0})
                        .then(() => {

                        
                            if(index == rows3.length-1)
                            {
                                res.status(200).send({response:'ok'});
                            }
                        })
                    })
                }
                else
                {
                    res.status(200).send({response:'ok'});
                }
                    
                
            });

            
            
        })
        .catch((err) => {
            console.log( err); // throw err
        })
    }
}

/*
CHECK IF SEGMENT IS READY TO RUN
*/
function checkSegmentStatus(segmentid) {
    
    return new Promise(function(resolve,reject) {
        
        // subquery to get segment skater count
        var qrysegmentid = knex.ref('tbl_segments.segmentid');
        var skaterCountQuery = knex.raw(
            `(select count(competitorentryid) 
            from tbl_competitorentry 
            where segmentid = ?) as skatercount`,[qrysegmentid]);

        var officialCountQuery = knex.raw(
            `(select count(officialassignmentid) 
            from tbl_officialassignment 
            where segmentid = ?) as officialcount`,[qrysegmentid]);
        
        // check event has segment with skaters and officials
        knex.select([
            'tbl_segments.segmentid',
            skaterCountQuery,
            officialCountQuery
        ])
        .from('tbl_segments')
        .where('tbl_segments.segmentid', segmentid)
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

exports.officialsAssignment = (req, res) => {

    
    knex.select([
        'tbl_officialassignment.*',
        'css_sc_skatingofficialrole.sc_name as role_enname',
        'css_sc_skatingofficialrole.sc_frenchname as role_frname'
    ])
    .from('tbl_officialassignment')
    .leftJoin('css_sc_officials','css_sc_officials.sc_officialid','tbl_officialassignment.sc_officialid')
    .leftJoin('css_sc_skatingofficialrole','css_sc_skatingofficialrole.sc_skatingofficialroleid','tbl_officialassignment.role')
    .where('tbl_officialassignment.segmentid', req.params.segmentid)
    .then((rows) => {
        
        res.status(200).send(rows);
    })
    .catch((err) => {
        console.log( err); // throw err
    });

}
