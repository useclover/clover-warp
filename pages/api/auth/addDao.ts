import type { NextApiRequest, NextApiResponse } from "next";
import * as ethers from 'ethers';
import Cryptr from "cryptr";
import axios from "axios";
import crypto from 'crypto';


type Data = {
  message: string;
  token?: string;
  data?: any;
  error: boolean
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  
    if (req.method == 'POST') {

      const { hash, metadata, contract, joined, name, desc, defCon } = req.body;

      const validateAddress = ethers.utils.verifyMessage(
        "UseClover Signature Request \n\nSign To Continue \n",
        hash
      );

      (async () => {

        try {

          if (validateAddress != metadata) {
            throw {
              status: 400,
              response: {
                data: {
                  message: "Invalid address",
                },
              },
            };
          }

          if (!name || desc.length > 300) {
            throw {
              status: 400,
              response: {
                data: {
                  message: "Invalid name or description",
                },
              },
            };
          }

          const keypair = await crypto.subtle.generateKey(
            {
              name: "ECDH",
              namedCurve: "P-256",
            },
            true,
            ["deriveKey", "deriveBits"]
          );

          const publicKey = await crypto.subtle.exportKey(
            "jwk",
            keypair.publicKey
          );

          const privateKey = await crypto.subtle.exportKey(
            "jwk",
            keypair.privateKey
          );

          const cryptr = new Cryptr(contract);

          const crytr_def = new Cryptr(hash);


          const group_keys_init = cryptr.encrypt(
            JSON.stringify({ public: publicKey, private: privateKey })
          );

          const group_keys = crytr_def.encrypt(
            JSON.stringify({ public: publicKey, private: privateKey })
          );

          const payload: any = {
            contract,
            joined,
            desc: desc || "",
            name,
            metadata,
            group_keys_init,
            group_keys,
            defCon,
          };

          const { data: {
            token, 
            data
          }} = await axios.post('/daos/store', payload, {
            baseURL: process.env.NEXT_PUBLIC_APP_URL || "",
            headers: {
              "X-App-Key": process.env.APP_KEY || "",
            },
          });

          res.status(200).json({
            message: "Successful",
            token,
            data,
            error: false
          })

        }catch (err) {

            const error = err as any;

            console.log(error)

            res.status(error?.status || 400).json({
              error: true,
              message: error?.response?.data?.message || "Something went wrong",
            })

        }

      })()

    }else{
         res.status(422).json({
           message: "Method not supported",
           error: true,
         });
    }

}
