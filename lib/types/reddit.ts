export interface RedditPost {
  id?: string;  // Optional since it only exists after DB storage
  url: string;
  title: string;
  content: string;
  author: string;
  subreddit: string;
  score: number;
  numComments: number;
  created_utc: number;
} 