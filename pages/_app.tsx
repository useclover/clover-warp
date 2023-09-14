import type { AppProps } from "next/app";
import { GenProvider } from "../app/components/extras/contexts/genContext";
import AuthProvider from "../app/components/extras/contexts/AuthContext";
import "../styles/globals.css";
import axios from 'axios';
import { CCprovider } from "../app/components/extras/contexts/CContext";
import '../app/components/types.d.ts';
import { IndexContextProvider } from "../app/contexts/IndexContext";
import { Toaster } from "react-hot-toast";

function MyApp({ Component, pageProps }: AppProps) {

  axios.defaults.baseURL = process.env.NEXT_PUBLIC_APP_URL || "";

  return (
    <AuthProvider>
      <GenProvider>
        <CCprovider>
          <IndexContextProvider>
            <Toaster />
            <Component {...pageProps} />
          </IndexContextProvider>
        </CCprovider>
      </GenProvider>
    </AuthProvider>
  );
}

export default MyApp;
