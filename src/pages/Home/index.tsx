import React from 'react';
import io from 'socket.io-client'
import './style.css';

const socket = io('http://localhost:4000/', 
    {
      path: '/signal',
      query: {
        x: 42
      }
  });

socket.on('connect', () => {
  console.log('Socket client connected', socket.id);
});

function Home() {

  let peerConnection: RTCPeerConnection;
  let localMediaStream: MediaStream;

  const pcConfig: RTCConfiguration = {
    'iceServers': [{
      'urls': 'stun:stun.l.google.com:19302'
      // See https://github.com/coturn/coturn
      // for a custom implementation of stun/turn servers
    }]
  };

  const constraints: MediaStreamConstraints = {
    audio: true,
    video: true, // Specify video resolution per requirements
  };


  function successCallback(mediastream: MediaStream): void {
    console.info('On incoming local media stream');
    localMediaStream = mediastream;
    // Stream media for local user
    const videoEl = document.getElementById('user-video') as HTMLMediaElement;
    if (videoEl) videoEl.srcObject = mediastream;
    // Add video-track/audio track to peerConnection 
    for (const track of mediastream.getTracks()) {
      console.log('Addding track to peer connection', {track, peerConnection});
      peerConnection.addTrack(track);
    }
  }

  function errorCallback(error: MediaStreamError): void {
    console.error(error);
    switch(error.name) {
      case 'NotFoundError':
        console.info('Unable to open your call because no camera and/or microphone were found');
        break;
      case 'SecurityError':
        console.info('Security error');
        break;
      case 'PermissionDeniedError':
        console.info('Permissions have not been granted to use your camera and microphone');
        break;
      default:
        console.info('Error opening your camera and/or microphone: ' + error.message);
        break;
    }
  }

  function toggleVideo(): void {
    if (localMediaStream) {
      const videoTracks = localMediaStream.getVideoTracks();
      if (videoTracks.length) {
        videoTracks[0].enabled = !videoTracks[0].enabled;
      }
    } 
  }

  function toggleAudio(): void {
    if (localMediaStream) {
      const audioTracks = localMediaStream.getAudioTracks();
      if (audioTracks.length) {
        audioTracks[0].enabled = !audioTracks[0].enabled;
      }
    }
  }

  function createRoom(): void {
    createPeerConnection();
    navigator.getUserMedia(constraints, successCallback, errorCallback);
  }
  
  function createPeerConnection(): void {
    try {
      peerConnection = new RTCPeerConnection(pcConfig);
      console.info('PeerConnection :: Registering');
      peerConnection.addEventListener('icecandidate', handleIceCanditate);
      peerConnection.addEventListener('track', handleTrack);
      peerConnection.addEventListener('negotiationneeded', handleNegotiationNeeded);
      peerConnection.addEventListener('removetrack', handleRemoveTrack);
      peerConnection.addEventListener('iceconnectionstatechange', handleIceConnectionChange);
      peerConnection.addEventListener('icegatheringstatechange', handleIceGatheringStateChange);
      peerConnection.addEventListener('signalingstatechange', handleSignalingStateChangeEvent);

    } catch (err) {
      console.error('Error in creating peer connection')
    }
  }

  // negotiationneeded event is fired when tracks are added to a RTCPeerConnection 
  function handleNegotiationNeeded(event: any) {
    console.log('On negotation neededd event was fired',  event);
    // Create a SDP offer to be sent
    peerConnection.createOffer().then((offer) => {
      // Sets local description of the connection including the media format
      return peerConnection.setLocalDescription(offer);
    }).then(() => {
      // Use signalling  server to send a connection request
      // name: myUsername,
      // target: targetUsername,
      // type: "video-offer",
      // sdp: peerConnection.localDescription
      console.log(':: send data to signalling server', peerConnection.localDescription);
    })
  }

  function handleRemoveTrack(event: any) {
    console.log('Handle removing track', event);
  }

  function handleTrack(event: any) {
    console.log('Handle track', event);
  }

  function handleIceCanditate(event: any){
    console.log('::handleIceCanditate::', event);
  }

  function handleIceConnectionChange(event: any): void {
    console.log('::handleIceConnectionChange::',  event);
  }

  function handleIceGatheringStateChange(event: any): void {
    console.log('::handleiccegatheringstatechange', event);
  }

  function handleSignalingStateChangeEvent(event: any): void {
    console.log('::handle')
  }

  function handleOffer() {
    console.log('::handle offer');
  }

  return (
    <div>
      <div className="buttons">
        <button className="button is-primary" onClick={createRoom}>Create Room</button>
        <button className="button is-primary" onClick={handleOffer}>Start Remote feed</button>
        <button className="button is-warning" onClick={toggleVideo}>Toggle video</button>
        <button className="button is-warning" onClick={toggleAudio}>Toggle audio</button>
      </div>
      <div className="columns group-video">
        <div className="column user-feed">
          <p className="is-size-2 has-text-centered has-text-weight-medium">Local feed</p>
          <video height="400" width="600" id="user-video" autoPlay playsInline></video>
          <div className="buttons">

          </div>
        </div>
        <div className="column remote-feed">
          <p className="is-size-2 has-text-centered has-text-weight-medium">Remote feed</p>
          <video height="400" width="600" id="remote-video" autoPlay playsInline></video>    
        </div>
      </div>
    </div>
  );
}

export default Home;
