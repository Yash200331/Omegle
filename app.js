const express = require('express');
const app = express();
const indexRouter = require('./routes')
const path = require('path');

const http = require('http');
const server = http.createServer(app);
const socketIO = require('socket.io');const { log } = require('console');
;
const io = socketIO(server);


let waitingUsers = [];
let rooms = {};

io.on("connection", function(socket){
    socket.on("joinroom", function(room){
        if(waitingUsers.length > 0){
            let partner = waitingUsers.shift();
            const roomname = `${socket.id}-${partner.id}`;
            socket.join(roomname);
            partner.join(roomname);

            io.to(roomname).emit("joined",roomname);
        }else{
            waitingUsers.push(socket);
        }
    });
    
    socket.on("message",function(data){
       socket.broadcast.to(data.room).emit("message",data.message)
        
    })
    socket.on("disconnect", function(socket){
        let index = waitingUsers.findIndex((waitingUsers) => waitingUsers.id === socket.id);
        waitingUsers.splice(index,1);
    })
})



app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use('/', indexRouter);


server.listen(3000)