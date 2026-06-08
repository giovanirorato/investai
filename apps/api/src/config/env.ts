import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().positive().default(3333),
  WEB_ORIGIN: z.string().url().default("http://localhost:5173"),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://investai:investai@localhost:5432/investai?schema=public"),
  BRAPI_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().default("mistralai/mistral-small-3.1-24b-instruct"),
  OPENROUTER_TIMEOUT_MS: z.coerce.number().int().positive().default(8000)
});

export const env = EnvSchema.parse(process.env);
