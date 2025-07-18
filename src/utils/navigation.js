import { VIEWS, URL_PARAMS } from "../constants/navigation";

/**
 * Utility functions for navigation testing and debugging
 */

/**
 * Parse URL parameters and return the expected navigation state
 * This can be used for testing URL parameter handling
 */
export function parseUrlParamsForTesting(url) {
  const urlParams = new URLSearchParams(url);
  const postId = urlParams.get(URL_PARAMS.EDIT);
  const termId = urlParams.get(URL_PARAMS.EDIT_INGREDIENT);
  const view = urlParams.get(URL_PARAMS.VIEW);

  if (postId) {
    return {
      currentView: VIEWS.RECIPES,
      editingPostId: parseInt(postId),
      editingTermId: null,
    };
  } else if (termId) {
    return {
      currentView: VIEWS.INGREDIENTS,
      editingPostId: null,
      editingTermId: parseInt(termId),
    };
  } else if (view && Object.values(VIEWS).includes(view)) {
    return {
      currentView: view,
      editingPostId: null,
      editingTermId: null,
    };
  } else {
    return {
      currentView: VIEWS.RECIPES,
      editingPostId: null,
      editingTermId: null,
    };
  }
}

/**
 * Generate URL for a given navigation state
 */
export function generateUrl(state) {
  const url = new URL(window.location);

  // Clear all navigation parameters
  url.searchParams.delete(URL_PARAMS.EDIT);
  url.searchParams.delete(URL_PARAMS.EDIT_INGREDIENT);
  url.searchParams.delete(URL_PARAMS.VIEW);

  // Set parameters based on state
  if (state.editingPostId) {
    url.searchParams.set(URL_PARAMS.EDIT, state.editingPostId);
  } else if (state.editingTermId) {
    url.searchParams.set(URL_PARAMS.EDIT_INGREDIENT, state.editingTermId);
    url.searchParams.set(URL_PARAMS.VIEW, state.currentView);
  } else {
    url.searchParams.set(URL_PARAMS.VIEW, state.currentView);
  }

  return url.toString();
}

/**
 * Test cases for URL parameter handling
 */
export const testCases = [
  {
    name: "Default state (no parameters)",
    url: "?",
    expected: {
      currentView: VIEWS.RECIPES,
      editingPostId: null,
      editingTermId: null,
    },
  },
  {
    name: "Recipes list view",
    url: "?view=recipes",
    expected: {
      currentView: VIEWS.RECIPES,
      editingPostId: null,
      editingTermId: null,
    },
  },
  {
    name: "Ingredients list view",
    url: "?view=ingredients",
    expected: {
      currentView: VIEWS.INGREDIENTS,
      editingPostId: null,
      editingTermId: null,
    },
  },
  {
    name: "Shopping list view",
    url: "?view=shopping",
    expected: {
      currentView: VIEWS.SHOPPING,
      editingPostId: null,
      editingTermId: null,
    },
  },
  {
    name: "Editing recipe",
    url: "?edit=123",
    expected: {
      currentView: VIEWS.RECIPES,
      editingPostId: 123,
      editingTermId: null,
    },
  },
  {
    name: "Editing ingredient",
    url: "?edit_ingredient=456&view=ingredients",
    expected: {
      currentView: VIEWS.INGREDIENTS,
      editingPostId: null,
      editingTermId: 456,
    },
  },
];
