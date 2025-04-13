import { supabaseAdmin } from '../lib/services/supabase/client';

async function clearThemeAnalysis() {
  try {
    console.log('Clearing theme analysis results...');

    // Clear theme_analysis_results table
    const { error: clearError } = await supabaseAdmin
      .from('theme_analysis_results')
      .delete()
      .gte('created_at', '2000-01-01'); // This will delete all rows since this date is in the past

    if (clearError) {
      throw clearError;
    }
    console.log('✓ Cleared theme_analysis_results table');

    // Clear post_themes table
    const { error: clearThemesError } = await supabaseAdmin
      .from('post_themes')
      .delete()
      .gte('created_at', '2000-01-01'); // This will delete all rows since this date is in the past

    if (clearThemesError) {
      throw clearThemesError;
    }
    console.log('✓ Cleared post_themes table');

    console.log('✓ Successfully cleared all theme analysis data');

  } catch (error) {
    console.error('Failed to clear theme analysis:', error);
    process.exit(1);
  }
}

clearThemeAnalysis(); 