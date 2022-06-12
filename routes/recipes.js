var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const DButils = require("../routes/utils/DButils");

router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns 3 random recipes
 */
 router.get("/random", async (req, res, next) => {
  try {
    let random_3_recipes = await recipes_utils.getRandomThreeRecipes();
    res.send(random_3_recipes);
  } catch (error) {
    next(error);
  }
});


router.get("/search", async (req, res, next) => {

  await DButils.execQuery(
    `INSERT IGNORE INTO searchhistory VALUES ('${req.session.user_id}', '${req.body.query}')`
  );
  await DButils.execQuery(
    `UPDATE searchhistory
     SET query = '${req.body.query}'
     WHERE user_id = '${req.session.user_id}'`
 );
  try {
    const result = await recipes_utils.getSearchResults(req.body.query,req.body.amount = '5',req.body.sort,req.body.cuisine);
    ids_list=[]

    for (let i = 0; i < result.results.length; i++) {
      ids_list.push(result.results[i].id)
    }
    details = await recipes_utils.getRecipesPreview(ids_list);
    res.send(details);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {

  await DButils.execQuery(
    `INSERT INTO lastwatched VALUES ('${req.session.user_id}', '${req.params.recipeId}')`
  );

  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});




module.exports = router;
