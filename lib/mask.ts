const CPF_LENGTH = 11;
const CNPJ_LENGTH = 14;

export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, CPF_LENGTH);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function formatCNPJ(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, CNPJ_LENGTH);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatDoc(value: string, type: "cpf" | "cnpj"): string {
  return type === "cpf" ? formatCPF(value) : formatCNPJ(value);
}

export function maxDocLength(type: "cpf" | "cnpj"): number {
  return type === "cpf" ? CPF_LENGTH : CNPJ_LENGTH;
}
