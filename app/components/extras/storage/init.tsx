import { store, dir, getFileList } from ".";
import * as PushAPI from "@pushprotocol/restapi";
import { ethers } from "ethers";
import axios from "axios";
export let lq: any;


export interface mess {
  [index: string]: {
    content: string;
    read: boolean;
    date?: number | string;
    sender: string;
    isSending: boolean;
  }[];
}

export const notifications = async ({
  title,
  message,
  receivers,
  exclude,
}: {
  title: string;
  message: string;
  receivers: string[];
  exclude: string;
}) => {
  const pk = process.env.NEXT_PUBLIC_MATIC_PRIVATE_KEY;

  const pkey = `0x${pk}`;

  const signer = new ethers.Wallet(pkey);

  const channel = `eip155:5:${process.env.NEXT_PUBLIC_PUBLIC_KEY}`;

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
    });

    return true;
  } catch (err) {
    console.log(err, "err");
  }
};

export const beginStorageProvider = async ({
  user,
  contract,
  randId,
  participants,
}: {
  user: string;
  contract: string;
  randId: any;
  participants: any;
}) => {
  lq = [randId, contract, participants, user];
};

export const retrieveMessages = async (indexx?: number) => {

  const token = `Bearer ${localStorage.getItem("clover-x")}`;

  const {
    data: { chatdata },
  } = await axios.get(`/dao/${lq[0]}/chats`, {
    params: { page: (indexx || 0) + 1 },
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
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
        isSending: false,
        messId: col.messId,
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

    })
  })

  return mess;

}

export const deleteMessagesAll = async (id: string) => {

  const token = `Bearer ${localStorage.getItem("clover-x")}`;

  await axios.patch(`/dao/${lq[0]}/chats/${id}/delete`, {}, {
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
    headers: { Authorization: token },
  });

  return true;
};

export const deleteMessages = async (id: string) => {

  const token = `Bearer ${localStorage.getItem("clover-x")}`;

  await axios.delete(`/dao/${lq[0]}/chats/${id}`, {
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
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
      baseURL: process.env.NEXT_PUBLIC_APP_URL,
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

export const retrieveFiles = async (folder?: string[]) => {

  const token = `Bearer ${localStorage.getItem("clover-x")}`;

  const {
    data: { files },
  } = await axios.get(`/dao/${lq[0]}/files`, {
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
    headers: { Authorization: token },
  });

  return files.main == undefined ? files : files.main;
};

export const getRooms = async () => {

  const token = `Bearer ${localStorage.getItem("clover-x")}`;

  const {
    data: { rooms },
  } = await axios.get(`/dao/${lq[0]}/rooms`, {
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
    headers: { Authorization: token },
  });

  return rooms;
};

export const roomData = async (id: number) => {

  const token = `Bearer ${localStorage.getItem("clover-x")}`;

  const {
    data: { room },
  } = await axios.get(`/dao/${lq[0]}/rooms/${id}`, {
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
    headers: { Authorization: token },
  });

  return room;
};

export const createRoom = async (name: string) => {


  const { data: response } = await axios.post(
    "https://iriko.testing.huddle01.com/api/v1/create-room",
    {
      title: name,
      hostWallets: [lq[3]],
    },
    {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_HUDDLE_APPKEY as string,
      },
    }
  );

  await axios.post(
    `/dao/${lq[0]}/rooms`,
    {
      name,
      creator: lq[3],
      meetId: response.data.roomId,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("clover-x")}`,
      },
    }
  );

  return `https://app.huddle01.com/${response.data.roomId}`;
};

/**
 * @param dirfolder: array - showing file directory till destination
 *
 * **/

export const storeFiles = async (file: store[], dirfolder: string[]) => {
  for (let i = 0; i < file.length; i++) {
    await axios.post(
      `/dao/${lq[0]}/files`,
      {
        name: file[i].name,
        type: file[i].type,
        size: file[i].size,
        dir: dirfolder,
        cid: file[i].cid,
        extension: file[i].extension,
        tag: file[i].tag,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("clover-x")}`,
        },
      }
    );
  }

  return file;
};
