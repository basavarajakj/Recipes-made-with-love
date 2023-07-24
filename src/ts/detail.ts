/**
 * @license MIT
 * @copyright 2023 bassu
 * @author bassu <basavarajakj06@gmail.com>
 */

"use strict";

/**
 * TYPES
 */

interface RecipeData {
  images: {
    LARGE?: {
      url: string;
      width: number;
      height: number;
    };
    REGULAR?: {
      url: string;
      width: number;
      height: number;
    };
    SMALL?: {
      url: string;
      width: number;
      height: number;
    };
    THUMBNAIL?: {
      url: string;
      width: number;
      height: number;
    };
  };
  label: string;
  source: string;
  ingredients?: string[];
  totalTime?: number;
  calories?: number;
  cuisineType?: string[];
  dietLabels?: string[];
  dishType?: string[];
  yield?: number;
  ingredientLines?: string[];
  uri: string;
}

/**
 * Imports
*/
import { fetchData } from "./api";
import { getTime } from "./module";

/**
 * Render data
 */

const $detailContainer = document.querySelector("[data-detail-container]")!;

window.ACCESS_POINT += `/${window.location.search.slice(window.location.search.indexOf("=") + 1)}`;

fetchData(null, (data: RecipeData) => {
  
  const {
    images: { LARGE, REGULAR, SMALL, THUMBNAIL },
    label: title,
    source: author,
    ingredients = [],
    totalTime: cookingTime = 0,
    calories = 0,
    cuisineType = [],
    dietLabels = [],
    dishType = [],
    yield: servings = 0,
    ingredientLines = [],
    uri
  } = data.recipe;

  document.title = `${title} - Recipes`;

  const banner = LARGE ?? REGULAR ?? SMALL ?? THUMBNAIL;
  const { url: bannerUrl, width, height } = banner;
  const tags = [...cuisineType, ...dietLabels, ...dishType];

  let tagElements = "";
  let ingredientItems = "";

  // extracting recipeId
  const recipeId = uri.slice(uri.lastIndexOf('_') + 1);

  // save recipes
  const isSaved = window.localStorage.getItem(`recipe${recipeId}`);

  tags.map(tag => {
    let type = "";

    if (cuisineType.includes(tag)) {
      type = "cuisineType";
    } else if (dietLabels.includes(tag)) {
      type = 'diet';
    } else {
      type = 'dishType';
    }

    tagElements += `
      <a href="./recipes.html?${type}=${tag.toLowerCase()}" class="filter-chip label-large has-state">${tag}</a>
    `;
  });

  ingredientLines.map((ingredient: string) => {
    ingredientItems += `
      <li class="ingr-item">
        ${ingredient}
      </li>
    `
  });

  $detailContainer.innerHTML = `
    <figure class="img-holder detail-banner">
      <img 
        src=${bannerUrl} 
        width=${width}
        height=${height}
        alt=${title}
        class="img-cover"
      />
    </figure>

    <div class="detail-content">

      <div class="title-wrapper">
        <h1 class="display-small">${title ?? "Untitled"}</h1>

        <button class="btn btn-secondary has-state has-icon ${isSaved ? "saved" : "removed"}" onclick="saveRecipe(this, '${recipeId}')">

          <span class="material-symbols-outlined bookmark-add" aria-hidden="true">bookmark_add</span>
          <span class="material-symbols-outlined bookmark" aria-hidden="true">bookmark</span>

          <span class="label-large save-text">Save</span>
          <span class="label-large unsaved-text">Unsaved</span>

        </button>
      </div>

      <div class="detail-author label-large">
        <span class="span">by</span> ${author}
      </div>

      <div class="detail-stats">

        <div class="stats-item">
          <span class="display-medium">${ingredients.length}</span>

          <span class="label-medium">Ingredients</span>
        </div>

        <div class="stats-item">
          <span class="display-medium">${getTime(cookingTime).time || "<1"}</span>

          <span class="label-medium">${getTime(cookingTime).timeUnit}</span>
        </div>

        <div class="stats-item">
          <span class="display-medium">${Math.floor(calories)}</span>

          <span class="label-medium">Calories</span>
        </div>
      </div>

      ${tagElements ? `<div class="tag-list">${tagElements}</div>` : ""}
     

      <h2 class="title-medium ingr-title">Ingredients
        <span class="label-medium">for ${servings} Servings</span>
      </h2>

      ${ingredientItems ? `<ul class="body-large ingr-list">${ingredientItems}</ul>` : ""}
      
    </div>
  `
})