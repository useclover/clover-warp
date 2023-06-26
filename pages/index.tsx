import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import logo from "../public/images/logo.png";
import styles from "../styles/Home.module.css";
import bgLogo from "../public/images/logolg.png";
import cicon from "../public/images/icon.png";
import { BiUserPlus, BiX } from "react-icons/bi";
import { AiOutlineAppstoreAdd } from "react-icons/ai";
import SwipeableViews from "react-swipeable-views";
import axios from "axios";
import validator from "validator";
import hero from "../public/images/phone.svg";
import { useEffect, useRef, useState } from "react";
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
  Tooltip,
} from "@mui/material";
import Loader from "../app/components/loader";
// import web3 from "web3";
import contract from "../artifacts/contracts/localdao.sol/CloverSuiteNFT.json";
import { makeNFTClient } from "../app/components/extras/storage/utoken";
import Router from "next/router";
import {
  useAccount,
  useConnect,
  useNetwork,
  useSignMessage,
  useSigner,
  useSwitchNetwork,
} from "wagmi";
import { ethers } from "ethers";
import { balanceABI } from "../app/components/extras/abi";
import { notifications } from "../app/components/extras/storage/init";
import Link from "next/link";
import trusted from "../public/images/trust.svg";
import { BsList, BsPatchPlusFill, BsPlusCircle, BsPlusCircleFill } from "react-icons/bs";
import { MdClose, MdInfo, MdPersonAddAlt } from "react-icons/md";
import TabPanel from "../app/components/TabPanel";

// 0x74367351f1a6809ced9cc70654c6bf8c2d1913c9;
export const contractAddress: string = "0xA1C059147C14c69736c6EF79cD799B9D7fe85a42";

