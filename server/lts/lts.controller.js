const SecretKey = process.env.SECRET_KEY;

exports.ltsTest = (req, res) => {
    const submittedObj = req.body;
    console.log(submittedObj);
    if(submittedObj.key == SecretKey) {
        res.status(200).send(JSON.stringify({'result':'true'}));
    }
    else {
        res.status(200).send(JSON.stringify({'result':'false'}));
    }
}

exports.judgeLogin = (req, res) => {
    const submittedObj = req.body;
    if(submittedObj.key == SecretKey) {
        res.status(200).send(JSON.stringify({'result':'true','loggedin':'true'}));
    }
    else {
        res.status(200).send(JSON.stringify({'result':'false','loggedin':'false'}));
    }
}