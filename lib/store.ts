import { create } from 'zustand';
import { RedditPost, ThemeAnalysisResult } from './types';

interface RedditState {
  // Posts state
  posts: RedditPost[];
  isLoadingPosts: boolean;
  postsError: { message: string; details?: string } | null;
  
  // Theme analysis state   
  themeAnalysis: ThemeAnalysisResult | null;
  isAnalyzing: boolean;
  analysisError: { message: string; details?: string } | null;
  
  // Selected post state
  selectedPost: RedditPost | null;

  // Actions
  setPosts: (posts: RedditPost[]) => void;
  setLoadingPosts: (isLoading: boolean) => void;
  setPostsError: (error: { message: string; details?: string } | null) => void;
  
  setThemeAnalysis: (analysis: ThemeAnalysisResult | null) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  setAnalysisError: (error: { message: string; details?: string } | null) => void;
  
  setSelectedPost: (post: RedditPost | null) => void;
  
  // Async actions
  fetchPosts: (subredditName: string) => Promise<void>;
  analyzePosts: (posts: RedditPost[]) => Promise<void>;
}

export const useRedditStore = create<RedditState>((set, get) => ({
  // Initial state
  posts: [],
  isLoadingPosts: false,
  postsError: null,
  themeAnalysis: null,
  isAnalyzing: false,
  analysisError: null,
  selectedPost: null,

  // State setters
  setPosts: (posts) => set({ posts }),
  setLoadingPosts: (isLoadingPosts) => set({ isLoadingPosts }),
  setPostsError: (postsError) => set({ postsError }),
  
  setThemeAnalysis: (themeAnalysis) => set({ themeAnalysis }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setAnalysisError: (analysisError) => set({ analysisError }),
  
  setSelectedPost: (selectedPost) => set({ selectedPost }),

  // Async actions
  fetchPosts: async (subredditName: string) => {
    try {
      set({ isLoadingPosts: true, postsError: null });
      
      const response = await fetch(`/api/reddit/posts?subreddit=${subredditName}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch posts');
      }

      const posts = await response.json();
      set({ posts, isLoadingPosts: false });
    } catch (err) {
      set({ 
        postsError: {
          message: "Failed to load posts",
          details: err instanceof Error ? err.message : "Unknown error occurred"
        },
        isLoadingPosts: false
      });
    }
  },

  analyzePosts: async (posts: RedditPost[]) => {
    if (posts.length === 0) return;

    try {
      set({ isAnalyzing: true, analysisError: null });
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(posts),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to analyze themes');
      }

      const analysis = await response.json();
      set({ themeAnalysis: analysis, isAnalyzing: false });
    } catch (err) {
      set({ 
        analysisError: {
          message: "Failed to analyze themes",
          details: err instanceof Error ? err.message : "Unknown error occurred"
        },
        isAnalyzing: false
      });
    }
  }
})); 