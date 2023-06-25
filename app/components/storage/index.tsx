import Link from "next/link";
import {
  LinearProgress,
  Button,
  IconButton,
  Popper,
  ToggleButtonGroup,
  ToggleButton,
  Box
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
import { useContext, useState, useEffect, useRef } from "react";
import { GenContext } from "../../components/extras/contexts/genContext";
import { makeStorageClient } from "../../components/extras/storage/utoken";
import Loader from "../../components/loader";
import {
  lq,
  beginStorageProvider,
  retrieveFiles,
  storeFiles,
} from "../extras/storage/init";
import { logout } from "../../components/extras/logout";
import Dash from "../dash";
import { useAccount } from "wagmi";
import { encrypt } from "../extras/chat/functions";
import { CContext } from "../extras/contexts/CContext";
import { store } from "../types";
import io from 'socket.io-client'


let socket:any;

const Storage = () => {

  const [currentDir, setCurrentDir] = useState<string[]>(["main"]);

  const loadOnce = useRef<boolean>(true)

  const { address, isConnected } = useAccount();

  /* upload */
  const uploadData = useContext(GenContext);

  const { chatkeys } = useContext(CContext);

  const [loginData, setLoginData] = useState<{
    name: string;
    contract: string;
    data: string;
    participants: any
  }>();

  useEffect(() => {
    if (localStorage.getItem("cloverlog") === null) {
      Router.push("../");
    }else{
        setLoginData(JSON.parse(localStorage.getItem("cloverlog") || '{}'));
    }
  }, []);

  const dirContent =
    uploadData.fileList !== undefined ? uploadData.fileList : [];

  const { success, error, loading, updateSuccess, updateLoading, errUpdate } =
    uploadData;

  const triggerUpload = async (
    w: React.SyntheticEvent & { target: HTMLInputElement }
  ) => {
    if (w.target.files) {
      await uploadFiles(w.target.files);
    }
  };

  const [update, setUpdate] = useState<boolean>(false);

  const [fileData, setFileData] = useState({});
  const [notInit, setNotInit] = useState<boolean>(false);
  const [isLoading, setLoader] = useState(true);

  const { name, contract, data, participants } = loginData || { name: '', contract: '', main: '', participants: {} };

  
  
    const socketInit = async () => {
      await fetch(`/api/storage?lq=${data}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("clover-x")}`,
        },
      });

      socket = io();

      socket.on("connect", () => {
        socket.emit("join", name);

      });

      const updateFl = async (data: any) => {
         const dir: any = await retrieveFiles(currentDir);

         setLoader(false);
         setFileData(dir);

         uploadData.updateFile?.(dir);

         setUpdate(!update);

      };

      socket.on("add_fle", updateFl);

    };

    useEffect(() => {
      if (loadOnce.current && data) {
        loadOnce.current = false;

        socketInit();
      }
    }, [data]);
  


  useEffect(() => {

    async function init() {
      await beginStorageProvider({user: address || '', contract, randId: data, participants});

 
      const dir: any = await retrieveFiles(currentDir);

      setLoader(false);
      setFileData(dir);

      uploadData.updateFile?.(dir);

      setUpdate(!update);
      
    }

    if (name !== undefined && Boolean(data)) {
      init();
    }
  }, [
    data,
    currentDir,
    contract,
    name,
  ]);

  const uploadFiles = async (files: FileList) => {

    updateLoading(true);

    let maxSize: number = 0;
    const blobFiles: File[] = [];

    for (let i: number = 0; i < files.length; i++) {
      let startPointer: number = 0;
      let endPointer: number = files[i].size;
      maxSize += files[i].size;
      let chunks: any[] = [files[i].name, files[i].type, []];
      while (startPointer < endPointer) {
        let newStartPointer: number = startPointer + files[i].size;
        chunks[2].push(files[i].slice(startPointer, newStartPointer));
        startPointer = newStartPointer;
      }

      blobFiles.push(
        new File(
          [new Blob(chunks[2], { type: files[i].type })],
          files[i].name,
          { type: files[i].type, lastModified: files[i].lastModified }
        )
      );
    }

    await uploadProvider(blobFiles, maxSize);
  };

  const dropHere = async (event: React.DragEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
    const fileList = event.dataTransfer.files;
    await uploadFiles(fileList);
  };

  const dragHere = (event: React.DragEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const uploadProvider = async (files: File[], totalSize: number) => {
    let index: number = 0;
    const addFiles: store[] = [];

    updateLoading(true);

    const onRootCidReady = async (cid: string) => {
      errUpdate("");
      updateSuccess(true);

      setUpdate(!update);


      const filename = files[index].name;

      const extension = filename.split(".").pop();


      const cidData = JSON.stringify(await encrypt(cid, chatkeys[name]));

      addFiles.push({
        name: filename,
        date: files[index].lastModified,
        type: files[index].type,
        size: files[index].size,
        extension,
        cid: cidData,
        oname: "",
        file: true,
        tag: "default",
        deleted: false,
      });

      if (index == files.length - 1) {

        const newFileData = await storeFiles(addFiles, currentDir);

        socket.emit("add_file", true);

        const dir = await retrieveFiles(currentDir);

        setFileData(newFileData);

        updateLoading(false);

        setUpdate(!update);

        if (uploadData?.updateFile !== undefined) {
          uploadData.updateFile(dir);
        }
      }

      index++;
    };

    let uploaded = 0;

    const onStoredChunk = (size: number) => {
      
      uploaded += size;

      const pct: number = (uploaded / totalSize) * 100;

      console.log(`Uploading... ${pct.toFixed(2)}% complete`);

      setUpdate(!update);

    };

    const client = makeStorageClient(process.env.NEXT_PUBLIC_STORAGE_KEY || '');

    files.forEach((file, i) => {
      return client.put([file], { onRootCidReady, onStoredChunk });
    });


  };

  /*end of upload*/

  const [open, setOpen] = useState(false);
  const [showStorage, setShowStorage] = useState(true);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen((previousOpen) => !previousOpen);
  };

  const [tagValue, setTagValue] = useState<string>('drive');

  return (
    <>
      <Dash />
      {(isLoading || notInit) && <Loader />}

      {!isLoading && !notInit && (
        <>
          <div
            onDragOver={(event) => {
              dragHere(event);
            }}
            onDrop={(event) => {
              dropHere(event);
            }}
            className="w-full flex items-start justify-between filedrop min-h-screen"
          >
            <Button
              onClick={() => {
                const elem = document?.querySelector(
                  ".input_upload"
                ) as HTMLElement;

                elem?.click();
              }}
              className="!py-2 !mr-4 !flex !fixed !right-[15px] !bottom-[20px] !cursor-pointer !justify-center !z-[90] !items-center !px-4 !bg-[#1890FF] !text-white !border-solid !border-white !border-[2px] !w-[64px] !h-[64px] !rounded-[50%] overflow-hidden hover:bg-[#0c75d6] font-[300]"
            >
              <BsPlusLg size={25} />
            </Button>

            <input
              type="file"
              multiple
              onChange={triggerUpload}
              className="!hidden input_upload"
              style={{
                display: "none",
                visibility: "hidden",
              }}
            />

            <div className="w-full st:!pl-0 pb-[65px] transition-all delay-500 h-full flex flex-col">
              {loading && (
                <Box>
                  <LinearProgress
                    variant="indeterminate"
                    sx={{
                      backgroundColor: "#ececec",
                      color: "#ececec",
                      height: 5,
                      width: "100%",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: "#1890FF",
                        borderBottomRightRadius: "16px",
                        borderTopRightRadius: "16px",
                      },
                    }}
                  />
                </Box>
              )}

              <div className="my-2">
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
              </div>
              <div className="px-5 h-full">
                <div className="px-1">
                  {!Boolean(dirContent.length) && !isLoading && (
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
                          alt="No files yet"
                        />
                      </div>

                      <div className="mt-2 mb-3">
                        <h2 className="text-[22px] text-center font-bold">
                          Drop files here
                        </h2>
                        <span className="mt-2 text-[17px] flex w-full text-center">
                          or use the `{<FaPlus size={17} />}` button
                        </span>
                      </div>
                    </div>
                  )}

                  {Boolean(dirContent.length) && (
                    <div
                      style={{
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(150px, 1fr))",
                      }}
                      className="flist pt-7 grid gap-2 grid-flow-dense"
                    >
                      {dirContent.map((e: any, i: number) => {
                        return (
                          <FileDes
                            key={i}
                            data={{
                              name: e["name"],
                              size: e["size"],
                              key: e['fileid'],
                            }}
                            text={e["extension"]}
                          />
                        );
                        // } else {
                        //   let size: number = 0;
                        //   e.forEach((x: any) => {
                        //     if (x.file) {
                        //       size += x.size;
                        //     }
                        //   });
                        //   return (
                        //     <FolderDes
                        //       key={i}
                        //       data={{
                        //         name: e["name"],
                        //         size,
                        //         key: i,
                        //         files: e["files"].length,
                        //       }}
                        //     />
                        //   );
                        // }
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

export default Storage;
