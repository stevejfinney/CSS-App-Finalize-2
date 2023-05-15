const reportingController = require('./reporting.controller');

exports.routesConfig = function (app) {

    app.get('/api/reports/getdetailsheet/:segmentid', [
        reportingController.getDetailSheet
    ]);

    app.get('/api/reports/getstartingorderdata/:segmentid', [
        reportingController.getStartingOrderData
    ]);

    app.get('/api/reports/getofficialdata/:segmentid', [
        reportingController.getOfficialData
    ]);

    app.get('/api/reports/getaccesstostandard/:segmentid', [
        reportingController.getAssessToStandardSegment
    ]);

    app.get('/api/test', [
        reportingController.test_function
    ]);
    
    

    
}