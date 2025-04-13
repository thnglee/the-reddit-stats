import { themeService } from '../lib/services/supabase/themes';
import { defaultThemeCategories } from '../lib/config/themes';

async function initializeThemes() {
  try {
    console.log('Initializing theme categories...');
    
    for (const category of defaultThemeCategories) {
      try {
        await themeService.addCategory({
          name: category.name,
          description: category.description,
          prompt: category.prompt
        });
        console.log(`✓ Added category: ${category.name}`);
      } catch (error) {
        if (error instanceof Error && error.message.includes('duplicate')) {
          console.log(`Category already exists: ${category.name}`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('\nTheme categories initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize themes:', error);
    process.exit(1);
  }
}

initializeThemes(); 