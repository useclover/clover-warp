import Moralis from 'moralis';
import { store, dir, getFileList, updateSearch } from '.';

import { db } from "../../../firebase";
import { ref, update, get, set, child } from "firebase/database";

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

export const beginStorageProvider = async ({ contract, randId }: {
  contract: string, randId:string 
}) => {

    lq = [randId, contract];

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

    const query = child(ref(db), `chats/${lq[0]}${(folder || []).join('/')}`);

  const results = await get(query);

  if (results.exists()) {

    const fileData = results.val().files;

    return fileData;

  }

  return [];

}


/**
 * @param dirfolder: array - showing file directory till destination
 * **/

export const storeFiles = async (file: store[], dirfolder: string[]) => {
  
  const fileData = JSON.parse(lq.get("files"));
  

  updateSearch(fileData.files, file, dirfolder, false);

  lq.set('files', JSON.stringify(fileData));


  await lq.save();

  return fileData;
};