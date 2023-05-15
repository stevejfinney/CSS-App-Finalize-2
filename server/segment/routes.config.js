const segmentController = require('./segment.controller');

exports.routesConfig = function (app) {

    // get all user segments
    app.get('/api/segments/:categoryid', [
        segmentController.segmentsByCategory
    ]);

    // get all available segments
    app.get('/api/availablesegments/:categoryid', [
        segmentController.availableSegmentsByCategory
    ]);

    // update segment order
    app.patch('/api/updatesegmentorder/', [
        segmentController.updateSegmentOrder
    ]);

    // insert new segment
    app.post('/api/segments', [
        segmentController.insertSegment,
        segmentController.segmentsByCategory
    ]);

    // insert multiple new segments
    app.post('/api/bulksegments', [
        segmentController.insertSegments
    ]);

    // update segment
    app.patch('/api/segments', [
        segmentController.updateSegment,
        segmentController.segmentsByCategory
    ]);

    // delete
    app.delete('/api/segments/:segmentid/:categoryid', [
        segmentController.deleteSegment,
        segmentController.segmentsByCategory
    ])

    // get segment by id
    app.get('/api/segment/:segmentid', [
        segmentController.segmentById
    ]);

    // get offcials using segment  id
    app.get('/api/getoffcials/:segmentid', [
        segmentController.officialsAssignment
    ]);

    // get pc factors
    app.get('/api/pcfactors/:definitionid', [
        segmentController.getPcFactors
    ]);

    // get standards criteria
    app.get('/api/standardscriteria/:definitionid', [
        segmentController.getStandardsCriteria
    ]);

    // segment defaults
    app.get('/api/segmentdefaults/:definitionid', [
        segmentController.getSegmentDefinitionDefaults
    ]);

    // segment competitors
    app.get('/api/segmentcompetitors/:segmentid', [
        segmentController.getSegmentCompetitors
    ]);

    // update segment competitor order
    app.patch('/api/updatesegmentcompetitororder/', [
        segmentController.updateSegmentCompetitorOrder
    ]);

    // remove competitor from segment
    app.delete('/api/deletecompetitorentry/:segmentid/:competitorentryid', [
        segmentController.deleteCompetitorEntry,
        segmentController.getSegmentCompetitors
    ]);

    // auto sort compeititors in segment
    app.get('/api/sortcompetitors/:segmentid', [
        segmentController.randomSortOrder,
        segmentController.getSegmentCompetitors
    ]);

    // reverse current sort compeititors in segment
    app.get('/api/revsortcompetitors/:segmentid', [
        segmentController.revSortOrder,
        segmentController.getSegmentCompetitors
    ]);

    // get final rankings of previous segment
    app.get('/api/prevsortcompetitors/:segmentid', [
        segmentController.prevSortOrder,
        segmentController.getSegmentCompetitors
    ]);

    // auto sort compeititors to warmup in segment
    app.get('/api/sortwarmup/:segmentid', [
        segmentController.sortWarmupGroups,
        segmentController.getSegmentCompetitors
    ]);

    // auto sort compeititors to warmup in segment
    app.get('/api/sortpdgroup/:segmentid', [
        segmentController.sortPDGroups,
        segmentController.getSegmentCompetitors
    ]);

    // auto sort compeititors to warmup in segment
    app.get('/api/cyclepdgroup/:segmentid', [
        segmentController.cyclePDGroups,
        segmentController.getSegmentCompetitors
    ]);

    // previous segment by rank
    app.get('/api/prevrankcompetitors/:segmentid', [
        segmentController.sortRankedGroups,
        segmentController.getSegmentCompetitors
    ]);

    // segment officials
    app.get('/api/segmentofficials/:segmentid', [
        segmentController.getSegmentOfficials
    ]);

    // remove official from segment
    app.delete('/api/deleteofficialassignment/:segmentid/:officialassignmentid', [
        segmentController.deleteOfficialAssignment,
        segmentController.getSegmentOfficials
    ]);

    app.get('/api/patterndances', [
        segmentController.getPatternDances
    ]);

    // // toggle rink live feed status
    // app.post('/api/togglelivefeed', [
    //     segmentController.toggleRinkLiveFeedStatus
    // ])

    // get live feed status
    app.get('/api/getfeedstatus/:rinkid', [
        segmentController.getLiveFeedStatus
    ])

    // toggle skater on ice
    app.get('/api/toggleskater/:competitorentryid', [
        segmentController.toggleSkater
    ])

    // toggle event inprogress
    app.post('/api/togglesegment', [
        segmentController.toggleSegmentInprogress
    ])
}