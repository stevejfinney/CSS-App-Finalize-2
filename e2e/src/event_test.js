let config = require('./config');

describe('Event functionality test', function() {

  
    // Fetching Element from angular

    var create_event_button = element(by.id('create_event'));
    var event_name = element(by.css("input[formControlName=enname]"));
    var event_fr_name = element(by.css("input[formControlName=frname]"));
    var event_en_description = element(by.css("input[formControlName=endescription]"));
    var event_fr_description = element(by.css("input[formControlName=frdescription]"));
    var event_type = element(by.id('element_type'));
    var event_on_off = element(by.id('element_on_off'));
    var event_start_date = element(by.css("input[formControlName=startdate]"));
    var event_end_date = element(by.css("input[formControlName=enddate]"));
    var event_submit_changes = element(by.id('submit_changes'));
    var event_on_off_option, event_type_option,count;
    var number_of_events =  element.all(by.className('event_list'));
        
    
   //recursive function


   function create_event(name,name_fr,en_description,fr_description,type,on_off_status,start_date,end_date) {

    event_name.sendKeys(name);
    event_fr_name.sendKeys(name_fr);
    event_en_description.sendKeys(en_description);
    event_fr_description.sendKeys(fr_description);
    event_type.click();
    event_type_option = element(by.cssContainingText('mat-option', type));
    event_type_option.click();
    
    event_on_off.click();
    event_on_off_option = element(by.cssContainingText('mat-option', on_off_status));  
    event_on_off_option.click();
    
    event_start_date.sendKeys(start_date);
    event_end_date.sendKeys(end_date);
    
    event_submit_changes.click();
    
  }

  function edit_event(name,name_fr,en_description,fr_description,type,start_date,end_date) {

    var row = element.all(by.className('edit_event'));    
    row.first().click();

    event_name.clear().sendKeys(name);
    event_fr_name.clear().sendKeys(name_fr);
    event_en_description.clear().sendKeys(en_description);
    event_fr_description.clear().sendKeys(fr_description);

    event_type.click();
    event_type_option = element(by.cssContainingText('mat-option', type));
    event_type_option.click();

    event_start_date.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, "a"));
    event_start_date.sendKeys(protractor.Key.BACK_SPACE);
    event_start_date.clear();

    event_end_date.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, "a"));
    event_end_date.sendKeys(protractor.Key.BACK_SPACE);
    event_end_date.clear();

    event_start_date.sendKeys(start_date);
    event_end_date.sendKeys(end_date); 
    
    event_submit_changes.click();
    
  }

  function delete_event(){

    
    var row = element.all(by.className('delete_event'));    
    row.first().click();
    browser.switchTo().alert().accept();

  }

    // Test Scenario 
 
    beforeAll(function() {
      browser.get(config.URL +'event');
      browser.waitForAngular();
     
    });

    beforeEach(function() {
     number_of_events.count().then(function(originalCount) {
        count = originalCount;
      });
      
    });
  
    afterEach(function() {
      browser.sleep('2000');
    })
  
    it('should display new event button',()=>{
        expect(create_event_button.getText()).toEqual('Create New Event');
        expect(create_event_button.isDisplayed()).toBe(true);
    });
  
    xit('should create event',() =>{


        create_event('event','event fr','des','event des','International','Offline','7/23/2021','7/30/2023');
        expect(number_of_events.count()).toEqual(count+1);
        
        
      });

    xit('should edit an event', function() {
      
      edit_event('event new','event fr new','des changed','des fr changed','Club','9/1/2021','12/30/2023');
      expect(number_of_events.count()).toEqual(count);
    });

    
   
    xit('should delete an event', function() {
      
      
       delete_event();
       expect(number_of_events.count()).toEqual(count-1);
      
    });

  });