
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');

//Assertion style
chai.should();

chai.use(chaiHttp);


describe('Api Tests',()=>{


    it('should not post new event',async ()=>{

        const params = {
            enname:"testing event",
            endescription: "description for testing event",
            isoffline:'0',
            startdate:'7/15/2021',
            enddate:'7/24/2021',
            frname:'frname',
            frdescription:'frdescription',
            contactid:'60777ebb-28df-eb11-bacb-000d3a560e3d',
            contactname:'Sahil Patel'
        };
            
            let response = await chai.request(server)
            .put('/api/events12/')
            .send('params');
    
            response.should.have.status(404);
            response.body.should.be.a('object');
        
     }); 

     it('should not get events data', async ()=>{
        const params = {
            contactid:'60777ebb-28df-eb11-bacb-000d3a560e3d',
        };
        
        const response = await chai.request(server)
        .post('/api/events12')
        .send(params);

        response.should.have.status(404);
        
    });


    it('should not get single event data using Id',async()=>{
            
        let response = await chai.request(server)
        .get('/api/eventssa/123');
     
        //response.should.have.status(404);
        response.body.should.be.a('object');
     
    });

  
    it('should not update existing event',async ()=>{
                
        const new_params = {
            eventid:"123",
            enname:"testing event changed",
            endescription: "description for testing event is changed",
            isoffline:'0',
            startdate:'7/15/2021',
            enddate:'7/24/2021',
            frname:'frname',
            frdescription:'frdescription',
            contactid:'60777ebb-28df-eb11-bacb-000d3a560e3d'
        
        };

        let response = await chai.request(server)
        .patch('/api/events1234/')
        .send(new_params);

        response.should.have.status(404);
        response.body.should.be.a('object');

    }); 

    xit('should get all events classes',async ()=>{
           
        const response = await chai.request(server)
        .get('/api/eventclasses');

        response.should.have.status(200);
        response.body.should.be.a('array');
    
    });
    

    xit('should get all data specialist',async ()=>{
            
        const response = await chai.request(server)
        .get('/api/dataspecs');
       
        response.should.have.status(200);
        response.body.should.be.a('array');
    
    });

    
    xit('should not get all permission',async ()=>{
            
        const response = await chai.request(server)
        .get('/api/eventpermissions/123');

       response.should.have.status(200);
        response.body.should.be.a('array');
        response.body.length.should.be.eq(0);
    
    });
    
   

    it('should not post new permission for wrong url',async ()=>{
        
        const params = {dscontactid: "123",dsname: "sahil",dspermissionsid:'123',eventid:'1232'};
  
        let response = await chai.request(server)
        .put('/api/insertperm123')
        .send(params);

        response.should.have.status(404);
        response.body.should.be.a('object');
    
     }); 

   
    it('should not delete recenlty added permission using Id',async ()=>{
           
        let response = await chai.request(server)
        .delete('/api/deleteperm123/123/123');

        response.should.have.status(404);
        response.body.should.be.a('object');
       
       
    });

    it('should not delete added permission during inserting event using Id',async ()=>{
       
        let response = await chai.request(server)
        .delete('/api/deleteperm123/1234/ewe');
 
        response.should.have.status(404);
        response.body.should.be.a('object');
       
       
    });
    

    xit('should get all programs',async ()=>{
            
        const response = await chai.request(server)
        .get('/api/categoryprograms');

        response.should.have.status(200);
        response.body.should.be.a('array');

        response.body[0].should.have.property('sc_programsid');
        response.body[0].should.have.property('sc_program_key');
    
    });


    xit('should get all category discipline',async ()=>{
            
        const response = await chai.request(server)
        .get('/api/categorydisciplines');

        response.should.have.status(200);
        response.body.should.be.a('array');

        response.body[0].should.have.property('sc_skatingdisciplinedefinitionid');
    });


    it('should not insert category for an event',async ()=>{

        const params = {categoryid: "",eventid: "123",enname: "test cate",endescription: "dess",programid: "80C41EC5-874A-E511-80FC-FC15B42836D4",disciplineid: "349869AB-D87D-EB11-A812-000D3A99A371",definitionid: "F3BCFDD1-E18B-EB11-A812-000D3A8DC0F1",sortorder: "",status: "Setup",hasreadysegments: "N",hascompetitors: "N",hasofficials: "N",startdate: "2021-09-14T04:00:00.000Z",enddate: "2021-09-23T04:00:00.000Z"}
        
        let response = await chai.request(server)
        .post('/api/categories123')
        .send(params);

        response.should.have.status(404);
        response.body.should.be.a('object');
            

    });
 

    it('should not get all category for event',async ()=>{
            
        const response = await chai.request(server)
        .get('/api/categories/123/123');

        response.body.should.be.a('object');
        
    
    });


    it('should not get single category data using Id',async()=>{
            
        let response = await chai.request(server)
        .get('/api/categoryas/123');
        
        //response.should.have.status(404);
        response.body.should.be.a('object');


    });

    
    it('should not update existing category',async ()=>{
            
        const new_params = {categoryid: "123",eventid: "3244",enname: "test cate new",endescription: "des new",programid: "80C41EC5-874A-E511-80FC-FC15B42836D4",disciplineid: "349869AB-D87D-EB11-A812-000D3A99A371",definitionid: "F3BCFDD1-E18B-EB11-A812-000D3A8DC0F1",sortorder: "",status: "Ready",hasreadysegments: "N",hascompetitors: "N",hasofficials: "N",startdate: "2021-09-14T04:00:00.000Z",enddate: "2021-09-23T04:00:00.000Z"}

        let response = await chai.request(server)
        .patch('/api/categories123/')
        .send(new_params);

        response.should.have.status(404);
        response.body.should.be.a('object');
            
   });
    
   
    it('should get all segment added by user by category',async ()=>{
            
        const response = await chai.request(server)
        .get('/api/segments/123/12');

        response.body.should.be.a('object');
    });

    
    it('should not get all available segment by category',async ()=>{
            
        const response = await chai.request(server)
        .get('/api/availablesegments/123/123');

        response.body.should.be.a('object');
    
    });

    it('should not insert segment for a category',async ()=>{

        const params = {"segmentid": "123","categoryid": "123","definitionid": "7FC9D81D-318B-EB11-A812-000D3A8DCA86","enname": "test","frname": "des2","performanceorder": 3,"programtimemins": 0,"programtimesecs": 0,"programtime": 0,"programhalftimemins": 0,"programhalftimesecs": 0,"programhalftime": 0,"warmuptimemins": 0,"warmuptimesecs": 0,"warmuptime": 0,"warmupgroupmaxsize": 0,"wellbalanced": "no","fallvalue": 0,"reviewtimemins": 0,"reviewtimesecs": 0,"reviewtime": 0}


        let response = await chai.request(server)
        .post('/api/segments12')
        .send(params);
        
        response.should.have.status(404);
        response.body.should.be.a('object');
            

    });
 
    it('should not update existing segment',async ()=>{
                
        const params = {"segmentid": "123","categoryid": "123","definitionid": "7FC9D81D-318B-EB11-A812-000D3A8DCA86","enname": "test","frname": "des2","performanceorder": 3,"programtimemins": 0,"programtimesecs": 0,"programtime": 0,"programhalftimemins": 0,"programhalftimesecs": 0,"programhalftime": 0,"warmuptimemins": 0,"warmuptimesecs": 0,"warmuptime": 0,"warmupgroupmaxsize": 0,"wellbalanced": "no","fallvalue": 0,"reviewtimemins": 0,"reviewtimesecs": 0,"reviewtime": 0}


        let response = await chai.request(server)
        .patch('/api/segments1234/')
        .send(params);

        response.should.have.status(404);
        response.body.should.be.a('object');

    });

    it('should not get segments using Id',async()=>{
            
        let response = await chai.request(server)
        .get('/api/segments12/1234');
        
        //response.should.have.status(404);
        response.body.should.be.a('object');


    });

    it('should not get segment competitors by id',async ()=>{
                
        let response = await chai.request(server)
        .get('/api/segmentcompetitorsqw1/1234');
        
        //response.should.have.status(404);
        response.body.should.be.a('object');

    })

    it('should not update update Segment Competitor Order',async ()=>{
                
        const params = {"segmentid": "123","categoryid": "123","definitionid": "7FC9D81D-318B-EB11-A812-000D3A8DCA86","enname": "test","frname": "des2","performanceorder": 3,"programtimemins": 0,"programtimesecs": 0,"programtime": 0,"programhalftimemins": 0,"programhalftimesecs": 0,"programhalftime": 0,"warmuptimemins": 0,"warmuptimesecs": 0,"warmuptime": 0,"warmupgroupmaxsize": 0,"wellbalanced": "no","fallvalue": 0,"reviewtimemins": 0,"reviewtimesecs": 0,"reviewtime": 0}


        let response = await chai.request(server)
        .patch('/api/updatesegmentcompetitororder123/')
        .send(params);

        response.should.have.status(404);
        response.body.should.be.a('object');

    });

    it('should not get Segment Definition Defaults',async ()=>{
            
        const response = await chai.request(server)
        .get('/api/segmentdefaults/12345/1232');

        //response.should.have.status(404);
        response.body.should.be.a('object');
        
    
    });

    it('should not get Category Definition By Parent',async ()=>{
            
        const response = await chai.request(server)
        .get('/api/categorydefinitions/12345');

        //response.should.have.status(404);
        response.body.should.be.a('object');
        
    
    });

    it('should not get view pc factors',async ()=>{
            
        const response = await chai.request(server)
        .get('/api/pcfactorss/12345');

        //response.should.have.status(404);
        response.body.should.be.a('object');
        
    
    });

    it('should not get search competitors',async ()=>{

        const params = {"competitorentryid":"e96297f0-b785-46df-b16c-6180365d5bc4","segmentid":"0bd14912-3b57-46b3-b95f-b5bc0ec92e4a","sc_competitorid":"6725c4d9-a10e-ec11-b6e5-000d3a171498","sortorder":0,"warmupgroup":null,"sc_name":"Joelle Godere","sc_scnum":"0000008713"}

        let response = await chai.request(server)
        .post('/api/segments12')
        .send(params);
        
        response.should.have.status(404);
        response.body.should.be.a('object');
            

    });
   
    it('should not get random start order',async ()=>{
            
        const response = await chai.request(server)
        .get('/api/sortcompetitors123');

        //response.should.have.status(404);
        response.body.should.be.a('object');
        
    
    });

    it('should not set warm up groups',async ()=>{
            
        const response = await chai.request(server)
        .get('/api/sortwarmup12');

        //response.should.have.status(404);
        response.body.should.be.a('object');
        
    
    });

    it('should not insert segment for a category',async ()=>{

        const params = {"categoryid": "732fb437-8903-4901-abff-f822046c09fd","competitorid": "b9eeb736-e41f-ec11-b6e5-00224822ed42"}
      

        let response = await chai.request(server)
        .post('/api/addcompetitor123')
        .send(params);
        
        response.should.have.status(404);
        response.body.should.be.a('object');
            

    });

    it('should not delete competitors using id',async ()=>{
           
        let response = await chai.request(server)
        .delete('/api/deletecompetitorentry/123');
    
        response.should.have.status(404);
        response.body.should.be.a('object');
       
       
    });

    it('should not delete single segment data using Id',async ()=>{
           
        let response = await chai.request(server)
        .delete('/api/segmentsas/123/123');

        response.should.have.status(404);
        response.body.should.be.a('object');
       
       
    });

    it('should not delete single category data using Id',async ()=>{
           
        let response = await chai.request(server)
        .delete('/api/categories/213/');
        

        //response.should.have.status(404);
        response.body.should.be.a('object');
       
       
    });

    it('should not delete single event data using Id',async ()=>{
           
        let response = await chai.request(server)
        .delete('/api/events/2133/212');

        response.should.have.status(404);
        response.body.should.be.a('object');
       
       
    });


});

