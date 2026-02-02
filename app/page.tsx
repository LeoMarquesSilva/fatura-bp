"use client";

import { useState, FormEvent } from "react";
import clsx from "clsx";
import {
  FileText,
  CheckCircle2,
  Building2,
  User,
  Loader2,
  Download,
  X,
  Check,
  Copy,
} from "lucide-react";
import { formatDoc, onlyDigits, maxDocLength } from "@/lib/mask";
import { valorPorExtenso } from "@/lib/extenso";
import { validarDoc } from "@/lib/validacao";
import { formatDateToBR, getMesReferencia } from "@/lib/date";
import { getEmailHtml, getEmailPlainText } from "@/lib/email-template";

type TipoDoc = "cpf" | "cnpj";

type FormData = {
  NUMERO_FATURA: string;
  ANO_FATURA: string;
  DATA_VENCIMENTO: string;
  TIPO: string;
  DESTINATARIO_CNPJ_CPF: string;
  DESTINATARIO_NOME: string;
  VALOR_NUMERICO: string;
  VALOR_EXTENSO: string;
  DESCRICAO: string;
};

type FieldErrors = Partial<Record<keyof FormData, string>>;

const initial: FormData = {
  NUMERO_FATURA: "",
  ANO_FATURA: "",
  DATA_VENCIMENTO: "",
  TIPO: "",
  DESTINATARIO_CNPJ_CPF: "",
  DESTINATARIO_NOME: "",
  VALOR_NUMERICO: "",
  VALOR_EXTENSO: "",
  DESCRICAO: "",
};

function validateForm(form: FormData, tipoDoc: TipoDoc): FieldErrors {
  const err: FieldErrors = {};
  if (!form.NUMERO_FATURA?.trim()) err.NUMERO_FATURA = "Número da fatura é obrigatório.";
  if (!form.ANO_FATURA?.trim()) err.ANO_FATURA = "Ano da fatura é obrigatório.";
  else if (form.ANO_FATURA.length !== 4) err.ANO_FATURA = "Ano deve ter 4 dígitos.";
  if (!form.DATA_VENCIMENTO?.trim()) err.DATA_VENCIMENTO = "Vencimento é obrigatório.";
  if (!form.TIPO?.trim()) err.TIPO = "Tipo é obrigatório.";
  const docDigits = form.DESTINATARIO_CNPJ_CPF.replace(/\D/g, "");
  if (!docDigits) err.DESTINATARIO_CNPJ_CPF = "Documento é obrigatório.";
  else if (docDigits.length !== (tipoDoc === "cpf" ? 11 : 14))
    err.DESTINATARIO_CNPJ_CPF = tipoDoc === "cpf" ? "CPF deve ter 11 dígitos." : "CNPJ deve ter 14 dígitos.";
  else if (!validarDoc(form.DESTINATARIO_CNPJ_CPF, tipoDoc))
    err.DESTINATARIO_CNPJ_CPF = tipoDoc === "cpf" ? "CPF inválido." : "CNPJ inválido.";
  if (!form.DESTINATARIO_NOME?.trim()) err.DESTINATARIO_NOME = "Nome do destinatário é obrigatório.";
  const valorStr = form.VALOR_NUMERICO?.replace(",", ".");
  const valorNum = parseFloat(valorStr || "0");
  if (!form.VALOR_NUMERICO?.trim()) err.VALOR_NUMERICO = "Valor é obrigatório.";
  else if (Number.isNaN(valorNum) || valorNum <= 0) err.VALOR_NUMERICO = "Informe um valor numérico válido.";
  if (!form.VALOR_EXTENSO?.trim()) err.VALOR_EXTENSO = "Valor por extenso é obrigatório.";
  if (!form.DESCRICAO?.trim()) err.DESCRICAO = "Descrição é obrigatória.";
  return err;
}

