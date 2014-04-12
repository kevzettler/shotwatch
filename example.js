var soda = require('soda');

var browser = soda.createSauceClient({
    'url': 'http://saucelabs.com/'
    , 'username': ''
    , 'access-key': ''
    , 'os': 'Windows 2003'
    , 'browser': 'googlechrome'
    , 'max-duration': 300
});

browser
.chain
.session()
.setTimeout(5000)
.open('/')
.waitForElementPresent('username')
.type('username', 'invalid')
.type('password', 'invalid')
.click('//input[@value="Submit"]')
.waitForElementPresent('css=ul.global-errors')
.assertText('css=ul.global-errors li', 
            'Please check your username / password')
.testComplete()
.end(function(err){
    if (err) throw err;
    console.log('Passed!');
});
