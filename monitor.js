require('joose');
require('joosex-namespace-depended');
require('hash');

var request = require('request'),
    BufferList = require('bufferlist').BufferList,
    sys = require('sys'),
    http = require('http'),  
    url = require('url'),
    fs = require('fs'),
    queryString = require('querystring');

var urlLibrary = url;

sys.puts("Setting URLS");
//var url = "http://student.kfupm.edu.sa/s200354630/Multi/images/o-png8.png";
var urlFilename = Hash.md5(url);

sys.puts("Building Browser list");
var browsers = [
    {name: "iexplore",
     version: "6"},
    {name: "iexplore",
     version: "7"},
    {name: "iexplore",
     version: "8"},
    {name: "firefox",
     version: "3.6"},
    {name: "safari",
     version: "4"}
];

sys.puts("Initializing URLS");
var browserUrls = {
    "iexplore6" : [],
    "iexplore7" : [],
    "iexplore8" : [],
    "firefox3.6" : [],
    "safari4": []
};

var workers = [];

sys.puts("Building workers");
for (browser_index in browsers) {
    var browser = browsers[browser_index];

    var browserWorker = {
        browser : browser,
        urls : browserUrls[browser.name + browser.version],
        run : workerRun,
        status : "idle"
    };

    sys.puts(sys.inspect(browserWorker.urls));
    workers.push(browserWorker);
}

function workerRun(callback) {
    console.log("My status: " + this.status + ".");
    if (this.status != "idle") { console.log("Sorry, I am [" + this.status + "]"); return false; }


    console.log("My urls: " + this.urls + ".");
    var url = this.urls.shift();
    if (null == url) { console.log("No more urls for " + browser.name + browser.version); return false; } // No urls waiting for this browser

    console.log("Getting [" + url + "] for " + browser.name + browser.version);

    this.status = "working";
    console.log("My new status: " + this.status + ".");
    getImage(url, this, callback);
}

function getImage(targetUrl, browserWorker, callback) {
    sys.puts("Wow, man");

    var imageRaw = '';
    var browser = browserWorker.browser;
    var filename = "shots/" + Hash.md5(targetUrl) + "_" + browser.name + "_" + browser.version + "_2_.png";
    var position = 0;

    var newUrl = url.parse(targetUrl);

    fs.open(filename, "w", function(err, fd) {

        var google = http.createClient(80, newUrl.hostname);
        var request = google.request('GET', newUrl.pathname,
            {'host': newUrl.host});
        request.end();
        
        request.on('response', function (response) {
            console.log('STATUS: ' + response.statusCode);
            console.log('HEADERS: ' + JSON.stringify(response.headers));
            //response.setEncoding();
            response.on('data', function (buf) {
                //console.log('BODY: [' + buf.toString('base64') + ']');
                //sys.puts('buf(' + browser.name + '): [' + sys.inspect(buf));
                
                fs.writeSync(fd, buf, 0, buf.length, position);

                position += buf.length
            });
            
            response.on('end', function () {
                fs.close(fd);
                browserWorker.status = "idle";
                callback();
            });
        });
    });
}

// http://someservice/addUrl?browser="firefox"&version=3.6&url=http://digg.com"
server = http.createServer(function(req, res) {
    var urlObj = urlLibrary.parse(req.url);
    var path = urlObj.pathname;
    
    sys.puts("urlObj: " + sys.inspect(urlObj));

    switch (path){
    case '/addUrl':
        var query = queryString.parse(urlObj.query);
        sys.puts("Adding url");
        
        var browser_name = query.browser,
            browser_version = query.version,
            targetUrl = query.url;


        sys.puts(browser_name, browser_version, targetUrl);

        var tempUrls = browserUrls[browser_name + browser_version];

        sys.puts(sys.inspect(tempUrls));

        tempUrls.push(targetUrl);

        sys.puts(sys.inspect(tempUrls));

        res.end();

        runWorkers();
        break;
    }
});
                           
server.listen(8081);   

sys.puts("Seeding urls");
// Temporary seed of urls
for (index in browserUrls) {
    var urls = browserUrls[index];

    urls.push("http://wp.appadvice.com/wp-content/uploads/2010/06/lemmings-select-2.png",
              "http://upload.wikimedia.org/wikipedia/en/2/26/Lemmings2-SNES-skills.png",
              "http://pingus.seul.org/~grumbel/tmp/md5/5d863e2dbacce28d25565b33d7d26c5e-vect.png"
             );
}

sys.puts("Beginning loop through workers");
sys.puts("Workers: " + sys.inspect(workers));
//sys.puts(sys.inspect(workers));
function runWorkers() {
    sys.puts("runWorkers!");
    for (worker_index in workers) {
        (function (i) {
            var worker = workers[i];
            sys.puts(worker.status + "]" + worker.browser.name + worker.browser.version + ": " + sys.inspect(worker.urls));

            if (worker.status == "idle") {
                sys.puts("Before Worker: " + sys.inspect(worker));
                worker.run(function() {
                    sys.puts("After Worker: " + sys.inspect(worker));
                    if (worker.urls.length != 0) {
                        runWorkers();
                    }else{
                        worker.status = "idle";
                    }
                });
            }
        })(worker_index);
    }
}

runWorkers();
