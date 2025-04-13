import { NextResponse } from 'next/server';
import { analyzeThemes } from '@/lib/analyzeThemes';
import { RedditPost } from '@/lib/types/reddit';

export async function POST(request: Request) {
  try {
    // Log the start of the analysis
    console.log('Starting theme analysis...');

    // Parse and validate the request body
    const posts: RedditPost[] = await request.json();
    console.log(`Received ${posts.length} posts for analysis`);
    
    if (!Array.isArray(posts) || posts.length === 0) {
      console.error('Invalid request: No posts provided');
      return NextResponse.json(
        { error: 'No posts provided for analysis' },
        { status: 400 }
      );
    }

    // Sample log of the first post to verify data structure
    console.log('Sample post data:', {
      title: posts[0].title,
      contentLength: posts[0].content.length,
      url: posts[0].url
    });

    // Perform the analysis
    const analysis = await analyzeThemes(posts);
    console.log('Analysis completed successfully');

    return NextResponse.json(analysis);
  } catch (error) {
    // Detailed error logging
    console.error('Error in theme analysis:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error
    });

    // Return a more informative error response
    return NextResponse.json(
      { 
        error: 'Failed to analyze themes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 