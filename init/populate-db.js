require('dotenv').config();

const { createUser, makeAdmin } = require('../models/User');
const { createIngredient } = require('../models/Ingredient');
const { createUnit } = require('../models/Unit');
const { createRecipe, createRecipeVersion } = require('../models/Recipe');

const populate = async () => {
  console.log('CREATING ADMINS');
  let id = await createUser('jag@jagrajan.com', 'password', 'jag');
  console.log(`Created user with id ${id}`);
  let admin = await makeAdmin(id);
  console.log(`User ${id} is now an admin`);
  id = await createUser('cat.holtz@hotmail.com', 'password', 'catherine');
  console.log(`Created user with id ${id}`);

  const rotini_id = await createIngredient('whole grain rotini', 'whole grain rotini');
  const olive_oil_id = await createIngredient('olive oil', 'olive oil');
  const medium_onion_id = await createIngredient('medium onion', 'medium onions');
  const diced_tomatos_id = await createIngredient('diced tomatoes', 'diced tomatoes');
  const tomato_paste_id = await createIngredient('tomato paste', 'tomato paste');
  const cream_cheese_id = await createIngredient('cream cheese', 'cream cheese');
  const spinach_ff_id = await createIngredient('fresh or frozen spinach', 'fresh or frozen spinach');
  const parmesan_id = await createIngredient('parmesan', 'parmesan');
  const dried_oregano_id = await createIngredient('dried oregano', 'dried oregano');
  const dried_basil_id = await createIngredient('dried basil', 'dried basil');
  const red_pepper_flakes_id = await createIngredient('red pepper flakes', 'red pepper flakes');
  const salt_and_pepper_id = await createIngredient('salt and pepper', 'salt and pepper');
  const minced_garlic_id = await createIngredient('minced garlic', 'minced garlic');
  const large_shell_pasta_id = await createIngredient('large shell pasta', 'large shell pasta');
  const flour_id = await createIngredient('flour', 'flour');
  const margarine_id = await createIngredient('margarine', 'margarine');
  const half_and_half_id = await createIngredient('half and half', 'half and half');
  const pumpkin_puree_id = await createIngredient('pumpkin purée', 'pumpkin purée');

  const no_unit_id = await createUnit('', '');
  const cup_id = await createUnit('cup', 'cups');
  const tsp_id = await createUnit('tsp', 'tsp');
  const tbsp_id = await createUnit('tbsp', 'tbsp');
  const hf_id = await createUnit('handful', 'handfuls');
  const pinch_id = await createUnit('pinch', 'pinches');
  const ml_id = await createUnit('ml', 'ml');
  const gram_id = await createUnit('gram', 'grams');

  const pumpkin_alfredo = await createRecipe('pumpkin-alfredo');
  const pumpkin_alfredo_version = await createRecipeVersion(
    pumpkin_alfredo.id,
    pumpkin_alfredo.latest_version,
    'Pumpkin Alfredo',
    'Very fast, but tasty pasta',
    `p Just don't add too much salt!`,
    [
      {
        position: 1,
        description: 'Cook shell pasta according to directions. Strain pasta and set aside.'
      },
      {
        position: 2,
        description: 'Heat margarine in large pot over medium heat.'
      },
      {
        position: 3,
        description: 'Add minced garlic to margarine and stir until garlic is fragrant. Do not burn.'
      },
      {
        position: 4,
        description: 'Whisk in flour until thin paste forms. Cook for ~ 1 minute.'
      },
      {
        position: 5,
        description: 'Whisk in pumpkin and half and half. Simmer on low-meidum heat until sauce thickens slightly.'
      },
      {
        position: 6,
        description: 'Stir in Parmesan and heat until cheese is melted.'
      },
      {
        position: 7,
        description: 'Add pasta to sauce and toss until hot.'
      },
      {
        position: 8,
        description: 'Serve immediately, top with additional Parmesan.'
      }
    ],
    [
      {
        position: 1,
        ingredient: 'large shell pasta',
        minAmount: 350,
        maxAmount: 350,
        unit: gram_id
      },
      {
        position: 2,
        ingredient: 'margarine',
        minAmount: 2,
        maxAmount: 2,
        unit: tbsp_id
      },
      {
        position: 3,
        ingredient: 'minced garlic',
        minAmount: 3,
        maxAmount: 3,
        unit: tbsp_id
      },
      {
        position: 4,
        ingredient: 'flour',
        minAmount: 1,
        maxAmount: 2,
        unit: tbsp_id
      },
      {
        position: 5,
        ingredient: 'pumpkin purée',
        minAmount: 1,
        maxAmount: 1,
        unit: cup_id
      },
      {
        position: 6,
        ingredient: 'parmesan',
        minAmount: '1/2',
        maxAmount: '1/2',
        unit: cup_id
      }
    ],
    'more_fud.jpg'
  );

  // Creamy tomato pasta
  const tomato_spinach_pasta = await createRecipe('tomato-spinach-pasta');
  const tomato_spinach_pasta_version = await createRecipeVersion(
    tomato_spinach_pasta.id,
    tomato_spinach_pasta.latest_version,
    'Tomato Spinach Pasta',
    'Creamy and Delicious!',
    'p Still working on an intro',
    [
      {
        position: 1,
        description: 'Cook rotini. Strain and set aside.'
      },
      {
        position: 2,
        description: 'Dice the onion.'
      },
      {
        position: 3,
        description: 'Heat oil in large pot, add the onion and minced garlic, and cook until onion is transparent (~5 minutes)'
      },
      {
        position: 4,
        description: 'Add tomatoes and spinach'
      },
      {
        position: 5,
        description: 'Add the oregano, bail, red pepper flakes, sald and pepper'
      },
      {
        position: 6,
        description: 'Add the tomato paste and the cream cheese. Stir until dissolved.'
      },
      {
        position: 7,
        description: 'Add parmesan'
      },
      {
        position: 8,
        description: 'Add pasta. Stir until heated through'
      },
      {
        position: 9,
        description: 'Serve on its own or toppped with parmesan'
      }
    ],
    [
      {
        ingredient: 'whole grain rotini',
        minAmount: 4,
        maxAmount: 4,
        position: 1,
        unit: cup_id
      },
      {
        ingredient: 'olive oil',
        minAmount: 6,
        maxAmount: 6,
        position: 2,
        unit: tbsp_id
      },
      {
        ingredient: 'medium onion',
        minAmount: 1,
        maxAmount: 1,
        position: 3,
        unit: no_unit_id
      },
      {
        ingredient: 'diced tomatoes',
        minAmount: 796,
        maxAmount: 796,
        position: 4,
        unit: ml_id
      },
      {
        ingredient: 'tomato paste',
        minAmount: 4,
        maxAmount: 4,
        position: 5,
        unit: tbsp_id
      },
      {
        ingredient: 'cream cheese',
        minAmount: 6,
        maxAmount: 6,
        position: 6,
        unit: tbsp_id
      },
      {
        ingredient: 'fresh or frozen spinach',
        minAmount: 2,
        maxAmount: 2,
        position: 7,
        unit: hf_id
      },
      {
        ingredient: 'parmesan',
        minAmount: '1/2',
        maxAmount: '1/2',
        position: 8,
        unit: cup_id
      },
      {
        ingredient: 'dried oregano',
        minAmount: 2,
        maxAmount: 2,
        position: 9,
        unit: tsp_id
      },
      {
        ingredient: 'dried basil',
        minAmount: 2,
        maxAmount: 2,
        position: 10,
        unit: tsp_id
      },
      {
        ingredient: 'red pepper flakes',
        minAmount: 1,
        maxAmount: 1,
        position: 11,
        unit: pinch_id
      },
       {
        ingredient: 'salt and pepper',
        minAmount: '',
        maxAmount: '',
        position: 12,
        unit: no_unit_id
      },
       {
        ingredient: 'minced garlic',
        minAmount: 2,
        maxAmount: 2,
        position: 13,
        unit: tbsp_id
      },
    ],
    'bibsy-lies-down.png'
  );



}

populate().catch(err => console.error(err)).finally(() => {
  console.info('Database population complete!');
  process.exit();
});
