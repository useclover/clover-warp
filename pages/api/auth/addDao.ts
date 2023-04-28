import type { NextApiRequest, NextApiResponse } from "next";
import * as ethers from 'ethers';
import { db } from '../../../app/firebase';
import { ref, get, set, child } from "firebase/database";
import { balanceABI } from "../../../app/components/extras/abi";
import axios from "axios";


type Data = {
  message: string;
  daos?: any[];
  error: boolean
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {


    if (req.method == 'GET') {

      (async () => {

        const { data: { daos } } = await axios.get("/daos", {
          headers: { "X-App-Key": process.env.NEXT_PUBLIC_APP_KEY || "" },
        });

        res.status(200).json({
            message: 'success',
            error: false,
            daos
        });

      })()

    }else{
         res.status(422).json({
           message: "Method not supported",
           error: true,
         });
    }


}
