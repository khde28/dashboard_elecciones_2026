import { Vote, FileCheck, FileWarning, FileClock } from 'lucide-react';
import KPICard from '@/components/dashboard/KPICard';
import ActasProgressBar from '@/components/dashboard/ActasProgressBar';
import BarChartVotos from '@/components/charts/BarChartVotos';
import PieChartPartidos from '@/components/charts/PieChartPartidos';
import { formatNumber, formatPercent } from '@/utils/formatters';
import { getCsvMetadata } from '@/data/csvResults';

/**
 * Reusable results page layout for any election category
 */
export default function ElectionResultsPage({ data }) {
  if (!data) return <div className="text-surface-200/50">Cargando datos...</div>;

  const candidates = data.candidatos || data.partidos || [];
  const isPresidential = !!data.candidatos;
  const csvMeta = getCsvMetadata();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
        <h1 className="text-2xl font-bold text-surface-100">{data.label}</h1>
        <p className="text-sm text-surface-200/50 mt-1">
          Resultados del conteo de actas procesadas con Hadoop MapReduce
        </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-700/40 border border-surface-700/60">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span className="text-[11px] font-semibold text-cyan-200/90">Fuente: CSV Hadoop</span>
          {csvMeta?.defaultElectionId && (
            <span className="text-[11px] text-surface-200/60">idEleccion {csvMeta.defaultElectionId}</span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <KPICard
          label="Actas Contabilizadas"
          value={formatNumber(data.actas.contabilizadas.cantidad)}
          subtitle={formatPercent(data.actas.contabilizadas.porcentaje)}
          icon={FileCheck}
          color="success"
        />
        <KPICard
          label="Para envío JEE"
          value={formatNumber(data.actas.envio_jee.cantidad)}
          subtitle={formatPercent(data.actas.envio_jee.porcentaje)}
          icon={FileWarning}
          color="warning"
        />
        <KPICard
          label="Actas Pendientes"
          value={formatNumber(data.actas.pendientes.cantidad)}
          subtitle={formatPercent(data.actas.pendientes.porcentaje)}
          icon={FileClock}
          color="error"
        />
        <KPICard
          label="Total Votos"
          value={formatNumber(data.totalVotos)}
          subtitle={`Válidos: ${formatNumber(data.votosValidos)}`}
          icon={Vote}
          color="info"
        />
      </div>

      {/* Actas Progress */}
      <div className="rounded-xl border border-surface-700/30 bg-surface-800/40 p-5">
        <h3 className="text-sm font-semibold text-surface-100 mb-4">Progreso de conteo de actas</h3>
        <ActasProgressBar data={data.actas} size="lg" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 rounded-xl border border-surface-700/30 bg-surface-800/40 p-5">
          <h3 className="text-sm font-semibold text-surface-100 mb-4">
            Votos por {isPresidential ? 'candidato' : 'partido/organización'}
          </h3>
          <BarChartVotos
            data={candidates}
            nameKey={isPresidential ? 'nombre' : 'partido'}
            height={Math.max(350, candidates.length * 45)}
          />
        </div>

        {/* Pie Chart */}
        <div className="rounded-xl border border-surface-700/30 bg-surface-800/40 p-5">
          <h3 className="text-sm font-semibold text-surface-100 mb-2">Distribución</h3>
          <PieChartPartidos
            data={candidates}
            nameKey={isPresidential ? 'nombre' : 'partido'}
            height={300}
          />
        </div>
      </div>

      {/* Results Table */}
      <div className="rounded-xl border border-surface-700/30 bg-surface-800/40 overflow-hidden">
        <div className="p-5 border-b border-surface-700/30">
          <h3 className="text-sm font-semibold text-surface-100">
            Tabla de resultados completa
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-surface-700/30">
                <th className="px-5 py-3 text-xs font-medium text-surface-200/50 uppercase tracking-wider">#</th>
                <th className="px-5 py-3 text-xs font-medium text-surface-200/50 uppercase tracking-wider">
                  {isPresidential ? 'Candidato' : 'Partido'}
                </th>
                {isPresidential && (
                  <th className="px-5 py-3 text-xs font-medium text-surface-200/50 uppercase tracking-wider">Partido</th>
                )}
                <th className="px-5 py-3 text-xs font-medium text-surface-200/50 uppercase tracking-wider text-right">Votos</th>
                <th className="px-5 py-3 text-xs font-medium text-surface-200/50 uppercase tracking-wider text-right">%</th>
                {!isPresidential && data.partidos?.[0]?.escanos != null && (
                  <th className="px-5 py-3 text-xs font-medium text-surface-200/50 uppercase tracking-wider text-right">Escaños</th>
                )}
                <th className="px-5 py-3 text-xs font-medium text-surface-200/50 uppercase tracking-wider w-48">Barra</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((item, index) => {
                const maxVotos = candidates[0]?.votos || 1;
                return (
                  <tr
                    key={item.id || index}
                    className="border-b border-surface-700/10 hover:bg-surface-700/20 transition-colors"
                  >
                    <td className="px-5 py-3 text-sm text-surface-200/50 font-mono">{index + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        ></span>
                        <span className="text-sm font-medium text-surface-100">
                          {item.nombre || item.partido}
                        </span>
                      </div>
                    </td>
                    {isPresidential && (
                      <td className="px-5 py-3 text-xs text-surface-200/50">{item.partido}</td>
                    )}
                    <td className="px-5 py-3 text-sm font-semibold text-surface-100 text-right">
                      {formatNumber(item.votos)}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-primary-300 text-right">
                      {formatPercent(item.porcentaje)}
                    </td>
                    {!isPresidential && item.escanos != null && (
                      <td className="px-5 py-3 text-sm font-bold text-amber-400 text-right">{item.escanos}</td>
                    )}
                    <td className="px-5 py-3">
                      <div className="w-full h-2 bg-surface-700/50 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(item.votos / maxVotos) * 100}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Vote summary footer */}
        <div className="flex flex-wrap gap-6 px-5 py-4 bg-surface-800/60 border-t border-surface-700/30">
          <div className="text-xs text-surface-200/50">
            Votos válidos: <strong className="text-emerald-400">{formatNumber(data.votosValidos)}</strong>
          </div>
          <div className="text-xs text-surface-200/50">
            Votos nulos: <strong className="text-red-400">{formatNumber(data.votosNulos)}</strong>
          </div>
          <div className="text-xs text-surface-200/50">
            Votos en blanco: <strong className="text-amber-400">{formatNumber(data.votosBlancos)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
