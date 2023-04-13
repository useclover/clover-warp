import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image';
import logo from '../public/images/logo.png';
import styles from '../styles/Home.module.css';
import bgLogo from '../public/images/logolg.png';
import { createAlchemyWeb3 } from '@alch/alchemy-web3';
import { BiX } from "react-icons/bi";
import axios from 'axios';
import hero from '../public/images/phone.svg';
import { useState, useEffect, useContext } from 'react'
import { Alert, Button, Modal, Box, FormControl, TextField, IconButton } from "@mui/material";
import Loader from '../app/components/loader';
import web3 from "web3";
import contract from "../SimpleNFT.json";
import { makeNFTClient } from '../app/components/extras/storage/utoken';
import Router from 'next/router';
import { useAccount, useConnect, useNetwork, useSignMessage, useSigner } from 'wagmi';

import { db } from "../app/firebase";
import { ref, update, get, set, child } from "firebase/database";
import { ethers } from 'ethers';
import { balanceABI } from '../app/components/extras/abi';
import { notifications } from '../app/components/extras/storage/init';
import Link from 'next/link';
import trusted from "../public/images/trust.svg";
import { BsList } from 'react-icons/bs';

// 0x74367351f1a6809ced9cc70654c6bf8c2d1913c9;
const contractAddress: string = "0xaCDFc5338390Ce4eC5AD61E3dC255c9F2560D797";
const abi:any = contract.abi;



