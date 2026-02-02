# Sistema de Fatura – Bismarchi Pires

Sistema em **Next.js + React** para o financeiro preencher dados e gerar a fatura em **Word** (DOCX) a partir do modelo INFO_FATURA_BP.docx.

## O que faz

- Formulário com os mesmos campos que você usava no N8N.
- A API preenche o **template Word** (docxtemplater) com as variáveis e devolve o **.docx** para download.
- Nome do arquivo: `NUMERO_NOME_MES.docx` (ex.: `45_GrupoPetra_jan.docx`).
- E-mail em HTML para copiar e colar (identidade visual + logo).

## Como rodar

1. **Instalar dependências**
   ```bash
   npm install
   ```

2. **Template Word**
   - Coloque o arquivo **INFO_FATURA_BP.docx** na raiz do projeto ou na pasta **`templates/`**.
   - O documento deve usar as variáveis: `{NUMERO_FATURA}`, `{ANO_FATURA}`, `{DESTINATARIO_NOME}`, `{TIPO}`, `{DESTINATARIO_CNPJ_CPF}`, `{VALOR_NUMERICO}`, `{VALOR_EXTENSO}`, `{DATA_VENCIMENTO}`, `{DESCRICAO}`.

3. **Subir o projeto**
   ```bash
   npm run dev
   ```
   - Acesse: [http://localhost:3000](http://localhost:3000)

4. **Produção**
   ```bash
   npm run build
   npm start
   ```

## Deploy na Vercel

O projeto pode ser deployado na Vercel normalmente. O template Word (INFO_FATURA_BP.docx) deve estar na raiz ou em `templates/` no repositório para ser incluído no build.

## Estrutura

- `app/page.tsx` – Página do formulário (React).
- `app/api/gerar-fatura/route.ts` – Preenche o template Word e retorna o .docx.
- `lib/email-template.ts` – Template do e-mail (HTML) para copiar.

Se quiser, depois podemos adicionar autenticação, histórico de faturas ou envio por e-mail.
