import axios from 'axios';
import { lq } from '../storage/init';
import { contractAddress } from '../../../../pages';
import Cryptr from 'cryptr';

export interface mess {
  [index: string]: {
    content: string;
    read: boolean;
    date?: number | string;
    sender: string;
  }[];
}

export const decryptCache: { [index: string]: string } = {

}

export const encrypt = async (text: string, keys: string) => {

    const { private: privateKey, public: publicKey } = JSON.parse(keys);

    const receiverPublicKey = await window.crypto.subtle.importKey(
      "jwk",
      publicKey,
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      []
    );

    const senderPrivateKey = await window.crypto.subtle.importKey(
      "jwk",
      privateKey,
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      ["deriveKey", "deriveBits"]
    );

    const deriveKey = await window.crypto.subtle.deriveKey(
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
    );


    const encodedText = new TextEncoder().encode(text);
    const encodedIv = window.crypto.getRandomValues(new Uint8Array(12));

    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: encodedIv,
      },
      deriveKey,
      encodedText
    );

    const encryptedMessage = new Uint8Array(encryptedData);

    const encryptedHex = Buffer.from(encryptedMessage).toString("hex");

    const encryptedIv = Buffer.from(encodedIv).toString("hex");


    return { message: encryptedHex, iv: encryptedIv }; 

}


export const decrypt = async (encryptedText: { message: string, iv: string }, keys: string) => {

    if (decryptCache[Object.values(encryptedText).join('')] !== undefined) {
        return decryptCache[Object.values(encryptedText).join("")];
    }

    try {
    
    const { private: privateKey, public: publicKey } = JSON.parse(keys);

    const receiverPrivateKey = await window.crypto.subtle.importKey(
      "jwk",
      privateKey,
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      ["deriveKey", "deriveBits"]
    );

    const senderPublicKey = await window.crypto.subtle.importKey(
      "jwk",
      publicKey,
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      []
    );

    const deriveKey = await window.crypto.subtle.deriveKey(
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

    const encryptedMessage = Buffer.from(encryptedText.message, "hex");
    const encryptedIv = Buffer.from(encryptedText.iv, "hex");

    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: encryptedIv,
      },
      deriveKey,
      encryptedMessage
    );

    const decryptedMessage = new Uint8Array(decryptedData);

    const decryptedText = new TextDecoder().decode(decryptedMessage);

    decryptCache[Object.values(encryptedText).join("")] = decryptedText;

    return decryptedText;

  } catch(err) {
    // console.log(err, encryptedText, keys, 'dmc')
    return "...";
  }
    
}

// retrieve group chats from server
export const retrieveGroupChats = async (groups?: any) => {
  
  const groupChats: any = [];

  let gps = groups;

  if (gps === undefined) {
    const token = `Bearer ${localStorage.getItem("clover-x")}`;

    const {
      data: { groups },
    } = await axios.get(`/dao/${lq[0]}/group`, {
      headers: { Authorization: token },
    });

    gps = groups;
  }

  gps.forEach((val: any) => {
    const { groupname, chat, hash: eData } = val;

    let lastchat = undefined;

    if (chat.data !== undefined) {
      const { data, messId, sender, index, created_at: udate } = chat;

      const ddata = JSON.parse(data);

      const date = new Date(udate);

      lastchat = {
        ...ddata,
        messId,
        sender,
        index,
        date: date.getTime(),
      };
    }
    const { key: encryptedHash, init } = eData;

    const { contract, hash } = JSON.parse(
      localStorage.getItem("cloverlog") || '{"contract":""}'
    );


    let decryptedKeys;

    if( decryptCache[encryptedHash] !== undefined) {

        decryptedKeys = decryptCache[encryptedHash];

    }else{
      
        let key = init ? hash : contract;

        const enc = new Cryptr(key);

        decryptedKeys = enc.decrypt(encryptedHash);
    }

    groupChats.push({
      name: groupname,
      lastchat,
      groupKeys: decryptedKeys,
    });

  });

  return groupChats;
};

