import axios from "axios";
import { useEffect } from "react";
import { useSignMessage } from "wagmi";

const Xx = () => {
  const generateUserKeys = async () => {
    const keypair = await window.crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      ["deriveKey", "deriveBits"]
    );

    const publicKey = await crypto.subtle.exportKey("jwk", keypair.publicKey);

    const privateKey = await crypto.subtle.exportKey("jwk", keypair.privateKey);

    return { publicKey, privateKey };
  };

  useEffect(() => {}, []);

  const { signMessageAsync } = useSignMessage();

  return (
    <div>
      <div className="w-full h-[500px] bg-pattern">
        <button
          onClick={async () => {

            console.log(
              await signMessageAsync({
                message: "UseClover Signature Request \n\nSign To Continue \n",
              })
            );

          }}
        >
          click me
        </button>

        <button onClick={async () => {
        
        }}>
            request
        </button>
      </div>
    </div>
  );
};

export default Xx;
