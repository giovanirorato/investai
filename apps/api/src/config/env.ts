import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { z } from "zod";

// Carregar .env da raiz do projeto, independente de onde o CWD está
const currentDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(currentDir, "../../../..");
config({ path: resolve(rootDir, ".env") });


const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().positive().default(3333),
  WEB_ORIGIN: z.string().url().default("http://localhost:5173"),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://investai:investai@localhost:5432/investai?schema=public"),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().default("nex-agi/nex-n2-pro:free"),
  OPENROUTER_TIMEOUT_MS: z.coerce.number().int().positive().default(8000)
});

export const env = EnvSchema.parse(process.env);

// Debug: mostrar o que foi carregado
console.log("📋 Variáveis de ambiente carregadas:");
console.log("   OPENROUTER_API_KEY existe?", !!process.env.OPENROUTER_API_KEY);
