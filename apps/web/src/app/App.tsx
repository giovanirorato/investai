import { Activity, Database, LineChart, Server } from "lucide-react";
import { useEffect, useState } from "react";

type ApiStatus = "checking" | "online" | "offline";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

const nextSteps = [
  "Modelar endpoints de empresas e analises",
  "Popular o seed com dados revisados",
  "Implementar valuation deterministico",
  "Criar prompts e fallback de recomendacao"
];

export function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${apiUrl}/health`, {
      signal: controller.signal
    })
      .then((response) => {
        setApiStatus(response.ok ? "online" : "offline");
      })
      .catch(() => {
        setApiStatus("offline");
      });

    return () => controller.abort();
  }, []);

  return (
    <main className="app-shell">
      <section className="workspace-header">
        <div>
          <p className="eyebrow">MVP academico</p>
          <h1>InvestAI</h1>
          <p className="lead">
            Base inicial para busca de empresas, analise assistida por IA,
            valuation simplificado e recomendacoes explicaveis.
          </p>
        </div>
        <div className={`status-pill status-${apiStatus}`}>
          <Activity size={18} />
          <span>API {apiStatus}</span>
        </div>
      </section>

      <section className="grid">
        <article className="panel">
          <Server size={24} />
          <h2>API</h2>
          <p>Healthcheck ativo em {apiUrl}/health.</p>
        </article>
        <article className="panel">
          <Database size={24} />
          <h2>Banco</h2>
          <p>Prisma e PostgreSQL preparados para seed inicial.</p>
        </article>
        <article className="panel">
          <LineChart size={24} />
          <h2>Produto</h2>
          <p>Fluxo principal definido na spec para implementacao por fases.</p>
        </article>
      </section>

      <section className="task-panel">
        <h2>Proximas tarefas dos estudantes</h2>
        <ul>
          {nextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
