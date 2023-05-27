import Image from 'next/image';
import cicon from "../../../../public/images/icon.png";
import { useContext, useEffect, useState } from 'react';
import { decrypt, decryptCache } from '../../extras/chat/functions';
import { CContext } from '../../extras/contexts/CContext';

const Chatlist = ({name, img, lastMsg, time, selected, iv, onClick}: {name: string, img?: string, lastMsg: string, time?: string | number, selected: boolean, onClick: () => void, iv?: string}) => {

    const mCon = useContext(CContext);

    const [tick, setTick] = useState<number | string>('');

    const Msg = () => {

        const [txt, setTxt] = useState<string>('');

        useEffect(() => {

            (async () => {

              if (iv !== undefined) {

                setTxt(await decrypt({ message: lastMsg[0], iv }, mCon.chatkeys) as string);

              } else {

                setTxt(lastMsg);

              }

            })()

        }, [])

        return (
          <span className="msg-message">
            {decryptCache[lastMsg + iv] === undefined
              ? txt !== undefined && txt
              : decryptCache[lastMsg + iv]}
          </span>
        );

    }

    const getx = (t: number) => {
        const ec:number = Number((new Date().getTime() / 1000).toFixed(0));
        const et:number = Number((t / 1000).toFixed(0));
        const delay:number = ec - et;

        if(delay > 43200){
            //daily
            const xd = new Date(t);

            setTick(`${xd.getFullYear()}/${xd.getMonth() + 1}/${xd.getDate()}`);

        }else if (delay > 3600) {
            //hourly
            const xh = parseInt((delay / 3600).toString());

            setTick(xh + "hr" + (xh > 1 ? "s " : " "));

        }else if(delay > 60){
            const xx = parseInt((delay / 60).toString()); 
            
            setTick(xx+'min'+(xx > 1 ? 's' : ''))

        }else{
            setTick('now');
        }

        // setTimeout(() => getx(t), 3000);

    }

    useEffect(() => {

      getx(Number(time));

    }, [])
  

  return (
    <div onClick={onClick} className={`msg ${selected ? "active" : ""}`}>
      <div className="w-[44px] min-w-[44px] flex items-center justify-center mr-[15px] rounded-[50%] bg-[#e7e7e7] h-[44px]">
        <Image
          className="msg-profile "
          src={img === undefined ? cicon.src : img}
          height={25}
          width={25}
          alt={name}
        />
      </div>

      <div className="msg-detail w-fit">
        <div className="msg-username capitalize">{name}</div>
        <div className="msg-content">
          <Msg />
          {time !== undefined && (
            <span className="msg-date">{tick}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatlist;
