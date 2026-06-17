"use client";

import ChefLogo from "@/app/components/ChefLogo";
import { CookingGifBackdrop } from "@/app/components/CookingGifPlaster";
import { useState, useEffect } from "react";

interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  calories: number | null;
  cuisine: string | null;
  dietaryTags: string | null;
  ingredients: { id: string; name: string; amount: string; unit: string }[];
}

export default function RecipesPage() {
  console.log("[CHAOS render] RecipesPage");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoading(true);
    fetch("/api/recipes", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => {
        setRecipes(data.recipes || []);
        setIsLoading(false);
      })
      .catch(() => {
        setRecipes([]);
        setIsLoading(false);
      });
  }, []);

  function handleSaveRecipe() { }

  async function handleDeleteRecipe(id: string) {
    const token = localStorage.getItem("token");
    await fetch(`/api/recipes/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  }

  const filteredRecipes = recipes.filter((recipe) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const matchesTitle = recipe.title.toLowerCase().includes(query);
    const matchesDescription = recipe.description?.toLowerCase().includes(query) || false;
    const matchesCuisine = recipe.cuisine?.toLowerCase().includes(query) || false;
    const matchesTags = recipe.dietaryTags?.toLowerCase().includes(query) || false;
    const matchesIngredients = recipe.ingredients?.some((ing) =>
      ing.name.toLowerCase().includes(query)
    ) || false;

    return matchesTitle || matchesDescription || matchesCuisine || matchesTags || matchesIngredients;
  });

  return (
    <div className="relative min-h-screen font-sans">
      <div className="absolute inset-0 z-0 bg-gray-50" aria-hidden />
      <CookingGifBackdrop position="absolute" stackClass="z-[1]" />
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <ChefLogo size={36} />
            Recipes
          </h1>
          <button
            onClick={handleSaveRecipe}
            className="bg-lime-400 text-black px-6 py-2 text-sm font-bold border-2 border-lime-600 cursor-pointer hover:bg-lime-500 transition-colors"
          >
            + Save Recipe
          </button>
        </div>

        <div className="mb-8 max-w-xl">
          <div className="relative flex items-center group">
            <div className="absolute left-4 text-gray-400 group-focus-within:text-orange-500 transition-colors pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.603 10.603z" />
              </svg>
            </div>

            <input
              type="text"
              placeholder="Search by title, ingredients, cuisine or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-xs text-sm font-medium placeholder-gray-400 text-gray-800 transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 hover:border-gray-300"
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all focus:outline-none cursor-pointer"
                aria-label="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {searchQuery && (
            <p className="text-xs text-gray-500 mt-2.5 font-medium animate-in fade-in slide-in-from-top-1 duration-150">
              {filteredRecipes.length === 0 ? (
                <span>No recipes found matching &ldquo;<span className="font-semibold text-gray-800">{searchQuery}</span>&rdquo;</span>
              ) : (
                <span>Found <span className="font-semibold text-orange-600">{filteredRecipes.length}</span> {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}</span>
              )}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 font-medium">Loading your recipes...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 bg-white border border-dashed border-gray-300 rounded-3xl shadow-sm text-center">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-orange-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Recipe Catalog is Empty</h2>
            <p className="text-gray-500 max-w-md mb-8">
              It looks like you haven't saved any recipes yet. Start building your collection to plan meals effortlessly!
            </p>
            <button
              onClick={() => window.location.href = '/chat'}
              className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-orange-700 hover:shadow-lg transition-all"
            >
              Create via Recipe Bot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onDelete={handleDeleteRecipe}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RecipeCard({
  recipe,
  onDelete,
}: {
  recipe: Recipe;
  onDelete: (id: string) => void;
}) {
  console.log("[CHAOS render] RecipeCard", recipe.id);
  return (
    <div className="bg-white border border-gray-200 overflow-hidden shadow-xs hover:shadow-md hover:translate-y-[-2px] transition-all duration-200 flex flex-col h-full rounded-2xl">
      <img
        src={recipe.imageUrl}
        alt={recipe.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-5 flex flex-col grow">
        <a href={`/recipes/${recipe.id}`}>
          <h3 className="text-lg font-bold text-orange-600 hover:text-orange-700 transition-colors mb-2 line-clamp-1">{recipe.title}</h3>
        </a>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 grow">
          {recipe.description}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-400 mb-4 border-b border-gray-50 pb-3">
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Prep: {recipe.prepTime}m
          </span>
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
            </svg>
            Cook: {recipe.cookTime}m
          </span>
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.079-13.13A10.53 10.53 0 0012 3c1.252 0 2.455.22 3.57.621m-9.74 5.114c0 1.62 1.312 2.933 2.933 2.933 1.621 0 2.933-1.313 2.933-2.933 0-1.62-1.312-2.933-2.933-2.933-1.621 0-2.933 1.313-2.933 2.933zM18 7.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6 7.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
            Serves: {recipe.servings}
          </span>
          {recipe.calories && (
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.982-8.982a9.001 9.001 0 10-14.773-4.43 9.002 9.002 0 0011.536 12.013l-4.932-3.697zm0 0L9 21" />
              </svg>
              {recipe.calories} kcal
            </span>
          )}
        </div>
        {recipe.dietaryTags && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {recipe.dietaryTags.split(",").map((tag) => (
              <span
                key={tag}
                className="bg-orange-50 text-orange-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-orange-100"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2 mt-auto">
          <a
            href={`/recipes/${recipe.id}`}
            className="flex-1 text-center bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            View Details
          </a>
          <button
            onClick={() => onDelete(recipe.id)}
            className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 text-xs font-bold rounded-xl border border-red-200 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

