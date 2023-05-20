// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
const Cryptr = require("cryptr");

type Data = {
  error: boolean;
  message: string;
  result?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  
  if (req.method == "POST") {

    const { Authorization } = req.headers;

    const { text, action } = req.body;

    (async () => {
      try {
        const {
          data: { key },
        } = await axios.get("/e2ee/key", {
          baseURL: process.env.NEXT_PUBLIC_APP_URL || "",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization,
          },
        });

        const enc = new Cryptr(key);

        let result = "";

        if (action == "encrypt") {
          result = enc.encrypt(text);
        } else if (action == "decrypt") {
          result = enc.decrypt(text);
        }

        res
          .status(200)
          .json({ message: "successful", error: false, result });

      } catch (err) {
        const error = err as any;

        res
          .status(400)
          .json({
            message:
              error?.response?.data?.message ||
              "Something went wrong, please try again",
            error: true,
          });
      }
    })();
  } else {
    res.status(422).json({ message: "method not supported", error: true });
  }
}
