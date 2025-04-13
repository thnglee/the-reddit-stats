// lib/services/supabase/themes.ts
import { supabase, supabaseAdmin } from './client'
import { ThemeAnalysis, ThemeCategory, getThemeCategories } from '../../config/themes'
import { RedditPost } from '../../types/reddit'

export interface ThemeService {
  // Store theme analysis results
  storeAnalysis: (postId: string, analysis: ThemeAnalysis) => Promise<void>;
  
  // Get theme categories
  getCategories: () => Promise<ThemeCategory[]>;
  
  // Add new theme category
  addCategory: (category: Omit<ThemeCategory, 'id' | 'count' | 'posts'>) => Promise<ThemeCategory>;
  
  // Get themed posts for category
  getCategoryPosts: (categoryId: string) => Promise<RedditPost[]>;

  // Get analysis for a post
  getAnalysis: (postId: string) => Promise<ThemeAnalysis | null>;
}

class SupabaseThemeService implements ThemeService {
  private async ensureDefaultCategories() {
    const { data: existingCategories } = await supabase
      .from('theme_categories')
      .select('name');

    const existingNames = new Set(existingCategories?.map(c => c.name) || []);
    const defaultCategories = getThemeCategories();

    for (const category of defaultCategories) {
      if (!existingNames.has(category.name)) {
        await this.addCategory({
          name: category.name,
          description: category.description,
          prompt: category.prompt
        });
      }
    }
  }

  async storeAnalysis(postId: string, analysis: ThemeAnalysis) {
    // Store raw analysis
    const { error: analysisError } = await supabaseAdmin
      .from('theme_analysis_results')
      .upsert({
        post_id: postId,
        raw_analysis: analysis
      });

    if (analysisError) throw analysisError;

    // Ensure default categories exist
    await this.ensureDefaultCategories();

    // Get all categories
    const { data: categories } = await supabase
      .from('theme_categories')
      .select('id, name');

    if (!categories) return;

    // Create post-theme relationships
    const postThemes = categories
      .filter(category => {
        const categoryKey = category.name.toLowerCase().replace(/[&\s]+/g, '_');
        return analysis[categoryKey] === true;
      })
      .map(category => ({
        post_id: postId,
        category_id: category.id,
        analysis_explanation: analysis.explanation
      }));

    if (postThemes.length > 0) {
      const { error: themesError } = await supabaseAdmin
        .from('post_themes')
        .upsert(postThemes);

      if (themesError) throw themesError;
    }
  }

  async getCategories() {
    const { data: categories, error } = await supabase
      .from('theme_categories')
      .select('*');

    if (error) throw error;

    // Get post counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async category => {
        const { count } = await supabase
          .from('post_themes')
          .select('*', { count: 'exact' })
          .eq('category_id', category.id);

        return {
          id: category.id,
          name: category.name,
          description: category.description,
          prompt: category.prompt,
          count: count || 0,
          posts: [] // Will be filled when needed
        };
      })
    );

    return categoriesWithCounts;
  }

  async addCategory(category: Omit<ThemeCategory, 'id' | 'count' | 'posts'>) {
    const { data: newCategory, error } = await supabaseAdmin
      .from('theme_categories')
      .insert({
        name: category.name,
        description: category.description,
        prompt: category.prompt
      })
      .select()
      .single();

    if (error) throw error;
    if (!newCategory) throw new Error('Failed to create category');

    return {
      ...newCategory,
      count: 0,
      posts: []
    };
  }

  async getCategoryPosts(categoryId: string) {
    interface PostThemeRow {
      post_id: string;
      posts: {
        url: string;
        title: string;
        content: string;
        author: string;
        score: number;
        num_comments: number;
        created_utc: string;
      };
    }

    const { data: postThemes, error } = await supabase
      .from('post_themes')
      .select(`
        post_id,
        posts:post_id (
          url,
          title,
          content,
          author,
          score,
          num_comments,
          created_utc
        )
      `)
      .eq('category_id', categoryId)
      .returns<PostThemeRow[]>();

    if (error) throw error;

    return (postThemes || []).map(theme => ({
      url: theme.posts.url,
      title: theme.posts.title,
      content: theme.posts.content,
      author: theme.posts.author,
      subreddit: '', // Will be filled by the caller
      score: theme.posts.score,
      numComments: theme.posts.num_comments,
      created_utc: new Date(theme.posts.created_utc).getTime() / 1000
    }));
  }

  async getAnalysis(postId: string): Promise<ThemeAnalysis | null> {
    const { data, error } = await supabase
      .from('theme_analysis_results')
      .select('raw_analysis')
      .eq('post_id', postId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data?.raw_analysis as ThemeAnalysis;
  }
}

export const themeService = new SupabaseThemeService();