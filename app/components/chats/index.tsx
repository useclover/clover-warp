import Image from "next/image";
import { useEffect, useState, useContext, useRef } from "react";
import Router from "next/router";
import { BsFolder, BsList, BsPlus, BsTrash } from "react-icons/bs";
import styles from "../../../styles/Home.module.css";
import io from "socket.io-client";
import uniqueString from 'unique-string'
import { LuVote } from "react-icons/lu"
import contractjson from "../../../artifacts/contracts/localdao.sol/CloverSuiteNFT.json";
import {
  FiImage,
  FiSettings,
  FiMoon,
  FiPaperclip,
  FiPlusCircle,
  FiVideo,
  FiLogOut,
  FiX,
  FiEdit3,
} from "react-icons/fi";
import { MdClose, MdOutlineEmojiEmotions } from "react-icons/md";
import {
  LinearProgress,
  TextField,
  IconButton,
  Button,
  Modal,
  Box,
  Tab,
  CircularProgress,
  Alert,
  FormControl,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
} from "@mui/material";
import * as ethers from "ethers";
import empty from "../../../public/images/empty.png";
import cicon from "../../../public/images/icon.png";
import { GenContext } from "../extras/contexts/genContext";
import {
  beginStorageProvider,
  lq,
  notifications,
} from "../extras/storage/init";
import {
  retrieveMessages,
  saveMessages,
  deleteMessages,
  deleteMessagesAll,
  findMessId,
  updateMessages,
  encrypt,
  decrypt,
  retrieveGroupChats,
  groupImgCache,
} from "../extras/chat/functions";
import { CContext } from "../extras/contexts/CContext";
import Text from "./texts";
import Loader from "../loader";
import { useAccount, useSwitchNetwork, useSigner, useDisconnect, useNetwork } from "wagmi";
import { BiPhoneCall, BiSend, BiX } from "react-icons/bi";
import EmojiPicker from "emoji-picker-react";
import { ChatObject, ChatObjectType, MessageType } from "../types";
import axios from "axios";
import { useHuddle01 } from "@huddle01/react";
import { FaVoteYea } from "react-icons/fa";
import { RandomAvatar } from "react-random-avatars";
import TabPanel from "../TabPanel";
import { getVotes, storeVote } from "../extras/vote";
import toast from "react-hot-toast";
import Timestamp from "react-timestamp";

let socket: any;

