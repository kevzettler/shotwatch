$(document).ready(function(){
    var socket = new io.Socket(null, {port: 8080});
    socket.connect();

    // What to do when we first connect to a server
    function connectHandler(obj){
        console.log("Connected: ", obj);
    }

    // What to do when we receive a message from the server
    function messageHandler(obj){
        console.log("Received: ", obj);
    }

    // What to do when we receive a message from the server
    function disconnectHandler(obj){
        console.log("Disconnected: ", obj);
    }

    // Send a json object to the server [not used currently]
    function send(obj){
        console.log("Sending: ", obj);
        socket.send(JSON.stringify(obj));
    }

    socket.on('connect', connectHandler);
    socket.on('message', messageHandler);
    socket.on('disconnect', disconnectHandler);
});
