import { useContext } from "react";
import userx from "../../../public/images/user.svg";
import { CContext } from "../extras/contexts/CContext";
import { useAccount } from "wagmi";
import Image from "next/image";
import { ethers } from "ethers";


interface Textm {
  content: string[][];
  sender: string;
  date: string | number;
  reply?: string;
  selected: boolean;
  messId: string;
  enlargen: boolean;
  sent: boolean;
  replyDisabled: boolean;
  setExtras: React.Dispatch<React.SetStateAction<string>>;
  setEditable: React.Dispatch<React.SetStateAction<boolean>>;
}

const Text = ({ content, sender, date, reply, sent, enlargen, messId, setExtras, selected, replyDisabled, setEditable }: Textm) => {

  
  const { address, isConnected } = useAccount();

  const mCon = useContext(CContext);

  const exp = new Date(date);

  const min = exp.getMinutes() + 1

  const ddate = `${exp.getHours() % 12 || exp.getHours()}.${
            min > 9 ? min : `0${min}`
        }${exp.getHours() > 12 ? "pm" : "am"}`;

  return (
    <div
      style={{
        // opacity: sent ? 1 : 0.3,
        backgroundColor: selected ? "#f1f2f6e1" : undefined,
      }}
      id={messId}
      onClick={() => {
        
        setExtras(selected ? "" : messId)
        
        const add = address ? ethers.utils.getAddress(address) : '';

        const add2 = ethers.utils.getAddress(sender);

        setEditable(add == add2);

      }}
      className={`chat-msg transition-all relative z-[1001] delay-[400] ${
        address == sender ? "owner" : ""
      }`}
    >
      <div className="chat-msg-profile relative">
        <Image
          className="chat-msg-img"
          height={40}
          width={40}
          src={userx.src}
          alt={sender}
        />

        <div className="chat-msg-date">
          {Boolean(sender) && `${sender?.substring(0, 6)}...${sender?.substring(38, 42)}`}{" "}
          <span>{ddate}</span>
        </div>
      </div>
      <div className="chat-msg-content">
        {content.map((txt: string[], i: number) => (
          <div key={i}>
            {Boolean(txt[1]) && (
              <div className="chat-msg-text reply">
                <span>{`Replied to ${
                  reply == address
                    ? "self"
                    : `${sender.substring(0, 6)}....${sender.substring(38, 42)}`
                }`}</span>
                <span>{txt[1]}</span>
              </div>
            )}

            <div
              key={i}
              onClick={(e: any) => {
                
                if (replyDisabled) return;

                if (!(e.detail % 2)) {
                  if (mCon.update !== undefined) {
                    mCon.update({
                      content: txt[0],
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
              {txt[0]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Text;
