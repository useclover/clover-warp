// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from 'crypto';
import axios from "axios";
import Cryptr from "cryptr";

type Data = {
  message: string;
  error: boolean;
  result?: string,
  file?: any
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

    if (req.method == 'GET') {

      const { authorization: Authorization } = req.headers;

      const { id: fileid, hash, Did } = req.query;
      

      (async () => {

          try {

          const { data: { file, key: { key } } } = await axios.get(`/dao/${Did}/files/${fileid}`, {
            headers: {
              Authorization,
            },
            baseURL: process.env.NEXT_PUBLIC_APP_URL || "",
          });

          if (key) {

            const cid =
              typeof file.cid == "string" ? JSON.parse(file.cid) : file.cid;


            const cryptr = new Cryptr(hash as string);

            const decryptedKey = cryptr.decrypt(key as string);

            const { private: privateKey, public: publicKey } = JSON.parse(decryptedKey);

            const receiverPrivateKey = await crypto.subtle.importKey(
              "jwk",
              privateKey,
              {
                name: "ECDH",
                namedCurve: "P-256",
              },
              true,
              ["deriveKey", "deriveBits"]
            );

            const senderPublicKey = await crypto.subtle.importKey(
              "jwk",
              publicKey,
              {
                name: "ECDH",
                namedCurve: "P-256",
              },
              true,
              []
            );

            const deriveKey = await crypto.subtle.deriveKey(
              {
                name: "ECDH",
                public: senderPublicKey,
              },
              receiverPrivateKey,
              {
                name: "AES-GCM",
                length: 256,
              },
              true,
              ["encrypt", "decrypt"]
            );

            const encryptedMessage = Buffer.from(cid.message, "hex");

            const encryptedIv = Buffer.from(cid.iv, "hex");

            const decryptedData = await crypto.subtle.decrypt(
              {
                name: "AES-GCM",
                iv: encryptedIv,
              },
              deriveKey,
              encryptedMessage
            );

            const decryptedMessage = new Uint8Array(decryptedData);

            const decryptedText = new TextDecoder().decode(decryptedMessage);

            const response = await fetch(
              `https://${decryptedText}.ipfs.dweb.link/${file.oname}`
            );

            const blob = await response.blob();

            // const url = await toDataUrl(blob);
             
            const bitmp = await axios.get(
              `https://${decryptedText}.ipfs.dweb.link/${file.oname}`,
              { responseType: 'arraybuffer' }
            );

            const bmp = Buffer.from(bitmp.data, 'binary').toString('base64');


            res.status(200).json({
              message: 'Success', 
              result: bmp,
              file,
              error: false
            });

          } else {
              
              res.status(400).json({ message: "Try logging into DAO, to access file", error: false });
          }
          
      }catch (err) {

          const error = err as any

          console.log(error);

          res.status(error?.status || 400).json({
            message: error?.response?.data?.message || "Something went wrong, please try again",
            error: true
          });

      }

      })()

    }else {
        res.status(422).json({ message: "Method not supported", error: true });
    }

}
