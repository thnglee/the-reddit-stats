import { NextResponse } from "next/server";
import { fetchRecentPosts } from '@/lib/reddit';

export async function GET(request: Request) {
  // Declare subreddit outside try block to make it accessible in catch block
  let subreddit: string | null = null;
  
  try {
    const { searchParams } = new URL(request.url);
    subreddit = searchParams.get("subreddit");

    console.log('API Route - Received request for subreddit:', subreddit);

    if (!subreddit) {
      return NextResponse.json(
        { error: 'Subreddit parameter is required' },
        { status: 400 }
      );
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

    const posts = await fetchRecentPosts(subreddit);
    return NextResponse.json(posts);
  } catch (error: any) {
    const errorDetails = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode,
      subreddit: subreddit || 'unknown'
    };
    
    console.error(`[${subreddit || 'unknown'}] Error fetching Reddit posts:`, errorDetails);
    
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