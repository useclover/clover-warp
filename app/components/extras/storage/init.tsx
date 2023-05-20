import { store, dir, getFileList } from ".";
import * as PushAPI from "@pushprotocol/restapi";
import { ethers } from "ethers";
import axios from "axios";
export let lq: any;

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


export const retrieveFiles = async (folder?: string[]) => {

  const token = `Bearer ${localStorage.getItem("clover-x")}`;

  const {
    data: { files },
  } = await axios.get(`/dao/${lq[0]}/files`, {
    headers: { Authorization: token },
  });

  return files.main == undefined ? files : files.main;
};

export const getRooms = async () => {

  const token = `Bearer ${localStorage.getItem("clover-x")}`;

  const {
    data: { rooms },
  } = await axios.get(`/dao/${lq[0]}/rooms`, {
    headers: { Authorization: token },
  });

  return rooms;
};

export const roomData = async (id: number) => {

  const token = `Bearer ${localStorage.getItem("clover-x")}`;

  const {
    data: { room },
  } = await axios.get(`/dao/${lq[0]}/rooms/${id}`, {
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
