import { NextResponse } from "next/server";
import snoowrap from "snoowrap";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subreddit = searchParams.get("subreddit");

  console.log('API Route - Received request for subreddit:', subreddit);

  if (!subreddit) {
    return NextResponse.json({ error: "Subreddit name is required" }, { status: 400 });
  }

  // Log environment variables (without sensitive values)
  const envCheck = {
    hasUserAgent: !!process.env.REDDIT_USER_AGENT,
    hasClientId: !!process.env.REDDIT_CLIENT_ID,
    hasClientSecret: !!process.env.REDDIT_CLIENT_SECRET,
    hasUsername: !!process.env.REDDIT_USERNAME,
    hasPassword: !!process.env.REDDIT_PASSWORD,
  };

  console.log('Environment variables check:', envCheck);

  // Check if any credentials are missing
  const missingCredentials = Object.entries(envCheck)
    .filter(([_, hasValue]) => !hasValue)
    .map(([key]) => key);

  if (missingCredentials.length > 0) {
    const error = `Missing Reddit credentials: ${missingCredentials.join(', ')}`;
    console.error(error);
    return NextResponse.json({ error, details: 'Configuration error' }, { status: 500 });
  }

  try {
    console.log(`[${subreddit}] Creating snoowrap instance...`);
    
    const reddit = new snoowrap({
      userAgent: process.env.REDDIT_USER_AGENT!,
      clientId: process.env.REDDIT_CLIENT_ID!,
      clientSecret: process.env.REDDIT_CLIENT_SECRET!,
      username: process.env.REDDIT_USERNAME!,
      password: process.env.REDDIT_PASSWORD!,
    });

    console.log(`[${subreddit}] Fetching new posts...`);
    const posts = await reddit.getSubreddit(subreddit).getNew({ limit: 100 });
    
    // Log raw post data for debugging
    console.log(`[${subreddit}] Raw post data example:`, posts?.[0] ? {
      title: posts[0].title,
      score: posts[0].score,
      num_comments: posts[0].num_comments,
      created_utc: posts[0].created_utc,
    } : 'No posts found');

    console.log(`[${subreddit}] Total posts received:`, posts?.length);

    if (!Array.isArray(posts)) {
      console.error(`[${subreddit}] Unexpected response type:`, typeof posts);
      throw new Error('Invalid response from Reddit API');
    }

    const now = Math.floor(Date.now() / 1000);
    const yesterday = now - (24 * 60 * 60);

    const recentPosts = posts
      .filter((post) => {
        const isRecent = post.created_utc >= yesterday;
        if (!isRecent) {
          console.log(`[${subreddit}] Filtered out post:`, {
            title: post.title,
            created_utc: post.created_utc,
            age: now - post.created_utc
          });
        }
        return isRecent;
      })
      .map((post) => {
        const mappedPost = {
          title: post.title,
          content: post.selftext || "",
          score: post.score,
          numComments: post.num_comments,
          createdAt: new Date(post.created_utc * 1000),
          url: post.url,
        };
        console.log(`[${subreddit}] Mapped post:`, mappedPost);
        return mappedPost;
      });

    console.log(`[${subreddit}] Final filtered posts count:`, recentPosts.length);
    return NextResponse.json(recentPosts);
  } catch (error: any) {
    const errorDetails = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode,
      subreddit: subreddit
    };
    
    console.error(`[${subreddit}] Error fetching Reddit posts:`, errorDetails);
    
    return NextResponse.json(
      { 
        error: "Failed to fetch Reddit posts",
        details: error.message,
        errorInfo: errorDetails
      },
      { status: 500 }
    );
  }
} 