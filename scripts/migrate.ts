import { supabase } from '../lib/services/supabase/client';
import { subredditService } from '../lib/services/supabase/subreddits';
import { postService } from '../lib/services/supabase/posts';
import { themeService } from '../lib/services/supabase/themes';
import { initialSubreddits } from '../data/subreddits';
import { fetchRecentPosts } from '../lib/reddit';
import { analyzeThemes } from '../lib/analyzeThemes';

async function migrateData() {
  try {
    console.log('Starting data migration...');

    // 1. Migrate existing subreddits
    console.log('Migrating subreddits...');
    for (const subreddit of initialSubreddits) {
      await subredditService.upsertSubreddit(
        subreddit.name,
        subreddit.displayName || subreddit.name
      );
      console.log(`✓ Migrated subreddit: ${subreddit.name}`);
    }

    // 2. Backfill posts and analyze themes
    console.log('\nBackfilling posts and analyzing themes...');
    for (const subreddit of initialSubreddits) {
      console.log(`\nProcessing ${subreddit.name}...`);
      
      // Fetch posts
      const posts = await fetchRecentPosts(subreddit.name);
      console.log(`✓ Fetched ${posts.length} posts from ${subreddit.name}`);

      // Analyze themes
      if (posts.length > 0) {
        const analysis = await analyzeThemes(posts);
        console.log(`✓ Analyzed themes for ${posts.length} posts`);
        
        // Log category distribution
        analysis.categories.forEach(category => {
          console.log(`  - ${category.name}: ${category.count} posts`);
        });
      }
    }

    console.log('\nMigration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateData(); 