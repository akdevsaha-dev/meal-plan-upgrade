import { RecipeInput } from "@/validation/recipeSchema";

/**
 * Sanitizes a validated recipe object to prepare it for secure database writes.
 * Trims all string parameters, filters out empty array items, and handles values safely.
 * 
 * @param recipe - The validated RecipeInput object.
 * @returns A fully sanitized RecipeInput object.
 */
export function sanitizeRecipe(recipe: RecipeInput): RecipeInput {
  return {
    title: recipe.title.trim(),
    description: recipe.description ? recipe.description.trim() : undefined,
    prepTime: Math.max(0, recipe.prepTime),
    cookTime: Math.max(0, recipe.cookTime),
    servings: Math.max(1, recipe.servings),
    calories: recipe.calories !== null ? Math.max(0, recipe.calories) : null,
    cuisine: recipe.cuisine ? recipe.cuisine.trim() : null,
    dietaryTags: recipe.dietaryTags
      ? recipe.dietaryTags
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : null,
    ingredients: recipe.ingredients
      .map((ing) => ({
        name: ing.name.trim(),
        amount: ing.amount.trim(),
        unit: ing.unit.trim(),
      }))
      .filter((ing) => ing.name.length > 0),
    steps: recipe.steps
      .map((step) => step.trim())
      .filter((step) => step.length > 0),
    imagePrompt: recipe.imagePrompt.trim(),
  };
}
