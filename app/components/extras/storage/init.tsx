import { store, dir, getFileList, updateSearch } from '.';
import * as PushAPI from "@pushprotocol/restapi";
import { db } from "../../../firebase";
import { ref, update, get, set, child } from "firebase/database";
import { ethers } from 'ethers';

export let lq:any;

export interface mess {
  [index: string]: {
    content: string;
    read: boolean;
    date?: number | string;
    sender: string;
    isSending: boolean;
  }[];
}

export const notifications = async ({ title, message, receivers, exclude }: { title: string, message: string, receivers: string[], exclude: string }) => {

   const pk = process.env.MATIC_PRIVATE_KEY;

   const pkey = `0x${pk}`;

   const signer = new ethers.Wallet(pkey);

   const channel = `eip155:5:${process.env.PUBLIC_KEY}`;

   try {
    
    receivers.forEach(async (val: string) => {

      if (val.toLowerCase() == exclude.toLowerCase()) {

        return;
      }

      const receiver = `eip155:5:${val}`;

      await PushAPI.payloads.sendNotification({
        signer,
        type: 3,
        identityType: 2,
        notification: {
          title,
          body: message,
        },
        payload: {
          title,
          body: message,
          cta: "",
          img: "",
        },
        recipients: receiver,
        channel,
        env: "staging",
      });

    })

      return true;

    }catch (err) {
        console.log(err)
    }
}

export const beginStorageProvider = async ({
  user,
  contract,
  randId,
  participants,
}: {
  user: string;
  contract: string;
  randId: string;
  participants: any;
}) => {
  lq = [randId, contract, participants, user];
};

export const retrieveMessages = async () => {

  const query = child(ref(db), `chats/${lq[0]}`);

  const results = await get(query);

  if (results.exists()) {

    return results.val();

  }

  return {};

}

export const updateMessages = (prev: string) => {

  const mess = lq.get();
}

export const saveMessages = async (updateNew: any) => {

  try{

    await update(ref(db, `chats/${lq[0]}`), updateNew);


    return true;

  }catch(err) {

    console.log(err)

    return false;

  }
};

export const retrieveFiles = async (folder?: string[]) => {

    const query = child(
      ref(db),
      `files/${lq[0]}${folder ? "/" : ""}${(folder || []).join("/")}`
    );

  const results = await get(query);

  if (results.exists()) {

    const fileData = results.val();

    return fileData;

  }

  return [];

}


/**
 * @param dirfolder: array - showing file directory till destination
 * **/

export const storeFiles = async (file: store[], dirfolder: string[]) => {
  
    const query = child(ref(db), `files/${lq[0]}${dirfolder ? "/" : ""}${(dirfolder || []).join("/")}`);

    const results = await get(query);

    if(results.exists()){

      const fileData = results.val();


      await set(
        ref(
          db,
          `files/${lq[0]}${dirfolder ? "/" : ""}${(dirfolder || []).join("/")}`
        ),
        [...fileData, ...file]
      );

      return [...fileData, ...file];

    }


     await set(
       ref(db, `files/${lq[0]}${dirfolder ? "/" : ""}${(dirfolder || []).join("/")}`),
       file
     );


  
    return file;

};

