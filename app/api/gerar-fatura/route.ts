import Docxtemplater from "docxtemplater";
import { NextRequest, NextResponse } from "next/server";
import PizZip from "pizzip";
import path from "path";
import fs from "fs";

export type FaturaPayload = {
  NUMERO_FATURA: string;
  ANO_FATURA: string;
  DESTINATARIO_NOME: string;
  TIPO: string;
  DESTINATARIO_CNPJ_CPF: string;
  VALOR_NUMERICO: string;
  VALOR_EXTENSO: string;
  DATA_VENCIMENTO: string;
  DESCRICAO: string;
};

const TEMPLATE_NAME = "INFO_FATURA_BP.docx";
const TEMPLATE_CANDIDATES = [
  path.join(process.cwd(), "templates", TEMPLATE_NAME),
  path.join(process.cwd(), TEMPLATE_NAME),
];

const MESES_ABREV = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

function getTemplatePath(): string | null {
  for (const p of TEMPLATE_CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function toDateBR(dateStr: string): string {
  if (!dateStr?.trim()) return dateStr;
  const s = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-");
    return `${d}/${m}/${y}`;
  }
  return s;
}

function getMesAbrev(dateStr: string): string {
  if (!dateStr?.trim()) return "";
  const s = dateStr.trim();
  let month: number;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    month = parseInt(s.slice(5, 7), 10);
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    month = parseInt(s.slice(3, 5), 10);
  } else return "";
  if (month < 1 || month > 12) return "";
  return MESES_ABREV[month - 1];
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as FaturaPayload;

    const {
      NUMERO_FATURA,
      ANO_FATURA,
      DESTINATARIO_NOME,
      TIPO,
      DESTINATARIO_CNPJ_CPF,
      VALOR_NUMERICO,
      VALOR_EXTENSO,
      DATA_VENCIMENTO,
      DESCRICAO,
    } = body;

    if (
      !NUMERO_FATURA ||
      !ANO_FATURA ||
      !DESTINATARIO_NOME ||
      !TIPO ||
      !DESTINATARIO_CNPJ_CPF ||
      !VALOR_NUMERICO ||
      !VALOR_EXTENSO ||
      !DATA_VENCIMENTO ||
      !DESCRICAO
    ) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios." },
        { status: 400 }
      );
    }

    const templatePath = getTemplatePath();
    if (!templatePath) {
      return NextResponse.json(
        {
          error:
            "Template não encontrado. Coloque INFO_FATURA_BP.docx na raiz do projeto ou na pasta templates/.",
        },
        { status: 503 }
      );
    }

    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    const dataVencimentoBR = toDateBR(DATA_VENCIMENTO);

    doc.render({
      NUMERO_FATURA,
      ANO_FATURA,
      DESTINATARIO_NOME,
      TIPO,
      DESTINATARIO_CNPJ_CPF,
      VALOR_NUMERICO,
      VALOR_EXTENSO,
      DATA_VENCIMENTO: dataVencimentoBR,
      DESCRICAO,
    });

    const buf = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    const safeName = (DESTINATARIO_NOME || "fatura")
      .replace(/[^a-zA-Z0-9\s\-àáâãäéèêëíìîïóòôõöúùûüçÀÁÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ]/g, "")
      .replace(/\s+/g, "_")
      .trim() || "fatura";
    const mes = getMesAbrev(DATA_VENCIMENTO);
    const filename = `${NUMERO_FATURA}_${safeName}_${mes}.docx`;

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Erro ao gerar fatura:", err);
    return NextResponse.json(
      { error: "Erro ao gerar o documento. Verifique o template e os dados." },
      { status: 500 }
    );
  }
}
