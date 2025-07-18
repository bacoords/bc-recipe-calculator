import { useState, useEffect, useCallback } from "@wordpress/element";
import { VIEWS, URL_PARAMS } from "../constants/navigation";

/**
 * Parse URL parameters and return initial navigation state
 */
function parseUrlState() {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get(URL_PARAMS.EDIT);
  const termId = urlParams.get(URL_PARAMS.EDIT_INGREDIENT);
  const view = urlParams.get(URL_PARAMS.VIEW);

  console.log('parseUrlState:', { postId, termId, view });

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
 * Navigation hook that reads URL on load and provides navigation methods
 */
export function useNavigation() {
  // Initialize state synchronously from URL parameters
  const initialState = parseUrlState();
  const [currentView, setCurrentView] = useState(initialState.currentView);
  const [editingPostId, setEditingPostId] = useState(initialState.editingPostId);
  const [editingTermId, setEditingTermId] = useState(initialState.editingTermId);
  const [isInitialized, setIsInitialized] = useState(false);

  console.log('useNavigation state:', { currentView, editingPostId, editingTermId });

  // Mark as initialized after first render
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Listen for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const newState = parseUrlState();
      console.log("popstate", newState);
      
      setCurrentView(newState.currentView);
      setEditingPostId(newState.editingPostId);
      setEditingTermId(newState.editingTermId);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Navigation methods
  const navigateToEdit = useCallback((postId) => {
    const url = new URL(window.location);
    url.searchParams.set(URL_PARAMS.EDIT, postId);
    url.searchParams.set(URL_PARAMS.VIEW, VIEWS.RECIPES);
    url.searchParams.delete(URL_PARAMS.EDIT_INGREDIENT);
    window.history.pushState({}, "", url);
    setEditingPostId(postId);
    setCurrentView(VIEWS.RECIPES);
    setEditingTermId(null);
  }, []);

  const navigateToList = useCallback(() => {
    const url = new URL(window.location);
    url.searchParams.delete(URL_PARAMS.EDIT);
    url.searchParams.delete(URL_PARAMS.EDIT_INGREDIENT);
    url.searchParams.set(URL_PARAMS.VIEW, VIEWS.RECIPES);
    window.history.pushState({}, "", url);
    setEditingPostId(null);
    setEditingTermId(null);
    setCurrentView(VIEWS.RECIPES);
  }, []);

  const navigateToShoppingList = useCallback(() => {
    const url = new URL(window.location);
    url.searchParams.set(URL_PARAMS.VIEW, VIEWS.SHOPPING);
    url.searchParams.delete(URL_PARAMS.EDIT);
    url.searchParams.delete(URL_PARAMS.EDIT_INGREDIENT);
    window.history.pushState({}, "", url);
    setCurrentView(VIEWS.SHOPPING);
    setEditingPostId(null);
    setEditingTermId(null);
  }, []);

  const navigateToIngredientsList = useCallback(() => {
    const url = new URL(window.location);
    url.searchParams.set(URL_PARAMS.VIEW, VIEWS.INGREDIENTS);
    url.searchParams.delete(URL_PARAMS.EDIT);
    url.searchParams.delete(URL_PARAMS.EDIT_INGREDIENT);
    window.history.pushState({}, "", url);
    setCurrentView(VIEWS.INGREDIENTS);
    setEditingPostId(null);
    setEditingTermId(null);
  }, []);

  const navigateToEditIngredient = useCallback((termId) => {
    const url = new URL(window.location);
    url.searchParams.set(URL_PARAMS.EDIT_INGREDIENT, termId);
    url.searchParams.delete(URL_PARAMS.EDIT);
    url.searchParams.set(URL_PARAMS.VIEW, VIEWS.INGREDIENTS);
    window.history.pushState({}, "", url);
    setEditingTermId(termId);
    setCurrentView(VIEWS.INGREDIENTS);
    setEditingPostId(null);
  }, []);

  // Simple tab selection - only navigate when user actually clicks
  const handleTabSelect = useCallback(
    (tabName) => {
      // Prevent navigation during initialization
      if (!isInitialized) {
        return;
      }
      
      // Only navigate if the tab is actually changing
      if (tabName === currentView) {
        return;
      }
      
      // Update URL to reflect the new tab, but preserve any editing state
      const url = new URL(window.location);
      url.searchParams.set(URL_PARAMS.VIEW, tabName);
      
      // Only clear editing state if switching to a different tab type
      if (tabName === VIEWS.SHOPPING) {
        url.searchParams.delete(URL_PARAMS.EDIT);
        url.searchParams.delete(URL_PARAMS.EDIT_INGREDIENT);
        setEditingPostId(null);
        setEditingTermId(null);
      } else if (tabName === VIEWS.INGREDIENTS) {
        url.searchParams.delete(URL_PARAMS.EDIT);
        setEditingPostId(null);
      } else if (tabName === VIEWS.RECIPES) {
        url.searchParams.delete(URL_PARAMS.EDIT_INGREDIENT);
        setEditingTermId(null);
      }
      
      window.history.pushState({}, "", url);
      setCurrentView(tabName);
    },
    [isInitialized, currentView]
  );

  return {
    currentView,
    editingPostId,
    editingTermId,
    navigateToEdit,
    navigateToList,
    navigateToShoppingList,
    navigateToIngredientsList,
    navigateToEditIngredient,
    handleTabSelect,
    VIEWS,
  };
}
