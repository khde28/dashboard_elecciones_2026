import ElectionResultsPage from './ElectionResultsPage';
import { resultadosSenadoresDEMCSV } from '@/data/mockData';

export default function SenadoresDEMPage() {
  return <ElectionResultsPage data={resultadosSenadoresDEMCSV} />;
}
