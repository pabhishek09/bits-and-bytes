const express = require('express');
const router = express.Router();
const meetRoutes = require('./meet');


const routes = [
  // Add root route files here
  ...meetRoutes,
];

routes.forEach((route) => {
  // Create express routes from local routes, change this to a middleware 
  router[route.method](route.path, (req, res) => route.handler(req, res));
});
const ping = require('./ping');

router.get('/ping', ping);
module.exports = router;
