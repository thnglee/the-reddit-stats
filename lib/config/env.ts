import { z } from 'zod';

export const envSchema = z.object({
  // OpenAI Configuration
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),

  // Reddit Configuration
  REDDIT_USER_AGENT: z.string().min(1, 'Reddit user agent is required'),
  REDDIT_CLIENT_ID: z.string().min(1, 'Reddit client ID is required'),
  REDDIT_CLIENT_SECRET: z.string().min(1, 'Reddit client secret is required'),
  REDDIT_USERNAME: z.string().min(1, 'Reddit username is required'),
  REDDIT_PASSWORD: z.string().min(1, 'Reddit password is required'),
});

export function validateEnv() {
  const result = envSchema.safeParse({
    // OpenAI
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,

    // Reddit
    REDDIT_USER_AGENT: process.env.REDDIT_USER_AGENT,
    REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID,
    REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET,
    REDDIT_USERNAME: process.env.REDDIT_USERNAME,
    REDDIT_PASSWORD: process.env.REDDIT_PASSWORD,
  });

  if (!result.success) {
    throw new Error(`Environment validation failed: ${result.error.message}`);
  }

  return result.data;
}

export type Env = z.infer<typeof envSchema>; 