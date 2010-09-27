require('joose');
require('joosex-namespace-depended');
require('hash');

var request = require('request'),
    BufferList = require('bufferlist').BufferList,
    sys = require('sys'),
    http = require('http'),  
    url = require('url'),
    fs = require('fs');


var url = "http://student.kfupm.edu.sa/s200354630/Multi/images/o-png8.png";
var urlFilename = Hash.md5(url);

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

function getImage(url, browser) {
    var bl = new BufferList();

    request({uri:url, responseBodyStream: bl}, function (error, response, body) {
        console.log("Post-req browser: ", browser.name);
        if (!error && response.statusCode == 200) {
            console.log("Post-cond browser: ", browser.name);
            var data_uri_prefix = "data:" + response.headers["content-type"] + ";base64,";
            var imageRaw = new Buffer(bl.toString(), 'binary');
            var image = imageRaw.toString('base64');


            imageData = data_uri_prefix + image;
            browser.imageData = imageData;

            console.log("Browser: ");
            console.log("Saving files..");
            fs.writeFile("shots/" + urlFilename + "_" + browser.name + "_" + browser.version + "_2_.b64", imageData);
            fs.writeFile("shots/" + urlFilename + "_" + browser.name + "_" + browser.version + "_2_.raw.png", imageRaw);


            console.log("\tname: ", browser.name);
            console.log("\tversion: ", browser.version);
            console.log("\tdata: ", browser.imageData.substring(0, 80));
        } else {
            console.log("error [", response.statusCode,  "]: ", error);
        }
    });
};

for (browser_index in browsers) {
    var browser = browsers[browser_index];

    console.log("Browser should be: ", browser.name);
    sys.puts("Fetching: " + url);

    getImage(url, browser);
};

var counter = 0;
function rotateImageData() {
    sys.puts("Rotating image...");
    getImageData(imageUrls[counter]);
    counter += 1;
};

