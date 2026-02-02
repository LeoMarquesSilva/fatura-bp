/**
 * Template HTML da fatura para geração de PDF.
 * Cores: branco gelo, #101F2E (azul), #d5b170 (dourado).
 */

export type FaturaPdfData = {
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

const LOGO_URL =
  "https://www.bismarchipires.com.br/blog/wp-content/uploads/2025/07/Ativo-1LOGO-AZUL.png";
const BRANCO_GELO = "#f5f5f0";
const AZUL = "#101F2E";
const DOURADO = "#d5b170";

export function getFaturaPdfHtml(data: FaturaPdfData): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #333; background: ${BRANCO_GELO}; padding: 24px; }
    .container { max-width: 210mm; margin: 0 auto; background: #fff; padding: 32px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .top-bar { height: 6px; background: ${AZUL}; margin: -32px -32px 24px -32px; border-radius: 8px 8px 0 0; }
    .top-bar-gold { height: 3px; background: ${DOURADO}; margin: -24px -32px 20px -32px; }
    .logo { text-align: center; margin-bottom: 24px; }
    .logo img { max-width: 200px; height: auto; }
    h1 { font-size: 14pt; color: ${AZUL}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 20px; padding-bottom: 8px; border-bottom: 2px solid ${DOURADO}; }
    .field { margin-bottom: 12px; }
    .field-label { font-size: 10pt; color: #666; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px; }
    .field-value { font-size: 12pt; color: ${AZUL}; font-weight: 600; }
    .descricao { margin-top: 20px; padding: 16px; background: ${BRANCO_GELO}; border-left: 4px solid ${DOURADO}; border-radius: 4px; white-space: pre-wrap; }
    .bank { margin-top: 24px; padding: 16px; background: ${AZUL}; color: #fff; border-radius: 8px; font-size: 11pt; }
    .bank strong { color: ${DOURADO}; }
    .footer { margin-top: 28px; padding-top: 16px; border-top: 1px solid #e0e0e0; font-size: 10pt; color: #888; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="top-bar"></div>
    <div class="top-bar-gold"></div>
    <div class="logo">
      <img src="${LOGO_URL}" alt="Bismarchi Pires" />
    </div>
    <h1>Nota Fiscal / Fatura Nº ${data.NUMERO_FATURA}/${data.ANO_FATURA}</h1>
    <div class="field">
      <div class="field-label">Destinatário</div>
      <div class="field-value">${escapeHtml(data.DESTINATARIO_NOME)}</div>
    </div>
    <div class="field">
      <div class="field-label">CNPJ/CPF</div>
      <div class="field-value">${escapeHtml(data.DESTINATARIO_CNPJ_CPF)}</div>
    </div>
    <div class="field">
      <div class="field-label">Tipo</div>
      <div class="field-value">${escapeHtml(data.TIPO)}</div>
    </div>
    <div class="field">
      <div class="field-label">Valor</div>
      <div class="field-value">R$ ${escapeHtml(data.VALOR_NUMERICO)} (${escapeHtml(data.VALOR_EXTENSO)})</div>
    </div>
    <div class="field">
      <div class="field-label">Vencimento</div>
      <div class="field-value">${escapeHtml(data.DATA_VENCIMENTO)}</div>
    </div>
    <div class="field">
      <div class="field-label">Descrição</div>
      <div class="descricao">${escapeHtml(data.DESCRICAO)}</div>
    </div>
    <div class="bank">
      <strong>Dados para pagamento</strong><br/>
      Banco Santander | Ag. 4192 | Cc. 130022008<br/>
      CNPJ 26.080.152/0001-35 | Pix 19981004389 (Celular)<br/>
      Bismarchi Pires Sociedade de Advogados
    </div>
    <div class="footer">© 2026 Bismarchi Pires Advogados. Todos os direitos reservados.</div>
  </div>
</body>
</html>`.trim();
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(text).replace(/[&<>"']/g, (c) => map[c] ?? c);
}
