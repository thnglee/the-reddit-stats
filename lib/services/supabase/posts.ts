// lib/services/supabase/posts.ts
import { supabase, supabaseAdmin } from './client'
import { RedditPost } from '../../types/reddit'

export interface PostService {
  // Batch insert posts
  insertPosts: (subredditId: string, posts: RedditPost[]) => Promise<void>;
  
  // Get cached posts for subreddit
  getSubredditPosts: (subredditId: string) => Promise<RedditPost[]>;
  
  // Get post by Reddit ID
  getPostByRedditId: (redditId: string) => Promise<RedditPost | null>;
  
  // Update post scores and comments
  updatePostMetrics: (redditId: string, score: number, numComments: number) => Promise<void>;
}

class SupabasePostService implements PostService {
  async insertPosts(subredditId: string, posts: RedditPost[]) {
    try {
      // Deduplicate posts by reddit_id
      const uniquePosts = Array.from(
        new Map(posts.map(post => [post.url.split('/').pop(), post])).values()
      );

      console.log(`Deduplicating posts: ${posts.length} -> ${uniquePosts.length}`);

      const postsToInsert = uniquePosts.map(post => {
        const redditId = post.url.split('/').pop() || '';
        return {
          id: crypto.randomUUID(), // Generate UUID for each post
          subreddit_id: subredditId,
          reddit_id: redditId,
          title: post.title,
          content: post.content,
          author: post.author,
          url: post.url,
          score: post.score,
          num_comments: post.numComments,
          created_utc: new Date(post.created_utc * 1000).toISOString()
        };
      });

      // Insert posts in smaller batches to avoid issues
      const batchSize = 10;
      for (let i = 0; i < postsToInsert.length; i += batchSize) {
        const batch = postsToInsert.slice(i, i + batchSize);
        console.log(`Inserting batch ${i / batchSize + 1} of ${Math.ceil(postsToInsert.length / batchSize)}`);
        
        const { error } = await supabaseAdmin
          .from('posts')
          .upsert(batch, { 
            onConflict: 'reddit_id',
            ignoreDuplicates: false // Update existing posts
          });

        if (error) {
          console.error('Error inserting posts batch:', {
            error,
            subredditId,
            batchNumber: i / batchSize + 1,
            batchSize,
            postCount: batch.length
          });
          throw error;
        }
      }

      console.log(`Successfully inserted ${uniquePosts.length} posts`);
    } catch (error) {
      console.error('Error in insertPosts:', error);
      throw error;
    }
  }

  async getSubredditPosts(subredditId: string) {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('subreddit_id', subredditId)
      .order('score', { ascending: false });

    if (error) throw error;
    
    return posts.map(post => ({
      id: post.id,
      url: post.url,
      title: post.title,
      content: post.content,
      author: post.author,
      subreddit: '', // Will be filled by the caller
      score: post.score,
      numComments: post.num_comments,
      created_utc: new Date(post.created_utc).getTime() / 1000
    }));
  }

  async getPostByRedditId(redditId: string) {
    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('reddit_id', redditId)
      .single();

    if (error) return null;
    if (!post) return null;

    return {
      id: post.id,
      url: post.url,
      title: post.title,
      content: post.content,
      author: post.author,
      subreddit: '', // Will be filled by the caller
      score: post.score,
      numComments: post.num_comments,
      created_utc: new Date(post.created_utc).getTime() / 1000
    };
  }

  async updatePostMetrics(redditId: string, score: number, numComments: number) {
    const { error } = await supabaseAdmin
      .from('posts')
      .update({ 
        score,
        num_comments: numComments,
        updated_at: new Date().toISOString()
      })
      .eq('reddit_id', redditId);

    if (error) throw error;
  }
}

export const postService = new SupabasePostService();