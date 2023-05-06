import Image from "next/image";
import { useEffect, useState, useContext, useRef } from "react";
import Link from "next/link";
import Router from "next/router";
import logo from "../../../public/images/logo.png";
import axios from "axios";
import Select from "react-select";
import { BsFolder, BsList, BsPlusLg, BsTrash } from "react-icons/bs";
import { AiOutlineEdit } from "react-icons/ai";
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
import Storage from "../storage";
import { MdMeetingRoom, MdOutlineEmojiEmotions } from "react-icons/md";
import {
  LinearProgress,
  TextField,
  IconButton,
  Button,
  Modal,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  Box,
  Tab,
  CircularProgress,
} from "@mui/material";
import { logout } from "../extras/logout";
import empty from "../../../public/images/empty.png";
import cicon from "../../../public/images/icon.png";
import { GenContext } from "../extras/contexts/genContext";
import {
  beginStorageProvider,
  lq,
  retrieveFiles,
  retrieveMessages,
  saveMessages,
  notifications,
  deleteMessages,
  deleteMessagesAll,
  findMessId,
  updateMessages,
} from "../extras/storage/init";
import { FaCloud } from "react-icons/fa";
import { CContext } from "../extras/contexts/CContext";
import Text from "./texts";
import Chatlist from "./sidebar/chatlist";
import Loader from "../loader";
import { useAccount } from "wagmi";
import Rooms from "../../../app/components/video";
import { BiSend, BiX } from "react-icons/bi";
import EmojiPicker from "emoji-picker-react";


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  className?: string;
  padding?: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, padding, value, index, className = "", ...other } = props;

  const pc = {
    p: padding,
    py: padding !== undefined ? undefined : 2,
  };

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box className={className} sx={pc}>
          {children}
        </Box>
      )}
    </div>
  );
};


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

  const [group, setGroup] = useState<any>();

  const [currentDir, setCurrentDir] = useState<string[]>(["main"]);

  /* upload */
  const uploadData = useContext(GenContext);

  const [update, setUpdate] = useState<boolean>(false);

  const [isLoading, setLoader] = useState(true);

  const [nname, setNname] = useState<string>("");

  const [disparts, setDisparts] = useState<(string | undefined)[]>([]);

  const [prevMessLoading, setPrevMessLoading] = useState<boolean>(false);

  const [preloadMess, setPreloadMess] = useState<boolean>(true);

  const [editableMess, setEditableMess] = useState<boolean>(true);

  const [toggle, setToggle] = useState<string | number>('0');

  const [delMessageMe, setDelMessageMe] = useState<boolean>(false);

  const [delMessageEvryone, setDelMessageEvryone] = useState<boolean>(false);

  const [discussions, setDiscussion] = useState<string>('');

  const [voteDesc, setVoteDesc] = useState<string>('');

  const [sidebar, setSidebar] = useState<boolean>(false);

  const [failMessage, setFailMessage] = useState<string>("");

  const [extrasId, setExtras] = useState<string>("");

  const onceUpdate = useRef<boolean>(false);

  const [beginChecks, setBegin] = useState<boolean>(false);

  const [messData, updateMessData] = useState<{
    [index: string]: { participants: any[]; messages: any[] };
  }>({
    current: {
      messages: [
        {
          content: [["This is a test"]],
          isSending: false,
          sender: "address",
          read: false,
          date: new Date().getTime(),
        },
      ],
      participants: [],
    },
  });

  const [filelist, setFilelist] = useState<number | undefined>()

  const chatlst = Object.keys(messData);

  useEffect(() => {
    async function init() {
      await beginStorageProvider({
        user: address || "",
        contract,
        randId: main,
        participants,
      });

      const mess = await retrieveMessages();

      const flist = await retrieveFiles();

      let tSize = 0;

      flist.forEach((e: any) => {
          tSize += e.size;
      });

      setFilelist(tSize / 1_073_741_824);

      if (!Boolean(mess[name]?.["messages"])) {

        if(mess[name] === undefined) mess[name] = {}; 


         mess[name]["messages"] = {};

      }

      if (group === undefined) {
        setGroup(name);
      }

      updateMessData(mess);

      setBegin(true);

      setLoader(false);
    }

    if (name != undefined) {
      init();
    }

    

  }, [main, currentDir, uploadData, update, contract, name, address, participants, group]);

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

  const rContext = useContext(CContext);

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

      if (messData[group || ""]["messages"][0] === undefined) {
        messData[group || ""]["messages"][0] = [];
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

      updateMessData(messData);

      const chatArea = document.querySelector(".chat-area");

      if (chatArea !== null) {
        chatArea.scrollTop = chatArea.scrollHeight;
      }

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

      } catch (err) {
        console.log(err);
      }
    }
  };

  const onEClick = (eObject: any, event: any) => {

    setEnlargen(enlargen + 1);
    setMessageText(messageText + eObject.emoji);

  };

  const [addNew, setAddNew] = useState<boolean>(false);

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
        <div className="app">
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
                          : "Are you sur you want to delete message?"}
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

          <Modal open={addNew} onClose={() => setAddNew(false)}>
            <div className="w-screen overflow-y-scroll overflow-x-hidden absolute h-screen flex items-center bg-[#ffffffb0]">
              <div className="2usm:px-0 mx-auto max-w-[900px] 2usm:w-full relative w-[85%] usm:m-auto min-w-[340px] px-6 my-8 items-center">
                <div className="rounded-lg bg-white shadow-lg shadow-[#cccccc]">
                  <div className="border-b flex justify-between py-[14px] px-[17px] text-xl font-bold">
                    Create New
                    <FiX
                      size={20}
                      className="cursor-pointer"
                      onClick={() => setAddNew(false)}
                    />
                  </div>
                  <div className="form relative">
                    <Box sx={{ width: "100%" }}>
                      {Boolean(failMessage.length) && (
                        <div className="rounded-md w-[95%] font-bold mt-2 mx-auto p-3 bg-[#ff8f33] text-white">
                          {failMessage}
                        </div>
                      )}

                      <FormControl
                        fullWidth
                        sx={{
                          px: 5,
                          py: 3,
                        }}
                      >
                        <div>
                          <ToggleButtonGroup
                            value={toggle}
                            className="cusscroller"
                            sx={{
                              width: "100%",
                              padding: "0px 10px",
                              margin: "10px 0px 20px",
                              "& .Mui-selected": {
                                backgroundColor: `#1890FF !important`,
                                color: `#fff !important`,
                              },
                              "& .MuiToggleButtonGroup-grouped": {
                                borderRadius: "4rem !important",
                                minWidth: 55,
                                fontFamily: "Poppins, sans-serif",
                                paddingTop: "4px",
                                margin: "0px 10px",
                                paddingBottom: "4px",
                                border:
                                  "1px solid rgba(0, 0, 0, 0.12) !important",
                              },
                            }}
                            exclusive
                            onChange={(e: any) => {
                              if (e.target.value != "2") {
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
                              Discussion Channel
                            </ToggleButton>
                            <ToggleButton
                              sx={{
                                textTransform: "capitalize",
                                fontWeight: "500",
                              }}
                              value={"1"}
                            >
                              A new voting campaign
                            </ToggleButton>
                            {contract.toLowerCase() ==
                              "0xacdfc5338390ce4ec5ad61e3dc255c9f2560d797" && (
                              <ToggleButton
                                sx={{
                                  textTransform: "capitalize",
                                  fontWeight: "500",
                                }}
                                value={"2"}
                              >
                                A New Participant
                              </ToggleButton>
                            )}
                          </ToggleButtonGroup>
                        </div>

                        <TabPanel padding={0} value={Number(toggle)} index={0}>
                          <div>
                            <TextField
                              fullWidth
                              id="outlined-basic"
                              label="Name of discussion channel"
                              variant="outlined"
                              value={nname}
                              onChange={(
                                e: React.ChangeEvent<
                                  HTMLInputElement | HTMLTextAreaElement
                                >
                              ) => {
                                setNname(e.target.value);
                                setFailMessage("");
                              }}
                            />
                          </div>

                          <div className="mt-4">
                            <label className="text-[#808080] mb-2 block">
                              Add members, click on registered members to add
                            </label>

                            <div className="flex w-full items-center cusscroller flex-nowrap overflow-y-hidden overflow-x-scroll">
                              {participants.map(
                                (v: string, i: number) =>
                                  v.toLowerCase() != address?.toLowerCase() && (
                                    <div
                                      onClick={() => {
                                        const selected = [...disparts];

                                        if (selected[i] !== undefined) {
                                          selected[i] = undefined;

                                          setDisparts(selected);
                                        } else {
                                          selected[i] = v;

                                          setDisparts(selected);
                                        }
                                      }}
                                      style={
                                        disparts[i] !== undefined
                                          ? {
                                              color: "#fff",
                                              backgroundColor: "#1890FF",
                                            }
                                          : {}
                                      }
                                      className="truncate cursor-pointer rounded-[4rem] max-w-[200px] hover:max-w-[450px] py-1 px-[10px] font-[500] text-[#444444] delay-500 transition-all border border-solid border-[rgba(0,0,0,0.12)] mx-[3px]"
                                      key={i}
                                    >
                                      {v}
                                    </div>
                                  )
                              )}
                            </div>
                            <span className="text-[14px] block mt-1 text-[#b6b6b6]">
                              Not selecting any item, selects every item
                            </span>
                          </div>

                          <Button
                            variant="contained"
                            className="!bg-[#1891fe] !mt-4 !py-[13px] !font-medium !capitalize"
                            style={{
                              fontFamily: "inherit",
                            }}
                            onClick={async () => {
                              if (nname.length) {
                                setLoader(true);

                                try {
                                  const nMessData = { ...messData };

                                  nMessData[nname]["participants"] =
                                    disparts.filter((v) => v !== undefined);

                                  nMessData[nname]["messages"] = [];

                                  // await saveMessages(JSON.stringify(nMessData));

                                  updateMessData(nMessData);

                                  setGroup(nname);

                                  setDisparts([]);

                                  setAddNew(false);

                                  setLoader(false);
                                } catch (err: any) {
                                  setLoader(false);

                                  setFailMessage(
                                    "Something went wrong, please try again later"
                                  );
                                }
                              } else {
                                setFailMessage("Name of channel is required");
                              }
                            }}
                            fullWidth
                          >
                            Create
                          </Button>
                        </TabPanel>

                        <TabPanel padding={0} value={Number(toggle)} index={1}>
                          <div className="mb-4">
                            <TextField
                              fullWidth
                              id="outlined-basic"
                              label="Name"
                              variant="outlined"
                              value={nname}
                              onChange={(
                                e: React.ChangeEvent<
                                  HTMLInputElement | HTMLTextAreaElement
                                >
                              ) => {
                                setNname(e.target.value);
                                setFailMessage("");
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
                              options={Object.keys(messData)}
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
                                    borderBottomColor: `#1891fe !important`,
                                    boxShadow: "none",
                                  },
                                }),
                              }}
                              classNamePrefix="select"
                            />
                          </div>

                          <Button
                            variant="contained"
                            className="!bg-[#1891fe] !mt-4 !py-[13px] !font-medium !capitalize"
                            style={{
                              fontFamily: "inherit",
                            }}
                            onClick={async () => {
                              if (
                                nname.length &&
                                voteDesc.length &&
                                discussions.length
                              ) {
                                setLoader(true);

                                try {
                                  const nMessData = { ...messData };

                                  if (nMessData[discussions] !== undefined) {
                                    const newMess: any = {
                                      content: { name: nname, desc: voteDesc },
                                      sent: true,
                                      type: "vote",
                                      creator: address,
                                      expiry: new Date().getTime(),
                                    };

                                    nMessData[discussions]["messages"].push(
                                      newMess
                                    );

                                    await saveMessages({
                                      data: JSON.stringify(nMessData),
                                      receiver: discussions,
                                    });

                                    notifications({
                                      title: `Vote campaign created by ${String(
                                        address
                                      ).substring(0, 6)}...${String(
                                        address
                                      ).substring(38, 42)}`,
                                      message: voteDesc,
                                      receivers: nMessData[discussions][
                                        "participants"
                                      ].length
                                        ? nMessData[discussions]["participants"]
                                        : lq[2],
                                      exclude: address || "",
                                    });

                                    updateMessData(nMessData);

                                    setGroup(discussions);

                                    setDisparts([]);

                                    setAddNew(false);

                                    setLoader(false);
                                  } else {
                                    setLoader(false);

                                    setFailMessage(
                                      "Discussion channel not found"
                                    );
                                  }
                                } catch (err: any) {
                                  setLoader(false);

                                  setFailMessage(
                                    "Something went wrong, please try again later"
                                  );
                                }
                              } else {
                                setFailMessage(
                                  "Please all inputs are required"
                                );
                              }
                            }}
                            fullWidth
                          >
                            Create
                          </Button>
                        </TabPanel>
                      </FormControl>
                    </Box>
                  </div>
                </div>
              </div>
            </div>
          </Modal>

          <div className="header border-b-[#eef2f4] h-[80px] w-full border-b-solid border-b flex items-center py-0 px-5">
            <IconButton
              className="!hidden sst:!block"
              onClick={() => setSidebar(!sidebar)}
            >
              {sidebar ? (
                <BsList className="text-[#1890FF] cursor-pointer text-[30px]" />
              ) : (
                <BiX className="text-[#1890FF] cursor-pointer text-[30px]" />
              )}
            </IconButton>

            <div className="logo flex-shrink-0 text-[#1890FF]">
              <Link href="/">
                <a className="text-[#1890FF] cursor-pointer flex pl-4 items-center font-bold text-[18px]">
                  <Image src={logo} width={100} height={33.33} alt="clover" />
                </a>
              </Link>
            </div>
            <div className="search-bar h-[80px] z-[3] relative ml-[280px]">
              {/* <input type="text" placeholder="Search..." /> */}
            </div>
            <div className="user-settings flex items-center cursor-pointer flex-shrink-0 ml-auto">
              <div className="dark-light w-[22px] h-[22px] text-[#c1c7cd] flex-shrink-0">
                <FiMoon
                  className="w-full fill-transparent transition-all delay-500"
                  size={24}
                />
              </div>
              <div className="settings w-[22px] h-[22px] text-[#c1c7cd] flex-shrink-0">
                <FiSettings
                  className="w-full fill-transparent transition-all delay-500"
                  size={24}
                />
              </div>
              <div className="settings w-[22px] h-[22px] text-[#c1c7cd] flex-shrink-0">
                <FiLogOut
                  onClick={logout}
                  className="hover:stroke-[#ff5100] transition-all delay-[400]"
                  size={24}
                />
              </div>
            </div>
          </div>
          <div className="wrapper w-full flex flex-grow-[1] overflow-hidden">
            <div
              className={`conversation-area relative flex-col overflow-y-auto overflow-x-hidden w-[340px] flex-shrink-0 border-r-solid border-r border-r-[#eef2f4] cusscroller ${
                sidebar ? "!hidden" : "!flex"
              }`}
            >
              <div
                className={`msg`}
                title="Add More Discussions, voting, airdrop"
                onClick={() => setAddNew(true)}
              >
                <div className="w-[44px] min-w-[44px] flex items-center justify-center mr-[15px] rounded-[50%] bg-[#1890FF] h-[44px]">
                  <BsPlusLg size={19} color="#fff" />
                </div>
                <div className="msg-detail w-full">
                  <div className="msg-username">
                    Add New Channels/Participants
                  </div>
                  <div className="msg-content">
                    <span className="msg-message">
                      Add More Discussions, voting, airdrop
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`msg ${group === true ? "active" : ""}`}
                title="Meeting rooms"
                onClick={() => setGroup(true)}
              >
                <div className="w-[44px] min-w-[44px] flex items-center justify-center mr-[15px] rounded-[50%] bg-[#1890FF] h-[44px]">
                  <MdMeetingRoom size={19} color="#fff" />
                </div>
                <div className="msg-detail w-full">
                  <div className="msg-username">Meeting Rooms</div>
                  <div className="msg-content">
                    <span className="msg-message">
                      Rooms for conferences, meetings
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`msg ${Boolean(group) ? "" : "active"}`}
                onClick={() => {
                  setGroup("");
                }}
              >
                <div className="w-[44px] min-w-[44px] flex items-center justify-center mr-[15px] rounded-[50%] bg-[#1890FF] h-[44px]">
                  <FaCloud size={26} color="#fff" />
                </div>
                <div className="msg-detail w-full">
                  <div className="msg-username">DAO Storage</div>
                  <div className="msg-content">
                    <LinearProgress
                      variant="determinate"
                      sx={{
                        height: 6,
                        width: "100%",
                        borderRadius: "5rem",
                        backgroundColor: "#D9D9D9",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#1890FF",
                        },
                      }}
                      value={((filelist || 0) / 50) * 100}
                    />

                    <span className="msg-date font-bold text-[13px] min-w-fit ml-[3px]">
                      {filelist?.toFixed(2)}/50GB
                    </span>
                  </div>
                </div>
              </div>

              {chatlst.map((gps, i) => {
                const clst =
                  messData[gps]["messages"][
                    messData[gps]["messages"].length - 1
                  ];

                return (
                  <Chatlist
                    key={i}
                    onClick={() => {
                      setGroup(gps);

                      if (rContext.update !== undefined) {
                        rContext.update({
                          content: undefined,
                          sender: undefined,
                        });
                      }
                    }}
                    time={clst !== undefined ? clst["date"] : undefined}
                    img={cicon.src}
                    selected={gps == group}
                    lastMsg={clst !== undefined ? clst["content"] : ""}
                    name={`${gps} ${!i ? "(Main)" : ""}`}
                  />
                );
              })}

              <div className="overlay"></div>
            </div>

            {group == "" && <Storage />}

            {group === true && <Rooms />}

            {Boolean(group != "" && typeof group == "string") && (
              <>
                <div
                  onScroll={async (e: any) => {
                    const label = document.querySelectorAll(".dateSeperate");

                    label.forEach((element) => {
                      const elem = element as HTMLDivElement;

                      if (elem.offsetTop < e.target.scrollTop) {
                        setChDate(elem.innerText);
                      }
                    });

                    if (e.target.scrollTop <= 20 && preloadMess) {
                      if (prevMessLoading) return;

                      setPrevMessLoading(true);

                      const dataMess = await retrieveMessages(
                        messData[group]["messages"].length
                      );

                      if (Object.values(dataMess).length) {
                        messData[group]["messages"].push(dataMess);

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
                        className="chat-length"
                      >
                        {chDate}
                      </span>

                      <div
                        style={{
                          width: Boolean(extrasId) ? "77px" : "0px",
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

                    {Boolean(messData[group]["messages"].length) && (
                      <>
                        {messData[group]["messages"]
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
                                  messData[group]["messages"][ii][i - 1];

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
                    {!Boolean(messData[group]["messages"].length) && (
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
                              if (rContext.update !== undefined) {
                                rContext.update({
                                  content: undefined,
                                  sender: undefined,
                                });
                              }
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
                              backgroundColor: "#f3f3f3",
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
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Chats;
