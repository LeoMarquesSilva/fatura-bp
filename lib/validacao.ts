/**
 * Validação de CPF e CNPJ (dígitos verificadores).
 */

function mod11(digits: number[], weights: number[]): number {
  const sum = digits.reduce((acc, d, i) => acc + d * (weights[i] ?? 0), 0);
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

export function validarCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "").split("").map(Number);
  if (digits.length !== 11) return false;
  if (digits.every((d) => d === digits[0])) return false; // todos iguais
  const w1 = [10, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
  const d9 = mod11(digits.slice(0, 9), w1);
  const d10 = mod11(digits.slice(0, 10), w2);
  return digits[9] === d9 && digits[10] === d10;
}

export function validarCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, "").split("").map(Number);
  if (digits.length !== 14) return false;
  if (digits.every((d) => d === digits[0])) return false;
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d12 = mod11(digits.slice(0, 12), w1);
  const d13 = mod11(digits.slice(0, 13), w2);
  return digits[12] === d12 && digits[13] === d13;
}

export function validarDoc(doc: string, tipo: "cpf" | "cnpj"): boolean {
  const digits = doc.replace(/\D/g, "");
  if (tipo === "cpf") return digits.length === 11 && validarCPF(doc);
  return digits.length === 14 && validarCNPJ(doc);
}
