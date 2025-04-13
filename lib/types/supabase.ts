export type Database = {
  public: {
    Tables: {
      subreddits: {
        Row: {
          id: string
          name: string
          display_name: string
          last_fetched_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['subreddits']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['subreddits']['Insert']>
      }
      posts: {
        Row: {
          id: string
          subreddit_id: string
          reddit_id: string
          title: string
          content: string
          author: string
          url: string
          score: number
          num_comments: number
          created_utc: string
          fetched_at: string
        }
        Insert: Omit<Database['public']['Tables']['posts']['Row'], 'id' | 'fetched_at'>
        Update: Partial<Database['public']['Tables']['posts']['Insert']>
      }
      theme_categories: {
        Row: {
          id: string
          name: string
          description: string
          prompt: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['theme_categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['theme_categories']['Insert']>
      }
      post_themes: {
        Row: {
          id: string
          post_id: string
          category_id: string
          analysis_explanation: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['post_themes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['post_themes']['Insert']>
      }
      theme_analysis_results: {
        Row: {
          id: string
          post_id: string
          raw_analysis: Record<string, any>
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['theme_analysis_results']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['theme_analysis_results']['Insert']>
      }
    }
  }
} 