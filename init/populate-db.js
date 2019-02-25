require('dotenv').config();

const { createUser } = require('../models/User');

const populate = async () => {
  const id = await createUser('jag@jagrajan.com', 'password');
  console.log(`Created user with id ${id}`);
}

populate().finally(() => {
  console.info('Database population complete!');
  process.exit();
});
