import { useContext } from "react";
import userx from "../../../public/images/user.svg";
import { CContext } from "../extras/contexts/CContext";
import { useAccount } from "wagmi";
import Image from "next/image";


interface Textm {
  content: string[][];
  sender: string;
  date: string | number;
  key: number;
  reply?: string;
  enlargen: boolean
  sent: boolean
}

const Text = ({ content, sender, date, key, reply, sent, enlargen }: Textm) => {

  const { address, isConnected } = useAccount();

  const mCon = useContext(CContext);

  const cdat = new Date();
  const exp = new Date(date);

  const parseCdat = Date.parse(
    `${cdat.getFullYear()}-${cdat.getMonth() + 1}-${cdat.getDate()}`
  );

  const parseMdat = Date.parse(
    `${exp.getFullYear()}-${exp.getMonth() + 1}-${exp.getDate()}`
  );

  const ddate =
    parseMdat == parseCdat
      ? `${(exp.getHours() + 1) % 12 || exp.getHours() + 1}.${
          exp.getMinutes() + 1
        }${exp.getHours() > 12 ? "pm" : "am"}`
      : `${exp.getFullYear()}/${exp.getMonth() + 1}/${exp.getDate()} ${
          (exp.getHours() + 1) % 12 || exp.getHours() + 1
        }.${exp.getMinutes() + 1}${exp.getHours() > 12 ? "pm" : "am"}`;

  return (
    <div
      style={{
        opacity: sent ? 1 : 0.3,
      }}
      key={key}
      className={`chat-msg transition-all delay-[400] ${
        address == sender ? "owner" : ""
      }`}
    >
      <div className="chat-msg-profile relative">
        <Image className="chat-msg-img" height={40} width={40} src={userx.src} alt={sender} />

        <div className="chat-msg-date">
          {`${sender.substring(0, 6)}...${sender.substring(38, 42)}`}{" "}
          <span>{ddate}</span>
        </div>
      </div>
      <div className="chat-msg-content">
        {content.map((txt: string[], i: number) => (
          <>
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
          </>
        ))}
      </div>
    </div>
  );
};

export default Text;
