const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("./DButils");



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
        
    });
}

async function getRandomRecipes() {
    const response = await axios.get(`${api_domain}/random`, {
        params: {
            number: 10,
            apiKey: process.env.spooncular_apiKey
        }
    });
    return response
}

async function extractPreviewRecipeDetails(recipes_info) {

    return recipes_info.map((recipe_info) => {
        //checks the data type so it can work with different types of data
        let data = recipe_info;
        if((recipe_info.data)){
            data = recipe_info.data;
        }

        const {
            id,
            title,
            readyInMinutes,
            image,
            aggregateLikes,
            vegan,
            vegetarian,
            glutenFree
        } = data;

        return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
        }

    }
    )

}

async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, extendedIngredients, servings, instructions } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        extendedIngredients: extendedIngredients,
        servings: servings,
        instructions: instructions,

    }
}

async function getRecipesPreview(recipes_ids_list){
    let promises = [];
    recipes_ids_list.map((id) => {
        promises.push(getRecipeInformation(id))
    })
    let info_res = await Promise.all(promises);
    return extractPreviewRecipeDetails(info_res);
}

async function getRandomThreeRecipes(){
    let random_pool = await getRandomRecipes();
    let filterd_random_pool = await random_pool.data.recipes.filter((random) => random.instructions != "" & random.aggregateLikes != 'undefined');
    if(filterd_random_pool.length < 3){
        return getRandomThreeRecipes();
    }
    return extractPreviewRecipeDetails([filterd_random_pool[0],filterd_random_pool[1],filterd_random_pool[2]])
}

async function getRecipeDetailsDB(recipe_id) {

    recipe = await DButils.execQuery(`select title, readyInMinutes, image, popularity, vegan, vegetarian, glutenFree, extendedIngredients, servings, instructions from recipes where recipe_id='${recipe_id}'`);

    return {
        id: recipe_id,
        title: recipe[0].title,
        readyInMinutes: recipe[0].readyInMinutes,
        image: recipe[0].image,
        popularity: recipe[0].popularity,
        vegan: recipe[0].vegan,
        vegetarian: recipe[0].vegetarian,
        glutenFree: recipe[0].glutenFree,
        extendedIngredients: recipe[0].extendedIngredients,
        servings: recipe[0].servings,
        instructions: recipe[0].instructions,
    }
}

async function getRecipesPreviewDB(recipes_ids_list){
    let promises = [];
    recipes_ids_list.map((id) => {
        promises.push(getRecipeDetailsDB(id))
    })
    let info_res = await Promise.all(promises);
    return info_res
    //return extractPreviewRecipeDetails(info_res); //less details
}

async function searchRecipes(query,number,sort,cuisine) {
    const response = await axios.get(`${api_domain}/complexSearch`, {
        params: {
            query: query,
            number: number,
            sort: sort,
            cuisine: cuisine,
            apiKey: process.env.spooncular_apiKey
        }
        
    });
    return response
}


async function getSearchResults(query,number,sort,cuisine) {
    let response = await searchRecipes(query,number,sort,cuisine);
    return response.data//extractPreviewRecipeDetails(response.data.recipes);
}


exports.getSearchResults = getSearchResults;
exports.getRecipesPreviewDB = getRecipesPreviewDB;
exports.getRecipeDetailsDB = getRecipeDetailsDB;
exports.getRecipeDetails = getRecipeDetails;
exports.getRecipesPreview = getRecipesPreview;
exports.getRandomThreeRecipes = getRandomThreeRecipes;



