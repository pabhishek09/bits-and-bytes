const { get }  = require('./meets');

const getMeetsMethod = 'get';

function getMeetsHandler(req, res) {
  console.log(':: getMeetsHandler ::');
  const meetId = req.query.id;
  const meet = get(meetId);
  if (meetId && !meet) return res.status(400).send({msg: 'Invalid meet id'});
  res.send({data: meet})
}

module.exports = {
  getMeetsMethod,
  getMeetsHandler,
}
