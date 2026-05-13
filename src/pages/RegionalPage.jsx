import { useState, useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { resultadosDepartamentosCSV } from '@/data/mockData';
import { formatNumber, formatPercent } from '@/utils/formatters';
import { PARTY_COLORS } from '@/config/routes.config';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="glass rounded-lg px-4 py-3 shadow-xl border border-surface-700/50">
      <p className="text-sm font-semibold text-surface-100">{d.departamento}</p>
      <p className="text-xs text-emerald-400">Avance: {formatPercent(d.porcentaje)}</p>
      <p className="text-xs text-surface-200/50">Ganador: {d.ganador}</p>
    </div>
  );
}

export default function RegionalPage() {
  const [sortField, setSortField] = useState('porcentaje');
  const [sortDir, setSortDir] = useState('desc');

  const sortedData = useMemo(() => {
    return [...resultadosDepartamentosCSV].sort((a, b) => {
      const aVal = a[sortField], bVal = b[sortField];
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal;
      return sortDir === 'desc' ? -cmp : cmp;
    });
  }, [sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-100">Resultados Regionales</h1>
        <p className="text-sm text-surface-200/50 mt-1">Avance del conteo por departamento</p>
      </div>

      <div className="rounded-xl border border-surface-700/30 bg-surface-800/40 p-5">
        <h3 className="text-sm font-semibold text-surface-100 mb-4">% Actas contabilizadas</h3>
        <div style={{ height: 700 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <YAxis dataKey="departamento" type="category" width={160} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="porcentaje" radius={[0, 4, 4, 0]} maxBarSize={18}>
                {sortedData.map((e, i) => (
                  <Cell key={i} fill={e.porcentaje >= 90 ? '#10b981' : e.porcentaje >= 85 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-surface-700/30 bg-surface-800/40 overflow-hidden">
        <div className="p-5 border-b border-surface-700/30">
          <h3 className="text-sm font-semibold text-surface-100">Detalle por departamento</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-surface-700/30">
                {['departamento','mesas','contabilizadas','porcentaje','ganador','electores'].map((k) => (
                  <th key={k} onClick={() => handleSort(k)} className="px-5 py-3 text-xs font-medium text-surface-200/50 uppercase tracking-wider cursor-pointer hover:text-surface-100 select-none">
                    {k.charAt(0).toUpperCase() + k.slice(1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((dept) => (
                <tr key={dept.departamento} className="border-b border-surface-700/10 hover:bg-surface-700/20 transition-colors">
                  <td className="px-5 py-3 flex items-center gap-2"><MapPin size={14} className="text-primary-400" /><span className="text-sm font-medium text-surface-100">{dept.departamento}</span></td>
                  <td className="px-5 py-3 text-sm text-surface-200/70">{formatNumber(dept.mesas)}</td>
                  <td className="px-5 py-3 text-sm text-emerald-400 font-medium">{formatNumber(dept.contabilizadas)}</td>
                  <td className="px-5 py-3"><div className="flex items-center gap-2"><div className="w-20 h-2 bg-surface-700/50 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${dept.porcentaje}%`, backgroundColor: dept.porcentaje >= 90 ? '#10b981' : '#f59e0b' }} /></div><span className="text-xs text-surface-200/70">{formatPercent(dept.porcentaje)}</span></div></td>
                  <td className="px-5 py-3"><span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium border" style={{ backgroundColor: `${PARTY_COLORS[dept.ganador]||'#3b82f6'}15`, borderColor: `${PARTY_COLORS[dept.ganador]||'#3b82f6'}40`, color: PARTY_COLORS[dept.ganador]||'#3b82f6' }}>{dept.ganador}</span></td>
                  <td className="px-5 py-3 text-sm text-surface-200/50">{formatNumber(dept.electores)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
