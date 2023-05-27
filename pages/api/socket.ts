import { Server } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

const SocketHandler = (req: NextApiRequest, res: any) => {

  if (res.socket.server.io) {

    console.log("Socket is already running", 'ssz');

  } else {
  
    console.log("Socket is initializing", 'ss');

    const io = new Server(res.socket.server);

    res.socket.server.io = io;

    io.on("connection", (socket) => {
        
        socket.broadcast.emit('init', {"Author": "Joel", "Message": "Hello World"});

        console.log("Socket connected", socket.id, 'ss');
    
        socket.on("disconnect", () => {
            socket.broadcast.emit("user disconnected", socket.id);
            console.log("Socket disconnected", 'ss');
        });

        socket.on("send_message", (msg) => {

          socket.broadcast.emit("newIncomingMssage", msg);

          console.log("sendMessage", msg, "sxs");

        });

    
    });
    
  }
  
  res.end();

};

export default SocketHandler;
