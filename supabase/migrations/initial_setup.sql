-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE subreddits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    last_fetched_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subreddit_id UUID REFERENCES subreddits(id) ON DELETE CASCADE,
    reddit_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    author TEXT NOT NULL,
    url TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    num_comments INTEGER NOT NULL DEFAULT 0,
    created_utc TIMESTAMP WITH TIME ZONE NOT NULL,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE theme_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    prompt TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE post_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES theme_categories(id) ON DELETE CASCADE,
    analysis_explanation TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE theme_analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    raw_analysis JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_subreddits_name ON subreddits(name);
CREATE INDEX idx_subreddits_last_fetched ON subreddits(last_fetched_at);
CREATE INDEX idx_posts_reddit_id ON posts(reddit_id);
CREATE INDEX idx_posts_subreddit_created ON posts(subreddit_id, created_utc);
CREATE INDEX idx_post_themes_post_category ON post_themes(post_id, category_id);

-- Enable Row Level Security
ALTER TABLE subreddits ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_analysis_results ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing read access to all, write access to authenticated service role)
CREATE POLICY "Allow public read access" ON subreddits FOR SELECT TO anon USING (true);
CREATE POLICY "Allow service role full access" ON subreddits TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access" ON posts FOR SELECT TO anon USING (true);
CREATE POLICY "Allow service role full access" ON posts TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access" ON theme_categories FOR SELECT TO anon USING (true);
CREATE POLICY "Allow service role full access" ON theme_categories TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access" ON post_themes FOR SELECT TO anon USING (true);
CREATE POLICY "Allow service role full access" ON post_themes TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access" ON theme_analysis_results FOR SELECT TO anon USING (true);
CREATE POLICY "Allow service role full access" ON theme_analysis_results TO service_role USING (true) WITH CHECK (true);

-- Insert default theme categories
INSERT INTO theme_categories (name, description, prompt) VALUES
    ('Solution Request', 'Posts where users are looking for specific solutions to their problems', 'User is looking for a specific solution to their problem'),
    ('Pain & Anger', 'Posts expressing frustration, anger, or emotional distress', 'User is expressing frustration, anger, or emotional distress'),
    ('Advice Request', 'Posts seeking general advice or guidance', 'User is seeking general advice or guidance'),
    ('Money Talk', 'Posts discussing financial aspects or compensation', 'User is discussing financial aspects or compensation'); 