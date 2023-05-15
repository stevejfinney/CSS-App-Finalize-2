const ltsController = require('./lts.controller');

exports.routesConfig = function (app) {
    
    app.post('/api/ltstest', [
        ltsController.ltsTest
    ]);

    app.post('/api/judgeloginrequest', [
        ltsController.judgeLogin
    ]);
};