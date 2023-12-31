/**
 * @license MIT
 * @copyright 2023 bassu
 * @author bassu <basavarajakj06@gmail.com>
 */

'use strict';

/**
 * Imports
 */

import { fetchData } from './api';
import { $skeletonCard, cardQueries } from './global';
import { getTime } from './module';

/**
 * Home page Search
 */

const $SearchField: HTMLInputElement | null = document.querySelector(
	'[data-search-field]'
);
const $SearchBtn: HTMLButtonElement | null =
	document.querySelector('[data-search-btn]');
const $SearchError: HTMLParagraphElement | null = document.querySelector(
	'[data-search-error]'
);

if ($SearchField && $SearchBtn) {
	$SearchBtn.addEventListener('click', function (this: HTMLElement) {
		if ($SearchField.value) {
			window.location.href = `/src/pages/recipes.html?q=${
				($SearchField as HTMLInputElement).value
			}`;
		} else if ($SearchError) {
			$SearchError.setAttribute('aria-hidden', 'false');
		}
	});
}

/**
 * Search submit when press "Enter key"
 */

if ($SearchField && $SearchBtn) {
	$SearchField.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') {
			$SearchBtn.click();
		}
	});
}

/**
 * Tab panel Navigation
 */

interface AddEventOnElementsOptions {
	$elements: NodeList;
	eventType: string;
	callback: (this: HTMLElement, e: Event) => void;
}

export const addEventOnElements = ({
	$elements,
	eventType,
	callback,
}: AddEventOnElementsOptions) => {

	for (const element of Array.from($elements)) {
		element.addEventListener(eventType, callback);
	}
};

const $tabBtns: NodeListOf<HTMLButtonElement> =
	document.querySelectorAll('[data-tab-btn]');
const $tabPanels: NodeListOf<HTMLElement> =
	document.querySelectorAll('[data-tab-panel]');

let $lastActiveTabBtn: HTMLElement | undefined = $tabBtns[0];
let $lastActiveTabPanel: HTMLElement | null = $tabPanels[0];

addEventOnElements({
	$elements: $tabBtns,
	eventType: 'click',
	callback: function (this: HTMLElement) {
		$lastActiveTabPanel?.setAttribute('hidden', 'true');
		$lastActiveTabBtn?.setAttribute('aria-selected', 'false');
		$lastActiveTabBtn?.setAttribute('tabindex', '-1');

		const $currentTabPanel: HTMLElement | null = document.querySelector(
			`#${this.getAttribute('aria-controls')}`
		);

		if ($currentTabPanel) {
			$currentTabPanel?.removeAttribute('hidden');
			this.setAttribute('aria-selected', 'true');
			this.setAttribute('tabindex', '0');

			$lastActiveTabPanel = $currentTabPanel;
			$lastActiveTabBtn = this;

			addTabContent(this, $currentTabPanel);
		}
	},
});

/**
 * Navigate Tab with arrow key
 */

addEventOnElements({
	$elements: $tabBtns,
	eventType: 'keydown',
	callback: function (this: HTMLElement, e: Event) {
		const keyboardEvent = e as KeyboardEvent;
		const $nextElement = this.nextElementSibling;
		const $previousElement  = this.previousElementSibling;

		if ($nextElement instanceof HTMLElement && keyboardEvent.key === 'ArrowRight') {
			this.setAttribute('tabindex', '-1');
			$nextElement.setAttribute('tabindex', '0');
			$nextElement.focus();
		} else if ($previousElement instanceof HTMLElement && keyboardEvent.key === 'ArrowLeft') {
			this.setAttribute('tabindex', '-1');
			$previousElement?.setAttribute('tabindex', '0');
			$previousElement.focus();
		} else if (keyboardEvent.key === 'Tab') {
			this.setAttribute('tabindex', '-1');
			$lastActiveTabBtn?.setAttribute('tabindex', '0');
		}
	},
});

/**
 * WORK WITH API
 * fetch data from tab content
 */

