const spawn = require('cross-spawn');

const fork = require('child_process').fork
const mockWebapi = fork('./mock_api_test.js');

 
const karma = spawn.sync(
    'npm',
    ['run','pro'], { stdio: 'inherit' }
);

console.log(karma);


let gracefullyCloseMockWebapi = (testsCompletedOk) => {
    console.log('Gracefuly close webapi. Tests completed ok:', testsCompletedOk);
    mockWebapi.send({ testsCompletedOk });
};

if (karma.status == 0) 
{
    console.log('Karma closed. status:', karma.status, 'Signal:', karma.signal);
    gracefullyCloseMockWebapi(true);
}

if (karma.status !== 0) 
{
    console.log('Karma error happened. status:', karma.status, 'Signal:', karma.signal);
    gracefullyCloseMockWebapi(false);
}


mockWebapi.on('close', (code, signal) => { 
    console.log('Mock webapi closed. -- Status:', karma.status);
    process.exit(karma.status);
});