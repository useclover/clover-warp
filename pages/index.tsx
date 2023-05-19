import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import logo from "../public/images/logo.png";
import styles from "../styles/Home.module.css";
import bgLogo from "../public/images/logolg.png";
// import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { BiX } from "react-icons/bi";
import { AiOutlineAppstoreAdd } from "react-icons/ai";
import axios from "axios";
import validator from "validator";
import hero from "../public/images/phone.svg";
import { useState } from "react";
import {
  Alert,
  Button,
  Modal,
  Box,
  FormControl,
  TextField,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import Loader from "../app/components/loader";
// import web3 from "web3";
import contract from "../SimpleNFT.json";
import { makeNFTClient } from "../app/components/extras/storage/utoken";
import Router from "next/router";
import {
  useAccount,
  useConnect,
  useNetwork,
  useSignMessage,
  useSigner,
} from "wagmi";
import { ethers } from "ethers";
import { balanceABI } from "../app/components/extras/abi";
import { notifications } from "../app/components/extras/storage/init";
import Link from "next/link";
import trusted from "../public/images/trust.svg";
import { BsList, BsPatchPlusFill, BsPlusCircle, BsPlusCircleFill } from "react-icons/bs";
import { MdClose, MdPersonAddAlt } from "react-icons/md";

// 0x74367351f1a6809ced9cc70654c6bf8c2d1913c9;
const contractAddress: string = "0xaCDFc5338390Ce4eC5AD61E3dC255c9F2560D797";
const abi: any = contract.abi;

const Home: NextPage = () => {
  const { chain: chainId, chains } = useNetwork();

  const { address, isConnected } = useAccount();

  const { connectors, isLoading: connecting, connectAsync } = useConnect();

  const { isSuccess, signMessageAsync } = useSignMessage();

  const { data: signer } = useSigner();

  const [sidebar, setSidebar] = useState(false);

  const [isNotSupported, setSupport] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const handleClose = () => setOpen(false);
  const [failMessage, setFailMessage] = useState<string>("");

  const [userAddress, setUserAddress] = useState<string>("");

  const [testName, setTestName] = useState<string>("");
  const [testEmail, setTestEmail] = useState<string>("");
  const [testAdd, setTestAdd] = useState<string>("");

  const [improve, setImprove] = useState<boolean>(false);

  const [name, setName] = useState<string>("");
  const [des, setDes] = useState<string>("");
  const [contractAd, setContractAd] = useState<string>("");
  const [daoType, setDaoType] = useState<"default" | "exist">("default");
  const [participants, setParticipants] = useState<string[]>([]);
  const [part, setPart] = useState<string>("");
  const [bigLoader, setBigLoader] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const helper = {
    padding: "6px 3px",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "bold",
    marginTop: "0px",
  };

  const testText = {
    "& .Mui-focused.MuiFormLabel-root": {
      color: "#121212",
    },
    "& .MuiInputLabel-root": {
      fontWeight: "600",
      color: "#121212",
      backgroundColor: "#ffffff",
    },
    "& .MuiOutlinedInput-notchedOutline, .MuiInput-underline::after": {
      border: "none !important",
    },
    "& .MuiOutlinedInput-root input": {
      color: "#121212",
      borderRadius: "1.2rem",
      backgroundColor: "#ffffff",
    },
    "& .MuiFormHelperText-root": helper,
  };

  const [start, setStart] = useState<boolean>(false);

  const useClose = () => setShowModal(false);

  const closeStart = () => setStart(false);

  let nft: any = "";

  const generateNftData = async (
    name: string,
    owner: string,
    desc?: string
  ) => {
    const nfx = makeNFTClient(process.env.NEXT_PUBLIC_NFT_KEY || "");

    const date = new Date();

    await fetch(bgLogo.src).then(async (x) => {
      nft = await nfx.store({
        image: new File([await x.blob()], "clover.png", {
          type: "image/png",
        }),
        name,
        description: `${
          desc === undefined
            ? `Access to ${name} ${
                name.toLowerCase().indexOf("dao") == -1 ? "DAO" : ""
              }`
            : desc
        }`,
        attributes: [
          {
            main: owner,
            created: Math.floor(date.getTime() / 1000),
          },
        ],
      });
    });
    return nft.url;
  };

  const mintNFT = async (tokenURI: string, receiver: string) => {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://api.hyperspace.node.glif.io/rpc/v1"
    );

    try {
      const signer = new ethers.Wallet(
        process.env.NEXT_PUBLIC_MATIC_PRIVATE_KEY || "",
        provider
      );

      const token = new ethers.Contract(contractAddress, abi, signer);

      const receipt = await token.mintTokens(receiver, tokenURI);

      console.log(receipt);

      return "continue";
    } catch (err) {
      console.log(err);
    }
  };

  const [updatex, setUpdatex] = useState<{
    name?: string;
    contract?: string;
    main?: string;
    table?: string;
  }>({});

  const [testErr, setTestErr] = useState("");

  const submitTest = async () => {
    if (isLoading) return;

    setLoading(true);

    try {
      if (!testName.length) {
        setTestErr("Name is required");
        setLoading(false);
        return;
      }

      if (!validator.isEmail(testEmail)) {
        setTestErr("Email is required");
        setLoading(false);
        return;
      }

      if (!ethers.utils.isAddress(testAdd)) {
        setTestErr("Address is required");
        setLoading(false);
        return;
      }

      if (!isConnected) {
        await connectAsync({ connector: connectors[0] });
      }

      const metadata = await generateNftData(
        "useClover",
        testAdd,
        "useClover App test"
      );

      await mintNFT(metadata, testAdd);

      const { data } = await axios.post("/api/auth/test", {
        name: testName,
        email: testEmail,
        address: testAdd,
      }, {
        baseURL: window.origin
      });

      localStorage.setItem("clover-x", data.token);

      localStorage.setItem("cloverlog", JSON.stringify(data.dao));

      Router.push('/dashboard');

    } catch (err) {

      const error = err as any;

      console.log(error);

      setLoading(false);

      setTestErr(
        error?.response?.data.message ||
          "Something went wrong, please try again"
      );
    }
  };

  const sumitDeets = async () => {
   
    setBigLoader(true);

    let send: boolean = false;

    if (!isConnected) {
      await connectAsync({ connector: connectors[0] });
    }

    try {
      const userAddress: string = address as `0x${string}`;

      if (!name.length) {
        setFailMessage("Name is required");
        setBigLoader(false);
        return;
      }

      if (des.length > 300) {
        setFailMessage("Description requires a max of 300 characters");
        setBigLoader(false);
        return;
      }

      if (!contractAd.length && daoType !== "default") {
        setFailMessage(
          "A contract address is required if you dont have one use the create new option"
        );
        
        setBigLoader(false);
        return;
      } else if (daoType == "default") {
        if (participants.length) {
          participants.forEach(async (v) => {
            if (!ethers.utils.isAddress(v)) {
              setBigLoader(false);
              setFailMessage(
                `Error Retrieving data from ${v}, check the address and try again`
              );
              return;
            } else {
              console.log("works");
            }
          });
        }

        send = true;
        console.log("default herex");

        // send nft to dao
      } else {
        const provider = new ethers.providers.JsonRpcProvider(
          "https://api.hyperspace.node.glif.io/rpc/v1"
        );

        const token = new ethers.Contract(contractAd, balanceABI, provider);

        const balance = await token.getBalance(address);

        const active = balance > 0;

        if (!active) {
          setBigLoader(false);
          setFailMessage("Your contract address does not exist in your wallet");
          return;
        }

        send = true;
      }

      const nftown: string[] = participants;

      try {
        // const { data: { daos: dbData } } = await axios.get('/api/auth/addDao', {
        //   baseURL: window.origin
        // });

        const payload: any = {
          contract:
            daoType == "default"
              ? contractAddress
              : ethers.utils.getAddress(contractAd),
          joined: JSON.stringify(participants),
          desc: des || "",
          name,
        };

        if (daoType == "default") {
          nftown.push(userAddress);

          const metadata = await generateNftData(
            name,
            userAddress,
            des.length ? des : undefined
          );

          for (let i = 0; i < nftown.length; i++) {
            const trans = await mintNFT(metadata, nftown[i]);
          }

          payload["metadata"] = userAddress;

          const {
            data: {
              token,
              data: { id },
            },
          } = await axios.post("/daos/store", payload);

          localStorage.setItem("clover-x", token);

          localStorage.setItem(
            "cloverlog",
            JSON.stringify({
              name,
              creator: userAddress,
              contract: contractAddress,
              data: id,
              participants,
            })
          );

          notifications({
            title: `You were added to ${name} on clover`,
            message: "click me to log in to your DAO",
            exclude: userAddress,
            receivers: participants,
          });
        } else {
          const {
            data: {
              token,
              data: { id },
            },
          } = await axios.post("/daos/store", payload);

          localStorage.setItem("clover-x", token);

          localStorage.setItem(
            "cloverlog",
            JSON.stringify({
              name,
              contract: ethers.utils.getAddress(contractAd),
              creator: address,
              data: id,
              participants: [address],
            })
          );
        }

        Router.push("/dashboard");

      } catch (err) {
        const error = err as any;

        setBigLoader(false);
        console.log(err);

        setFailMessage(
          error?.response?.data.message ||
            "Something went wrong, please try again"
        );
      }
    } catch (err) {
      const error = err as Error;

      console.log(error);
      setBigLoader(false);
      setFailMessage("Something went wrong, please try again");
    }
  };

  const [exec, setExec] = useState<object[]>([]);

  const login = async () => {

    setLoginError("");
    setBigLoader(true);

    setExec([]);

    setSupport(false);

    try {
      let add: any;

      if (!isConnected) {
        add = await connectAsync({ connector: connectors[0] });
      }

      const signedHash = await signMessageAsync({
        message: "Welcome back to clover",
      });

      const userAddress: string = address as `0x${string}`;

      try {
        const { data: loginData } = await axios.post(
          "/api/auth/login",
          {
            address: ethers.utils.getAddress(add?.account || userAddress),
            hash: signedHash,
            contractAddress,
          },
          { baseURL: window.origin }
        );

        const { daos, multiple, token } = loginData;

        localStorage.setItem("clover-x", token);

        if (multiple) {
          setExec([...daos]);

          setShowModal(true);

          setBigLoader(false);
        } else {
          const vv: any = daos;

          const name: string = vv.name;
          const contract: string = vv.contract;
          const data: string = vv.id;

          localStorage.setItem(
            "cloverlog",
            JSON.stringify({
              id: vv.id,
              name,
              creator: vv.metadata,
              contract,
              data,
              participants: typeof vv.joined == "string" ? JSON.parse(vv.joined) : vv.joined,
            })
          );

          Router.push("/dashboard");
        }
      } catch (err) {
        const error = err as any;

        setBigLoader(false);
        setSupport(false);

        setLoginError(error?.response?.data.message || error.message);
      }
    } catch (err) {
      const error = err as Error;

      setBigLoader(false);

      setLoginError(error.message);
    }
  };

  return (
    <>
      <Head>
        <title>Clover</title>
        <meta name="description" content="DAO suite" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {bigLoader && <Loader />}

      {!bigLoader && (
        <>
      <Modal open={sidebar} onClose={() => setSidebar(false)}>
        <div className="w-screen overflow-y-scroll overflow-x-hidden absolute h-screen cusscroller flex items-center bg-[#ffffffb0]">
          <div className="2usm:px-0 mx-auto max-w-[900px] 2usm:w-full relative w-[85%] usm:m-auto min-w-[340px] px-6 my-8 items-center">
            <div className="min-h-screen fixed w-[60%] top-0 left-0 justify-center bg-white flex flex-col shadow-lg shadow-[#cccccc]">
              <div className="flex top-0 pt-5 pb-2 items-center justify-between px-4 absolute w-full">
                <div className="h-[30px]">
                  <Image src={logo} alt="Clover" width={91.83} height={30} />
                </div>

                <IconButton onClick={() => setSidebar(false)}>
                  <BiX className="text-[rgb(24, 145, 254)]" size={30} />
                </IconButton>
              </div>

              <Link href="#">
                <h1 className="flex text-[#1891fe] justify-between py-[14px] px-[17px] text-[25px] cursor-pointer font-bold">
                  Product
                </h1>
              </Link>

              <Link href="#">
                <h1 className="flex text-[#1891fe] justify-between py-[14px] px-[17px] text-[25px] cursor-pointer font-bold">
                  Solutions
                </h1>
              </Link>

              <h1
                onClick={() => {
                  setSidebar(false);
                  setStart(true);
                }}
                className="flex text-[#1891fe] justify-between py-[14px] px-[17px] text-[25px] cursor-pointer font-bold"
              >
                Get Started
              </h1>
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
        open={start}
        className="overflow-y-scroll overflow-x-hidden cusscroller flex justify-center"
        onClose={closeStart}
        aria-labelledby="Clover Auth"
        aria-describedby="Begin Login or Signup on Clover"
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
          <div className="py-4 px-6 bg-white -mb-[1px] rounded-[.9rem]">
            
            
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h2 className="font-[500] text-[rgb(32,33,36)] text-[1.55rem] 3md:text-[1.2rem]">
                  Get Started
                </h2>
                <span className="text-[rgb(69,70,73)] font-[500] text-[14px]">
                  Login in to your DAOs or Register DAO
                </span>
              </div>

              <IconButton size={"medium"} onClick={handleClose}>
                <MdClose
                  size={20}
                  color={"rgb(32,33,36)"}
                  className="cursor-pointer"
                />
              </IconButton>
            </div>

            <div className="form relative pt-4">
              
              <div className={styles.container}>
                <div className="h-[220px] flex flex-col justify-center">
                  {Boolean(loginError.length) && (
                    <Alert className="my-2" severity="error">
                      {loginError}
                    </Alert>
                  )}
                  <div className="flex justify-around">
                    <div className="self-center">
                      <Button
                        onClick={login}
                        style={{
                          fontFamily: "Poppins",
                        }}
                        className="!py-4 !px-8 rounded-lg !capitalize !font-semibold !text-xl !text-white !bg-[#1891fe]"
                      >
                        Authenticate
                      </Button>
                    </div>
                    <div className="self-center">
                      <Button
                        onClick={() => {
                          setOpen(true);
                          closeStart();
                        }}
                        style={{
                          fontFamily: "Poppins",
                        }}
                        className="!py-4 !px-8 rounded-lg !capitalize !font-semibold !text-xl !text-white !bg-[#1891fe]"
                      >
                        Register DAO
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          
        </Box>
      </Modal>


      {showModal ? (
        <div
          className={`justify-center bg-[rgba(255,255,255,.4)] flex overflow-x-hidden items-center cusscroller overflow-y-auto fixed inset-0 z-[99999999] outline-none focus:outline-none`}
        >
          <div className="relative max-w-[1500px] w-[80%] 4sm:w-[60%] min-w-[340px]">
            {/*content*/}
            <div className="border-0 rounded-[12px] shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
              <div className="flex items-center justify-center pb-2 pt-3 border-solid rounded-t">
                <h2
                  style={{ fontFamily: "inherit" }}
                  className="text-[18px] font-bold"
                >
                  Choose DAO
                </h2>
              </div>
              {/*body*/}
              {/* {Boolean(authError?.length) && (
                    <div className="transition-all rounded-md delay-500 border-[#1891fe] text-[#1891fe] items-center font-bold text-[16px] border-[1px] mx-6 my-2 w-[calc(100%-48px)] p-3">
                      {authError}
                    </div>
                  )} */}

              <div
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                }}
                className="relative p-6 grid gap-2 grid-flow-dense"
              >
                {exec.map((vv: any, i: number) => (
                  <button
                    key={i}
                    onClick={async () => {
                      setLoading(true);

                      const name: string = vv.name;
                      const contract: string = vv.contract;
                      const data: string = vv.id;

                      localStorage.setItem(
                        "cloverlog",
                        JSON.stringify({
                          id: vv.id,
                          creator: vv.metadata,
                          name,
                          contract,
                          data,
                          participants:
                            typeof vv.joined == "string"
                              ? JSON.parse(vv.joined)
                              : vv.joined,
                        })
                      );

                      Router.push("/dashboard");
                    }}
                    style={{ fontFamily: "inherit" }}
                    className="transition-all rounded-md delay-500 hover:border-[#1891fe] hover:text-[#1891fe] items-start text-[16px] flex justify-between border-[1px] 4sm:mr-2 text-[#575757] mb-2 w-full py-4 px-4"
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-bold">{vv.name}</span>
                      <span className="text-left">{vv.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
              {/*footer*/}
              <div className="flex items-center justify-end p-2 border-t border-solid border-slate-200 rounded-b">
                <button
                  className="text-blue-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="button"
                  onClick={useClose}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <Modal
        open={open}
        sx={{
          "&& .MuiBackdrop-root": {
            backdropFilter: "blur(5px)",
            width: "calc(100% - 8px)",
          },
        }}
        onClose={handleClose}
        className="overflow-y-scroll overflow-x-hidden cusscroller flex justify-center"
        aria-labelledby="Register DAO on Clover"
        aria-describedby="Register DAO"
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
                  Register DAO
                </h2>
                <span className="text-[rgb(69,70,73)] font-[500] text-[14px]">
                  Create a DAO or Add existing DAOs to our service
                </span>
              </div>

              <IconButton size={"medium"} onClick={handleClose}>
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
                  <ToggleButtonGroup
                    value={daoType}
                    sx={{
                      justifyContent: "space-between",
                      marginBottom: "15px !important",
                      width: "100%",
                      "& .Mui-selected": {
                        backgroundColor: `rgba(24, 145, 254, 0.8) !important`,
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
                        minWidth: 55,
                        marginLeft: 3,
                        backgroundColor: "#1212121a",
                        border: "none",
                      },
                    }}
                    exclusive
                    className="w-full cusscroller overflow-y-hidden !justify-around mb-4 pb-1"
                    onChange={(e: any) => {
                      setDaoType(e.target.value);
                    }}
                  >
                    <ToggleButton
                      sx={{
                        textTransform: "capitalize",
                        fontWeight: "bold",
                      }}
                      value={"default"}
                    >
                      <MdPersonAddAlt className="mr-2" size={20} /> Create New
                    </ToggleButton>
                    <ToggleButton
                      sx={{
                        textTransform: "capitalize",
                        fontWeight: "bold",
                      }}
                      value={"exist"}
                    >
                      <AiOutlineAppstoreAdd className="mr-2" size={20} /> Add
                      Existing
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <div>
                    <TextField
                      fullWidth
                      id="outlined-basic"
                      label="Name of DAO"
                      variant="outlined"
                      value={name}
                      onChange={(
                        e: React.ChangeEvent<
                          HTMLInputElement | HTMLTextAreaElement
                        >
                      ) => {
                        setName(e.target.value);
                      }}
                    />
                  </div>
                  <div className="mt-6">
                    <TextField
                      fullWidth
                      id="outlined-basic"
                      label="Description of DAO"
                      variant="outlined"
                      helperText="Short Description Of DAO, Can be left empty - max 300 characters"
                      value={des}
                      onChange={(
                        e: React.ChangeEvent<
                          HTMLInputElement | HTMLTextAreaElement
                        >
                      ) => {
                        const val = e.target.value;

                        setDes(val.substring(0, 300));
                      }}
                    />
                  </div>
                  {daoType == "exist" && (
                    <div className="my-6">
                      <TextField
                        fullWidth
                        id="outlined-basic"
                        label="Contract Address"
                        variant="outlined"
                        helperText="Contract address of the token that would allow users into the DAO"
                        value={contractAd}
                        onChange={(
                          e: React.ChangeEvent<
                            HTMLInputElement | HTMLTextAreaElement
                          >
                        ) => {
                          setContractAd(e.target.value);
                        }}
                      />
                    </div>
                  )}

                  {daoType == "default" && (
                    <>
                      <label className="mt-5">Participants</label>
                      <div className="flex w-full my-2 cusscroller overflow-hidden overflow-x-scroll items-center">
                        {participants.map((e, i: number) => (
                          <div
                            className="border text-[#777] border-solid ml-[2px] rounded p-2 flex items-center justify-between"
                            key={i}
                          >
                            <span>
                              {e.substring(0, 5) +
                                "...." +
                                e.substring(e.length - 5, e.length)}
                            </span>
                            <MdClose
                              size={15}
                              className={"ml-1 cursor-pointer hover:text-[#121212]"}
                              onClick={() => {
                                const partx: string[] = [...participants];
                                partx.splice(i, 1);
                                setParticipants(partx);
                              }}
                            />
                          </div>
                        ))}
                      </div>

                      <TextField
                        fullWidth
                        id="outlined-basic"
                        helperText="if left empty, only you would have access to the newly created DAO"
                        variant="outlined"
                        value={part}
                        placeholder="click enter to add address"
                        onChange={(e: any) => {
                          setPart(e.target.value);
                        }}
                        onKeyUp={(e: any) => {
                          setPart(e.target.value);

                          if (e.keyCode == 13 || e.which === 13) {
                            if (part.length) {
                              if (
                                !ethers.utils.isAddress(part) ||
                                (participants.includes(
                                  ethers.utils.getAddress(part)
                                ) &&
                                  ethers.utils.isAddress(part))
                              ) {
                                setPart("");
                                return;
                              }

                              const partx: string[] = [...participants];
                              partx.push(ethers.utils.getAddress(part));

                              setParticipants(partx);

                              setPart("");
                            }
                          }
                        }}
                        onBlur={(e: any) => {
                          setPart(e.target.value);

                          if (part.length) {
                            if (
                              !ethers.utils.isAddress(part) ||
                              (participants.includes(
                                ethers.utils.getAddress(part)
                              ) &&
                                ethers.utils.isAddress(part))
                            ) {
                              setPart("");
                              return;
                            }

                            const partx: string[] = [...participants];
                            partx.push(ethers.utils.getAddress(part));

                            setParticipants(partx);

                            setPart("");
                          }
                        }}
                      />
                    </>
                  )}
                </FormControl>
              </Box>
            </div>
          </div>

          <div className="bg-[#efefef] flex justify-center items-center rounded-b-[.9rem] px-6 py-4">
            <div className="flex items-center">
              <Button
                onClick={() => {
                  setFailMessage("");
                  sumitDeets();
                }}
                className="!py-2 !font-bold !px-3 !capitalize !flex !items-center !text-white !fill-white !bg-[#1891fe] !border !border-solid !border-[rgb(218,220,224)] !transition-all !delay-500 hover:!text-[#f0f0f0] !rounded-lg"
              >
                <BsPatchPlusFill
                  color={"inherit"}
                  className={"mr-2 !fill-white"}
                  size={20}
                />{" "}
                Register
              </Button>
            </div>
          </div>
        </Box>
      </Modal>

      <Modal open={improve} onClose={() => setImprove(false)}>
        <div className="w-screen overflow-y-scroll overflow-x-hidden absolute h-screen flex cusscroller items-center bg-[#ffffffb0]">
          <div className="2usm:px-0 mx-auto max-w-[900px] 2usm:w-full relative w-[85%] usm:m-auto min-w-[340px] px-6 my-8 items-center">
            {isLoading && (
              <Loader
                sx={{
                  backgroundColor: "rgba(255,255,255,.6)",
                  backdropFilter: "blur(5px)",
                }}
                fixed={false}
                incLogo={false}
              />
            )}

            <div className="rounded-lg bg-white shadow-lg shadow-[#cccccc]">
              <div className="border-b flex justify-between py-[14px] px-[17px] text-xl font-bold">
                Help us improve?
                <BiX
                  size={20}
                  className="cursor-pointer"
                  onClick={() => setImprove(false)}
                />
              </div>
              <div className="form relative pt-4">
                <Box sx={{ width: "100%" }}>
                  {Boolean(testErr.length) && (
                    <div className="rounded-md w-[95%] font-bold mt-2 mx-auto p-3 bg-[#ff8f33] text-white">
                      {testErr}
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
                        label="Name"
                        variant="outlined"
                        value={testName}
                        onChange={(
                          e: React.ChangeEvent<
                            HTMLInputElement | HTMLTextAreaElement
                          >
                        ) => {
                          setTestErr("");
                          setTestName(e.target.value);
                        }}
                      />
                    </div>
                    <div className="mt-3">
                      <TextField
                        fullWidth
                        id="outlined-basic"
                        label="Ethereum address"
                        variant="outlined"
                        value={testAdd}
                        onChange={(
                          e: React.ChangeEvent<
                            HTMLInputElement | HTMLTextAreaElement
                          >
                        ) => {
                          setTestErr("");
                          const val = e.target.value;

                          setTestAdd(val);
                        }}
                      />
                    </div>
                    <div className="my-3">
                      <TextField
                        fullWidth
                        id="outlined-basic"
                        label="Email"
                        variant="outlined"
                        value={testEmail}
                        onChange={(
                          e: React.ChangeEvent<
                            HTMLInputElement | HTMLTextAreaElement
                          >
                        ) => {
                          setTestErr("");
                          setTestEmail(e.target.value);
                        }}
                      />
                    </div>

                    <Button
                      onClick={submitTest}
                      variant="contained"
                      className="!bg-[#1891fe] !mt-4 !py-[13px] !font-medium !capitalize"
                      style={{
                        fontFamily: "inherit",
                      }}
                      fullWidth
                    >
                      Submit
                    </Button>
                  </FormControl>
                </Box>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      
        <div className="min-w-screen max-h-screen overflow-y-scroll overflow-x-hidden cusscroller relative bg-white p-4">
          <div className="max-w-[1430px] mx-auto">
            <div className="bg-[#1890FF] usm:flex-col rounded-t-[1rem] usm:rounded-[1rem] rounded-bl-[1rem] min-w-full py-5 px-[40px] flex justify-center relative">
              <div className="w-full">
                <div className="flex items-center justify-between px-[30px] bg-white rounded-[1rem] py-2 mb-12">
                  <div className="h-[30px]">
                    <Image src={logo} alt="Clover" width={91.83} height={30} />
                  </div>

                  <div className="flex items-center w-[150px] mmd:hidden  justify-between">
                    <Link href="#">
                      <span className="text-[#1890FF] text-[14px]">
                        Product
                      </span>
                    </Link>

                    <Link href="#">
                      <span className="text-[#1890FF] text-[14px]">
                        Solutions
                      </span>
                    </Link>
                  </div>

                  <IconButton
                    className="!hidden mmd:!block"
                    onClick={() => setSidebar(true)}
                  >
                    <BsList className="text-[#1890FF] cursor-pointer text-[30px]" />
                  </IconButton>

                  <div className="mmd:hidden">
                    <Button
                      onClick={() => setStart(true)}
                      className="!bg-[#1891fe] !rounded-[.5rem] !text-white !mt-0 !py-2 !px-4 !font-medium"
                    >
                      Get started
                    </Button>
                  </div>
                </div>

                <div className="usm:text-center">
                  <h1 className="font-bold mb-3 mst:text-[40px] text-[50px] cursor-default text-white">
                    {" "}
                    <span className="text-[#ECB22F]">
                      A digital Suite,{" "}
                    </span>{" "}
                    perfect for <br className="st:hidden"></br> your DAO.
                  </h1>

                  <span className="text-white mb-6 font-light block">
                    With all your DAO members, tools and communication in <br />{" "}
                    one place, your DAO can now be more productive than ever.
                  </span>

                  <div className="flex items-center usm:justify-center">
                    <Button
                      onClick={() => setStart(true)}
                      className="!bg-[#387CF7] !border-solid !border-white !border-[2px] !mb-5 !rounded-[.5rem] !text-white !mt-0 !py-3 !px-4 !font-medium !capitalize"
                    >
                      Get started
                    </Button>

                    <Button
                      onClick={() => setImprove(true)}
                      className="!bg-[#387CF7] !border-solid !border-white !border-[2px] !mb-5 !rounded-[.5rem] !text-white !hidden !ml-5 usm:!block !mt-0 !py-3 !px-4 !font-medium !capitalize"
                    >
                      Help us improve?
                    </Button>
                  </div>
                </div>
              </div>

              <div className="w-[35%] usm:w-[350px] z-[200] usm:hidden usm:relative usm:top-0 usm:right-0 usm:mt-3 usm:m-auto right-[35px] top-[90px] rounded-[1rem] bg-white usm:bg-transparent absolute p-[18px]">
                <h4 className="w-full text-center usm:text-white font-bold text-[19px] mb-3">
                  Help us build better
                </h4>

                <div className="flex bg-[#1891fe] items-center rounded-[1rem] p-5 justify-between mb-3 flex-col">
                  {Boolean(testErr.length) && (
                    <div className="rounded-md w-[95%] font-bold mt-2 mx-auto px-3 py-2 bg-[#ff8f33] text-white">
                      {testErr}
                    </div>
                  )}

                  <div className="py-2 mb-[7px] w-full">
                    <label className="text-white mb-3 block">Name</label>

                    <TextField
                      fullWidth
                      sx={testText}
                      value={testName}
                      onChange={(e: any) => {
                        setTestErr("");

                        setTestName(e.target.value);
                      }}
                    />
                  </div>

                  <div className="py-2 mb-[7px] w-full">
                    <label className="text-white mb-3 block">
                      Ethereum Address
                    </label>

                    <TextField
                      fullWidth
                      sx={testText}
                      value={testAdd}
                      onChange={(e: any) => {
                        setTestErr("");
                        setTestAdd(e.target.value);
                      }}
                    />
                  </div>

                  <div className="py-2 mb-[7px] w-full">
                    <label className="text-white mb-3 block">Email</label>

                    <TextField
                      fullWidth
                      sx={testText}
                      value={testEmail}
                      onChange={(e: any) => {
                        setTestErr("");
                        setTestEmail(e.target.value);
                      }}
                    />
                  </div>

                  <div className="pt-2 mb-[5px] w-full">
                    <Button
                      onClick={submitTest}
                      className="!py-[13px] !font-normal !px-[14px] font-[poppins,sans-serif] !normal-case !text-[16px] !flex !items-center !text-[#121212] !w-full hover:!bg-[#fff] !bg-[#fff] !m-auto !rounded-[1.2rem]"
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center relative px-10 justify-between">
              <div className="pt-9 usm:pt-12 rounded-tr-[2rem] pb-[76px] min-w-[59.9%] z-[1] bg-white">
                <h2 className="text-[#121212] mb-1 font-bold text-[19px]">
                  TRUSTED BY DAOs ALL OVER THE WORLD
                </h2>

                <div className="relative mmd:w-full mmd:overflow-y-hidden mmd:overflow-x-hidden cusscroller w-[472px] h-[70px] mt-4">
                  <Image
                    src={trusted}
                    layout="fill"
                    alt="dao"
                    width={700}
                    height={70}
                  />
                </div>
              </div>

              <div className="bg-[#1891fe] right-0 top-0 w-[45%] h-[225px] absolute rounded-br-[1rem] usm:hidden">
                <div className="w-[90.4%] rounded-b-[1rem] bg-[#1891fe] right-0 h-[30px] absolute bottom-[-10px]"></div>
              </div>
            </div>
          </div>
        </div>
        </>
      )}
    </>
  );
};

export default Home;
