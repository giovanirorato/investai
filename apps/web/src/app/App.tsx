import {
  Activity,
  AlertCircle,
  BarChart3,
  BrainCircuit,
  Building2,
  Loader2,
  Search,
  Sparkles
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type {
  AnalysisRequestCreatedResponse,
  AnalysisRequestDetailResponse,
  ApiErrorResponse,
  CompanyDetailResponse,
  CompanySearchResponse,
  CompanySummary,
  RecommendationResponse
} from "@investai/shared";

type ApiStatus = "checking" | "online" | "offline";
type LoadState = "idle" | "loading";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3333";
const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});
const numberFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2
});
const percentFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");
  const [query, setQuery] = useState("BBAS3");
  const [objective, setObjective] = useState("crescimento com risco moderado");
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetailResponse | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisRequestDetailResponse | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  const loadCompany = useCallback(async (companyId: string) => {
    setLoadState("loading");
    setError(null);

    try {
      const company = await requestJson<CompanyDetailResponse>(
        `${apiUrl}/companies/${companyId}`
      );
      setSelectedCompany(company);
      setAnalysis(null);
      setRecommendation(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoadState("idle");
    }
  }, []);

  const searchCompanies = useCallback(
    async (searchQuery: string) => {
      // if (!searchQuery.trim()) {
      //   setError("Informe um nome, ticker ou setor.");
      //   return;
      // }

      setLoadState("loading");
      setError(null);

      try {
        const result = await requestJson<CompanySearchResponse>(
          `${apiUrl}/companies?query=${encodeURIComponent(searchQuery)}&limit=8`
        );
        setCompanies(result.items);
        setAnalysis(null);
        setRecommendation(null);

        if (result.items[0]) {
          await loadCompany(result.items[0].id);
        } else {
          setSelectedCompany(null);
          setError("Nenhuma empresa encontrada.");
        }
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setLoadState("idle");
      }
    },
    [loadCompany]
  );

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

    searchCompanies("BBAS3").catch(() => undefined);

    return () => controller.abort();
  }, [searchCompanies]);

  async function runAnalysis() {
    if (!selectedCompany) {
      return;
    }

    setLoadState("loading");
    setError(null);
    setRecommendation(null);

    try {
      const created = await requestJson<AnalysisRequestCreatedResponse>(
        `${apiUrl}/analysis-requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            companyId: selectedCompany.company.id,
            objective: objective.trim() || undefined
          })
        }
      );
      const result = await requestJson<AnalysisRequestDetailResponse>(
        `${apiUrl}/analysis-requests/${created.id}`
      );
      setAnalysis(result);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoadState("idle");
    }
  }

  async function runRecommendation() {
    if (!analysis) {
      return;
    }

    setLoadState("loading");
    setError(null);

    try {
      const result = await requestJson<RecommendationResponse>(`${apiUrl}/recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          analysisRequestId: analysis.id,
          objective: objective.trim() || undefined
        })
      });
      setRecommendation(result);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoadState("idle");
    }
  }

  const chartData = useMemo(() => {
    return (
      selectedCompany?.historicalSeries.map((point) => {
        const date = new Date(point.period);

        return {
          period: date.toLocaleDateString("pt-BR", {
            month: "2-digit",
            year: "numeric"
          }),
          value: point.value
        };
      }) ?? []
    );
  }, [selectedCompany]);

  const snapshot = selectedCompany?.financialSnapshot;
  const valuation = analysis?.analysisResult?.valuationResult;
  const isLoading = loadState === "loading";

  return (
    <main className="app-shell">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">MVP academico</p>
          <h1>InvestAI</h1>
          <p className="lead">
            Busca, dados locais, valuation deterministico e recomendacao com
            fallback.
          </p>
        </div>
        <div className={`status-pill status-${apiStatus}`}>
          <Activity size={18} />
          <span>API {apiStatus}</span>
        </div>
      </header>

      <section className="search-band" aria-label="Busca de empresas">
        <div className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                searchCompanies(query).catch(() => undefined);
              }
            }}
            placeholder="Ticker, nome ou setor"
          />
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={() => searchCompanies(query)}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="spin" size={18} /> : <Search size={18} />}
          Buscar
        </button>
      </section>

      {error ? (
        <div className="error-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      <section className="workspace-grid">
        <aside className="result-list" aria-label="Resultados">
          <div className="section-title">
            <Building2 size={18} />
            <h2>Empresas</h2>
          </div>
          {companies.length === 0 ? (
            <p className="muted">Nenhum resultado carregado.</p>
          ) : (
            <div className="company-list">
              {companies.map((company) => (
                <button
                  key={company.id}
                  className={
                    selectedCompany?.company.id === company.id
                      ? "company-row company-row-active"
                      : "company-row"
                  }
                  type="button"
                  onClick={() => loadCompany(company.id)}
                >
                  <span>
                    <strong>{company.ticker}</strong>
                    <small>{company.name}</small>
                  </span>
                  <em>{company.sector}</em>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="detail-area">
          <div className="detail-header">
            <div>
              <p className="eyebrow">Empresa selecionada</p>
              <h2>{selectedCompany?.company.name ?? "Selecione uma empresa"}</h2>
              {selectedCompany ? (
                <p className="muted">
                  {selectedCompany.company.ticker} - {selectedCompany.company.sector} -{" "}
                  {selectedCompany.company.market}
                </p>
              ) : null}
            </div>
            <button
              className="primary-button"
              type="button"
              onClick={runAnalysis}
              disabled={!selectedCompany || isLoading}
            >
              {isLoading ? <Loader2 className="spin" size={18} /> : <BrainCircuit size={18} />}
              Analisar
            </button>
          </div>

          <div className="metrics-grid">
            <Metric label="Preco atual" value={formatCurrency(snapshot?.currentPrice)} />
            <Metric label="LPA" value={formatNumber(snapshot?.earningsPerShare)} />
            <Metric label="P/L" value={formatNumber(snapshot?.peRatio)} />
            <Metric label="Lucro liquido" value={formatCurrency(snapshot?.netIncome)} />
          </div>

          <section className="chart-panel" aria-label="Historico de preco">
            <div className="section-title">
              <BarChart3 size={18} />
              <h2>Historico</h2>
            </div>
            <div className="chart-frame">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={chartData} margin={{ top: 16, right: 20, bottom: 4, left: 0 }}>
                    <CartesianGrid stroke="#e1e7ef" vertical={false} />
                    <XAxis dataKey="period" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={56} />
                    <Tooltip
                      formatter={(value) => currencyFormatter.format(Number(value))}
                      labelFormatter={(label) => `Período ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#176b4a"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              ) : (
                <p className="muted">Historico indisponivel.</p>
              )}
            </div>
            {snapshot ? (
              <p className="source-line">
                Fonte {snapshot.source} - {new Date(snapshot.referenceDate).toLocaleDateString("pt-BR")}
              </p>
            ) : null}
          </section>

          {analysis ? (
            <section className="analysis-grid">
              <article className="analysis-panel">
                <div className="section-title">
                  <BrainCircuit size={18} />
                  <h2>Analise</h2>
                </div>
                <p>{analysis.analysisResult?.classificationSummary}</p>
                <div className="tag-row">
                  <span className={`tag tag-${analysis.status}`}>{analysis.status}</span>
                  <span className="tag">
                    {analysis.analysisResult?.confidenceLevel ?? "sem confianca"}
                  </span>
                  <span className="tag">
                    {analysis.analysisResult?.modelVersion ?? "sem modelo"}
                  </span>
                </div>
              </article>

              <article className="analysis-panel">
                <div className="section-title">
                  <Sparkles size={18} />
                  <h2>Valuation</h2>
                </div>
                <div className="valuation-grid">
                  <Metric label="Preco justo" value={formatCurrency(valuation?.fairPrice)} />
                  <Metric label="Upside" value={formatPercent(valuation?.upsidePct)} />
                  <Metric label="P/L alvo" value={formatNumber(valuation?.targetPeRatio)} />
                </div>
                <p>{valuation?.rationaleSummary}</p>
              </article>
            </section>
          ) : null}

          <section className="recommendation-panel">
            <div>
              <label htmlFor="objective">Objetivo</label>
              <input
                id="objective"
                value={objective}
                onChange={(event) => setObjective(event.target.value)}
              />
            </div>
            <button
              className="secondary-button"
              type="button"
              onClick={runRecommendation}
              disabled={!analysis || isLoading}
            >
              {isLoading ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} />}
              Recomendar
            </button>
          </section>

          {recommendation ? (
            <section className="recommendation-result">
              <span className={`recommendation-badge recommendation-${recommendation.recommendationType}`}>
                {recommendation.recommendationType}
              </span>
              <p>{recommendation.summary}</p>
              <strong>{recommendation.nextAction}</strong>
            </section>
          ) : null}
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = (await response.json().catch(() => null)) as T | ApiErrorResponse | null;

  if (!response.ok) {
    const apiError = payload as ApiErrorResponse | null;
    throw new Error(apiError?.error?.message ?? "Falha ao chamar a API.");
  }

  return payload as T;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Falha inesperada.";
}

function formatCurrency(value: number | null | undefined) {
  return typeof value === "number" ? currencyFormatter.format(value) : "-";
}

function formatNumber(value: number | null | undefined) {
  return typeof value === "number" ? numberFormatter.format(value) : "-";
}

function formatPercent(value: number | null | undefined) {
  return typeof value === "number" ? percentFormatter.format(value) : "-";
}
