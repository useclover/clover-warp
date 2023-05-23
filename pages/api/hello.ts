// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto';
import fs from 'fs';
import cryptr from 'cryptr';
import axios from 'axios';

type Data = {
  name: string
  iv?: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {


  (async () => {

 
    const keypair = await crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      ["deriveKey", "deriveBits"]
    );

    const publicKey = await crypto.subtle.exportKey("jwk", keypair.publicKey);

    const privateKey = await crypto.subtle.exportKey("jwk", keypair.privateKey);


    const keysSender = JSON.parse('{"publicKey":{"key_ops":[],"ext":true,"kty":"EC","x":"16LWAkraDChgiZOJ_aloetG0klEvIazi8PY_ZdNKY6Y","y":"vYb1YblCdLF97fGJu9AEqNvCT_5gNVma4uWC_HTJTGk","crv":"P-256"},"privateKey":{"key_ops":["deriveKey","deriveBits"],"ext":true,"kty":"EC","x":"16LWAkraDChgiZOJ_aloetG0klEvIazi8PY_ZdNKY6Y","y":"vYb1YblCdLF97fGJu9AEqNvCT_5gNVma4uWC_HTJTGk","crv":"P-256","d":"h2IO9ZGn1oiKf2jpQRJUWlzH3-q6zmcZHE4a3r1Pyjc"}}');

    const keysReceiver = JSON.parse(
      '{"privateKey":{"key_ops":["deriveKey","deriveBits"],"ext":true,"kty":"EC","x":"bj3WbuYsdnZKqRl8Rj42xkwmKS277UZiEhd8wKz4O0A","y":"8kURbak6XDSAt5bb6o4fbjeaC0-raZZ9IwCVRpjM-vk","crv":"P-256","d":"qTjdlVqNA03KkSLypYDfH-k96gRDz0F6O5AA4zzbK0Q"},"publicKey":{"key_ops":[],"ext":true,"kty":"EC","x":"bj3WbuYsdnZKqRl8Rj42xkwmKS277UZiEhd8wKz4O0A","y":"8kURbak6XDSAt5bb6o4fbjeaC0-raZZ9IwCVRpjM-vk","crv":"P-256"}}'
    );

    const { privateKey: privateKeySender, publicKey: publicKeySender } = keysSender;

    const { privateKey: privateKeyReceiver, publicKey: publicKeyReceiver } = keysReceiver;


    const receiverPublicKey = await crypto.subtle.importKey(
      "jwk",
      publicKeySender,
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      []
    );

    const senderPrivateKey = await crypto.subtle.importKey(
      "jwk",
      privateKeySender,
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      ["deriveKey", "deriveBits"]
    )

    const deriveKey = await crypto.subtle.deriveKey(
      {
        name: "ECDH",  
        public: receiverPublicKey, 
      },
      senderPrivateKey,
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"] 
    )
    

    const message = "Hello world";

    const encodedText = new TextEncoder().encode(message);
    const encodedIv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: encodedIv,
      },
      deriveKey,
      encodedText
    );

    const encryptedMessage = new Uint8Array(encryptedData);

    const encryptedHex = Buffer.from(encryptedMessage).toString('hex');

    const encryptedIv = Buffer.from(encodedIv).toString('hex');
    

    // hex to uit8array

    const encryptedMessageHex = Buffer.from(encryptedHex, 'hex');
    const encryptedIvHex = Buffer.from(encryptedIv, 'hex');

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: encryptedIvHex,
      },
      deriveKey,
      encryptedMessageHex
    );

    const decryptedMessage = new TextDecoder().decode(decryptedData);

    console.log(decryptedMessage);


    res.status(200).json({ name: encryptedHex, 'iv': encryptedIv});

  })();

}
 