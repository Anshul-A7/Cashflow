import React, { useState, useEffect } from 'react';
import { CashFlowForecastResponse } from '../types';
import { forecastApi } from '../services/api';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

interface ForecastPageProps {
  businessId: number;
  currencySymbol: string;
}

export const ForecastPage: React.FC<ForecastPageProps> = ({ businessId, currencySymbol }) => {
  const [forecast, setForecast] = useState<CashFlowForecastResponse | null>(null);
  const [targetDate, setTargetDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [targetCashPosition, setTargetCashPosition] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isQueryingPosition, setIsQueryingPosition] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadForecast = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await forecastApi.getForecast(businessId);
      setForecast(data);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate cash flow horizon');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, [businessId]);

  const handleQueryPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsQueryingPosition(true);
    try {
      const res = await forecastApi.getPositionUntil(businessId, targetDate);
      setTargetCashPosition(res.projectedCash);
    } catch (err: any) {
      alert('Forecast calculation error: ' + err.message);
    } finally {
      setIsQueryingPosition(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-zinc-500">Calculating rolling cash horizons...</div>;
  }

  if (error || !forecast) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800">
        <AlertTriangle className="mx-auto h-8 w-8 text-rose-600 mb-2" />
        <h3 className="text-sm font-semibold">Forecast Generation Error</h3>
        <p className="text-xs text-rose-600 mt-1">{error}</p>
        <button
          onClick={loadForecast}
          className="mt-4 rounded-md bg-zinc-950 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
        >
          Recalculate
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">
          Predictive Cash Flow Forecast (Horizon Simulation)
        </h1>
        <p className="text-xs text-zinc-500">
          Projects future cash availability using recorded invoices, scheduled expenses, and historical payment patterns.
        </p>
      </div>

      {/* Liquidity Risk Indicator Banner */}
      {forecast.hasLiquidityRisk ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 flex items-center space-x-3 text-rose-900">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold block">Liquidity Deficit Projected in Rolling Horizon!</span>
            <span>
              Your projected liquid balance falls below zero (minimum:{' '}
              {currencySymbol} {forecast.minimumProjectedCash.toLocaleString('en-IN')}). Consider accelerating customer receivables or delaying non-essential expenses.
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 flex items-center space-x-3 text-emerald-900">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold block">Liquidity Horizon Stable & Solvent</span>
            <span>
              No cash shortages projected in the upcoming 6-week operational window. Minimum forecasted liquidity reserves:{' '}
              <strong className="font-mono">
                {currencySymbol} {forecast.minimumProjectedCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </strong>.
            </span>
          </div>
        </div>
      )}

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <span className="block text-xs font-mono uppercase text-zinc-500">Starting Liquid Balance</span>
          <div className="mt-2 font-mono text-2xl font-bold text-zinc-900 tabular-nums">
            {currencySymbol} {forecast.currentCashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <span className="block text-xs font-mono uppercase text-zinc-500">Expected Incoming Receivables</span>
          <div className="mt-2 font-mono text-2xl font-bold text-emerald-700 tabular-nums">
            + {currencySymbol} {forecast.totalOutstandingReceivables.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <span className="block text-xs font-mono uppercase text-zinc-500">Scheduled Upcoming Outflows</span>
          <div className="mt-2 font-mono text-2xl font-bold text-rose-700 tabular-nums">
            - {currencySymbol} {forecast.totalUpcomingPayables.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Main Forecast Visual Area Chart */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider font-mono">
              Rolling 6-Week Cash Trajectory
            </h3>
            <p className="text-[11px] text-zinc-500">Estimated cumulative cash curve factoring receivables and payables</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast.weeklyForecast} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
              <XAxis dataKey="weekLabel" tick={{ fontSize: 11, fill: '#71717A' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#71717A' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(val: any) => [`${currencySymbol} ${Number(val).toLocaleString('en-IN')}`, 'Projected Cash']}
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E4E4E7', borderRadius: '8px', fontSize: '11px' }}
              />
              <Area
                type="monotone"
                dataKey="projectedCash"
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorCash)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Simulation Ledger */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="px-5 py-3 border-b border-zinc-200 bg-zinc-50">
          <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider font-mono">
            Weekly Forecast Ledger Breakdown
          </h3>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600 font-mono uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-4 py-3">Week</th>
              <th className="px-4 py-3">Date Window</th>
              <th className="px-4 py-3 text-right">Expected Inflow</th>
              <th className="px-4 py-3 text-right">Expected Outflow</th>
              <th className="px-4 py-3 text-right">Projected Balance</th>
              <th className="px-4 py-3 text-center">Liquidity Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {forecast.weeklyForecast.map((wk) => (
              <tr key={wk.weekLabel} className="hover:bg-zinc-50/70 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-zinc-900">{wk.weekLabel}</td>
                <td className="px-4 py-3 text-zinc-500 font-mono text-[11px]">
                  {wk.startDate} → {wk.endDate}
                </td>
                <td className="px-4 py-3 text-right font-mono text-emerald-700 font-medium">
                  + {currencySymbol} {wk.expectedInflow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-right font-mono text-zinc-700 font-medium">
                  - {currencySymbol} {wk.expectedOutflow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums font-bold text-zinc-900">
                  {currencySymbol} {wk.projectedCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-center">
                  {wk.isDeficit ? (
                    <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                      DEFICIT WARNING
                    </span>
                  ) : (
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                      SURPLUS
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Target Date Cash Position Calculator (Project Report Page 29 Method) */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider font-mono mb-1">
          Target Date Liquidity Calculator
        </h3>
        <p className="text-[11px] text-zinc-500 mb-4">
          Runs the exact formula: <code className="font-mono text-zinc-700">balance + expectedReceivables - upcomingExpenses</code> until an arbitrary target date.
        </p>

        <form onSubmit={handleQueryPosition} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <label className="text-xs text-zinc-600 shrink-0 font-medium">Evaluate Position On:</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs text-zinc-900 font-mono focus:border-zinc-900 focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isQueryingPosition}
            className="rounded-md bg-zinc-950 px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {isQueryingPosition ? 'Simulating...' : 'Calculate Position'}
          </button>
        </form>

        {targetCashPosition !== null && (
          <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 flex items-center justify-between">
            <span className="text-xs text-zinc-600 font-medium">Estimated Liquid Cash Position on {targetDate}:</span>
            <span className="font-mono text-lg font-bold text-zinc-900 tabular-nums">
              {currencySymbol} {targetCashPosition.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

