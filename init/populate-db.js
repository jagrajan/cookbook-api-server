require('dotenv').config();

const { createUser } = require('../models/User');
const { createIngredient } = require('../models/Ingredient');
const { createUnit } = require('../models/Unit');

const populate = async () => {
  let id = await createUser('jag@jagrajan.com', 'password', 'jag');
  console.log(`Created user with id ${id}`);
  id = await createUser('cat.holtz@hotmail.com', 'password', 'catherine');
  console.log(`Created user with id ${id}`);

  id = await createIngredient('Mushroom', 'Mushrooms');
  console.log(`Created ingredient with id ${id}`);
  id = await createIngredient('Crimini Mushroom', 'Crimini Mushrooms');
  console.log(`Created ingredient with id ${id}`);
  id = await createIngredient('White Mushroom');
  console.log(`Created ingredient with id ${id}`);

  id = await createUnit('Cup', 'Cups');
  console.log(`Created unit with id ${id}`);
  id = await createUnit('Teaspoon', 'Teaspoons');
  console.log(`Created unit with id ${id}`);
  id = await createUnit('', '');
  console.log(`Created unti with id ${id}`);
}

populate().catch(err => console.error(err)).finally(() => {
  console.info('Database population complete!');
  process.exit();
});
