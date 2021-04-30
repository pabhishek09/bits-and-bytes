const express = require('express');
const router = express.Router();
const meetRoutes = require('./meet');
const ping = require('./ping');

const routes = [
  // Add root route files here
  ...meetRoutes,
];

router.get('/ping', ping);
routes.forEach((route) => {
  // Create express routes from local routes, change this to a middleware 
  router[route.method](route.path, (req, res) => route.handler(req, res));
});



module.exports = router;
