/**
 * Template HTML do e-mail de fatura com identidade visual Bismarchi Pires.
 * Cores: branco gelo (bg), #101F2E (azul), #d5b170 (dourado).
 * Usa estilos inline para máxima compatibilidade com clientes de e-mail.
 */

const LOGO_URL =
  "https://www.bismarchipires.com.br/blog/wp-content/uploads/2025/07/Ativo-1LOGO-AZUL.png";

const BRANCO_GELO = "#f5f5f0";
const AZUL_ESCRITORIO = "#101F2E";
const DOURADO = "#d5b170";

export type EmailData = {
  NUMERO_FATURA: string;
  ANO_FATURA: string;
  DATA_VENCIMENTO_BR: string;
  MES_REFERENCIA: string;
  DESTINATARIO_NOME: string;
  VALOR_NUMERICO: string;
  VALOR_EXTENSO: string;
};

export function getEmailHtml(data: EmailData): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fatura ${data.NUMERO_FATURA}/${data.ANO_FATURA}</title>
</head>
<body style="margin:0; padding:0; background-color:${BRANCO_GELO}; font-family:'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRANCO_GELO}; padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:${BRANCO_GELO}; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(16,31,46,0.08); border:1px solid #e8e8e4;">
          <!-- Faixa superior: azul + dourado -->
          <tr>
            <td style="height:6px; background-color:${AZUL_ESCRITORIO};"></td>
          </tr>
          <tr>
            <td style="height:3px; background-color:${DOURADO};"></td>
          </tr>
          <!-- Logo -->
          <tr>
            <td style="padding:32px 40px 24px; text-align:center; background-color:#ffffff;">
              <img src="${LOGO_URL}" alt="Bismarchi Pires" width="220" height="auto" style="max-width:220px; height:auto; display:block; margin:0 auto;" />
            </td>
          </tr>
          <!-- Conteúdo -->
          <tr>
            <td style="padding:0 40px 32px; color:#334155; font-size:15px; line-height:1.6; background-color:#ffffff;">
              <p style="margin:0 0 16px;">Prezados(as),</p>
              <p style="margin:0 0 24px;">Esperamos que estejam bem.</p>
              <p style="margin:0 0 24px;">Segue anexo &quot;Nota Fiscal / Fatura Nº <strong style="color:${AZUL_ESCRITORIO};">${data.NUMERO_FATURA}/${data.ANO_FATURA}</strong>&quot;, referente à prestação de serviços advocatícios pela Bismarchi Pires Sociedade de Advogados.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px; background-color:${BRANCO_GELO}; border-radius:8px; border:2px solid ${DOURADO};">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 8px;"><span style="color:#64748b; font-size:13px;">Valor</span><br/><strong style="color:${AZUL_ESCRITORIO};">R$ ${data.VALOR_NUMERICO}</strong> <span style="color:#64748b; font-size:14px;">(${data.VALOR_EXTENSO})</span></p>
                    <p style="margin:0 0 8px;"><span style="color:#64748b; font-size:13px;">Vencimento</span><br/><strong style="color:${AZUL_ESCRITORIO};">${data.DATA_VENCIMENTO_BR}</strong></p>
                    <p style="margin:0;"><span style="color:#64748b; font-size:13px;">Mês referência</span><br/><strong style="color:${AZUL_ESCRITORIO};">${data.MES_REFERENCIA}</strong></p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 12px; font-weight:700; font-size:13px; text-transform:uppercase; letter-spacing:0.5px; color:${DOURADO};">Dados para pagamento</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px; background-color:${AZUL_ESCRITORIO}; border-radius:8px; border-left:4px solid ${DOURADO};">
                <tr>
                  <td style="padding:20px; color:#ffffff; font-size:14px; line-height:1.7;">
                    <strong>Banco Santander</strong><br/>
                    Ag. 4192 | Cc. 130022008<br/>
                    CNPJ 26.080.152/0001-35<br/>
                    Pix 19981004389 (Celular)<br/>
                    Bismarchi Pires Sociedade de Advogados
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 24px;">Quaisquer dúvidas, nossa equipe estará à disposição para auxiliá-los no que for necessário.</p>
              <p style="margin:0; color:${AZUL_ESCRITORIO}; font-weight:600;">Atenciosamente,</p>
              <p style="margin:8px 0 0; font-size:14px; color:#64748b;">Bismarchi Pires Sociedade de Advogados</p>
            </td>
          </tr>
          <!-- Rodapé -->
          <tr>
            <td style="padding:20px 40px; background-color:${BRANCO_GELO}; border-top:2px solid ${DOURADO}; text-align:center; font-size:12px; color:${AZUL_ESCRITORIO};">
              © 2026 Bismarchi Pires Advogados. Todos os direitos reservados.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

export function getEmailPlainText(data: EmailData): string {
  return `Prezados(as),

Esperamos que estejam bem.

Segue anexo "Nota Fiscal / Fatura Nº ${data.NUMERO_FATURA}/${data.ANO_FATURA}", referente à prestação de serviços advocatícios pela Bismarchi Pires Sociedade de Advogados.

Valor: R$ ${data.VALOR_NUMERICO} (${data.VALOR_EXTENSO})
Vencimento: ${data.DATA_VENCIMENTO_BR}
Mês referência: ${data.MES_REFERENCIA}

DADOS PARA PAGAMENTO

Dados Bancários:
Banco Santander
Ag. 4192
Cc. 130022008
CNPJ. 26.080.152/0001-35
Pix 19981004389 (Celular)
Bismarchi Pires Sociedade de Advogados

Quaisquer dúvidas, nossa equipe estará à disposição para auxiliá-los no que for necessário.

Atenciosamente,
Bismarchi Pires Sociedade de Advogados`;
}