const addTabContent = ($currentTabBtn: HTMLElement | null, $currentTabPanel: HTMLElement) => {
	const $girdList = document.createElement('div');
	$girdList.classList.add('grid-list');

	$currentTabPanel.innerHTML = `
		<div class="grid-list">
			${$skeletonCard.repeat(12)}
		</div>
	`;

	fetchData(
		[
			['mealType', $currentTabBtn?.textContent?.trim().toLowerCase() || ''],
			...cardQueries,
		],
		function (data) {
			$currentTabPanel.innerHTML = '';

			for (let i = 0; i < 10; i++) {
				const {
					recipe: { image, label: title, totalTime: cookingTime, uri },
				} = data.hits[i];

				// extracting recipeId
				const recipeId = uri.slice(uri.lastIndexOf('_') + 1);

				// save recipes
				const isSaved = window.localStorage.getItem(`recipe${recipeId}`);

				const $card = document.createElement('div');
				$card.classList.add('card');

				$card.style.animationDelay = `${100 * i}ms`;

				$card.innerHTML = `
				<figure class="card-media img-holder">
					<img 
					src="${image}" 
					height="200" 
					loading="lazy" 
					alt="${title}" 
					class="img-cover"
					/>
				</figure>

				<div class="card-body">

					<h3 class="title-small">
					<a href="./src/pages/detail.html?recipe=${recipeId}" class="card-link">${
					title || 'UnTitled'
				}</a>
					</h3>

					<div class="meta-wrapper">

					<div class="meta-item">
						<span class="material-symbols-outlined" aria-hidden="true">schedule</span>

						<span class="label-medium">
						${getTime(cookingTime).time || '<10'} ${getTime(cookingTime).timeUnit} 
						</span>
					</div>

					<button
						class="icon-btn has-state ${isSaved ? 'saved' : 'removed'}" 
						aria-label="Add to saved recipes" 
						onClick="saveRecipe(this, '${recipeId}')"
					>
						<span class="material-symbols-outlined bookmark-add" aria-hidden="true">bookmark_add</span>
						<span class="material-symbols-outlined bookmark" aria-hidden="true">bookmark</span>
					</button>

					</div>

				</div>
			`;

				$girdList.appendChild($card);
			}

			$currentTabPanel.appendChild($girdList);

			if ($currentTabBtn && $currentTabBtn.textContent) {
				
				$currentTabPanel.innerHTML += `
					<a href="/src/pages/recipes.html?mealType=${$currentTabBtn.textContent
						.trim()
						.toLowerCase()}" class="btn btn-secondary label-large has-state">Show more</a>
				`;
			}
		}
	);
};

addTabContent($lastActiveTabBtn, $lastActiveTabPanel);

/**
 * Fetch data for slider card
 */

export interface RecipeItem {
  recipe: {
    image: string;
    label: string;
    totalTime: number;
    uri: string;
	};
}

export interface RecipeItem1 {
  hits: {
    recipe: {
      image: string;
      label: string;
      totalTime: number;
      uri: string;
    };
  }[];
}
let cuisineTypes: string[] = ['Indian', 'American', 'French'];

const sliderSections: NodeListOf<HTMLElement> | null =
	document.querySelectorAll('[data-slider-section]');

if (sliderSections) {
	for (const [index, $sliderSection] of Array.from(sliderSections).entries()) {
		$sliderSection.innerHTML = `
		<div class="container">

			<h2 class="section-title headline-small" id="slider-label-1">
			Latest ${cuisineTypes[index]} Recipes
			</h2>

			<div class="slider">

            	<ul class="slider-wrapper" data-slider-wrapper>

					${`<li class="slider-item">${$skeletonCard}</li>`.repeat(10)}

				</ul>

			</div>

		</div>
    `;

		const $sliderWrapper: HTMLElement | null = $sliderSection.querySelector('[data-slider-wrapper]');

		fetchData(
			[...cardQueries, ['cuisineType', cuisineTypes[index]]],
			function (data) {
				if ($sliderWrapper) {
					$sliderWrapper.innerHTML = '';

					data?.hits.map((item: RecipeItem) => {
						const {
							recipe: { image, label: title, totalTime: cookingTime, uri },
						} = item;

						// extracting recipeId
						const recipeId = uri.slice(uri.lastIndexOf('_') + 1);

						// save recipes
						const isSaved = window.localStorage.getItem(`recipe${recipeId}`);

						const $sliderItem = document.createElement("li");
						$sliderItem.classList.add("slider-item");

						$sliderItem.innerHTML = `
							<div class="card">
								<figure class="card-media img-holder">
									<img 
										src="${image}" 
										height="200" 
											loading="lazy" 
										alt="${title}" 
										class="img-cover"
									/>
								</figure>
				
								<div class="card-body">
				
									<h3 class="title-small">
									<a href="./src/pages/detail.html?recipe=${recipeId}" class="card-link">${title || 'UnTitled'}</a>
									</h3>
				
									<div class="meta-wrapper">
				
									<div class="meta-item">
										<span class="material-symbols-outlined" aria-hidden="true">schedule</span>
				
										<span class="label-medium">
										${getTime(cookingTime).time || '<10'} ${getTime(cookingTime).timeUnit} 
										</span>
									</div>
				
									<button
										class="icon-btn has-state ${isSaved ? 'saved' : 'removed'}" 
										aria-label="Add to saved recipes" 
										onClick="saveRecipe(this, '${recipeId}')"
									>
										<span class="material-symbols-outlined bookmark-add" aria-hidden="true">bookmark_add</span>
										<span class="material-symbols-outlined bookmark" aria-hidden="true">bookmark</span>
									</button>
				
									</div>
				
								</div>
							</div>
						`;

						$sliderWrapper.appendChild($sliderItem);

					});

					$sliderWrapper.innerHTML += `
					<li class="slider-item" data-slider-item>
						<a href="/src/pages/recipes.html?cuisineType=${cuisineTypes[index].toLowerCase()}" class="load-more-card has-state">
							<span class="label-type">Show more</span>

							<span class="material-symbols-outlined bookmark" aria-hidden="true">navigate_next</span>
						</a>
					</li>
					`
				}
			}
		);
	}
}
