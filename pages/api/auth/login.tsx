import type { NextApiRequest, NextApiResponse } from "next";
import { db } from '../../../app/firebase';
import { ref, update, get, set, child } from "firebase/database";

type Data = {
  message: string;
  error: boolean;
};


export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  
    if (req.method == 'POST') {

        const { id, list } = req.body;

        if(id !== undefined && list !== undefined) {

            const query = ref(db, `DAOs/${id}/joined`);

            update(query, list).then((results: any) => {

                res.status(201).json({
                    message: "Successful",
                    error: false
                })

            }).catch((err) => {

                console.log(err);

                res.status(400).json({
                    error: true,
                    message: "Something went wrong, please try again"
                });

            });

        }

    }else{
         res.status(422).json({
           message: "Method not supported",
           error: true,
         });
    }

}
