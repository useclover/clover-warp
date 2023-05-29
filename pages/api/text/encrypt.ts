// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import Cryptr from "cryptr";
import { TextAPIData } from "../../../app/components/types";


export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<TextAPIData>
) {
  
    if ( req.method == 'GET' ) {

        const { text, key } = req.query;

        if ( !text || !key ) {

            res.status(400).json({
                message: "Missing required fields",
                error: true,
            });

            return;

        }

        const cryptr = new Cryptr(key as string);

        const encrypted = cryptr.encrypt(text as string);

        res.status(200).json({
            message: "Success",
            result: encrypted,
            error: false,
        });

    }else{

        res.status(422).json({
            message: "Method not supported",
            error: true,
        });

    }

}
