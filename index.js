const express = require('express');
const cors = require('cors');
const {Server} = require("socket.io");
const app = express();

app.use(cors({
    origin: 'http://localhost:3000'
 
}));

// app.use(cors({}));
app.use(express.json());
const server = app.listen(3001,()=>console.log("Server Started"));
const io = new Server(server,{
    cors:{origin:"http://localhost:3000"}
});
// const io = new Server(server,{
    
// });
global.onlineUsers = new Map();

io.on("connection",(socket)=>{
    var socketId = socket.id;
    socket.on("error", (error) => {console.error("Socket error:", error);});
    global.chatSocket = socket;  
    console.log("A new user has connected ",socket.id);
    socket.on("adduser",(userid)=>{
        onlineUsers.set(userid,socket.id);
        console.log(onlineUsers);
        socket.broadcast.emit("getOnlineusers",Array.from(onlineUsers.keys()));
    })
    socket.on("dis", () => {
        onlineUsers.forEach((value, key) => {
            if (value === socketId) {
                onlineUsers.delete(key);
                console.log("The id ", key, " was found and has been removed from the connection");
                console.log(onlineUsers);
                socket.broadcast.emit("getOnlineusers",Array.from(onlineUsers.keys()));
            } else {console.log("no socket id could be found");}
        });
    })

    socket.on('send-changes',(data,senderId,roomId)=>{
        console.log("The room id is",roomId)
        const room = io.sockets.adapter.rooms.get(roomId);
        console.log("The room is",room);
        // const myArray = Array.from(room);
        if(room){
            const arr = Array.from(room);
           
            const newArr = [];
            arr.map((member)=>{
                if(member != onlineUsers.get(senderId)) {
                    newArr.push(member);
                }
            })
            newArr.map((entry)=> {
                io.to(entry).emit('receive-changes', data, roomId);
                console.log("emitting to",entry);

            })
            console.log("done emitting")
            

        }
        else {
            console.log("empty");
        }
       

       
        
     
    })

    socket.on('join-room',(roomId,userId)=>{
        socket.join(roomId)
        console.log("someone ",socket.id,"join the room ",roomId)
        const room = io.sockets.adapter.rooms.get(roomId);
        console.log("The room looks like",room);
        console.log("all users look like",onlineUsers)
   
    })
    socket.on('leave-room',(roomId)=>{
        socket.leave(roomId)
        console.log("someone ",socket.id,"left the room ",roomId)
        const room = io.sockets.adapter.rooms.get(roomId);
        console.log("The room looks like",room);
        console.log("all users look like",onlineUsers)
        
    })
   

})

