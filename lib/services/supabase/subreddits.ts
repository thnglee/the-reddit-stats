// lib/services/supabase/subreddits.ts
import { supabase, supabaseAdmin } from './client'

export interface SubredditService {
  // Check if subreddit exists and is fresh (< 24h old data)
  checkSubredditFreshness: (name: string) => Promise<{
    exists: boolean;
    needsUpdate: boolean;
    subredditId?: string;
  }>;
  
  // Create or update subreddit
  upsertSubreddit: (name: string, displayName: string) => Promise<string>;
  
  // Update last fetched timestamp
  updateLastFetched: (subredditId: string) => Promise<void>;
  
  // Get all subreddits
  getAllSubreddits: () => Promise<Array<{
    id: string;
    name: string;
    display_name: string;
    last_fetched_at: string;
  }>>;
}

class SupabaseSubredditService implements SubredditService {
  async checkSubredditFreshness(name: string) {
    const { data: subreddit } = await supabase
      .from('subreddits')
      .select('id, last_fetched_at')
      .eq('name', name)
      .single();

    if (!subreddit) {
      return { exists: false, needsUpdate: true };
    }

    const lastFetched = subreddit.last_fetched_at 
      ? new Date(subreddit.last_fetched_at)
      : null;
    const needsUpdate = !lastFetched || 
      (Date.now() - lastFetched.getTime()) > 24 * 60 * 60 * 1000;

    return {
      exists: true,
      needsUpdate,
      subredditId: subreddit.id
    };
  }

  async upsertSubreddit(name: string, displayName: string) {
    try {
      // First try to get existing subreddit
      const { data: existingSubreddit } = await supabase
        .from('subreddits')
        .select('id')
        .eq('name', name)
        .single();

      if (existingSubreddit) {
        // Update existing subreddit
        const { error: updateError } = await supabaseAdmin
          .from('subreddits')
          .update({ display_name: displayName })
          .eq('id', existingSubreddit.id);

        if (updateError) throw updateError;
        return existingSubreddit.id;
      }

      // Insert new subreddit
      const { data: newSubreddit, error: insertError } = await supabaseAdmin
        .from('subreddits')
        .insert([{ name, display_name: displayName }])
        .select()
        .single();

      if (insertError) throw insertError;
      if (!newSubreddit) throw new Error('Failed to insert subreddit');

      return newSubreddit.id;
    } catch (error) {
      console.error('Error in upsertSubreddit:', error);
      throw error;
    }
  }

  async updateLastFetched(subredditId: string) {
    const { error } = await supabaseAdmin
      .from('subreddits')
      .update({ last_fetched_at: new Date().toISOString() })
      .eq('id', subredditId);

    if (error) throw error;
  }

  async getAllSubreddits() {
    const { data: subreddits, error } = await supabase
      .from('subreddits')
      .select('id, name, display_name, last_fetched_at')
      .order('name');

    if (error) throw error;
    return subreddits;
  }
}

export const subredditService = new SupabaseSubredditService();