/**
 * Converte valor numérico (formato BR: "1500,50") em valor por extenso em reais.
 * Ex.: "1500,50" -> "um mil e quinhentos reais e cinquenta centavos"
 */

const UNIDADES = [
  "",
  "um",
  "dois",
  "três",
  "quatro",
  "cinco",
  "seis",
  "sete",
  "oito",
  "nove",
];

const DEZ_A_19 = [
  "dez",
  "onze",
  "doze",
  "treze",
  "catorze",
  "quinze",
  "dezesseis",
  "dezessete",
  "dezoito",
  "dezenove",
];

const DEZENAS = [
  "",
  "",
  "vinte",
  "trinta",
  "quarenta",
  "cinquenta",
  "sessenta",
  "setenta",
  "oitenta",
  "noventa",
];

const CENTENAS = [
  "",
  "cento",
  "duzentos",
  "trezentos",
  "quatrocentos",
  "quinhentos",
  "seiscentos",
  "setecentos",
  "oitocentos",
  "novecentos",
];

function centenasExtenso(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cem";
  const c = Math.floor(n / 100);
  const resto = n % 100;
  const parte = CENTENAS[c];
  if (resto === 0) return parte;
  return parte + " e " + dezenasExtenso(resto);
}

function dezenasExtenso(n: number): string {
  if (n === 0) return "";
  if (n < 10) return UNIDADES[n];
  if (n < 20) return DEZ_A_19[n - 10];
  const d = Math.floor(n / 10);
  const u = n % 10;
  if (u === 0) return DEZENAS[d];
  return DEZENAS[d] + " e " + UNIDADES[u];
}

function grupoExtenso(n: number, feminino = false): string {
  if (n === 0) return "";
  const u = n % 10;
  const d = Math.floor((n % 100) / 10);
  const c = Math.floor((n % 1000) / 100);
  const parte = centenasExtenso(c * 100 + d * 10 + u);
  if (feminino && n === 1) return "uma";
  if (feminino && n === 2) return "duas";
  return parte;
}

/** Converte número inteiro (0 a 999.999.999) para extenso */
function inteiroExtenso(n: number, feminino = false): string {
  if (n === 0) return "zero";
  const milhao = Math.floor(n / 1_000_000);
  const mil = Math.floor((n % 1_000_000) / 1_000);
  const resto = n % 1_000;
  const partes: string[] = [];
  if (milhao > 0) {
    if (milhao === 1) partes.push("um milhão");
    else partes.push(grupoExtenso(milhao) + " milhões");
  }
  if (mil > 0) {
    if (mil === 1) partes.push("mil");
    else partes.push(grupoExtenso(mil) + " mil");
  }
  if (resto > 0) partes.push(grupoExtenso(resto, feminino));
  return partes.join(" e ");
}

/**
 * Valor por extenso em reais.
 * @param valorBr - string no formato "1500,50" ou "1500"
 */
export function valorPorExtenso(valorBr: string): string {
  const limpo = valorBr.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const num = parseFloat(limpo);
  if (Number.isNaN(num) || num < 0) return "";
  const inteiro = Math.floor(num);
  const centavos = Math.round((num - inteiro) * 100);
  const reaisStr =
    inteiro === 0
      ? "zero"
      : inteiro === 1
        ? "um real"
        : inteiroExtenso(inteiro) + " reais";
  if (centavos === 0) return reaisStr;
  const centavosStr =
    centavos === 1
      ? "um centavo"
      : inteiroExtenso(centavos) + " centavos";
  if (inteiro === 0) return centavosStr;
  return reaisStr + " e " + centavosStr;
}

/**
 * Converte string "1.500,50" ou "1500,50" em número (1500.50)
 */
export function parseValorBr(valorBr: string): number {
  const limpo = valorBr.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const num = parseFloat(limpo);
  return Number.isNaN(num) ? 0 : num;
}
