var meets = [];

function get(id) {
  if (!id) return meets;
  const index = indexOfMeet(id);
  if (index > -1) {
    return meets[index];
  }
  return '';
}

function add(host) {
  const meet = {
    host,
    id: makeId(),
  };
  meets.push(meet);
  return meet;
}

function close(id) {
  const index = indexOfMeet(id);
  if (index > -1) {
    return meets.splice(index, 1)[0];
  }
  return '';
}

function indexOfMeet(id) {
  let index = -1;
  for (let index = 0; index < meets.length; index++ ) {
    if (id === meets[index].id)  return index
  }
  return index;
}

function makeId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-';
  const id = [];
  new Array(6).fill(0).forEach(() => id.push(chars.charAt(Math.floor(Math.random() * chars.length))));
  return id.join('');
}

module.exports =  {
  get,
  add,
  close
}
