# The Reddit Stats

A powerful Reddit analytics tool that fetches and analyzes posts from any subreddit using AI to categorize discussions into meaningful themes.

![Screenshot (102)](https://github.com/user-attachments/assets/433bba9d-a4be-4de0-8589-6472b2e62de2)
![Screenshot (105)](https://github.com/user-attachments/assets/855c8af0-6014-46fd-a3a5-34e0477e37d5)
![Screenshot (106)](https://github.com/user-attachments/assets/a07c13fe-968e-479f-89de-87f00150b3d7)

## Features

- **Subreddit Monitoring**: Add and track multiple subreddits
- **Real-time Post Fetching**: Get the latest posts from the last 24 hours
- **AI-Powered Theme Analysis**: Automatically categorizes posts into themes:
  - Solution Requests: Posts seeking specific problem solutions
  - Pain & Anger: Posts expressing frustration or emotional distress
  - Advice Requests: Posts asking for general guidance
  - Money Talk: Posts discussing financial aspects
- **Interactive UI**: Modern, responsive interface with real-time updates
- **Data Persistence**: Caches results for better performance

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: 
  - Supabase for data storage
  - Reddit API (via snoowrap) for post fetching
  - OpenAI GPT-4 for theme analysis
- **State Management**: Zustand
- **UI Components**: Shadcn/ui

## Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd the-reddit-stats
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Reddit API
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_REFRESH_TOKEN=your_reddit_refresh_token
REDDIT_USER_AGENT=your_reddit_user_agent
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) to view the application

## Usage

1. **Add Subreddits**:
   - Click "Add Subreddit" button
   - Enter subreddit name (without r/)
   - Optionally add a description

2. **View Posts**:
   - Click on any subreddit card
   - Posts from the last 24 hours will be fetched
   - View posts in a table format

3. **Theme Analysis**:
   - Switch to the "Themes" tab
   - View posts categorized by theme
   - Click on categories to see related posts

## Project Structure

```
the-reddit-stats/
├─ app/                  # Next.js app router pages
├─ components/           # React components
│  ├─ post/             # Post-related components
│  ├─ subreddit/        # Subreddit-related components
│  └─ ui/               # Shared UI components
├─ lib/                 # Core functionality
│  ├─ services/         # Backend services
│  ├─ config/           # Configuration
│  └─ types/            # TypeScript types
└─ public/              # Static assets
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
