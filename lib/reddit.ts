import { subredditService } from './services/supabase/subreddits';
import { postService } from './services/supabase/posts';
import { RedditPost } from './types/reddit';
import snoowrap from 'snoowrap';
import { validateEnv } from './config/env';

// Create a singleton instance of the Reddit client
let redditClient: snoowrap | null = null;

function getRedditClient(): snoowrap {
  if (redditClient) {
    return redditClient;
  }

  try {
    const env = validateEnv();
    
    console.log('Creating Reddit client with config:', {
      hasUserAgent: !!env.REDDIT_USER_AGENT,
      hasClientId: !!env.REDDIT_CLIENT_ID,
      hasClientSecret: !!env.REDDIT_CLIENT_SECRET,
      hasUsername: !!env.REDDIT_USERNAME,
      hasPassword: !!env.REDDIT_PASSWORD,
      userAgent: env.REDDIT_USER_AGENT
    });
    
    redditClient = new snoowrap({
      userAgent: env.REDDIT_USER_AGENT,
      clientId: env.REDDIT_CLIENT_ID,
      clientSecret: env.REDDIT_CLIENT_SECRET,
      username: env.REDDIT_USERNAME,
      password: env.REDDIT_PASSWORD
    });

    // Configure snoowrap
    redditClient.config({
      requestDelay: 1000,
      warnings: true,
      continueAfterRatelimitError: true,
      retryErrorCodes: [502, 503, 504, 522],
      maxRetryAttempts: 3
    });

    return redditClient;
  } catch (error) {
    console.error('Failed to create Reddit client:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error,
      details: error
    });
    throw error;
  }
}

interface SubredditInfo {
  display_name: string;
  title: string;
  subscribers: number;
}

async function getSubredditPosts(subredditName: string, limit: number): Promise<snoowrap.Submission[]> {
  try {
    console.log(`Fetching ${limit} posts from r/${subredditName}...`);
    const reddit = getRedditClient();

    // Add delay between requests to avoid rate limiting  
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get subreddit instance and fetch info
    const subreddit = reddit.getSubreddit(subredditName);
    
    // Validate subreddit exists
    try {
      const subredditInfo = await (subreddit as any).fetch() as SubredditInfo;
      console.log('Subreddit info:', {
        name: subredditInfo.display_name,
        title: subredditInfo.title,
        subscribers: subredditInfo.subscribers
      });

      const posts = await (subreddit as any).getNew({ limit }) as snoowrap.Submission[];
      console.log(`Successfully fetched ${posts.length} posts from r/${subredditName}`);
      return posts;
    } catch (error) {
      console.error(`Subreddit r/${subredditName} not found or inaccessible:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      });
      throw new Error(`Subreddit r/${subredditName} not found or inaccessible`);
    }
  } catch (error) {
    console.error(`Failed to fetch posts from r/${subredditName}:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error,
      details: error
    });
    throw error;
  }
}

export async function fetchRecentPosts(subredditName: string): Promise<RedditPost[]> {
  try {
    // Check if we have fresh data in Supabase
    const { exists, needsUpdate, subredditId } = await subredditService.checkSubredditFreshness(subredditName);
    
    if (exists && !needsUpdate && subredditId) {
      console.log('Using cached data for:', subredditName);
      return await postService.getSubredditPosts(subredditId);
    }

    // If we need to fetch new data
    console.log('Fetching fresh data for:', subredditName);

    // Get posts from the last 24 hours
    const now = Math.floor(Date.now() / 1000);
    const yesterday = now - (24 * 60 * 60);

    console.log('Time range:', {
      now: new Date(now * 1000).toISOString(),
      yesterday: new Date(yesterday * 1000).toISOString()
    });

    try {
      const posts = await getSubredditPosts(subredditName, 100);

      const filteredPosts = posts
        .filter(post => post.created_utc >= yesterday)
        .map(post => ({
          url: post.url,
          title: post.title,
          content: post.selftext || '',
          author: post.author?.name || '[deleted]',
          subreddit: post.subreddit?.display_name || subredditName,
          score: post.score || 0,
          numComments: post.num_comments || 0,
          created_utc: post.created_utc
        }));

      // Store in Supabase
      const newSubredditId = await subredditService.upsertSubreddit(
        subredditName,
        subredditName // Using name as display_name for now
      );

      await postService.insertPosts(newSubredditId, filteredPosts);
      await subredditService.updateLastFetched(newSubredditId);

      return filteredPosts;
    } catch (redditError) {
      console.error('Reddit API error:', {
        error: redditError instanceof Error ? redditError.message : 'Unknown Reddit API error',
        stack: redditError instanceof Error ? redditError.stack : undefined,
        type: redditError instanceof Error ? redditError.constructor.name : typeof redditError,
        details: redditError
      });
      throw redditError;
    }
  } catch (error) {
    console.error('Error fetching Reddit posts:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error,
      details: error
    });
    throw error;
  }
} 