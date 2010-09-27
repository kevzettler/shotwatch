require('joose');
require('joosex-namespace-depended');
require('hash');

var request = require('request'),
    BufferList = require('bufferlist').BufferList,
    sys = require('sys'),
    http = require('http'),  
    url = require('url'),
    fs = require('fs'),
    queryString = require('querystring'),
    snapShotter = require('./lib/snapshotter');;

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
     version: "4"},
    {name: "googlechrome",
     version: ""}
];

sys.puts("Initializing URLS");
var browserUrls = {
    "iexplore6" : [],
    "iexplore7" : [],
    "iexplore8" : [],
    "firefox3.6" : [],
    "safari4": [],
    "googlechrome": []
};

var workers = [];

sys.puts("Building workers");
for (browser_index in browsers) { 
    (function(index){
        sys.puts(" LOL browser index == "+index);
        sys.puts(" omg browsers ===" + sys.inspect(browsers));
        var browser = browsers[index];
        
        sys.puts(sys.inspect(browser));
        var browserWorker = {
            browser : browser,
            urls : browserUrls[browser.name + browser.version],
            snapShotter: new snapShotter.init(browser.name, browser.version),
            run : workerRun,
            status : "idle"
        };

        sys.puts(sys.inspect(browserWorker));
        workers.push(browserWorker);
    })(browser_index)
}

function workerRun(callback) {
    console.log("My status: " + this.status + ".");
    if (this.status != "idle") { console.log("Sorry, I am [" + this.status + "]"); return false; }


    console.log("My urls: " + this.urls + ".");
    var url = this.urls.shift();
    if (null == url) { console.log("No more urls for " + this.browser.name + this.browser.version); return false; } // No urls waiting for this browser

    console.log("Getting [" + url + "] for " + this.browser.name + this.browser.version);

    this.status = "working";
    console.log("My new status: " + this.status + ".");
    getImage(url, this, callback);
}

