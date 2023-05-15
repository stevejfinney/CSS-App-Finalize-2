
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');

//Assertion style
chai.should();

chai.use(chaiHttp);

describe('Admin option test for different database operation', () => {


    // Test for checking checkDb function   

    it('should check database request and response handler', async () => {


        const response = await chai.request(server)
            .get('/api/checkdb');

        response.should.be.json;
        response.should.have.status(200);
        response.body.should.be.a('object');

        response.body.should.have.property('result');
        response.body.should.have.property('error');


    });

    // Test for checking rebuildDB function   

    xit('should rebuild database request and response handler', async () => {


        const response = await chai.request(server)
            .get('/api/rebuilddb');

        response.should.have.status(200);
        JSON.parse(response.text).should.be.a('object');
        JSON.parse(response.text).should.have.property("result").eq("true");
        JSON.parse(response.text).should.have.property("error");

    });

    // Test for checking checkDbVersion function

    xit('should check database version', async () => {


        const response = await chai.request(server)
            .get('/api/checkdbversion');

        var status_possible = [200, 400];
        status_possible.should.contain(response.status);

    });



});

