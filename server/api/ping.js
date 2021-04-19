function ping(req, res) {
  res.send({ data: 'API says :: web-storm!' });
}

module.exports = ping;
