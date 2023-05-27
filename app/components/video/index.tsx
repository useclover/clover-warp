import Link from "next/link";
import { FiTrash2, FiX } from 'react-icons/fi';
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
} from "@mui/material";
import Router from "next/router";
import Image from "next/image";
import empty from "../../../public/images/empty.png";
import { FaRegFolderOpen, FaPlus, FaTrash, FaRegClock } from "react-icons/fa";
import {
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
import { store } from "../../components/extras/storage";
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

const Rooms = () => {

  const { address, isConnected } = useAccount();

    const [nname, setNname] = useState<string>("");
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

        if (!isInitialized) initialize(process.env.NEXT_PUBLIC_HUDDLE_PROJECTID || "");    

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

                  <div>
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

                            const create = await createRoom(nname);

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
                className="!py-2 !font-bold !px-3 !capitalize !flex !items-center !text-white !fill-white !bg-[#1891fe] !border !border-solid !border-[rgb(218,220,224)] !transition-all !delay-500 hover:!text-[#f0f0f0] !rounded-lg"
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
              className="!py-2 !mr-4 !flex !fixed !right-[15px] !bottom-[20px] !cursor-pointer !justify-center !z-[90] !items-center !px-4 !bg-[#1890FF] !text-white !border-solid !border-white !border-[2px] !w-[64px] !h-[64px] !rounded-[50%] overflow-hidden hover:bg-[#0c75d6] font-[300]"
            >
              <BsPlusLg size={25} />
            </Button>

            <div className="w-full st:!pl-0 pb-[65px] transition-all delay-500 h-full flex flex-col cusscroller overflow-y-scroll overflow-x-hidden">
              {/* <div className="my-2">
                <ToggleButtonGroup
                  value={tagValue}
                  className="cusscroller"
                  sx={{
                    width: "100%",
                    padding: "0px 10px",
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

              <div className="px-5 h-full">
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
                          "repeat(auto-fill, minmax(260px, 1fr))",
                      }}
                      className="flist pt-7 grid gap-2 grid-flow-dense"
                    >
                      {roomContent.map((attributes: any, i: number) => {
                        
                        const { name, creator: owner, meetId } = attributes;

                        return (
                          <Link
                            href={`https://app.huddle01.com/${meetId}`}
                            key={i}
                          >
                            <a>
                              <div className="w-full border border-[rgb(218,220,224)] rounded-md border-solid p-2 hover:bg-[rgb(248,248,248)] transition-all delay-300 cursor-pointer">
                                <div className="mb-4">
                                  <Avatar
                                    sx={{
                                      width: "100%",
                                      height: 183,
                                      margin: "auto",
                                      backgroundColor: "#1890FF",
                                    }}
                                    className="text-[60px] font-bold"
                                    variant="rounded"
                                  >
                                    {(
                                      String(name).charAt(0) +
                                      String(name).charAt(1)
                                    ).toUpperCase()}
                                  </Avatar>
                                </div>

                                <div className="flex items-center mb-[10px] justify-between">
                                  <div className="flex items-center w-[calc(100%-44px)]">
                                    <div className="text-white w-[40px] h-[40px] min-w-[40px] min-h-[40px] rounded-md mr-[.75rem] flex items-center justify-center bg-[#1890FF]">
                                      <MdMeetingRoom size={21} />
                                    </div>
                                    <div className="truncate">
                                      <h3 className="truncate flex items-center text-[17px] leading-[20px] font-[500] text-[#121212] mb-[2px]">
                                        {name}
                                      </h3>
                                      <span className="block text-[14px] leading-[1.2] truncate w-full text-[#575757]">
                                        {`hosted by ${owner.substring(0, 6)}...
                                        ${owner.substring(38, 42)}`}
                                      </span>
                                    </div>
                                  </div>
                                  {/* <div
                                    onClick={(e: any) => {
                                      e.preventDefault();
                                    }}
                                  >
                                    <IconButton
                                      color="inherit"
                                      size={"large"}
                                      sx={{
                                        color: "#6b6b6b",
                                      }}
                                    >
                                      <FiTrash2 size={20} />
                                    </IconButton>
                                  </div> */}
                                </div>
                              </div>
                            </a>
                          </Link>
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
      )

};

export default Rooms;
