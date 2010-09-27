
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
  
  return (contentTypes[extension]) ? contentTypes[extension] : 'text/html';
}

function send404(res){
    console.log("[Error] 404");
    res.writeHead(404);
    res.write('404');
    res.end();
}  

/*
  Setup Server
*/
server = http.createServer(function(req, res){
  
    var path = url.parse(req.url).pathname;
     
    function serveFile(path) {
        var filename = __dirname + "/web" + path;
        fs.readFile(filename, function(err, data){
            console.log("pathname: ", path);
            sys.puts("Sending file...[" + filename + "]");
            if (err){ return send404(res); }
            res.writeHead(200, {'Content-Type': getContentType(path)});
            res.write(data, 'utf8');
            res.end();
        });
    }


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
});

server.listen(8080);



/*
* Setup Socket IO
*/
var io = io.listen(server),
    buffer = [];

io.on('connection', function(client){
    // Images we've sent already
    var imageUrls = [],
    imagesToRender = [],
    browserPair = {},
    newestFiles = [];
    
    function getNewestFiles(files, callback){
      imageUrls = files;
      console.log("get neweest files");
      for(i = 0; i < files.length; i++){
       if(files[i].split('.').pop() == 'png'){
         fileNameChunks = files[i].split('_');
         console.log('name chunks');
         sys.puts(sys.inspect(fileNameChunks));
         if(!browserPair[fileNameChunks[1]+""+fileNameChunks[2]] || browserPair[fileNameChunks[1]+""+fileNameChunks[2]].version < parseInt(fileNameChunks[3], 10)){
           console.log('addin new pair');
           
           if(!browserPair[fileNameChunks[1]+""+fileNameChunks[2]]){ browserPair[fileNameChunks[1]+""+fileNameChunks[2]] = {};}
           
           browserPair[fileNameChunks[1]+""+fileNameChunks[2]].version = parseInt(fileNameChunks[3], 10);
           browserPair[fileNameChunks[1]+""+fileNameChunks[2]].path = files[i];
         }
       }
      }
        console.log("browserPairs???"); 
        sys.puts(sys.inspect(browserPair));
          
        for(browser in browserPair){
          newestFiles.push(browserPair[browser].path);
        }                               
        console.log("new files returned from browser pair loop");
        sys.puts(sys.inspect(newestFiles));
        callback(newestFiles);   
    }  

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
     var newFiles;  
     fs.readdir(shotsDir, function(err, files){
         //sys.puts("Checking for new files...");
         sys.puts(sys.inspect(imageUrls) + " == " + sys.inspect(files) + " -> " + sys.inspect(imageUrls.diff(files)) + ", " + sys.inspect(imageUrls.diff(files).length) + " diffs");
         var goodFiles = [];

         sys.puts("imageUrls.length == 0 ?");
         sys.puts(imageUrls.length === 0);
         sys.puts("Stupid add imageUrls:" + sys.inspect(imageUrls));
        if(imageUrls.length === 0){
          sys.puts("Running through getNewestFiles, biatch");
          //fresh images render them
            getNewestFiles(files, function(rawFiles){
            console.log('omg GET NEW FILES -- raw files');
            sys.puts(sys.inspect(rawFiles));
            imagesToRender = [];
            for(i=0; i < rawFiles.length; i++){
                if(rawFiles[i].split('.').pop() == 'png'){
                    sys.puts("adding: [" + rawFiles[i] + "]");
                    //imageUrls.push(rawFiles[i]);
                    imagesToRender.push(rawFiles[i]);
                }
            }
            renderImages();
          });
        }else if(imageUrls.symmetricDiff(files).length !== 0){
          //new images
          newFiles = files.diff(imageUrls);
          //reduce newFiles to only png
          for(i=0; i < newFiles.length; i++){
            if(newFiles[i].split('.').pop() == 'png'){
              goodFiles.push(newFiles[i]);
            }
          }

            sys.puts("Good files: " + sys.inspect(goodFiles));
          
          if(goodFiles.length > 0) {
              imageUrls = imageUrls.concat(goodFiles).unique();
              sys.puts("Sent files changed. Now: " + sys.inspect(imageUrls));
            imagesToRender = goodFiles;
            newFiles = [];
            renderImages();
          }
          
          console.log("imageUrls");
          sys.puts(sys.inspect(imageUrls));
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

