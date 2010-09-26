var request = require('request'),
    BufferList = require('bufferlist').BufferList,
    sys = require('sys'),
    http = require('http'),  
    url = require('url'),
    fs = require('fs'),
    io = require('./lib/socket.io-node/lib/socket.io'); // for npm, otherwise use require('./path/to/socket.io')
    
var imageUrls = [
    "http://img0.gmodules.com/ig/images/igoogle_logo_sm.png",
    "https://saucelabs.com/images/logos/sauce_masthead_horizontal.png",
    "http://www.flash-slideshow-maker.com/images/help_clip_image020.jpg",
    "http://t2.gstatic.com/images?q=tbn:ANd9GcRqBS2kfkyWx6CvPRDKvqK7nHR-ntRUfzF4vYQZiRfVX9L3mj4&t=1&usg=__htpQeZ9jTNZ0Sb1YpO1nZ1mGZVU=",
    "http://www.oxfordreference.com/media/images/9346_0.jpg"]    
/*
  Helper Functions
*/
function getContentType(path){
  var extension = path.split('.').pop();
  
  var contentTypes = {
    'js' : 'text/javascript',
    'css' : 'text/css',
    'html' : 'text/html',
    'png' : 'image/png' 
  };
  
  return (contentTypes[extension]) ? contentTypes[extension] : 'text/html'
}

function send404(res){
    console.log("[Error] 404");
    res.writeHead(404);
    res.write('404');
    res.end();
};  

/*
  Setup Server
*/
server = http.createServer(function(req, res){
  
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
            if (err){ return send404(res) };
            res.writeHead(200, {'Content-Type': getContentType(path)})
            res.write(data, 'utf8');
            res.end();
        });
    };        
}),

server.listen(8080);




function rotateImageData() {
    sys.puts("Rotating image...", counter, imageUrls.length);
    getImageData(imageUrls[counter]);
    if(counter >= imageUrls.length -1){
      counter = 0;
    }else{
      counter += 1;
    }
};

/*
* Setup Socket IO
*/
var io = io.listen(server),
    buffer = [];

io.on('connection', function(client){
    var counter = 0;

    function getImageData(imageUrl, client) {
        var bl = new BufferList();
        var imageData;
        sys.puts("Fetching: " + imageUrl);
        request({uri:imageUrl, responseBodyStream: bl}, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var data_uri_prefix = "data:" + response.headers["content-type"] + ";base64,";
                var image = new Buffer(body.toString(), 'binary').toString('base64');

                imageData = data_uri_prefix + image;
                 
                client.send({
                    imageData : imageData,
                    browser_name : 'iexplore',
                    browser_version : 8,
                    time: new Date()
                });
                
                if(counter < imageUrls.length-1){
                  counter++;
                }else{
                  counter = 0;
                }
                setTimeout(function(){
                  getImageData(imageUrls[counter], client);
                }, 2000)
            }
        });
    }; 
  
    //Socket IO disconnects
    client.on('disconnect', function(){
        client.broadcast({ announcement: client.sessionId + ' disconnected' });
    });
    console.log("Received a socket.io connect: ", client.sessionId);
    
    getImageData(imageUrls[counter], client);
});


sys.puts("Listening... 8080");

