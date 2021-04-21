import React, { useEffect } from 'react';
import { getSocket } from '../../socket';
import { useParams, useHistory } from "react-router-dom";
import './style.css';
import PeerConnectionSignal from '../../interfaces/PeerConnectionSignal';


function Meet() {

  let socket: any;
  const { id }  = useParams() as any;
  const history = useHistory();
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
    audio: false,
    video: true, // Specify video resolution per requirements
  };
  let isHost: Boolean;
  let remoteUsers;

  useEffect(() => {
    setSocketConnection()
    .then(async () => {
      await setUpMeet();
    })
  }, []);

  async function setSocketConnection() {
    socket = await getSocket();
    socket.on('join-meet-action', (params: any) => {
      console.log('Client:: new join meet event!!!');
    });
    await validateMeet(id);
    return;
  }

  async function validateMeet(id: string)  {
    if(!id) history.push('/');
    else {
      const meet = await getMeet(id);
      console.log({meet});
      if (!meet.data) return history.push('/');
      isHost = socket.id === meet.data.host;
    }
  }

  async function getMeet(id: string) {
    return fetch(`http://localhost:4000/api/meet?id=${id}`)
    .then((data) => data.json());
  }

  async function setUpMeet() {
    console.log('Set up meeting with is host :: ', isHost);
    createPeerConnection();
    navigator.getUserMedia(constraints, successCallback, errorCallback);
  }

  function createPeerConnection(): void {
    try {
      peerConnection = new RTCPeerConnection(pcConfig);
      console.info('PeerConnection :: Registering event handlers');
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
  
  // negotiationneeded event is fired when tracks are added to a RTCPeerConnection 
  function handleNegotiationNeeded(event: any) {
    console.log('On negotation neededd event was fired',  event);
    // Create a SDP offer to be sent
    peerConnection.createOffer().then((offer) => {
      // Sets local description of the connection including the media format
      return peerConnection.setLocalDescription(offer);
    }).then(() => {
      if (isHost) {
        socket.emit('start-meet-event', {
          name: 'John',
          meetId: id,
          socketId: socket.id,
          sdp: peerConnection.localDescription
        });
      } else {
        socket.emit('join-meet-event', {
          name: 'Johnny',
          meetId: id,
          socketId: socket.id,
          sdp: peerConnection.localDescription
        });
      }
    });
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

  function onNewConnection(params: PeerConnectionSignal) {
    if (socket.id !== params.socketId) {
      console.log('User joined remotely');
    }
  }
  
  return (
    <div>
      <div className="buttons">
        <button className="button is-warning" onClick={toggleVideo}>Toggle video</button>
        <button className="button is-warning" onClick={toggleAudio}>Toggle audio</button>
      </div>
      <div className="columns group-video">
        <div className="column user-feed">
          <p className="is-size-2 has-text-centered has-text-weight-medium">Local feed</p>
          <video height="400" width="600" id="user-video" autoPlay playsInline></video>
        </div>
        <div className="column remote-feed">
          <p className="is-size-2 has-text-centered has-text-weight-medium">Remote feed</p>
          <video height="400" width="600" id="remote-video" autoPlay playsInline></video>    
        </div>
      </div>
    </div>
  )
}

export default Meet;
