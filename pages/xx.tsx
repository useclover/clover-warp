import { useEffect, useState, useRef } from 'react';
import { db } from '../app/firebase/index';
import { onValue, ref, update, get, remove, set, child } from "firebase/database";

const Xx = () => {

     const query = (path: string) => ref(db, path);

     const once = useRef<boolean>(true)

     useEffect(() => {
        if(once.current){

            once.current = false;

            // set(query("DAOs"), ["0x256a54068a49635aa9ab565bf689ffc0d27a8","ww"]).catch((err) => {
            //   console.log(err);
            // });

            // update(ref(db, "DAOs/0"), {
            //     joined: 1,
            // })
            //   .then((data) => {})
            //   .catch((err) => {
            //     console.log(err);
            //   });


        }

     }, [])


   return (
     <div>
       
     </div>
   );
}

export default Xx;