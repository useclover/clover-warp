import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import logo from "../../../public/images/logo.png";
import { useState, useEffect, useRef } from "react";
import Loader from "../../../../app/components/loader";
import { useDisplayName } from "@huddle01/react/app-utils";
import {
  lq,
  beginStorageProvider,
  storeFiles,
  roomData,
} from "../../../../app/components/extras/storage/init";
import Dash from "../../../../app/components/dash";
import { useAccount } from "wagmi";
import {
  useAudio,
  useLobby,
  useMeetingMachine,
  usePeers,
  useRoom,
  useVideo,
} from "@huddle01/react/hooks";
import { HiOutlineUsers, HiUser, HiUsers } from "react-icons/hi";
import { MdArrowBack } from "react-icons/md";
import {
  IconButton,
  Button,
  AvatarGroup,
  CircularProgress,
  Modal,
  Box,
  Backdrop,
  Fade,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
} from "@mui/material";
import {
  BiChat,
  BiMicrophone,
  BiMicrophoneOff,
  BiSend,
  BiVideo,
  BiVideoOff,
} from "react-icons/bi";
import { RandomAvatar } from "react-random-avatars";
import Head from "next/head";
import { useEventListener, useHuddle01 } from "@huddle01/react";
import axios from "axios";
import {
  RiLayoutMasonryFill,
  RiLayoutFill,
  RiLayoutGridFill,
} from "react-icons/ri";
import { FaUser } from "react-icons/fa";
import { BsChat, BsChatFill } from "react-icons/bs";
import PeerVideoAudioElem from "../../../../app/components/video/PeerVideoAudioElem";

const ChatItem = ({ user }: { user: boolean }) => {
  return (
    <>
      <div className="flex items-start mb-[14px]">
        <div>
          {" "}
          <RandomAvatar size={40} name={"joel"} />
        </div>

        <div className={`ml-[9px] w-full`}>
          <span
            className={`text-[#c4c4c4] block mb-1 text-[13px] capitalize pl-[13px]`}
          >
            {user ? "you" : "Temi"}
          </span>
          <div className="rounded-[1rem] text-[#6a6a6a] bg-[#f1f1f1] text-[15px] px-3 py-3 w-full">
            Hello People
          </div>
        </div>
      </div>
    </>
  );
};

const PartItem = () => {
  return (
    <div className="flex items-center justify-between py-2 bg-[#f3f3f3] px-2 rounded-md mb-1">
      <div className="flex items-center">
        <div className="rounded-[50%] w-[30px] mr-2 h-[30px] flex items-center justify-center">
          <RandomAvatar name="Joel" size={30} />
        </div>
        <span className="text-[14px] truncate">Me</span>
      </div>

      <div className="flex items-center">
        {true ? (
          <BiVideo className="text-[#777] mr-3" size={16} />
        ) : (
          <BiVideoOff className="text-[#777] mr-3" size={16} />
        )}
        {true ? (
          <BiMicrophone className="text-[#777]" size={16} />
        ) : (
          <BiMicrophoneOff
            color={"inherit"}
            className="text-[#777]"
            size={16}
          />
        )}
      </div>
    </div>
  );
};

