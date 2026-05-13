import ElectionResultsPage from './ElectionResultsPage';
import { resultadosDiputadosCSV } from '@/data/mockData';

export default function DiputadosPage() {
  return <ElectionResultsPage data={resultadosDiputadosCSV} />;
}
