const officialController = require('./official.controller');

exports.routesConfig = function (app) {


    // search officials call
    app.post('/api/searchofficialslocal/', [
        officialController.getSearchOfficialsLocal
    ]);

    // search officials call
    app.post('/api/searchofficials/', [
        officialController.getSearchOfficials
    ]);
    
    // insert official
    app.post('/api/addofficial/', [
        officialController.insertOfficial,
        officialController.getOfficialsByCategory
    ]);
    
    // get all officials
    app.get('/api/officialsbycategory/:categoryid', [
        officialController.getOfficialsByCategory
    ]);
    
    // get list of official roles
    app.get('/api/officialroles', [
        officialController.getOfficialRoles
    ]);

    // get official position details
    app.get('/api/officialposition/:officialassignmentid', [
        officialController.getOfficialPosition
    ]);

    // update position
    app.patch('/api/updateofficialposition', [
        officialController.updateOfficialAssignment
    ]);
}