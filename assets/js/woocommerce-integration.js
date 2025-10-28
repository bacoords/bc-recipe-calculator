/**
 * WooCommerce Integration JavaScript
 * Handles recipe search and display in WooCommerce product edit screen
 */

(function($) {
	'use strict';

	let searchTimeout = null;

	/**
	 * Initialize the recipe search functionality
	 */
	function initRecipeSearch() {
		const $searchInput = $('#bc_recipe_search');
		const $resultsContainer = $('#bc-recipe-results');
		const $selectedRecipe = $('#bc-selected-recipe');
		const $spinner = $('.bc-recipe-search-field .spinner');

		// Handle search input with debouncing
		$searchInput.on('input', function() {
			const searchTerm = $(this).val().trim();

			// Clear previous timeout
			if (searchTimeout) {
				clearTimeout(searchTimeout);
			}

			// Clear results if search is empty
			if (searchTerm.length === 0) {
				$resultsContainer.empty();
				return;
			}

			// Debounce search by 300ms
			searchTimeout = setTimeout(function() {
				searchRecipes(searchTerm);
			}, 300);
		});

		/**
		 * Perform REST API recipe search
		 *
		 * @param {string} searchTerm The search term
		 */
		function searchRecipes(searchTerm) {
			$spinner.addClass('is-active');
			$resultsContainer.html('<p>Searching recipes...</p>');

			$.ajax({
				url: bcRecipeWooCommerce.rest_url,
				type: 'GET',
				data: {
					search: searchTerm,
					per_page: 10,
					_fields: 'id,title,meta'
				},
				beforeSend: function(xhr) {
					xhr.setRequestHeader('X-WP-Nonce', bcRecipeWooCommerce.rest_nonce);
				},
				success: function(response) {
					$spinner.removeClass('is-active');

					if (response && response.length > 0) {
						// Transform REST API response to match expected format
						const recipes = response.map(function(recipe) {
							const meta = recipe.meta || {};
							return {
								id: recipe.id,
								title: recipe.title.rendered,
								total_cost: parseFloat(meta.total_cost) || 0,
								cost_per_serving: parseFloat(meta.cost_per_serving) || 0,
								servings: parseInt(meta.recipe_servings) || 0,
								ingredients: meta.recipe_ingredients ? JSON.parse(meta.recipe_ingredients) : []
							};
						});
						displayRecipeResults(recipes);
					} else {
						$resultsContainer.html(
							'<p class="bc-no-results">No recipes found.</p>'
						);
					}
				},
				error: function(xhr, status, error) {
					$spinner.removeClass('is-active');
					$resultsContainer.html(
						'<p class="bc-error">Error searching recipes: ' + error + '</p>'
					);
				}
			});
		}

		/**
		 * Display recipe search results
		 *
		 * @param {Array} recipes Array of recipe objects
		 */
		function displayRecipeResults(recipes) {
			if (recipes.length === 0) {
				$resultsContainer.html('<p class="bc-no-results">No recipes found.</p>');
				return;
			}

			let html = '<div class="bc-recipe-list">';
			html += '<table class="widefat striped">';
			html += '<thead><tr>';
			html += '<th>Recipe Name</th>';
			html += '<th>Servings</th>';
			html += '<th>Total Cost</th>';
			html += '<th>Cost per Serving</th>';
			html += '<th>Action</th>';
			html += '</tr></thead>';
			html += '<tbody>';

			recipes.forEach(function(recipe) {
				html += '<tr data-recipe-id="' + recipe.id + '">';
				html += '<td><strong>' + escapeHtml(recipe.title) + '</strong></td>';
				html += '<td>' + recipe.servings + '</td>';
				html += '<td>$' + formatCurrency(recipe.total_cost) + '</td>';
				html += '<td>$' + formatCurrency(recipe.cost_per_serving) + '</td>';
				html += '<td><button type="button" class="button button-small bc-view-recipe" data-recipe-id="' + recipe.id + '">View Details</button></td>';
				html += '</tr>';
			});

			html += '</tbody></table>';
			html += '</div>';

			$resultsContainer.html(html);

			// Attach click handlers to view buttons
			$resultsContainer.find('.bc-view-recipe').on('click', function() {
				const recipeId = $(this).data('recipe-id');
				const recipe = recipes.find(r => r.id === recipeId);
				if (recipe) {
					displayRecipeDetails(recipe);
				}
			});
		}

		/**
		 * Display detailed recipe information
		 *
		 * @param {Object} recipe Recipe object
		 */
		function displayRecipeDetails(recipe) {
			let html = '<div class="bc-recipe-detail-card">';
			html += '<h4>' + escapeHtml(recipe.title) + '</h4>';

			html += '<div class="bc-recipe-summary">';
			html += '<div class="bc-cost-summary">';
			html += '<div class="bc-cost-item">';
			html += '<span class="bc-cost-label">Total Cost:</span>';
			html += '<span class="bc-cost-value">$' + formatCurrency(recipe.total_cost) + '</span>';
			html += '</div>';
			html += '<div class="bc-cost-item">';
			html += '<span class="bc-cost-label">Servings:</span>';
			html += '<span class="bc-cost-value">' + recipe.servings + '</span>';
			html += '</div>';
			html += '<div class="bc-cost-item bc-cost-highlight">';
			html += '<span class="bc-cost-label">Cost per Serving:</span>';
			html += '<span class="bc-cost-value">$' + formatCurrency(recipe.cost_per_serving) + '</span>';
			html += '</div>';
			html += '</div>';
			html += '</div>';

			// Display ingredients if available
			if (recipe.ingredients && recipe.ingredients.length > 0) {
				html += '<div class="bc-recipe-ingredients">';
				html += '<h5>Ingredients</h5>';
				html += '<table class="widefat">';
				html += '<thead><tr>';
				html += '<th>Ingredient</th>';
				html += '<th>Quantity</th>';
				html += '<th>Unit Cost</th>';
				html += '<th>Total</th>';
				html += '</tr></thead>';
				html += '<tbody>';

				recipe.ingredients.forEach(function(ingredient) {
					if (ingredient && ingredient.name) {
						const ingredientCost = ingredient.cost || 0;
						const recipeAmount = parseFloat(ingredient.recipeAmount) || 0;
						const savedPrice = parseFloat(ingredient.savedPrice) || 0;
						const savedQuantity = parseFloat(ingredient.savedQuantity) || 0;

						// Calculate unit cost (price per unit from package)
						const unitCost = savedQuantity > 0 ? savedPrice / savedQuantity : 0;

						html += '<tr>';
						html += '<td>' + escapeHtml(ingredient.name) + '</td>';
						html += '<td>' + recipeAmount.toFixed(2) + '</td>';
						html += '<td>$' + formatCurrency(unitCost) + '</td>';
						html += '<td>$' + formatCurrency(ingredientCost) + '</td>';
						html += '</tr>';
					}
				});

				html += '</tbody></table>';
				html += '</div>';
			}

			html += '<button type="button" class="button bc-close-details" style="margin-top: 10px;">Close Details</button>';
			html += '</div>';

			$selectedRecipe.find('.bc-recipe-details').html(html);
			$selectedRecipe.show();

			// Scroll to the details section
			$('html, body').animate({
				scrollTop: $selectedRecipe.offset().top - 100
			}, 500);

			// Close button handler
			$selectedRecipe.find('.bc-close-details').on('click', function() {
				$selectedRecipe.hide();
			});
		}

		/**
		 * Format currency value
		 *
		 * @param {number} value The value to format
		 * @return {string} Formatted currency string
		 */
		function formatCurrency(value) {
			return parseFloat(value || 0).toFixed(2);
		}

		/**
		 * Escape HTML to prevent XSS
		 *
		 * @param {string} text The text to escape
		 * @return {string} Escaped text
		 */
		function escapeHtml(text) {
			const map = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#039;'
			};
			return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
		}
	}

	// Initialize on document ready
	$(document).ready(function() {
		// Only initialize if we're on the product edit page with the recipe metabox
		if ($('#bc_recipe_metabox').length > 0) {
			initRecipeSearch();
		}
	});

})(jQuery);