const Chats = () => {

  const [loginData, setLoginData] = useState<any>({});

  const { address, isConnected: connected } = useAccount();

  const { chains, error, pendingChainId, switchNetworkAsync } =
    useSwitchNetwork();

  const { chain: chainId } = useNetwork();

  const { data: nullSigner } = useSigner();

  const [signer, setSigner] = useState(nullSigner);

  const goDown = () => {
    const chatArea = document.querySelector(".chat-area");

    if (chatArea !== null) {
      chatArea.scrollTop = chatArea.scrollHeight + 100;
    }
  };

  useEffect(() => {
    if (localStorage.getItem("cloverlog") === null) {
      Router.push("/");
    } else {
      const data = JSON.parse(localStorage.getItem("cloverlog") || "{}");

      goDown();

      setLoginData(data);
    }
  }, []);

  const { name, contract, data: main, participants, creator } = loginData;

  const emojiModal = () => {
    const emojiElem = document.querySelector(
      ".EmojiPickerReact"
    ) as HTMLDivElement;

    const inputElem = document.querySelector(".textbox") as HTMLDivElement;

    if (emojiElem == null) return;

    if (inputElem == null) return;

    const hx = inputElem.clientHeight + 13;

    emojiElem.style.bottom = `${hx}px`;

    emojiElem.style.height = `${emojiElem.clientHeight - (58 - hx)}px`;
  };

  document.querySelectorAll("textArea, .emoji-scroll-wrapper").forEach((e) => {
    e.classList.add("cusscroller");
  });

  const [vote, setVote] = useState<{[index:string]: boolean}>({});

  const [showEmoji, setShowEmoji] = useState(false);

  const [messageText, setMessageText] = useState("");

  const [messageSend, setMessageSend] = useState<boolean>(false);

  const [chDate, setChDate] = useState<string>("");

  const [edit, setEdit] = useState<string>("");

  const rContext = useContext(CContext);

  const [toggle, setToggle] = useState<string | number>("0");

  const [voteOptions, setVoteOptions] = useState<string[]>(['', '']);

  const { group, chatkeys, messages: messData } = rContext;

  const updateMessData = (data: MessageType) => {
    rContext.update?.({ messages: data });
  };

  const sx = {
    "& .Mui-focused.MuiFormLabel-root": {
      color: "#5e43ec",
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: `#5e43ec !important`,
    },
  };

  /* upload */
  const [update, setUpdate] = useState<boolean>(false);

  const [voteError, setVoteError] = useState<string>('')

  const [isLoading, setLoader] = useState(true);

  const [vloading, setVloading] = useState(false);

  const [title, setTitle] = useState('')
  const [prevMessLoading, setPrevMessLoading] = useState<boolean>(false);

  const [phoneLoading, setPhoneLoading] = useState<boolean>(false);

  const [votes, setVotes] = useState<boolean>(false)

  const [voteData, setVoteData] = useState<any[]>([]);

  const [preloadMess, setPreloadMess] = useState<boolean>(true);

  const [editableMess, setEditableMess] = useState<boolean>(true);

  const [delMessageMe, setDelMessageMe] = useState<boolean>(false);

  const [delMessageEvryone, setDelMessageEvryone] = useState<boolean>(false);

  const [extrasId, setExtras] = useState<string>("");

  const loadOnce = useRef<boolean>(true);
  
  const { disconnect } = useDisconnect();

  const socketIsInit = useRef<boolean>(false);

  const upd = async () => {
    const mess = await retrieveMessages();

    if (!Boolean(mess[name]?.["messages"])) {
      if (mess[name] === undefined) mess[name] = {};

      mess[name]["messages"] = [];
    }

    updateMessData(mess);

    const votes = await getVotes(main, name, contract);

    setVoteData(() => votes);

    const gps = await retrieveGroupChats();

    rContext.update?.({ groupData: gps });

  };

  const socketInit = async () => {

    await fetch(`/api/messages?lq=${main}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("clover-x")}`,
      },
    });

    socket = io();

    socket.on("connect", () => {
      socket.emit("join", name);

      socketIsInit.current = true;
    });

    const update = async (data: any) => {
      await upd();
    };

    socket.on("new_incoming_message", update);

    socket.on("edit_msg", update);

    socket.on("del_msg", update);

  };

  useEffect(() => {
    if (loadOnce.current && main) {
      loadOnce.current = false;

      socketInit();
    }
  }, [main]);

  useEffect(() => {
    if (socketIsInit.current) {
      socket?.emit?.("join", group);
    }
  }, [group]);

  useEffect(() => {
    async function init() {
      
      setChDate("");

      await beginStorageProvider({
        user: address || "",
        contract,
        randId: main,
        participants,
      });

      if (group === undefined) {
        rContext.update?.({ group: name });
      }

      const votes = await getVotes(main, name, contract);

      setVoteData(votes);

      setLoader(false);
    }

    if (name != undefined) {
      init();
    }
  }, [main, update, contract, name, address, participants, group, rContext]);

  useEffect(() => {
    goDown();
  }, [messageSend, group, isLoading, prevMessLoading, vote]);

  const [enlargen, setEnlargen] = useState<number>(0);

  const createVote = async () => {

        if (!title) {
            setVoteError('Title of Poll is required')
            return;
        }

        if (voteOptions.length < 2) {
            setVoteError('More than one options are required')
            return;
        }else{
            voteOptions.forEach(e => {
                if (!e.length) {
                  setVoteError("Your Options are required");
                  return;
                }
            })
        }

        if (!voteError.length) {

          const toastz = toast.loading("Creating Vote...");

          if (
            !connected ||
            chainId?.id != Number(process.env.NEXT_PUBLIC_CHAIN || 314159) ||
            !signer
          ) {

            if (chainId != process.env.NEXT_PUBLIC_CHAIN) {
              const switchNet = await switchNetworkAsync?.(
                Number(process.env.NEXT_PUBLIC_CHAIN || 314159)
              );

            }

          } else {

            try {

            const s = signer as any;

            const contractInit = new ethers.Contract(
              contract || "",
              contractjson.abi,
              s
            );
            
            await contractInit.createVote(
              voteOptions.map(() => 0)
            );
            
            const voteId = (await contractInit.pollCount()).toNumber();

            
            await storeVote(
              {
                options: voteOptions,
                sender: address || "",
                title,
                voteId,
                group: group || "",
              },
              main
            );

            toast.dismiss(toastz);
            
            toast.success("Vote Created Successfully")
            

            // update state
            setVoteData(() => [
              ...voteData,
              {
                creator: address || "",
                data: JSON.stringify({
                  options: voteOptions,
                  title,
                }),
                voteId,
                group: group || "",
                votedata: voteOptions.map(() => 0),
                created_at: new Date(),
              },
            ]);

            goDown();

            // update the socket

            socket?.emit?.("send_message");

            setVotes(false);

            }catch(err){
                const error = err as any;

                console.log(error)

                toast.dismiss(toastz);

                toast.error(error.response?.data?.message || "Something went wrong, please try again");

            }
            

          }
        }
  }

  const moveMessage = async (
    enlargen: boolean,
    type: ChatObjectType = "mess"
  ) => {
    if (messageText.length) {

      const encMessage = await encrypt(messageText, chatkeys[group || ""]);

      if (Boolean(edit)) {
        const { content } = findMessId(
          messData?.[group || ""]["messages"] || [],
          extrasId
        );

        content[0][0] = encMessage.message;

        setEdit("");

        // await updateMessages(extrasId, { content, iv: encMessage.iv });

        await socket.emit("edit_message", {
          id: extrasId,
          update: { content, iv: encMessage.iv },
        });

        upd();

        return;
        
      }

      if (!Boolean(messData?.[group || ""]?.["messages"][0])) {
        (messData || { group: {} })[group || ""] = {
          messages: [[]],
        };
      }

      const newMess: ChatObject = {
        content: [[encMessage.message]],
        sent: false,
        type,
        iv: encMessage.iv,
        enlargen,
        sender: address,
        date: new Date().getTime(),
      };

      if (rContext?.sender !== undefined) {
        newMess["reply"] = rContext.sender;
        newMess["content"][0].push(rContext.content || "");
      }

      messData?.[group || ""]["messages"][0].push(newMess);

      try {

        notifications({
          title: `Message from ${address}`,
          message: messageText,
          receivers: lq[2],
          exclude: address || "",
        });

        updateMessData(messData || {});

        setMessageSend(!messageSend);

        await saveMessages({
          data: JSON.stringify(newMess),
          receiver: group || "",
        });

        socket.emit("send_message");

        upd();
      } catch (err) {
        console.log(err);
      }
    }
  };

  const onEClick = (eObject: any, event: any) => {
    setEnlargen(enlargen + 1);
    setMessageText(messageText + eObject.emoji);
  };

  const [conDelete, setConDelete] = useState<boolean>(false);

  const deleteMessageMe = async () => {
    if (extrasId) {
      // const status = await deleteMessagesAll(extrasId);

      await socket.emit("delete_message", extrasId);

      upd();
    }
  };

  const deleteMessageEvryone = async () => {
    if (extrasId) {
      // const status = await deleteMessages(extrasId);

      await socket.emit("delete_message_all", extrasId);

      upd();
    }
  };

  return (
    <>
      {isLoading && <Loader />}

      {!isLoading && (
        <>
          <Modal open={conDelete} onClose={() => setConDelete(false)}>
            <div className="w-screen cusscroller overflow-y-scroll overflow-x-hidden absolute h-screen flex items-center bg-[#ffffffb0]">
              <div className="2usm:px-0 mx-auto max-w-[500px] 2usm:w-full relative w-[85%] usm:m-auto min-w-[340px] px-6 my-8 items-center">
                <div className="rounded-lg bg-white shadow-lg shadow-[#cccccc]">
                  <div className="border-b flex justify-between items-center py-[9px] px-[17px] text-[16px] font-[600]">
                    Delete Message?
                    <IconButton size={"medium"}>
                      <FiX
                        size={20}
                        className="cursor-pointer"
                        onClick={() => setConDelete(false)}
                      />
                    </IconButton>
                  </div>
                  <div className="form relative">
                    <Box sx={{ width: "100%", padding: "15px 24px" }}>
                      <span className="text-[#7c7c7c] mt-3 block font-[500] text-[16px] text-center ">
                        {editableMess
                          ? "You can either delete message for yourself or for everyone."
                          : "Are you sure you want to delete message?"}
                      </span>

                      <div className="flex justify-evenly mt-[20px]">
                        <Button
                          className="!bg-[#e8e8e8] !text-[#7c7c7c] !normal-case !rounded-lg !font-[inherit] !px-[20px] !py-[10px] !text-[14px] !font-[500] hover:!bg-[#d8d8d8]"
                          onClick={async () => {
                            if (delMessageEvryone || delMessageMe) return;

                            setDelMessageMe(true);

                            await deleteMessageMe();

                            setDelMessageMe(false);
                            setExtras("");
                            setConDelete(false);
                          }}
                        >
                          {delMessageMe ? (
                            <>
                              <div className="mr-3 h-[20px] text-[#7c7c7c]">
                                <CircularProgress
                                  color={"inherit"}
                                  className="!w-[20px] !h-[20px]"
                                />
                              </div>{" "}
                              <span>Just a Sec...</span>
                            </>
                          ) : (
                            <>Delete for me</>
                          )}
                        </Button>

                        {editableMess && (
                          <Button
                            className="!bg-[#e8e8e8] !text-[#7c7c7c] !font-[inherit] !normal-case
                          !rounded-lg !px-[20px] !py-[10px] !text-[14px] !font-[500] hover:!bg-[#d8d8d8]"
                            onClick={async () => {
                              if (delMessageEvryone || delMessageMe) return;

                              setDelMessageEvryone(true);

                              await deleteMessageEvryone();

                              setDelMessageEvryone(false);

                              setConDelete(false);

                              setExtras("");
                            }}
                          >
                            {delMessageEvryone ? (
                              <>
                                <div className="mr-3 h-[20px] text-[#7c7c7c]">
                                  <CircularProgress
                                    color={"inherit"}
                                    className="!w-[20px] !h-[20px]"
                                  />
                                </div>{" "}
                                <span>Just a Sec...</span>
                              </>
                            ) : (
                              <>Delete for everyone</>
                            )}
                          </Button>
                        )}
                      </div>
                    </Box>
                  </div>
                </div>
              </div>
            </div>
          </Modal>

          <Modal
            sx={{
              "&& .MuiBackdrop-root": {
                backdropFilter: "blur(5px)",
                width: "calc(100% - 8px)",
              },
            }}
            open={votes}
            className="overflow-y-scroll overflow-x-hidden cusscroller flex justify-center"
            onClose={() => setVotes(false)}
            aria-labelledby="Clover Votes"
            aria-describedby="Create A Voting Poll"
          >
            <>
              <Box
                className="sm:!w-full 3md:!px-1 h-fit 3mdd:px-[2px]"
                sx={{
                  minWidth: 300,
                  width: "70%",
                  maxWidth: 800,
                  borderRadius: 6,
                  outline: "none",
                  p: 1,
                  position: "relative",
                  margin: "auto",
                }}
              >
                <div className="py-4 px-6 bg-white -mb-[1px] rounded-t-[.9rem]">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h2 className="font-[500] text-[rgb(32,33,36)] text-[1.55rem] 3md:text-[1.2rem]">
                        DAO Voting
                      </h2>
                      <span className="text-[rgb(69,70,73)] font-[500] text-[14px]">
                        Making decisions in your DAO
                      </span>
                    </div>

                    <IconButton size={"medium"} onClick={() => setVotes(false)}>
                      <MdClose
                        size={20}
                        color={"rgb(32,33,36)"}
                        className="cursor-pointer"
                      />
                    </IconButton>
                  </div>

                  <div className="form relative pt-4">
                    <Box sx={{ width: "100%" }}>
                      {Boolean(voteError.length) && (
                        <div className="rounded-md w-[95%] font-bold mt-2 mx-auto p-3 bg-[#ff8f33] text-white">
                          {voteError}
                        </div>
                      )}

                      <FormControl
                        fullWidth
                        sx={{
                          px: 2,
                          py: 3,
                        }}
                      >
                        <div>
                          <ToggleButtonGroup
                            value={toggle}
                            sx={{
                              justifyContent: "space-between",
                              marginBottom: "15px !important",
                              width: "100%",
                              "& .Mui-selected": {
                                backgroundColor: `rgba(94,67,236, 0.8) !important`,
                                color: `#fff !important`,
                              },
                              "& .MuiButtonBase-root:first-of-type": {
                                marginRight: "0px !important",
                                marginLeft: "0px !important",
                              },
                              "& .MuiButtonBase-root": {
                                padding: "10px 15px !important",
                              },
                              "& .MuiToggleButtonGroup-grouped": {
                                borderRadius: "4px !important",
                                minWidth: 241,
                                marginLeft: "5px !important",
                                backgroundColor: "#1212121a",
                                border: "none",
                              },
                            }}
                            exclusive
                            className="w-full cusscroller overflow-y-hidden  mb-4 pb-1"
                            onChange={(e: any) => {
                              if (e.target.value) {
                                setToggle(e.target.value);
                              }
                            }}
                          >
                            <ToggleButton
                              sx={{
                                textTransform: "capitalize",
                                fontWeight: "500",
                              }}
                              value={"0"}
                            >
                              <LuVote className="mr-2" size={20} />
                              Normal
                            </ToggleButton>
                            <ToggleButton
                              sx={{
                                textTransform: "capitalize",
                                fontWeight: "500",
                              }}
                              value={"1"}
                            >
                              <FaVoteYea className="mr-2" size={20} /> DAO
                              Change
                            </ToggleButton>
                          </ToggleButtonGroup>
                        </div>

                        <TabPanel padding={0} value={Number(toggle)} index={0}>
                          <div>
                            <TextField
                              fullWidth
                              id="outlined-basic"
                              label="Title of Vote"
                              sx={sx}
                              variant="outlined"
                              value={title}
                              onChange={(
                                e: React.ChangeEvent<
                                  HTMLInputElement | HTMLTextAreaElement
                                >
                              ) => {
                                setTitle(e.target.value);
                                setVoteError("");
                              }}
                            />
                          </div>

                          <div className="mt-4">
                            <label className="text-[#808080] mb-2 block">
                              Options
                            </label>

                            <div className="py-2 w-full items-center flex-nowrap px-0">
                              {voteOptions.map((v: string, i: number) => (
                                <div key={i} className="mb-3">
                                  <TextField
                                    fullWidth
                                    id="outlined-basic"
                                    sx={sx}
                                    label={`Vote Option ${i + 1}`}
                                    variant="outlined"
                                    value={v}
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          <MdClose
                                            className="cursor-pointer"
                                            onClick={() => {
                                              if (voteOptions.length > 2) {
                                                voteOptions.splice(i, 1);

                                                setVoteOptions([
                                                  ...voteOptions,
                                                ]);
                                              }
                                            }}
                                            size={20}
                                            color={"#121212"}
                                          />
                                        </InputAdornment>
                                      ),
                                    }}
                                    onChange={(
                                      e: React.ChangeEvent<
                                        HTMLInputElement | HTMLTextAreaElement
                                      >
                                    ) => {
                                      const opt = [...voteOptions];
                                      opt[i] = e.target.value;
                                      setVoteOptions([...opt]);
                                      setVoteError("");
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                            <div className="flex w-full items-center justify-center">
                              <Button
                                onClick={() => {
                                  setVoteOptions([...voteOptions, ""]);
                                }}
                                className="!py-2 !font-bold !px-3 !capitalize !flex !items-center !text-white !fill-white !bg-[#5e43ec] !border !border-solid !border-[rgb(94,67,236)] !transition-all !delay-500 hover:!text-[#f0f0f0] !rounded-lg"
                              >
                                <BsPlus
                                  color={"inherit"}
                                  className={"!fill-white"}
                                  size={25}
                                />{" "}
                              </Button>
                            </div>
                          </div>
                        </TabPanel>

                        <TabPanel padding={0} value={Number(toggle)} index={1}>
                          <div className="flex w-full h-[200px] justify-center items-center">
                            <h2 className="font-bold text-[20px]">
                              This feature would be out in a bit.
                            </h2>
                          </div>
                          {/* <div className="mb-4">
                            <TextField
                              fullWidth
                              id="outlined-basic"
                              label="Title of Vote"
                              variant="outlined"
                              value={title}
                              onChange={(
                                e: React.ChangeEvent<
                                  HTMLInputElement | HTMLTextAreaElement
                                >
                              ) => {
                                setTitle(e.target.value);
                                setVoteError("");
                              }}
                            />
                          </div>

                          <div className="mb-4">
                            <TextField
                              fullWidth
                              id="outlined-basic"
                              label="Description"
                              multiline
                              variant="outlined"
                              value={voteDesc}
                              onChange={(
                                e: React.ChangeEvent<
                                  HTMLInputElement | HTMLTextAreaElement
                                >
                              ) => {
                                setVoteDesc(e.target.value);
                                setFailMessage("");
                              }}
                            />
                          </div>

                          <div className="mb-5">
                            <label className="text-[#808080] mb-2 block">
                              Select Discussion Channel participants can vote on
                            </label>

                            <Select
                              isClearable={false}
                              value={discussions}
                              onChange={(e: any) => setDiscussion(e)}
                              name="Channels"
                              placeholder={"Channels..."}
                              options={Object.keys(messData || {})}
                              styles={{
                                option: (provided: any, state: any) => {
                                  return {
                                    ...provided,
                                    backgroundColor: state.isSelected
                                      ? "#dfdfdf"
                                      : "transparent",
                                    cursor: "pointer",
                                    "&:active": {
                                      backgroundColor: "#dfdfdf",

                                      color: "#121212 !important",
                                    },
                                    "&:hover": {
                                      backgroundColor: state.isSelected
                                        ? undefined
                                        : `#dfdfdff2`,
                                    },
                                  };
                                },
                                container: (provided: any, state: any) => ({
                                  ...provided,
                                  "& .select__control": {
                                    borderWidth: "0px",
                                    borderRadius: "0px",
                                    backgroundColor: "transparent",
                                    borderBottomWidth: "1px",
                                  },
                                  "& .select__value-container": {
                                    paddingLeft: "0px",
                                  },
                                  "& .select__control:hover": {
                                    borderBottomWidth: "2px",
                                    borderBottomColor: "#121212",
                                  },
                                  "& .select__control--is-focused": {
                                    borderWidth: "0px",
                                    borderBottomWidth: "2px",
                                    borderBottomColor: `#5e43ec !important`,
                                    boxShadow: "none",
                                  },
                                }),
                              }}
                              classNamePrefix="select"
                            />
                          </div> */}
                        </TabPanel>
                      </FormControl>
                    </Box>
                  </div>
                </div>

                <div className="bg-[#efefef] flex justify-center items-center rounded-b-[.9rem] px-6 py-4">
                  <div className="flex items-center">
                    <Button
                      onClick={createVote}
                      disabled={toggle == 1}
                      className="!py-2 !font-bold !px-3 !capitalize !flex !items-center !text-white !fill-white !bg-[#5e43ec] !border !border-solid !border-[rgb(94,67,236)] !transition-all !delay-500 hover:!text-[#f0f0f0] !rounded-lg"
                    >
                      <FaVoteYea
                        color={"inherit"}
                        className={"mr-2 !fill-white"}
                        size={20}
                      />{" "}
                      Create
                    </Button>
                  </div>
                </div>
              </Box>
            </>
          </Modal>

          <div className="wrapper w-full flex flex-grow-[1] overflow-hidden">
            {
              <>
                <div
                  onScroll={async (e: any) => {
                    const label = document.querySelectorAll(".dateSeperate");

                    if (
                      group == undefined ||
                      e.target.scrollHeight <= e.target.clientHeight + 60
                    )
                      return;

                    label.forEach((element) => {
                      const elem = element as HTMLDivElement;

                      if (elem.offsetTop - 70 < e.target.scrollTop) {
                        setChDate(elem.innerText);
                      }
                    });

                    if (e.target.scrollTop <= 20 && preloadMess) {
                      if (
                        prevMessLoading ||
                        !messData?.[group || ""]?.["messages"]?.length
                      )
                        return;

                      setPrevMessLoading(true);

                      const dataMess = await retrieveMessages(
                        messData?.[group || ""]?.["messages"]?.length || 0
                      );

                      if (Object.values(dataMess).length) {
                        messData?.[group || ""]?.["messages"].push(dataMess);

                        setPrevMessLoading(false);
                      } else {
                        setPrevMessLoading(false);
                      }
                    } else {
                      setPreloadMess(false);
                      return;
                    }
                  }}
                  className="chat-area cusscroller"
                >
                  <div className="chat-area-header">
                    <div className="chat-area-title capitalize">{group}</div>
                    <div className="chat-area-group">
                      <span
                        style={{
                          display: Boolean(extrasId) ? "none" : "flex",
                        }}
                        className="chat-length items-center"
                      >
                        {chDate}
                      </span>

                      <IconButton
                        className={`!ml-2 !mr-0 ${
                          Boolean(vote[group || ""]) ? "!bg-[#f0f0f0]" : ""
                        }`}
                        onClick={async () =>
                          setVote({
                            ...vote,
                            [group || ""]: !Boolean(vote[group || ""]),
                          })
                        }
                        size="medium"
                      >
                        <>
                          {/* {!vote ? (
                            <FaVoteYea
                              size={20}
                              className="relative -left-[1px] text-[#777]"
                            />
                          ) : (
                            <CircularProgress
                              size={20}
                              className="relative -left-[1px] text-[#777]"
                            />
                          )} */}

                          <FaVoteYea
                            size={20}
                            className="relative -left-[1px] text-[#777]"
                          />
                        </>
                      </IconButton>

                      <IconButton
                        className={`!mx-2 ${
                          phoneLoading ? "!bg-[#f0f0f0]" : ""
                        }`}
                        onClick={async () => {
                          if (phoneLoading) return;

                          const token = `Bearer ${localStorage.getItem(
                            "clover-x"
                          )}`;

                          setPhoneLoading(true);

                          const {
                            data: {
                              group: { calls: callsLink, id: groupId },
                            },
                          } = await axios.get(
                            `/dao/${lq[0]}/groupname/${group}`,
                            {
                              headers: {
                                Authorization: token,
                              },
                            }
                          );

                          notifications({
                            title: `${group} group is having a group Call`,
                            message: "Click me to join in",
                            receivers: lq[2],
                            exclude: address || "",
                          });

                          if (!callsLink) {
                            const {
                              data: {
                                data: { roomId: callId },
                              },
                            } = await axios.post(
                              "/api/rooms/create",
                              {
                                title: group,
                                videoOnEntry: false,
                              },
                              {
                                baseURL: window.origin,
                              }
                            );

                            await axios.patch(
                              `/dao/${lq[0]}/group/${groupId}`,
                              {
                                calls: callId,
                              },
                              {
                                headers: {
                                  Authorization: token,
                                  "Content-Type": "application/json",
                                },
                              }
                            );

                            Router.push(`/dashboard/rooms/${callId}/calls`);
                          } else {
                            Router.push(`/dashboard/rooms/${callsLink}/calls`);
                          }
                        }}
                        size="medium"
                      >
                        <>
                          {!phoneLoading ? (
                            <BiPhoneCall
                              size={20}
                              className="relative -left-[1px] text-[#777]"
                            />
                          ) : (
                            <CircularProgress
                              size={20}
                              className="relative -left-[1px] text-[#777]"
                            />
                          )}
                        </>
                      </IconButton>

                      <div
                        style={{
                          width: Boolean(extrasId) ? "fit-content" : "0px",
                        }}
                        className="transition-all overflow-hidden delay-300 w-[0px] flex items-center justify-center"
                      >
                        <IconButton
                          onClick={() => setConDelete(true)}
                          size="medium"
                        >
                          <BsTrash
                            size={20}
                            className="relative -left-[1px] text-[#777]"
                          />
                        </IconButton>

                        {editableMess && (
                          <IconButton
                            onClick={async () => {
                              const { content, iv } = findMessId(
                                messData?.[group || ""]["messages"] || [],
                                extrasId
                              );

                              if (!content?.[0]?.[0]) return;

                              if (iv == undefined) {
                                setEdit(content[0][0]);

                                setMessageText(content[0][0]);

                                return;
                              }

                              const decryptText = await decrypt(
                                { iv, message: content[0][0] },
                                chatkeys[group || ""]
                              );

                              setEdit(decryptText);

                              setMessageText(decryptText);
                            }}
                            size="medium"
                          >
                            <FiEdit3
                              size={20.4}
                              className="relative -left-[1px] text-[#777]"
                            />
                          </IconButton>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="chat-area-main">
                    {prevMessLoading && (
                      <div className="text-[#5e43ec] flex items-center justify-center py-2">
                        <CircularProgress size={18} color={"inherit"} />
                      </div>
                    )}

                    {Boolean(vote?.[group || ""]) &&
                      voteData.map((e, i) => {
                        const { title, options, group } = JSON.parse(e.data);

                        const voteId = e.voteId;

                        const votedata = e.votedata;

                        return (
                          <div
                            key={i}
                            className={`chat-msg transition-all !cursor-default !bg-transparent relative z-[1001] delay-[400] ${
                              address == e.creator ? "owner voting" : ""
                            }`}
                          >
                            <div className="chat-msg-profile relative">
                              <RandomAvatar size={40} name={e.creator} />

                              <div className="chat-msg-date">
                                {Boolean(e.creator) &&
                                  `${e.creator?.substring(
                                    0,
                                    6
                                  )}...${e.creator?.substring(38, 42)}`}{" "}
                                <span>
                                  <Timestamp
                                    options={{
                                      format: "date",
                                    }}
                                    style={{
                                      color: "#666",
                                      marginLeft: '8px'
                                    }}
                                    date={e.created_at}
                                  />
                                </span>
                              </div>
                            </div>

                            <div className="chat-msg-content">
                              <div key={i}>
                                <div
                                  key={i}
                                  className="chat-msg-text !rounded-[16px] w-[300px]"
                                >
                                  <div className="mb-2">
                                    <h2 className="font-[600] text-[16px]">
                                      {title}
                                    </h2>
                                    <span className="text-[rgb(69,70,73)] font-[400] text-[14px]">
                                      {votedata.reduce(
                                        (a: number, b: number) => a + b,
                                        0
                                      )}{" "}
                                      vote(s)
                                    </span>
                                  </div>

                                  <ul className="p-0 m-0 pt-1">
                                    {options.map((v: string, i: number) => (
                                      <li
                                        onClick={async () => {
                                            if (vloading) return false; 

                                            const toasty = toast.loading("Just a Sec...");

                                            setVloading(true);
                                          try{
                                             

                                              
                                            
                                              const s = signer as any;

                                              const contractInit =
                                                new ethers.Contract(
                                                  contract || "",
                                                  contractjson.abi,
                                                  s
                                                );

                                              await contractInit.makeVote(
                                                voteId,
                                                i
                                              );

                                              socket?.emit("send_message");

                                              const vv = await getVotes(
                                                main,
                                                name,
                                                contract
                                              );

                                              setVoteData(() => vv);

                                              toast.success("Nicee, Voted Successfully")

                                        }catch (err) {
                                          console.log(err)
                                          toast.error("Something went wrong, please try again")
                                        }finally {
                                          setVloading(false)
                                          toast.dismiss(toasty)
                                        }

                                        }}
                                        key={i}
                                        className="mb-3"
                                      >
                                        <span className="font-[400]">{v}</span>
                                        <div className="h-[12px] bg-[#c9c9c9] rounded-[10px] cursor-pointer">
                                          <div
                                            style={{
                                              width: `${
                                                votedata[i]
                                                  ? (votedata[i] /
                                                      votedata.reduce(
                                                        (
                                                          a: number,
                                                          b: number
                                                        ) => a + b,
                                                        0
                                                      )) *
                                                    100
                                                  : 0
                                              }%`,
                                            }}
                                            className="h-[100%] bg-[#454545] text-[11px] flex items-center justify-end rounded-[10px] transition-all duration-[.6s] pr-1"
                                          >
                                            {`${
                                              votedata[i]
                                                ? (votedata[i] /
                                                    votedata.reduce(
                                                      (a: number, b: number) =>
                                                        a + b,
                                                      0
                                                    )) *
                                                  100
                                                : 0
                                            }%`}
                                          </div>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                    {!Boolean(vote?.[group || ""]) &&
                      Boolean(
                        messData?.[group || ""]?.["messages"]?.length
                      ) && (
                        <>
                          {messData?.[group || ""]["messages"]
                            .reverse()
                            .map((v: any, ii: number) => {
                              return v.map(
                                (
                                  {
                                    sender,
                                    date,
                                    content,
                                    reply,
                                    index,
                                    type,
                                    messId,
                                    iv,
                                    sent,
                                    enlargen,
                                  }: any,
                                  i: number
                                ) => {
                                  let addNumb = false;

                                  const mess =
                                    messData?.[group || ""]["messages"][ii][
                                      i - 1
                                    ];

                                  if (mess !== undefined) {
                                    const { index: prevIndex } = mess;

                                    if (prevIndex != index) {
                                      addNumb = true;
                                    }
                                  } else {
                                    addNumb = true;
                                  }

                                  return (
                                    <div key={i}>
                                      {addNumb && (
                                        <div
                                          style={{
                                            zIndex: i + 1,
                                          }}
                                          className="text-[#777] text-[14px] flex items-center sticky cursor-default bg-white dateSeperate justify-center text-center w-full py-3"
                                        >
                                          {index}
                                        </div>
                                      )}

                                      <Text
                                        replyDisabled={Boolean(edit)}
                                        sender={sender}
                                        date={date}
                                        iv={iv}
                                        selected={extrasId == messId}
                                        setExtras={setExtras}
                                        setEditable={setEditableMess}
                                        messId={messId}
                                        content={content}
                                        sent={sent}
                                        reply={reply}
                                        enlargen={Boolean(enlargen)}
                                      />
                                    </div>
                                  );
                                }
                              );
                            })}
                        </>
                      )}

                    {(Boolean(vote?.[group || ""]) && !voteData.length) || (!Boolean(vote?.[group || ""]) &&
                      !Boolean(
                        messData?.[group || ""]?.["messages"]?.length
                      )) && (
                        <div
                          className="empty"
                          style={{
                            display: "flex",
                            width: "100%",
                            height: "fit-content",
                            justifyContent: "center",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <div className="h-[259px] justify-center w-full my-5 flex">
                            <Image
                              src={empty}
                              className="mb-3"
                              width={350}
                              height={259}
                              alt="No messages yet"
                            />
                          </div>

                          <div className="mt-2 mb-3">
                            <h2 className="text-[22px] text-[#666] text-center font-bold">
                              {Boolean(vote?.[group || ""])
                                ? "Hmm nobody is voting here..."
                                : "Hmm nobody is talking here..."}
                            </h2>
                            <span className="mt-2 text-[17px] text-[#999] flex w-full text-center">
                              {Boolean(
                                vote?.[group || ""]
                              ) ? `Click the button below to start a new vote for members, make basic or DAO changes using votes` : `Write something in text field down below and start
                              the conversation😊`}
                            </span>
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="chat-area-footer">
                    {Boolean(vote?.[group || ""]) ? (
                      <>
                        <div className="flex w-full justify-center items-center">
                          <Button
                            onClick={() => setVotes(true)}
                            className="!bg-[#5e43ec] !normal-case !rounded-[.5rem] !text-[#fff] !min-w-[45px] !w-fit !h-[45px] !font-[inherit] !p-[10px]"
                          >
                            Create New Vote
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        {Boolean(edit) && (
                          <div className="flex items-center py-[7px] w-full">
                            <IconButton
                              onClick={() => {
                                setEdit("");
                                setMessageText("");
                              }}
                              className="!mr-2 !w-[28px] !h-[28px]"
                              size={"small"}
                            >
                              <FiX
                                className={
                                  "!text-[rgba(0,0,0,0.5)] hover:!text-[rgba(0,0,0,0.5)]"
                                }
                                size={15}
                              />
                            </IconButton>

                            <div className="opacity-[.7] flex flex-col">
                              <span className="text-[14px]">
                                Editting message
                              </span>
                            </div>
                          </div>
                        )}

                        {Boolean(rContext?.sender) && (
                          <div className="flex justify-between items-center w-full">
                            <div className="py-[10px] opacity-[.7] flex flex-col">
                              <span className="font-bold text-[10px]">
                                {`Replying to ${
                                  rContext?.sender == address
                                    ? "self"
                                    : rContext?.sender
                                }`}
                              </span>
                              <span className="truncate text-[14px]">
                                {rContext?.content}
                              </span>
                            </div>

                            <div>
                              <FiX
                                size={24}
                                onClick={() => {
                                  rContext.update?.({
                                    content: undefined,
                                    sender: undefined,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {showEmoji && (
                          <EmojiPicker height={390} onEmojiClick={onEClick} />
                        )}
                        <div className="flex w-full items-center">
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
                                  paddingRight: "45px",
                                  marginRight: "12px",
                                  marginLeft: "4px",
                                  borderRadius: "16px",
                                  backgroundColor: "#e9e9e9",
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

                            <div className="flex absolute right-[6px] items-center">
                              <IconButton
                                onClick={() => setShowEmoji(!showEmoji)}
                                size={"small"}
                                sx={{
                                  background: showEmoji
                                    ? "rgba(0,0,0,0.1)"
                                    : "inherit",
                                }}
                                className={`!min-w-[34px]`}
                              >
                                <MdOutlineEmojiEmotions
                                  size={24}
                                  className="feather fill-[#727272] transition-all delay-[400] feather-smile"
                                />
                              </IconButton>

                              {/* <FiVideo size={24} className="feather transition-all delay-[400] feather-video" />
                  
              <FiImage size={24} className="feather transition-all delay-[400] feather-image" />

              <FiPlusCircle size={24} className="feather transition-all delay-[400] feather-plus-circle" />

              <FiPaperclip size={24} className="feather transition-all delay-[400] feather-paperclip" /> */}
                            </div>
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
                                emojiModal();

                                moveMessage(enlargen == 1);

                                setEnlargen(0);

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
                </div>
                <div className="detail-area mmst:hidden cusscroller">
                  <div className="detail-area-header">
                    <div className="msg-profile group">
                      <Image
                        src={groupImgCache[group || ""] || cicon.src}
                        width={groupImgCache[group || ""] ? 66 : 33}
                        height={groupImgCache[group || ""] ? 66 : 33}
                        alt={group}
                      />
                    </div>
                    <div className="detail-title capitalize">{`${group}`}</div>
                    <div className="detail-subtitle">
                      Created by {creator?.substring(0, 6)}...
                      {creator?.substring(38, 42)}
                    </div>
                  </div>
                  <div className="detail-changes">
                    <input type="text" placeholder="Search in Conversation" />
                    {/* <div className="detail-change">
                Change Color
                <div className="colors">
                  <div className="color blue selected" data-color="blue"></div>
                  <div className="color purple" data-color="purple"></div>
                  <div className="color green" data-color="green"></div>
                  <div className="color orange" data-color="orange"></div>
                </div>
              </div> */}
                    {/* <div className="detail-change">
                        Change Emoji
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="feather feather-thumbs-up"
                        >
                          <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
                        </svg>
                      </div> */}
                  </div>
                </div>
              </>
            }
          </div>
        </>
      )}
    </>
  );
};

export default Chats;
