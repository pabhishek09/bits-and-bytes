import React, { useEffect, useState } from 'react';
import Feed from '../../components/Feed';
import getSocket from '../../socket';
import { useParams, useHistory } from "react-router-dom";
import './style.css';

function Meet() {

  let socket: any;
  const { id }  = useParams() as any;
  let meetDetails: any;
  const history = useHistory();
  let peerConnection: RTCPeerConnection;
  let localMediaStream: MediaStream;
  const pcConfig: RTCConfiguration = {
    iceServers: [
      // See https://github.com/coturn/coturn
      // for a custom implementation of stun/turn servers
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
    ]
  };
  const constraints: MediaStreamConstraints = {
    audio: false,
    video: true, // Specify video resolution per requirements
  };
  let isHost: Boolean;
  let sdpRequestParams = {
    request_to: '', 
    request_by: '',
  };

  useEffect(() => {
    setUpMeet().then(() => {
      console.log(':: setUpMeet is resolved ::');
    });
  }, []);

  const [ participants, setParticipants ] = useState([] as Array<Number>);

  async function setUpMeet() {
    console.log(':: setUpMeet ::');
    await validateMeet();
    socket = await getSocket();
    isHost = socket.id === meetDetails.host;
    console.log(`:: isHost ::  ${isHost}`)
    initiateMeetSignalling();
  }

  async function validateMeet()  {
    if(!id) history.push('/');
    else {
      const meet = await getMeet(id);
      if (!meet.data) return history.push('/');
      meetDetails = meet.data;
    }
  }

  async function getMeet(id: string) {
    return fetch(`http://localhost:4000/api/meet?id=${id}`)
    .then((data) => data.json());
  }

  function initiateMeetSignalling() {
    console.log(':: initiateMeetSignalling ::');
    isHost ? socket.emit('start-meet', meetDetails) : socket.emit('join-meet', meetDetails);
    socket.on('start-meet', () => {
      createPeerConnection();
      setUpUserMedia();
    });

    // Fired to existing participant when a new participant joins
    socket.on('join-meet', ({ joinee_id }:  any) => {
      console.log(':: Client socket :: join-meet',  joinee_id);
      // Send the local rtc description to new participant
      socket.emit('sdp_request', {
        request_by: socket.id, 
        request_to: joinee_id,
        sdp: peerConnection.localDescription,  
      });
    });

    // sdp request for new participant by an exiting participant
    socket.on('sdp_request', (params: any) => {
      console.log(':: Client socket :: sdp_request',  params);
      const { request_to, request_by } = params;
      sdpRequestParams = { request_to, request_by };
      onSdpRequest(params.sdp);
    });

    socket.on('sdp_response', (params: any) => {
      console.log(':: Client socket :: sdp_response',  params);
      onSdpResponse(params.sdp);
    });

    socket.on('new_ice_candidate', onNewIceCanditate)
  }

  function onSdpRequest(sdp: any) {
    console.log(':: onSdpRequest ::');
    if (!peerConnection )createPeerConnection();
    if (!localMediaStream) setUpUserMedia();
    const sessionDesc = new RTCSessionDescription(sdp);
    peerConnection.setRemoteDescription(sessionDesc)
      .then(() => peerConnection.createAnswer())
      .then((answer) => {
        peerConnection.setLocalDescription(answer);
        console.log(':: onSdpRequest :: Local request is set, sending response ::')
        socket.emit('sdp_response', { 
          response_by: sdpRequestParams.request_to,
          resonse_to: sdpRequestParams.request_by,
          sdp: answer,
        });
      })
  }

  function onSdpResponse(sdp: any) {
    console.log(':: onSdpResponse ::');
    const sessionDesc = new RTCSessionDescription(sdp);
    peerConnection.setRemoteDescription(sessionDesc);
  }

  function createPeerConnection(): void {
    try {
      peerConnection = new RTCPeerConnection(pcConfig);
      console.info(':: createPeerConnection :: registering event handlers');
      peerConnection.addEventListener('icecandidate', handleIceCanditate);
      peerConnection.addEventListener('track', handleTrack);
      peerConnection.addEventListener('negotiationneeded', handleNegotiationNeeded);
      // peerConnection.addEventListener('removetrack', handleRemoveTrack);
      // peerConnection.addEventListener('iceconnectionstatechange', handleIceConnectionChange);
      // peerConnection.addEventListener('icegatheringstatechange', handleIceGatheringStateChange);
      // peerConnection.addEventListener('signalingstatechange', handleSignalingStateChangeEvent);
    } catch (err) {
      console.error('Error in creating peer connection')
    }
  }

  function setUpUserMedia(): void {
    console.log(':: setUpUserMedia ::');
    navigator.getUserMedia(constraints, successCallback, errorCallback);
  }
  
  function successCallback(mediastream: MediaStream): void {
    console.log(':: successCallback ::');
    localMediaStream = mediastream;
    const videoEl = document.getElementById('user-video') as HTMLMediaElement;
    if (videoEl) videoEl.srcObject = localMediaStream;
    localMediaStream.getTracks().forEach(track => peerConnection.addTrack(track, localMediaStream));
  }

  function errorCallback(error: MediaStreamError): void {
    console.log(':: errorCallback ::', errorCallback);
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

  function onNewIceCanditate(event: any) {
    console.log(':: onNewIceCanditate ::', event);
    var canditate = new RTCIceCandidate(event.candidate);
    peerConnection
      .addIceCandidate(canditate)
      .catch((err) => {
        console.log({err});
      });
  }
  
  // negotiationneeded event is fired when tracks are added to a RTCPeerConnection 
  function handleNegotiationNeeded(event: any) {
    console.log(':: handleNegotiationNeeded ::',  event);
    // Create a SDP offer to be sent
    if (isHost) {
      peerConnection.createOffer().then((offer) => {
        // Sets local description of the connection including the media format
        return peerConnection.setLocalDescription(offer);
      });
    }
  }
  
  function handleRemoveTrack(event: any) {
    console.log(':: handleRemoveTrack ::', event);
  }
  
  function handleTrack(event: any) {
    console.log(':: handleTrack ::', event);
    setParticipants([ ...participants, participants.length + 1]);
    const videoEl = document.getElementById('remote-video-1') as HTMLMediaElement;
    if (videoEl) videoEl.srcObject = event.streams[0];
  }
  
  function handleIceCanditate(event: any) {
    console.log(':: handleIceCanditate ::', event);
    if (event.candidate) socket.emit('ice_candidate', { id, candidate: event.candidate });
  }
  
  function handleIceConnectionChange(event: any): void {
    console.log(':: handleIceConnectionChange ::',  event);
  }
  
  function handleIceGatheringStateChange(event: any): void {
    console.log(':: handleiccegatheringstatechange ', event);
  }
  
  function handleSignalingStateChangeEvent(event: any): void {
    console.log(':: handleSignalingStateChangeEvent ::')
  }

  function RemoteFeed(props:  any) {
    return props.participants.map((index: number) => <Feed
      isHost='false'
      key={`remote-feed-${index}`} 
      idAttr={`remote-video-${index}`} 
    />);
  }
  
  return (
    <div>
      <div className="buttons is-flex is-justify-content-center is-align-content-center is-align-items-center group-video">
        <button className="button is-warning" onClick={toggleVideo}>Toggle video</button>
        <button className="button is-warning" onClick={toggleAudio}>Toggle audio</button>
      </div>
      <div className="is-flex is-justify-content-center is-align-content-center is-align-items-center group-video">
        <Feed isHost='true' idAttr='user-video' />
        <RemoteFeed  participants={participants}/>
      </div>
    </div>
  )
}

export default Meet;
