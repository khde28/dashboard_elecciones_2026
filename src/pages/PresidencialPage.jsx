import ElectionResultsPage from './ElectionResultsPage';
import { resultadosPresidencialCSV } from '@/data/mockData';

export default function PresidencialPage() {
  return <ElectionResultsPage data={resultadosPresidencialCSV} />;
}
