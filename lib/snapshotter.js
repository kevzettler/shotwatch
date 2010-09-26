var soda = require('soda');

var browser = soda.createSauceClient({
    'url': 'http://saucelabs.com/'
    , 'username': 'sgrove'
    , 'access-key': 'ba8cd1fc-030e-4467-b134-63c15fbe3946'
    , 'os': 'Windows 2003'
    , 'browser': 'googlechrome'
    , 'max-duration': 300
});