const Home: NextPage = () => {

 

  const { chain: chainId, chains } = useNetwork();

  const { address, isConnected } = useAccount();

  const { connectors, isLoading: connecting, connectAsync } = useConnect();

  const { isSuccess, signMessageAsync } = useSignMessage();

  const { data: signer } = useSigner();

  const [sidebar, setSidebar] = useState(false);

  const [isNotSupported, setSupport] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const handleClose = () => setOpen(false);
  const [failMessage, setFailMessage] = useState<string>('');
  
  const [userAddress, setUserAddress] = useState<string>('');

  const [name, setName] = useState<string>('');
  const [des, setDes] = useState<string>('');
  const [contractAd, setContractAd] = useState<string>('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [part, setPart] = useState<string>("");
  const [bigLoader, setBigLoader] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const [start, setStart] = useState<boolean>(false);

  const useClose = () => setShowModal(false)

  const closeStart = () => setStart(false);

  let nft:any = "";

  const generateNftData = async (name: string, owner: string, desc?: string) => {

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

    console.log(receiver);

    try{
      
      const signer = new ethers.Wallet(process.env.NEXT_PUBLIC_MATIC_PRIVATE_KEY || '', provider);

      const token = new ethers.Contract(contractAddress, abi, signer);


      const receipt = await token.mintTokens(
        receiver,
        tokenURI
      );

      console.log(receipt);

      return "continue";

    }catch(err){

      console.log(err)

    }
  };

  

  const [updatex, setUpdatex] = useState<{
    name?: string,
    contract?: string,
    main?: string,
    table?:string 
  }>({});




  const sumitDeets = async () => {
      setLoading(true)
      
      let send: boolean = false; 
      
      if (!isConnected) {
        await connectAsync({ connector: connectors[0] });
      }


     try{      

      const signedHash = await signMessageAsync({
              message: "Registering A DAO",
          });


      const userAddress: string = address as `0x${string}`;


      if (!name.length) {
        setFailMessage("Name is required"); 
        setLoading(false);         
        return;
      }

      if(des.length > 300){
        setFailMessage("Description requires a max of 300 characters");
        setLoading(false);
        return;
      }

      if (!contractAd.length) {
        setFailMessage(
          "A contract address is required if you dont have one leave as default"
        );
        setLoading(false);
        return;
      } else if (contractAd.toLowerCase().trim() == "default") {
        if (participants.length) {
          participants.forEach(async (v) => {
            if (!ethers.utils.isAddress(v)) {
              setLoading(false);
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
          setLoading(false);
          setFailMessage("Your contract address does not exist in your wallet");
          return;
        }

        send = true;
      }

        const nftown: string[] = participants;

        try {
          const dbData = await get(child(ref(db), "DAOs"));

          const idMain = dbData.exists()
            ? (dbData.val().length || dbData.val().length - 1)
            : 0;


          const rand = `CF${Math.floor(Math.random() * 999)}-${Math.floor(Math.random() * 999)}-${Math.floor(Math.random() * 999)}`;

          const payload: any = {
            contract : (contractAd.toLowerCase()).trim() == 'default' ? contractAddress : contractAd,
            joined: participants,
            desc: des || '',
            name,
            randId: rand
          }
          

          if (contractAd.toLowerCase().trim() == "default") {
            nftown.push(userAddress);
            const metadata = await generateNftData(
              name,
              userAddress,
              des.length ? des : undefined
            );

            for (let i = 0; i < nftown.length; i++) {
              const trans = await mintNFT(metadata, nftown[i]);
            }

            payload['metadata'] = userAddress;

            await set(ref(db, `DAOs/${idMain}`), payload);

              
              localStorage.setItem(
                "cloverlog",
                JSON.stringify({
                  id: idMain,
                  name,
                  contract: contractAddress,
                  data: rand,
                  participants
                })
              );

              notifications({ title: `You were added to ${name} on clover`, message: 'click me to log in to your DAO', exclude: userAddress, receivers: participants });
            
            
          } else {

            
            await set(ref(db, `DAOs/${idMain}`), payload);
              

              localStorage.setItem(
                "cloverlog",
                JSON.stringify({
                  id: idMain,
                  name,
                  contract: contractAd,
                  data: rand,
                  participants: [address]         
                })
              );  
          }

          Router.push("/dashboard");
        } catch (err) {
          setLoading(false);
          console.log(err);
          setFailMessage("Something went wrong, please try again");
        }

       } catch(err) {
        const error = err as Error;

        console.log(error)
        setLoading(false);
          setFailMessage("Something went wrong, please try again")
       }

  }

  
  const [exec, setExec] = useState<object[]>([]);

  const login = async () => {

    setLoginError('');
    setBigLoader(true)

    setExec([]);

      setSupport(false)
  
      try {

        const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/filecoin_testnet");

          let add: any;  

          if(!isConnected){

            add = await connectAsync({ connector: connectors[0] });

          }
        
          const signedHash = await signMessageAsync({ message: 'Welcome back to clover' });


            console.log('connected');

            const userAddress:string = address as `0x${string}`;
            
            console.log(add, userAddress, signedHash);

            try {
            
            
        const validateAddress = ethers.utils.verifyMessage(
          "Welcome back to clover",
          signedHash
        );

        if (
          validateAddress.toLowerCase() ==
          (add?.account || userAddress).toLowerCase()
        ) {
          get(child(ref(db), "DAOs"))
            .then(async (data) => {
              if (data.exists()) {

                console.log(data, 'ss')

                const dao = data.val().filter((a: any) => a.contract);

                const sdao = [];

                if (dao.length) {

                  const checked: string[] = [];

                  for (let i = 0; i < dao.length; i++) {
                    if (dao[i].contract.toLowerCase() == contractAddress) {
                      const { joined } = dao[i];

                      joined.forEach((val: string) => {
                        if (
                          val.toLowerCase() ==
                          (add?.account || userAddress).toLowerCase()
                        ) {
                          sdao.push({ ...dao[i], id: i });
                        }
                      });
                    } else {

                  
                      if (checked.indexOf(dao[i].contract) != -1) {
                        continue;
                      }else{
                        checked.push(dao[i].contract);
                      }

                      console.log(dao[i].contract, "contract");

                      let balance: any = 0;

                      try {
                      const token = new ethers.Contract(
                        dao[i].contract,
                        balanceABI,
                        provider
                      );

                       balance = ethers.utils.formatEther(
                        await token.balanceOf(address)
                      );
                    }catch (err) {
                      const error = err as Error;
                      console.log(error);
                    }

                      if (Number(balance) > 0) {
                        sdao.push({ ...dao[i], id: i });
                      }
                    }
                  }
                }

            if (sdao.length) {
                 

            if (sdao.length > 1) {

              setExec([...sdao]);

              setShowModal(true);

              setBigLoader(false);

            } else {

              console.log("xxv.2");
              const vv: any = sdao[0];

              const name: string = vv.name;
              const contract: string = vv.contract;
              const data:string = vv.randId;

              const joined:boolean = vv.joined.indexOf(userAddress) == -1; 
              
              let list: any[] = [];

              if (joined) {

                list = [ ...vv.joined, userAddress ];

                  const query = ref(db, `DAOs/${vv.id}/joined`);

                  await update(query, list);


              }else{
                console.log(userAddress, vv.joined)
              }


              localStorage.setItem(
                "cloverlog",
                JSON.stringify({
                  id: vv.id,
                  name,
                  contract,
                  data,
                  participants: list.length ? list : vv.joined
                })
              );
              

              Router.push("/dashboard");

            }

                } else {
                   setBigLoader(false);
                   setSupport(false);
                   setLoginError("No registered daos found");
                   return;
                }
              } else {
                setBigLoader(false);
                setSupport(false);
                setLoginError("No registered daos found");
                return;
              }
            })
            .catch((err) => {

              console.log(err)
              setBigLoader(false);
              setSupport(false);
              setLoginError("Something went wrong please try again");
              return;
            });
        } else {
          setBigLoader(false);
          setSupport(false);
          setLoginError("Invalid Address");

          return;
        }


            } catch (err) {

              const error = err as any;

              setBigLoader(false);
              setSupport(false);
              setLoginError(error.response.data.message || error.message);

            }


        }catch (err) {

          const error = err as Error

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

      <Modal open={sidebar} onClose={() => setSidebar(false)}>
        <div className="w-screen overflow-y-scroll overflow-x-hidden absolute h-screen flex items-center bg-[#ffffffb0]">
          <div className="2usm:px-0 mx-auto max-w-[900px] 2usm:w-full relative w-[85%] usm:m-auto min-w-[340px] px-6 my-8 items-center">
            <div className="min-h-screen fixed w-[60%] top-0 left-0 justify-center bg-white flex flex-col shadow-lg shadow-[#cccccc]">
              <div className="flex top-0 pt-5 pb-2 items-center justify-between px-4 absolute w-full">
                <div className="h-[30px]">
                  <Image src={logo} alt="Clover" width={91.83} height={30} />
                </div>

                <IconButton onClick={() => setSidebar(false)}>
                  <BiX className="text-[#1891fe]" size={30} />
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

      <Modal open={start} onClose={closeStart}>
        <div className="w-screen overflow-y-scroll overflow-x-hidden absolute h-screen flex items-center bg-[#ffffffb0]">
          <div className="2usm:px-0 mx-auto max-w-[900px] 2usm:w-full relative w-[85%] usm:m-auto min-w-[340px] px-6 my-8 items-center">
            <div className="rounded-lg bg-white shadow-lg shadow-[#cccccc]">
              <div className="border-b flex justify-between py-[14px] px-[17px] text-xl font-bold">
                Get Started
                <BiX
                  size={20}
                  className="cursor-pointer"
                  onClick={closeStart}
                />
              </div>

              <div className={styles.container}>
                <div className="h-[300px] flex flex-col justify-center">
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
                        onClick={() => setOpen(true)}
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
        </div>
      </Modal>

      {showModal ? (
        <div
          className={`justify-center bg-[rgba(255,255,255,.4)] mt-[74px] flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none`}
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
                      const name: string = vv.name;
                      const contract: string = vv.contract;
                      const data: string = vv.randId;

                      localStorage.setItem(
                        "cloverlog",
                        JSON.stringify({
                          id: vv.id,
                          name,
                          contract,
                          data,
                          participants: vv.joined,
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

      <Modal open={open} onClose={handleClose}>
        <div className="w-screen overflow-y-scroll overflow-x-hidden absolute h-screen flex items-center bg-[#ffffffb0]">
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
                Register DAO
                <BiX
                  size={20}
                  className="cursor-pointer"
                  onClick={handleClose}
                />
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
                      px: 5,
                      py: 3,
                    }}
                  >
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
                    <div className="mt-3">
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
                    <div className="my-3">
                      <TextField
                        fullWidth
                        id="outlined-basic"
                        label="Contract Address"
                        variant="outlined"
                        helperText="Contract address of the token that would allow users into the DAO - use `default` if you want one generated by us"
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

                    {contractAd.toLowerCase().trim() == "default" && (
                      <>
                        <div className="py-3 font-bold">Participants</div>
                        <div className="flex w-full my-2 cusscroller overflow-hidden overflow-x-scroll items-center">
                          {participants.map((e, i: number) => (
                            <div
                              className="border text-[#777] border-solid ml-[2px] rounded p-2"
                              key={i}
                            >
                              {e.substring(0, 5) +
                                "...." +
                                e.substring(e.length - 5, e.length)}
                            </div>
                          ))}
                        </div>

                        <TextField
                          fullWidth
                          id="outlined-basic"
                          helperText="if left empty, only you would have access to the DAO"
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
                                const partx: string[] = participants;
                                partx.push(part);

                                setParticipants(partx);

                                setPart("");
                              }
                            }
                          }}
                          onBlur={(e: any) => {
                            setPart(e.target.value);
                            if (part.length) {
                              const partx: string[] = participants;
                              partx.push(part);
                              setParticipants(partx);
                              setPart("");
                            }
                          }}
                        />
                      </>
                    )}

                    <Button
                      variant="contained"
                      className="!bg-[#1891fe] !mt-4 !py-[13px] !font-medium !capitalize"
                      style={{
                        fontFamily: "inherit",
                      }}
                      onClick={() => {
                        setFailMessage("");
                        sumitDeets();
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

      {!bigLoader && (
        <div className="min-w-screen max-h-screen overflow-y-scroll overflow-x-hidden cusscroller  bg-white p-4">
          <div className="bg-[#1890FF] rounded-t-[1rem] usm:rounded-[1rem] rounded-bl-[1rem] min-w-full py-5 px-[40px] flex justify-center relative">
            <div className="w-full">
              <div className="flex items-center justify-between px-[30px] bg-white rounded-[1rem] py-2 mb-12">
                <div className="h-[30px]">
                  <Image src={logo} alt="Clover" width={91.83} height={30} />
                </div>

                <div className="flex items-center w-[150px] mmd:hidden  justify-between">
                  <Link href="#">
                    <span className="text-[#1890FF] text-[14px]">Product</span>
                  </Link>

                  <Link href="#">
                    <span className="text-[#1890FF] text-[14px]">
                      Solutions
                    </span>
                  </Link>
                </div>

                <IconButton
                  className="hidden mmd:block"
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
                <h1 className="font-bold mb-3 mst:text-[40px] text-[60px] cursor-default text-white">
                  {" "}
                  <span className="text-[#ECB22F]">A digital Suite, </span>{" "}
                  perfect for <br className="st:hidden"></br> your DAO.
                </h1>

                <span className="text-white mb-6 font-light block">
                  With all your DAO members, tools and communication in <br />{" "}
                  one place, your DAO can now be more productive than ever.
                </span>

                <Button
                  onClick={() => setStart(true)}
                  className="!bg-[#387CF7] !border-solid !border-white !border-[2px] !mb-5 !rounded-[.5rem] !text-white !mt-0 !py-3 !px-4 !font-medium !capitalize"
                >
                  Get started
                </Button>
              </div>
            </div>

            <div className="usm:hidden">
              <img
                className="absolute z-10 mst:!w-[330px] right-0 -bottom-[12.9pc]"
                width={370}
                height={500}
                src={hero.src}
                alt="hero"
              />
            </div>
          </div>

          <div className="flex items-center relative px-10 justify-between">
            <div className="pt-9 usm:pt-12 rounded-tr-[2rem] pb-[47px] min-w-[60%] z-[1] bg-white">
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

            <div className="bg-[#1891fe] right-0 top-0 w-[45%] h-[196px] absolute rounded-br-[1rem] usm:hidden">
              <div className="w-[90.4%] rounded-b-[1rem] bg-[#1891fe] right-0 h-[30px] absolute bottom-[-10px]"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // return (
  //   <>
  //     {bigLoader && <Loader />}

  //     {!bigLoader && (
  //       <div className={styles.container}>
         

  
  //         <div className="h-screen flex flex-col justify-center">
  //           {Boolean(loginError.length) && (
  //             <Alert className="my-2" severity="error">
  //               {loginError}
  //             </Alert>
  //           )}
  //           <div className="flex justify-around">
  //             <div className="items-center mt-4 top-0 absolute flex justify-center">
  //               <Image src={logo} alt="Clover" width={150} height={49.995} />
  //             </div>
  //             <div className="self-center">
  //               <Button
  //                 onClick={login}
  //                 style={{
  //                   fontFamily: "Poppins",
  //                 }}
  //                 className="!py-4 !px-8 rounded-lg !capitalize !font-semibold !text-xl !text-white !bg-[#1891fe]"
  //               >
  //                 Authenticate
  //               </Button>
  //             </div>
  //             <div className="self-center">
  //               <Button
  //                 onClick={() => setOpen(true)}
  //                 style={{
  //                   fontFamily: "Poppins",
  //                 }}
  //                 className="!py-4 !px-8 rounded-lg !capitalize !font-semibold !text-xl !text-white !bg-[#1891fe]"
  //               >
  //                 Register DAO
  //               </Button>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     )}
  //   </>
  // );
}

export default Home
