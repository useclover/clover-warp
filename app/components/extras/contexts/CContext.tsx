import { createContext, useState } from "react";
import io from "socket.io-client";
import { mreply, reply } from "../../types";



export const CContext = createContext<mreply>({});

export const CCprovider = ({ children }: { children: JSX.Element }) => {


  const [group, setGroup] = useState<string | undefined>();

  const [groupData, setGroupData] = useState<
    { name: string; lastchat: any; groupKeys: string }[]
  >([]);

  const [content, setContent] = useState<string | undefined>();

  const [sender, setSender] = useState<string | undefined>();

  const [isLoading, setLoading] = useState<boolean>(true);

  const [messages, setMessages] = useState<{
    [index: string]: { [index: string]: any[] };
  }>({});

  const [chatkeys, setChatKeys] = useState<any>();

  return (
    <CContext.Provider
      value={{
        content,
        sender,
        loading: isLoading,
        group,
        groupData,
        messages,
        chatkeys,
        update: (rep: reply) => {

          if (rep.content) setContent(rep.content);

          if (rep.sender) setSender(rep.sender);

          if (rep.group) setGroup(rep.group);

          if (rep.loading) setLoading(rep.loading);

          if (rep.chatkeys) setChatKeys(rep.chatkeys);

          if (rep.messages) setMessages(rep.messages);

          if (rep.groupData) setGroupData(rep.groupData); 

        },
      }}
    >
      {children}
    </CContext.Provider>
  );
};
