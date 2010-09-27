// Return new array with duplicate values removed
Array.prototype.unique =
  function() {
    var a = [];
    var l = this.length;
    for(var i=0; i<l; i++) {
      for(var j=i+1; j<l; j++) {
        // If this[i] is found later in the array
        if (this[i] === this[j])
          j = ++i;
      }
      a.push(this[i]);
    }
    return a;
  };

// Return elements which are in A but not in arg0 through argn
Array.prototype.diff =
  function() {
    var a1 = this;
    var a = a2 = null;
    var n = 0;
    while(n < arguments.length) {
      a = [];
      a2 = arguments[n];
      var l = a1.length;
      var l2 = a2.length;
      var diff = true;
      for(var i=0; i<l; i++) {
        for(var j=0; j<l2; j++) {
          if (a1[i] === a2[j]) {
            diff = false;
            break;
          }
        }
        diff ? a.push(a1[i]) : diff = true;
      }
      a1 = a;
      n++;
    }
    return a.unique();
  };  



var request = require('request'),
    BufferList = require('bufferlist').BufferList,
    sys = require('sys'),
    http = require('http'),  
    url = require('url'),
    fs = require('fs'),
    io = require('./lib/socket.io-node/lib/socket.io'); // for npm, otherwise use require('./path/to/socket.io')


/*    
var imageUrls = [
    "http://img0.gmodules.com/ig/images/igoogle_logo_sm.png",
    "https://saucelabs.com/images/logos/sauce_masthead_horizontal.png",
    "http://www.flash-slideshow-maker.com/images/help_clip_image020.jpg",
    "http://t2.gstatic.com/images?q=tbn:ANd9GcRqBS2kfkyWx6CvPRDKvqK7nHR-ntRUfzF4vYQZiRfVX9L3mj4&t=1&usg=__htpQeZ9jTNZ0Sb1YpO1nZ1mGZVU=",
    "http://www.oxfordreference.com/media/images/9346_0.jpg"] 
*/   

var shotsDir = __dirname + "/shots";

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
    var imageUrls = []; 

    function getImageData(imageUrl) {
        var bl = new BufferList();
        var imageData;
        sys.puts("Fetching: " + shotsDir+"/"+imageUrl);

        fs.readFile(shotsDir+"/"+imageUrl, 'binary', function(err, data){
            if(!err){
             var image = new Buffer(data.toString(), 'binary').toString('base64');
             
             imagePathChunks = imageUrl.split('_');
             
             sys.puts(sys.inspect(image));
             var imageData = 'data:image/png;base64,' + image;
             //send the image data over the socket
             client.send({
                 imageData : imageData,
                 browser_name : imagePathChunks[1],
                 browser_version : imagePathChunks[2],
                 time: new Date()
             });  
            }
        });
        
    }; 
  
    //Socket IO disconnects
    client.on('disconnect', function(){
        client.broadcast({ announcement: client.sessionId + ' disconnected' });
    });
    console.log("Received a socket.io connect: ", client.sessionId);
     
    function renderImages(){
      for(i = 0; i<imageUrls.length; i++){
        getImageData(imageUrls[i]);    
      }
    }
    
    function checkShotDir(){
     var localFiles;
     
     fs.readdir(shotsDir, function(err, files){
        if(imageUrls.length == 0){
          //fresh images render them
          imageUrls = files;
          renderImages();
        }else if(imageUrls.length != files.length){
          //new images
          localFiles = files;
          var newFiles = localFiles.diff(imageUrls);
          if(newFiles.length > 0){
            imageUrls = newFiles;
            renderImages();
          }
        }

     }); 
    }
    checkShotDir();
    var checkShotDir = setInterval(checkShotDir, 20);
});


sys.puts("Listening... 8080");

