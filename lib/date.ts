/**
 * Formata data ISO (YYYY-MM-DD) para DD/MM/YYYY.
 */
export function formatDateToBR(isoDate: string): string {
  if (!isoDate?.trim()) return "";
  const [y, m, d] = isoDate.trim().split(/[-/]/);
  if (!y || !m || !d) return isoDate;
  const day = d.padStart(2, "0");
  const month = m.padStart(2, "0");
  return `${day}/${month}/${y}`;
}

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

const MESES_ABREV = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

/**
 * Retorna mês/ano a partir de data ISO (ex.: "2026-01-15" -> "janeiro/2026").
 */
export function getMesReferencia(isoDate: string): string {
  if (!isoDate?.trim()) return "";
  const [y, m] = isoDate.trim().split(/[-/]/);
  if (!y || !m) return "";
  const monthIndex = parseInt(m, 10) - 1;
  if (monthIndex < 0 || monthIndex > 11) return "";
  return `${MESES[monthIndex]}/${y}`;
}

/**
 * Retorna mês abreviado para nome de arquivo (ex.: "2026-01-15" -> "jan").
 */
export function getMesAbrev(isoDate: string): string {
  if (!isoDate?.trim()) return "";
  const parts = isoDate.trim().split(/[-/]/);
  const m = parts.length >= 2 ? parts[1] : "";
  const monthIndex = parseInt(m, 10) - 1;
  if (monthIndex < 0 || monthIndex > 11) return "";
  return MESES_ABREV[monthIndex];
}
