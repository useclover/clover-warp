import { useEffect, useState, useRef } from 'react';
import * as PushAPI from "@pushprotocol/restapi";
import { ethers } from 'ethers';

const Xx = () => {

     const once = useRef<boolean>(true)

     const pk = process.env.MATIC_PRIVATE_KEY;

     const pkey = `0x${pk}`;

     const signer = new ethers.Wallet(pkey);

     const channel = `eip155:5:${process.env.PUBLIC_KEY}`;


     useEffect(() => {
        if(once.current){

            once.current = false;

            PushAPI.payloads
              .sendNotification({
                signer,
                type: 3,
                identityType: 2,
                notification: {
                  title: `New message from john doe`,
                  body: `dont give up`,
                },
                payload: {
                  title: `New message from john doe`,
                  body: `dont give up`,
                  cta: "",
                  img: "",
                },
                recipients:
                  "eip155:5:0xc07e4542B10D1a8a5261780a47CfE69F9fFc38A4",
                channel,
                env: "staging",
              })
              .then((exx) => {
                console.log(exx);
              })
              .catch((ee) => {
                console.log("rr" + ee);
              });
            

        }

     }, [])


   return (
     <div>
       
     </div>
   );
}

export default Xx;