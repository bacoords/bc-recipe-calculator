import { useState, useEffect, useCallback, useMemo } from "@wordpress/element";
import { VIEWS, URL_PARAMS } from "../constants/navigation";

/**
 * Custom hook for managing navigation state and URL synchronization
 * Inspired by the useTabNavigation function from block-visibility plugin
 */
export function useNavigation() {
  // Navigation state
  const [currentView, setCurrentView] = useState(VIEWS.RECIPES);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingTermId, setEditingTermId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Parse URL parameters and update state
  const parseUrlParams = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get(URL_PARAMS.EDIT);
    const termId = urlParams.get(URL_PARAMS.EDIT_INGREDIENT);
    const view = urlParams.get(URL_PARAMS.VIEW);

    if (postId) {
      setEditingPostId(parseInt(postId));
      setCurrentView(VIEWS.RECIPES);
      setEditingTermId(null);
    } else if (termId) {
      setEditingTermId(parseInt(termId));
      setCurrentView(VIEWS.INGREDIENTS);
      setEditingPostId(null);
    } else if (view && Object.values(VIEWS).includes(view)) {
      setCurrentView(view);
      setEditingPostId(null);
      setEditingTermId(null);
    } else {
      setCurrentView(VIEWS.RECIPES);
      setEditingPostId(null);
      setEditingTermId(null);
    }
  }, []);

  // Initialize from URL parameters on load
  useEffect(() => {
    parseUrlParams();
    setIsInitialized(true);
  }, [parseUrlParams]);

  // Listen for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      parseUrlParams();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [parseUrlParams]);

  // Navigation methods
  const navigateToEdit = useCallback((postId) => {
    const url = new URL(window.location);
    url.searchParams.set(URL_PARAMS.EDIT, postId);
    url.searchParams.delete(URL_PARAMS.VIEW);
    window.history.pushState({}, "", url);
    setEditingPostId(postId);
    setCurrentView(VIEWS.RECIPES);
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

  const handleTabSelect = useCallback(
    (tabName) => {
      // Don't handle tab selection during initial load
      if (!isInitialized) {
        return;
      }

      // Only navigate if the tab is actually changing and we're not in an editing state
      if (tabName !== currentView && !editingPostId && !editingTermId) {
        setCurrentView(tabName);
        if (tabName === VIEWS.SHOPPING) {
          navigateToShoppingList();
        } else if (tabName === VIEWS.INGREDIENTS) {
          navigateToIngredientsList();
        } else {
          navigateToList();
        }
      } else if (tabName !== currentView) {
        // If we're in an editing state, just update the current view without navigating
        setCurrentView(tabName);
      }
    },
    [
      isInitialized,
      currentView,
      editingPostId,
      editingTermId,
      navigateToShoppingList,
      navigateToIngredientsList,
      navigateToList,
    ]
  );

  // Return navigation state and methods
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
