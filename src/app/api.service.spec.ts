import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpErrorResponse } from '@angular/common/http';


describe('Api Services',()=>{

  let api : ApiService,
  httpTestingController:HttpTestingController;
  
  
    beforeEach(async()=>{
      TestBed.configureTestingModule({
        imports:[HttpClientTestingModule,RouterTestingModule],
        providers:[
          ApiService
        ],
      }).compileComponents;

      api = TestBed.get(ApiService);
      httpTestingController = TestBed.get(HttpTestingController);
     
      
    });

    afterEach(() => {
      httpTestingController.verify(); //Verifies that no requests are outstanding.
    });

    it('should send credential to auth function and return it',()=>{

      let tem = {password: "Password12", username: "sahil12197"};

      api.doAuth(tem).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        expect(res).toEqual(tem, 'should return the credential'),fail;
      
        //console.log(Object.values(res));
    
      })

      const req = httpTestingController.expectOne('/api/auth');
      expect(req.request.method).toEqual("POST");
      expect(req.request.responseType).toEqual('json');
      expect(req.request.body).toEqual(tem);
      
      req.flush(tem);

    });


    it('should checkdb function',()=>{

      api.checkDb().subscribe(res=>{

        expect(res).toBeTruthy("No data");
        var data = Object.values(res);
        expect(data[0]).toBe("available");
        
      })

      const req = httpTestingController.expectOne('/api/checkdb',"targeted url is wrong");
      expect(req.request.method).toEqual("GET");

      let temp = {"db":"available"};
      req.flush(temp);

    });


    it('should rebuildDb function',()=>{

      api.rebuildDb().subscribe(res=>{

        expect(res).toBeTruthy("No data");
        var data = Object.values(res);
        expect(data[0]).toBe("yes");
        
      })

      const req = httpTestingController.expectOne('/api/rebuilddb',"targeted url is wrong");
      expect(req.request.method).toEqual("GET");

      let temp = {"rebuilddb":"yes"};
      req.flush(temp);

    });

    it('should check Db version function',()=>{

      api.checkDbVersion().subscribe(res=>{

        expect(res).toBeTruthy("No data");
        var data = Object.values(res);
        expect(data[0]).toBe("yes");
        
      })

      const req = httpTestingController.expectOne('/api/checkdbversion',"targeted url is wrong");
      expect(req.request.method).toEqual("GET");

      let temp = {"checkdbversion":"yes"};
      req.flush(temp);

    });
    

    it('should send data to update defination function and return it',()=>{

      let tem = {accessToken: "1234567890"};

      api.updateDefinitions(tem).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        expect(res).toEqual(tem, 'should return the credential'),fail;
       
      })

      const req = httpTestingController.expectOne('/api/updatedefinitions');
      expect(req.request.method).toEqual("POST");
      expect(req.request.responseType).toEqual('json');
      expect(req.request.body).toEqual(tem);
      
      req.flush(tem);

    });

    it('should get all event data ',()=>{

      api.getEvents().subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        temp = Object.values(res);
        expect(temp.length).toBe(2,"Incorrect number of events");
        const event = temp.find(event => event.eventid=="1badb6d2-adb4-4a0f-820e-9e2e9908aeb4","sc_skatingeventclassid");
        expect(event?.contactid).toBe('1234567890');
        
      })

      const req = httpTestingController.expectOne('/api/events');
      expect(req.request.method).toEqual("POST");

      let temp = [{"eventid":"1badb6d2-adb4-4a0f-820e-9e2e9908aeb4","sc_skatingeventclassid":null,"isoffline":0,"enname":"test2","endescription":"des2","frname":null,"frdescription":null,"startdate":"2021-07-08T04:00:00.000Z","enddate":"2021-07-16T04:00:00.000Z","createdon":"2021-07-08T16:25:59.714Z","modifiedon":"2021-07-08T16:25:59.714Z","sc_name":null,"sc_frenchname":null,"contactid":"1234567890"},{"eventid":"bb447d06-92ec-45b0-aadb-b98c9bffc13e","sc_skatingeventclassid":null,"isoffline":0,"enname":"test","endescription":"des","frname":null,"frdescription":null,"startdate":"2021-07-07T04:00:00.000Z","enddate":"2021-07-08T04:00:00.000Z","createdon":"2021-07-07T16:01:51.431Z","modifiedon":"2021-07-07T16:01:51.431Z","sc_name":null,"sc_frenchname":null,"contactid":"1234567890"}];
      
      req.flush(temp);

    });

    it('should get single event data ',()=>{

      let temp = [{"eventid":"1badb6d2-adb4-4a0f-820e-9e2e9908aeb4","sc_skatingeventclassid":null,"isoffline":0,"enname":"test2","endescription":"des2","frname":null,"frdescription":null,"startdate":"2021-07-08T04:00:00.000Z","enddate":"2021-07-16T04:00:00.000Z","createdon":"2021-07-08T16:25:59.714Z","modifiedon":"2021-07-08T16:25:59.714Z","sc_name":null,"sc_frenchname":null,"contactid":"1234567890"}];
      
      api.getEventById(temp[0].eventid).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        temp = Object.values(res);
        expect(temp.length).toBe(1,"Incorrect number of events");
        expect(temp[0].eventid).toBe('1badb6d2-adb4-4a0f-820e-9e2e9908aeb4');
        //console.log(temp[0].eventid);
      })

      const req = httpTestingController.expectOne('/api/events/1badb6d2-adb4-4a0f-820e-9e2e9908aeb4');
      expect(req.request.method).toEqual("GET");

      req.flush(temp);

    });

    it('should post single event data ',()=>{

      let temp = {"eventid":"1badb6d2-adb4-4a0f-820e-9e2e9908aeb4","sc_skatingeventclassid":null,"isoffline":0,"enname":"test2","endescription":"des2","frname":null,"frdescription":null,"startdate":"2021-07-08T04:00:00.000Z","enddate":"2021-07-16T04:00:00.000Z","createdon":"2021-07-08T16:25:59.714Z","modifiedon":"2021-07-08T16:25:59.714Z","sc_name":null,"sc_frenchname":null,"contactid":"1234567890","contactname":"Sahil Patel"};
      
      api.insertEvent(temp).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        expect(res.hasOwnProperty('contactid')).toBe(true);
        expect(res.hasOwnProperty('contactname')).toBe(true);
        //console.log(res.hasOwnProperty('contactid'));
       
      })

      const req = httpTestingController.expectOne('/api/events');
      expect(req.request.method).toEqual("PUT");
      
      req.flush(temp);

    });

    it('should update single event ',()=>{

      let temp = {"eventid":"1badb6d2-adb4-4a0f-820e-9e2e9908aeb4","enname":"event name","endescription":"des","frname":null,"frdescription":null,"startdate":"2021-07-08T04:00:00.000Z","enddate":"2021-07-16T04:00:00.000Z","createdon":"2021-07-08T16:25:59.714Z","modifiedon":"2021-07-08T16:25:59.714Z","sc_name":null,"sc_frenchname":null,"contactid":"1234567890","contactname":"Sahil Patel"};
      const changes = {"eventid":"1badb6d2-adb4-4a0f-820e-9e2e9908aeb4","enname":"changed event name","endescription":"changed des"};

      api.updateEvent(temp).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        expect(Object(res)["eventid"]).toBe('1badb6d2-adb4-4a0f-820e-9e2e9908aeb4');
        expect(Object(res)["enname"]).toBe("changed event name");
        expect(Object(res)["endescription"]).toBe("changed des");
        
       
      })

      const req = httpTestingController.expectOne('/api/events');
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body.eventid).toEqual(changes.eventid)
      
      req.flush({
        ...temp,
        ...changes
      });

    });

    it('should delete single event data ',()=>{

      let temp = [{"eventid":"1badb6d2-adb4-4a0f-820e-9e2e9908aeb4","sc_skatingeventclassid":null,"isoffline":0,"enname":"test2","endescription":"des2","frname":null,"frdescription":null,"startdate":"2021-07-08T04:00:00.000Z","enddate":"2021-07-16T04:00:00.000Z","createdon":"2021-07-08T16:25:59.714Z","modifiedon":"2021-07-08T16:25:59.714Z","sc_name":null,"sc_frenchname":null,"contactid":"1234567890"}];
     
      api.deleteEvent(temp[0].eventid).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        expect(temp.length).toBe(1,"Incorrect number of events");
        expect(temp[0].eventid).toBe('1badb6d2-adb4-4a0f-820e-9e2e9908aeb4');
        //console.log(temp[0].eventid);
      })

      const req = httpTestingController.expectOne('/api/events/1badb6d2-adb4-4a0f-820e-9e2e9908aeb4');
      expect(req.request.method).toEqual("DELETE");

       req.flush(temp);

    });


    // permission related tests

    it('should get all event classes ',()=>{

      api.getEventClasses().subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        temp = Object.values(res);
        expect(temp.length).toBe(2,"Incorrect number of events");
        expect(temp[0].sc_name).toBe('Club');
        
      })

      const req = httpTestingController.expectOne('/api/eventclasses');
      expect(req.request.method).toEqual("GET");

      let temp = [{ sc_skatingeventclassid: 'A1F32EA6-6FC8-EB11-BACC-000D3A1D5AF3',sc_name: 'Club',sc_frenchname: 'Club'},{sc_skatingeventclassid: '02C79AB3-6FC8-EB11-BACC-000D3A1D5AF3',sc_name: 'International', sc_frenchname: 'International'}]
      
      req.flush(temp);

    });

    it('should get all permission for single event',()=>{

      let temp = [{dspermissionsid: '68157cdc-9752-4d15-b977-82283ae8a014',dscontactid: '60777ebb-28df-eb11-bacb-000d3a560e3d',dsname: 'Sahil Patel',eventid: '8edbf7ae-bfb5-48c0-8f14-cb48358c367b'}];
      
      api.getEventById(temp[0].dspermissionsid).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        temp = Object.values(res);
        expect(temp.length).toBe(1,"Incorrect number of permission");
        expect(temp[0].dspermissionsid).toBe('68157cdc-9752-4d15-b977-82283ae8a014');
        //console.log(temp[0].eventid);
      })

      const req = httpTestingController.expectOne('/api/events/68157cdc-9752-4d15-b977-82283ae8a014');
      expect(req.request.method).toEqual("GET");

      req.flush(temp);

    });
    
    xit('should get all data specialist',()=>{

      // api.getDataSpecialists().subscribe(res=>{

      //   expect(res).toBeTruthy("No data");  
      //   temp = Object.values(res);
      //   expect(temp.length).toBe(2,"Incorrect number of data specialist");
      //   expect(temp[0].sc_dataspecialistid).toBe('59eb3e7c-95a9-416c-97d9-1d796bf51224');
      //   expect(temp[1].sc_fullname).toBe('Test Dude 2 Yes');
        
      // })

      const req = httpTestingController.expectOne('/api/dataspecs');
      expect(req.request.method).toEqual("GET");

      let temp = [{sc_dataspecialistid: '59eb3e7c-95a9-416c-97d9-1d796bf51224',sc_fullname: 'Test Dude 2 Yes',createdon: null,modifiedon: null },{sc_dataspecialistid: '59eb3e7c-95a9-416c-97d9-1d796bf512zz',sc_fullname: 'Test Dude 2 Yes',createdon: null, modifiedon: null}]
      
      req.flush(temp);

    });


    it('should insert single permission for an event',()=>{

      let temp = {dscontactid: "59eb3e7c-95a9-416c-97d9-1d796bf51224",dsname: "Test Dude 2 Yes",dspermissionsid: "68157cdc-9752-4d15-b977-82283ae8a014",eventid: "fb8089cb-5227-440b-832e-6aec5eb1122f"}
      
      api.insertPerms(temp).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        expect(res.hasOwnProperty('dscontactid')).toBe(true);
        expect(res.hasOwnProperty('eventid')).toBe(true);
        expect(res.hasOwnProperty('dsname')).toBe(true);
       
      })

      const req = httpTestingController.expectOne('/api/insertperm');
      expect(req.request.method).toEqual("PUT");
      
      req.flush(temp);

    });


    it('should delete single permission for an event ',()=>{

      let temp = [{dspermissionsid: "68157cdc-9752-4d15-b977-82283ae8a014",eventid: "fb8089cb-5227-440b-832e-6aec5eb1122f"}];
      
      api.deletePerm(temp[0]).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        expect(temp.length).toBe(1,"Incorrect number of permissions");
        expect(temp[0].dspermissionsid).toBe('68157cdc-9752-4d15-b977-82283ae8a014');
        expect(temp[0].eventid).toBe('fb8089cb-5227-440b-832e-6aec5eb1122f');
        //console.log(temp[0].eventid);
      })

      
      const req = httpTestingController.expectOne('/api/deleteperm/'+temp[0].eventid+'/'+temp[0].dspermissionsid);
      expect(req.request.method).toEqual("DELETE");
       req.flush(temp);

    });


    // test cases for category operation

    it('should get all categoried for an event ',()=>{

      let temp = [{"categoryid":"0883db89-bced-4a34-bac1-22bc9da0a5af","eventid":"f1bfe0d9-1616-4d44-ba4b-beb79fa234d2","enname":"new","endescription":"testing","frname":null,"frdescription":null,"programid":"BD597B1D-5180-EB11-A812-000D3A8D72D1","disciplineid":"55B4EC6D-EF7D-EB11-A812-000D3A99AB84","definitionid":"","sortorder":"","status":"Setup","hasreadysegments":"","hascompetitors":"","hasofficials":"","startdate":"2021-07-21T04:00:00.000Z","enddate":"2021-07-31T04:00:00.000Z","createdon":"2021-07-29T19:06:40.276Z","modifiedon":"2021-07-29T19:17:30.697Z"}]

      api.getCategories(temp[0].categoryid).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        expect(temp.length).toBe(1,"Incorrect number of events");
        expect(temp[0].categoryid).toBe('0883db89-bced-4a34-bac1-22bc9da0a5af');
       
      })

      const req = httpTestingController.expectOne('/api/categories/'+temp[0].categoryid);
      expect(req.request.method).toEqual("GET");

      req.flush(temp);

    });

    it('should get all programs for a category ',()=>{

      let temp = [{"sc_programsid":"BD597B1D-5180-EB11-A812-000D3A8D72D1","sc_program_key":"Adult/Adulte","sc_programname":"Adult","sc_description_fr":null,"sc_description":"DRAFT","sc_programname_fr":"Adulte"}];

      api.getPrograms().subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        expect(temp.length).toBe(1,"Incorrect number of programs");
        expect(temp[0].sc_programname).toBe('Adult');
       
      })

      const req = httpTestingController.expectOne('/api/categoryprograms');
      expect(req.request.method).toEqual("GET");

      req.flush(temp);

    });

    it('should get all disciplines for a category ',()=>{

      let temp = [{"sc_skatingdisciplinedefinitionid":"55B4EC6D-EF7D-EB11-A812-000D3A99AB84","sc_name":"Artistic","sc_frenchname":"Artistique"}];

      api.getDisciplines().subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        expect(temp.length).toBe(1,"Incorrect number of programs");
        expect(temp[0].sc_name).toBe('Artistic');
       
      })

      const req = httpTestingController.expectOne('/api/categorydisciplines');
      expect(req.request.method).toEqual("GET");

      req.flush(temp);

    });

    it('should insert category ',()=>{

      let temp = {categoryid: "",definitionid: "F3BCFDD1-E18B-EB11-A812-000D3A8DC0F1",disciplineid: "349869AB-D87D-EB11-A812-000D3A99A371",enddate: "08/08/2021", endescription: "dees",enname: "name",eventid: "cf702f55-6809-4bb7-ac5a-93f3f69b5e44",hascompetitors: "N",hasofficials: "N",hasreadysegments: "N",programid: "80C41EC5-874A-E511-80FC-FC15B42836D4",sortorder: "",startdate: "08/21/2021" ,status: "Setup"}

      api.insertCategory(temp).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        expect(res.hasOwnProperty('definitionid')).toBe(true);
        expect(res.hasOwnProperty('disciplineid')).toBe(true);
        expect(res.hasOwnProperty('eventid')).toBe(true);
       
      })

      const req = httpTestingController.expectOne('/api/categories');
      expect(req.request.method).toEqual("POST");
      
      req.flush(temp);

    });
    
    it('should update single category ',()=>{

      let temp = {categoryid: "",definitionid: "F3BCFDD1-E18B-EB11-A812-000D3A8DC0F1",disciplineid: "349869AB-D87D-EB11-A812-000D3A99A371",enddate: "08/08/2021", endescription: "des",enname: "name",eventid: "cf702f55-6809-4bb7-ac5a-93f3f69b5e44",hascompetitors: "N",hasofficials: "N",hasreadysegments: "N",programid: "80C41EC5-874A-E511-80FC-FC15B42836D4",sortorder: "",startdate: "08/21/2021" ,status: "Setup"}
      const changes = {categoryid: "",definitionid: "F3BCFDD1-E18B-EB11-A812-000D3A8DC0F1",disciplineid: "349869AB-D87D-EB11-A812-000D3A99A371",enddate: "08/08/2021", endescription: "des chnaged",enname: "name changed",eventid: "cf702f55-6809-4bb7-ac5a-93f3f69b5e44",hascompetitors: "N",hasofficials: "N",hasreadysegments: "N",programid: "80C41EC5-874A-E511-80FC-FC15B42836D4",sortorder: "",startdate: "08/21/2021" ,status: "Setup"}

      api.updateCategory(temp).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        expect(Object(res)["eventid"]).toBe('cf702f55-6809-4bb7-ac5a-93f3f69b5e44');
        expect(Object(res)["enname"]).toBe("name changed");
        expect(Object(res)["endescription"]).toBe("des chnaged");
        
       
      })

      const req = httpTestingController.expectOne('/api/categories');
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body.eventid).toEqual(changes.eventid)
      
      req.flush({
        ...temp,
        ...changes
      });

    });

    it('should delete single category ',()=>{

      let temp = [{categoryid: "fb8089cb-5227-440b-832e-6aec5eb1122f",definitionid: "F3BCFDD1-E18B-EB11-A812-000D3A8DC0F1",disciplineid: "349869AB-D87D-EB11-A812-000D3A99A371",enddate: "08/08/2021", endescription: "des",enname: "name",eventid: "cf702f55-6809-4bb7-ac5a-93f3f69b5e44",hascompetitors: "N",hasofficials: "N",hasreadysegments: "N",programid: "80C41EC5-874A-E511-80FC-FC15B42836D4",sortorder: "",startdate: "08/21/2021" ,status: "Setup"}];
      
      api.deleteCategory(temp[0]).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        expect(temp.length).toBe(1,"Incorrect number of permissions");
        expect(temp[0].eventid).toBe('cf702f55-6809-4bb7-ac5a-93f3f69b5e44');
        expect(temp[0].categoryid).toBe('fb8089cb-5227-440b-832e-6aec5eb1122f');
        
      })

      
      const req = httpTestingController.expectOne('/api/categories/'+temp[0].eventid+'/'+temp[0].categoryid);
      expect(req.request.method).toEqual("DELETE");
       req.flush(temp);

    });

    it('should get single category by id',()=>{

      let temp = [{categoryid: "fb8089cb-5227-440b-832e-6aec5eb1122f",definitionid: "F3BCFDD1-E18B-EB11-A812-000D3A8DC0F1",disciplineid: "349869AB-D87D-EB11-A812-000D3A99A371",enddate: "08/08/2021", endescription: "des",enname: "name",eventid: "cf702f55-6809-4bb7-ac5a-93f3f69b5e44",hascompetitors: "N",hasofficials: "N",hasreadysegments: "N",programid: "80C41EC5-874A-E511-80FC-FC15B42836D4",sortorder: "",startdate: "08/21/2021" ,status: "Setup"}]
      
      api.getCategoryById(temp[0].categoryid).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        temp = Object.values(res);
        expect(temp.length).toBe(1,"Incorrect number of events");
        expect(temp[0].categoryid).toBe('fb8089cb-5227-440b-832e-6aec5eb1122f');

      })

      const req = httpTestingController.expectOne('/api/category/'+temp[0].categoryid);
      expect(req.request.method).toEqual("GET");

      req.flush(temp);

    });

    it('should get Category Definition By Parent ',()=>{

    let temp = [{programid: "70C41EC5-874A-E511-80FC-FC15B42836D4", disciplineid: "6C8A4DA5-D87D-EB11-A812-000D3A99A371"}];

    api.getCategoryDefinitionByParent(temp[0]).subscribe(res=>{

      expect(res).toBeTruthy("No data");  
      expect(temp.length).toBe(1,"Incorrect number of category defination");
      expect(temp[0].programid).toBe('70C41EC5-874A-E511-80FC-FC15B42836D4');
      expect(temp[0].disciplineid).toBe('6C8A4DA5-D87D-EB11-A812-000D3A99A371');

    })

    const req = httpTestingController.expectOne('/api/categorydefinitions/'+temp[0].programid+'/'+temp[0].disciplineid);
    expect(req.request.method).toEqual("GET");

    req.flush(temp);

    });


    xit('should upload category ',()=>{

      let id = "c9df1fb4-9c39-4873-abce-f814f1e78439";
      let form_data = {}; 
      let online = 'true';
      api.eventUpload(form_data,id,online).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
       
      })

      const req = httpTestingController.expectOne('/api/eventupload/'+id);
      expect(req.request.method).toEqual("POST");
      
      req.flush(id,form_data);

    });

    // test cases for segments

    it('should get segments added by user according category ',()=>{

      let temp = [{"segmentid":"09cbaa4f-540b-45d6-8098-ccf476ba168c","categoryid":"ccf16bf2-7a76-4b14-b999-95c898aab41d","definitionid":"E41C98F0-E18B-EB11-A812-000D3A8DC0F1","enname":"Element Assessment","frname":"Évaluation des éléments","status":null,"performanceorder":null,"programtime":0,"programhalftime":0,"warmuptime":0,"warmupnumber":null,"warmupgroupmaxsize":0,"wellbalanced":null,"fallvalue":null,"reviewtime":0,"createdon":"2021-09-14T16:57:57.748Z","modifiedon":"2021-09-14T16:57:57.748Z"},{"segmentid":"2f851cd0-7380-4549-8d93-1fb5ef85cb68","categoryid":"ccf16bf2-7a76-4b14-b999-95c898aab41d","definitionid":"E41C98F0-E18B-EB11-A812-000D3A8DC0F1","enname":"test","frname":"rrr","status":null,"performanceorder":2,"programtime":60,"programhalftime":60,"warmuptime":60,"warmupnumber":null,"warmupgroupmaxsize":1,"wellbalanced":"no","fallvalue":0,"reviewtime":2,"createdon":"2021-09-15T20:23:13.556Z","modifiedon":"2021-09-15T20:23:13.556Z"}]
      
      api.getSegmentsByCategory(temp[0].categoryid).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        expect(temp.length).toBe(2,"Incorrect number of events");
        expect(temp[0].categoryid).toBe('ccf16bf2-7a76-4b14-b999-95c898aab41d');
       
      })

      const req = httpTestingController.expectOne('/api/segments/'+temp[0].categoryid);
      expect(req.request.method).toEqual("GET");

      req.flush(temp);

    });

    it('should get segments available according category ',()=>{

      let temp = [{"categoryid":"ccf16bf2-7a76-4b14-b999-95c898aab41d","sc_skatingsegmentdefinitionsid":"7FC9D81D-318B-EB11-A812-000D3A8DCA86","sc_elementconfiguration":"1CC26FB3-1997-EB11-B1AC-000D3A10E348","sc_parentcategory":"B4BA78F3-308B-EB11-A812-000D3A8DCA86","sc_totalsegmentfactor":1,"sc_elementconfigurationname":null,"sc_parentcategoryname":null,"sc_name":"Free Program","sc_frenchname":"Programme libre","sc_order":null,"sc_reviewtime":null,"sc_programtime":null,"sc_warmuptime":null,"sc_programhalftime":null,"sc_warmupgroupmaximumsize":null}];
      
      api.getAvailableSegmentsByCategory(temp[0].categoryid).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        expect(temp.length).toBe(1,"Incorrect number of events");
        expect(temp[0].categoryid).toBe('ccf16bf2-7a76-4b14-b999-95c898aab41d');
       
      })

      const req = httpTestingController.expectOne('/api/availablesegments/'+temp[0].categoryid);
      expect(req.request.method).toEqual("GET");

      req.flush(temp);

    });

   it('should insert segments',()=>{

      let temp = {"segmentid": "","categoryid": "ccf16bf2-7a76-4b14-b999-95c898aab41d","definitionid": "7FC9D81D-318B-EB11-A812-000D3A8DCA86","enname": "test","frname": "des2","performanceorder": 3,"programtimemins": 0,"programtimesecs": 0,"programtime": 0,"programhalftimemins": 0,"programhalftimesecs": 0,"programhalftime": 0,"warmuptimemins": 0,"warmuptimesecs": 0,"warmuptime": 0,"warmupgroupmaxsize": 0,"wellbalanced": "no","fallvalue": 0,"reviewtimemins": 0,"reviewtimesecs": 0,"reviewtime": 0}

      api.insertSegment(temp).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        expect(res.hasOwnProperty('categoryid')).toBe(true);
        expect(res.hasOwnProperty('definitionid')).toBe(true);
        expect(res.hasOwnProperty('enname')).toBe(true);
       
      });

      const req = httpTestingController.expectOne('/api/segments');
      expect(req.request.method).toEqual("POST");
      
      req.flush(temp);

    });
    
    it('should update single segments ',()=>{

      let temp = {"segmentid": "a6410de0-13fd-49e3-83ff-63e2e031e631","categoryid": "ccf16bf2-7a76-4b14-b999-95c898aab41d","definitionid": "7FC9D81D-318B-EB11-A812-000D3A8DCA86","enname": "test","frname": "des2","performanceorder": 3,"programtimemins": 0,"programtimesecs": 0,"programtime": 0,"programhalftimemins": 0,"programhalftimesecs": 0,"programhalftime": 0,"warmuptimemins": 0,"warmuptimesecs": 0,"warmuptime": 0,"warmupgroupmaxsize": 0,"wellbalanced": "no","fallvalue": 0,"reviewtimemins": 0,"reviewtimesecs": 0,"reviewtime": 0};
      const changes = {"segmentid": "a6410de0-13fd-49e3-83ff-63e2e031e631","categoryid": "ccf16bf2-7a76-4b14-b999-95c898aab41d","definitionid": "7FC9D81D-318B-EB11-A812-000D3A8DCA86","enname": "test new","frname": "des2 new","performanceorder": 3,"programtimemins": 0,"programtimesecs": 0,"programtime": 0,"programhalftimemins": 0,"programhalftimesecs": 0,"programhalftime": 0,"warmuptimemins": 0,"warmuptimesecs": 0,"warmuptime": 0,"warmupgroupmaxsize": 0,"wellbalanced": "no","fallvalue": 0,"reviewtimemins": 0,"reviewtimesecs": 0,"reviewtime": 0};
     
      api.updateSegment(temp).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        expect(Object(res)["segmentid"]).toBe('a6410de0-13fd-49e3-83ff-63e2e031e631');
        expect(Object(res)["categoryid"]).toBe('ccf16bf2-7a76-4b14-b999-95c898aab41d');
        expect(Object(res)["enname"]).toBe("test new");
        expect(Object(res)["frname"]).toBe("des2 new");
        
       
      })

      const req = httpTestingController.expectOne('/api/segments');
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body.segmentid).toEqual(changes.segmentid);
      
      req.flush({
        ...temp,
        ...changes
      });

    });

    it('should delete single segment ',()=>{

      let temp = [{"segmentid": "a6410de0-13fd-49e3-83ff-63e2e031e631","categoryid": "ccf16bf2-7a76-4b14-b999-95c898aab41d","definitionid": "7FC9D81D-318B-EB11-A812-000D3A8DCA86","enname": "test","frname": "des2","performanceorder": 3,"programtimemins": 0,"programtimesecs": 0,"programtime": 0,"programhalftimemins": 0,"programhalftimesecs": 0,"programhalftime": 0,"warmuptimemins": 0,"warmuptimesecs": 0,"warmuptime": 0,"warmupgroupmaxsize": 0,"wellbalanced": "no","fallvalue": 0,"reviewtimemins": 0,"reviewtimesecs": 0,"reviewtime": 0}];
      
      api.deleteSegment(temp[0]).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        expect(temp.length).toBe(1,"Incorrect number of permissions");
        expect(temp[0].segmentid).toBe('a6410de0-13fd-49e3-83ff-63e2e031e631');
        expect(temp[0].categoryid).toBe('ccf16bf2-7a76-4b14-b999-95c898aab41d');
        
      })

      
      const req = httpTestingController.expectOne('/api/segments/'+temp[0].segmentid+'/'+temp[0].categoryid);
      expect(req.request.method).toEqual("DELETE");
       req.flush(temp);

    });

    it('should get single segment data ',()=>{

      let temp = [{"segmentid":"09cbaa4f-540b-45d6-8098-ccf476ba168c","categoryid":"ccf16bf2-7a76-4b14-b999-95c898aab41d","definitionid":"E41C98F0-E18B-EB11-A812-000D3A8DC0F1","enname":"Element Assessment","frname":"Évaluation des éléments","status":null,"performanceorder":1,"programtime":0,"programhalftime":0,"warmuptime":0,"warmupnumber":null,"warmupgroupmaxsize":0,"wellbalanced":null,"fallvalue":null,"reviewtime":0,"createdon":"2021-09-14T16:57:57.748Z","modifiedon":"2021-09-14T16:57:57.748Z"}];

      api.getSegmentById(temp[0].segmentid).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        temp = Object.values(res);
        expect(temp.length).toBe(1,"Incorrect number of events");
        expect(temp[0].segmentid).toBe('09cbaa4f-540b-45d6-8098-ccf476ba168c');
      })

      const req = httpTestingController.expectOne('/api/segment/09cbaa4f-540b-45d6-8098-ccf476ba168c');
      expect(req.request.method).toEqual("GET");

      req.flush(temp);

    });

    it('should get segment defination default ',()=>{

      let temp = [{"segmentid":"09cbaa4f-540b-45d6-8098-ccf476ba168c","categoryid":"ccf16bf2-7a76-4b14-b999-95c898aab41d","definitionid":"E41C98F0-E18B-EB11-A812-000D3A8DC0F1","enname":"Element Assessment","frname":"Évaluation des éléments","status":null,"performanceorder":1,"programtime":0,"programhalftime":0,"warmuptime":0,"warmupnumber":null,"warmupgroupmaxsize":0,"wellbalanced":null,"fallvalue":null,"reviewtime":0,"createdon":"2021-09-14T16:57:57.748Z","modifiedon":"2021-09-14T16:57:57.748Z"}];

      api.getSegmentDefinitionDefaults(temp[0].definitionid).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        temp = Object.values(res);
        expect(temp.length).toBe(1,"Incorrect number of defination default");
        expect(temp[0].segmentid).toBe('09cbaa4f-540b-45d6-8098-ccf476ba168c');
      })

      const req = httpTestingController.expectOne('/api/segmentdefaults/'+temp[0].definitionid);
      expect(req.request.method).toEqual("GET");

      req.flush(temp);

    }); 

    it('should get pc factors',()=>{

      let temp = [{"definitionid":"BA98FF68-A7A2-EB11-B1AC-000D3A1E329C","sc_skatingprogramcomponentdefinitionid":"7083397B-A7A2-EB11-B1AC-000D3A1E329C","sc_pctype":"ADE4F3C4-E780-EB11-A812-0022481D88FB","sc_parentsegment":"BA98FF68-A7A2-EB11-B1AC-000D3A1E329C","sc_name":"PC-105734","sc_pointvalue":1.6,"pt_name":"Skating Skills"}];

      api.viewPcFactors(temp[0]).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        temp = Object.values(res);
        expect(temp.length).toBe(1,"Incorrect number of pc factors");
        expect(temp[0].sc_skatingprogramcomponentdefinitionid).toBe('7083397B-A7A2-EB11-B1AC-000D3A1E329C');
      })

      const req = httpTestingController.expectOne('/api/pcfactors/'+temp[0].sc_parentsegment);
      expect(req.request.method).toEqual("GET");

      req.flush(temp);

    });

    it('should update segment order ',()=>{

      let temp = [{"segmentid": "0bd14912-3b57-46b3-b95f-b5bc0ec92e4a","categoryid": "732fb437-8903-4901-abff-f822046c09fd","definitionid": "969F9CEF-358B-EB11-A812-000D3A8DCA86","enname": "Free Program","frname": "Programme libre","status": null,"performanceorder": 1,"programtime": 0,"programhalftime": 0,"warmuptime": 0,"warmupnumber": null,"warmupgroupmaxsize": 3,"wellbalanced": "no","fallvalue": 0,"reviewtime": 0,"totalsegmentfactor": 1,"createdon": "2021-10-15T20:07:12.805Z","modifiedon": "2021-10-15T20:07:12.805Z"}];
      
      api.updateSegmentOrder(temp).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        temp = Object.values(res);
        expect(temp.length).toBe(1,"Incorrect number of segments");
        
       
      })

      const req = httpTestingController.expectOne('/api/updatesegmentorder');
      expect(req.request.method).toEqual("PATCH");
      
      req.flush(temp);

    });

    it('should get segment competitors',()=>{

      let temp = [{"competitorentryid":"e96297f0-b785-46df-b16c-6180365d5bc4","segmentid":"0bd14912-3b57-46b3-b95f-b5bc0ec92e4a","sc_competitorid":"6725c4d9-a10e-ec11-b6e5-000d3a171498","sortorder":0,"warmupgroup":null,"sc_name":"Joelle Godere","sc_scnum":"0000008713"}];
      
      api.getSegmentCompetitors(temp[0].segmentid).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        temp = Object.values(res);
        expect(temp.length).toBe(1,"Incorrect number of segments");
        
       
      })

      const req = httpTestingController.expectOne('/api/segmentcompetitors/0bd14912-3b57-46b3-b95f-b5bc0ec92e4a');
      expect(req.request.method).toEqual("GET");
      
      req.flush(temp);

    });

    it('should update segment competitor order ',()=>{

      let temp = [{"segmentid": "0bd14912-3b57-46b3-b95f-b5bc0ec92e4a","categoryid": "732fb437-8903-4901-abff-f822046c09fd","definitionid": "969F9CEF-358B-EB11-A812-000D3A8DCA86","enname": "Free Program","frname": "Programme libre","status": null,"performanceorder": 1,"programtime": 0,"programhalftime": 0,"warmuptime": 0,"warmupnumber": null,"warmupgroupmaxsize": 3,"wellbalanced": "no","fallvalue": 0,"reviewtime": 0,"totalsegmentfactor": 1,"createdon": "2021-10-15T20:07:12.805Z","modifiedon": "2021-10-15T20:07:12.805Z"}];
      
      api.updateSegmentCompetitorOrder(temp).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        temp = Object.values(res);
        expect(temp.length).toBe(1,"Incorrect number of segments");
        
       
      })

      const req = httpTestingController.expectOne('/api/updatesegmentcompetitororder');
      expect(req.request.method).toEqual("PATCH");
      
      req.flush(temp);

    });

    // test for competitors

    it('should get search competitors',()=>{

      let temp = {"filter": "sa","sort": "asc","pageNumber": 0,"pageSize": 10};

      api.getSearchCompetitors(temp).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        expect(res.hasOwnProperty('filter')).toBe(true);
        expect(res.hasOwnProperty('sort')).toBe(true);
        expect(res.hasOwnProperty('pageNumber')).toBe(true);
        expect(res.hasOwnProperty('pageSize')).toBe(true);
        
      });

      const req = httpTestingController.expectOne('/api/searchcompetitors');
      expect(req.request.method).toEqual("POST");
      
      req.flush(temp);

    });

    it('should random start order',()=>{

      let temp = "0bd14912-3b57-46b3-b95f-b5bc0ec92e4a";

      api.randomStartOrder(temp).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        
        
      });

      const req = httpTestingController.expectOne('/api/sortcompetitors/'+temp);
      expect(req.request.method).toEqual("GET");
      
      req.flush(temp);

    });

    it('should set warm up groups',()=>{

      let temp = "0bd14912-3b57-46b3-b95f-b5bc0ec92e4a";

      api.setWarmupGroups(temp).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        
        
      });

      const req = httpTestingController.expectOne('/api/sortwarmup/'+temp);
      expect(req.request.method).toEqual("GET");
      
      req.flush(temp);

    });

    it('should insert competitor',()=>{

      let temp = {"categoryid": "732fb437-8903-4901-abff-f822046c09fd","competitorid": "b9eeb736-e41f-ec11-b6e5-00224822ed42"}
      api.insertCompetitor(temp).subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        expect(res.hasOwnProperty('categoryid')).toBe(true);
        expect(res.hasOwnProperty('competitorid')).toBe(true);
        
      });

      const req = httpTestingController.expectOne('/api/addcompetitor');
      expect(req.request.method).toEqual("POST");
      
      req.flush(temp);

    });

    // test for config to test and test to prod

    it('should get test to prod',()=>{

      api.testToProd().subscribe(res=>{

        expect(res).toBeTruthy("No data");  
        temp = Object.values(res);
        expect(temp.length).toBe(1,"Incorrect number of data");
        expect(temp[0].title).toBe('Config up to date');
        
      })

      const req = httpTestingController.expectOne('/api/testtoprod');
      expect(req.request.method).toEqual("GET");

      let temp = [{ title: 'Config up to date'}]
      
      req.flush(temp);

    });

    
});