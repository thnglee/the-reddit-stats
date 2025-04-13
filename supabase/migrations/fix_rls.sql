-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access" ON subreddits;
DROP POLICY IF EXISTS "Allow service role full access" ON subreddits;
DROP POLICY IF EXISTS "Allow public read access" ON posts;
DROP POLICY IF EXISTS "Allow service role full access" ON posts;
DROP POLICY IF EXISTS "Allow public read access" ON theme_categories;
DROP POLICY IF EXISTS "Allow service role full access" ON theme_categories;
DROP POLICY IF EXISTS "Allow public read access" ON post_themes;
DROP POLICY IF EXISTS "Allow service role full access" ON post_themes;
DROP POLICY IF EXISTS "Allow public read access" ON theme_analysis_results;
DROP POLICY IF EXISTS "Allow service role full access" ON theme_analysis_results;

-- Create new policies
ALTER TABLE subreddits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON subreddits
    FOR SELECT USING (true);
CREATE POLICY "Enable insert access for service role" ON subreddits
    FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Enable update access for service role" ON subreddits
    FOR UPDATE USING (auth.role() = 'service_role');

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON posts
    FOR SELECT USING (true);
CREATE POLICY "Enable insert access for service role" ON posts
    FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Enable update access for service role" ON posts
    FOR UPDATE USING (auth.role() = 'service_role');

ALTER TABLE theme_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON theme_categories
    FOR SELECT USING (true);
CREATE POLICY "Enable insert access for service role" ON theme_categories
    FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Enable update access for service role" ON theme_categories
    FOR UPDATE USING (auth.role() = 'service_role');

ALTER TABLE post_themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON post_themes
    FOR SELECT USING (true);
CREATE POLICY "Enable insert access for service role" ON post_themes
    FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Enable update access for service role" ON post_themes
    FOR UPDATE USING (auth.role() = 'service_role');

ALTER TABLE theme_analysis_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON theme_analysis_results
    FOR SELECT USING (true);
CREATE POLICY "Enable insert access for service role" ON theme_analysis_results
    FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Enable update access for service role" ON theme_analysis_results
    FOR UPDATE USING (auth.role() = 'service_role'); 