const Home: NextPage = () => {

  const { chain: chainId } = useNetwork();

  const { data: signer } = useSigner();

  const { address, isConnected } = useAccount();

  const { chains, error, pendingChainId, switchNetworkAsync } =
    useSwitchNetwork();

  const { connectors, isLoading: connecting, connectAsync } = useConnect();

  const { isSuccess, signMessageAsync } = useSignMessage();

  const [sidebar, setSidebar] = useState(false);

  const [isNotSupported, setSupport] = useState<boolean>(false);

  const [loginError, setLoginError] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const handleClose = () => {
    setOpen(false)
  };
  const [failMessage, setFailMessage] = useState<string>("");

  const [userAddress, setUserAddress] = useState<string>("");
  const [trxhash, setHash] = useState<string>("")

  const [testName, setTestName] = useState<string>("");
  const [testEmail, setTestEmail] = useState<string>("");

  const [signature, setSignature] = useState<string>("");

  const [improve, setImprove] = useState<boolean>(false);

  const [name, setName] = useState<string>("");
  const [des, setDes] = useState<string>("");
  const [contractAd, setContractAd] = useState<string>("");
  const [daoType, setDaoType] = useState<"default" | "exist">("default");

  const [access, setAccess] = useState("unlist")

  const [participants, setParticipants] = useState<string[]>([]);
  const [part, setPart] = useState<string>("");
  const [bigLoader, setBigLoader] = useState<boolean>(false);
  const [deployed, setDeployed] = useState<string>("")

  const timer: any = useRef();

  const [timeCounted, setTimeCounted] = useState<number>(0);

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

  const [value, setValue] = useState<number>(0)

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

  const createDAO = async (tokenURI: string, receiver: string[]) => {

    try {
  
    const addresses = receiver.map((stringAddress: string) =>
      ethers.utils.getAddress(stringAddress)
    );
   
      const contractlocal = new ethers.ContractFactory(
        contract.abi,
        contract.bytecode,
        signer as any
      );
 
      const receipt = await contractlocal.deploy(name, `${name.charAt(0)}CS`, addresses, tokenURI);      

      setHash(receipt.deployTransaction.hash);
      
      setDeployed(receipt.address)

      return {
        hash: receipt.deployTransaction.hash,
        address: receipt.address
      };

    } catch (err) {
        console.log(err)
        throw err
    }
  };

  const once = useRef<boolean>(false);

   useEffect(() => {
     if (timeCounted >= 15) {
       clearTimeout(timer.current);

       if (!once.current) {
        once.current = true
        sumitDeets()
      };

       setTimeCounted(0);
     }
   }, [timeCounted, timer]);

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

      
      if (!isConnected) {
        await connectAsync({ connector: connectors[0] });
      }

      const signedHash = await signMessageAsync({
        message: "UseClover Signature Request \n\nSign To Continue \n",
      });


      const userAddress: string = address as `0x${string}`;

      const metadata = await generateNftData(
        "useClover",
        userAddress,
        "useClover App test"
      );

     

      const { data } = await axios.post("/api/auth/test", {
        name: testName,
        email: testEmail,
        metadata,
        address: userAddress,
        hash: signedHash,
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

    
    if (chainId?.id != 314159) {
       await switchNetworkAsync?.(314159);
    }


    if (!value) {
      const signedHash = await signMessageAsync({
        message: "UseClover Signature Request \n\nSign To Continue \n",
      });

      setSignature(signedHash);
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

        if (!value) {
          setValue(1)
          setBigLoader(false);
          return;
        }

        if (participants.length && value == 1) {
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
          "https://api.calibration.node.glif.io/rpc/v1"
        );

        const token = new ethers.Contract(contractAd, balanceABI, provider);

        const balance = await token.getBalance(address);

        const active = balance > 0;

        if (!active) {
          setBigLoader(false);
          setFailMessage("Your contract address does not exist in your address");
          return;
        }

        send = true;

      }

      const nftown: string[] = [...participants];

      try {

        // const { data: { daos: dbData } } = await axios.get('/api/auth/addDao', {
        //   baseURL: window.origin
        // });


        const payload: any = {
          hash: signature,
          joined: JSON.stringify(participants),
          desc: des || "",
          name,
          metadata: userAddress,
          defCon: daoType == "default",
        };

        if (daoType == "default") {

          nftown.push(userAddress);

          if (value == 1) {

          const metadata = await generateNftData(
            name,
            userAddress,
            des.length ? des : undefined
          );

          await createDAO(
            metadata,
            nftown
          );

          setValue(2);
          timer.current = setInterval(() => {
            setTimeCounted((timeCounted) => timeCounted + 1);
          }, 1000);
          setBigLoader(false);

          return;

          }

          payload["metadata"] = userAddress;

          payload['contract'] = deployed;

          const {
            data: {
              token,
              data: { id },
            },
          } = await axios.post("/api/auth/addDao", payload, {
            baseURL: window.origin
          });

          localStorage.setItem("clover-x", token);

          localStorage.setItem(
            "cloverlog",
            JSON.stringify({
              name,
              creator: userAddress,
              contract: deployed,
              data: id,
              hash: signature,
              participants,
            })
          );

          notifications({
            title: `You were added to ${name} on Clover Suite`,
            message: "click me to log in to your DAO",
            exclude: userAddress,
            receivers: participants,
          });

        } else {

          payload['contract'] = ethers.utils.getAddress(contractAd);

          const {
            data: {
              token,
              data: { id },
            },
          } = await axios.post("/api/auth/addDao", payload, {
            baseURL: window.origin,
          });

          localStorage.setItem("clover-x", token);

          localStorage.setItem(
            "cloverlog",
            JSON.stringify({
              name,
              contract: ethers.utils.getAddress(contractAd),
              creator: address,
              hash: signature,
              data: id,
              participants: [address],
            })
          );
        }

        Router.push("/dashboard");

      } catch (err) {
        const error = err as any;

        once.current = false;

        setBigLoader(false);
        console.log(err);

        setFailMessage(
          error?.response?.data.message ||
            "Something went wrong, please try again"
        );
      }

    } catch (err) {
      const error = err as Error;
      once.current = false;
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
        message: "UseClover Signature Request \n\nSign To Continue \n",
      });

      setSignature(signedHash)

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
              hash: signedHash,
              participants:
                typeof vv.joined == "string"
                  ? JSON.parse(vv.joined)
                  : vv.joined,
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
                      <Image
                        src={logo}
                        alt="Clover"
                        width={91.83}
                        height={30}
                      />
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

                  <IconButton size={"medium"} onClick={closeStart}>
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
                      <div className="flex justify-around sst:flex-col">
                        <div className="self-center sst:mb-7">
                          <Button
                            onClick={login}
                            style={{
                              fontFamily: "Poppins",
                            }}
                            className="!py-4 !px-8 !min-w-[203px] rounded-lg !capitalize !font-semibold !text-xl !text-white !bg-[#1891fe]"
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
                            className="!py-4 !px-8 !min-w-[203px] rounded-lg !capitalize !font-semibold !text-xl !text-white !bg-[#1891fe]"
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

          <Modal
            sx={{
              "&& .MuiBackdrop-root": {
                backdropFilter: "blur(5px)",
                width: "calc(100% - 8px)",
              },
            }}
            open={showModal}
            className="overflow-y-scroll overflow-x-hidden cusscroller flex justify-center"
            onClose={useClose}
            aria-labelledby="Select DAO"
            aria-describedby="We found multiple DAOs in our account"
          >
            <Box
              className="mmdd:!w-full 3md:!px-1 h-fit 3mdd:px-[2px]"
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
              <div className="py-4 mmdd:w-full px-6 bg-white -mb-[1px] rounded-[.9rem]">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h2 className="font-[500] text-[rgb(32,33,36)] text-[1.55rem] 3md:text-[1.2rem]">
                      Choose DAO
                    </h2>
                    <span className="text-[rgb(69,70,73)] font-[500] text-[14px]">
                      We found multiple DAOs in our account
                    </span>
                  </div>

                  <IconButton size={"medium"} onClick={useClose}>
                    <MdClose
                      size={20}
                      color={"rgb(32,33,36)"}
                      className="cursor-pointer"
                    />
                  </IconButton>
                </div>

                <div className="form relative pt-4">
                  <Box sx={{ width: "100%" }}>
                    <div
                      className={`relative ${styles.daoOptions} 2usm:px-0 p-6 grid gap-2 grid-flow-dense`}
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
                                hash: signature,
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
                          className="transition-all rounded-md delay-500 hover:border-[#1891fe] hover:text-[#1891fe] items-center text-[16px] flex border-[1px] 4sm:mr-2 text-[#575757] mb-2 w-full py-4 px-4"
                        >
                          <div className="w-[45px] relative rounded-[50%] justify-center bg-[#e7e7e7] mr-4 flex items-center h-[45px]">
                            <Image
                              alt={vv.name}
                              height={vv?.img ? 45 : 30}
                              width={vv?.img ? 45 : 30}
                              src={
                                `${process.env.NEXT_PUBLIC_APP_URL}/avatars/${vv?.img}` ||
                                cicon.src
                              }
                            />
                          </div>

                          <div className="flex flex-col items-start">
                            <span className="font-bold truncate">
                              {vv.name}
                            </span>
                            <span className="text-left truncate">
                              {vv.desc}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </Box>
                </div>
              </div>
            </Box>
          </Modal>

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
                          if (!e?.target?.value) return;

                          setDaoType(e.target.value);

                          if (e?.target?.value == "exist") setValue(0);
                        }}
                      >
                        <ToggleButton
                          sx={{
                            textTransform: "capitalize",
                            fontWeight: "bold",
                          }}
                          value={"default"}
                        >
                          <MdPersonAddAlt className="mr-2" size={20} /> Create
                          New
                        </ToggleButton>

                        <ToggleButton
                          sx={{
                            textTransform: "capitalize",
                            fontWeight: "bold",
                          }}
                          value={"exist"}
                        >
                          <AiOutlineAppstoreAdd className="mr-2" size={20} />{" "}
                          Add Existing
                        </ToggleButton>
                      </ToggleButtonGroup>

                      <TabPanel value={value} index={0}>
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
                          <>
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

                            <div className="">
                              <Tooltip
                                arrow
                                title="Who would have access to the created DAO, could anyone who has the token or you could list specific people/addresses"
                              >
                                <label className="my-3 cursor-pointer flex items-center w-fit">
                                  Who has access?{" "}
                                  <MdInfo
                                    className="ml-2 text-[#2e2e2e]"
                                    size={18}
                                  />
                                </label>
                              </Tooltip>

                              <ToggleButtonGroup
                                value={access}
                                sx={{
                                  justifyContent: "space-between",
                                  marginBottom: "15px !important",
                                  width: "100%",
                                  "& .Mui-selected": {
                                    backgroundColor: `rgba(24, 145, 254, 0.66) !important`,
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
                                    borderRadius: "2rem !important",
                                    minWidth: 55,
                                    marginLeft: 3,
                                    backgroundColor: "#12121213",
                                    border: "none",
                                  },
                                }}
                                exclusive
                                className="w-full cusscroller overflow-y-hidden !justify-around mb-4 pb-1"
                                onChange={(e: any) => {
                                  if (!e?.target?.value) return;

                                  setAccess(e.target.value);
                                }}
                              >
                                <ToggleButton
                                  sx={{
                                    textTransform: "capitalize",
                                    fontWeight: "bold",
                                  }}
                                  value={"unlist"}
                                >
                                  Anyone
                                </ToggleButton>
                                <ToggleButton
                                  sx={{
                                    textTransform: "capitalize",
                                    fontWeight: "bold",
                                  }}
                                  value={"list"}
                                >
                                  Listed Addresses
                                </ToggleButton>
                              </ToggleButtonGroup>
                            </div>
                          </>
                        )}

                        {(daoType == "default" || access == "list") && (
                          <>
                            <label className="mt-3 block">Participants</label>
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
                                    className={
                                      "ml-1 cursor-pointer hover:text-[#121212]"
                                    }
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
                              helperText="if left empty, only you would have access to the newly created DAO, you can always add more people later"
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
                      </TabPanel>

                      <TabPanel index={1} value={value}>
                        <p className="text-[#7c7c7c] mt-3 block font-[500] text-[15px]">
                          You are about deploying a contract for your new DAO
                          which might require a little amount for gas fees, to
                          go on click the button below to continue.
                          <br />
                          <br />
                          If your DAO already has a contract, please click the
                          `Add Existing` Button on the top right
                        </p>
                      </TabPanel>

                      <TabPanel value={value} className="!h-[200px]" index={2}>
                        <div className="h-full backdrop-blur-[3px] absolute left-0 bg-[rgba(255,255,255,.6)] top-0 z-[100] flex flex-col justify-evenly items-center w-full">
                          <div className="animation-ctn">
                            <div className="icon icon--order-success svg">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="154px"
                                height="154px"
                              >
                                <g
                                  fill="none"
                                  stroke={"#1891fe"}
                                  strokeWidth="2"
                                >
                                  <circle
                                    cx="77"
                                    cy="77"
                                    r="72"
                                    style={{
                                      strokeDasharray: "480px, 480px",
                                      strokeDashoffset: "960px",
                                    }}
                                  ></circle>
                                  <circle
                                    id="colored"
                                    fill={"#1891fe"}
                                    cx="77"
                                    cy="77"
                                    r="72"
                                    style={{
                                      strokeDasharray: "480px, 480px",
                                      strokeDashoffset: "960px",
                                    }}
                                  ></circle>
                                  <polyline
                                    className="st0"
                                    stroke={"#fff"}
                                    strokeWidth="10"
                                    points="43.5,77.8 63.7,97.9 112.2,49.4 "
                                    style={{
                                      strokeDasharray: "100px, 100px",
                                      strokeDashoffset: "200px",
                                    }}
                                  />
                                </g>
                              </svg>
                            </div>
                          </div>

                          <h2
                            style={{
                              color: `#1891fe`,
                            }}
                            className="mb-2 text-[15px] font-[600]"
                          >
                            DAO created Successfully
                          </h2>

                          <Link
                            href={`https://calibration.filfox.info/en/message/${trxhash}`}
                          >
                            <a
                              target={"_blank"}
                              className="text-[#5a5a5a] cursor-pointer mb-1 font-[400]"
                            >
                              View transaction on{" "}
                              <span
                                style={{
                                  color: "#1891fe",
                                }}
                              >
                                filfox
                              </span>
                            </a>
                          </Link>
                        </div>
                      </TabPanel>
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
                    {value ? (
                      <div className="flex items-center">
                        <span>Continue</span>{" "}
                        {value == 2 && <span className="block ml-[2px]">
                          {15 - timeCounted}s
                        </span>}
                      </div>
                    ) : (
                      "Register"
                    )}
                  </Button>
                </div>
              </div>
            </Box>
          </Modal>

          <Modal
            open={improve}
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
            <>
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
                        Help us improve?
                      </h2>
                      <span className="text-[rgb(69,70,73)] font-[500] text-[14px]">
                        We are constantly improving our product. Help us
                        improve, Join our DAO and drop contributions, issues, or
                        suggestions.
                      </span>
                    </div>

                    <IconButton
                      size={"medium"}
                      onClick={() => setImprove(false)}
                    >
                      <MdClose
                        size={20}
                        color={"rgb(32,33,36)"}
                        className="cursor-pointer"
                      />
                    </IconButton>
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
                          px: 2,
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
                      </FormControl>
                    </Box>
                  </div>
                </div>

                <div className="bg-[#efefef] flex justify-center items-center rounded-b-[.9rem] px-6 py-4">
                  <div className="flex items-center">
                    <Button
                      onClick={submitTest}
                      className="!py-2 !font-bold !px-3 !capitalize !flex !items-center !text-white !fill-white !bg-[#1891fe] !border !border-solid !border-[rgb(218,220,224)] !transition-all !delay-500 hover:!text-[#f0f0f0] !rounded-lg"
                    >
                      <BiUserPlus
                        color={"inherit"}
                        className={"mr-2 !fill-white"}
                        size={20}
                      />{" "}
                      Submit
                    </Button>
                  </div>
                </div>
              </Box>
            </>
          </Modal>

          <Modal open={sidebar} onClose={() => setSidebar(false)}>
            <div className="w-screen overflow-y-scroll overflow-x-hidden absolute h-screen cusscroller flex items-center bg-[#ffffffb0]">
              <div className="2usm:px-0 mx-auto max-w-[900px] 2usm:w-full relative w-[85%] usm:m-auto min-w-[340px] px-6 my-8 items-center">
                <div className="min-h-screen fixed w-[60%] top-0 left-0 justify-center bg-white flex flex-col shadow-lg shadow-[#cccccc]">
                  <div className="flex top-0 pt-5 pb-2 items-center justify-between px-4 absolute w-full">
                    <div className="h-[30px]">
                      <Image
                        src={logo}
                        alt="Clover"
                        width={91.83}
                        height={30}
                      />
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

          <div className="min-w-screen max-h-screen overflow-y-scroll overflow-x-hidden cusscroller relative bg-white p-4">
            <div className="max-w-[1430px] mx-auto">
              <div className="bg-[#1890FF] usm:flex-col rounded-t-[1rem] usm:rounded-[1rem] rounded-bl-[1rem] min-w-full py-5 px-[40px] flex justify-center relative">
                <div className="w-full">
                  <div className="flex items-center justify-between px-[30px] bg-white rounded-[1rem] py-2 mb-12">
                    <div className="h-[30px]">
                      <Image
                        src={logo}
                        alt="Clover"
                        width={91.83}
                        height={30}
                      />
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
                        A Digital Suite,{" "}
                      </span>{" "}
                      perfect for <br className="st:hidden"></br> your DAO.
                    </h1>

                    <span className="text-white mb-6 font-light block">
                      With all your DAO members, tools and communication in{" "}
                      <br /> one place, your DAO can now be more productive than
                      ever.
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

                  <div className="flex bg-[#1891fe] items-center rounded-[1rem] p-5 justify-between min-h-[415px] mb-3 flex-col">
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
                <div className="pt-9 usm:pt-12 rounded-tr-[2rem] pb-[76px] min-w-[60.3%] z-[1] bg-white">
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
