import cors from "cors";
import express from "express";
import { env } from "./config/env.js";

const app = express();

app.use(
  cors({
    origin: env.WEB_ORIGIN
  })
);
app.use(express.json());

app.get("/", (_request, response) => {
  response.json({
    service: "investai-api",
    status: "ok",
    docs: "Consulte spec/spec.md para o escopo do MVP."
  });
});

app.get("/health", (_request, response) => {
  response.json({
    service: "investai-api",
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

const server = app.listen(env.API_PORT, () => {
  console.log(`InvestAI API rodando em http://localhost:${env.API_PORT}`);
});

function shutdown() {
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
