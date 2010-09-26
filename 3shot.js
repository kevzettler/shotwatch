var request = require('request'),
    BufferList = require('bufferlist').BufferList,
    sys = require('sys'),
    http = require('http'),  
    url = require('url'),
    fs = require('fs'),
    io = require('./lib/socket.io-node/lib/socket.io'); // for npm, otherwise use require('./path/to/socket.io')

server = http.createServer(function(req, res){
    // your normal server code
    var path = url.parse(req.url).pathname;

    switch (path){
    case '/':
        sys.puts("something happened");
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('<h1>Welcome. Try the <a href="/chat.html">chat</a> example.</h1>');
        res.end();
        break;
    default:
        serveFile(path);
    }

    function serveFile(path) {
        var filename = __dirname + "/web" + path;
        fs.readFile(filename, function(err, data){
            console.log("pathname: ", path);
            sys.puts("Sending file...[" + filename + "]");
            if (err) return send404(res);
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.write(data, 'utf8');
            res.end();
        });
    };
        
}),

send404 = function(res){
    console.log("[Error] 404");
    res.writeHead(404);
    res.write('404');
    res.end();
};

server.listen(8080);

var imageUrls = [
    "http://img0.gmodules.com/ig/images/igoogle_logo_sm.png",
    "https://saucelabs.com/images/logos/sauce_masthead_horizontal.png",
    "http://www.flash-slideshow-maker.com/images/help_clip_image020.jpg",
    "http://t2.gstatic.com/images?q=tbn:ANd9GcRqBS2kfkyWx6CvPRDKvqK7nHR-ntRUfzF4vYQZiRfVX9L3mj4&t=1&usg=__htpQeZ9jTNZ0Sb1YpO1nZ1mGZVU=",
    "http://www.oxfordreference.com/media/images/9346_0.jpg",
    "https://saucelabs.com/jobs/cc166bba20685b34dce43e6b3eae6b85/0000screenshot.png",
    "https://saucelabs.com/jobs/cc166bba20685b34dce43e6b3eae64ab/0000screenshot.png",
    "https://saucelabs.com/jobs/cc166bba20685b34dce43e6b3eae64ab/0002screenshot.png",
    "https://saucelabs.com/jobs/cc166bba20685b34dce43e6b3eae64ab/0004screenshot.png",
    "https://saucelabs.com/jobs/cc166bba20685b34dce43e6b3eae64ab/0006screenshot.png",
    "https://saucelabs.com/jobs/cc166bba20685b34dce43e6b3eae64ab/0008screenshot.png",
    "https://saucelabs.com/jobs/cc166bba20685b34dce43e6b3eae64ab/0010screenshot.png",
    "https://saucelabs.com/jobs/cc166bba20685b34dce43e6b3eae64ab/0012screenshot.png",
    "https://saucelabs.com/jobs/cc166bba20685b34dce43e6b3eae64ab/0014screenshot.png"]

var bl = new BufferList();
var imageData;

function getImageData(imageUrl) {
    sys.puts("Fetching: " + imageUrl);
    request({uri:imageUrl, responseBodyStream: bl}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var data_uri_prefix = "data:" + response.headers["content-type"] + ";base64,";
            var image = new Buffer(bl.toString(), 'binary').toString('base64');

            //console.log("image(base64): ", image);
            imageData = data_uri_prefix + image;
            //        res.send({image_data : image,
            //                browser : browser_name,
            //              version : browser_version})
        }
    });
};

var counter = 0;
function rotateImageData() {
    sys.puts("Rotating image...");
    getImageData(imageUrls[counter]);
    counter += 1;
};

// socket.io, I choose you
var io = io.listen(server),
    buffer = [];

io.on('connection', function(client){
    sys.puts("Received a socket.io connect: ", client);

    rotateImageData();

    function sendSomething() {
        rotateImageData();
        console.log("imageData: ", imageData);
        client.send({
            imageData : imageData,
            time: new Date()
        });
    };

    var timer = setInterval(sendSomething, 5000);
    
    client.on('message', function(message){
        var msg = { message: [client.sessionId, message] };
        buffer.push(msg);
        if (buffer.length > 15) buffer.shift();
        client.broadcast(msg);
    });

    client.on('disconnect', function(){
        client.broadcast({ announcement: client.sessionId + ' disconnected' });
    });
});


sys.puts("Listening...");
//server.listen(3001);

