import type { NextApiResponse } from "next";
import type { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export type GroupChatType = { name: string; lastchat: any; groupKeys: string; key: string }[]

export type ChatObjectType = "mess" | "vote"

export type MessageType = {
  [index: string]: { [index: string]: any[] };
};

export interface ChatBase {
  content: string[][];
  iv?: string;
 reply?: string
 enlargen: boolean;
 sender: string | undefined;
    date: number | string;
    sent: boolean;
}

export interface ChatObject extends ChatBase {
    type: ChatObjectType;
}


export interface reply {
  content?: string;
  sender?: string;
  loading?: boolean;
  group?: string;
  chatkeys?: any;
  groupData?: GroupChatType;
  messages?: MessageType;
}

export interface Textm extends ChatBase {
  selected: boolean;
  messId: string;
  replyDisabled: boolean;
  setExtras: React.Dispatch<React.SetStateAction<string>>;
  setEditable: React.Dispatch<React.SetStateAction<boolean>>;
}


export interface mreply extends reply {
  update?: (rep: reply) => void;
}


export type SocketApiResponse = NextApiResponse & {
  socket: {
    server: any;
  };
};

export type TextAPIData = {
  message: string;
  error: boolean;
  result?: string;
};

export {}