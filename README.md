# web-storm

video conferencing app built with webRtc

### Components

- Signalling server built with socketIo to exchange network metadata as SDP
- ReactJS Frontend to implement P2P connection using RTCPeerConnection API
- Stun server (use free google stun servers) to identify the public network address behind NAT's
  Use https://github.com/coturn/coturn for a custom implementation

