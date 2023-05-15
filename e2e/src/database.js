
let config = require('./config');

describe('Database functionality test', function() {

  // Fetching Element from angular

  var check_db_exist = element(by.id('check_db_exist'));
  var create_database = element(by.id('rebuild_db'));
  var update_def = element(by.id('update_defination'));
  var originalTimeout;


  // Test Scenario 

  beforeEach(function() {
    browser.get(config.URL + 'admin');
    browser.waitForAngular();

    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;


  });

  afterEach(function() {
    browser.sleep('10');
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  })

 
  
  it ('should check db exist', () => {

    check_db_exist.click();
    browser.sleep('1000');
  });

  it ('should create database', () => {
  
    create_database.click();
    browser.sleep('1000');
  });

  it ('should download all data', () => {
    update_def.click();
    browser.sleep('40000');
  });


});