export const retrieveMessages = async (indexx?: number) => {
  
  const token = `Bearer ${localStorage.getItem("clover-x")}`;

  const {
    data: { chatdata },
  } = await axios.get(`/dao/${lq[0]}/chats`, {
    params: { page: (indexx || 0) + 1 },
    headers: { Authorization: token },
  });

  const messages: any = {};

  chatdata.data.forEach((col: any) => {
    if (messages[col.receiver] === undefined) {
      messages[col.receiver] = { messages: [] };
      messages[col.receiver]["messages"][indexx || 0] = [];
    }

    const months: string[] = [
      "January",
      "Febuary",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const dx = JSON.parse(col.data);

    const date = new Date(col.created_at);

    const today =
      new Date().getMonth() == date.getMonth() &&
      new Date().getDate() == date.getDate() &&
      new Date().getFullYear() == date.getFullYear();

    const yesterday =
      new Date().getMonth() == date.getMonth() &&
      new Date().getDate() - 1 == date.getDate() &&
      new Date().getFullYear() == date.getFullYear();

    const index = today
      ? "Today"
      : yesterday
      ? "Yesterday"
      : `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

    const deleted = (dx?.deleted || []).includes(lq[3]);

    if (!deleted)
      messages[col.receiver].messages[indexx || 0].push({
        ...dx,
        messId: col.messId,
        sender: col.sender,
        index,
        date: date.getTime(),
      });
  });

  return messages;
};

export const findMessId = (messBox: any[], id: string) => {
  let mess: any = {};

  messBox.forEach((v: any[], i: number) => {
    v.forEach((val: any) => {
      const { messId } = val;

      if (messId == id) {
        mess = val;
      }
    });
  });

  return mess;
};

export const deleteMessagesAll = async (id: string) => {
  const token = `Bearer ${localStorage.getItem("clover-x")}`;

  await axios.patch(
    `/dao/${lq[0]}/chats/${id}/delete`,
    {},
    {
      headers: { Authorization: token },
    }
  );

  return true;
};

export const deleteMessages = async (id: string) => {
  const token = `Bearer ${localStorage.getItem("clover-x")}`;

  await axios.delete(`/dao/${lq[0]}/chats/${id}`, {
    headers: { Authorization: token },
  });

  return true;
};

export const updateMessages = async (id: string, update: any) => {
  const token = `Bearer ${localStorage.getItem("clover-x")}`;

  await axios.patch(
    `/dao/${lq[0]}/chats/${id}`,
    { data: JSON.stringify(update) },
    {
      headers: { Authorization: token },
    }
  );

  return true;
};

export const saveMessages = async (updateNew: any) => {
  try {
    await axios.post(`/dao/${lq[0]}/chats`, updateNew, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("clover-x")}`,
      },
    });

    return true;
  } catch (err) {
    console.log(err);

    return false;

  }
};

export const createGroupChat = async (groupname: string, members?: (string | undefined)[]) => {
  const token = `Bearer ${localStorage.getItem("clover-x")}`;

  const keypair = await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey", "deriveBits"]
  );

  const publicKey = await window.crypto.subtle.exportKey(
    "jwk",
    keypair.publicKey
  );

  const privateKey = await window.crypto.subtle.exportKey(
    "jwk",
    keypair.privateKey
  );

  const { hash = "", contract = "" } = JSON.parse(
    localStorage.getItem("cloverlog") || '{"contract":""}'
  );
  const enc = new Cryptr(hash);

  const enc_init = new Cryptr(contract);

  const rawKeys = JSON.stringify({ public: publicKey, private: privateKey });

  const group_keys = enc.encrypt(rawKeys);

  const group_keys_init = enc_init.encrypt(rawKeys);

  const payload: any = {
     name: groupname, group_keys, group_keys_init 
  }

  if (members?.length) payload["members"] = JSON.stringify(members);
  
  const {
    data: { group },
  } = await axios.post(
    `/dao/${lq[0]}/group`,
    payload,
    {
      headers: {
        Authorization: token,
      },
    }
  );

  return group;

};