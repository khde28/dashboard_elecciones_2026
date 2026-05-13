import csvText from '../../resultados_finales_csv_v5/part-00000.csv?raw';
import { PARTY_COLORS, CHART_COLORS, DEPARTAMENTOS } from '@/config/routes.config';

const SPECIAL_VOTES = {
  BLANCO: 'VOTOS EN BLANCO',
  NULOS: 'VOTOS NULOS',
  IMPUGNADOS: 'VOTOS IMPUGNADOS',
};


const REGION_ID_TO_DEPT = {
  '1': 'AMAZONAS',
  '2': 'ANCASH',
  '3': 'APURIMAC',
  '4': 'AREQUIPA',
  '5': 'AYACUCHO',
  '6': 'CAJAMARCA',
  '7': 'CALLAO',
  '8': 'CUSCO',
  '9': 'HUANCAVELICA',
  '10': 'HUANUCO',
  '11': 'ICA',
  '12': 'JUNIN',
  '13': 'LA LIBERTAD',
  '14': 'LAMBAYEQUE',
  '15': 'LIMA',
  '16': 'LORETO',
  '17': 'MADRE DE DIOS',
  '18': 'MOQUEGUA',
  '19': 'PASCO',
  '20': 'PIURA',
  '21': 'PUNO',
  '22': 'SAN MARTIN',
  '23': 'TACNA',
  '24': 'TUMBES',
  '25': 'UCAYALI',
};

const EXTRANJERO_REGION_IDS = new Set(['91', '92', '93', '94', '95']);

function normalizeText(value) {
  return value
    .toUpperCase()
    .replace(/[–—]/g, '-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const PARTY_COLOR_ALIASES = Object.fromEntries([
  ['PRIMERO LA GENTE - COMUNIDAD, ECOLOGIA, LIBERTAD Y PROGRESO', 'PRIMERO LA GENTE'],
  ['PARTIDO POLITICO COOPERACION POPULAR', 'COOPERACION POPULAR'],
  ['PARTIDO POLITICO NACIONAL PERU LIBRE', 'PERU LIBRE'],
  ['PARTIDO DEMOCRATICO SOMOS PERU', 'SOMOS PERU'],
  ['PARTIDO POLITICO PERU ACCION', 'ACCION POPULAR'],
].map(([key, value]) => [normalizeText(key), value]));

function parseCsvLine(line) {
  const clean = line.trim().replace(/\t+$/g, '');
  if (!clean) return null;

  const first = clean.indexOf(',');
  const second = clean.indexOf(',', first + 1);
  const third = clean.indexOf(',', second + 1);
  const last = clean.lastIndexOf(',');

  if (first < 0 || second < 0 || third < 0 || last < 0 || last <= third) return null;

  const idEleccion = clean.slice(0, first).trim();
  const region = clean.slice(first + 1, second).trim();
  const partyId = clean.slice(second + 1, third).trim();
  const partyName = clean.slice(third + 1, last).trim();
  const totalStr = clean.slice(last + 1).trim();
  const totalVotos = Number(totalStr.replace(/\s/g, ''));

  if (!idEleccion || !region || !partyName || Number.isNaN(totalVotos)) return null;

  return {
    idEleccion,
    region,
    partyId,
    partyName,
    totalVotos,
  };
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/);
  const dataLines = lines.slice(1);
  return dataLines.map(parseCsvLine).filter(Boolean);
}

const CSV_ROWS = parseCsv(csvText || '');

function getDefaultElectionId() {
  const totalsById = new Map();
  CSV_ROWS.forEach((row) => {
    if (normalizeText(row.region) !== 'NACIONAL') return;
    totalsById.set(row.idEleccion, (totalsById.get(row.idEleccion) || 0) + row.totalVotos);
  });

  let selectedId = null;
  let maxTotal = -1;
  totalsById.forEach((total, id) => {
    if (total > maxTotal) {
      maxTotal = total;
      selectedId = id;
    }
  });

  return selectedId;
}

const DEFAULT_ELECTION_ID = getDefaultElectionId();

export function getCsvMetadata() {
  return {
    defaultElectionId: DEFAULT_ELECTION_ID,
  };
}

