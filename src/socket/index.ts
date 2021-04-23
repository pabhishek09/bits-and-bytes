import io from 'socket.io-client';

let socket: any;

function createSocket() {
  return new Promise((resolve, reject) => {
    socket = io('http://localhost:4000/', 
    {
      path: '/signal',
      query: {
        x: 42
      }
    });
    socket.on('connect', () => {
      console.log('Socket client connected', socket.id);

      // socket.on('start-meet-action', (params: any) => {
      //   console.log('Socket Client:: start-meet-action');
      // });
      // socket.on('join-meet-action', (params: any) => {
      //   console.log('Socket Client:: join-meet-action');
      // });

      socket = socket;
      resolve(socket);
    })
  });

}


// socket.on('connect', () => {
// console.log('Socket client connected', socket.id);

// socket.on('join-meet', (params:  PeerConnectionSignal) => {
//   if (params.socketId !== socket.id) {
//     socket.emit('remote-description', {

//     });
//   }
// });

// socket.on('remote-description', (params: PeerConnectionSignal) => {
//   console.log('Remote description event was received');
// });

// socket.emit('start-meet', {
//   name: 'John',
//   meetId: id,
//   socketId: socket.id,
//   sdp: peerConnection.localDescription
// });

// });

async function getSocket() {
  if (!socket) await createSocket();
  return socket;
}


export {
  getSocket,
}
