const categoryController = require('./category.controller');

exports.routesConfig = function (app) {
    
    // get all events
    app.get('/api/categories/:eventid', [
        categoryController.categoriesByEvent
    ]);

    // get category
    app.get('/api/category/:categoryid', [
        categoryController.categoryById
    ])

    // get disciplines
    app.get('/api/categoryprograms', [
        categoryController.getPrograms
    ])

    // get disciplines
    app.get('/api/categorydisciplines', [
        categoryController.getDisciplines
    ])

    // get defintions
    app.get('/api/categorydefinitions/:programid/:disciplineid', [
        categoryController.getDefinitionsByParent
    ])

    // delete selected event
    app.delete('/api/categories/:eventid/:categoryid', [
        categoryController.deleteCategory,
        categoryController.deleteSegments,
        categoryController.categoriesByEvent
    ])

    // insert new category
    app.post('/api/categories', [
        categoryController.insertCategory,
        //categoryController.insertSegments,
        categoryController.categoriesByEvent
    ])

    // insert multiple new categories
    app.post('/api/bulkcategories', [
        categoryController.insertCategories
    ]);

    // update selected event
    app.patch('/api/categories', [
        categoryController.updateCategory,
        categoryController.categoriesByEvent
    ])

};