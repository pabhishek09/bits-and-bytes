import io from 'socket.io-client';

let socket: any;

function createSocket() {
  return new Promise((resolve, reject) => {
    socket = io('http://localhost:4000/', { path: '/signal' });
    socket.on('connect', () => {
      console.log(`:: Socket client connected :: ${socket.id}`);
      resolve(socket);
    })
  });
}

async function getSocket() {
  if (!socket) await createSocket();
  return socket;
}

export default getSocket;
