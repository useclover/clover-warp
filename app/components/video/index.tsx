import Link from "next/link";
import { FiTrash2, FiX } from 'react-icons/fi';

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
import { MdLink, MdMeetingRoom } from "react-icons/md";

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



  useEffect(() => {
    if (localStorage.getItem("cloverlog") === null) {
      Router.push("/");
    } else {
      setLoginData(JSON.parse(localStorage.getItem("cloverlog") || "{}"));
    }
  }, []);

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
    main: "",
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


  return (
    <>
      <Dash />

      <Modal open={addNew} onClose={() => setAddNew(false)}>
        <div className="w-screen overflow-y-scroll overflow-x-hidden absolute h-screen flex items-center bg-[#ffffffb0]">
          <div className="2usm:px-0 mx-auto max-w-[900px] 2usm:w-full relative w-[85%] usm:m-auto min-w-[340px] px-6 my-8 items-center">
            <div className="rounded-lg bg-white shadow-lg shadow-[#cccccc]">
              <div className="border-b flex justify-between py-[14px] px-[17px] text-xl font-bold">
                Create New Room
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
                            const create = await createRoom(nname);

                            // setAddNew(false);

                            Router.push(`/dashboard/rooms/${create}`);

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
                      fullWidth
                    >
                      Create
                    </Button>
                  </FormControl>
                </Box>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {!isLoading && (
        <>
          <div className="w-full flex items-start justify-between filedrop min-h-screen">
            <Button
              onClick={() => setAddNew(true)}
              className="!py-2 !mr-4 !flex !fixed !right-[15px] !bottom-[20px] !cursor-pointer !justify-center !z-[90] !items-center !px-4 !bg-[#1890FF] !text-white !w-[64px] !h-[64px] !rounded-[50%] overflow-hidden hover:bg-[#0c75d6] font-[300]"
            >
              <BsPlusLg size={25} />
            </Button>

            <div className="w-full st:!pl-0 pb-[65px] transition-all delay-500 h-full flex flex-col">
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
                        
                        const { name, creator: owner } = attributes;

                        return (
                          <Link href={`/dashboard/rooms/${i}`} key={i}>
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
                                    className="text-[100px] font-bold"
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
                                      <h3 className="truncate flex items-center text-[17px] leading-[20px] font-[500] text-[#121212]">
                                        {name}
                                      </h3>
                                      <span className="block text-[14px] leading-[1.2] truncate w-full text-[#575757]">
                                        created by 
                                        {owner.substring(0, 6)}...
                                        {owner.substring(38, 42)}
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
      )}
    </>
  );
};

export default Rooms;
