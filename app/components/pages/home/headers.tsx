import Image from "next/image";
import logo from "../../../../public/images/logo.png";
import Link from "next/link"
import { Button, IconButton, Modal } from "@mui/material";
import { BiChevronRight, BiX } from "react-icons/bi";
import { useState, useContext } from "react";
import { BsList } from "react-icons/bs";
import { IndexContext } from "../../../contexts/IndexContext";
import { IndexContextProps } from "../../types";

const Nav = () => {

    const [open, setOpen] = useState<boolean>(false);

    const { registerModal, login } = useContext<IndexContextProps>(IndexContext);

    return (
      <>
        <Modal open={open} onClose={() => setOpen(false)}>
          <div className="w-screen overflow-y-scroll overflow-x-hidden absolute h-screen cusscroller flex items-center bg-[#ffffffb0]">
            <div className="2usm:px-0 mx-auto max-w-[900px] 2usm:w-full relative w-[85%] usm:m-auto min-w-[340px] px-6 my-8 items-center">
              <div className="min-h-screen fixed w-[60%] top-0 left-0 justify-center bg-white flex flex-col shadow-lg shadow-[#cccccc]">
                <div className="flex top-0 pt-5 pb-2 items-center justify-between px-4 absolute w-full">
                  <div className="h-[30px]">
                    <Image src={logo} alt="Clover" width={91.83} height={30} />
                  </div>

                  <IconButton onClick={() => setOpen(false)}>
                    <BiX className="text-[#5e43ec]" size={30} />
                  </IconButton>
                </div>

                <Link href="https://test.useclover.xyz">
                  <h1 className="flex text-[#5e43ec] justify-between py-[14px] px-[17px] text-[25px] cursor-pointer font-bold">
                    Testnet
                  </h1>
                </Link>

                {/* <Link href="/pricing">
                  <h1 className="flex text-[#5e43ec] justify-between py-[14px] px-[17px] text-[25px] cursor-pointer font-bold">
                    Pricing
                  </h1>
                </Link> */}

                <h1
                  onClick={() => {
                    setOpen(false);
                    login?.();
                  }}
                  className="flex text-[#5e43ec] justify-between py-[14px] px-[17px] text-[25px] cursor-pointer font-bold"
                >
                  Authenticate
                </h1>
                <h1
                  onClick={() => {
                    setOpen(false);
                    registerModal?.(true);
                  }}
                  className="flex text-[#5e43ec] justify-between py-[14px] px-[17px] text-[25px] cursor-pointer font-bold"
                >
                  Register
                </h1>
              </div>
            </div>
          </div>
        </Modal>
        <div className="flex items-center py-3 justify-between px-11 fixed w-full left-0 top-0 z-10 bg-[rgba(7,5,30,.20)] backdrop-blur-[22px]">
          <div className="flex items-center justify-between w-[30%] min-w-[320px]">
            <div className="h-[30px]">
              <Image src={logo} alt="Clover" width={91.83} height={30} />
            </div>
            <Link href={"https://test.useclover.xyz"}>
              <a
                className="py-[14px] mmsst:!hidden text-white px-3 text-[14px] flex items-center justify-center"
                target="_blank"
              >
                Testnet
              </a>
            </Link>
            <Link href={"/pricing"}>
              <a className="py-[14px] mmsst:!hidden text-white px-3 text-[14px] flex items-center justify-center">
                Pricing
              </a>
            </Link>
          </div>

          <div className="flex items-center justify-between mmsst:min-w-fit min-w-[390px]">
            <Button
              style={{
                fontFamily: "Poppins",
              }}
              onClick={login}
              className="!py-[9px] !px-4 !border !border-solid !border-[#797979] !rounded-[9px] !font-[300] mmsst:!hidden !normal-case !text-[12px] !text-white !flex !items-center !bg-[#29292b] backdrop-blur-[10px]"
            >
              Authenticate your DAO
              <BiChevronRight size={18} className="ml-1" />
            </Button>

            <Button
              onClick={() => registerModal?.(true)}
              style={{
                fontFamily: "Poppins",
              }}
              className="!py-[9px] !px-4 !border !border-solid !border-[#5e43ec] !rounded-[9px] mmsst:!hidden !font-[300] !normal-case !text-[12px] !text-white !flex !items-center !bg-[#5e43ec]"
            >
              Register your DAO
              <BiChevronRight size={18} className="ml-1" />
            </Button>
            <IconButton
              className="!hidden mmsst:!block"
              onClick={() => setOpen(true)}
            >
              <BsList className="text-[#5e43ec] cursor-pointer text-[30px]" />
            </IconButton>
          </div>
        </div>
      </>
    );
}

export default Nav;