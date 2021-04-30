const { add }  = require('./meets');

const createMeetMethod = 'post';

function createMeetHandler(req, res) {
  console.log(':: createMeetHandler ::');
  console.log(req.body);
  const { host } = req.body;
  if (!host) return res.status(400).send({msg: 'Missing fields'});
  const response = add(host);
  res.send(response);
}

module.exports = {
  createMeetMethod,
  createMeetHandler,
}
