const { Client } = require('pg');
const fs = require('fs');

const sql = fs.readFileSync('init/create-database.sql').toString();

const connectionString = 'postgres://' + process.env.DB_USER
  + ':' + process.env.DB_PASSWORD
  + '@' + process.env.DB_HOST + '/' + process.env.DB_NAME

const client = new Client({
  connectionString: connectionString,
});

client.connect();

client.query(sql, (err, res) => {
  console.log(err, res);
  client.end();
});
