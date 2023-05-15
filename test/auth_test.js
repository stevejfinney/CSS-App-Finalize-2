
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');

//Assertion style
chai.should();

chai.use(chaiHttp);

var token;

xdescribe('Authetication Test for Backend API',()=>{

  
    
   
    it('should not allow user to login with wrong password',async ()=>{
            
        let credential = {
            username:"sahil12197",
            password: "123"
        };

        const response = await chai.request(server)
        .post('/api/auth')
        .send(credential);

        response.should.be.json;
        response.should.have.status(400);
        response.body.should.be.a('object');
        
        response.body.should.have.property('returnError');
        response.body.should.have.property('returnError').eq("Wrong Password");
            

        });


    it('should not allow user to login with wrong username and password',async ()=>{
        
        let credential = {
            username:"sahil",
            password: "123"
        };

        const response = await chai.request(server)
        .post('/api/auth')
        .send(credential);

        response.should.be.json;
        response.should.have.status(400);
        response.body.should.be.a('object');
        
        response.body.should.have.property('returnError');
        response.body.should.have.property('returnError').eq("No User");
       

    });

    it('should not allow user to enter spaces as username and password',async ()=>{
        
        let credential = {
            username:"",
            password: ""
        };

        const response = await chai.request(server)
        .post('/api/auth')
        .send(credential);

        response.should.be.json;
        response.should.have.status(400);
        response.body.should.be.a('object');
        
        response.body.should.have.property('returnError');
        response.body.should.have.property('returnError').eq("No User");
        
      
    });

    it('should not allow user to login with wrong username and password',async ()=>{
        
        let credential = {
            username:"sahil",
            password: "123"
        };

        const response = await chai.request(server)
        .post('/api/auth')
        .send(credential);

        response.should.be.json;
        response.should.have.status(400);
        response.body.should.be.a('object');
        
        response.body.should.have.property('returnError');
        response.body.should.have.property('returnError').eq("No User");

        

    });



});

