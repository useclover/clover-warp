import type { AppProps } from "next/app";
import { GenProvider } from "../app/components/extras/contexts/genContext";
import AuthProvider from "../app/components/extras/contexts/AuthContext";
import "../styles/globals.css";
import axios from 'axios';
import { CCprovider } from "../app/components/extras/contexts/CContext";

function MyApp({ Component, pageProps }: AppProps) {

  axios.defaults.baseURL = process.env.NEXT_PUBLIC_APP_URL || "";

  return (
    <AuthProvider>
      <GenProvider>
        <CCprovider>
          <Component {...pageProps} />
        </CCprovider>
      </GenProvider>
    </AuthProvider>
  );
}

export default MyApp;
