import { Button, CircularProgress, IconButton, Modal } from "@mui/material";
import {
  useAudio,
  useHuddle01,
  useLobby,
  useMeetingMachine,
  usePeers,
  useRoom,
} from "@huddle01/react/hooks";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { BiMicrophone, BiMicrophoneOff, BiPhoneCall } from "react-icons/bi";
import { useRouter } from "next/router";
import { MdOutlineCallEnd } from "react-icons/md";
import { useDisplayName } from "@huddle01/react/app-utils";
import { useEventListener } from "@huddle01/react";

const Call = () => {

   const router = useRouter()

  const { id: callId } = router.query;

  const { address, isConnected } = useAccount();

  const [microphone, setMicrophone] = useState(true);

  const { joinLobby, leaveLobby, isLobbyJoined } = useLobby();

    const { setDisplayName, error: displayNameError } = useDisplayName();

  const { joinRoom, leaveRoom, isRoomJoined } = useRoom();

  const { state, send } = useMeetingMachine();

  const {
    isLoading: audioLoading,
    fetchAudioStream,
    stopAudioStream,
    error: micError,
    stream: micStream,
    produceAudio,
    stopProducingAudio,
  } = useAudio();

  const { initialize, isInitialized } = useHuddle01();

  const { peerIds, peers } = usePeers();

  useEffect(() => {
    
      if (!isInitialized)
        initialize(process.env.NEXT_PUBLIC_HUDDLE_PROJECTID || "");
     
  }, [])

  useEffect(() => {
    console.log(callId);

    if (isInitialized && !isLobbyJoined && !callId) {
      joinLobby(callId as string);
    }
  }, [isInitialized, callId, isLobbyJoined, joinLobby]);

  useEffect(() => {
    if (isLobbyJoined) {
      const user = JSON.parse(localStorage.getItem("cloveruser") || "{}");

      if (user?.name) setDisplayName(user.name);

      // setUserName(user?.name);

    }
  }, [isLobbyJoined]);

  useEffect(() => {
    if (fetchAudioStream.isCallable) {
      fetchAudioStream();
    }
  }, [fetchAudioStream.isCallable]);

  // useEffect(() => {
  //     if (isLobbyJoined && !audioLoading && !isRoomJoined) {
  //       joinRoom();
  //     }
  // }, [audioLoading, isLobbyJoined, joinRoom, isRoomJoined])

  return (
    <div>
      <div className="w-screen cusscroller overflow-y-scroll overflow-x-hidden absolute h-screen flex-col flex items-center bg-[#000]">
        <div className="h-[calc(100%-100px)] w-full flex items-center justify-center">
          {
            <div className="text-[#fff]">
              <BiPhoneCall className="mb-2 mx-auto" size={50} />

              <span className="text-white">
                Waiting for other group members to join the call...
              </span>
            </div>
          }
        </div>
        <div className="h-[100px] w-[40%] min-w-[500px] m-auto flex items-center justify-evenly py-[30px]">
          <IconButton
            onClick={() => {

              joinLobby(callId as string);


              console.log(isInitialized, isLobbyJoined, isRoomJoined);
              // if (stopProducingAudio.isCallable) {
              //   stopProducingAudio();
              //   setMicrophone(false);
              // } else {
              //   produceAudio(micStream);
              //   setMicrophone(true);
              // }
            }}
            className="!bg-white p-3 h-[50px] w-[50px]"
            size={"large"}
          >
            {audioLoading ? (
              <CircularProgress
                color={"inherit"}
                className="!w-[26px] text-[#777] !h-[26px]"
              />
            ) : !produceAudio.isCallable && stopProducingAudio.isCallable ? (
              <BiMicrophone
                color={"inherit"}
                className="text-[#777]"
                size={26}
              />
            ) : (
              <BiMicrophoneOff
                color={"inherit"}
                className="text-[#777]"
                size={26}
              />
            )}
          </IconButton>

          <Button
            onClick={() => {
              leaveRoom();
              router.push('/dashboard')
            }}
            className="!py-3 !font-[400] !px-8 !capitalize !flex !items-center !text-white !fill-white !bg-[#fe1878] !border !border-none !text-[13px] !transition-all hover:!text-[#f0f0f0] !rounded-[6rem]"
          >
            <MdOutlineCallEnd size={30} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Call;
