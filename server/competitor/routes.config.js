const competitorController = require('./competitor.controller');

exports.routesConfig = function (app) {

    // search competitors call
    app.post('/api/searchcompetitors/', [
        competitorController.getSearchCompetitors
    ]);
    
    // get all competitors
    app.get('/api/competitors/', [
        competitorController.getAllCompetitors
    ]);

    
    // get all competitors
    app.get('/api/competitorsbycategory/:categoryid', [
        competitorController.getCompetitorsByCategory
    ]);

    // insert competitor
    app.post('/api/addcompetitor/', [
        competitorController.insertCompetitor,
        competitorController.getCompetitorsByCategory
    ]);

    // insert multiple new competitors
    app.post('/api/bulkcompetitors', [
        competitorController.insertCompetitors
    ]);

    // get competitor
    app.get('/api/competitorentry/:competitorentryid', [
        competitorController.getCompetitorByCompetitorentry
    ]);

}