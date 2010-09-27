require('joose');
require('joosex-namespace-depended');
require('hash');

var soda = require('soda'),
    sys = require('sys'),
    fs = require('fs');

function init(name, version) {
    var b = {
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

    b.lastUpdate = null;

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
        sys.puts("Keeping browser " + name + version + " alive");
        b.browser.open('/');
    };

    b.takeShot = function(url, callback) {
        sys.puts("Taking shot for [" + name + version + "] at " + url);

        if (!callback) { callback = function(){}; }

        var tmpFilename = "shots/" + Hash.md5(url) + "_" +      name + "_" + version + "_2_.tmp";
        var completeFilename = "shots/" + Hash.md5(url) + "_" + name + "_" + version + "_2_.png";

        sys.puts("Image:" + sys.inspect(b.browser
                                        .open(url)
                                        .waitForPageToLoad()
                                        .captureScreenshotToString()
                                        .end(function(err, body, res, result){
                                            if (err) { sys.puts("Error capturing [" + url + "]: " + sys.inspect(err)); return;}

                                            //var imageData = new Buffer(body, 'base64').toString('binary');
                                            var imageDataR = new Buffer(body, 'base64').toString('base64');
                                            var imageData = new Buffer(body, 'base64').toString('binary');

                                            fs.writeFileSync(tmpFilename, imageData, 'binary');

                                            fs.rename(tmpFilename, completeFilename, function() {
                                                callback();
                                            });

                                        })));
    };

    b.keepAliveTimer = setInterval(function(){ b.keepAlive();}, 60000);

    b.startUp(function(){console.log("booted: [" + name + version + "]")});

    return b;
};

exports.init = init;

// b = snapShotter("iexplore", "8");
// b.startUp(function(){console.log("Booted!")});
// b.keepAlive();
// b.takeShot("http://fakecoolguys.com");
