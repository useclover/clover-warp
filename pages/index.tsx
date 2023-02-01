import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image';
import logo from '../public/images/logo.png';
import styles from '../styles/Home.module.css';
import bgLogo from '../public/images/logolg.png';
import { BiX } from "react-icons/bi";
import axios from 'axios';
import { useMoralis } from 'react-moralis'
import { useState, useEffect, useContext } from 'react'
import { Alert, Button, Modal, Box, FormControl, TextField } from "@mui/material";
import Loader from '../app/components/loader';
import web3 from "web3";
import contract from "../artifacts/contracts/share.sol/simpleNFT.json";
import { makeNFTClient } from '../app/components/extras/storage/utoken';
import { LogContext } from '../app/components/extras/contexts/logContext';
import { initData } from '../app/components/extras/storage';
import Router from 'next/router';
import { supported } from '../app/components/extras/connectors';
import { useAccount, useConnect, useNetwork, useSignMessage, useSigner } from 'wagmi';

import { db } from "../app/firebase";
import { ref, update, get, set, child } from "firebase/database";


const contractAddress: string = "0xaCDFc5338390Ce4eC5AD61E3dC255c9F2560D797";
const abi:any = contract.abi;



const Home: NextPage = () => {

  const {
    isAuthenticated,
    authenticate,
    logout,
    Moralis
  } = useMoralis();

  const { chain: chainId, chains } = useNetwork();

  const { address, isConnected } = useAccount();

  const { connectors, isLoading: connecting, connectAsync } = useConnect();

  const { isSuccess, signMessageAsync } = useSignMessage();

  const { data: signer } = useSigner();

  const [isNotSupported, setSupport] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const handleClose = () => setOpen(false);
  const [failMessage, setFailMessage] = useState<string>('');
  const loginData = useContext(LogContext);
  const [userAddress, setUserAddress] = useState<string>('');
  

  useEffect(() => {

      if (isNotSupported) {
        logout();
      }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNotSupported]);



  const logOut = async () => {
    if (isAuthenticated) {
      logout()
    }
  };

  const [name, setName] = useState<string>('');
  const [des, setDes] = useState<string>('');
  const [contractAd, setContractAd] = useState<string>('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [part, setPart] = useState<string>("");
  const [bigLoader, setBigLoader] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const useClose = () => setShowModal(false)


  let nft:any = "";

  const generateNftData = async (name: string, owner: string, desc?: string) => {

    const nfx = makeNFTClient(
      await Moralis.Cloud.run("getNFTStorageKey")
      ); 

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

    const web3js = new web3("https://api.hyperspace.node.glif.io/rpc/v1");
    
    const nftContract = new web3js.eth.Contract(abi, contractAddress);

    console.log(receiver);

    try{

    const nonce = await web3js.eth.getTransactionCount(
      process.env.PUBLIC_KEY || "",
      "latest"
    ); //get latest nonce
    //the transaction
    const tx = {
      from: process.env.PUBLIC_KEY,
      to: contractAddress,
      nonce,
      gas: 500000,
      data: nftContract.methods.mintTokens(receiver, tokenURI).encodeABI(),
    };

    const signPromise = await web3js.eth.accounts.signTransaction(
      tx,
      process.env.MATIC_PRIVATE_KEY || ""
    );

    const receipt = await web3js.eth.sendSignedTransaction(signPromise.rawTransaction || "")

    console.log(receipt)

    return 'continue';

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

  useEffect(() => {
    if (loginData.update) {
    loginData.update({ ...updatex });
    }
  }, [updatex]);


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

      if(!contractAd.length){
          setFailMessage("A contract address is required if you dont have one leave as default");
          setLoading(false);
          return;

      }else if(((contractAd).toLowerCase()).trim() == 'default'){

      if (participants.length) {
        
          participants.forEach(async (v) => {

            const res = await axios.get(
              `https://api.covalenthq.com/v1/80001/address/${v}/balances_v2/?quote-currency=USD&format=JSON&nft=true&no-nft-fetch=false&key=ckey_d8fd93851d6a4d57bdcf14a337d`
            );

           const main = res.data;

           if(main.error){
            setLoading(false);
               setFailMessage(
                 `Error Retrieving data from ${v}, check the address and try again`
               );
              return;
           }else{
              console.log('works')
           }
         })
      }
      
        send = true;
        console.log('default herex')

        // send nft to dao

      }else{

           const res = await axios.get(
             `https://api.covalenthq.com/v1/80001/address/${userAddress}/balances_v2/?quote-currency=USD&format=JSON&nft=true&no-nft-fetch=false&key=ckey_d8fd93851d6a4d57bdcf14a337d`
           );

           const main = res.data;   
           let active = false;
            main.data.items.forEach((v:any) => {
                if (v["contract_address"] !== undefined) {
                    if(v['contract_address'] == contractAd){
                        active = true;
                    }
                }
            })

            if(!active){
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
                })
              );
            
            
          } else {

            
            await set(ref(db, `DAOs/${idMain}`), payload);
              

              localStorage.setItem(
                "cloverlog",
                JSON.stringify({
                  id: idMain,
                  name,
                  contract: contractAd,
                  data: rand,
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

        if(!isConnected){

          await connectAsync({ connector: connectors[0] });

        }
      
          const signedHash = await signMessageAsync({ message: 'Welcome back to clover' });


            console.log('connected');

            const userAddress:string = address as `0x${string}`;
            
            console.log(userAddress, signedHash);

            try {
 
            const { data: results } = await axios.post('/api/auth', { hash: signedHash, address: userAddress }, {
              baseURL: window.origin
            });            
            

            if (results.daos.length > 1) {

              setExec([...results.daos]);

              setShowModal(true);

              setBigLoader(false);

            } else {

              console.log("xxv.2");
              const vv: any = results.daos[0];

              const name: string = vv.name;
              const contract: string = vv.contract;
              const data:string = vv.randId;

              const joined:boolean = vv.joined.indexOf(userAddress) == -1; 
              
              if (joined) {

                const list = [ ...vv.joined, userAddress ];

                await axios.post('/api/auth/login', { list, id: vv.id }, { baseURL: window.origin });


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
                })
              );
              

              Router.push("/dashboard");

            }            

            } catch (err) {

              const error = err as any;

              setBigLoader(false);
              setSupport(false);
              setLoginError(error.response.data.message || error.message);

            }

            return;

             const res = await axios.get(
               `https://api.covalenthq.com/v1/80001/address/${userAddress}/balances_v2/?quote-currency=USD&format=JSON&nft=true&no-nft-fetch=false&key=ckey_d8fd93851d6a4d57bdcf14a337d`
             );

              console.log(res.data)

             const main = res.data.data.items;

             if(!res.data.error){

                for (let i = 0; i < main.length; i++) {
                  const v:any = main[i];

                  const DAO = Moralis.Object.extend("DAOs");

                  const mQ = new Moralis.Query(DAO);
                  mQ.equalTo("contract", v.contract_address);
                  console.log('contracted')

                  if (
                    contractAddress == (v.contract_address).toLowerCase().trim()
                  ) {

                    console.log('personal contract')

                    for(let ii = 0; ii < v.nft_data.length; ii++){

                      const vv = v.nft_data[ii].external_data;
                      
                      mQ.equalTo("name", vv.name);

                      if (vv.attributes[0].main !== undefined) {
                        mQ.equalTo("userContract", vv.attributes[0].main);
                        console.log('verified')
                        const ld = await mQ.find();
                      

                        if (ld.length) {

                          exec.push({
                            name: vv.name,
                            description: vv.description,
                            contract: contractAddress,
                            image: vv.image,
                            main: vv.attributes[0].main,
                            table:
                              ld[0].attributes.tablename !== undefined
                                ? ld[0].attributes.tablename
                                : undefined,
                          });
                          
                        }
                      }
                    }

                    setExec([...exec]);
            
                  } else {
                    const ld = await mQ.find();
                    console.log('unk 1')
                    if (ld.length) {
                      console.log('unk 2')
                      ld.forEach((vv: any) => {
                        exec.push({
                          name: vv.attributes.name,
                          contract: v.contract_address,
                          description:
                            vv.attributes.desc !== undefined
                              ? vv.attributes.desc
                              : `Access to ${vv.attributes.name} ${
                                  vv.attributes.name.toLowerCase().indexOf("dao") == -1
                                    ? "DAO"
                                    : ""
                                }`,
                          image: v.logo_url,
                          main: vv.attributes.userContract,
                          table:
                            vv.attributes.tablename !== undefined
                              ? vv.attributes.tablename
                              : undefined,
                        });
                      });
                    }

                    setExec([...exec]);

                  }
                }

                if (exec.length) {
                  
                } else {
                  setBigLoader(false);
                  setSupport(false);
                  setLoginError("No registered DAOs found");
                }    


             }else{

                setBigLoader(false);
                setSupport(false);
                setLoginError("No registered DAOs found");

             }


          

        }catch (err) {

          const error = err as Error

          setBigLoader(false);
          setLoginError(error.message);

        }
  };



  return (
    <>
      {bigLoader && <Loader />}

      {!bigLoader && (
        <div className={styles.container}>
          <Head>
            <title>Clover</title>
            <meta name="description" content="Chat as a DAO" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          {showModal ? (
            <div className="justify-center bg-[rgba(255,255,255,.4)] items-center flex overflow-x-hidden overflow-y-auto backdrop-blur fixed inset-0 z-50 outline-none focus:outline-none">
              <div className="relative max-w-[1200px] mmd:w-[70%] 4sm:w-[60%] w-[340px] min-w-[340px]">
                {/*content*/}
                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
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

                  <div className="relative p-6 flex flex-col justify-center 4sm:flex-row">
                    {exec.map((vv: any, i: number) => (
                      <button
                        key={i}
                        onClick={async () => {
                          
                          const name: string = vv.name;
                          const contract: string = vv.contract;
                          const data: string = vv.randId;

                          
                            
                            localStorage.setItem('cloverlog',
                              JSON.stringify({
                                name,
                                contract,
                                data,
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
                        <img
                          src={bgLogo.src}
                          alt={vv.name}
                          width={40}
                          height={40}
                        />
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
                              helperText="if left empty only you would have access to your , Polygon testnet addresses only"
                              variant="outlined"
                              value={part}
                              placeholder="click enter to add address"
                              onChange={(e:any) => {
                                  setPart(e.target.value)
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

          <div className="h-screen flex flex-col justify-center">
            {Boolean(loginError.length) && (
              <Alert className="my-2" severity="error">
                {loginError}
              </Alert>
            )}
            <div className="flex justify-around">
              <div className="items-center mt-4 top-0 absolute flex justify-center">
                <Image src={logo} alt="Clover" width={150} height={49.995} />
              </div>
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
      )}
    </>
  );
}

export default Home
