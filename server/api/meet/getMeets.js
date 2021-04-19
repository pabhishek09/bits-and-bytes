const { get }  = require('./meets');

const getMeetsMethod = 'get';

function getMeetsHandler(req, res) {
  console.log('API:: GetMeets');
  res.send({
    data: gets(),
  })
}

module.exports = {
  getMeetsMethod,
  getMeetsHandler,
}
