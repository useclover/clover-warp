import Image from "next/image";
import { useEffect, useState, useContext, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import logo from "../../../public/images/logo.png";
import io from 'socket.io-client';
import Select from "react-select";
import { RiGroupFill } from "react-icons/ri";
import { BsFolder, BsList, BsPatchPlusFill, BsPlusLg, BsTrash } from "react-icons/bs";
import { AiOutlineUserAdd } from "react-icons/ai";
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
import { MdClose, MdMeetingRoom, MdOutlineEmojiEmotions } from "react-icons/md";
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
  groupImgCache,
  decryptCache,
} from "../extras/chat/functions";
import { FaCloud, FaVoteYea } from "react-icons/fa";
import { CContext } from "../extras/contexts/CContext";
import Chatlist from "./sidebar/chatlist";
import Loader from "../loader";
import { useAccount } from "wagmi";
import { BiSend, BiUser, BiX } from "react-icons/bi";
import EmojiPicker from "emoji-picker-react";
import { GroupChatType, MessageType, TextAPIData } from "../types";
import Cryptr from "cryptr";
import axios, { AxiosError } from "axios";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  className?: string;
  padding?: number;
}

 const sx = {
   "& .Mui-focused.MuiFormLabel-root": {
     color: "#5e43ec",
   },
   "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
     borderColor: `#5e43ec !important`,
   },
 };


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

  const routing = useRef<boolean>(false);

  const [alias, setAlias] = useState<string>('');

  const [aliasError, setAliasError] = useState<string>('')

  const [aliasLoading, setAliasLoading] = useState<boolean>(false);

  const [nameModal, setNameModal] = useState<boolean>(true);

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

      const { data: { user } } = await axios.get('/user', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('clover-x')}`
        }
      });

      if (user.name) setNameModal(false);

      localStorage.setItem('cloveruser', JSON.stringify(user));

      const mess = await retrieveMessages();

      const flist = await retrieveFiles();

      const rgroups = await retrieveGroupChats();

      setGroupChat(rgroups);  

      let tSize = 0;

      flist.forEach((e: any) => {
        tSize += e.size;
      });

      setFilelist(tSize / 1_073_741_824);

      if (!Boolean(mess[name]?.["messages"])) {
        if (mess[name] === undefined) mess[name] = {};

        mess[name]["messages"] = {};

      }

      if (pathname[pathname.length - 1] == "dashboard") {
        document.querySelector(".msg.active")?.scrollIntoView();
      }


      if (group === undefined) {
        rContext.update?.({ group: name });
      }

      updateMessData(mess);

      if (!routing.current) setLoader(false);
      
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

  
  useEffect(() => {

      if (groupChat !== undefined && groupChat.length > 0) {

      const store: any = {};

      for (let i = 0; i < groupChat.length; i++) {
        const { name: gname, groupKeys, key } = groupChat[i];

        if (!decryptCache?.[groupKeys]) {
          
          (async () => {
            const { data }: { data: TextAPIData } = await axios.get(
              "/api/text/decrypt",
              {
                params: {
                  text: groupKeys,
                  key,
                },
                baseURL: window.origin,
              }
            );

            store[gname] = data["result"];

            decryptCache[groupKeys] = data["result"] || "";

            rContext.update?.({
              chatkeys: { ...store },
            });
          })();
        } else {
          store[gname] = decryptCache[groupKeys];

          rContext.update?.({
            chatkeys: { ...store },
          });
        }
      
      }
    }

  }, [groupChat])

  const submitName = async () => {
      if (aliasLoading) return;

      setAliasLoading(true);

      if (!alias.length) { 
        setAliasError("Your name is required");
        setAliasLoading(false);
        return;
      }

      try {

      const { data: { user } } = await axios.patch('/user', { name: alias }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('clover-x')}`
        }
      });

      localStorage.setItem("cloveruser", JSON.stringify(user));

      setAliasLoading(false);

      setNameModal(false)
    
    }catch (err) {

        const error = err as any

        setAliasLoading(false)        

        setAliasError(error?.response?.data.message || "")

    }

  };

  const route = async (path: string) => {
    if (pathname.includes(path)) return;

    // window.location.href = `/dashboard/${path}`;

    await router.push(`/dashboard/${path}`);

  };

  const [addNew, setAddNew] = useState<boolean>(false);

  return (
    <>
      {isLoading && <Loader />}

      {!isLoading && (
        <div className="app">
          <Modal
            open={nameModal}
            sx={{
              "&& .MuiBackdrop-root": {
                backdropFilter: "blur(5px)",
                width: "calc(100% - 8px)",
              },
            }}
            onClose={() => false}
            className="overflow-y-scroll overflow-x-hidden cusscroller flex justify-center"
            aria-labelledby="Alias"
            aria-describedby="We need a username from user"
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
                        Add Username
                      </h2>
                      <span className="text-[rgb(69,70,73)] font-[500] text-[14px]">
                        Add in a username that would be unique to you
                      </span>
                    </div>
                  </div>

                  <div className="form relative pt-4">
                    <Box sx={{ width: "100%" }}>
                      {Boolean(aliasError.length) && (
                        <div className="rounded-md w-[95%] font-bold mt-2 mx-auto p-3 bg-[#ff8f33] text-white">
                          {aliasError}
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
                          <TextField
                            fullWidth
                            id="outlined-basic"
                            label="Name"
                            sx={sx}
                            variant="outlined"
                            helperText={
                              "Username can only contain alphanumeric characters"
                            }
                            value={alias}
                            onChange={(
                              e: React.ChangeEvent<
                                HTMLInputElement | HTMLTextAreaElement
                              >
                            ) => {
                              setAliasError("");
                              setAlias(e.target.value);
                            }}
                          />
                        </div>
                      </FormControl>
                    </Box>
                  </div>
                </div>

                <div className="bg-[#efefef] flex justify-center items-center rounded-b-[.9rem] px-6 py-4">
                  <div className="flex items-center">
                    <Button
                      onClick={submitName}
                      className="!py-2 !font-bold !px-3 !capitalize !flex !items-center !text-white !fill-white !bg-[#5e43ec] !border !border-solid !border-[rgb(94,67,236)] !transition-all !delay-500 hover:!text-[#f0f0f0] !rounded-lg"
                    >
                      {aliasLoading ? (
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
                        <>
                          <BiUser
                            color={"inherit"}
                            className={"mr-2 !fill-white"}
                            size={20}
                          />{" "}
                          Submit
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Box>
            </>
          </Modal>

          <Modal
            open={addNew}
            sx={{
              "&& .MuiBackdrop-root": {
                backdropFilter: "blur(5px)",
                width: "calc(100% - 8px)",
              },
            }}
            onClose={() => setAddNew(false)}
            className="overflow-y-scroll overflow-x-hidden cusscroller flex justify-center"
            aria-labelledby="Add New to your DAO on Clover"
            aria-describedby="Add New Participants, Discussions, Votes, and more to your DAO on Clover"
          >
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
                      Add New
                    </h2>
                    <span className="text-[rgb(69,70,73)] font-[500] text-[14px]">
                      Add New Participants, Discussions, Votes, and more to your
                      DAO on Clover
                    </span>
                  </div>

                  <IconButton size={"medium"} onClick={() => setAddNew(false)}>
                    <MdClose
                      size={20}
                      color={"rgb(32,33,36)"}
                      className="cursor-pointer"
                    />
                  </IconButton>
                </div>

                <div className="form relative pt-4">
                  <Box sx={{ width: "100%" }}>
                    {Boolean(failMessage.length) && (
                      <div className="rounded-md w-[95%] font-bold mt-2 mx-auto p-3 bg-[#ff8f33] text-white">
                        {failMessage}
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
                            if (
                              e.target.value &&
                              e.target.value != "2" &&
                              e.target.value != "1"
                            ) {
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
                            <RiGroupFill className="mr-2" size={20} />
                            Discussion Channel
                          </ToggleButton>
                          <ToggleButton
                            sx={{
                              textTransform: "capitalize",
                              fontWeight: "500",
                            }}
                            value={"1"}
                          >
                            <FaVoteYea className="mr-2" size={20} />A new voting
                            campaign
                          </ToggleButton>
                          {contract.toLowerCase() ==
                            "0x74367351f1A6809cED9Cc70654C6BF8c2d1913c9" && (
                            <ToggleButton
                              sx={{
                                textTransform: "capitalize",
                                fontWeight: "500",
                              }}
                              value={"2"}
                            >
                              <AiOutlineUserAdd className="mr-2" size={20} />A
                              New Participant
                            </ToggleButton>
                          )}
                        </ToggleButtonGroup>
                      </div>

                      <TabPanel padding={0} value={Number(toggle)} index={0}>
                        <div>
                          <TextField
                            fullWidth
                            sx={sx}
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
                      </TabPanel>

                      <TabPanel padding={0} value={Number(toggle)} index={1}>
                        <div className="mb-4">
                          <TextField
                            fullWidth
                            id="outlined-basic"
                            sx={sx}
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
                            sx={sx}
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
                        </div>
                      </TabPanel>
                    </FormControl>
                  </Box>
                </div>
              </div>

              <div className="bg-[#efefef] flex justify-center items-center rounded-b-[.9rem] px-6 py-4">
                <div className="flex items-center">
                  {(() => {
                    switch (Number(toggle)) {
                      case 0:
                        return (
                          <Button
                            onClick={async () => {
                              if (nname.length) {
                                setLoader(true);

                                try {
                                  if (messData?.[nname] !== undefined) {
                                    setFailMessage(
                                      "Discussion Name is not available"
                                    );
                                    return;
                                  }

                                  await createGroupChat(
                                    nname,
                                    [...disparts].filter(
                                      (v: string | undefined) => v !== undefined
                                    )
                                  );

                                  socket?.emit?.("add_group");

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
                            className="!py-2 !font-bold !px-3 !capitalize !flex !items-center !text-white !fill-white !bg-[#5e43ec] !border !border-solid !border-[rgb(94,67,236)] !transition-all !delay-500 hover:!text-[#f0f0f0] !rounded-lg"
                          >
                            <BsPatchPlusFill
                              color={"inherit"}
                              className={"mr-2 !fill-white"}
                              size={20}
                            />{" "}
                            Create
                          </Button>
                        );

                      case 1:
                        return (
                          <Button
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
                            className="!py-2 !font-bold !px-3 !capitalize !flex !items-center !text-white !fill-white !bg-[#5e43ec] !border !border-solid !border-[rgb(94,67,236)] !transition-all !delay-500 hover:!text-[#f0f0f0] !rounded-lg"
                          >
                            <BsPatchPlusFill
                              color={"inherit"}
                              className={"mr-2 !fill-white"}
                              size={20}
                            />{" "}
                            Create
                          </Button>
                        );
                    }
                  })()}
                </div>
              </div>
            </Box>
          </Modal>

          <div className="header border-b-[#eef2f4] h-[80px] w-full border-b-solid border-b flex items-center py-0 px-5">
            <IconButton
              className="!hidden sst:!block"
              onClick={() => setSidebar(!sidebar)}
            >
              {sidebar ? (
                <BsList className="text-[#5e43ec] cursor-pointer text-[30px]" />
              ) : (
                <BiX className="text-[#5e43ec] cursor-pointer text-[30px]" />
              )}
            </IconButton>

            <div className="logo flex-shrink-0 text-[#5e43ec]">
              <Link href="/">
                <a className="text-[#5e43ec] cursor-pointer flex pl-4 items-center font-bold text-[18px]">
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
                  onClick={() => router.push("/logout")}
                  className="hover:stroke-[#ff5100] transition-all delay-[400]"
                  size={24}
                />
              </div>
            </div>
          </div>
          <div className="wrapper w-full flex flex-grow-[1] overflow-hidden">
            <div
              className={`conversation-area relative flex-col overflow-y-auto overflow-x-hidden w-[340px] srt:!flex flex-shrink-0 border-r-solid border-r border-r-[#eef2f4] cusscroller ${
                sidebar ? "!hidden" : "!flex"
              }`}
            >
              <div
                className={`msg`}
                title="Add More Discussions, voting, airdrop"
                onClick={() => setAddNew(true)}
              >
                <div className="w-[44px] min-w-[44px] flex items-center justify-center mr-[15px] rounded-[50%] bg-[#5e43ec] h-[44px]">
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
                onClick={async () => await route("rooms")}
              >
                <div className="w-[44px] min-w-[44px] flex items-center justify-center mr-[15px] rounded-[50%] bg-[#5e43ec] h-[44px]">
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
                onClick={async () => await route("storage")}
              >
                <div className="w-[44px] min-w-[44px] flex items-center justify-center mr-[15px] rounded-[50%] bg-[#5e43ec] h-[44px]">
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
                          backgroundColor: "#5e43ec",
                        },
                      }}
                      value={((filelist || 0) / 50) * 100}
                    />

                    <span className="msg-date text-[13px] min-w-fit ml-[3px]">
                      {filelist?.toFixed(2)}/50Gb
                    </span>
                  </div>
                </div>
              </div>

              {groupChat?.map(
                ({ name: gps, lastchat: clst, groupKeys, key }, i) => {
                  // console.log(groupKeys, key)

                  return (
                    <Chatlist
                      key={i}
                      onClick={async () => {
                        rContext.update?.({
                          group: gps,
                        });

                        if (pathname[pathname.length - 1] != "dashboard") {
                          setLoader(true);

                          //  window.location.href = `/dashboard#${i}`;
                          router.push(`/dashboard#${i}`);
                        }
                      }}
                      time={clst !== undefined ? clst["date"] : undefined}
                      curTime={clst !== undefined ? clst["time"] : undefined}
                      img={groupImgCache[gps]}
                      selected={
                        pathname[pathname.length - 1] == "dashboard" &&
                        gps == group
                      }
                      iv={clst?.["iv"]}
                      lastMsg={clst !== undefined ? clst["content"][0] : ""}
                      name={`${gps} ${!i ? "(General)" : ""}`}
                      index={gps}
                    />
                  );
                }
              )}

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
