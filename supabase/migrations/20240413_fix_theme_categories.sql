-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing theme-related tables
DROP TABLE IF EXISTS theme_analysis_results;
DROP TABLE IF EXISTS post_themes;
DROP TABLE IF EXISTS theme_categories;

-- Recreate theme_categories table
CREATE TABLE theme_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    prompt TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate post_themes table
CREATE TABLE post_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES theme_categories(id) ON DELETE CASCADE,
    analysis_explanation TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate theme_analysis_results table
CREATE TABLE theme_analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    raw_analysis JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_post_themes_post_category ON post_themes(post_id, category_id);

-- Enable Row Level Security
ALTER TABLE theme_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_analysis_results ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON theme_categories FOR SELECT TO anon USING (true);
CREATE POLICY "Allow service role full access" ON theme_categories TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access" ON post_themes FOR SELECT TO anon USING (true);
CREATE POLICY "Allow service role full access" ON post_themes TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access" ON theme_analysis_results FOR SELECT TO anon USING (true);
CREATE POLICY "Allow service role full access" ON theme_analysis_results TO service_role USING (true) WITH CHECK (true); 