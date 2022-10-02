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
    let dat;
  io.on('connection', (socket) => {
    socket.broadcast.emit('new:user',++count);
    console.log('a user connected');
    
    socket.on("message:send", (data,room) => {
        dat = data;
        if(room==null)
            socket.broadcast.emit("message:receive", data);
        else
            socket.to(room).emit("message:receive", data);
    });
    socket.on("disconnect", () => {
        console.log("Disconnect");
        socket.broadcast.emit("message:Left",socket.id);
    })
    socket.on("join:room", (room) => {
        socket.join(room);
        
        // io.in(room).allSockets().then((data)=>{
        //     const myArr = Array.from(data)
        //     console.log(myArr);

        // });
    });
    socket.on("create:room", (room) => {
        socket.join(room);
    })

});


 app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
 })
http.listen(port, () => { console.log(`listening on *:${port}`) });
app.listen(5000, () => { console.log(`app listening at http://localhost:5000`) });