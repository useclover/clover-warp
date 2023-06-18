import { NextApiRequest } from "next";
import { SocketApiResponse } from "../../../app/components/types";
import axios from "axios";
import { Server } from "socket.io";

const SocketHandler = (req: NextApiRequest, res: SocketApiResponse) => {
  const { authorization: Authorization } = req.headers;

  const { lq } = req.query;

  if (req.body == "GET") {

    if (!Authorization || !lq) {
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
            socket.join(lq);

            socket.on('update', async (data) => {

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
