import { store, dir } from "../../types";
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

export const retrieveFile = async (fileid: string) => {

  const token = `Bearer ${localStorage.getItem("clover-x")}`;

      const {
        data: { file, key },
      } = await axios.get(`/dao/${lq[0]}/files/${fileid}`, {
        headers: { Authorization: token },
      });

      return { ...file, key };

}

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

export const createRoom = async (name: string, desc?: string) => {

  const { data: response } = await axios.post(
    "/api/rooms/create",
    {
      title: name,
      hostWallets: [lq[3]],
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      baseURL: window.origin
    },
  ); 

  const { data: { room } } = await axios.post(
    `/dao/${lq[0]}/rooms`,
    {
      name,
      creator: lq[3],
      desc: desc || "",
      meetId: response.data.roomId,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("clover-x")}`,
      },
    }
  );

  return `/dashboard/rooms/${room.id}`;

};

/**
 * @param dirfolder: array - showing file directory till destination
 *
 * **/

export const storeFiles = async (file: store[], dirfolder: string[]) => {

  for (let i = 0; i < file.length; i++) {
    
    const { name, type, size, cid, extension, tag } = file[i];

    await axios.post(
      `/dao/${lq[0]}/files`,
      {
        name,
        type,
        size,
        dir: dirfolder,
        cid,
        extension,
        tag,
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
