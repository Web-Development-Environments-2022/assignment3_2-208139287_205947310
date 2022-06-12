const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into favoriterecipes values ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select DISTINCT recipe_id from favoriterecipes where user_id='${user_id}'`);
    return recipes_id;
}

async function getMyRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select DISTINCT recipe_id from recipes where user_id='${user_id}'`);
    return recipes_id;
}

async function getLastWatched(user_id){
    const recipes_id = await DButils.execQuery(`select DISTINCT recipe_id from lastwatched where user_id='${user_id}'`);
    return recipes_id;
}

async function getFamilyRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select DISTINCT recipe_id from familyrecipes where user_id='${user_id}'`);
    return recipes_id;
}

exports.getFamilyRecipes = getFamilyRecipes;
exports.getLastWatched = getLastWatched;
exports.getMyRecipes = getMyRecipes;
exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
