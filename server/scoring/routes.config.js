const scoringController = require('./scoring.controller');

exports.routesConfig = function (app) {

    // score skate
    app.get('/api/calculateskatescore/:skateid', [
        scoringController.httpCalculateSkateScore
    ]);

    // get element details
    app.get('/api/element/:elementid', [
        scoringController.getElementById
    ])

    // score skate element
    app.get('/api/calculateelementscore/:skateelementid', [
        scoringController.httpCalculateElementScore
    ]);
    
    // get skate pc's
    app.get('/api/calculatepcscore/:skateid', [
        scoringController.calculatePCScore
    ]);

    // get skate single pc's
    app.get('/api/calculatedetailedpcscore/:skateid', [
        scoringController.httpCalculateDetailedPCScore
    ]);

    // get skate with score
    app.get('/api/httpgetscoreobj/:skateid', [
        scoringController.httpGetScoreObj
    ])
}