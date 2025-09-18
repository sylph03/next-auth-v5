// Environment configuration and validation
const requiredEnvVars = {
  AUTH_SECRET: process.env.AUTH_SECRET,
  API_URL: process.env.API_URL,
} as const;

// Validate required environment variables
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  AUTH_SECRET: requiredEnvVars.AUTH_SECRET!,
  API_URL: requiredEnvVars.API_URL!,
} as const;
