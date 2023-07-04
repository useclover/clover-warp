import { Button } from "@mui/material";
import Image from "next/image";
import { FaTwitter } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import nigeria from "../../../../public/images/nigeria.svg";
import Link from "next/link";
import { IndexContextProps } from "../../types";
import { useContext } from "react";
import { IndexContext } from "../../../contexts/IndexContext";

const Footers = () => {

    const { improve } =
      useContext<IndexContextProps>(IndexContext);

  return (
    <div className="px-11 2usm:px-5 py-4 bg-[#121212]">
      <div className="flex justify-between items-center border-b pb-[18px] border-b-solid border-b-[#474747] mb-[18px]">
        <Button
          onClick={() => improve?.(true)}
          style={{
            fontFamily: "Poppins",
          }}
          className="!py-[9px] !px-4 !border !border-solid !border-[#5e43ec] !rounded-[9px] !font-[300] !normal-case !text-[12px] !text-white !flex !items-center !bg-[#5e43ec]"
        >
          Help us Improve?
          <HiSparkles size={18} className="ml-1 text-[#ebf82d]" />
        </Button>
        <div className="flex items-center">
          <Link href="https://twitter.com/cloversuite">
            <Button
              style={{
                fontFamily: "Poppins",
              }}
              className="!py-[9px] !px-4 !border !border-solid !border-[#29292b] !rounded-[9px] !font-[300] !normal-case !text-[12px] !text-white !flex !items-center !bg-[#29292b] backdrop-blur-[10px]"
            >
              <FaTwitter size={18} className="mr-1" />
              Twitter
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex items-center mmdd:flex-col mmdd:items-start justify-between">
        <div className="flex mmdd:mb-2 items-center">
          <Image alt={"nigerian flag"} src={nigeria} height={13} width={20} />
          <span className="block ml-1 text-[14px] text-white">
            Lagos, Nigeria
          </span>
        </div>
        <div className="flex items-center">
          <Link href={"mailto:hello@useclover.xyz"}>
            <a
              className="block w-fit text-white text-[14px] mr-4"
              target={"_blank"}
            >
              Contact Clover
            </a>
          </Link>{" "}
          <span className="block text-white mr-4 w-fit text-[14px]">
            © 2023, Clover Suite
          </span>
        </div>
      </div>
    </div>
  );
};

export default Footers;
