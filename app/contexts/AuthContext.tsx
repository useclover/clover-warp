import axios from "axios";
import { createContext, useState, useEffect } from "react";
import Loader from "../components/loader";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_APP_URL || "";

export const AuthContext = createContext<{
  isAuth?: boolean;
  finishAuth?: boolean;
  user?: any;
  files?: any[];
  rooms?: any[];
  chats?: any[];
}>({});

export const AuthProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [authComplete, setAuthComplete] = useState<boolean>(false);

  const [isAuth, setIsAuth] = useState<boolean>(false);

  const [isLoading, setLoading] = useState<boolean>(true);

  const [currentUser, setUser] = useState<any>({});


  useEffect(() => {
    if (localStorage.getItem("clover-x") !== null) {
      setIsAuth(true);

      const daoId = localStorage.getItem('dId');

      const token = localStorage.getItem("clover-x");

      (async () => {

        const { data } = await axios.get(`/user/dao/${daoId}`, {
          headers: {
            Authorization: `Bearer ${token || ""}`,
          },
        });
        

        setLoading(false);
      })();

    } else {
      setLoading(false);
    }
  }, [authComplete]);

  return isLoading ? <Loader /> : <AuthContext.Provider value={{

  }}>
    {children}
  </AuthContext.Provider>;
};
