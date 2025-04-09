export interface Subreddit {
  name: string;
  displayName: string;
  description?: string;
  subscribers?: number;
}

export const initialSubreddits: Subreddit[] = [
  {
    name: "openai",
    displayName: "r/openai",
    description: "Discussions about OpenAI and its products",
  },
  {
    name: "ollama",
    displayName: "r/ollama",
    description: "Community for Ollama AI platform",
  },
];

// Function to add a new subreddit
export function addSubreddit(name: string, description?: string): Subreddit {
  const newSubreddit: Subreddit = {
    name: name.toLowerCase(),
    displayName: `r/${name.toLowerCase()}`,
    description,
  };
  return newSubreddit;
} 