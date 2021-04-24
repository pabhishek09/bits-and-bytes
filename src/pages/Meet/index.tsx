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
  let peerConnections: Array<RTCPeerConnection> = [];
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

  // const [ participants, setParticipants ] = useState<Array<string>>([]);

  const participants: Array<string> = [];
  const [ participantCount, setParticipantCount ] = useState<number>(0);

  useEffect(() => {
    setUpMeet()
  }, []);

  // useEffect(() => {
  //   console.log(participants);
  // }, [participants]);

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
    socket.on('start-meet', setUpUserMedia);
    socket.on('join-meet', onNewParticipant);
    socket.on('sdp_request', onSdpRequest);
    socket.on('sdp_response', onSdpResponse);
    socket.on('new_ice_candidate', onNewIceCanditate)
  }

  async function onNewParticipant({ joinee_id } : any) {
    console.log(`:: onNewParticipant :: ${joinee_id}` );
    // setParticipants([...participants, joinee_id]);
    participants.push(joinee_id);
    setParticipantCount(participants.length);
    console.log(':: onNewParticipant  :: participants ::', participants);
    await createPeerConnection();
    streamLocalMedia(peerConnections.length -1);
  }

  async function onSdpRequest(params: any) {
    console.log(':: onSdpRequest ::');
    participants.push(params.request_by);
    setParticipantCount(participants.length);
    createPeerConnection();
    if (!localMediaStream) await setUpUserMedia();
    streamLocalMedia(peerConnections.length -1);
    peerConnections[peerConnections.length - 1]
      .setRemoteDescription(new RTCSessionDescription(params.sdp))
      .then(() => peerConnections[peerConnections.length - 1].createAnswer())
      .then((answer) => {
        peerConnections[peerConnections.length - 1].setLocalDescription(answer);
        socket.emit('sdp_response', { 
          response_by: params.request_to,
          resonse_to: params.request_by,
          sdp: answer,
        });
      })
  }

  function onSdpResponse(event: any) {
    console.log(':: onSdpResponse ::');
    const pcIndex = participants.indexOf(event.response_by);
    console.log({
      event,
      pcIndex,
      peerConnections
    })
    peerConnections[pcIndex].setRemoteDescription(new RTCSessionDescription(event.sdp));
  }

  function onNewIceCanditate(event: any) {
    console.log(':: onNewIceCanditate ::', event);
    const { socket_id } = event;
    const pcIndex = participants.indexOf(socket_id);
    if (pcIndex > -1) {
      peerConnections[pcIndex]
      .addIceCandidate(new RTCIceCandidate(event.candidate))
      .catch((err) => {
        console.log({err});
      });
    }
  } 

  async function createPeerConnection(): Promise<void> {
    try {
      const pcIndex = peerConnections.length;
      const peerConnection = new RTCPeerConnection(pcConfig);
      console.info(`:: createPeerConnection with index ${pcIndex} ::`);
      peerConnection.addEventListener('icecandidate', (event) => handleIceCanditate(event));
      peerConnection.addEventListener('track', (event) => handleTrack(pcIndex, event));
      peerConnection.addEventListener('negotiationneeded', (event) => handleNegotiationNeeded(pcIndex, event));
      peerConnections.push(peerConnection);
      return;
    } catch (err) {
      console.error('Error in creating peer connection')
    }
  }

  function handleIceCanditate(event: RTCPeerConnectionIceEvent) {
    console.log(':: handleIceCanditate ::', event);
    if (event.candidate) socket.emit('ice_candidate', { id, candidate: event.candidate, socket_id: socket.id });
    console.log({
      participants,
      participantCount,
      peerConnections,
    })
  }

  function handleTrack(pcIndex: number, event: any) {
    console.log(`:: handleTrack for ${pcIndex} ::`);
    const videoEl = document.getElementById(`remote-video-${pcIndex}`) as HTMLMediaElement;
    if (videoEl) videoEl.srcObject = event.streams[0];
  }

  function handleNegotiationNeeded(pcIndex: number, event: any) {
    console.log(`:: handleNegotiationNeeded  for index ${pcIndex}::`, participants);
    peerConnections[pcIndex]
    .createOffer()
    .then((offer) => peerConnections[pcIndex].setLocalDescription(offer))
    .then(() => {
      socket.emit('sdp_request', {
        request_by: socket.id, 
        request_to: participants[pcIndex],
        sdp: peerConnections[pcIndex].localDescription,  
      });
    })
  }

  async function setUpUserMedia(): Promise<void> {
    console.log(':: setUpUserMedia ::');
    try {
      localMediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      const videoEl = document.getElementById('user-video') as HTMLMediaElement;
      if (videoEl) videoEl.srcObject = localMediaStream;
    } catch (err) {
      errorCallback(err);
    }
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
  
  function streamLocalMedia(pcIndex: number)  {
    localMediaStream.getTracks()
    .forEach(track => peerConnections[pcIndex].addTrack(track, localMediaStream));
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
  
  function RemoteFeed(props: any) {
    const participantArray = new Array(props.participantCount).fill(0);
    return<>{participantArray.map((participant: string, index: number) => <Feed
      isHost='false'
      key={`remote-feed-${index}`} 
      idAttr={`remote-video-${index}`} 
    />)}</>
  }
  
  return (
    <div>
      <div className="buttons is-flex is-justify-content-center is-align-content-center is-align-items-center group-video">
        <button className="button is-warning" onClick={toggleVideo}>Toggle video</button>
        <button className="button is-warning" onClick={toggleAudio}>Toggle audio</button>
      </div>
      <div className="is-flex is-justify-content-center is-align-content-center is-align-items-center group-video">
        <Feed isHost='true' idAttr='user-video' />
        {/* <RemoteFeed participants={participantCount}/> */}
        <Feed isHost='false' idAttr='remote-video-0' />
        <Feed isHost='false' idAttr='remote-video-1' />
        <Feed isHost='false' idAttr='remote-video-2' />
      </div>
    </div>
  )
}

export default Meet;
