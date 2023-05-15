// Get dependencies
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
require('custom-env').env('dev', __dirname);
const http = require('http');
const fileUpload = require('express-fileupload');

// configuring express
app.use(fileUpload({ 
      useTempFiles: true, 
      tempFileDir: '/tmp/'
}));

app.use(cors());
app.use(express.json()); // use json
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    } else {
        return next();
    }
});


/**** UNCOMMENT THIS SECTION TO USE ANGULAR AS STATIC INSIDE EXPRESS ****/
/*  THE FOLLOWING SETTINGS RUN ANGULAR INSIDE EXPRESS AS ONE APP. */
// Point static path to dist
//app.use(express.static(path.join(__dirname, 'dist')));
/**** UNCOMMENT THIS SECTION TO USE ANGULAR AS STATIC INSIDE EXPRESS ****/


/**** ALSO REMOVE proxy.config.json AND EDIT package.json "start" LINE TO REMOVE CALL TO proxy.config ****/


// load routes
const DbFunctionsRouter = require('./server/dbadmin/routes.config', __dirname);
const AuthFunctionsRouter = require('./server/auth/routes.config', __dirname);
const EventFunctionsRouter = require('./server/event/routes.config', __dirname);
const CategoryFunctionsRouter = require('./server/category/routes.config', __dirname);
const SegmentFunctionsRouter = require('./server/segment/routes.config', __dirname);
const CompetitorFunctionsRouter = require('./server/competitor/routes.config', __dirname);


// get the routes
DbFunctionsRouter.routesConfig(app);
AuthFunctionsRouter.routesConfig(app);
EventFunctionsRouter.routesConfig(app);
CategoryFunctionsRouter.routesConfig(app);
SegmentFunctionsRouter.routesConfig(app);
CompetitorFunctionsRouter.routesConfig(app);


/* Get port from environment and store in Express */
const port = process.env.PORT || process.env.APP_PORT;
app.listen(port, () => console.log(`API running on ${process.env.APP_ENV} at ${port}!`));


app.use(express.static(path.join(__dirname,'./dist')));

app.get('/en/*', (req, res) => res.sendFile(path.join(__dirname,'dist/en/index.html')));
app.get('/fr/*', (req, res) => res.sendFile(path.join(__dirname,'dist/fr/index.html')));


process.on('message', function ({ testsCompletedOk }) {
    console.log('Mockwebapi will terminate. Tests completed ok', testsCompletedOk)
    process.exit(testsCompletedOk === true ? 0 : 1)
});