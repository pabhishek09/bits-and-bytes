const { createMeetMethod, createMeetHandler } = require('./createMeet');
const { getMeetsMethod, getMeetsHandler } = require('./getMeets');
const { closeMeetMethod, closeMeetHandler } = require('./closeMeet');

module.exports = [
  {
    path: '/meet',
    method : createMeetMethod,
    handler: createMeetHandler
  }, {
    path: '/meet',
    method : getMeetsMethod,
    handler: getMeetsHandler
  }, {
    path: '/meet',
    method : closeMeetMethod,
    handler: closeMeetHandler
  },
];