function getImage(targetUrl, browserWorker, callback) {
    sys.puts("Wow, man");
    sys.puts("Using this worker: " + browserWorker.browser.name  + browserWorker.browser.version);

    browserWorker.snapShotter.takeShot(targetUrl, callback);

    // var imageRaw = '';
    // var browser = browserWorker.browser;
    // var tmpFilename = "shots/" + Hash.md5(targetUrl) + "_" + browser.name + "_" + browser.version + "_2_.tmp";
    // var completeFilename = "shots/" + Hash.md5(targetUrl) + "_" + browser.name + "_" + browser.version + "_2_.png";
    // var position = 0;

    // var newUrl = url.parse(targetUrl);

    // fs.open(tmpFilename, "w", function(err, fd) {

    //     var google = http.createClient(80, newUrl.hostname);
    //     var request = google.request('GET', newUrl.pathname,
    //         {'host': newUrl.host});
    //     request.end();
        
    //     request.on('response', function (response) {
    //         console.log('STATUS: ' + response.statusCode);
    //         console.log('HEADERS: ' + JSON.stringify(response.headers));
    //         //response.setEncoding();
    //         response.on('data', function (buf) {
    //             //console.log('BODY: [' + buf.toString('base64') + ']');
    //             //sys.puts('buf(' + browser.name + '): [' + sys.inspect(buf));
                
    //             fs.writeSync(fd, buf, 0, buf.length, position);

    //             position += buf.length
    //         });
            
    //         response.on('end', function () {
    //             fs.close(fd);
    //             fs.rename(tmpFilename, completeFilename, function() {
    //                 browserWorker.status = "idle";
    //                 callback();
    //             });
    //         });
    //     });
    // });
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

        try {
            tempUrls.push(targetUrl);
        }catch (err){
            sys.puts("Couldn't add the url! [" + sys.inspect(err) + "]");
        }

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

    urls.push("http://digg.com",
              "http://wikimedia.org/",
              "http://fakecoolguys.com",
"http://www.google.com/images?q=kaching&um=1&ie=UTF-8&source=og&sa=N&hl=en&tab=wi",
"http://www.google.com/search?q=kaching&um=1&ie=UTF-8&tbo=u&tbs=vid:1&source=og&sa=N&hl=en&tab=wv",
"http://maps.google.com/maps?q=kaching&um=1&ie=UTF-8&sa=N&hl=en&tab=wl",
"http://www.google.com/search?q=kaching&um=1&ie=UTF-8&tbo=u&tbs=nws:1&source=og&sa=N&hl=en&tab=wn",
"http://www.google.com/products?q=kaching&um=1&ie=UTF-8&sa=N&hl=en&tab=wf",
"http://mail.google.com/mail/?hl=en&tab=wm",
"http://www.google.com/intl/en/options/",
"http://www.google.com/search?q=kaching&um=1&ie=UTF-8&tbo=u&tbs=bks:1&source=og&sa=N&hl=en&tab=wp",
"http://www.google.com/finance?q=kaching&um=1&ie=UTF-8&sa=N&hl=en&tab=we",
"http://translate.google.com/translate_t?q=kaching&um=1&ie=UTF-8&sa=N&hl=en&tab=wT",
"http://scholar.google.com/scholar?q=kaching&um=1&ie=UTF-8&sa=N&hl=en&tab=ws",
"http://www.google.com/search?q=kaching&um=1&ie=UTF-8&tbo=u&tbs=blg:1&source=og&sa=N&hl=en&tab=wb",
"http://www.youtube.com/results?q=kaching&um=1&ie=UTF-8&sa=N&hl=en&tab=w1",
"http://www.google.com/calendar/render?hl=en&tab=wc",
"http://picasaweb.google.com/lh/view?q=kaching&um=1&ie=UTF-8&sa=N&hl=en&tab=wq",
"http://docs.google.com/?hl=en&tab=wo&authuser=0",
"http://www.google.com/reader/view/?hl=en&tab=wy",
"http://sites.google.com/?hl=en&tab=w3",
"http://groups.google.com/groups?q=kaching&um=1&ie=UTF-8&sa=N&hl=en&tab=wg",
"http://www.google.com/intl/en/options/",
"http://www.google.com/preferences?hl=en",
"http://www.google.com/accounts/Logout?continue=http://www.google.com/search%3Fsourceid%3Dchrome%26ie%3DUTF-8%26q%3Dkaching",
"http://www.google.com/preferences?hl=en",
"https://www.google.com/accounts/ManageAccount?hl=en",
"http://www.google.com/webhp?hl=en",
"http://www.google.com/preferences?q=kaching&num=20&hl=en&safe=off&sa=F",
"http://www.google.com/setprefs?sig=0_Wl2d03VpvhFfWGDVC2kO4_frSRk=&safeui=off&prev=http://www.google.com/search%3Fsourceid%3Dchrome%26ie%3DUTF-8%26q%3Dkaching%26start%3D0%26uss%3D1",
"http://www.google.com/setprefs?sig=0_Wl2d03VpvhFfWGDVC2kO4_frSRk=&safeui=images&prev=http://www.google.com/search%3Fsourceid%3Dchrome%26ie%3DUTF-8%26q%3Dkaching%26start%3D0%26uss%3D1",
"http://www.google.com/setprefs?sig=0_Wl2d03VpvhFfWGDVC2kO4_frSRk=&safeui=on&prev=http://www.google.com/search%3Fsourceid%3Dchrome%26ie%3DUTF-8%26q%3Dkaching%26start%3D0%26uss%3D1",
"http://www.google.com/support/websearch/bin/answer.py?answer=510",
"http://www.google.com/advanced_search?q=kaching&num=20&hl=en&safe=off",
"http://www.kaching.com/",
"http://www.google.com/url?q=https://www.kaching.com/managers&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CB0Q0gIoADAA&usg=AFQjCNEYhneL_m8EI0Gq8Kn2Oh84U3KUnw",
"http://www.google.com/url?q=https://www.kaching.com/company/about&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CB4Q0gIoATAA&usg=AFQjCNEEKIa7JM-t5CMoQGgTvXHejwEmPQ",
"http://www.google.com/url?q=https://www.kaching.com/company/jobs&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CB8Q0gIoAjAA&usg=AFQjCNHjAiJdp-POReHvbUIK5tVq4HL7Pg",
"http://www.google.com/url?q=https://www.kaching.com/company/team&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CCAQ0gIoAzAA&usg=AFQjCNHo4eV8ZghLA2RX-ZI2FeNg7DxzEQ",
"http://webcache.googleusercontent.com/search?q=cache:ZabsVFvAN94J:www.kaching.com/+kaching&cd=1&hl=en&ct=clnk&gl=us",
"http://www.google.com/search?hl=en&safe=off&q=related:www.kaching.com/+kaching&tbo=1&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CBwQHzAA",
"http://www.youtube.com/watch?v=I42c6RP04xU",
"http://www.google.com/url?q=http://www.youtube.com/watch%3Fv%3DI42c6RP04xU&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CCQQuAIwAQ&usg=AFQjCNFBSlWk_L7JwPLvtY2zW7zlgW3NMw",
"http://www.google.com/search?q=related:http://www.youtube.com/watch%3Fv%3DI42c6RP04xU&num=20&hl=en&safe=off&tbs=vid:1&tbo=u&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CCUQrAQwAQ&docid=0",
"http://www.google.com/search?q=kaching&num=20&hl=en&safe=off&tbs=vid:1&tbo=u&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CCcQmAcwAQ",
"http://kaching.tumblr.com/",
"http://webcache.googleusercontent.com/search?q=cache:aCTskM5pam8J:kaching.tumblr.com/+kaching&cd=3&hl=en&ct=clnk&gl=us",
"http://www.google.com/search?hl=en&safe=off&q=related:kaching.tumblr.com/+kaching&tbo=1&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CCwQHzAC",
"http://www.urbandictionary.com/define.php?term=ka-ching",
"http://webcache.googleusercontent.com/search?q=cache:OfrmhclfoFgJ:www.urbandictionary.com/define.php%3Fterm%3Dka-ching+kaching&cd=4&hl=en&ct=clnk&gl=us",
"http://www.google.com/search?hl=en&safe=off&q=related:www.urbandictionary.com/define.php%3Fterm%3Dka-ching+kaching&tbo=1&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CDEQHzAD",
"https://www.kaching.com/managers",
"http://webcache.googleusercontent.com/search?q=cache:LOh3vqAnjcYJ:https://www.kaching.com/managers+kaching&cd=5&hl=en&ct=clnk&gl=us",
"https://www.kaching.com/blog",
"http://webcache.googleusercontent.com/search?q=cache:NJOJ7sAUoQEJ:https://www.kaching.com/blog+kaching&cd=6&hl=en&ct=clnk&gl=us",
"http://www.google.com/search?hl=en&safe=off&q=related:https://www.kaching.com/blog+kaching&tbo=1&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CDoQHzAF",
"http://www.google.com/search?sourceid=chrome&ie=UTF-8&q=kaching#",
"http://www.crunchbase.com/company/kaching",
"http://www.google.com/url?q=http://www.crunchbase.com/companies&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CD8Q6QUoAA&usg=AFQjCNEL3lfvzItossJPzVtWnqIkf58T0w",
"http://webcache.googleusercontent.com/search?q=cache:JAh5cdbXlZMJ:www.crunchbase.com/company/kaching+kaching&cd=7&hl=en&ct=clnk&gl=us",
"http://www.google.com/search?hl=en&safe=off&q=related:www.crunchbase.com/company/kaching+kaching&tbo=1&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CEIQHzAG",
"http://en.wikipedia.org/wiki/Ka-Ching!",
"http://webcache.googleusercontent.com/search?q=cache:ghR30B7eb-0J:en.wikipedia.org/wiki/Ka-Ching!+kaching&cd=8&hl=en&ct=clnk&gl=us",
"http://www.google.com/search?hl=en&safe=off&q=related:en.wikipedia.org/wiki/Ka-Ching!+kaching&tbo=1&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CEcQHzAH",
"http://www.boardgamegeek.com/boardgame/2968/ka-ching",
"http://webcache.googleusercontent.com/search?q=cache:XEiGp0-Xv8kJ:www.boardgamegeek.com/boardgame/2968/ka-ching+kaching&cd=9&hl=en&ct=clnk&gl=us",
"http://www.facebook.com/apps/application.php?id=2339204748&ref=blog",
"http://webcache.googleusercontent.com/search?q=cache:JwfUqYKSrzIJ:www.facebook.com/apps/application.php%3Fid%3D2339204748%26ref%3Dblog+kaching&cd=10&hl=en&ct=clnk&gl=us",
"http://wallstcheatsheet.com/knowledge/reviews/review-kaching-pro-for-investment-managers/?p=10137/",
"http://webcache.googleusercontent.com/search?q=cache:zeQRIY66CW0J:wallstcheatsheet.com/knowledge/reviews/review-kaching-pro-for-investment-managers/%3Fp%3D10137/+kaching&cd=11&hl=en&ct=clnk&gl=us",
"http://kachingrecords.com/",
"http://webcache.googleusercontent.com/search?q=cache:iUfvvhjJTjYJ:kachingrecords.com/+kaching&cd=12&hl=en&ct=clnk&gl=us",
"http://www.google.com/search?hl=en&safe=off&q=related:kachingrecords.com/+kaching&tbo=1&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CFgQHzAL",
"http://news.cnet.com/8301-19882_3-10377426-250.html",
"http://webcache.googleusercontent.com/search?q=cache:bD6UMTMvpvEJ:news.cnet.com/8301-19882_3-10377426-250.html+kaching&cd=13&hl=en&ct=clnk&gl=us",
"http://www.google.com/search?hl=en&safe=off&q=related:news.cnet.com/8301-19882_3-10377426-250.html+kaching&tbo=1&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CF0QHzAM",
"http://www.kachingbutton.com/",
"http://webcache.googleusercontent.com/search?q=cache:jSt88NNh_AsJ:www.kachingbutton.com/+kaching&cd=14&hl=en&ct=clnk&gl=us",
"http://www.amazon.com/Ka-Ching-Pitt-Poetry-Denise-Duhamel/dp/0822960214",
"http://www.google.com/url?q=http://www.amazon.com/Poetry-Literature-Fiction-Books/b%3Fie%3DUTF8%26node%3D10248&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CGUQ6QUoAQ&usg=AFQjCNE8vRxBtZtVhZMjiXWJyn3ORni4rw",
"http://www.google.com/url?q=http://www.amazon.com/Anthologies-Poetry-Literature-Fiction-Books/b%3Fie%3DUTF8%26node%3D10250&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CGYQ6QUoAg&usg=AFQjCNGpNmpZCuleAG_DaC3epGk-77_ATw",
"http://webcache.googleusercontent.com/search?q=cache:EaTBqCP1iYQJ:www.amazon.com/Ka-Ching-Pitt-Poetry-Denise-Duhamel/dp/0822960214+kaching&cd=15&hl=en&ct=clnk&gl=us",
"http://www.google.com/search?hl=en&safe=off&q=related:www.amazon.com/Ka-Ching-Pitt-Poetry-Denise-Duhamel/dp/0822960214+kaching&tbo=1&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CGkQHzAO",
"http://www.startribune.com/lifestyle/yourmoney/11059181.html",
"http://webcache.googleusercontent.com/search?q=cache:bZQkGr7X_cgJ:www.startribune.com/lifestyle/yourmoney/11059181.html+kaching&cd=16&hl=en&ct=clnk&gl=us",
"http://www.google.com/search?hl=en&safe=off&q=related:www.startribune.com/lifestyle/yourmoney/11059181.html+kaching&tbo=1&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CG4QHzAP",
"http://www.kachingdesign.com/",
"http://webcache.googleusercontent.com/search?q=cache:yaxfKxN0TxQJ:www.kachingdesign.com/+kaching&cd=17&hl=en&ct=clnk&gl=us",
"http://www.google.com/search?hl=en&safe=off&q=related:www.kachingdesign.com/+kaching&tbo=1&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CHMQHzAQ",
"http://www.chr.ucla.edu/chr/portaldocs/ben/bendoc-health-assessment-flyer.pdf",
"http://webcache.googleusercontent.com/search?q=cache:s8m6eC9L4k8J:www.chr.ucla.edu/chr/portaldocs/ben/bendoc-health-assessment-flyer.pdf+kaching&cd=18&hl=en&ct=clnk&gl=us",
"http://www.colbertnation.com/the-colbert-report-videos/249055/september-15-2009/the-word---let-freedom-ka-ching",
"http://webcache.googleusercontent.com/search?q=cache:14rF9qq1w_UJ:www.colbertnation.com/the-colbert-report-videos/249055/september-15-2009/the-word---let-freedom-ka-ching+kaching&cd=19&hl=en&ct=clnk&gl=us",
"http://www.google.com/search?hl=en&safe=off&q=related:www.colbertnation.com/the-colbert-report-videos/249055/september-15-2009/the-word---let-freedom-ka-ching+kaching&tbo=1&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CHwQHzAS",
"http://www.ka-chingworld.com/",
"http://webcache.googleusercontent.com/search?q=cache:YC3Kp3scPEQJ:www.ka-chingworld.com/+kaching&cd=20&hl=en&ct=clnk&gl=us",
"http://www.google.com/search?hl=en&safe=off&q=related:www.ka-chingworld.com/+kaching&tbo=1&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CIEBEB8wEw",
"http://www.google.com/search?num=20&hl=en&safe=off&q=kaching+review&revid=936234565&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CIQBENUCKAA",
"http://www.google.com/search?num=20&hl=en&safe=off&q=kaching+brands&revid=936234565&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CIUBENUCKAE",
"http://www.google.com/search?num=20&hl=en&safe=off&q=kaching+api+project&revid=936234565&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CIYBENUCKAI",
"http://www.google.com/search?num=20&hl=en&safe=off&q=kaching+iphone&revid=936234565&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CIcBENUCKAM",
"http://www.google.com/search?num=20&hl=en&safe=off&q=kaching+stock+investing+app&revid=936234565&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CIgBENUCKAQ",
"http://www.google.com/search?num=20&hl=en&safe=off&q=use+kaching+api&revid=936234565&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CIkBENUCKAU",
"http://www.google.com/search?num=20&hl=en&safe=off&q=kaching+group+inc&revid=936234565&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CIoBENUCKAY",
"http://www.google.com/search?sourceid=chrome&ie=UTF-8&q=kaching#",
"http://www.google.com/aclk?sa=l&ai=Cx6dibzRLTMq3JZCmsAP7-tTfBt3ss8MB1eXS_hL54uWsBBABKAJQ56OJkvv_____AWDJ7u2GyKOgGaABjcu6_wPIAQGqBBZP0JblKp2LufUL7Q1nHvJU-o9M1-ip&num=1&sig=AGiWqtwUpsI606ijMwEoJFNJtnszIRT8pQ&adurl=http://www.collective2.com/cgi-perl/intro.mpl%3Fmediaid%3Dc2tso",
"http://www.google.com/aclk?sa=L&ai=CEXGCbzRLTMq3JZCmsAP7-tTfBqzA7KQB6vWY6Q354uWsBBACKAJQirGLSmDJ7u2GyKOgGcgBAaoEFk_QhucUnYi59QvtDWce8lT6j0zX6Kk&num=2&sig=AGiWqtwLJeJY2URt-N7hGbE-9-O_ydOsmQ&adurl=http://www.kachingtoday.com",
"https://adwords.google.com/select/Login?sourceid=awo&subid=us-en-et-symh&medium=link&hl=en",
"http://www.google.com/images?q=kaching&num=20&hl=en&safe=off&source=lnms&tbs=isch:1&ei=bzRLTPSFJYumsQOpkphJ&sa=X&oi=mode_link&ct=mode&ved=0CA4Q_AU",
"http://www.google.com/search?q=kaching&num=20&hl=en&safe=off&source=lnms&tbs=vid:1&ei=bzRLTPSFJYumsQOpkphJ&sa=X&oi=mode_link&ct=mode&ved=0CA8Q_AU",
"http://maps.google.com/maps?q=kaching&um=1&ie=UTF-8&ei=bzRLTPSFJYumsQOpkphJ&sa=X&oi=mode_link&ct=mode&ved=0CBAQ_AU",
"http://www.google.com/search?q=kaching&num=20&hl=en&safe=off&source=lnms&tbs=nws:1&ei=bzRLTPSFJYumsQOpkphJ&sa=X&oi=mode_link&ct=mode&ved=0CBEQ_AU",
"http://www.google.com/products?q=kaching&um=1&ie=UTF-8&ei=bzRLTPSFJYumsQOpkphJ&sa=X&oi=mode_link&ct=mode&ved=0CBIQ_AU",
"http://www.google.com/search?q=kaching&num=20&hl=en&safe=off&source=lnms&tbs=bks:1&ei=bzRLTPSFJYumsQOpkphJ&sa=X&oi=mode_link&ct=mode&ved=0CBMQ_AU",
"http://www.google.com/search?q=kaching&num=20&hl=en&safe=off&source=lnms&tbs=blg:1&ei=bzRLTPSFJYumsQOpkphJ&sa=X&oi=mode_link&ct=mode&ved=0CBQQ_AU",
"http://www.google.com/search?q=kaching&num=20&hl=en&safe=off&source=lnms&tbs=mbl:1&ei=bzRLTPSFJYumsQOpkphJ&sa=X&oi=mode_link&ct=mode&ved=0CBUQ_AU",
"http://www.google.com/search?q=kaching&num=20&hl=en&safe=off&source=lnms&tbs=dsc:1&ei=bzRLTPSFJYumsQOpkphJ&sa=X&oi=mode_link&ct=mode&ved=0CBYQ_AU",
"http://www.google.com/search?sourceid=chrome&ie=UTF-8&q=kaching#",
"http://www.google.com/search?q=kaching&num=20&hl=en&safe=off&source=lnt&tbs=qdr:d3&sa=X&ei=bzRLTPSFJYumsQOpkphJ&ved=0CAsQpwU",
"http://www.google.com/search?q=kaching&num=20&hl=en&safe=off&tbo=1",
"http://www.google.com/search?q=kaching&num=20&hl=en&safe=off&ei=bzRLTPSFJYumsQOpkphJ&start=20&sa=N",
"http://www.google.com/search?q=kaching&num=20&hl=en&safe=off&ei=bzRLTPSFJYumsQOpkphJ&start=40&sa=N",
"http://www.google.com/search?q=kaching&num=20&hl=en&safe=off&ei=bzRLTPSFJYumsQOpkphJ&start=60&sa=N",
"http://www.google.com/search?q=kaching&num=20&hl=en&safe=off&ei=bzRLTPSFJYumsQOpkphJ&start=80&sa=N",
"http://www.google.com/search?q=kaching&num=20&hl=en&safe=off&ei=bzRLTPSFJYumsQOpkphJ&start=100&sa=N",
"http://www.google.com/search?q=kaching&num=20&hl=en&safe=off&ei=bzRLTPSFJYumsQOpkphJ&start=120&sa=N",
"http://www.google.com/search?q=kaching&num=20&hl=en&safe=off&ei=bzRLTPSFJYumsQOpkphJ&start=140&sa=N",
"http://www.google.com/search?q=kaching&num=20&hl=en&safe=off&ei=bzRLTPSFJYumsQOpkphJ&start=160&sa=N",
"http://www.google.com/search?q=kaching&num=20&hl=en&safe=off&ei=bzRLTPSFJYumsQOpkphJ&start=180&sa=N",
"http://www.google.com/search?q=kaching&num=20&hl=en&safe=off&ei=bzRLTPSFJYumsQOpkphJ&start=20&sa=N",
"http://www.google.com/swr?q=kaching&hl=en&safe=off&swrnum=667000",
"http://www.google.com/support/websearch/bin/answer.py?answer=134479&hl=en",
"http://www.google.com/quality_form?q=kaching&num=20&hl=en&safe=off",
"http://www.google.com/",
"http://www.google.com/intl/en/ads/",
"http://www.google.com/services/",
"http://www.google.com/intl/en/privacy.html",
"http://www.google.com/intl/en/about.html"
             );

    sys.puts("Initialized urls:" + sys.inspect(urls));
}

sys.puts("browserUrls:" + sys.inspect(browserUrls));

sys.puts("Beginning loop through workers");
sys.puts("Workers: " + sys.inspect(workers));

var runAgain = false;

function runWorkers() {
    for (worker_index in workers) {
        (function (i) {
            var worker = workers[i];

            if (worker.status == "idle") {
                worker.run(function() {
                        worker.status = "idle";
                })
            }
        })(worker_index);
    }
}

setInterval(runWorkers, 500);
