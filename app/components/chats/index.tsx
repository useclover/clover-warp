import Image from "next/image";
import { useEffect, useState, useContext, useRef } from "react";
import Router from "next/router";
import { BsFolder, BsList, BsTrash } from "react-icons/bs";
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
import { MdOutlineEmojiEmotions } from "react-icons/md";
import {
  LinearProgress,
  TextField,
  IconButton,
  Button,
  Modal,
  Box,
  Tab,
  CircularProgress,
} from "@mui/material";
import empty from "../../../public/images/empty.png";
import cicon from "../../../public/images/icon.png";
import { GenContext } from "../extras/contexts/genContext";
import {
  beginStorageProvider,
  lq,
  retrieveMessages,
  saveMessages,
  notifications,
  deleteMessages,
  deleteMessagesAll,
  findMessId,
  updateMessages,
} from "../extras/storage/init";
import { CContext } from "../extras/contexts/CContext";
import Text from "./texts";
import Loader from "../loader";
import { useAccount } from "wagmi";
import { BiSend, BiX } from "react-icons/bi";
import EmojiPicker from "emoji-picker-react";



const Chats = () => {

  const [loginData, setLoginData] = useState<any>({});

  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (localStorage.getItem("cloverlog") === null) {
      Router.push("/");
    } else {
      const data = JSON.parse(localStorage.getItem("cloverlog") || "{}");

      setLoginData(data);
    }

  }, []);

  const { name, contract, data: main, participants, creator } = loginData;

  const emojiModal = () => {
      const emojiElem = document.querySelector('.EmojiPickerReact') as HTMLDivElement;

      const inputElem = document.querySelector(".textbox") as HTMLDivElement;

      if (emojiElem == null) return;
    
      if (inputElem == null) return;

      const hx = inputElem.clientHeight + 13;

      emojiElem.style.bottom = `${hx}px`;

      emojiElem.style.height = `${emojiElem.clientHeight - (58 - hx)}px`

  }
  
  document.querySelectorAll("textArea, .emoji-scroll-wrapper").forEach((e) => {
    e.classList.add("cusscroller");
  });

  const [showEmoji, setShowEmoji] = useState(false);

  const [messageText, setMessageText] = useState("");

  const [chDate, setChDate] = useState<string>('');

  const [edit, setEdit] = useState<string>('');

  const rContext = useContext(CContext);

  const { group } = rContext;

  const [currentDir, setCurrentDir] = useState<string[]>(["main"]);

  /* upload */
  const uploadData = useContext(GenContext);

  const [update, setUpdate] = useState<boolean>(false);

  const [isLoading, setLoader] = useState(true);

  const [prevMessLoading, setPrevMessLoading] = useState<boolean>(false);

  const [preloadMess, setPreloadMess] = useState<boolean>(true);

  const [editableMess, setEditableMess] = useState<boolean>(true);

  const [delMessageMe, setDelMessageMe] = useState<boolean>(false);

  const [delMessageEvryone, setDelMessageEvryone] = useState<boolean>(false);

  const [extrasId, setExtras] = useState<string>("");

  const onceUpdate = useRef<boolean>(false);

  const [beginChecks, setBegin] = useState<boolean>(false);

  const [messData, updateMessData] = useState<{
    [index: string]: { [index: string]: any[] };
  }>({});


  useEffect(() => {

    async function init() {

      setChDate("");

      await beginStorageProvider({
        user: address || "",
        contract,
        randId: main,
        participants,
      });

      const mess = await retrieveMessages();

      if (!Boolean(mess[name]?.["messages"])) {
        if (mess[name] === undefined) mess[name] = {};

        mess[name]["messages"] = {};

      }

      if (group === undefined) {
        rContext.update?.({ group: name });
      }

      updateMessData(mess);

      setBegin(true);

      setLoader(false);
    
    }

    if (name != undefined) {
      init();
    }
  }, [
    main,
    currentDir,
    uploadData,
    update,
    contract,
    name,
    address,
    participants,
    group,
    rContext
  ]);


  useEffect(() => {
    if (!onceUpdate.current && beginChecks) {
      
      onceUpdate.current = true;

      const upd = async () => {
        const mess = await retrieveMessages();

        if (!Boolean(mess[name]?.["messages"])) {
          if (mess[name] === undefined) mess[name] = {};

          mess[name]["messages"] = {};
        }


        updateMessData(mess);

        setTimeout(() => upd(), 3000);
        
      }
      

      upd();


    }
  }, [beginChecks]);

  const [enlargen, setEnlargen] = useState<number>(0);

  const moveMessage = async (
    enlargen: boolean,
    type: "mess" | "vote" = "mess"
  ) => {

    if (messageText.length) {

      if (Boolean(edit)) {

       const { content } = findMessId(
         messData[group || ""]["messages"],
         extrasId
       );

        content[0][0] = messageText;

        setEdit("");

        await updateMessages(extrasId, { content });

        return;
      }

      if (!Boolean(messData[group || ""]?.["messages"][0])) {
        messData[group || ""] = {
          messages: [[]]
        }       
      }

      const newMess: any = {
        content: [[messageText]],
        isSending: true,
        sent: false,
        type,
        server: false,
        enlargen,
        sender: address,
        date: new Date().getTime(),
      };

      if (rContext?.sender !== undefined) {
        newMess["reply"] = rContext.sender;
        newMess["content"][0].push(rContext.content || "");
      }


      messData[group || ""]["messages"][0].push(newMess);


      try {

        // const serverData = { ...messData };

        // serverData[group || ""]["messages"][index]["server"] = true;

        notifications({
          title: `Message from ${address}`,
          message: messageText,
          receivers: lq[2],
          exclude: address || "",
        });

        await saveMessages({data: JSON.stringify(newMess), receiver: group || ""});

        // messData[group || ""]["messages"][0][index].sent = true;

        updateMessData(messData);

        const chatArea = document.querySelector(".chat-area");

        if (chatArea !== null) {
          chatArea.scrollTop = chatArea.scrollHeight;
        }

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
         const status = await deleteMessagesAll(extrasId);
      }
  }

  const deleteMessageEvryone = async () => {
      if (extrasId) {
         const status = await deleteMessages(extrasId);
      }
  };

  return (
    <>
      {isLoading && <Loader />}

      {!isLoading && (
        <>
          <Modal open={conDelete} onClose={() => setConDelete(false)}>
            <div className="w-screen overflow-y-scroll overflow-x-hidden absolute h-screen flex items-center bg-[#ffffffb0]">
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

          <div className="wrapper w-full flex flex-grow-[1] overflow-hidden">
            {
              <>
                <div
                  onScroll={async (e: any) => {
                    const label = document.querySelectorAll(".dateSeperate");

                    label.forEach((element) => {
                      const elem = element as HTMLDivElement;

                      if (elem.offsetTop - 70 < e.target.scrollTop) {
                        setChDate(elem.innerText);
                      }
                    });

                    if (e.target.scrollTop <= 20 && preloadMess) {
                      if (prevMessLoading) return;

                      setPrevMessLoading(true);

                      const dataMess = await retrieveMessages(
                        messData[group || ""]?.["messages"]?.length || 0,
                      );

                      if (Object.values(dataMess).length) {
                        messData[group || ""]["messages"].push(dataMess);

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
                            onClick={() => {
                              const { content } = findMessId(
                                messData[group || ""]["messages"],
                                extrasId
                              );

                              if (!content?.[0]?.[0]) return;

                              setEdit(content[0][0]);

                              setMessageText(content[0][0]);
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
                      <div className="text-[#1890FF] flex items-center justify-center py-2">
                        <CircularProgress size={18} color={"inherit"} />
                      </div>
                    )}

                    {Boolean(messData[group || ""]?.["messages"]?.length) && (
                      <>
                        {messData[group || ""]["messages"]
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
                                  server,
                                  sent,
                                  enlargen,
                                }: any,
                                i: number
                              ) => {
                                let addNumb = false;

                                const mess =
                                  messData[group || ""]["messages"][ii][i - 1];

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
                                      selected={extrasId == messId}
                                      setExtras={setExtras}
                                      setEditable={setEditableMess}
                                      messId={messId}
                                      content={content}
                                      sent={server || sent}
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
                    {!Boolean(messData[group || ""]?.["messages"]?.length) && (
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
                            Hmm nobody is talking here...
                          </h2>
                          <span className="mt-2 text-[17px] text-[#999] flex w-full text-center">
                            Write something in text field down below and start
                            the conversation😊
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="chat-area-footer">
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
                          <span className="text-[14px]">Editting message</span>
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
                          className="!bg-[#1890FF] !ml-3  !normal-case !rounded-[50%] !max-w-[45px] !min-w-[45px] !w-[45px] !h-[45px] !font-[inherit] !p-[10px]"
                        >
                          <BiSend className={"!text-[#fff]"} size={20} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="detail-area mmst:hidden cusscroller">
                  <div className="detail-area-header">
                    <div className="msg-profile group">
                      <Image
                        src={cicon.src}
                        width={66}
                        height={66}
                        alt={group}
                      />
                    </div>
                    <div className="detail-title capitalize">{`${group}`}</div>
                    <div className="detail-subtitle">
                      Created by {creator.substring(0, 6)}...
                      {creator.substring(38, 42)}
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
