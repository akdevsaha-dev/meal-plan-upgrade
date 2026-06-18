"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
});

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
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usageData, setUsageData] = useState<any>(null);

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

    if (token) {
      fetch("/api/usage", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data && !data.error) {
            setUsageData(data);
          }
        })
        .catch((err) => console.error("Failed to load usage data:", err));
    }
  }, []);

  function handleSaveRecipe() {
    setIsModalOpen(true);
  }

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

  const hasHitRecipeLimit = usageData ? (
    usageData.usage.recipesToday >= usageData.limits.recipesPerDay ||
    usageData.usage.recipesMonth >= usageData.limits.recipesPerMonth
  ) : false;

  return (
    <div className={`${montserrat.variable} font-sans min-h-screen bg-[#FAF9F6] text-[#111111]`}>
      <div className="mx-auto max-w-7xl px-6 sm:px-12 md:px-16 lg:px-24 pt-4 lg:pt-6 pb-12 lg:pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-900/10 pb-4 mb-5 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-[0.25em] uppercase text-neutral-900">
              RECIPES
            </h1>
            <p className="text-[10px] font-bold text-neutral-400 tracking-[0.2em] uppercase mt-2">
              Curated Culinary Archives
            </p>
          </div>
          <button
            onClick={handleSaveRecipe}
            className="rounded-none bg-neutral-900 hover:bg-neutral-800 text-[#FAF9F6] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer self-start sm:self-center border border-neutral-900"
          >
            {hasHitRecipeLimit ? "LIMIT REACHED" : "+ SAVE RECIPE"}
          </button>
        </div>

        <div className="mb-6 max-w-xs">
          <div className="relative flex items-center border-b border-neutral-400/80 bg-transparent py-1">
            <input
              type="text"
              placeholder="SEARCH RECIPES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-1.5 bg-transparent text-xs font-medium uppercase tracking-[0.2em] placeholder-neutral-300 text-neutral-900 focus:outline-none rounded-none border-none pl-0 pr-12"
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-0 p-1 text-[9px] font-extrabold tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors focus:outline-none cursor-pointer uppercase"
                aria-label="Clear search"
              >
                CLEAR
              </button>
            )}
          </div>

          {searchQuery && (
            <p className="text-[10px] text-neutral-400 uppercase tracking-[0.15em] mt-2 font-semibold animate-in fade-in slide-in-from-top-1 duration-150">
              {filteredRecipes.length === 0 ? (
                <span>NO RESULTS MATCHING &ldquo;<span className="text-neutral-900">{searchQuery}</span>&rdquo;</span>
              ) : (
                <span>FOUND <span className="text-[#A94420] font-extrabold">{filteredRecipes.length}</span> {filteredRecipes.length === 1 ? 'MATCHING RECIPE' : 'MATCHING RECIPES'}</span>
              )}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-[10px] font-bold text-neutral-400 tracking-[0.2em] uppercase">ACCESSING CATER ARCHIVES...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 bg-white border border-neutral-200 rounded-none text-center max-w-xl mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-none border border-neutral-300 text-neutral-800 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-[0.2em] mb-2">Recipe Catalog is Empty</h2>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm mb-8 font-medium">
              Start building your premium culinary collection to plan customized menus effortlessly.
            </p>
            <Link
              href={hasHitRecipeLimit ? "/settings?tab=billing" : "/chat"}
              className={`px-8 py-3.5 rounded-none text-[10px] font-bold tracking-[0.2em] uppercase transition-all text-center border ${
                hasHitRecipeLimit 
                  ? "bg-rose-600 hover:bg-rose-700 text-white border-rose-600 shadow-xs"
                  : "bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-900"
              }`}
            >
              {hasHitRecipeLimit ? "UPGRADE TO CREATE &rarr;" : "CREATE VIA BOT"}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

      {/* Elegant Modal for Save Recipe */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-md bg-[#FAF9F6] border border-neutral-200 p-8 text-center rounded-none shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {hasHitRecipeLimit ? (
              <>
                <div className="mx-auto w-12 h-12 border border-rose-200 bg-rose-50 text-rose-600 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>

                <h3 className="text-sm font-bold text-neutral-950 uppercase tracking-[0.2em] mb-3">
                  Recipe Limit Reached
                </h3>

                <p className="text-xs text-neutral-400 leading-relaxed mb-8 font-medium uppercase tracking-wider">
                  You have reached your recipe generation limit. Upgrade to Pro to unlock unlimited recipe creation.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="order-2 sm:order-1 px-6 py-3 border border-neutral-300 hover:bg-neutral-100/50 text-neutral-600 text-[10px] font-bold tracking-[0.2em] uppercase rounded-none transition-colors cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <Link
                    href="/settings?tab=billing"
                    className="order-1 sm:order-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-none text-[10px] font-bold tracking-[0.2em] uppercase transition-all text-center flex items-center justify-center gap-1.5 border border-rose-600 shadow-xs"
                  >
                    UPGRADE TO PRO &rarr;
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto w-12 h-12 border border-neutral-300 text-neutral-800 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                  </svg>
                </div>

                <h3 className="text-sm font-bold text-neutral-950 uppercase tracking-[0.2em] mb-3">
                  Create a New Recipe
                </h3>

                <p className="text-xs text-neutral-400 leading-relaxed mb-8 font-medium">
                  To curate or compose a custom recipe, initiate a dialogue with <span className="font-bold text-neutral-800">Chef Ferraro</span>. Direct the chef with your ingredients or scaling demands.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="order-2 sm:order-1 px-6 py-3 border border-neutral-300 hover:bg-neutral-100/50 text-neutral-600 text-[10px] font-bold tracking-[0.2em] uppercase rounded-none transition-colors cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <Link
                    href="/chat"
                    className="order-1 sm:order-2 bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 rounded-none text-[10px] font-bold tracking-[0.2em] uppercase transition-all text-center flex items-center justify-center gap-1.5 border border-neutral-900"
                  >
                    GO TO CHEF FERRARO &rarr;
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
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
  return (
    <div className="bg-white border border-neutral-200/60 rounded-none flex flex-col h-full hover:border-neutral-900 transition-all duration-300 group shadow-xs">
      <div className="relative aspect-16/10 overflow-hidden rounded-none border-b border-neutral-100">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-full object-cover rounded-none group-hover:scale-102 transition-transform duration-500 ease-out"
        />
      </div>
      <div className="p-6 flex flex-col grow text-left">

        {/* Category & Tags */}
        <div className="text-[9px] font-bold text-[#A94420] tracking-[0.25em] uppercase mb-2">
          {recipe.cuisine ? `${recipe.cuisine} ` : ""}
          {recipe.dietaryTags ? `• ${recipe.dietaryTags.split(",")[0].trim()}` : ""}
        </div>

        <Link href={`/recipes/${recipe.id}`}>
          <h3 className="text-sm font-bold text-neutral-900 hover:text-neutral-500 tracking-wider transition-colors mb-2 uppercase line-clamp-1">
            {recipe.title}
          </h3>
        </Link>

        <p className="text-xs text-neutral-500 leading-relaxed font-light mb-6 line-clamp-2 grow">
          {recipe.description}
        </p>

        {/* Specs bar */}
        <div className="flex items-center gap-2 text-[8.5px] font-semibold tracking-[0.12em] text-neutral-400 uppercase border-t border-neutral-100 pt-4 mb-5">
          <span>PREP: {recipe.prepTime}M</span>
          <span className="text-neutral-200">|</span>
          <span>COOK: {recipe.cookTime}M</span>
          <span className="text-neutral-200">|</span>
          <span>{recipe.servings} SERVINGS</span>
          {recipe.calories && (
            <>
              <span className="text-neutral-200">|</span>
              <span className="text-[#A94420] font-bold">{recipe.calories} KCAL</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/recipes/${recipe.id}`}
            className="flex-1 text-center bg-neutral-950 hover:bg-neutral-800 text-white py-3 text-[9px] font-bold tracking-[0.2em] uppercase rounded-none transition-colors duration-200 border border-neutral-950"
          >
            VIEW DETAILS
          </Link>
          <button
            onClick={() => onDelete(recipe.id)}
            className="bg-transparent hover:bg-rose-50 hover:text-rose-700 text-neutral-400 hover:border-rose-200 border border-neutral-200/80 rounded-none px-4 py-3 text-[9px] font-bold tracking-[0.2em] uppercase transition-all duration-200 cursor-pointer"
          >
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
}
