import React from 'react';

function Home() {

  let mediaStream: MediaStream;
  const constraints = {
    audio: true,
    video: true, // Specify video resolution per requirements
  };

  function initMediaStream() {
    navigator.getUserMedia(constraints, successCallback, errorCallback);
  }

  function successCallback(mediastream: MediaStream) {
    console.info('Media stream is coming through');
    mediaStream = mediastream;
    const videoEl = document.getElementById('user-video') as HTMLMediaElement;
    if (videoEl) videoEl.srcObject = mediastream;
  }

  function errorCallback(error: MediaStreamError) {
    console.error(error.name);
    if (error.name === 'PermissionDeniedError') {
      console.info('Permissions have not been granted to use your camera and microphone');
    }
  }

  function toggleVideo() {
    if (mediaStream) {
      const videoTracks = mediaStream.getVideoTracks();
      if (videoTracks.length) {
        videoTracks[0].enabled = !videoTracks[0].enabled;
      }
    } 
  }

  function toggleAudio() {
    if (mediaStream) {
      const audioTracks = mediaStream.getAudioTracks();
      if (audioTracks.length) {
        audioTracks[0].enabled = !audioTracks[0].enabled;
      }
    }
  }

  return (
    <div>
      <span className="tag is-primary">Home page</span>
      <div className="buttons">
        <button className="button is-primary" onClick={initMediaStream}>Turn on video</button>
        <button className="button is-warning" onClick={toggleVideo}>Toggle video</button>
        <button className="button is-warning" onClick={toggleAudio}>Toggle audio</button>
      </div>
      <div className="user-video-container">
        <video height="400" width="600" id="user-video" autoPlay></video>
      </div>
    </div>
  );
}

export default Home;
