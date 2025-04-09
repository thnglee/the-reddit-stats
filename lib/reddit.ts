import snoowrap from 'snoowrap';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export interface RedditPost {
  title: string;
  content: string;
  score: number;
  url: string;
  createdAt: Date;
  numComments: number;
}

export async function fetchRecentPosts(subredditName: string): Promise<RedditPost[]> {
  try {
    console.log('Fetching posts for subreddit:', subredditName);
    const response = await fetch(`/api/reddit/posts?subreddit=${subredditName}`);
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Server response error:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      throw new Error(data.error || `Failed to fetch posts: ${response.status} ${response.statusText}`);
    }
    
    console.log('Received posts:', data.length);
    return data.map((post: any) => ({
      ...post,
      createdAt: new Date(post.createdAt),
    }));
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
} 