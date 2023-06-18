import { NextApiRequest } from "next";
import { Server } from "socket.io";
import { SocketApiResponse } from "../../app/components/types";
import axios from "axios";

const SocketMessageHandler = (req: NextApiRequest, res: SocketApiResponse) => {
  const { authorization: Authorization } = req.headers;

  const { lq } = req.query;

  if (!Authorization || !lq) {
    res.status(400).json({ error: true, message: "Access Denied" });
    return;
  }

  if (!res?.socket?.server?.io?.[1]) {
    console.log("reached here");

    const io = new Server(res.socket.server);

    if (typeof res?.socket?.server?.io != "object") res.socket.server.io = [];

    res.socket.server.io[1] = io;

    io.on("connection", (socket) => {
      let gps: string;

      socket.on("join", (group: string) => {
        gps = `${lq}_${group}`;

        socket.join(gps);
      });

      console.log("Socket connected", socket.id);

      socket.on("send_message", async (updateNew) => {
        // console.log(updateNew, 'xxx')

        // await axios.post(`/dao/${lq}/chats`, updateNew, {
        //   headers: {
        //     Authorization,
        //   },
        //   baseURL: process.env.NEXT_PUBLIC_APP_URL || "",
        // });

        socket.to(gps).emit("new_incoming_message", updateNew);
      });

      socket.on("edit_message", async ({ id, update }) => {
        await axios.patch(
          `/dao/${lq}/chats/${id}`,
          { data: JSON.stringify(update) },
          {
            headers: { Authorization },
            baseURL: process.env.NEXT_PUBLIC_APP_URL || "" || "",
          }
        );

        console.log("elodd");

        socket.to(gps).emit("edit_msg", { id, update });
      });

      socket.on("delete_message_all", async (id) => {
        await axios.delete(`/dao/${lq[0]}/chats/${id}`, {
          headers: { Authorization },
          baseURL: process.env.NEXT_PUBLIC_APP_URL || "" || "",
        });

        socket.to(gps).emit("del_msg", id);

        console.log("delete message", id, "sxs");
      });

      socket.on("delete_message", async (id) => {
        await axios.patch(
          `/dao/${lq}/chats/${id}/delete`,
          {},
          {
            headers: { Authorization },
            baseURL: process.env.NEXT_PUBLIC_APP_URL || "" || "",
          }
        );

        socket.to(gps).emit("del_msg", id);

        console.log("delete message me", id, "sxs");
      });
    });
  } else {
    console.log("sss", "io");
  }

  res.end();
};

export default SocketMessageHandler;
