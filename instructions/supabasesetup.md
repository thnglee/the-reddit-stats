# Supabase Integration Design Document for Reddit Analytics Platform

## 1. Database Schema Design

### Tables Structure

#### 1. subreddits
```sql
- id: uuid (primary key)
- name: text (unique)
- display_name: text
- last_fetched_at: timestamp
- created_at: timestamp
- updated_at: timestamp
```

#### 2. posts
```sql
- id: uuid (primary key)
- subreddit_id: uuid (foreign key -> subreddits.id)
- reddit_id: text (unique, original Reddit post ID)
- title: text
- content: text
- author: text
- url: text
- score: integer
- num_comments: integer
- created_utc: timestamp
- fetched_at: timestamp
```

#### 3. theme_categories
```sql
- id: uuid (primary key)
- name: text
- description: text
- prompt: text
- created_at: timestamp
```

#### 4. post_themes
```sql
- id: uuid (primary key)
- post_id: uuid (foreign key -> posts.id)
- category_id: uuid (foreign key -> theme_categories.id)
- analysis_explanation: text
- created_at: timestamp
```

#### 5. theme_analysis_results
```sql
- id: uuid (primary key)
- post_id: uuid (foreign key -> posts.id)
- raw_analysis: jsonb (store complete OpenAI response)
- created_at: timestamp
```

## 2. Integration Steps

### Step 1: Setup & Configuration
1. Create a new Supabase project
2. Add Supabase environment variables to `.env`:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY

### Step 2: Core Service Layer Implementation
Create new directory structure:
```
lib/
  ├─ services/
  │  ├─ supabase/
  │  │  ├─ client.ts (Supabase client configuration)
  │  │  ├─ subreddits.ts (Subreddit operations)
  │  │  ├─ posts.ts (Post operations)
  │  │  └─ themes.ts (Theme analysis operations)
  │  └─ index.ts (Service exports)
```

### Step 3: Data Flow Modifications

#### A. Subreddit Management
1. When adding new subreddit:
   - Check if exists in Supabase
   - If not, add to subreddits table
   - Initialize fetch and analysis

#### B. Post Fetching Strategy
1. Check `last_fetched_at` for subreddit
2. If > 24 hours or null:
   - Fetch new posts from Reddit
   - Batch insert new posts
   - Update `last_fetched_at`
3. If < 24 hours:
   - Fetch from Supabase cache

#### C. Theme Analysis Pipeline
1. For new posts:
   - Queue for OpenAI analysis
   - Store results in `theme_analysis_results`
   - Create relationships in `post_themes`
2. Cache analysis results:
   - Store complete OpenAI response
   - Enable quick category updates without re-analysis

## 3. Performance Optimizations

### Database Indexes
```sql
- subreddits: (name), (last_fetched_at)
- posts: (reddit_id), (subreddit_id, created_utc)
- post_themes: (post_id, category_id)
```

### Caching Strategy
1. Client-side caching:
   - Cache subreddit list
   - Cache post data for active subreddit
   - Cache theme analysis results

2. Server-side caching:
   - Implement stale-while-revalidate pattern
   - Cache API responses for high-traffic subreddits

## 4. Migration Strategy

### Phase 1: Database Setup
1. Create Supabase tables
2. Set up indexes and relationships
3. Configure RLS (Row Level Security) policies

### Phase 2: Code Integration
1. Create Supabase service layer
2. Modify existing Reddit fetching logic
3. Update theme analysis pipeline
4. Implement caching strategy

### Phase 3: Data Migration
1. Migrate existing subreddits
2. Backfill historical posts
3. Transfer theme analysis results

## 5. Error Handling & Recovery

1. Failed Fetches:
   - Implement retry mechanism
   - Log failed attempts
   - Keep old cache until successful update

2. Analysis Failures:
   - Queue failed analyses for retry
   - Maintain partial results
   - Alert on persistent failures

## 6. Monitoring & Maintenance

1. Track metrics:
   - Cache hit rates
   - Analysis queue length
   - API response times
   - Database query performance

2. Implement cleanup:
   - Archive old posts
   - Clean up orphaned records
   - Optimize database periodically

## Current Project Stucture
```
the-reddit-stats
├─ .cursor
│  └─ rules
│     └─ coding-preference.mdc
├─ app
│  ├─ api
│  │  ├─ analyze
│  │  │  └─ route.ts
│  │  └─ reddit
│  │     └─ posts
│  │        └─ route.ts
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ layout.tsx
│  ├─ page.tsx
│  └─ subreddit
│     └─ [name]
│        └─ page.tsx
├─ components
│  ├─ post
│  │  ├─ PostsTable.tsx
│  │  └─ ThemeCards.tsx
│  ├─ subreddit
│  │  ├─ AddSubredditModal.tsx
│  │  └─ SubredditCard.tsx
│  └─ ui
│     ├─ alert.tsx
│     ├─ badge.tsx
│     ├─ button.tsx
│     ├─ card.tsx
│     ├─ dialog.tsx
│     ├─ input.tsx
│     ├─ label.tsx
│     ├─ sheet.tsx
│     ├─ table.tsx
│     └─ tabs.tsx
├─ components.json
├─ data
│  └─ subreddits.ts
├─ eslint.config.mjs
├─ instructions
│  └─ instructions.md
├─ lib
│  ├─ analyzeThemes.ts
│  ├─ config
│  │  ├─ env.ts
│  │  └─ themes.ts
│  ├─ reddit.ts
│  ├─ store.ts
│  ├─ types
│  │  └─ reddit.ts
│  └─ utils.ts
├─ next.config.js
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
└─ tsconfig.json

```