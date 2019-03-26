require('dotenv').config();

const { createUser } = require('../models/User');
const { createIngredient } = require('../models/Ingredient');

const populate = async () => {
  let id = await createUser('jag@jagrajan.com', 'password', 'jag');
  console.log(`Created user with id ${id}`);
  id = await createUser('cat.holtz@hotmail.com', 'password', 'catherine');
  console.log(`Created user with id ${id}`);

  id = await createIngredient('Mushrooms');
  console.log(`Created ingredient with id ${id}`);
  id = await createIngredient('Crimini Mushrooms');
  console.log(`Created ingredient with id ${id}`);
  id = await createIngredient('White Mushrooms');
  console.log(`Created ingredient with id ${id}`);
}

populate().catch(err => console.error(err)).finally(() => {
  console.info('Database population complete!');
  process.exit();
});
