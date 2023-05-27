import type { NextApiRequest, NextApiResponse } from 'next'
import { Server } from 'socket.io'
import axios from 'axios'
import { SocketApiResponse } from '../../app/components/types';

const SocketHandler = (req: NextApiRequest, res: SocketApiResponse) => {
  const { authorization: Authorization } = req.headers;

  const { lq } = req.query;

  if (!Authorization || !lq) {
    res.status(400).json({ error: true, message: "Access Denied" });
    return;
  }

  if (!res?.socket?.server?.io) {
    const io = new Server(res.socket.server);

    console.log("reached here", "");

    if (typeof res?.socket?.server?.io != "object") res.socket.server.io = [];

    res.socket.server.io[0] = io;

    io.on("connection", async (socket) => {
      socket.join(lq);

      const update = async () => {
        try {
          const {
            data: { groups },
          } = await axios.get(`/dao/${lq}/group`, {
            headers: {
              Authorization,
            },
            baseURL: process.env.NEXT_PUBLIC_APP_URL || "",
          });

          return groups;

        } catch (err) {
          const error = err as any;

          return error.response.data;
        }
      };

      socket.on("add_group", () => {

        socket.to(lq).emit("add_grp", async () => await update());
      });

      
    });
  }

  res.end();
};

export default SocketHandler;