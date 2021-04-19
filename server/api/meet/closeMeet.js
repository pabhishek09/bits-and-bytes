const { close }  = require('./meets');

const closeMeetMethod = 'delete';

function closeMeetHandler(req, res) {
  console.log('API:: Close Meet');
  const { id } = req.body;
  if (!id) res.status(400).send('Missing fields');
  res.send(close(id));
}

module.exports = {
  closeMeetMethod,
  closeMeetHandler,
}
