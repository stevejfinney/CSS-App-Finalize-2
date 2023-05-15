const eventController = require('./event.controller');

exports.routesConfig = function (app) {
    
    // get all events
    app.post('/api/events', [
        eventController.allEvents
    ]);

    // get judge assignments
    app.post('/api/judgeassignments', [
        eventController.judgeAssignmentsByScnum
    ]);

    // get selected event
    app.get('/api/events/:eventid', [
        eventController.eventById
    ]);

    // get event by segmentid
    app.get('/api/eventbysegmentid/:segmentid', [
        eventController.eventBySegmentId
    ])

    // insert new event
    app.put('/api/events', [
        eventController.insertEvent,
        eventController.allEvents
    ])

    // update selected event
    app.patch('/api/events', [
        eventController.updateEvent,
        eventController.allEvents
    ])

    // delete selected event
    app.delete('/api/events/:eventid', [
        eventController.deleteEvent
    ])

    // get all events classes
    app.get('/api/eventclasses', [
        eventController.allEventClasses
    ]);

    // get event permissions
    app.get('/api/eventpermissions/:eventid', [
        eventController.eventPermissions
    ]);

    // get data specialists
    app.post('/api/dataspecs', [
        eventController.getDataSpecialists
    ]);

    // inset permission
    app.put('/api/insertperm', [
        eventController.insertPerm,
        eventController.eventPermissions
    ])

    // delete perm
    app.delete('/api/deleteperm/:eventid/:dspermissionsid', [
        eventController.deletePerm,
        eventController.eventPermissions
    ])

    // get event rinks
    app.get('/api/rinks/:eventid', [
        eventController.getRinksByEvent
    ]);

    // insert new rink
    app.put('/api/rinks', [
        eventController.insertRink,
        eventController.getRinksByEvent
    ]);

    // update rink
    app.patch('/api/rink', [
        eventController.updateRink,
        eventController.getRinksByEvent
    ])

    // start rink
    app.patch('/api/rink_start', [
        eventController.startRink
    ])

    // start rink
    app.patch('/api/rink_stop', [
        eventController.stopRink
    ])


    // delete rink
    app.delete('/api/rinks/:rinkid/:eventid', [
        eventController.deleteRink,
        eventController.getRinksByEvent
    ]);

    // get rink details
    app.get('/api/rink/:rinkid', [
        eventController.getRinkById
    ])
};