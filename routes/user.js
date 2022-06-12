var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let favorite_recipes = {};
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});

router.get('/lastWatched', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getLastWatched(user_id);
    let favorite_recipes = {};
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array.slice(-3));
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});

router.get('/familyRecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getFamilyRecipes(user_id);
    let favorite_recipes = {};
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreviewDB(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});



router.post("/createRecipe", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    let recipes = [];
    recipes = await DButils.execQuery("SELECT recipe_id from recipes");

    // parameters exists
    // valid parameters
    let recipe_details = {
      id: recipes.length+100,
      title: req.body.title,
      readyInMinutes: req.body.readyInMinutes,
      image: req.body.image,
      popularity: "0",
      vegan: req.body.vegan,
      vegetarian: req.body.vegetarian,
      glutenFree: req.body.glutenFree,
      extendedIngredients: req.body.extendedIngredients,
      servings: req.body.servings,
      instructions: req.body.instructions,
    }

    await DButils.execQuery(
      `INSERT INTO recipes VALUES ('${recipe_details.id}','${user_id}', '${recipe_details.title}', '${recipe_details.readyInMinutes}',
      '${recipe_details.image}', '${recipe_details.popularity}', '${recipe_details.vegan}', '${recipe_details.vegetarian}', '${recipe_details.glutenFree}',
      '${recipe_details.extendedIngredients}', '${recipe_details.servings}', '${recipe_details.in}')`
    );
    res.status(201).send({ message: "recipe created", success: true });
  } catch (error) {
    next(error);
  }
});


router.get('/myRecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getMyRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreviewDB(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});


module.exports = router;
