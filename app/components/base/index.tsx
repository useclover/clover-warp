import Image from "next/image";
import { useEffect, useState, useContext, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import logo from "../../../public/images/logo.png";
import io from 'socket.io-client';
import Select from "react-select";
import { BsFolder, BsList, BsPlusLg, BsTrash } from "react-icons/bs";
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
import cicon from "../../../public/images/icon.png";
import { GenContext } from "../extras/contexts/genContext";
import {
  beginStorageProvider,
  lq,
  retrieveFiles,
  notifications,
} from "../extras/storage/init";
import {
  retrieveMessages,
  saveMessages,
  deleteMessages,
  deleteMessagesAll,
  findMessId,
  updateMessages,
  retrieveGroupChats,
  createGroupChat,
} from "../extras/chat/functions";
import { FaCloud } from "react-icons/fa";
import { CContext } from "../extras/contexts/CContext";
import Chatlist from "./sidebar/chatlist";
import Loader from "../loader";
import { useAccount } from "wagmi";
import { BiSend, BiX } from "react-icons/bi";
import EmojiPicker from "emoji-picker-react";
import { GroupChatType, MessageType } from "../types";

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

let socket: any;

const Base = ({ children }: { children: JSX.Element[] | JSX.Element }) => {
  const [loginData, setLoginData] = useState<any>({});

  const router = useRouter();

  const pathname = router.pathname.split("/");

  const { address, isConnected } = useAccount();

  useEffect(() => {
    document
      .querySelectorAll("textArea, .emoji-scroll-wrapper")
      .forEach((e) => {
        e.classList.add("cusscroller");
      });

    if (localStorage.getItem("cloverlog") === null) {
      router.push("/");
    } else {
      const data = JSON.parse(localStorage.getItem("cloverlog") || "{}");

      setLoginData(data);
    }
  }, []);

  const { name, contract, data: main, participants, creator } = loginData;

  const [currentDir, setCurrentDir] = useState<string[]>(["main"]);

  /* upload */
  const uploadData = useContext(GenContext);

  const [update, setUpdate] = useState<boolean>(false);

  const [isLoading, setLoader] = useState(true);

  const [nname, setNname] = useState<string>("");

  const [disparts, setDisparts] = useState<(string | undefined)[]>([]);

  const [toggle, setToggle] = useState<string | number>("0");

  const [discussions, setDiscussion] = useState<string>("");

  const [voteDesc, setVoteDesc] = useState<string>("");

  const [sidebar, setSidebar] = useState<boolean>(false);

  const [failMessage, setFailMessage] = useState<string>("");


  const [filelist, setFilelist] = useState<number | undefined>();

  const rContext = useContext(CContext);

  const { group, groupData: groupChat, messages: messData } = rContext;

  const updateMessData = (data: MessageType) => {
    rContext.update?.({
      messages: data,
    });
  };

  const setGroupChat = (data: GroupChatType) =>
    rContext.update?.({
      groupData: data,
    });

  const ranOnce = useRef<boolean>(false);

  const initSocket = async () => {

      await fetch(`/api/groups?lq=${main}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("clover-x")}`,
        }
      });

      socket = io();
  
      socket.on("connect", () => {
        console.log("connected successfully");
      });

      const update = async (data: any) => {

        if (data.error) {
          return;
        }

        const gc = await retrieveGroupChats(data);

        setGroupChat(gc);

      };

      socket.on("add_grp", update);

  }

  useEffect(() => {
      if (!ranOnce.current && main) {

        ranOnce.current = true;

        initSocket();
        
      }
  }, [main]);


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

      const rgroups = await retrieveGroupChats();

      setGroupChat(rgroups);  

      rgroups.forEach(({ name: gname, groupKeys }: any) => {
        if (gname == name) {

          rContext.update?.({
            chatkeys: groupKeys,
          });
        
        }
      });

      let tSize = 0;

      flist.forEach((e: any) => {
        tSize += e.size;
      });

      setFilelist(tSize / 1_073_741_824);

      if (!Boolean(mess[name]?.["messages"])) {
        if (mess[name] === undefined) mess[name] = {};

        mess[name]["messages"] = {};

      }


      if (group === undefined) {
        rContext.update?.({ group: name });
      }

      updateMessData(mess);

      setLoader(false);

      if (pathname[pathname.length - 1] == "dashboard") {
        document.querySelector(".msg.active")?.scrollIntoView();
      }
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
  ]);

  const route = async (path: string) => {
    if (pathname.includes(path)) return;

    setLoader(true);

    await router.push(`/dashboard/${path}`);

  };

  const [addNew, setAddNew] = useState<boolean>(false);

  return (
    <>
      {isLoading && <Loader />}

      {!isLoading && (
        <div className="app">
          
          <Modal open={addNew} onClose={() => setAddNew(false)}>
            <div className="w-screen overflow-y-scroll overflow-x-hidden absolute h-screen flex cusscroller items-center bg-[#ffffffb0]">
              <div className="2usm:px-0 mx-auto max-w-[900px] 2usm:w-full relative w-[85%] usm:m-auto min-w-[340px] px-6 my-8 items-center">
                <div className="rounded-lg bg-white shadow-lg shadow-[#cccccc]">
                  <div
                    className="border-b flex justify-be
                  tween py-[14px] px-[17px] text-xl font-bold"
                  >
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
                                              backgroundColor:
                                                "rgb(24, 144, 255)",
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
                                  if (messData?.[nname] !== undefined) {
                                      setFailMessage(
                                        "Discussion name already exists"
                                      );
                                      return;
                                  }

                                  await createGroupChat(nname);

                                  socket.emit("add_group");

                                  rContext.update?.({ group: nname });

                                  if (
                                    pathname[pathname.length - 1] != "dashboard"
                                  ) {
                                    await router.push("/dashboard");
                                  } else {
                                    setDisparts([]);

                                    setAddNew(false);

                                    setLoader(false);
                                  }

                                } catch (err: any) {
                                  setLoader(false);

                                  console.log(err);

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

                                    rContext.update?.({
                                      group: discussions,
                                    });

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
                  onClick={() => router.push('/logout')}
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
                className={`msg ${pathname.includes("rooms") ? "active" : ""}`}
                title="Meeting rooms"
                onClick={async () => route("rooms")}
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
                className={`msg ${
                  pathname.includes("storage") ? "active" : ""
                }`}
                onClick={async () => route("storage")}
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

              {groupChat?.map(({ name: gps, lastchat: clst, groupKeys }, i) => {
                
                return (
                  <Chatlist
                    key={i}
                    onClick={async () => {

                      rContext.update?.({
                        group: gps,
                        chatkeys: groupKeys,
                      });

                      if (pathname[pathname.length - 1] != "dashboard") {
                        setLoader(true);

                        await router.push("/dashboard");
                      }
                    }}
                    time={clst !== undefined ? clst["date"] : undefined}
                    img={cicon.src}
                    selected={
                      pathname[pathname.length - 1] == "dashboard" &&
                      gps == group
                    }
                    iv={clst?.['iv']}
                    lastMsg={clst !== undefined ? clst["content"] : ""}
                    name={`${gps} ${!i ? "(Main)" : ""}`}
                  />
                );
              })}

              <div className="overlay"></div>
            </div>

            {children}
          </div>
        </div>
      )}
    </>
  );
};

export default Base;
