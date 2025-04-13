import { z } from 'zod';

// Theme category schema
export const ThemeCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  prompt: z.string(),
  count: z.number().default(0),
  posts: z.array(z.any()).default([]),
});

export type ThemeCategory = z.infer<typeof ThemeCategorySchema>;

// Theme analysis schema
export const ThemeAnalysisSchema = z.object({
  explanation: z.string(),
}).passthrough();  // Allow additional properties while ensuring explanation is a string

export type ThemeAnalysis = z.infer<typeof ThemeAnalysisSchema>;

// Theme analysis result schema
export const ThemeAnalysisResultSchema = z.object({
  categories: z.array(ThemeCategorySchema),
  postAnalyses: z.map(z.string(), ThemeAnalysisSchema),
});

export type ThemeAnalysisResult = z.infer<typeof ThemeAnalysisResultSchema>;

// Default theme categories
export const defaultThemeCategories: ThemeCategory[] = [
  {
    id: 'solution-request',
    name: 'Solution Request',
    description: 'Posts where users are looking for specific solutions to their problems',
    prompt: 'User is looking for a specific solution to their problem',
    count: 0,
    posts: [],
  },
  {
    id: 'pain-anger',
    name: 'Pain & Anger',
    description: 'Posts expressing frustration, anger, or emotional distress',
    prompt: 'User is expressing frustration, anger, or emotional distress',
    count: 0,
    posts: [],
  },
  {
    id: 'advice-request',
    name: 'Advice Request',
    description: 'Posts seeking general advice or guidance',
    prompt: 'User is seeking general advice or guidance',
    count: 0,
    posts: [],
  },
  {
    id: 'money-talk',
    name: 'Money Talk',
    description: 'Posts discussing financial aspects or compensation',
    prompt: 'User is discussing financial aspects or compensation',
    count: 0,
    posts: [],
  },
];

// Function to add a new theme category
export function addThemeCategory(category: Omit<ThemeCategory, 'count' | 'posts'>): ThemeCategory {
  const newCategory = ThemeCategorySchema.parse({
    ...category,
    count: 0,
    posts: [],
  });
  defaultThemeCategories.push(newCategory);
  return newCategory;
}

// Function to get all theme categories
export function getThemeCategories(): ThemeCategory[] {
  return defaultThemeCategories;
}

// Function to validate theme analysis result
export function validateThemeAnalysisResult(result: unknown): ThemeAnalysisResult {
  return ThemeAnalysisResultSchema.parse(result);
} 