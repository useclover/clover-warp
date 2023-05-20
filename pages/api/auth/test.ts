// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  message: string;
  error: boolean;
  token?: string
  dao?: any 
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  
  if (req.method == 'POST') {

    const { name, email, address } = req.body;

    if (name && email && address) {

      (async () => {

        try{

        const { data } = await axios.post(
          "/testing/store",
          {
            name,
            email,
            address,
          },
          {
            baseURL: process.env.NEXT_PUBLIC_APP_URL || "",
            headers: {
              "X-App-Key": process.env.APP_KEY || "",
            },
          }
        );

        res.status(201).json({
          message: "Success",
          dao: data.dao,
          error: false,
          token: data.token
        })

      }catch(err){

          const error = err as any;

          res.status(error?.status || 400).json({
            error: true,
            message: error?.response?.data?.message || "Something went wrong, please try again"
          })

      }

      })()

    }else{
      res.status(400).json({
        message: "Missing required fields",
        error: true,
      })
    }

  }else{
      res.status(422).json({
          message: "Method not supported",
          error: true,
      });
  }

}
