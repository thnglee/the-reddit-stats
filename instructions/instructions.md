# Reddit Analytics Platform — Product Requirements Document (PRD)

## Overview
Build a Reddit analytics platform using **Next.js 14 (App Router)**, **shadcn UI**, **TailwindCSS**, and **Lucide Icons**, where users can:
- Add and view different subreddits
- Analyze top Reddit content in the last 24 hours
- Categorize post themes using OpenAI

---

## Tech Stack
- **Framework**: Next.js 14 App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide
- **Data fetching**: `snoowrap` for Reddit API
- **AI analysis**: OpenAI (`gpt-4o-mini`)
- **Validation**: Zod

---

## Core Features

### 1.Subreddit Directory Page (Homepage)

#### Features
- Users can view a list of pre-added subreddit cards (e.g., `r/openai`, `r/ollama`)
- Users can add new subreddit via a modal
- Newly added subreddit appears immediately in the card list

#### UI Elements
- Grid of cards: each representing a subreddit
- "Add Subreddit" button opens modal with Reddit URL input

---

### 2.Subreddit Detail Page

#### Navigation
- Route: `/subreddit/[name]`
- Contains two tabs:
  - `Top Posts`
  - `Themes`

---

### 3.Top Posts Tab

#### Behavior
- On visit, fetch top 100 posts from the past 24 hours for the subreddit
- Show the posts in a table sorted by score

#### Post Data Structure
Each post should include:
- `title`
- `content` (selftext)
- `score`
- `url`
- `created_utc`
- `num_comments`

#### UI
- Posts are shown in a sortable table
- Optional: click on a row to view full post content

---

### 4.Themes Tab

#### Behavior
- Each post from "Top Posts" is analyzed using OpenAI API
- Categorize each post into one or more of the following categories:
  - **Solution Requests**
  - **Pain & Anger**
  - **Advice Requests**
  - **Money Talk**
- Run the analysis concurrently to reduce latency

#### Output UI
- Cards for each category with:
  - Title
  - Description
  - Count of posts
- Clicking a card opens a side panel with a list of posts under that category

---

### 5.Add New Category Cards

#### Behavior
- Users can define new category cards manually (e.g., "Job Advice", "Funny Posts")
- After adding a card:
  - Posts are re-analyzed using OpenAI with the new category schema
  - New results are shown in the Themes tab

---

## Project File Structure

```
the-reddit-stats/
├─ app/
│  ├─ page.tsx                       # Homepage: subreddit list + add modal
│  ├─ subreddit/
│  │  └─ [name]/
│  │     ├─ page.tsx                # Subreddit page with tabs
│  │     └─ themes.tsx             # (Optional split tab logic)
├─ components/
│  ├─ subreddit/
│  │  ├─ SubredditCard.tsx
│  │  ├─ AddSubredditModal.tsx
│  │  └─ ThemePanel.tsx
│  ├─ post/
│  │  ├─ PostsTable.tsx
│  │  └─ ThemeCards.tsx
│  └─ ui/                            # shadcn components
├─ lib/
│  ├─ reddit.ts                     # Reddit fetch logic
│  ├─ openai.ts                     # Post categorization logic
│  ├─ constants.ts                  # Predefined categories and labels
│  └─ utils.ts                      # Utility functions
├─ types/
│  └─ index.ts                      # Shared types (Post, AnalysisResult)
├─ data/
│  └─ subreddits.ts                 # Local state for subreddit list
├─ public/                          # Static assets
├─ .env                             # Env vars for Reddit/OpenAI API
```

---

## API Integration Documentation

### Fetching Reddit Data with Snoowrap

Used in `lib/reddit.ts`:

```ts
import snoowrap from 'snoowrap';
import dotenv from 'dotenv';

dotenv.config();

export async function fetchRecentPosts(subredditName: string): Promise<RedditPost[]> {
  const reddit = new snoowrap({
    userAgent: process.env.REDDIT_USER_AGENT!,
    clientId: process.env.REDDIT_CLIENT_ID!,
    clientSecret: process.env.REDDIT_CLIENT_SECRET!,
    username: process.env.REDDIT_USERNAME!,
    password: process.env.REDDIT_PASSWORD!
  });

  const now = Math.floor(Date.now() / 1000);
  const yesterday = now - (24 * 60 * 60);

  const posts = await reddit.getSubreddit(subredditName).getNew({ limit: 100 });

  return posts
    .filter((post) => post.created_utc >= yesterday)
    .map((post) => ({
      title: post.title,
      content: post.selftext || '',
      score: post.score,
      numComments: post.num_comments,
      createdAt: new Date(post.created_utc * 1000),
      url: post.url,
    }));
}
```

---

### 🔸 Post Categorization with OpenAI

Used in `lib/openai.ts`:

```ts
import OpenAI from 'openai';
import { z } from 'zod';

const PostCategoryAnalysisSchema = z.object({
  solutionRequests: z.boolean().describe('Posts seeking solutions for problems'),
  painAndAnger: z.boolean().describe('Posts expressing pain and anger'),
  adviceRequests: z.boolean().describe('Posts seeking advice'),
  moneyTalk: z.boolean().describe('Posts about spending money'),
});

const OpenAIAnalysisResponseSchema = PostCategoryAnalysisSchema.extend({
  explanation: z.string(),
});

export async function analyzePostCategories(title: string, content: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Analyze the following Reddit post and categorize it:
        - solutionRequests: Posts seeking solutions for problems
        - painAndAnger: Posts expressing pain and anger
        - adviceRequests: Posts seeking advice
        - moneyTalk: Posts about spending money`
      },
      {
        role: "user",
        content: `Title: ${title}\n\nContent: ${content}`
      }
    ],
    temperature: 0.1,
    response_format: { type: "json_object" }
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return PostCategoryAnalysisSchema.parse(result);
}
```

---

### Example Post Analysis Usage

```ts
const post = {
  title: 'Should I upgrade my GPU for better performance?',
  content: 'Currently using a GTX 1060 but considering upgrading to an RTX 4070. Would it make a significant difference for running larger models?'
};

const result = await analyzePostCategories(post.title, post.content);
console.log(result);
```

#### 🔹 Possible Response:

```json
{
  "solutionRequests": false,
  "painAndAnger": false,
  "adviceRequests": true,
  "moneyTalk": true,
  "explanation": "The post is asking for advice on whether to upgrade hardware, and it involves a discussion around spending $600."
}
```

---

## Developer Alignment

- Use a **single source of truth** for Reddit + OpenAI logic in `lib/`
- Avoid over-engineering file structure; prioritize clear folders over deeply nested logic
- Run OpenAI analysis concurrently using `Promise.all()` for better UX
- Store subreddits locally or use localStorage for MVP; no backend required
- Strictly validate OpenAI responses using `zod` to ensure reliability