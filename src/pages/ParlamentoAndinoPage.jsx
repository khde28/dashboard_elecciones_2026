import ElectionResultsPage from './ElectionResultsPage';
import { resultadosParlamentoAndinoCSV } from '@/data/mockData';

export default function ParlamentoAndinoPage() {
  return <ElectionResultsPage data={resultadosParlamentoAndinoCSV} />;
}
