import { createContext, useState } from "react";

export interface reply {
    content?: string,
    sender?: string,
    loading?: boolean; 
    group?: string,
    chatkeys?: any
}

interface mreply extends reply{
    update?: (rep: reply) => any
}

export const CContext = createContext<mreply>({});

export const CCprovider = ({ children }: { children: JSX.Element }) => {

  const [group, setGroup] = useState<string | undefined>();

  const [content, setContent] = useState<string | undefined>();

  const [sender, setSender] = useState<string | undefined>();

  const [isLoading, setLoading] = useState<boolean>(true);

  const [chatkeys, setChatKeys] = useState<any>();

  return (
    <CContext.Provider
      value={{
        content,
        sender,
        loading: isLoading,
        group,
        chatkeys,
        update: (rep: reply) => {

          setContent(rep.content ? rep.content : content);

          setSender(rep.sender ? rep.sender : sender);

          setGroup(rep.group ? rep.group : group);

          setLoading(rep.loading ? rep.loading : isLoading);

          setChatKeys(rep.chatkeys ? rep.chatkeys : chatkeys);

        },
      }}
    >
      {children}
    </CContext.Provider>
  );
};
