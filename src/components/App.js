import { TabPanel } from "@wordpress/components";
import { useNavigation } from "../hooks/useNavigation";
import RecipesView from "./views/RecipesView";
import IngredientsView from "./views/IngredientsView";
import PackagingView from "./views/PackagingView";
import ShoppingListView from "./views/ShoppingListView";

function App() {
  const {
    currentView,
    editingPostId,
    editingTermId,
    editingPackagingId,
    navigateToEdit,
    navigateToList,
    navigateToIngredientsList,
    navigateToEditIngredient,
    navigateToPackagingList,
    navigateToEditPackaging,
    handleTabSelect,
    VIEWS,
  } = useNavigation();

  const handleRecipeCreated = (newRecipe) => {
    navigateToEdit(newRecipe.id);
  };

  const tabs = [
    {
      name: VIEWS.RECIPES,
      title: "Recipes",
      content: (
        <RecipesView
          editingPostId={editingPostId}
          navigateToEdit={navigateToEdit}
          navigateToList={navigateToList}
          onRecipeCreated={handleRecipeCreated}
        />
      ),
    },
    {
      name: VIEWS.INGREDIENTS,
      title: "Ingredients",
      content: (
        <IngredientsView
          editingTermId={editingTermId}
          navigateToEditIngredient={navigateToEditIngredient}
          navigateToIngredientsList={navigateToIngredientsList}
        />
      ),
    },
    {
      name: VIEWS.PACKAGING,
      title: "Packaging",
      content: (
        <PackagingView
          editingTermId={editingPackagingId}
          navigateToEditPackaging={navigateToEditPackaging}
          navigateToPackagingList={navigateToPackagingList}
        />
      ),
    },
    {
      name: VIEWS.SHOPPING,
      title: "Shopping List",
      content: <ShoppingListView />,
    },
  ];

  return (
    <div>
      <TabPanel
        tabs={tabs}
        initialTabName={currentView}
        onSelect={handleTabSelect}
      >
        {({ content }) => <div>{content}</div>}
      </TabPanel>
    </div>
  );
}

export default App;
