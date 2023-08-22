import Link from "next/link";
import { FiTrash2, FiX } from "react-icons/fi";
import { useHuddle01 } from "@huddle01/react";
import {
  LinearProgress,
  Button,
  IconButton,
  TextField,
  Popper,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  FormControl,
  Modal,
  Avatar,
  AvatarGroup,
} from "@mui/material";
import Router from "next/router";
import Image from "next/image";
import empty from "../../../public/images/empty.png";
import { FaRegFolderOpen, FaPlus, FaTrash, FaRegClock } from "react-icons/fa";
import {
  BsArrowRight,
  BsArrowRightCircle,
  BsArrowRightSquare,
  BsChatText,
  BsChatTextFill,
  BsCloudy,
  BsGrid3X3Gap,
  BsList,
  BsPeople,
  BsPinAngle,
  BsPlusLg,
} from "react-icons/bs";
import { TbSearch } from "react-icons/tb";

import FolderDes from "../../components/designs/folder";
import FileDes from "../../components/designs/file";
import { useContext, useState, useEffect } from "react";
import { GenContext } from "../../components/extras/contexts/genContext";
import { makeStorageClient } from "../../components/extras/storage/utoken";
import { store } from "../types";
import Loader from "../../components/loader";
import {
  lq,
  beginStorageProvider,
  createRoom,
  getRooms,
} from "../extras/storage/init";
import { logout } from "../../components/extras/logout";
import Dash from "../dash";
import { useAccount } from "wagmi";
import { MdClose, MdLink, MdMeetingRoom } from "react-icons/md";
import { RandomAvatar } from "react-random-avatars";

