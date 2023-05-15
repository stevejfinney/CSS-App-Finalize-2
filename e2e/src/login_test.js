
const { browser } = require('protractor');
let config = require('./config');

describe('Login functionality test', function() {

  // Fetching Element from angular

  var username = element(by.id('mat-input-0'));
  var password = element(by.id('mat-input-1'));
  var button = element(by.className('mat-focus-indicator mat-flat mat-flat-button mat-button-base mat-primary'));
  var title_username = element(by.name('loginForm')).all(by.tagName('mat-label')).first();
  var title_password = element(by.name('loginForm')).all(by.tagName('mat-label')).last();
  var error_response = element(by.id('form_response'));

  
  // Recursive function
  
  function login(name, pass) {
    username.sendKeys(name);
    password.sendKeys(pass);
    button.click();
    
  }

  // Test Scenario 

  beforeEach(function() {
    browser.get(config.URL + 'login');
    browser.waitForAngular(false);
    
  });

  afterEach(function() {
    browser.sleep('1000');
  })

  it('should have title and button text',()=>{

    expect(title_username.getText()).toBe('Username');
    expect(title_password.getText()).toBe('Password');
    expect(button.getText()).toEqual('Login');

  });

  it('should display an error message if user provide wrong credentials', function() {
    
    login('sahil', '123');
    expect(error_response.isDisplayed()).toBe(true);
   
    
  });

  it('should display an error message if user provide space as username', function() {
    
    login(' ', '123');
    expect(error_response.isDisplayed()).toBe(true);
    
  });

  it('should display an error message if user provide space as username and password', function() {
    
    login(' ', ' ');
    expect(error_response.isDisplayed()).toBe(true);
    
  });

  it ('should redirect the user to the dashboard page if they provided correct credentials', () => {
    login('sahil12197','Jaybutma100');
    //expect(browser.getCurrentUrl()).not.toEqual(null);
  });

  
  
});