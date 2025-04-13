import { RedditPost } from './types/reddit';
import { ThemeAnalysis, ThemeAnalysisResult, defaultThemeCategories } from './config/themes';
import { themeService } from './services/supabase/themes';
import { postService } from './services/supabase/posts';
import OpenAI from 'openai';
import { validateEnv } from './config/env';

function getOpenAIClient() {
  validateEnv();
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function analyzePost(post: RedditPost): Promise<ThemeAnalysis> {
  try {
    // Check if we already have analysis in Supabase
    const redditId = post.url.split('/').pop() || '';
    const existingPost = await postService.getPostByRedditId(redditId);
    if (existingPost?.id) {
      const existingAnalysis = await themeService.getAnalysis(existingPost.id);
      if (existingAnalysis) {
        return existingAnalysis;
      }
    }

    const openai = getOpenAIClient();
    
    // Use default categories instead of fetching from Supabase
    const categories = defaultThemeCategories;
    
    // Create a mapping of category keys to use in the prompt
    const categoryKeys = categories.map(cat => ({
      name: cat.name,
      key: cat.id,  // Use the predefined ID instead of generating one
      description: cat.description
    }));
    
    const prompt = `Analyze this Reddit post and categorize it into ONLY the following categories. For each category listed below, return true if the post belongs to that category, false otherwise. DO NOT add any other categories.

Post Title: ${post.title}
Post Content: ${post.content}

Available Categories (ONLY use these categories, no others):
${categoryKeys.map(cat => `- ${cat.name}: ${cat.description}`).join('\n')}

You must return a JSON object with EXACTLY these fields and no others:
{
  "explanation": "A brief explanation of why the post belongs to the selected categories",
  ${categoryKeys.map(cat => `"${cat.key}": boolean`).join(',\n  ')}
}

Important:
- Only use the categories listed above
- Do not add any other categories
- Return true/false values for EXACTLY the categories listed above
- A post can belong to multiple categories`;

    console.log('Analyzing post:', { title: post.title, contentLength: post.content.length });

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o-mini-2024-07-18',
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    console.log('OpenAI response:', content);

    const rawResponse = JSON.parse(content);
    
    // Validate that the response only contains our expected categories
    const expectedKeys = new Set(['explanation', ...categoryKeys.map(cat => cat.key)]);
    const actualKeys = Object.keys(rawResponse);
    const unexpectedKeys = actualKeys.filter(key => !expectedKeys.has(key));
    
    if (unexpectedKeys.length > 0) {
      console.warn('Unexpected categories in response:', unexpectedKeys);
      // Remove unexpected categories
      unexpectedKeys.forEach(key => delete rawResponse[key]);
    }
    
    // Ensure all expected categories are present
    categoryKeys.forEach(cat => {
      if (!(cat.key in rawResponse)) {
        rawResponse[cat.key] = false;
      }
    });
    
    // Store analysis in Supabase if we have the post ID
    if (existingPost?.id) {
      await themeService.storeAnalysis(existingPost.id, rawResponse);
    }

    return rawResponse;
  } catch (err) {
    console.error('Failed to analyze post:', err);
    throw new Error(`Failed to analyze post: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

export async function analyzeThemes(posts: RedditPost[]): Promise<ThemeAnalysisResult> {
  try {
    console.log('Starting theme analysis for', posts.length, 'posts');
    
    // Use default categories instead of fetching from Supabase
    const categories = defaultThemeCategories;
    
    // Analyze all posts concurrently
    const analyses = await Promise.all(posts.map(post => analyzePost(post)));
    
    // Group posts by category
    const postAnalyses = new Map<string, ThemeAnalysis>();
    posts.forEach((post, index) => {
      postAnalyses.set(post.url, analyses[index]);
    });

    // Update category counts and posts
    const categoriesWithPosts = categories.map(category => {
      const categoryKey = category.id;  // Use the predefined ID
      console.log('Checking category:', { name: category.name, key: categoryKey });
      
      const categoryPosts = posts.filter((post, index) => {
        const analysis = analyses[index];
        const belongs = analysis[categoryKey] === true;
        console.log('Post analysis:', {
          title: post.title,
          categoryKey,
          belongs,
          analysis
        });
        return belongs;
      });

      return {
        ...category,
        count: categoryPosts.length,
        posts: categoryPosts
      };
    });

    const result = {
      categories: categoriesWithPosts,
      postAnalyses
    };

    return result;
  } catch (err) {
    console.error('Theme analysis failed:', err);
    throw new Error(`Theme analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
} 