const Rooms = () => {
  const { address, isConnected } = useAccount();

  const [nname, setNname] = useState<string>("");
  const [desc, setDesc] = useState<string>("");

  const [failMessage, setFailMessage] = useState<string>("");

  /* upload */
  const uploadData = useContext(GenContext);

  const [loginData, setLoginData] = useState<{
    name: string;
    contract: string;
    data: string;
    participants: any;
  }>();

  const { initialize, isInitialized } = useHuddle01();

  useEffect(() => {
    if (localStorage.getItem("cloverlog") === null) {
      Router.push("/");
    } else {
      setLoginData(JSON.parse(localStorage.getItem("cloverlog") || "{}"));
    }
  }, []);

  useEffect(() => {
    if (!isInitialized)
      initialize(process.env.NEXT_PUBLIC_HUDDLE_PROJECTID || "");
  }, [isInitialized, initialize]);

  const dirContent =
    uploadData.fileList !== undefined ? uploadData.fileList : [];

  const { success, error, loading, updateSuccess, updateLoading, errUpdate } =
    uploadData;

  const [roomContent, setRoomContent] = useState<any[]>([]);

  const [addNew, setAddNew] = useState<boolean>(false);

  const [update, setUpdate] = useState<boolean>(false);

  const [isLoading, setLoader] = useState(true);

  const { name, contract, data, participants } = loginData || {
    name: "",
    contract: "",
    data: "",
    participants: {},
  };

  useEffect(() => {
    async function init() {
      await beginStorageProvider({
        user: address || "",
        contract,
        randId: data || "",
        participants,
      });

      setRoomContent(await getRooms());

      setLoader(false);
    }

    if (name != "") {
      init();
    }
  }, [data, update, address, contract, name]);

  const [open, setOpen] = useState(false);
  const [showStorage, setShowStorage] = useState(true);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return !isLoading ? (
    <>
      <Dash />

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
        aria-labelledby="Add a new meeting room"
        aria-describedby="Add room to DAO"
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
                  Create New Room
                </h2>
                <span className="text-[rgb(69,70,73)] font-[500] text-[14px]">
                  Rooms enable DAOs hold meetings and discussions
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
                  <div className="my-3">
                    <TextField
                      fullWidth
                      id="outlined-basic"
                      label="Room name"
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

                  <div className="my-3">
                    <TextField
                      fullWidth
                      id="outlined-basic"
                      label="Room description"
                      variant="outlined"
                      placeholder="Enter a short description of the room"
                      value={desc}
                      multiline
                      helperText={"Not required"}
                      rows={4}
                      onChange={(
                        e: React.ChangeEvent<
                          HTMLInputElement | HTMLTextAreaElement
                        >
                      ) => {
                        setDesc(e.target.value);
                        setFailMessage("");
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
                onClick={async () => {
                  if (nname.length) {
                    setLoader(true);

                    try {
                      const create = await createRoom(nname, desc);

                      setAddNew(false);

                      window.location.href = create;

                      // Router.push(`/dashboard/rooms/${create}`);
                    } catch (err: any) {
                      setLoader(false);

                      setFailMessage(
                        "Something went wrong, please try again later"
                      );
                    }
                  } else {
                    setLoader(false);
                    setFailMessage("Name of channel is required");
                  }
                }}
                className="!py-2 !font-bold !px-3 !capitalize !flex !items-center !text-white !fill-white !bg-[#5e43ec] !border !border-solid !border-[rgb(94,67,236)] !transition-all !delay-500 hover:!text-[#f0f0f0] !rounded-lg"
              >
                <MdMeetingRoom
                  color={"inherit"}
                  className={"mr-2 !fill-white"}
                  size={20}
                />{" "}
                Create
              </Button>
            </div>
          </div>
        </Box>
      </Modal>

      <div className="w-full flex items-start justify-between filedrop min-h-screen">
        <Button
          onClick={() => setAddNew(true)}
          className="!py-2 !mr-4 !flex !fixed !right-[15px] !bottom-[20px] !cursor-pointer !justify-center !z-[90] !items-center !px-4 !bg-[#5e43ec] !text-white !border-solid !border-white !border-[2px] !w-[64px] !h-[64px] !rounded-[50%] overflow-hidden hover:bg-[#0c75d6] font-[300]"
        >
          <BsPlusLg size={25} />
        </Button>

        <div className="w-full st:!pl-0 pb-[65px] transition-all delay-500 h-full flex flex-col cusscroller overflow-y-scroll st:pb-[120px] overflow-x-hidden">

          {/* <div className="my-2">
                <ToggleButtonGroup
                  value={tagValue}
                  className="cusscroller"
                  sx={{
                    width: "100%",
                    padding: "0px 10px",
                    "& .Mui-selected": {
                      backgroundColor: `#5e43ec !important`,
                      color: `#fff !important`,
                    },
                    "& .MuiToggleButtonGroup-grouped": {
                      borderRadius: "4rem !important",
                      minWidth: 55,
                      fontFamily: "Poppins, sans-serif",
                      paddingTop: "4px",
                      margin: "0px 10px",
                      paddingBottom: "4px",
                      border: "1px solid rgba(0, 0, 0, 0.12) !important",
                    },
                  }}
                  exclusive
                  onChange={(e: any) => {
                    setTagValue(e.target.value);
                  }}
                >
                  <ToggleButton
                    sx={{
                      textTransform: "capitalize",
                      fontWeight: "500",
                    }}
                    value="drive"
                  >
                    Drive
                  </ToggleButton>
                  <ToggleButton
                    sx={{
                      textTransform: "capitalize",
                      fontWeight: "500",
                    }}
                    value="pinned"
                  >
                    Pinned
                  </ToggleButton>
                  <ToggleButton
                    sx={{
                      textTransform: "capitalize",
                      fontWeight: "500",
                    }}
                    value="shared"
                  >
                    Shared with us
                  </ToggleButton>
                  <ToggleButton
                    sx={{
                      textTransform: "capitalize",
                      fontWeight: "500",
                    }}
                    value="trash"
                  >
                    Trash
                  </ToggleButton>
                </ToggleButtonGroup>
              </div> */}

          <div className="px-5 pt-[10px] h-fit">
            <div className="px-1">
              {!Boolean(roomContent.length) && !isLoading && (
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
                      alt="No rooms yet"
                    />
                  </div>

                  <div className="mt-2 mb-3">
                    <h2 className="text-[22px] text-center font-bold">
                      No rooms yet
                    </h2>
                    <span className="mt-2 text-[17px] flex w-full text-center">
                      click the `{<FaPlus size={17} />}` button to add one
                    </span>
                  </div>
                </div>
              )}

              {Boolean(roomContent.length) && (
                <div
                  style={{
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(300px, 1fr))",
                  }}
                  className="pt-7 grid gap-2 grid-flow-dense"
                >
                  {roomContent.map((attributes: any, i: number) => {
                    const {
                      name,
                      user,
                      creator: owner,
                      id,
                      active,
                    } = attributes;

                    const activeParticipants = JSON.parse(active || "[]");

                    return (
                      <div
                        key={i}
                        className="w-full border border-[rgb(94,67,236)] rounded-lg border-solid p-5 flex flex-col justify-between min-h-[200px] min-w-[300px]"
                      >
                        <div>
                          <div className="mb-5 flex items-center">
                            <RandomAvatar name={owner} size={40} />
                            <div className="ml-3">
                              <h3 className="text-[15px] leading-[20px] font-[500] text-[#121212] mb-[2px]">
                                {user["name"]
                                  ? user["name"]
                                  : `${owner.substring(0, 6)}...
                                      ${owner.substring(38, 42)}`}
                              </h3>
                              <span className="block text-[12px] leading-[1.2] truncate w-full text-[#575757]">
                                Host/Organiser
                              </span>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-[500] text-[16px] font-[inherit]">
                              {name}
                            </h4>
                            <span className="block text-[12px] leading-[1.2] truncate w-full text-[rgb(87,87,87)]">
                              {Object.keys(activeParticipants).length
                                ? `${Object.keys(activeParticipants).length} participants`
                                : "No participants yet"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          
                              <Button
                                onClick={() =>
                                  (window.location.href = `/dashboard/rooms/${id}`)
                                }
                                className="!py-2 !font-bold !px-3 !capitalize !flex !items-center !text-[#5e43ec] -left-3 !bg-white !border !border-solid !border-transparent hover:!border-[#5e43ec] !transition-all !duration-500 !rounded-lg"
                              >
                                <span className="mr-2 font-[400]">
                                  Join Meeting
                                </span>
                                <BsArrowRightCircle size={20} />
                              </Button>

                          <AvatarGroup
                            max={3}
                            sx={{
                              "& .MuiAvatar-circular": {
                                width: "33px",
                                fontSize: "13px",
                                height: "33px",
                              },
                            }}
                            className="!flex !items-center !justify-center mx-2"
                          >
                            {Object.keys(activeParticipants).map(
                              (addr: string, ii: number) => (
                                <div
                                  key={ii}
                                  className="border-solid border-white border-[2px] rounded-[50%] -mr-[6px]"
                                >
                                  <RandomAvatar size={33} name={addr} />
                                </div>
                              )
                            )}
                          </AvatarGroup>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  ) : (
    <Loader />
  );
};

export default Rooms;
