var soda = require('soda');

function snapShotter(name, version) {
    b = {
        browser : soda.createSauceClient({
            'url': 'http://saucelabs.com/'
            , 'username': 'sgrove'
            , 'access-key': '97c2c985-9064-41ce-bcf4-dbb268bd586b'
            , 'os': 'Windows 2003'
            , 'browser': name
            , 'version': version
            , 'job-name': 'sodajs-example'
            , 'max-duration': 300
        })
    }

    b.startUp = function(cb) {
        // Log commands as they are fired
        b.browser.on('command', function(cmd, args){
            console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args.join(', '));
        });

        b.browser
        .chain
        .session()
        .setTimeout(5000)
        .open('/');


    };

    b.keepAlive = function() {
        b.browser.open('/');
    };

    b.takeShot = function(url) {
        b.browser
        .open('/')
        .waitForPageToLoad();
    };

    return b;
};

b = snapShotter("firefox", "3.6");
b.startUp(function(){console.log("Booted!")});
b.keepAlive();
