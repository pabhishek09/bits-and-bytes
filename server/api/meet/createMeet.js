const { add }  = require('./meets');

const createMeetMethod = 'post';

function createMeetHandler(req, res) {
  console.log('API:: createMeet');
  const { inviter } = req.body;
  if (!inviter) res.status(400).send('Missing fields');
  const response = add(inviter);
  res.send(response);
}

module.exports = {
  createMeetMethod,
  createMeetHandler,
}
