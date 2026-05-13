import { useState } from 'react';
import { Map, X } from 'lucide-react';
import MapaElectoral from '@/components/charts/MapaElectoral';
import { resultadosDepartamentosCSV } from '@/data/mockData';
import { formatNumber, formatPercent } from '@/utils/formatters';
import { PARTY_COLORS } from '@/config/routes.config';

export default function MapaPage() {
  const [selectedDept, setSelectedDept] = useState(null);

  const selectedData = selectedDept
    ? resultadosDepartamentosCSV.find(
        (d) => d.departamento.toUpperCase() === selectedDept.toUpperCase()
      )
    : null;

  // Get unique winning parties for the legend
  const partiesInMap = [...new Set(resultadosDepartamentosCSV.map((d) => d.ganador))];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-100 flex items-center gap-2">
          <Map size={24} className="text-primary-400" />
          Mapa Electoral del Perú
        </h1>
        <p className="text-sm text-surface-200/50 mt-1">
          Visualización geográfica de resultados — Haz clic en un departamento para más detalles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map */}
        <div className="lg:col-span-2 rounded-xl border border-surface-700/30 bg-surface-800/40 p-4 overflow-hidden">
          <MapaElectoral
            departamentos={resultadosDepartamentosCSV}
            selectedDept={selectedDept}
            onSelectDept={(name) =>
              setSelectedDept(selectedDept === name ? null : name)
            }
            height={620}
          />

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-surface-700/30">
            <p className="text-xs text-surface-200/40 mb-2 font-medium">Partido ganador</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {partiesInMap.map((party) => (
                <div key={party} className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-sm shrink-0"
                    style={{ backgroundColor: PARTY_COLORS[party] || '#3b82f6' }}
                  ></span>
                  <span className="text-xs text-surface-200/60">{party}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Selected department or list */}
        <div className="rounded-xl border border-surface-700/30 bg-surface-800/40 overflow-hidden flex flex-col">
          {selectedData ? (
            /* Department detail panel */
            <div className="p-5 space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-surface-100">
                  {selectedData.departamento}
                </h3>
                <button
                  onClick={() => setSelectedDept(null)}
                  className="p-1.5 rounded-lg text-surface-200/40 hover:bg-surface-700/50 hover:text-surface-100 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-surface-700/30">
                  <p className="text-xs text-surface-200/40">Mesas</p>
                  <p className="text-lg font-bold text-surface-100 mt-1">
                    {formatNumber(selectedData.mesas)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-surface-700/30">
                  <p className="text-xs text-surface-200/40">Contabilizadas</p>
                  <p className="text-lg font-bold text-emerald-400 mt-1">
                    {formatNumber(selectedData.contabilizadas)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-surface-700/30">
                  <p className="text-xs text-surface-200/40">Avance</p>
                  <p className="text-lg font-bold text-primary-300 mt-1">
                    {formatPercent(selectedData.porcentaje)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-surface-700/30">
                  <p className="text-xs text-surface-200/40">Electores</p>
                  <p className="text-lg font-bold text-surface-100 mt-1">
                    {formatNumber(selectedData.electores)}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-700/30">
                <p className="text-xs text-surface-200/40 mb-2">Partido ganador</p>
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        PARTY_COLORS[selectedData.ganador] || '#3b82f6',
                    }}
                  ></span>
                  <span
                    className="text-sm font-semibold"
                    style={{
                      color:
                        PARTY_COLORS[selectedData.ganador] || '#3b82f6',
                    }}
                  >
                    {selectedData.ganador}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-surface-200/40">
                    Progreso de conteo
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    {formatPercent(selectedData.porcentaje)}
                  </span>
                </div>
                <div className="w-full h-3 bg-surface-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${selectedData.porcentaje}%`,
                      backgroundColor:
                        selectedData.porcentaje >= 93
                          ? '#10b981'
                          : selectedData.porcentaje >= 90
                          ? '#f59e0b'
                          : '#ef4444',
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Department list */
            <>
              <div className="p-4 border-b border-surface-700/30 shrink-0">
                <h3 className="text-sm font-semibold text-surface-100">
                  Departamentos ({resultadosDepartamentosCSV.length})
                </h3>
                <p className="text-xs text-surface-200/30 mt-0.5">
                  Clic en el mapa o en la lista
                </p>
              </div>
              <div className="overflow-y-auto flex-1">
                {resultadosDepartamentosCSV
                  .sort((a, b) => b.porcentaje - a.porcentaje)
                  .map((dept) => (
                    <button
                      key={dept.departamento}
                      onClick={() => setSelectedDept(dept.departamento)}
                      className="flex items-center justify-between w-full px-4 py-3 border-b border-surface-700/10 hover:bg-surface-700/20 transition-colors text-left"
                    >
                      <div>
                        <p className="text-sm font-medium text-surface-100">
                          {dept.departamento}
                        </p>
                        <p className="text-xs text-surface-200/40">
                          {formatNumber(dept.mesas)} mesas
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-400">
                          {formatPercent(dept.porcentaje)}
                        </p>
                        <p
                          className="text-xs font-medium"
                          style={{
                            color:
                              PARTY_COLORS[dept.ganador] || '#3b82f6',
                          }}
                        >
                          {dept.ganador}
                        </p>
                      </div>
                    </button>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
