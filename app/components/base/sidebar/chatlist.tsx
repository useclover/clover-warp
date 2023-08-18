import Image from 'next/image';
import cicon from "../../../../public/images/icon.png";
import { useContext, useEffect, useRef, useState } from 'react';
import { decrypt, decryptCache } from '../../extras/chat/functions';
import { CContext } from '../../extras/contexts/CContext';
import Timestamp from "react-timestamp"

const Chatlist = ({
  name,
  index,
  img,
  lastMsg,
  time,
  selected,
  iv,
  onClick,
  curTime,
}: {
  name: string;
  index: string;
  img?: string;
  lastMsg: string;
  time?: string | number;
  selected: boolean;
  onClick: () => void;
  iv?: string;
  curTime?: string | number;
}) => {

  const mCon = useContext(CContext);

  const [tick, setTick] = useState<number | string>("");

  const timer = useRef<any>();

  const Msg = () => {
    const [txt, setTxt] = useState<string>("");

    useEffect(() => {
      (async () => {
        if (iv !== undefined) {
          setTxt(
            (await decrypt(
              { message: lastMsg[0], iv },
              mCon.chatkeys[index]
            )) as string
          );
        } else {
          setTxt(lastMsg);
        }
      })();
    }, []);

    return (
      <span className="msg-message">
        {decryptCache[lastMsg + iv] === undefined
          ? txt !== undefined && txt
          : decryptCache[lastMsg + iv]}
      </span>
    );
  };

  const dTime = new Date(time as number | string);

  const cTime = new Date(curTime as number | string);

  const getx = (t: number) => {
    clearTimeout(timer.current);

    if (!t) return;

    const ec: number = Number((new Date().getTime() / 1000).toFixed(0));
    const et: number = Number((t / 1000).toFixed(0));
    const delay: number = ec - et;

    if (delay > 43200) {
      //daily
      const xd = new Date(t);

      setTick(`${xd.getFullYear()}/${xd.getMonth() + 1}/${xd.getDate()}`);
    } else if (delay > 3600) {
      //hourly
      const xh = parseInt((delay / 3600).toString());

      setTick(xh + "hr" + (xh > 1 ? "s " : " "));
    } else if (delay > 60) {
      const xx = parseInt((delay / 60).toString());

      setTick(xx + "min" + (xx > 1 ? "s" : ""));
    } else {
      setTick("now");
    }

    timer.current = setTimeout(() => getx(t), 3000);
  };

  return (
    <div onClick={onClick} className={`msg ${selected ? "active" : ""}`}>
      <div className="w-[44px] min-w-[44px] flex items-center justify-center mr-[15px] rounded-[50%] bg-[#e7e7e7] h-[44px]">
        <Image
          className="msg-profile "
          src={img === undefined ? cicon.src : img}
          height={img ? 44 : 25}
          width={img ? 44 : 25}
          alt={name}
        />
      </div>

      <div className="msg-detail w-fit">
        <div className="msg-username capitalize">{name}</div>
        <div className="msg-content">
          <Msg />

          {time !== undefined && (
            <span className="msg-date">
              <Timestamp
                relative
                date={dTime}
                relativeTo={cTime}
              /> {" "}
              ago
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatlist;
