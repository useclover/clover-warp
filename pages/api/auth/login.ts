import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { ethers } from "ethers";
import { balanceABI } from "../../../app/components/extras/abi";
import Cryptr from "cryptr";
import crypto from 'crypto';

type Data = {
  message: string;
  error: boolean;
  daos?: any[];
  user?: any;
  multiple?: boolean;
  token?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method == "POST") {

    (async () => {
      const { address, contractAddress, hash } = req.body;

      const validateAddress = ethers.utils.verifyMessage(
        "UseClover Signature Request \n\nSign To Continue \n",
        hash
      );

      try {

        if (validateAddress == address) {
   

          const { data: { daos } } = await axios.get("/daos", {
            baseURL: process.env.NEXT_PUBLIC_APP_URL || "",
            headers: { "X-App-Key": process.env.APP_KEY || "" },
          });

        
          const provider = new ethers.providers.JsonRpcProvider(
            "https://api.hyperspace.node.glif.io/rpc/v1"
          );

          const dao = daos.filter((a: any) => a.contract);

          const sdao = [];

          if (dao.length) {

            const checked: string[] = [];

            for (let i = 0; i < dao.length; i++) {

              if (ethers.utils.getAddress(dao[i].contract) == contractAddress) {

                const { joined, metadata } = dao[i];

                const rJoined = JSON.parse(joined);

                [ ...rJoined, metadata ].forEach((val: string) => {
                  const address1 = ethers.utils.getAddress(val);

                  const address2 = ethers.utils.getAddress(address);

                  if (address1 == address2) {
                    sdao.push({ ...dao[i] });
                  }
                });

              } else {

                if (checked.indexOf(dao[i].contract) != -1) {
                  continue;
                } else {
                  checked.push(dao[i].contract);
                }

                let balance: any = 0;

                try {

                  const token = new ethers.Contract(
                    dao[i].contract,
                    balanceABI,
                    provider
                  );

                  balance = ethers.utils.formatEther(
                    await token.balanceOf(address)
                  );

                } catch (err) {
                  const error = err as Error;
                  console.log(error);
                }

                if (Number(balance) > 0) {
                  sdao.push({ ...dao[i] });
                }

              }
            }
          }

          

          const {
            data: { token = false, user },
          } = await axios.post(
            "/login",
            {
              address
            },
            {
              baseURL: process.env.NEXT_PUBLIC_APP_URL || '', 
              headers: { "X-App-Key": process.env.APP_KEY || "" },
            }
          );

          if (sdao.length && Boolean(token)) {
            let keys: { [index: string]: any } = {
              private: user.private,
              public: user.public,
            };

            const payload: {
              public?: string;
              private?: string;
            } = {

            }

            if (!Boolean(user.private) && !Boolean(user.public)) {

              // creating the users e2ee keys

              const enc = new Cryptr(hash);

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

              keys = {
                private: privateKey,
                public: publicKey,
              };

              const encPrivate = enc.encrypt(JSON.stringify(privateKey));

              const encPublic = enc.encrypt(JSON.stringify(publicKey));

              payload['public'] = encPublic;
              payload['private'] = encPrivate;

            }

            // initializing user group keys
            const gps = typeof user.groups == 'string' ? JSON.parse(user.groups) : user.groups;

            const gpsChange: any = {};

            sdao.forEach((dos: any) => {
                if (gps[dos.id] != undefined) {

                    const { init, key } = gps[dos.id];

                    if (!init) {
                      
                      try {

                      const encg = new Cryptr(dos.contract);

                      const encg_new = new Cryptr(hash);

                      const decryptedKeys = encg.decrypt(key);
                      
                      gpsChange[dos.id] = {
                        init: true,
                        key: encg_new.encrypt(decryptedKeys)
                      };

                    }catch (err) {
                        console.log(err);
                    }

                    }
                }
            })

               await axios.patch(
                 "/update/keys",
                 {
                   ...payload,
                   groups: JSON.stringify(gpsChange)
                 },
                 {
                   baseURL: process.env.NEXT_PUBLIC_APP_URL || "",
                   headers: { Authorization: `Bearer ${token}` },
                 }
               );

            if (sdao.length > 1) {
              res.status(200).json({
                message: "Daos found",
                error: false,
                token,
                user: { ...user, ...keys },
                daos: sdao,
                multiple: true,
              });
            } else {
              res.status(200).json({
                message: "Daos found",
                error: false,
                token,
                user: { ...user, ...keys },
                daos: sdao[0],
                multiple: false,
              });
            }
          } else {
            res.status(404).json({ error: true, message: "No daos found" });
          }
        } else {
          res.status(400).json({ error: true, message: "Invalid hash" });
        }

      } catch (err) {

        const error = err as any;

        console.log(error);

        res
          .status(error?.status || 400)
          .json({
            error: true,
            message:
              error?.response?.data.message ||
              "Something went wrong, please try again",
          });
      }
    })();
  } else {
    res.status(422).json({
      message: "Method not supported",
      error: true,
    });
  }
}
