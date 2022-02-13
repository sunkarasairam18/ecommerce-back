const express = require('express');
const { createServer } = require('http');
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer,{
    cors:{
        origin: "http://localhost:3001"
    }
});

io.on('connection',(socket) => {
    console.log("New User Connected ",socket.id);
    socket.on('example_message', function(msg){
        console.log('message: ' + msg);
    });

    socket.on('disconnect',()=>{
        console.log("User Disconnected ",socket.id);
    });
});

exports.app = app;
exports.httpServer = httpServer;
exports.io = io;