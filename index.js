const express = require('express');
const app = express(); 
const http = require('http').Server(app);
const port = 3000;
const { Server } = require("socket.io");
const io = new Server(http,{
    cors: {
        origin: "*" 
    }   
});
let gameStarted = false;

io.on('connection', (socket) => {
    console.log('a user connected');

    //considering for 2 player, when the count is 2, start the game
    socket.on('is:ready',(room)=>{
        if(players.length==2)
            socket.in(room).emit('game:ready', true);
        else
            socket.in(room).emit('game:ready', false);
    });
    
    // Give the turns to the players
    socket.on(`turn:get`,(room)=>{
        if(!gameStarted){
                gameStarted = true;
                socket.to(players[0]).emit(`turn:receive`,true);
        } else {
            if(socket.id==players[0])
                socket.to(players[1]).emit(`turn:receive`,true);
            else
                socket.to(players[0]).emit(`turn:receive`,true);
        }
    });

    socket.on("create:room", (room) => {
        // Empty Data Model
        let datamodel = {
            "player1": {
                "position" : 0
            }
        }
        socket.join(room);
        console.log("room created");
        io.in(room).emit('room:created',"empty");
    });

    //Join a specific room
    socket.on("join:room", (room) => {
        if(players.includes(socket.id))
            socket.to(socket.id).emit("message:receive", "Already in a game");
        else if(players.length==2)
            socket.to(socket.id).emit("message:receive", "Game Full");
        else if(players.length<2 && !players.includes(socket.id)){
            players.push(socket.id);
            socket.join(room);
            if(players.length==2)
                socket.in(room).emit("message:receive", `${socket.id} Joined, Game Begins`);
        }
    });

    // Get all users in a room
    socket.on('get:user',async(room,callbackfunction)=>{
        let myArr;
        let count;
        const data = await io.in(room).allSockets()
        myArr = Array.from(data)
        count = myArr.length;
        callbackfunction(myArr,count);
    })

    // Send the data between the users
    socket.on("data:send", (data,room) => {
        if(room==null)
            socket.to(socket.id).emit("data:receive", data);
        else
            socket.in(room).emit("data:receive", data);
    });

    // In case user disconencts
    socket.on('user:disconnect', (room) => {
        console.log("Disconnect");
        // players.remove(socket.id);
        // console.log("Players",players);
        socket.in(room).emit("message:left",socket.id);
    });

    // when one wins the game
    socket.on("game:over",(room)=>{
        gameStarted = false;
        if(socket.id==players[0])
            socket.to(players[1]).emit(`game:loose`);
        else
            socket.to(players[0]).emit(`game:loose`);
    });

    socket.on("update",(room)=>{
        // test.push(socket.id);
        console.log(test);
        socket.in(room).emit("update:recieve",test.toString());
    });

    socket.on("disconnecting",()=>{
        socket.to(Array.from(socket.rooms)[1]).emit("message:left",socket.id);
    });

    socket.on("disconnect",()=>{
        console.log("dis");
        players = players.filter(item => item !== socket.id);
    });
    socket.on("test", (room)=>{
        // socket.emit("message:left", room);
        // to send to everyone in room
        io.in(room).emit("message:left", room);
    });

});


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
http.listen(port, () => { console.log(`listening on *:${port}`) });
app.listen(5000, () => { console.log(`app listening at http://localhost:5000`) });