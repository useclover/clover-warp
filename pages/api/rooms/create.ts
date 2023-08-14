// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

type Data = {
  error: boolean;
  message: string;
  data?: {
    roomId: string;
  }
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  if (req.method == 'POST') {

    const { title, hostWallets, videoOnEntry } = req.body;

    (async () => {

        try {

            if (title) {

              const { data: response } = await axios.post(
                "https://api.huddle01.com/api/v1/create-room",
                {
                  title,
                  hostWallets: hostWallets || undefined,
                  videoOnEntry: videoOnEntry || false,
                },
                {
                  headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.HUDDLE_APPKEY as string,
                  },
                }
              );

            res.status(200).json({
                error: false,
                message: "Room created successfully",
                data: {
                    roomId: response.data.roomId,   
                },
            })

            } else {
              res.status(400).json({
                error: true,
                message: "Invalid request",
              });
            }

        }catch (err) {

            const error = err as any;

            res.status(400).json({
                error: true,
                message: error.message,
            });

        }

    })()
    
  }else{
    res.status(422).json({ error: true, message: "Invalid request" });
  }

}
