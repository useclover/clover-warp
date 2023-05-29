import { useContext, useEffect, useRef, useState } from "react";
import userx from "../../../public/images/user.svg";
import { CContext } from "../extras/contexts/CContext";
import { useAccount } from "wagmi";
import Image from "next/image";
import { ethers } from "ethers";
import { decrypt, decryptCache } from "../extras/chat/functions";
import { Textm } from "../types";
import { RandomAvatar } from "react-random-avatars";
import axios from "axios";

const Text = ({ content, sender, date, reply, sent, enlargen, messId, setExtras, selected, replyDisabled, setEditable, iv }: Textm) => {

  const [text, setText] = useState<string>();
  
  const { address, isConnected } = useAccount();

  const mCon = useContext(CContext);

  const exp = new Date(date);

  const min = exp.getMinutes() + 1

  const ddate = `${exp.getHours() % 12 || exp.getHours()}.${
            min > 9 ? min : `0${min}`
        }${exp.getHours() > 12 ? "pm" : "am"}`;
 
  const tDecrypt = async (txt: string) => {

    if (iv !== undefined) {
      
      return await decrypt({ message: txt, iv }, mCon.chatkeys[mCon.group || '']);

    }else{

     return txt;

    }
  }

  const imgCache: { [index: string]: string } = {};

  const Img = () => {

      const [userImg, setUserImg] = useState<string>('');

      useEffect(() => {
          (async () => {

              if (imgCache[sender || ""] === undefined) {

              const { data: { image } } = await axios.get(`/user/img/${sender}`, {
                  headers: {
                      "Content-Type": "application/json",
                      "Accept": "application/json",
                      Authorization: `Bearer ${localStorage.getItem("clover-x")}`,
                  }
              });

              if (image) {

                  imgCache[sender || ""] = image;

                  setUserImg(image);

              };
            }else{
                setUserImg(imgCache[sender || ""]); 
            }            

          })()

      }, [])

      return userImg ? (
        <Image
          className="chat-msg-img"
          height={40}
          width={40}
          src={userImg}
          alt={sender}
        />
      ) : (
        <RandomAvatar size={40} name={sender} />
      );
  }

  const MainText = () => {

    const [text, setText] = useState<{ main:string, rep: string }[]>([]);

    useEffect(() => {

      (async () => { 

        content.forEach(async (txt: string[], i: number) => {

          if (text[i] === undefined) {

            const main = await tDecrypt(txt[0])

            const rep = txt[1] !== undefined ? await tDecrypt(txt[1]) : ""

            setText([...text, { main, rep }]);

          }
      })

        
    })()

    }, []);

    return (
      <div className="chat-msg-content">
        {content.map((txt: string[], i: number) => (
          <div key={i}>
            {Boolean(txt[1]) && (
              <div className="chat-msg-text reply">
                <span>{`Replied to ${
                  reply == address
                    ? "self"
                    : `${sender?.substring(0, 6)}....${sender?.substring(38, 42)}`
                }`}</span>

                <span>
                  {decryptCache[txt[1] + iv] === undefined
                    ? text[i] !== undefined && text[i].rep
                    : decryptCache[txt[1] + iv]}
                </span>
              </div>
            )}

            <div
              key={i}
              onClick={async (e: any) => {
                if (replyDisabled) return;

                if (!(e.detail % 2)) {
                  if (mCon.update !== undefined) {
                    mCon.update({
                      content: await tDecrypt(txt[0]),
                      sender,
                    });
                  }
                }
              }}
              style={{
                fontSize: enlargen ? "50px" : undefined,
                padding: enlargen ? "5px" : undefined,
              }}
              className="chat-msg-text"
            >
              {decryptCache[txt[0] + iv] === undefined
                ? text[i] !== undefined && text[i].main
                : decryptCache[txt[0] + iv]}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div
      style={{
        opacity: sent ? 1 : 0.3,
        backgroundColor: selected ? "#f1f2f6e1" : undefined,
      }}
      id={messId}
      onClick={() => {
        setExtras(selected ? "" : messId);

        const add = address ? ethers.utils.getAddress(address) : "";

        const add2 = sender ? ethers.utils.getAddress(sender) : "";

        setEditable(add == add2);
      }}
      className={`chat-msg transition-all relative z-[1001] delay-[400] ${
        address == sender ? "owner" : ""
      }`}
    >
      <div className="chat-msg-profile relative">
        <Img />

        <div className="chat-msg-date">
          {Boolean(sender) &&
            `${sender?.substring(0, 6)}...${sender?.substring(38, 42)}`}{" "}
          <span>{ddate}</span>
        </div>
      </div>
      <MainText />
    </div>
  );
};

export default Text;
