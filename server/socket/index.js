function onIoConnect(socket) {
  console.log('Connection established', socket.id);

  socket.on('start-meet-event', (params) => {
    console.log('Socket Server :: start-meet-event',);
  });

  socket.on('join-meet-event', (params) => {
    console.log('Socket Server :: join-meet-event');
    socket.emit('join-meet-action', params);
  });

  socket.on('remote-description-event', (params) => {
    console.log('Socket Server :: remote-description-event');
    socket.emit('remote-description-action', params);
  });
}

module.exports = onIoConnect;
