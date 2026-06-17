import { z } from "zod";

export const RecipeIngredientSchema = z
  .object({
    name: z.string({ error: "Ingredient name is required" }).min(1, "Ingredient name cannot be empty"),
    amount: z.string({ error: "Ingredient amount is required" }),
    unit: z.string({ error: "Ingredient unit is required" }),
  })
  .strict();

export const RecipeSchema = z
  .object({
    title: z.string({ error: "Title is required" }).min(1, "Title cannot be empty"),
    description: z.string({ error: "Description is required" }),
    prepTime: z.number({ error: "Prep time is required" }).nonnegative("Prep time must be at least 0"),
    cookTime: z.number({ error: "Cook time is required" }).nonnegative("Cook time must be at least 0"),
    servings: z.number({ error: "Servings is required" }).positive("Servings must be greater than 0"),
    calories: z.number().nullable(),
    cuisine: z.string().nullable(),
    dietaryTags: z.array(z.string()).nullable(),
    ingredients: z.array(RecipeIngredientSchema, { error: "Ingredients array is required" }),
    steps: z.array(z.string(), { error: "Steps array is required" }),
    imagePrompt: z.string({ error: "Image prompt is required" }).min(1, "Image prompt cannot be empty"),
  })
  .strict();

export type RecipeInput = z.infer<typeof RecipeSchema>;
export type RecipeIngredientInput = z.infer<typeof RecipeIngredientSchema>;
