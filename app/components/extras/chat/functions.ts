import axios from 'axios';
import { lq } from '../storage/init';

export interface mess {
  [index: string]: {
    content: string;
    read: boolean;
    date?: number | string;
    sender: string;
  }[];
}

export const encrypt = async (text: string) => {

    const Authorization = 'Bearer ' + localStorage.getItem('clover-x');

    try {

    const { data: { result } } = await axios.post('/e2ee', {
        text, action: 'encrypt'
    }, {
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization
        },
        baseURL: window.origin
    })

    return result;

    } catch (err) {
        console.log(err);

        return false;

    }   

}


export const decrypt  = async (text: string) => {
    const Authorization = "Bearer " + localStorage.getItem("clover-x");

    try {

    const {
      data: { result },
    } = await axios.post(
      "/e2ee",
      {
        text,
        action: "decrypt",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization,
        },
        baseURL: window.origin,
      }
    );

    return result;

    } catch (err) {
        console.log(err);

        return false;
    }
}

export const retrieveGroupChats = async () => {
  const token = `Bearer ${localStorage.getItem("clover-x")}`;

  const {
    data: { groups },
  } = await axios.get(`/dao/${lq[0]}/group`, {
    headers: {
      Authorization: token,
    },
  });

  const groupChats: any = [];

  groups.forEach((val: any) => {
    const { groupname, chat } = val;

    const { data, messId, sender, index, created_at: udate } = chat;

    const ddata = JSON.parse(data);

    const date = new Date(udate);

    groupChats.push({
      name: groupname,
      lastchat: {
        ...ddata,
        messId,
        sender,
        index,
        date: date.getTime(),
      },
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

export const createGroupChat = async (groupname: string) => {
  const token = `Bearer ${localStorage.getItem("clover-x")}`;

  const {
    data: { group },
  } = await axios.post(
    `/dao/${lq[0]}/group`,
    { groupname },
    {
      headers: {
        Authorization: token,
      },
    }
  );

  return group;
};