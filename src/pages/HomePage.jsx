import { useState } from 'react';
import { Vote, FileCheck, FileWarning, FileClock, BarChart3 } from 'lucide-react';
import KPICard from '@/components/dashboard/KPICard';
import ActasProgressBar from '@/components/dashboard/ActasProgressBar';
import CategorySelector from '@/components/dashboard/CategorySelector';
import CategorySummary from '@/components/dashboard/CategorySummary';
import BarChartVotos from '@/components/charts/BarChartVotos';
import PieChartPartidos from '@/components/charts/PieChartPartidos';
import { actasResumen, getResultsByCategory } from '@/data/mockData';
import { getCsvMetadata } from '@/data/csvResults';
import { formatNumber, formatPercent } from '@/utils/formatters';
import { TOTAL_MESAS } from '@/config/routes.config';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('presidencial');
  const results = getResultsByCategory(activeCategory);
  const actasData = actasResumen.categorias[activeCategory];
  const candidates = results.candidatos || results.partidos || [];
  const csvMeta = getCsvMetadata();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-100 flex items-center gap-3">
            <span className="text-3xl">🗳️</span>
            Elecciones Generales 2026
          </h1>
          <p className="text-sm text-surface-200/50 mt-1">
            Dashboard de resultados electorales — Procesado con Hadoop MapReduce
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-medium text-emerald-400">Datos actualizados</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-700/40 border border-surface-700/60">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="text-[11px] font-semibold text-cyan-200/90">Fuente: CSV Hadoop</span>
            {csvMeta?.defaultElectionId && (
              <span className="text-[11px] text-surface-200/60">idEleccion {csvMeta.defaultElectionId}</span>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <KPICard
          label="Total Mesas"
          value={formatNumber(TOTAL_MESAS)}
          subtitle="A nivel nacional"
          icon={Vote}
          color="info"
        />
        <KPICard
          label="Contabilizadas"
          value={formatNumber(actasData.contabilizadas.cantidad)}
          subtitle={formatPercent(actasData.contabilizadas.porcentaje)}
          icon={FileCheck}
          color="success"
        />
        <KPICard
          label="Para envío JEE"
          value={formatNumber(actasData.envio_jee.cantidad)}
          subtitle={formatPercent(actasData.envio_jee.porcentaje)}
          icon={FileWarning}
          color="warning"
        />
        <KPICard
          label="Pendientes"
          value={formatNumber(actasData.pendientes.cantidad)}
          subtitle={formatPercent(actasData.pendientes.porcentaje)}
          icon={FileClock}
          color="error"
        />
      </div>

      {/* Actas Progress */}
      <div className="rounded-xl border border-surface-700/30 bg-surface-800/40 p-5">
        <h3 className="text-sm font-semibold text-surface-100 mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-primary-400" />
          Progreso de conteo — {actasData.label || 'Presidencial'}
        </h3>
        <ActasProgressBar data={actasData} size="lg" />
      </div>

      {/* Category Selector + Charts */}
      <CategorySelector active={activeCategory} onChange={setActiveCategory} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bar Chart - spans 3 columns */}
        <div className="lg:col-span-3 rounded-xl border border-surface-700/30 bg-surface-800/40 p-5">
          <h3 className="text-sm font-semibold text-surface-100 mb-4">
            {results.label} — Resultados por {results.candidatos ? 'Candidato' : 'Partido'}
          </h3>
          <BarChartVotos
            data={candidates}
            nameKey={results.candidatos ? 'nombre' : 'partido'}
            height={Math.max(350, candidates.length * 45)}
          />
        </div>

        {/* Pie Chart + Summary - spans 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-surface-700/30 bg-surface-800/40 p-5">
            <h3 className="text-sm font-semibold text-surface-100 mb-2">Distribución de votos</h3>
            <PieChartPartidos
              data={candidates}
              nameKey={results.candidatos ? 'nombre' : 'partido'}
              height={280}
            />
          </div>

          {/* Vote summary */}
          <div className="rounded-xl border border-surface-700/30 bg-surface-800/40 p-5">
            <h3 className="text-sm font-semibold text-surface-100 mb-4">Resumen de votos</h3>
            <div className="space-y-3">
              {[
                { label: 'Votos válidos', value: results.votosValidos, color: 'text-emerald-400' },
                { label: 'Votos nulos', value: results.votosNulos, color: 'text-red-400' },
                { label: 'Votos en blanco', value: results.votosBlancos, color: 'text-amber-400' },
                { label: 'Total emitidos', value: results.totalVotos, color: 'text-primary-300' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-surface-700/20 last:border-0">
                  <span className="text-xs text-surface-200/60">{item.label}</span>
                  <span className={`text-sm font-semibold ${item.color}`}>{formatNumber(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category progress summary */}
      <div className="rounded-xl border border-surface-700/30 bg-surface-800/40 p-5">
        <h3 className="text-sm font-semibold text-surface-100 mb-4">Avance de conteo por categoría</h3>
        <CategorySummary />
      </div>
    </div>
  );
}
