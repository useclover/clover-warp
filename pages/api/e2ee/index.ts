// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
const Cryptr = require("cryptr");

type Data = {
  error: boolean;
  message: string;
  result?: string[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  
  if (req.method == "POST") {


    const { authorization } = req.headers;

    const { text: stext, action } = req.body;

    const text = JSON.parse(stext);

    if (typeof text !== 'object') {
      return res.status(400).json({ message: "text is required", error: true });
    }

    if (action != 'encrypt' && action != 'decrypt') {
      return res.status(400).json({ message: "action is required", error: true });
    }


    (async () => {
      try {

        const {
          data: { key },
        } = await axios.get("/e2ee/key", {
          baseURL: process.env.NEXT_PUBLIC_APP_URL || "",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: authorization || "",
            "X-App-Key": process.env.APP_KEY || ""
          },
        });

        const enc = new Cryptr(key);

        let result: string[] = [];

        text.forEach((mt: string) => {
             if (action == "encrypt") {
               result.push(enc.encrypt(mt));
             } else if (action == "decrypt") {
               result.push(enc.decrypt(mt));
             }
        })

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
