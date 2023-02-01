import '../styles/globals.css'
import '../styles/index.css'
import type { AppProps } from 'next/app'
import { MoralisProvider } from 'react-moralis'
import { GenProvider } from '../app/components/extras/contexts/genContext'
import { LogProvider } from "../app/components/extras/contexts/logContext";
import AuthProvider from '../app/components/extras/contexts/AuthContext'

function MyApp({ Component, pageProps }: AppProps) {
  return (

    <MoralisProvider
      appId={process.env.NEXT_PUBLIC_MORALIS_APP_ID || ""}
      serverUrl={process.env.NEXT_PUBLIC_MORALIS_SERVER || ""}
    >
      <AuthProvider>
        <GenProvider>
          <LogProvider>
            <Component {...pageProps} />
          </LogProvider>
        </GenProvider>
      </AuthProvider>
    </MoralisProvider>
  );
}

export default MyApp;
