import type { NextApiRequest, NextApiResponse } from "next";
import { Server } from "socket.io";
import axios from "axios";
import { SocketApiResponse } from "../../app/components/types";

const SocketHandler = (req: NextApiRequest, res: SocketApiResponse) => {

  const { authorization: Authorization } = req.headers;

  const { lq } = req.query;

  if (!Authorization || !lq) {
    res.status(400).json({ error: true, message: "Access Denied" });
    return;
  }

  if (!res?.socket?.server?.io) {
    const io = new Server(res.socket.server);

    if (typeof res?.socket?.server?.io != "object") res.socket.server.io = [];

    res.socket.server.io[0] = io;

    io.on("connection", async (socket) => {
        
    socket.join(lq);


    socket.on("add_file", () => {
        socket.to(lq).emit("add_fle", true);
    });



    });
  }

  res.end();
};

export default SocketHandler;
