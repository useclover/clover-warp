import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import logo from "../../../public/images/logo.png";
import { useState, useEffect } from "react";
import Loader from "../../../app/components/loader";
import {
  lq,
  beginStorageProvider,
  retrieveFiles,
  storeFiles,
  roomData,
} from "../../../app/components/extras/storage/init";
import Dash from "../../../app/components/dash";
import { useAccount } from "wagmi";
import { useLobby } from "@huddle01/react/hooks";
import { MdArrowBack } from "react-icons/md";

const Room = () => {

  const { address, isConnected } = useAccount();

  const { joinLobby, leaveLobby } = useLobby();

  const router = useRouter();

  const { id } = router.query;

  const [loginData, setLoginData] = useState<{
    name: string;
    contract: string;
    data: string | number;
    participants: any;
  }>();

  useEffect(() => {
    if (localStorage.getItem("cloverlog") === null) {

      router.push("/");

    } else {
        const data = JSON.parse(localStorage.getItem("cloverlog") || "{}");
      
       setLoginData(data);

    }

  }, [address, router]);


  const [isLoading, setLoader] = useState(true);

  const { name, contract, participants, data: randId } = loginData || {
    name: "",
    contract: "",
    data: 0,
    participants: {},
  };

  const [meeting, setMeeting] = useState<any>('');

  useEffect(() => {

    async function init() {

      await beginStorageProvider({
        user: address || "",
        contract,
        randId,
        participants,
      });

      const main = await roomData(Number(id as string));

      // const main = false;
      
      joinLobby(main.meetId);

      setLoader(false);

      if (main !== false) {


        setMeeting(main.meetId);

        setLoader(false);

      }else{

        // console.log(id,main)
          router.push('/404');

      }

    }

    if (name != "" && id !== undefined) {
      init();
    }
  }, [address, id, contract, name, participants]);



  // const iframeConfig: IframeConfig = {
  //   roomUrl: `https://iframe.huddle01.com/${meeting}`,
  //   height: "100%",
  //   width: "100%",
  //   noBorder: true, // false by default
  // };

// disableShare();
  return (
    <>
      <Dash />

      {isLoading && <Loader />}

      {!isLoading && (
        <>
          <div className="w-full bg-[rgb(18,18,20)] flex items-start justify-between filedrop min-h-screen">
            <div className="mt-[20px] absolute st:flex st:justify-between st:items-center mb-[1.24rem]">
              <div className="bg-[rgb(18,18,20)] mdd:bg-[#202020] flex items-center pl-6">
                <div onClick={() => router.push('/dashboard')} className="text-[#1890FF] cursor-pointer">
                  <MdArrowBack size={25} />
                </div>
                <Link href="/">
                  <a className="text-[#1890FF] cursor-pointer flex pl-4 items-center font-bold text-[18px]">
                    <Image src={logo} width={100} height={33.33} alt="clover" />
                  </a>
                </Link>
              </div>
            </div>

            <div className="w-full st:!pl-0 transition-all delay-500 h-full flex flex-col">
              <div className={`min-h-screen custom min-w-screen`}>
                {/* Fix here */}



              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Room;
