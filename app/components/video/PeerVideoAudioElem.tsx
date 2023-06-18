import { usePeers } from "@huddle01/react/hooks";
import React, { useCallback, useEffect, useRef } from "react";

interface Props {
  peerIdAtIndex: string;
}

const PeerVideoAudioElem: React.FC<Props> = ({ peerIdAtIndex }) => {
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { peers } = usePeers();

  const { cam: peerCamTrack } = peers[peerIdAtIndex];

  const {mic: peerMicTrack } = peers[peerIdAtIndex];


  const getStream = (_track: MediaStreamTrack) => {
      const stream = new MediaStream();
      stream.addTrack(_track);
      return stream;
  };


  useEffect(() => {
    if (peerCamTrack && videoRef.current) {
      videoRef.current.srcObject = getStream(peerCamTrack);
    }
  }, [peerCamTrack]);



  useEffect(() => {
    if (peerMicTrack && audioRef.current) {
      audioRef.current.srcObject = getStream(peerMicTrack);
    }
  }, [peerMicTrack]);

  return (
    <div style={{ width: "50%" }}>
      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        style={{ width: "100%" }}
      />
      <audio ref={audioRef} autoPlay playsInline controls={false}></audio>
    </div>
  );
};

export default React.memo(PeerVideoAudioElem);
