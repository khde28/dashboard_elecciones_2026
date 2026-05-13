import ElectionResultsPage from './ElectionResultsPage';
import { resultadosSenadoresDEUCSV } from '@/data/mockData';

export default function SenadoresDEUPage() {
  return <ElectionResultsPage data={resultadosSenadoresDEUCSV} />;
}
