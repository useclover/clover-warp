import { createContext, useState } from "react";

export interface reply {
    content?: string,
    sender?: string
    group?: string
}

interface mreply extends reply{
    update?: (rep: reply) => any
}

export const CContext = createContext<mreply>({});

export const CCprovider = ({ children }: { children: JSX.Element }) => {

  const [group, setGroup] = useState<string | undefined>();

  const [content, setContent] = useState<string | undefined>();

  const [sender, setSender] = useState<string | undefined>();

  return (
    <CContext.Provider
      value={{
        content,
        sender,
        group,
        update: (rep: reply) => {

          setContent(rep.content);

          setSender(rep.sender);

          setGroup(rep.group);

        },
      }}
    >
      {children}
    </CContext.Provider>
  );
};
