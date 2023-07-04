import { Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import Nav from "../app/components/pages/home/headers";
import Head from "next/head";
import { HiSparkles } from "react-icons/hi";
import { BiChevronRight } from "react-icons/bi";
import Image from "next/image";
import voting from "../public/images/daovoting.png";
import voting2 from "../public/images/daovoting2.png";
import comms from "../public/images/seamcoms.png";
import comms2 from "../public/images/seamcoms2.png";
import help from "../public/images/comic.png";
import operator from "../public/images/operator.png";
import members from "../public/images/members.png";
import contributors from "../public/images/contributors.png";
import content from "../public/images/content.png";
import Link from "next/link";
import { BsArrowRightCircleFill, BsCheckLg } from "react-icons/bs";
import { useState } from "react";
import { FaVideo } from "react-icons/fa";
import Footers from "../app/components/pages/home/footers";

const Homepage = () => {
  const [billing, setBilling] = useState<string>("monthly");

  return (
    <>
      <Head>
        <title>CloverSuites - Seamless collaboration for DAOs</title>
        <meta name="description" content="CloverSuites is the easiest way to collaborate within a DAO. Enjoy DAO wide chats, calls, proposals and shared storage, at once." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-[#07051E] relative mmdd:h-[450px] mmdd:px-[23px] h-[550px] flex items-center px-[50px] w-full">
        <Nav />
        <div className="flex items-center w-full">
          <div className="max-w-[586px] relative z-[9]">
            <h2 className="text-white -mb-[11px] pl-[3px] 2usm:text-[18px] font-[500] st:text-[24px] text-[30px]">
              Seamless Communication
            </h2>
            <h1 className="mb-4 font-[600] text-[50px] 2usm:text-[28px] mmdd:text-[35px] st:text-[40px] txtColBase 2usm:mb-2 txtCol">
              Among DAO Operators
            </h1>
            <p className="block mb-6 font-[400] text-[15px] text-white">
              Easy communication, collaboration and foster community engagement
              within your decentralized autonomous organization.
            </p>
            <Button
              style={{
                fontFamily: "Poppins",
              }}
              className="!py-[9px] !px-4 !border !border-solid !border-[#5e43ec] !rounded-[9px] !font-[300] !normal-case !text-[12px] !text-white !flex !items-center !bg-[#5e43ec]"
            >
              Help us Improve?
              <HiSparkles size={18} className="ml-1 text-[#ebf82d]" />
            </Button>
          </div>
          <div className="h-full bg-heroimg bg-contain w-[270px] bg-no-repeat absolute right-0 top-0 z-0"></div>
        </div>
      </div>

      {/* end of hero */}

      <section className="mt-10 bg-[#F8EEEB] py-[30px] 2usm:px-5 px-11">
        <div className="mb-[30px]">
          <h2 className="font-[600] text-[30px] txtColBase txtColsub mb-4">
            We are building for our users
          </h2>

          <span className="text-[#07051E] min-w-[300px] w-1/2 font-[400] block text-[15px] mb-4">
            Clover Suite is revolutionizing communication for DAO operators. But
            we can&rsquo;t do it alone. We need your support to take our
            innovative product to the next level.
          </span>

          <Button
            style={{
              fontFamily: "Poppins",
            }}
            className="!py-[9px] !px-4 !border !border-solid !border-[#5e43ec] !rounded-[9px] !font-[300] !normal-case !text-[12px] !text-white !flex !items-center !bg-[#5e43ec]"
          >
            Register your DAO
            <BiChevronRight size={18} className="ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 st:grid-cols-1">
          <div className="bg-white p-6 item w-full min-w-[300px]">
            <div className="text-[#5e43ec] bg-[#F4F2FF] mb-5 text-[12px] font-[300] rounded-[9px] py-[6px] px-3 flex items-center w-fit">
              Coming soon
              <HiSparkles size={18} className="ml-1 text-[#ebf82d]" />
            </div>

            <h2 className="text-[#121212] font-[600] text-[20px] mb-4">
              DAO Voting Campaigns
            </h2>
            <span className="text-[#121212] font-[400] block text-[15px] mb-4">
              Cultivate a vibrant and engaged community within your DAO with our
              community-building tools
            </span>
            <div className="relative w-full h-auto mt-2">
              <Image
                src={voting}
                layout={"responsive"}
                alt={"DAO Voting Campaigns"}
              />
            </div>
          </div>

          <div className="bg-white p-6 item w-full min-w-[300px]">
            <div className="text-[#5e43ec] bg-[#F4F2FF] mb-5 text-[12px] font-[300] rounded-[9px] py-[6px] px-3 flex items-center w-fit">
              Coming soon
              <HiSparkles size={18} className="ml-1 text-[#ebf82d]" />
            </div>

            <h2 className="text-[#121212] font-[600] text-[20px] mb-4">
              Seamless Communication
            </h2>
            <span className="text-[#121212] font-[400] block text-[15px] mb-4">
              Cultivate a vibrant and engaged community within your DAO with our
              community-building tools
            </span>
            <div className="relative w-full h-auto mt-2">
              <Image
                src={comms}
                layout={"responsive"}
                alt={"Seamless Communication"}
              />
            </div>
          </div>

          <div className="bg-white p-6 item w-full min-w-[300px]">
            <div className="text-[#5e43ec] bg-[#F4F2FF] mb-5 text-[12px] font-[300] rounded-[9px] py-[6px] px-3 flex items-center w-fit">
              Coming soon
              <HiSparkles size={18} className="ml-1 text-[#ebf82d]" />
            </div>

            <h2 className="text-[#121212] font-[600] text-[20px] mb-4">
              DAO Voting Campaigns
            </h2>
            <span className="text-[#121212] font-[400] block text-[15px] mb-4">
              Cultivate a vibrant and engaged community within your DAO with our
              community-building tools
            </span>
            <div className="relative w-full h-auto mt-2">
              <Image
                src={voting2}
                layout={"responsive"}
                alt={"DAO Voting Campaigns"}
              />
            </div>
          </div>

          <div className="bg-white p-6 item w-full min-w-[300px]">
            <div className="text-[#5e43ec] bg-[#F4F2FF] mb-5 text-[12px] font-[300] rounded-[9px] py-[6px] px-3 flex items-center w-fit">
              Coming soon
              <HiSparkles size={18} className="ml-1 text-[#ebf82d]" />
            </div>

            <h2 className="text-[#121212] font-[600] text-[20px] mb-4">
              Seamless Communication
            </h2>
            <span className="text-[#121212] font-[400] block text-[15px] mb-4">
              Cultivate a vibrant and engaged community within your DAO with our
              community-building tools
            </span>
            <div className="relative w-full h-auto mt-2">
              <Image
                src={comms2}
                layout={"responsive"}
                alt={"Seamless Communication"}
              />
            </div>
          </div>
        </div>
      </section>
      {/* end of features page */}

      <section className="px-11 bg-[#F6F7F8] 2usm:px-5 py-[30px] mt-2">
        <div className="bg-[#201f25] rounded-[6px] w-full items-center justify-between flex p-10">
          <div className="w-1/2 sst:w-full flex items-start h-full justify-evenly flex-col">
            <h1 className="text-white font-bold mmsm:text-[30px] text-[38px] mb-3">
              Help us fuel the future of DAO communication
            </h1>

            <p className="text-white text-[17px] block mb-5">
              At UseClover, we are revolutionizing communication for DAO
              operators. But we can&rsquo;t do it alone. We need your support to
              take our innovative product to the next level.
            </p>

            <Button
              style={{
                fontFamily: "Poppins",
              }}
              className="!py-[9px] !px-4 !border !border-solid !border-[#5e43ec] !rounded-[9px] !font-[300] !normal-case !text-[12px] !text-white !flex !items-center !bg-[#5e43ec]"
            >
              Help us Improve?
            </Button>
          </div>
          <div className="h-auto sst:hidden relative w-[45%]">
            <Image src={help} layout={"responsive"} alt={"Help us Improve?"} />
          </div>
        </div>
      </section>
      {/* end of improve us */}

      <section className="px-11 bg-[#F6F7F8] 2usm:px-5 py-[30px]">
        <h2 className="font-[600] st:text-[25px] text-[30px] txtColBase txtColsub mb-6">
          See some of our user fan base
        </h2>

        <div className="grid grid-cols-2 gap-4 st:grid-cols-1">
          <div className="bg-[#e2e7e7] rounded-[9px] p-7 item w-full min-w-[300px]">
            <h2 className="text-[#121212] font-[600] text-[25px] mb-4">
              DAO Operators
            </h2>
            <span className="text-[#121212] font-[400] block text-[14px] mb-4">
              You are responsible for managing and operating DAOs. You would
              useclover to enhance communication, collaboration, and
              decision-making within your DAO.
            </span>

            <Button
              style={{
                fontFamily: "Poppins",
              }}
              className="!py-[9px] !px-4 !border !border-solid !border-[#121212] !rounded-[9px] !font-[300] !normal-case !text-[12px] !text-white !flex !items-center mb-6 !bg-[#121212]"
            >
              Register your DAO
              <HiSparkles size={18} className="ml-1 text-[#ebf82d]" />
            </Button>

            <div className="flex w-full relative h-auto items-center">
              <Image src={operator} alt={"DAO Operators"} />
            </div>
          </div>

          <div className="bg-[#efe6fc] rounded-[9px] p-7 item w-full min-w-[300px]">
            <h2 className="text-[#121212] font-[600] text-[25px] mb-4">
              DAO Members
            </h2>
            <span className="text-[#121212] font-[400] block text-[15px] mb-4">
              You actively engage in discussions, voting and community
              interactions. You would utilize clover to communicate with other
              members, stay informed about DAO activities, and contribute to
              decision-making processes.
            </span>

            <Button
              style={{
                fontFamily: "Poppins",
              }}
              className="!py-[9px] !px-4 !border !border-solid !border-[#121212] !rounded-[9px] !font-[300] !normal-case !text-[12px] !text-white !flex !items-center mb-6 !bg-[#121212]"
            >
              Authenticate
              <HiSparkles size={18} className="ml-1 text-[#ebf82d]" />
            </Button>

            <div className="flex relative justify-center w-full h-auto items-center">
              <Image src={members} alt={"DAO Members"} />
            </div>
          </div>
        </div>
        <div className="w-full bg-[#f8f6f2] rounded-[9px] p-7 mt-3 flex justify-center st:flex-col-reverse items-start">
          <div className="w-[25%] st:w-full relative h-auto min-w-[200px] flex mr-8 justify-center items-center">
            <Image src={contributors} alt={"DAO contributors"} />
          </div>
          <div className="w-[45%] st:w-full">
            <h2 className="text-[#121212] font-[600] text-[25px] mb-5">
              DAO Contributors, <br /> Developers and Advisors
            </h2>
            <span className="text-[#121212] font-[400] block text-[15px] mb-4">
              You contribute resources, expertise, or funding to DAOs. You may
              useclover to communicate with DAO operators and other
              contributors, discuss project proposals, and stay updated on the
              progress and outcomes of the DAO.
            </span>
          </div>
        </div>
      </section>

      {/* end of usrs */}

      {/* <section className="px-11 bg-[#F6F7F8] 2usm:px-5 py-[30px]">
        <div className="flex items-center st:flex-col st:items-start justify-between">
          <h2 className="font-[600] st:text-[25px] text-[30px] txtColBase txtColsub mb-6">
            Browse our growing content library
          </h2>
          <Button
            style={{
              fontFamily: "Poppins",
            }}
            className="!py-[9px] !px-4 !border !border-solid !border-[#121212] !rounded-[9px] !font-[300] !normal-case !text-[12px] !text-white !flex !items-center mb-6 !bg-[#121212]"
          >
            See everything
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 st:grid-cols-1">
          <div className="bg-white item w-full min-w-[300px]">
            <div className="">
              <Image src={content} alt={"Content Library"} />
            </div>
            <div className="p-5">
              <h2 className="text-[#121212] font-[500] text-[17px] mb-4">
                The title of the blog post could be a one liner or maybe a two
                liner
              </h2>
              <Link href={"/ee"}>
                <a className="text-[#121212] font-[400] flex items-center text-[15px] mb-4">
                  Learn more{" "}
                  <BsArrowRightCircleFill className="ml-2" size={18} />
                </a>
              </Link>
            </div>
          </div>
          <div className="bg-white item w-full min-w-[300px]">
            <div className="">
              <Image src={content} alt={"Content Library"} />
            </div>
            <div className="p-5">
              <h2 className="text-[#121212] font-[500] text-[17px] mb-4">
                The title of the blog post could be a one liner or maybe a two
                liner
              </h2>
              <Link href={"/ee"}>
                <a className="text-[#121212] font-[400] flex items-center text-[15px] mb-4">
                  Learn more{" "}
                  <BsArrowRightCircleFill className="ml-2" size={18} />
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section> */}

      {/* <section className="px-11 py-[30px] 2usm:px-5 bg-[#f6f7f8]">
        <div className="flex items-center st:flex-col st:items-start justify-between mb-5">
          <div>
            <span className="uppercase block text-[15px] mb-1">
              pricing plan
            </span>

            <h2 className="text-[37px] font-[400] mb-1">Membership Plans</h2>

            <span className="text-[#121212] font-[400] block text-[15px] mb-4">
              Choose a plan that suits you and your DAO
            </span>
          </div>

          <ToggleButtonGroup
            value={billing}
            sx={{
              justifyContent: "space-between",
              marginBottom: "0px !important",
              width: "100%",
              "& .Mui-selected": {
                backgroundColor: `#121212 !important`,
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
                borderRadius: "9px !important",
                minWidth: 100,
                marginLeft: 3,
                fontWeight: "400",
                backgroundColor: "transparent",
                border: "none",
              },
            }}
            exclusive
            className="w-fit overflow-y-hidden !bg-white !rounded-[8px]"
            onChange={(e: any) => {
              if (!e?.target?.value) return;

              setBilling(e.target.value);
            }}
          >
            <ToggleButton
              sx={{
                textTransform: "capitalize",
                fontWeight: "bold",
              }}
              value={"monthly"}
            >
              Monthly
            </ToggleButton>

            <ToggleButton
              sx={{
                textTransform: "capitalize",
                fontWeight: "bold",
              }}
              value={"annually"}
            >
              Annually
            </ToggleButton>
          </ToggleButtonGroup>
        </div>

        <div className="grid grid-cols-3 gap-4 mmsm:grid-cols-2 st:!grid-cols-1">
          <div className="bg-white px-6 py-4 rounded-[9px] item w-full min-w-[300px]">
            <h4 className="mb-5 font-[500] text-[22px]">Premium Plan</h4>

            <Button
              style={{
                fontFamily: "Poppins",
              }}
              className="!py-[9px] w-full !px-4 !border !border-solid !border-[#5e43ec] !rounded-[9px] !mb-5 !font-[300] !normal-case !text-[12px] !text-white !flex !items-center !bg-[#5e43ec]"
            >
              Choose this plan
            </Button>

            <div className="flex items-center mb-5">
              <span className="mainPrice text-[#121212] font-[600] text-[40px]">
                ₦40,000
              </span>
              <span className="font-light text-[#333]"> /month</span>
            </div>

            <div>
              <label className="font-bold text-[14px] block mb-1">
                Benefits:
              </label>
              <ul className="list-disc list-inside">
                <li className="flex items-center text-[#121212] font-[400] text-[15px] mb-2">
                  <BsCheckLg size={18} className="mr-1 text-[#5e43ec]" /> This
                  will be one of the benefits to get
                </li>
                <li className="flex items-center text-[#121212] font-[400] text-[15px] mb-2">
                  <BsCheckLg size={18} className="mr-1 text-[#5e43ec]" /> This
                  will be one of the benefits to get
                </li>
                <li className="flex items-center text-[#121212] font-[400] text-[15px] mb-2">
                  <BsCheckLg size={18} className="mr-1 text-[#5e43ec]" /> This
                  will be one of the benefits to get
                </li>
                <li className="flex items-center text-[#121212] font-[400] text-[15px] mb-2">
                  <BsCheckLg size={18} className="mr-1 text-[#5e43ec]" /> This
                  will be one of the benefits to get
                </li>
                <li className="flex items-center text-[#121212] font-[400] text-[15px] mb-2">
                  <BsCheckLg size={18} className="mr-1 text-[#5e43ec]" /> This
                  will be one of the benefits to get
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white px-6 rounded-[9px] py-4 item w-full min-w-[300px]">
            <h4 className="mb-5 font-[500] text-[22px]">Premium Plan</h4>

            <Button
              style={{
                fontFamily: "Poppins",
              }}
              className="!py-[9px] w-full !px-4 !border !border-solid !border-[#5e43ec] !rounded-[9px] !mb-5 !font-[300] !normal-case !text-[12px] !text-white !flex !items-center !bg-[#5e43ec]"
            >
              Choose this plan
            </Button>

            <div className="flex items-center mb-5">
              <span className="mainPrice text-[#121212] font-[600] text-[40px]">
                ₦40,000
              </span>
              <span className="font-light text-[#333]"> /month</span>
            </div>

            <div>
              <label className="font-bold text-[14px] block mb-1">
                Benefits:
              </label>
              <ul className="list-disc list-inside">
                <li className="flex items-center text-[#121212] font-[400] text-[15px] mb-2">
                  <BsCheckLg size={18} className="mr-1 text-[#5e43ec]" /> This
                  will be one of the benefits to get
                </li>
                <li className="flex items-center text-[#121212] font-[400] text-[15px] mb-2">
                  <BsCheckLg size={18} className="mr-1 text-[#5e43ec]" /> This
                  will be one of the benefits to get
                </li>
                <li className="flex items-center text-[#121212] font-[400] text-[15px] mb-2">
                  <BsCheckLg size={18} className="mr-1 text-[#5e43ec]" /> This
                  will be one of the benefits to get
                </li>
                <li className="flex items-center text-[#121212] font-[400] text-[15px] mb-2">
                  <BsCheckLg size={18} className="mr-1 text-[#5e43ec]" /> This
                  will be one of the benefits to get
                </li>
                <li className="flex items-center text-[#121212] font-[400] text-[15px] mb-2">
                  <BsCheckLg size={18} className="mr-1 text-[#5e43ec]" /> This
                  will be one of the benefits to get
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-[#121212] px-6 py-4 item rounded-[9px] w-full min-w-[300px] max-h-[360px]">
            <h4 className="mb-5 font-[500] text-white text-[22px]">
              For Teams
            </h4>
            <div className="flex items-center text-white text-[15px] mb-5">
              We are here to help and to offer you the best deal. Book a call or
              join our discord and let’s talk about your business.
            </div>{" "}
            <Link href="/homepage">
              <Button
                style={{
                  fontFamily: "Poppins",
                }}
                className="!py-[9px] w-full !px-4 !border !border-solid !border-white !rounded-[9px] !mb-8 !font-[500] !normal-case !text-[16px] !text-[#121212] !flex !items-center !bg-white"
              >
                <FaVideo size={20} className="mr-3" /> Book a call
              </Button>
            </Link>
            <div className="block m-auto h-[1px] bg-[#4b5563] w-[60%] mb-9"></div>
            <Link href={"/pricing"}>
              <a className="text-[#fff] justify-center font-[400] flex items-center text-[15px] mb-4">
                See our pricing page{" "}
                <BsArrowRightCircleFill className="ml-2" size={18} />
              </a>
            </Link>
          </div>
        </div>
      </section> */}

      <Footers />
    </>
  );
};

export default Homepage;
