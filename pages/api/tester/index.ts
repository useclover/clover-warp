// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

type Data = {
  message: string;
  error: boolean;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  if (req.method === "POST") {

    const { name, email, address } = req.body;

    (async () => {
      
      try {

        await axios.post(
          "/tester/create",
          { name, email, address },
          {
            baseURL: process.env.NEXT_PUBLIC_APP_URL || "",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        res.status(201).json({ message: "success", error: false });

      } catch (err) {
        const error = err as any;

        res
          .status(error?.status || 400)
          .json({
            message: error?.response?.data.message || error?.message,
            error: true,
          });
      }
    })();
  } else {
    res.status(422).json({ message: "Invalid request method", error: true });
  }
}
