function onIoConnect(socket) {

  socket.on('start-meet', (event) => {
    console.log('Socket Server :: start-meet');
    socket.join(event.id);
    socket.emit('start-meet');
  });

  socket.on('join-meet', (event) => {
    // id - room id of the meet
    console.log(':: Socket Server :: join-meet');
    socket.join(event.id);
    // broadcast to existing members that new person has joined
    socket.broadcast.to(event.id).emit('join-meet', { joinee_id: socket.id });
  });

  socket.on('sdp_request', (event) => {
    // request_by - socket id of existing participant
    // request_to - socket id of new participant
    // sdp - sdp of existing participant
    console.log(`:: Socket Server :: sdp_request :: by ${event.request_by} to ${event.request_to}`);
    socket.broadcast.to(event.request_to).emit('sdp_request', event);
  });

  socket.on('sdp_response', (event) => {
    // response_by: socket id of new participant
    // resonse_to: socket id of existing participant
    // sdp: sdp of existing participant
    console.log(`:: Socket Server :: sdp_response :: by ${event.response_by} to ${event.resonse_to}`);
    socket.broadcast.to(event.resonse_to).emit('sdp_response', event);
  });

  socket.on('new_ice_candidate', (event) => {
    // canditate_by: socket id of sender
    // canditate_to: socket id of connection
    // candidate: ice canditate
    console.log(`:: Broadcasting new_ice_candidate by ${event.canditate_by} to ${event.canditate_to}`);
    socket.broadcast.to(event.canditate_to).emit('new_ice_candidate', event);
  })

}

module.exports = onIoConnect;
