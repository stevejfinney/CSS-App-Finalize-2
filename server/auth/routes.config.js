const authController = require('./auth.controller');

exports.routesConfig = function (app) {
    
    app.post('/api/auth', [
        authController.doAuth
    ]);

    app.get('/api/env', [
        authController.getEnv
    ]);

};