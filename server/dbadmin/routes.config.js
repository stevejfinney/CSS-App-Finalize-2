const dbController = require('./dbadmin.controller');

exports.routesConfig = function (app) {
    
    app.get('/api/checkdb', [
        dbController.checkDb
    ]);

    app.get('/api/rebuilddb', [
        dbController.rebuildDb
    ]);
    
    app.get('/api/checkdbversion', [
        dbController.checkDbVersion
    ]);

    app.post('/api/updatedefinitions', [
        dbController.updateDefinitions
    ]);

    app.get('/api/scoringtotest', [
        dbController.scoringToTest
    ]);

    app.get('/api/testtoprod', [
        dbController.testToProduction
    ]);


    // insert new category
    app.post('/api/rating_insert', [
        dbController.insertTemplatedElementApi
    ])

    app.post('/api/tem_seg_skater_info', [
        dbController.getTemplatedSegSkaterInfo
    ])

};