export default function FaturaPage() {
  const [form, setForm] = useState<FormData>(initial);
  const [tipoDoc, setTipoDoc] = useState<TipoDoc>("cpf");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastGeneratedData, setLastGeneratedData] = useState<{
    NUMERO_FATURA: string;
    ANO_FATURA: string;
    DATA_VENCIMENTO_BR: string;
    MES_REFERENCIA: string;
    DESTINATARIO_NOME: string;
    DESTINATARIO_CNPJ_CPF: string;
    VALOR_NUMERICO: string;
    VALOR_EXTENSO: string;
  } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<"html" | "text" | false>(false);

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const formatValor = (value: string) => {
    let v = value.replace(/[^\d,]/g, "");
    const parts = v.split(",");
    if (parts.length > 1 && parts[1].length > 2) parts[1] = parts[1].slice(0, 2);
    return parts.join(",");
  };

  const handleValorChange = (value: string) => {
    const formatted = formatValor(value);
    const extenso = valorPorExtenso(formatted);
    setForm((prev) => ({ ...prev, VALOR_NUMERICO: formatted, VALOR_EXTENSO: extenso }));
    setError(null);
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.VALOR_NUMERICO;
      delete next.VALOR_EXTENSO;
      return next;
    });
  };

  const handleDocChange = (value: string) => {
    const digits = onlyDigits(value).slice(0, maxDocLength(tipoDoc));
    update("DESTINATARIO_CNPJ_CPF", digits);
  };

  const handleTipoDocChange = (novo: TipoDoc) => {
    setTipoDoc(novo);
    const digits = form.DESTINATARIO_CNPJ_CPF.replace(/\D/g, "").slice(
      0,
      maxDocLength(novo)
    );
    update("DESTINATARIO_CNPJ_CPF", digits);
  };

  const docDisplayValue = formatDoc(form.DESTINATARIO_CNPJ_CPF, tipoDoc);
  const docPlaceholder =
    tipoDoc === "cpf" ? "000.000.000-00" : "00.000.000/0000-00";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const errors = validateForm(form, tipoDoc);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    setError(null);
    const dataVencimentoBR = formatDateToBR(form.DATA_VENCIMENTO);
    const cnpjCpfFormatado = formatDoc(form.DESTINATARIO_CNPJ_CPF, tipoDoc);
    const payload = {
      ...form,
      DATA_VENCIMENTO: dataVencimentoBR,
      DESTINATARIO_CNPJ_CPF: cnpjCpfFormatado,
    };
    try {
      const res = await fetch("/api/gerar-fatura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Erro ${res.status}`);
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="?([^";]+)"?/);
      const filename = match ? match[1] : "fatura.docx";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setShowConfirmModal(false);
      setLastGeneratedData({
        NUMERO_FATURA: form.NUMERO_FATURA,
        ANO_FATURA: form.ANO_FATURA,
        DATA_VENCIMENTO_BR: dataVencimentoBR,
        MES_REFERENCIA: getMesReferencia(form.DATA_VENCIMENTO),
        DESTINATARIO_NOME: form.DESTINATARIO_NOME,
        DESTINATARIO_CNPJ_CPF: cnpjCpfFormatado,
        VALOR_NUMERICO: form.VALOR_NUMERICO,
        VALOR_EXTENSO: form.VALOR_EXTENSO,
      });
      setSuccess(true);
      setForm(initial);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar fatura.");
    } finally {
      setLoading(false);
    }
  };

  const copyEmailAsHtml = async () => {
    if (!lastGeneratedData) return;
    try {
      const html = getEmailHtml(lastGeneratedData);
      const plain = getEmailPlainText(lastGeneratedData);
      const blobHtml = new Blob([html], { type: "text/html" });
      const blobPlain = new Blob([plain], { type: "text/plain" });
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": blobHtml, "text/plain": blobPlain }),
      ]);
      setCopiedEmail("html");
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      await copyEmailAsPlainText();
    }
  };

  const copyEmailAsPlainText = async () => {
    if (!lastGeneratedData) return;
    const plain = getEmailPlainText(lastGeneratedData);
    try {
      await navigator.clipboard.writeText(plain);
      setCopiedEmail("text");
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = plain;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedEmail("text");
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-2xl bg-white shadow-cardHover ring-1 ring-slate-200/60">
            <div className="border-b border-slate-200/80 bg-gradient-to-r from-accent to-accent-light px-8 py-4" />
            <div className="px-8 py-10 text-center">
              <img
                src="https://www.bismarchipires.com.br/blog/wp-content/uploads/2025/07/Ativo-1LOGO-AZUL.png"
                alt="Bismarchi Pires"
                className="mx-auto mb-6 h-auto w-56"
              />
              <h1 className="text-xl font-bold uppercase tracking-wide text-slate-800">
                Solicitação enviada
              </h1>
              <div className="mt-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="h-8 w-8" strokeWidth={2.5} />
                </div>
              </div>
              <p className="mt-5 text-slate-600">
                O documento foi gerado e o download deve ter iniciado. Caso não
                tenha baixado, use o botão abaixo para enviar novamente.
              </p>

              {lastGeneratedData && (
                <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50/50 p-6 text-left">
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
                    Gerar e-mail (identidade visual + logo)
                  </h2>
                  <p className="mb-3 text-xs text-slate-500">
                    Prévia do e-mail em HTML. Use &quot;Copiar como HTML&quot; e cole no seu cliente de e-mail (Gmail, Outlook, etc.) para manter formatação e logo.
                  </p>
                  <div className="max-h-96 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-inner">
                    <iframe
                      title="Prévia do e-mail"
                      srcDoc={getEmailHtml(lastGeneratedData)}
                      className="h-96 w-full border-0"
                      sandbox="allow-same-origin"
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={copyEmailAsHtml}
                      className="btn-primary gap-2"
                    >
                      <Copy className="h-5 w-5" />
                      {copiedEmail === "html" ? "Copiado!" : "Copiar como HTML"}
                    </button>
                    <button
                      type="button"
                      onClick={copyEmailAsPlainText}
                      className="rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {copiedEmail === "text" ? "Copiado!" : "Copiar como texto"}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setSuccess(false);
                  setLastGeneratedData(null);
                }}
                className="btn-primary mt-8 gap-2"
              >
                <FileText className="h-5 w-5" />
                Enviar nova solicitação
              </button>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-slate-500">
            © 2026 Bismarchi Pires Advogados. Todos os direitos reservados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow-cardHover ring-1 ring-slate-200/60">
          {/* Logo */}
          <div className="border-b border-slate-200/80 bg-white px-8 pt-8 pb-6 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.bismarchipires.com.br/blog/wp-content/uploads/2025/07/Ativo-1LOGO-AZUL.png"
              alt="Bismarchi Pires"
              className="mx-auto h-auto w-48 max-w-[280px] sm:w-56"
            />
          </div>
          {/* Header */}
          <div className="border-b border-slate-200/80 bg-gradient-to-r from-accent to-accent-light px-8 py-4">
            <div className="flex items-center gap-3 text-white">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold uppercase tracking-wide">
                  Solicitação de Fatura
                </h1>
                <p className="text-sm text-white/90">
                  Preencha os campos abaixo para gerar o documento (Word).
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Número, Ano, Vencimento */}
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="NUMERO_FATURA"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Número da fatura <span className="text-red-500">*</span>
                </label>
                <input
                  id="NUMERO_FATURA"
                  type="text"
                  placeholder="Ex.: 123"
                  inputMode="numeric"
                  value={form.NUMERO_FATURA}
                  onChange={(e) => update("NUMERO_FATURA", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className={clsx("input-base", fieldErrors.NUMERO_FATURA && "border-red-400 focus:ring-red-500/20")}
                  required
                />
                {fieldErrors.NUMERO_FATURA && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.NUMERO_FATURA}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="ANO_FATURA"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Ano da fatura <span className="text-red-500">*</span>
                </label>
                <input
                  id="ANO_FATURA"
                  type="text"
                  placeholder="Ex.: 2026"
                  inputMode="numeric"
                  maxLength={4}
                  value={form.ANO_FATURA}
                  onChange={(e) => update("ANO_FATURA", e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className={clsx("input-base", fieldErrors.ANO_FATURA && "border-red-400 focus:ring-red-500/20")}
                  required
                />
                {fieldErrors.ANO_FATURA && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.ANO_FATURA}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="DATA_VENCIMENTO"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Vencimento <span className="text-red-500">*</span>
                </label>
                <input
                  id="DATA_VENCIMENTO"
                  type="date"
                  value={form.DATA_VENCIMENTO}
                  onChange={(e) => update("DATA_VENCIMENTO", e.target.value)}
                  className={clsx("input-base", fieldErrors.DATA_VENCIMENTO && "border-red-400 focus:ring-red-500/20")}
                  required
                />
                {fieldErrors.DATA_VENCIMENTO && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.DATA_VENCIMENTO}</p>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="TIPO"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Tipo <span className="text-red-500">*</span>
                </label>
                <select
                  id="TIPO"
                  value={form.TIPO}
                  onChange={(e) => update("TIPO", e.target.value)}
                  className={clsx(
                    "input-base appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10",
                    fieldErrors.TIPO && "border-red-400 focus:ring-red-500/20"
                  )}
                  required
                >
                  <option value="" disabled>
                    Selecione uma opção
                  </option>
                  <option value="Honorários Mensais">Honorários Mensais</option>
                  <option value="Honorários de Êxito">Honorários de Êxito</option>
                  <option value="Honorários Spot">Honorários Spot</option>
                  <option value="Honorários Manutenção">
                    Honorários Manutenção
                  </option>
                </select>
                {fieldErrors.TIPO && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.TIPO}</p>
                )}
              </div>

              {/* CPF/CNPJ com toggle */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Documento do destinatário <span className="text-red-500">*</span>
                </label>
                <div className="mb-2 flex rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => handleTipoDocChange("cpf")}
                    className={clsx(
                      "segment-btn flex items-center justify-center gap-2",
                      tipoDoc === "cpf"
                        ? "border-accent bg-white text-accent shadow-sm"
                        : "border-transparent text-slate-600 hover:text-slate-800"
                    )}
                  >
                    <User className="h-4 w-4" />
                    CPF
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTipoDocChange("cnpj")}
                    className={clsx(
                      "segment-btn flex items-center justify-center gap-2",
                      tipoDoc === "cnpj"
                        ? "border-accent bg-white text-accent shadow-sm"
                        : "border-transparent text-slate-600 hover:text-slate-800"
                    )}
                  >
                    <Building2 className="h-4 w-4" />
                    CNPJ
                  </button>
                </div>
                <input
                  id="DESTINATARIO_CNPJ_CPF"
                  type="text"
                  placeholder={docPlaceholder}
                  inputMode="numeric"
                  value={docDisplayValue}
                  onChange={(e) => handleDocChange(e.target.value)}
                  className={clsx("input-base font-mono tabular-nums", fieldErrors.DESTINATARIO_CNPJ_CPF && "border-red-400 focus:ring-red-500/20")}
                  required
                />
                {fieldErrors.DESTINATARIO_CNPJ_CPF && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.DESTINATARIO_CNPJ_CPF}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="DESTINATARIO_NOME"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Nome/Razão social do destinatário{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                id="DESTINATARIO_NOME"
                type="text"
                placeholder="Ex.: Grupo Petra"
                value={form.DESTINATARIO_NOME}
                onChange={(e) => update("DESTINATARIO_NOME", e.target.value)}
                className={clsx("input-base", fieldErrors.DESTINATARIO_NOME && "border-red-400 focus:ring-red-500/20")}
                required
              />
              {fieldErrors.DESTINATARIO_NOME && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.DESTINATARIO_NOME}</p>
              )}
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="VALOR_NUMERICO"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Valor (numérico) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                    R$
                  </span>
                  <input
                    id="VALOR_NUMERICO"
                    type="text"
                    placeholder="0,00"
                    inputMode="decimal"
                    value={form.VALOR_NUMERICO}
                    onChange={(e) => handleValorChange(e.target.value)}
                    className={clsx("input-base pl-10 font-mono tabular-nums", fieldErrors.VALOR_NUMERICO && "border-red-400 focus:ring-red-500/20")}
                    required
                  />
                </div>
                {fieldErrors.VALOR_NUMERICO && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.VALOR_NUMERICO}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="VALOR_EXTENSO"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Valor por extenso <span className="text-red-500">*</span>
                </label>
                <p className="mb-1 text-xs text-slate-500">Preenchido automaticamente; você pode editar se precisar.</p>
                <input
                  id="VALOR_EXTENSO"
                  type="text"
                  placeholder="Ex.: quinhentos reais"
                  value={form.VALOR_EXTENSO}
                  onChange={(e) => update("VALOR_EXTENSO", e.target.value)}
                  className={clsx("input-base", fieldErrors.VALOR_EXTENSO && "border-red-400 focus:ring-red-500/20")}
                  required
                />
                {fieldErrors.VALOR_EXTENSO && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.VALOR_EXTENSO}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="DESCRICAO"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Descrição <span className="text-red-500">*</span>
              </label>
              <textarea
                id="DESCRICAO"
                placeholder="Texto que aparecerá no campo DESCRICAO do documento"
                value={form.DESCRICAO}
                onChange={(e) => update("DESCRICAO", e.target.value)}
                className={clsx("input-base min-h-[120px] resize-y", fieldErrors.DESCRICAO && "border-red-400 focus:ring-red-500/20")}
                required
              />
              {fieldErrors.DESCRICAO && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.DESCRICAO}</p>
              )}
            </div>

            {error && (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-8 w-full gap-2 py-4 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Gerando PDF...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Gerar fatura e baixar
                </>
              )}
            </button>
          </form>
        </div>

        {/* Modal de confirmação */}
        {showConfirmModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => !loading && setShowConfirmModal(false)}
              aria-hidden="true"
            />
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200/60 sm:p-8">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h2 id="modal-title" className="text-lg font-bold text-slate-800">
                  Confirme os dados
                </h2>
                <button
                  type="button"
                  onClick={() => !loading && setShowConfirmModal(false)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <p><span className="font-semibold text-slate-600">Número/Ano:</span> {form.NUMERO_FATURA}/{form.ANO_FATURA}</p>
                <p><span className="font-semibold text-slate-600">Vencimento:</span> {form.DATA_VENCIMENTO ? formatDateToBR(form.DATA_VENCIMENTO) : ""}</p>
                <p><span className="font-semibold text-slate-600">Tipo:</span> {form.TIPO}</p>
                <p><span className="font-semibold text-slate-600">Documento:</span> {docDisplayValue}</p>
                <p><span className="font-semibold text-slate-600">Destinatário:</span> {form.DESTINATARIO_NOME}</p>
                <p><span className="font-semibold text-slate-600">Valor:</span> R$ {form.VALOR_NUMERICO} — {form.VALOR_EXTENSO}</p>
                <p><span className="font-semibold text-slate-600">Descrição:</span> {form.DESCRICAO?.slice(0, 80)}{form.DESCRICAO && form.DESCRICAO.length > 80 ? "…" : ""}</p>
              </div>
              {error && (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </p>
              )}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={loading}
                  className="rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  disabled={loading}
                  className="btn-primary gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Confirmar e gerar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-slate-500">
          © 2026 Bismarchi Pires Advogados. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
