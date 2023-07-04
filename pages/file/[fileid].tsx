import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import logo from "../../public/images/logo.png";
import { toDataUrl } from "../../app/components/extras/storage";
import { base64StringToBlob } from "blob-util";
import {
  beginStorageProvider,
  retrieveFile,
  lq,
} from "../../app/components/extras/storage/init";
import { useEffect, useRef, useContext, useState } from "react";
import Loader from "../../app/components/loader";
import { useAccount } from "wagmi";
import { store } from "../../app/components/types";
import { useRouter } from "next/router";
import axios from "axios";
import { decrypt } from "../../app/components/extras/chat/functions";

const ViewFiles = () => {
    
  const { address, isConnected } = useAccount();

  const router = useRouter();

  const { fileid } = router.query;

  const [isLoading, setLoading] = useState(true);
  const [filex, setFilex] = useState<store>();
  const [pageData, setPageData] = useState<any>("");
  const [error, setError] = useState(false);

  const [e404, set404] = useState(false);

  let executed = useRef(false);

  useEffect(() => {

    async function init({
      contract,
      data,
      participants,
      hash
    }: {
      contract: string;
      data: string;
      hash: string;
      participants: any;
    }) {

      if (!executed.current) {
        try {

        if (lq === undefined) {
          await beginStorageProvider({
            user: address || "",
            contract,
            randId: data,
            participants,
          });
        }

        

        const { data: { file: dir, result } } = await axios.get(`/api/file/${fileid}`, {
            baseURL: window.origin,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('clover-x')}`,
            },
            params: {
                hash, Did: lq[0]
            }
        });

    

        setFilex(dir)

        set404(false);

          if (filex !== undefined) {

            let mainBlob: Blob = result;

        

            const maa = filex.type.split("/");

            if (maa[0] == "image" || maa[0] == "video") {
              
             if (!executed.current) {

                //   const xx = await toDataUrl(mainBlob);
                  
                setPageData(`data:${filex.type};base64,${result}`);

                setLoading(false);

                executed.current = true;

              }
      
            } else {

              if (!executed.current) {

                const blob = base64StringToBlob(result, filex.type);

                const linkk = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.style.display = "none";
                a.href = linkk;
                executed.current = true;
                a.download = filex.oname;
                document.body.appendChild(a);
                a.click();
                // console.log(linkk);
                window.URL.revokeObjectURL(linkk);
              }
            }

            setLoading(false);
          }

          } catch (xx) {

            console.log(xx, 'sso')

               setError(true);
               return;

          }
       
      }
    
    }

    const data = JSON.parse(localStorage.getItem("cloverlog") || '{"name":""}');

    if (data.name == "") {

        set404(true);

    } else {

      if ( fileid !== undefined ) init(data);

    }

  }, [address, filex, fileid]);

  return (
    <>
      {isLoading && <Loader />}

      {!isLoading && !e404 && !error && filex !== undefined && (
        <div className="h-screen">
          <Head>
            <title> {filex.name} | Clover</title>
            <meta name="description" content={`${filex.name} - Clover`} />
          </Head>

          {Boolean(pageData) && (
            <>
              {filex.type.split("/")[0] == "image" ? (
                <Image
                  src={pageData}
                  layout={"fill"}
                  className="object-scale-down"
                  alt={filex.name}
                />
              ) : (
                <video height={"auto"} width={"auto"} controls>
                  <source src={pageData}></source>
                </video>
              )}
            </>
          )}
        </div>
      )}

      {!isLoading && !e404 && error && filex !== undefined && (
        <div className="h-screen">
          <Head>
            <title> {filex.name} | Clover</title>
            <meta name="description" content="Clover - Error Loading File" />
          </Head>

          <div className="w-full h-fit flex flex-col justify-items-center my-8">
            <div className="items-center flex justify-center">
              <Image src={logo} alt="Clover" width={150} height={49.995} />
            </div>

            <div className="text-black capitalize font-bold text-4xl mx-auto mt-24">
              An error occured while loading the file
            </div>
            <div className="text-[#5e43ec] font-semibold text-lg mx-auto mt-12">
              Refresh the page to try again
            </div>
          </div>
        </div>
      )}

      {!isLoading && e404 && (
        <div className="h-screen">
          <Head>
            <title>Clover - File Not Found</title>
            <meta name="description" content="Clover - File Not Found" />
          </Head>

          <div className="w-full h-fit flex flex-col justify-items-center my-8">
            <div className="items-center flex justify-center">
              <Image src={logo} alt="Clover" width={150} height={49.995} />
            </div>

            <div className="text-black font-bold text-4xl mx-auto mt-24">
              Page not found
            </div>
            <div className="text-[#5e43ec] font-semibold text-lg mx-auto mt-12">
              Click this button, and go home
            </div>
            <div className="mx-auto mt-8">
              <Link href="/">
                <a>
                  <button className="ml-2 hover:bg-[#0159ac] transition-all delay-500 text-sm rounded-lg bg-[#5e43ec] text-white font-semibold py-4 px-4 mx-auto">
                    Take Me Home
                  </button>
                </a>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewFiles;
