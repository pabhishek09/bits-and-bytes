interface PeerConnectionSignal {
  name: String;
  meetId: String;
  socketId: String,
  sdp: any;
}

export default PeerConnectionSignal;