const Room = () => {
  
  const { address, isConnected } = useAccount();

  const { joinLobby, leaveLobby, isLobbyJoined } = useLobby();

  const { joinRoom, leaveRoom, isRoomJoined } = useRoom();

  const [layout, setLayout] = useState<string>("grid");

  const [sidemodal, setSidemodal] = useState<boolean>(false);

  const [pchat, setPchat] = useState<boolean>(true);

  const { state, send } = useMeetingMachine();

  const [messageText, setMessageText] = useState("");

  const {
    fetchAudioStream,
    stopAudioStream,
    error: micError,
    stream: audioStream,
    produceAudio,
    stopProducingAudio,
  } = useAudio();

  const {
    fetchVideoStream,
    stopVideoStream,
    error: camError,
    stream: videoStream,
    produceVideo,
    stopProducingVideo,
  } = useVideo();


  const { initialize, isInitialized } = useHuddle01();

  const { peerIds, peers } = usePeers();

  const router = useRouter();

  const { id } = router.query;

  const [joiningRoom, setJoiningRoom] = useState<boolean>(false);

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
      
      if (!isInitialized) initialize(process.env.NEXT_PUBLIC_HUDDLE_PROJECTID || "");

    }

  }, [address, router]);

  const [isLoading, setLoader] = useState(true);

  const {
    name,
    contract,
    participants,
    data: randId,
  } = loginData || {
    name: "",
    contract: "",
    data: 0,
    participants: {},
  };

  const [meeting, setMeeting] = useState<any>({});

  const [microphone, setMicrophone] = useState<boolean>(false);

  const [camera, setCamera] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const { setDisplayName, error: displayNameError } = useDisplayName();

  useEffect(() => {
    async function init() {
      await beginStorageProvider({
        user: address || "",
        contract,
        randId,
        participants,
      });

      const main = await roomData(Number(id as string));
      // // const main = false;

      if (main !== false) {

        console.log(main, "main")

        if (!isLobbyJoined) joinLobby(main.meetId);

        setLoader(false);

        setMeeting(main);
      } else {
        router.push("/404");
      }
    }

    if (name != "" && id !== undefined) {
      init();
    }
  }, [address, id, contract, name, participants]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  const getActive = () => {
    return JSON.parse(meeting.active || "[]");
  };


  useEventListener("room:new-peer", async () => {

    console.log(peers, peerIds, "hmm");

  });

  useEventListener("room:peer-left", async () => {
    const num = peerIds.length + 1;

    const {
      data: { room },
    } = await axios.patch(
      `/dao/${randId}/rooms/${id}/active?left=${num}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("clover-x")}`,
        },
      }
    );

    setMeeting(room);
  });

  

  return (
    <>
      <Dash />

      {isLoading && <Loader />}

      {!isLoading && (
        <>
          <Head>
            <title>
              {meeting.name ? `${meeting.name} |` : ""} Meeting Lobby | Clover
            </title>
          </Head>

          <Modal
            open={isRoomJoined}
            onClose={() => false}
            aria-labelledby="DAO Room"
            aria-describedby="You have successfully Joined the Room"
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
              backdrop: {
                timeout: 500,
              },
            }}
          >
            <Fade in={isRoomJoined}>
              <Box
                className="3md:!pl-1 h-screen flex items-center bg-white 3mdd:pl-[2px]"
                sx={{
                  minWidth: 300,
                  width: "100%",
                  outline: "none",
                  py: 1,
                  pl: 1,
                  position: "relative",
                  margin: "auto",
                }}
              >
                <div className="flex flex-col rounded-[24px] bg-[#f5f5f5] h-full px-5 pt-4 w-full">
                  <div>
                    <h2 className="titlebar font-[500] text-[rgb(32,33,36)] text-[1.55rem] 3md:text-[1.2rem] mb-4">
                      {meeting.name}
                    </h2>
                    <div className="topbar flex items-center justify-between mb-2">
                      <Button className="!py-2 !font-bold !px-3 !h-[30px] !capitalize !flex !items-center !text-[#778291] !bg-white !border-none !text-[12px] !transition-all !rounded-[6rem]">
                        <HiUsers
                          color={"inherit"}
                          className={"mr-2 !fill-[#778291]"}
                          size={18}
                        />{" "}
                        {peerIds.length + 1 || 1}
                      </Button>

                      <ToggleButtonGroup
                        value={layout}
                        sx={{
                          justifyContent: "center",
                          width: "fit-content",
                          borderRadius: "6rem",
                          backgroundColor: "#fff",
                          "& .Mui-selected": {
                            backgroundColor: `rgba(94, 67, 236, 0.8) !important`,
                            color: `#fff !important`,
                          },
                          "& .MuiButtonBase-root": {
                            padding: "5px 10px !important",
                          },
                          "& .MuiToggleButtonGroup-grouped": {
                            borderRadius: "6rem !important",
                            minWidth: 35,
                            backgroundColor: "#fff",
                            border: "none",
                          },
                        }}
                        exclusive
                        className="cusscroller overflow-y-hidden"
                        onChange={(e: any) => {
                          if (!e?.target?.value) return;

                          setLayout(e.target.value);
                        }}
                      >
                        <ToggleButton value={"pinned"}>
                          <RiLayoutFill size={20} />
                        </ToggleButton>

                        <ToggleButton value={"mason"}>
                          <RiLayoutMasonryFill size={20} />
                        </ToggleButton>

                        <ToggleButton value={"grid"}>
                          <RiLayoutGridFill size={20} />
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </div>
                  </div>
                  <div className="h-[calc(100vh-200px)] overflow-hidden flex items-center cusscroller overflow-y-scroll relative">
                    <div className="grid gap-4 grid-cols-3 my-3">
                      {/* participants list */}

                      <div className="rounded-[20px] min-w-[300px] h-[180px] min-h-[180px] bg-[#ffffff52] relative flex items-center justify-center overflow-hidden border-[2px] border-solid border-[#ececec]">
                        <RandomAvatar name={"Joel"} square={true} size={300} />

                        <div className="absolute "></div>

                        <div
                          className={`absolute overflow-hidden px-[6px] py-2 bg-inherit ${
                            true ? "backdrop-blur-[6px]" : ""
                          } h-full w-full flex flex-col justify-between`}
                        >
                          <div className="w-full flex items-center justify-end">
                            <IconButton
                              onClick={() => false}
                              size={"medium"}
                              style={{
                                backgroundColor: true ? "#fff" : "#5e43ec",
                              }}
                            >
                              {/* style */}
                              {true ? (
                                <BiMicrophoneOff
                                  color={"inherit"}
                                  className="text-[#777]"
                                  size={17}
                                />
                              ) : (
                                <BiMicrophone
                                  color={"inherit"}
                                  className="text-white"
                                  size={17}
                                />
                              )}
                            </IconButton>
                          </div>
                          {false && (
                            <div className="w-fit h-fit rounded-[50%] border-[2px] border-solid flex items-center justify-center border-[#e6e6e6] m-auto">
                              <RandomAvatar size={70} name={"joel"} />
                            </div>
                          )}
                          <div className="w-fit text-[12px] flex h-fit rounded-[6rem] px-2 py-1 items-center bg-[#1f1f1f2c] text-white relative cursor-default">
                            <FaUser
                              size={10}
                              className="mr-[6px] relative -top-[2px]"
                            />{" "}
                            You
                          </div>
                        </div>
                      </div>

                      {/* peerids */}

                      {/* {peerIds.map((peer: string, i: number) => (
                        <div className="bg-black w-[100px] h-[100px]" key={i}>
                          <PeerVideoAudioElem key={i} peerIdAtIndex={peer} />
                        </div>
                      ))} */}
                    </div>
                  </div>

                  <div className="h-[100px] w-[40%] min-w-[500px] m-auto flex items-center justify-evenly py-[30px]">
                    <IconButton
                      onClick={() => {
                        if (sidemodal && pchat) {
                          setPchat(false);

                          return;
                        }

                        if (!sidemodal && pchat) {
                          setPchat(false);
                          setSidemodal(true);
                          return;
                        }

                        setSidemodal(!sidemodal);
                      }}
                      className="p-3 h-[50px] w-[50px]"
                      size={"large"}
                      style={{
                        backgroundColor: sidemodal
                          ? pchat
                            ? "#fff"
                            : "#d9d9d97a"
                          : "#fff",
                      }}
                    >
                      <BiChat
                        style={{
                          color: sidemodal
                            ? pchat
                              ? "#777"
                              : "#5e43ec"
                            : "#777",
                        }}
                        size={26}
                      />
                    </IconButton>

                    <IconButton
                      onClick={() => {
                        if (microphone) {
                          if (stopProducingVideo.isCallable) {
                            stopProducingAudio();
                            setMicrophone(false);
                          }
                        } else {
                          if (produceAudio.isCallable) {
                            produceAudio(audioStream);

                            setMicrophone(true);
                          }
                        }
                      }}
                      className="bg-white p-3 h-[50px] w-[50px]"
                      size={"large"}
                    >
                    
                      {microphone ? (
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
                      onClick={() => leaveRoom()}
                      className="!py-3 !font-[400] !px-8 !capitalize !flex !items-center !text-white !fill-white !bg-[#5e43ec] !border !border-solid !border-[rgb(94,67,236)] !text-[13px] !transition-all hover:!text-[#f0f0f0] !rounded-[6rem]"
                    >
                      End Meeting
                    </Button>

                    <IconButton
                      onClick={() => {
                        if (camera) {
                          if (stopProducingVideo.isCallable) {
                            stopProducingAudio();
                            setCamera(false);
                          }
                        } else {
                          if (produceVideo.isCallable) {
                            produceVideo(videoStream);

                            setCamera(true);

                          }
                        }
                      }}
                      className="bg-white p-3 h-[50px] w-[50px]"
                      size={"large"}
                    >
                      {camera ? (
                        <BiVideo
                          color={"inherit"}
                          className="text-[#777]"
                          size={26}
                        />
                      ) : (
                        <BiVideoOff
                          color={"inherit"}
                          className="text-[#777]"
                          size={26}
                        />
                      )}
                    </IconButton>

                    <IconButton
                      onClick={() => {
                        if (sidemodal && !pchat) {
                          setPchat(true);

                          return;
                        }

                        if (!sidemodal && !pchat) {
                          setPchat(true);
                          setSidemodal(true);
                          return;
                        }

                        setSidemodal(!sidemodal);
                      }}
                      style={{
                        backgroundColor: sidemodal
                          ? !pchat
                            ? "#fff"
                            : "#d9d9d97a"
                          : "#fff",
                      }}
                      className="p-3 h-[50px] w-[50px]"
                      size={"large"}
                    >
                      <HiOutlineUsers
                        style={{
                          color: sidemodal
                            ? !pchat
                              ? "#777"
                              : "#5e43ec"
                            : "#777",
                        }}
                        size={24}
                      />
                    </IconButton>
                  </div>
                </div>

                <Fade in={sidemodal}>
                  <div
                    style={{
                      display: sidemodal ? "block" : "none",
                    }}
                    className={`min-w-[350px] min-h-screen pl-3 overflow-hidden ${
                      pchat ? "" : "flex flex-col justify-between"
                    } pt-4`}
                  >
                    {pchat ? (
                      <>
                        <div className="flex items-center mt-2 mb-4 justify-between pr-3">
                          <h2 className="titlebar font-[500] text-[rgb(32,33,36)] text-[1.4rem] 3md:text-[1.2rem]">
                            Participants
                          </h2>

                          <div>{peerIds.length + 1 || 1}</div>
                        </div>

                        <div className="w-full cusscroller overflow-y-scroll overflow-x-hidden h-[calc(100vh-100px)]">
                          {/* list item down */}

                          <PartItem />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center mt-2 mb-4 justify-between">
                          <h2 className="titlebar font-[500] text-[rgb(32,33,36)] text-[1.4rem] 3md:text-[1.2rem]">
                            Chat
                          </h2>
                        </div>

                        <div className="w-full cusscroller overflow-y-scroll overflow-x-hidden h-[calc(100vh-132px)]">
                          <ChatItem user={false} />

                          <ChatItem user={true} />
                        </div>

                        <div className="w-full py-2 flex items-center pr-3">
                          <div className="flex w-full transition-all delay-300 items-center relative">
                            <TextField
                              type="text"
                              value={messageText}
                              onChange={(e) => {
                                const val = e.target.value;

                                setMessageText(val);
                              }}
                              placeholder="Type something here..."
                              multiline
                              className="textbox"
                              fullWidth
                              maxRows={3}
                              sx={{
                                "& .MuiInputBase-root": {
                                  padding: "12px",
                                  marginRight: "12px",
                                  marginLeft: "4px",
                                  borderRadius: "16px",
                                  backgroundColor: "#f5f5f5",
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                  border: "none !important",
                                },
                                "& .MuiInputBase-input": {
                                  fontSize: "15px",
                                  fontFamily: "Poppins !important",
                                },
                              }}
                            />
                          </div>

                          <div
                            style={{
                              width: Boolean(messageText) ? "60px" : "0px",
                              minWidth: Boolean(messageText) ? "60px" : "0px",
                            }}
                            className="overflow-hidden sendButton-holder max-w-[60px] transition-all delay-500 h-[45px]"
                          >
                            <Button
                              onClick={() => {
                                // moveMessage(enlargen == 1);

                                // setEnlargen(0);

                                setMessageText("");
                              }}
                              className="!bg-[#5e43ec] !ml-3  !normal-case !rounded-[50%] !max-w-[45px] !min-w-[45px] !w-[45px] !h-[45px] !font-[inherit] !p-[10px]"
                            >
                              <BiSend className={"!text-[#fff]"} size={20} />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Fade>
              </Box>
            </Fade>
          </Modal>

          {!isRoomJoined && (
            <div className="w-full flex items-start">
              <div className="min-h-screen px-4 w-[60%] flex justify-evenly flex-col">
                <div className="mt-[20px] w-full st:flex st:justify-between st:items-center mb-[1.24rem]">
                  <div className="flex items-start text-center justify-center">
                    <div className="items-center">
                      <h2 className="font-[400] text-[rgb(136, 137, 141)] text-[1.25rem]">
                        {meeting.name} Lobby
                      </h2>
                      <span className="text-[rgb(139,140,143)] font-[400] text-[13px]">
                        You can quickly adjust your controls by turning off/on
                        camera sound, enable presentation etc
                      </span>
                    </div>
                  </div>
                </div>

                <div className="">
                  <div
                    style={{
                      backgroundSize: "contain",
                    }}
                    className="rounded-[6px] bg-[#333333] shadow-inner w-[80%] m-auto aspect-video overflow-hidden items-center flex justify-center"
                  >
                    {camera ? (
                      <video
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                      ></video>
                    ) : (
                      <RandomAvatar size={60} name={address} />
                    )}
                  </div>

                  <div className="flex w-[80%] mx-auto items-center mt-5 justify-evenly">
                    <IconButton
                      onClick={async () => {
                        if (microphone) {
                          stopAudioStream();
                          console.log("work");
                          setMicrophone(false);
                        } else {
                          fetchAudioStream();
                          console.log("king");
                          setMicrophone(true);
                        }
                      }}
                      className="bg-[rgba(0,0,0,0.07)]"
                      size={"large"}
                    >
                      {microphone ? (
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

                    <IconButton
                      onClick={() => {
                        if (camera) {
                          stopVideoStream();
                          setCamera(false);
                        } else {
                          fetchVideoStream();
                          setCamera(true);
                        }
                      }}
                      className="bg-[rgba(0,0,0,0.07)]"
                      size={"large"}
                    >
                      {camera ? (
                        <BiVideo
                          color={"inherit"}
                          className="text-[#777]"
                          size={26}
                        />
                      ) : (
                        <BiVideoOff
                          color={"inherit"}
                          className="text-[#777]"
                          size={26}
                        />
                      )}
                    </IconButton>
                  </div>
                </div>

                <div className="flex mt-11 items-center justify-center">
                  <Button
                    onClick={async () => {
                      if (leaveLobby.isCallable) leaveLobby();

                      router.push("/dashboard/rooms");
                    }}
                    className="!bg-[#e8e8e8] !text-[#7c7c7c] !normal-case !rounded-lg !font-[inherit] !px-[20px] !py-[10px] !text-[14px] !font-[500] hover:!bg-[#d8d8d8]"
                  >
                    Leave Room
                  </Button>
                </div>
              </div>

              <div className="min-h-screen px-4 flex items-center justify-center flex-col w-[40%] bg-[rgb(249,249,249)]">
                <div className="mt-[20px] w-full st:flex st:justify-between st:items-center mb-[1.24rem]">
                  <div className="flex items-start text-center justify-center">
                    <div className="items-center">
                      <h2 className="font-[400] text-[rgb(136, 137, 141)] text-[1.25rem]">
                        Ready to Join?
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="mb-[10px]">
                  <span className="text-[rgb(139,140,143)] font-[400] text-[13px]">
                    {getActive().length
                      ? `${getActive().length} people active in this room`
                      : "Nobody active at the moment"}
                  </span>
                </div>

                {Boolean(getActive().length) && (
                  <div className="mb-[20px]">
                    <AvatarGroup
                      max={6}
                      className="!flex !items-center !justify-center"
                    >
                      {getActive().map((addr: string, i: number) => (
                        <div
                          key={i}
                          className="border-solid border-white border-[2px] rounded-[50%] -mr-[20px]"
                        >
                          <RandomAvatar name={addr} />
                        </div>
                      ))}
                    </AvatarGroup>
                  </div>
                )}

                <div className="">
                  <Button
                    disabled={joiningRoom}
                    onClick={async () => {
                      if (joiningRoom) return;

                      setJoiningRoom(true);

                      const { data } = await axios.patch(
                        `/dao/${randId}/rooms/${id}/active`,
                        {},
                        {
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                              "clover-x"
                            )}`,
                          },
                        }
                      );

                      joinRoom();

                      setJoiningRoom(false);

                      // console.log(roomState, "dd");

                      // router.push(`/dashboard/rooms/${randId}/${id}`);
                    }}
                    className="!py-2 !font-[500] !px-3 !capitalize !flex !items-center !text-white !fill-white !bg-[#5e43ec] !border !border-solid !border-[rgb(94,67,236)] !transition-all !delay-500 hover:!text-[#f0f0f0] !rounded-lg"
                  >
                    {joiningRoom ? (
                      <>
                        <div className="mr-3 h-[20px] text-[#fff]">
                          <CircularProgress
                            color={"inherit"}
                            className="!w-[20px] !h-[20px]"
                          />
                        </div>{" "}
                        <span>Just a Sec...</span>
                      </>
                    ) : (
                      <>Join Now</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Room;
