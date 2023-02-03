import { useEffect, useState, useRef } from 'react';
import * as PushAPI from "@pushprotocol/restapi";
import { ethers } from 'ethers';
import { HuddleIframe, IframeConfig } from "@huddle01/huddle01-iframe";

const Xx = () => {

     const once = useRef<boolean>(true)

     useEffect(() => {
        if(once.current){

            once.current = false;

        }

     }, [])

    
     const iframeConfig: IframeConfig = {
       roomUrl: "https://iframe.huddle01.com/123",
       height: "600px",
       width: "80%",
       noBorder: true, // false by default
     };


   return (
     <div>

       <HuddleIframe config={iframeConfig} />

     </div>
   );
}

export default Xx;