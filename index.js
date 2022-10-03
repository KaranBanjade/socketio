const express = require('express');
const app = express();
const http = require('http').Server(app);
const port = 3000;
const { Server } = require("socket.io");
const io = new Server(http,
    {
        cors: {
            origin: "*" 
        }   
    });
let count = -1;
  io.on('connection', (socket) => {
    socket.broadcast.emit('new:user',++count);
    console.log('a user connected');
    
    socket.on("data:send", (data,room) => {

        if(room==null)
            socket.broadcast.emit("data:receive", data);
        else
            socket.to(room).emit("data:receive", data);
    });
    socket.on("disconnect", () => {
        console.log("Disconnect");
        socket.broadcast.emit("message:Left",socket.id);
    })
    socket.on("join:room", (room) => {
        socket.join(room);
        socket.to(room).emit("message:receive", "New User Joined");
    });
    socket.on('get:user',(room)=>{
        let myArr;
        let count;
        io.in(room).allSockets()
        .then((data)=>{
                myArr = Array.from(data)
                console.log(myArr)
            })
        .then(()=>{
            count = myArr.length;
            socket.to(room).emit("got:user", count,myArr);
        })
    })

});


 app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
 })
http.listen(port, () => { console.log(`listening on *:${port}`) });
app.listen(5000, () => { console.log(`app listening at http://localhost:5000`) });