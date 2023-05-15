const knexconfig = require('../../knexfile');
const knex = require('knex')(knexconfig.development);
//knex.raw("PRAGMA foreign_keys = ON;").then(() => {
//    console.log("Foreign Key Check activated.");
//});

const isonline = (process.env.ISONLINE == 'true' ? true : false);

const { v4: uuidv4 } = require('uuid');

// insert message into log
exports.insertMsg = (req, res) => {
    return new Promise(function(resolve,reject) {
    
        let logid = uuidv4();
        req["logid"] = uuidv4();
        req["message"] = JSON.stringify(req.message);
        let timestamp = Date.now();
        req["timestamp"] = timestamp;
    
        knex('tbl_msg_log')
        .insert(req)
        .then(() => {
            console.log("inserted in database - then part",logid)
            resolve({'success':true,'output':logid});
            
        })
        .catch((err) => {
            resolve({'success':false,'output':err});
        });

    })


   }


// get messages from log for skate
exports.getMsgs = (req, res) => {
    return new Promise(function(resolve,reject) {
        knex('tbl_msg_log')
        .where('competitorentryid', req.competitorentryid)
        .orderBy('timestamp','ASC')
        .then((rows) => {
            resolve(rows);
        })
        .catch((err) => {
            resolve(err);
        });
    })
    
}