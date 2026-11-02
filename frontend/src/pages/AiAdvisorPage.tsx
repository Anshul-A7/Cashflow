import React, { useState, useEffect } from 'react';
import { AiDiagnosticResponse, AiInsightDto } from '../types';
import { aiApi } from '../services/api';
import {
  Sparkles,
  Bot,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface AiAdvisorPageProps {
  businessId: number;
  currencySymbol: string;
}

export const AiAdvisorPage: React.FC<AiAdvisorPageProps> = ({ businessId, currencySymbol }) => {
  const [diagnostic, setDiagnostic] = useState<AiDiagnosticResponse | null>(null);
  const [insights, setInsights] = useState<AiInsightDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const loadData = async () => {
    try {
      const history = await aiApi.getInsights(businessId);
      setInsights(history);
    } catch (e) {
      console.error(e);
    } finally {
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [businessId]);

  const handleRunDiagnostic = async () => {
    setIsLoading(true);
    try {
      const res = await aiApi.runDiagnostic(businessId);
      setDiagnostic(res);
      await loadData();
    } catch (err: any) {
      alert('Diagnostic Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 tracking-tight flex items-center space-x-2">
            <span>AI-Powered Financial Intelligence Advisor</span>
            <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-mono text-zinc-600">
              Spring AI & Gemini
            </span>
          </h1>
          <p className="text-xs text-zinc-500">
            Synthesizes business ledgers, evaluates working capital stress, and prescribes CFO-level recommendations.
          </p>
        </div>
        <button
          onClick={handleRunDiagnostic}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 rounded-md bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 shadow-sm"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Analyzing Financial Telemetry...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              <span>Run Live CFO Diagnostic</span>
            </>
          )}
        </button>
      </div>

      {/* Main Diagnostic Display */}
      {diagnostic ? (
        <div className="space-y-6">
          {/* Health Score & Status Banner */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center space-x-5">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white font-mono font-bold text-2xl shadow-inner">
                {diagnostic.financialHealthScore}
                <span className="absolute bottom-1 text-[9px] uppercase tracking-wider text-zinc-400 font-sans">
                  / 100
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono uppercase text-zinc-500">Working Capital Status:</span>
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      diagnostic.liquidityStatus === 'EXCELLENT'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : diagnostic.liquidityStatus === 'STABLE'
                        ? 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                        : diagnostic.liquidityStatus === 'VULNERABLE'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {diagnostic.liquidityStatus}
                  </span>
                </div>
                <h3 className="mt-1 text-sm font-semibold text-zinc-900 leading-snug">
                  {diagnostic.executiveSummary}
                </h3>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Estimated operating runway:{' '}
                  <strong className="text-zinc-800 font-mono">
                    {diagnostic.calculatedRunwayDays > 365 ? '365+ days' : `${diagnostic.calculatedRunwayDays} days`}
                  </strong>
                  . Generated via {diagnostic.isAiGenerated ? 'Google Gemini Pro' : 'Heuristic Analytical Engine'}.
                </p>
              </div>
            </div>
          </div>

          {/* Risks & Strategic Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identified Risks */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center space-x-2 text-rose-700 font-semibold text-xs mb-3">
                <AlertTriangle className="h-4 w-4" />
                <span>Identified Financial & Liquidity Risks</span>
              </div>
              <ul className="space-y-2 text-xs text-zinc-700">
                {diagnostic.identifiedRisks.length > 0 ? (
                  diagnostic.identifiedRisks.map((risk, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{risk}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-zinc-500 italic">No acute liquidity risks detected.</li>
                )}
              </ul>
            </div>

            {/* Strategic Recommendations */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center space-x-2 text-emerald-700 font-semibold text-xs mb-3">
                <CheckCircle2 className="h-4 w-4" />
                <span>Actionable Cash Preservation Strategies</span>
              </div>
              <ul className="space-y-2 text-xs text-zinc-700">
                {diagnostic.strategicRecommendations.map((rec, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center shadow-sm">
          <Bot className="mx-auto h-10 w-10 text-zinc-400 mb-3" />
          <h3 className="text-sm font-semibold text-zinc-900">Run Your First AI Financial Diagnostic</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
            Our engine ingests your real-time bank accounts, open receivables, overdue invoices, and expenses to construct an institutional CFO report.
          </p>
          <button
            onClick={handleRunDiagnostic}
            disabled={isLoading}
            className="mt-5 rounded-md bg-zinc-950 px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 shadow-sm"
          >
            {isLoading ? 'Analyzing...' : 'Run Financial Analysis'}
          </button>
        </div>
      )}

      {/* Historical Insights Feed */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider font-mono">
            Historical Insights & Observations
          </h3>
          <span className="text-[10px] font-mono text-zinc-500">{insights.length} total entries</span>
        </div>

        <div className="divide-y divide-zinc-100">
          {insights.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No historical insights logged. Trigger a diagnostic run above to generate advice.
            </div>
          ) : (
            insights.map((inItem) => (
              <div key={inItem.id} className="p-4 hover:bg-zinc-50/50 transition-colors">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-zinc-900">{inItem.title}</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        inItem.severity === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : inItem.severity === 'WARNING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {inItem.severity}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {new Date(inItem.generatedAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed">{inItem.content}</p>
                {inItem.actionableAdvice && (
                  <div className="mt-2 text-xs text-zinc-800 bg-zinc-50 border border-zinc-200 rounded p-2 flex items-start space-x-1.5">
                    <span className="font-semibold text-zinc-500 shrink-0">Prescribed Step:</span>
                    <span>{inItem.actionableAdvice}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