function isSpecialVote(name) {
  const normalized = normalizeText(name);
  return (
    normalized === SPECIAL_VOTES.BLANCO ||
    normalized === SPECIAL_VOTES.NULOS ||
    normalized === SPECIAL_VOTES.IMPUGNADOS
  );
}

function getPartyColor(name, index) {
  const normalized = normalizeText(name);
  const alias = PARTY_COLOR_ALIASES[normalized];
  const byName = PARTY_COLORS[name] || PARTY_COLORS[normalized] || (alias ? PARTY_COLORS[alias] : null);
  return byName || CHART_COLORS[index % CHART_COLORS.length];
}

function computeSummary(rows) {
  const totalVotos = rows.reduce((sum, row) => sum + row.totalVotos, 0);
  const votosBlancos = rows
    .filter((row) => normalizeText(row.partyName) === SPECIAL_VOTES.BLANCO)
    .reduce((sum, row) => sum + row.totalVotos, 0);
  const votosNulos = rows
    .filter((row) => normalizeText(row.partyName) === SPECIAL_VOTES.NULOS)
    .reduce((sum, row) => sum + row.totalVotos, 0);
  const votosImpugnados = rows
    .filter((row) => normalizeText(row.partyName) === SPECIAL_VOTES.IMPUGNADOS)
    .reduce((sum, row) => sum + row.totalVotos, 0);
  const votosValidos = Math.max(0, totalVotos - votosBlancos - votosNulos - votosImpugnados);

  return {
    totalVotos,
    votosBlancos,
    votosNulos,
    votosImpugnados,
    votosValidos,
  };
}

export function buildNationalResults() {
  const rows = CSV_ROWS.filter(
    (row) =>
      normalizeText(row.region) === 'NACIONAL' &&
      (!DEFAULT_ELECTION_ID || row.idEleccion === DEFAULT_ELECTION_ID)
  );
  const summary = computeSummary(rows);
  const totals = new Map();

  rows.forEach((row) => {
    if (isSpecialVote(row.partyName)) return;
    totals.set(row.partyName, (totals.get(row.partyName) || 0) + row.totalVotos);
  });

  const partidos = [...totals.entries()]
    .map(([partido, votos], index) => ({
      id: index + 1,
      partido,
      votos,
      porcentaje: summary.votosValidos
        ? Number(((votos / summary.votosValidos) * 100).toFixed(2))
        : 0,
      color: getPartyColor(partido, index),
    }))
    .sort((a, b) => b.votos - a.votos);

  return {
    ...summary,
    partidos,
  };
}

export function buildRegionalWinners() {
  const winners = {};
  const regionTotals = new Map();

  CSV_ROWS.forEach((row) => {
    if (normalizeText(row.region) === 'NACIONAL') return;
    if (DEFAULT_ELECTION_ID && row.idEleccion !== DEFAULT_ELECTION_ID) return;
    if (isSpecialVote(row.partyName)) return;

    const regionKey = EXTRANJERO_REGION_IDS.has(normalizeText(row.region))
      ? 'EXTRANJERO'
      : row.region.trim();
    const partyKey = row.partyName;
    const regionMap = regionTotals.get(regionKey) || new Map();
    regionMap.set(partyKey, (regionMap.get(partyKey) || 0) + row.totalVotos);
    regionTotals.set(regionKey, regionMap);
  });

  regionTotals.forEach((partyMap, regionKey) => {
    const regionId = normalizeText(regionKey);
    if (regionId === 'EXTRANJERO') {
      let winner = null;
      let maxVotes = -1;

      partyMap.forEach((votes, party) => {
        if (votes > maxVotes) {
          maxVotes = votes;
          winner = party;
        }
      });

      winners['PERUANOS EN EL EXTRANJERO'] = winner;
      return;
    }
    const normalizedDept = REGION_ID_TO_DEPT[regionId];
    const deptName = normalizedDept
      ? DEPARTAMENTOS.find((d) => normalizeText(d) === normalizedDept)
      : null;

    if (!deptName && !EXTRANJERO_REGION_IDS.has(regionId)) {
      return;
    }

    let winner = null;
    let maxVotes = -1;

    partyMap.forEach((votes, party) => {
      if (votes > maxVotes) {
        maxVotes = votes;
        winner = party;
      }
    });

    const targetDept = deptName || 'PERUANOS EN EL EXTRANJERO';
    winners[targetDept] = winner;
  });

  return winners;
}
