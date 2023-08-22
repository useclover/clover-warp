import { NextApiRequest } from "next";
import { SocketApiResponse } from "../../../app/components/types";
import axios from "axios";
import { Server } from "socket.io";

const SocketHandler = (req: NextApiRequest, res: SocketApiResponse) => {
  const { authorization: Authorization } = req.headers;

  const { id } = req.query;

  if (req.method == "GET") {

    if (!Authorization || !id) {
        res.status(400).json({
            error: true,
            message: "Something went wrong, please try again"
        })
        
        return;
    }

    if (!res?.socket?.server?.io?.[2]) {

        const io = new Server(res.socket.server);

        if (typeof res?.socket?.server?.io != "object")
          res.socket.server.io = [];

        res.socket.server.io[2] = io;

        io.on('connection', (socket) => {

            socket.join(id);

            socket.on('broadcast', async ({ user, message, name }) => {
              socket.to(id).emit("receive", { user, message, name })
            });
            
        });

    }

    res.end();

  } else {
    res.status(422).json({
      error: true,
      message: "Method not supported",
    });
  }
};

export default SocketHandler;
