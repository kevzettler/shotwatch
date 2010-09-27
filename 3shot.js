
var request = require('request'),
    BufferList = require('bufferlist').BufferList,
    sys = require('sys'),
    http = require('http'),  
    url = require('url'),
    fs = require('fs'),
    io = require('./lib/socket.io-node/lib/socket.io'); // for npm, otherwise use require('./path/to/socket.io')

//only extends native array
require('./lib/Array.js');
   

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



/*
* Setup Socket IO
*/
var io = io.listen(server),
    buffer = [];

io.on('connection', function(client){
    var imageUrls = [],
    imagesToRender = [];  

    function getImageData(imageUrl) {
        var bl = new BufferList();
        var imageData;
        sys.puts("Fetching: " + shotsDir+"/"+imageUrl);

        fs.readFile(shotsDir+"/"+imageUrl, 'binary', function(err, data){
            if(!err){
             var image = new Buffer(data.toString(), 'binary').toString('base64');
             
             imagePathChunks = imageUrl.split('_');
             
             var imageData = 'data:image/png;base64,' + image;
             //send the image data over the socket
             client.send({
                 imageData : imageData,
                 browser_name : imagePathChunks[1],
                 browser_version : imagePathChunks[2],
                 time: new Date()
             });  
            }else{
              sys.puts(sys.inspect(err));
            }
        });
        
    }; 
  
    //Socket IO disconnects
    client.on('disconnect', function(){
        client.broadcast({ announcement: client.sessionId + ' disconnected' });
    });
    console.log("Received a socket.io connect: ", client.sessionId);
     
    function renderImages(){
      for(i = 0; i<imagesToRender.length; i++){
        getImageData(imagesToRender[i]);    
      }
    }
    
    function checkShotDir(){
     var newFiles, goodFiles;  
     fs.readdir(shotsDir, function(err, files){
        if(imageUrls.length == 0){
          //fresh images render them
          imageUrls = files;
          imagesToRender = files
          renderImages();
        }else if(imageUrls.length != files.length){
          //new images
          newFiles = files.diff(imageUrls);
          //reduce newFiles to only png
          for(i=0; i < newFiles.length; i++){
            if(newFiles[i].split('.').pop() == 'png'){
              goodFiles.push(newFiles[i]);
            }
          }
          
          if(goodFiles.length > 0){
            imageUrls = files;
            imagesToRender = goodFiles;
            newFiles = [];
            renderImages();
          }
        }
     }); 
    }
    checkShotDir();
    
    /****
    * CAUTION
    * If we are checking the Directory too fast.
    * And an image is copied in.
    * Node will try and render the image before the data
    * Has been copied, and render an empty buffer
    ****/
    var checkShotDir = setInterval(checkShotDir, 2000);
});


sys.puts("Listening... 8080");

