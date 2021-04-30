function ping(req, res) {
  res.send({ data: ':: ping ::' });
}

module.exports = ping;
