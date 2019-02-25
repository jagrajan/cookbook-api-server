import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

export const set = (auth_key, key_data, callback) => {
  cache.set(auth_key, key_data, (err, success) => {
    if (err || !success) {
      return callback(err, success);
    }
    return callback(err, success);
  });
}

export const get = (auth_key, callback) => {
  cache.get(auth_key, (err, value) => {
    if (err) {
      return callback(err, value);
    }
    callback(err, value);
  })
}