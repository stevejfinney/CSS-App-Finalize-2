const got = require('got');
const apiUrl = process.env.CLOUD_API_URL;
const isOnline = process.env.ISONLINE;
const apiCloudSecret = process.env.CLOUD_API_SECRET;

const appPort = process.env.APP_PORT;

exports.doAuth = (req, res) => {
    // on receipt of data, grab it!
    const submittedObj = req.body;
        
    (async () => {
        try {
            const {body} = await got.post(`${apiUrl}/auth`, {
                json: submittedObj,
                responseType: 'json'
            });
            res.status(200).send(body);
        }
        catch (error) { // api will send 400 response
            //console.log(error.response);
            res.status(400).send(error.response.body);
        }
        
    })();
}

exports.getEnv = (req, res) => {
    // get whole bunch of environment info, required at app launch
    const envObj = {};

    // get latest api db versions
    getApiDbVersions()
    .then((vars) => {
        var varsObj = JSON.parse(vars);
        envObj.prodVersion = varsObj.prodVersion;
        envObj.stageVersion = varsObj.stageVersion;

        // first, online / offline
        envObj.isOnline = isOnline;

        // port details
        envObj.appPort = appPort;

        res.status(200).send(envObj);
    })

}

async function getApiDbVersions() {
    const {body} = await got(`${apiUrl}/api/envvars`, {
        headers : { "Authorization" : `Raw ${apiCloudSecret}` }
    });
    return body;
}


