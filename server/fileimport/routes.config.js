const fileImportController = require('./fileimport.controller');
const categoryController = require('../category/category.controller');

exports.routesConfig = function (app) {

    app.post('/api/eventupload/:eventid/:online', [
        fileImportController.eventUpload,
        categoryController.categoriesByEvent
    ]);

};