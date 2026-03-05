# Documentação do Sistema – Fatura Bismarchi Pires

Documento único com todas as informações do projeto para uso no **ClickUp** (descrição do projeto, tarefas, checklist de deploy, etc.).

---

## 1. Visão geral do projeto

| Campo | Valor |
|-------|--------|
| **Nome** | Fatura BP (Bismarchi Pires) |
| **Tipo** | Aplicação web interna (financeiro) |
| **Objetivo** | Permitir que o setor financeiro preencha os dados da fatura e gere o documento Word (DOCX) a partir de um template, com opção de copiar e-mail em HTML para envio ao cliente. |
| **Repositório** | https://github.com/LeoMarquesSilva/fatura-bp |
| **Deploy** | Vercel (produção) |
| **Versão** | 0.1.0 |

---

## 2. Stack técnico

| Camada | Tecnologia |
|--------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Linguagem** | TypeScript |
| **UI** | React 18, Tailwind CSS |
| **Ícones** | Lucide React |
| **Utilitários** | clsx (classes condicionais) |
| **Geração DOCX** | docxtemplater + Pizzip |
| **Node** | >= 18.x (definido em `package.json` → engines) |

**Scripts npm:**
- `npm run dev` — desenvolvimento (localhost:3000)
- `npm run build` — build de produção
- `npm start` — rodar build de produção
- `npm run lint` — lint (Next.js)

---

## 3. Funcionalidades (escopo atual)

### 3.1 Formulário
- **Campos:** Número da fatura, Ano, Data de vencimento, Tipo, CPF/CNPJ do destinatário, Nome do destinatário, Valor (numérico), Valor por extenso, Descrição.
- **CPF/CNPJ:** Alternância entre CPF e CNPJ; máscara automática (xxx.xxx.xxx-xx / xx.xxx.xxx/xxxx-xx); validação de dígitos e algoritmo (CPF e CNPJ válidos).
- **Valor:** Formatação com vírgula decimal; **valor por extenso** preenchido automaticamente ao digitar o valor.
- **Data:** Campo de data; formatação e uso para nome do arquivo e e-mail.
- **Validação:** Mensagens de erro por campo (obrigatórios, formato, CPF/CNPJ inválido, valor positivo).
- **Modal de confirmação** antes de enviar os dados para a API.

### 3.2 Geração do documento
- **API:** `POST /api/gerar-fatura` recebe o JSON com os dados e devolve um arquivo **.docx** (Content-Disposition: attachment).
- **Template:** Arquivo **INFO_FATURA_BP.docx** na raiz do projeto ou em `templates/`. Variáveis no Word: `{NUMERO_FATURA}`, `{ANO_FATURA}`, `{DESTINATARIO_NOME}`, `{TIPO}`, `{DESTINATARIO_CNPJ_CPF}`, `{VALOR_NUMERICO}`, `{VALOR_EXTENSO}`, `{DATA_VENCIMENTO}`, `{DESCRICAO}`.
- **Nome do arquivo gerado:** `{NUMERO_FATURA}_{NOME_CLIENTE}_{MES}.docx` (ex.: `45_GrupoPetra_jan.docx`). Nome do cliente sanitizado (sem caracteres especiais, espaços viram `_`).

### 3.3 E-mail (pós-geração)
- Após sucesso, é exibida uma **tela de sucesso** com:
  - **Template de e-mail em HTML** (identidade visual do escritório, logo).
  - Botão **"Copiar como HTML"** para colar no cliente de e-mail.
  - Opção de **texto plano** para copiar, se necessário.
- O conteúdo do e-mail usa os dados da fatura gerada (valor, vencimento, nome, etc.).

### 3.4 Identidade visual e PWA
- **Favicon** e ícones (16x16, 32x32, apple-touch-icon, android-chrome 192/512) em `public/`.
- **site.webmanifest** em `public/site.webmanifest` (nome: "Fatura - Bismarchi Pires", short_name: "Fatura BP") para instalação como PWA/atalho.

---

## 4. Estrutura de pastas e arquivos

```
fatura/
├── app/
│   ├── api/
│   │   └── gerar-fatura/
│   │       └── route.ts      # POST: gera o DOCX a partir do template
│   ├── globals.css           # Estilos globais (Tailwind)
│   ├── layout.tsx            # Layout raiz + metadata + favicon
│   └── page.tsx              # Página do formulário + sucesso + e-mail
├── lib/
│   ├── date.ts               # formatDateToBR, getMesReferencia, getMesAbrev
│   ├── email-template.ts     # getEmailHtml, getEmailPlainText (template e-mail)
│   ├── extenso.ts            # valorPorExtenso, parseValorBr
│   ├── fatura-pdf-html.ts    # HTML para PDF (não usado na rota atual)
│   ├── mask.ts               # formatCPF, formatCNPJ, onlyDigits, formatDoc
│   └── validacao.ts          # validarCPF, validarCNPJ, validarDoc
├── public/
│   ├── favicon.ico
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── apple-touch-icon.png
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   └── site.webmanifest
├── templates/
│   └── .gitkeep              # (opcional) INFO_FATURA_BP.docx pode ficar aqui
├── INFO_FATURA_BP.docx       # Template Word (raiz ou templates/)
├── next.config.mjs
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── vercel.json               # framework: nextjs, buildCommand
├── .gitignore
└── README.md
```

---

## 5. API – Contrato

### POST `/api/gerar-fatura`

**Request:**  
- **Content-Type:** `application/json`  
- **Body (JSON):**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|------------|-----------|
| NUMERO_FATURA | string | Sim | Número da fatura |
| ANO_FATURA | string | Sim | Ano (4 dígitos) |
| DESTINATARIO_NOME | string | Sim | Nome do destinatário |
| TIPO | string | Sim | Tipo (ex.: Pessoa Física / Jurídica) |
| DESTINATARIO_CNPJ_CPF | string | Sim | CPF ou CNPJ (pode vir formatado) |
| VALOR_NUMERICO | string | Sim | Valor (ex.: "1.500,00") |
| VALOR_EXTENSO | string | Sim | Valor por extenso |
| DATA_VENCIMENTO | string | Sim | Data (YYYY-MM-DD ou DD/MM/YYYY) |
| DESCRICAO | string | Sim | Descrição dos serviços |

**Response – Sucesso (200):**  
- **Content-Type:** `application/vnd.openxmlformats-officedocument.wordprocessingml.document`  
- **Content-Disposition:** `attachment; filename="NUMERO_NOME_MES.docx"`  
- **Body:** binário do arquivo DOCX.

**Response – Erro (400/500):**  
- **Content-Type:** `application/json`  
- **Body:** `{ "error": "mensagem" }`  
- Ex.: template não encontrado, dados obrigatórios faltando, falha no docxtemplater.

---

## 6. Configuração e uso (checklist para ClickUp)

### 6.1 Desenvolvimento local
- [ ] Clonar repositório: `git clone https://github.com/LeoMarquesSilva/fatura-bp.git`
- [ ] Entrar na pasta: `cd fatura-bp`
- [ ] Instalar dependências: `npm install`
- [ ] Garantir que **INFO_FATURA_BP.docx** está na raiz ou em `templates/`
- [ ] Rodar: `npm run dev`
- [ ] Acessar: http://localhost:3000

### 6.2 Build e produção local
- [ ] `npm run build`
- [ ] `npm start`
- [ ] Testar geração de DOCX e download

### 6.3 Deploy na Vercel
- [ ] Projeto conectado ao repositório GitHub (branch `main`)
- [ ] **Framework Preset:** Next.js
- [ ] **Output Directory:** vazio (não preencher)
- [ ] **Build Command:** `npm run build` (ou deixar padrão)
- [ ] **Node version:** 18.x ou superior (respeitado via `engines` no package.json)
- [ ] Template **INFO_FATURA_BP.docx** commitado na raiz ou em `templates/`
- [ ] Após deploy, testar: abrir a URL, preencher formulário, gerar DOCX e copiar e-mail

### 6.4 Manutenção
- [ ] Atualizar template Word quando houver mudança de layout ou variáveis
- [ ] Se adicionar variáveis no DOCX, atualizar tipo `FaturaPayload` em `app/api/gerar-fatura/route.ts` e o formulário em `app/page.tsx`

---

## 7. Dependências (package.json)

**Produção:**
- next 14.2.18
- react 18.3.1, react-dom 18.3.1
- docxtemplater ^3.50.0
- pizzip ^3.1.7
- lucide-react ^0.460.0
- clsx ^2.1.1

**Desenvolvimento:**
- typescript ^5.6.3
- @types/node, @types/react, @types/react-dom
- tailwindcss ^3.4.15
- autoprefixer, postcss

---

## 8. Observações importantes

- **Apenas DOCX:** O sistema não gera PDF. Conversão DOCX → PDF exigiria serviço externo (ex.: Gotenberg) ou binários (LibreOffice/Word), incompatíveis com Vercel serverless.
- **Template único:** O nome do template é fixo (`INFO_FATURA_BP.docx`). Caminhos testados: `templates/INFO_FATURA_BP.docx` e raiz.
- **Sem autenticação:** O app é aberto; se precisar de login, será necessário adicionar (ex.: NextAuth, Auth0).
- **Sem histórico:** Não há banco de dados; não há lista de faturas geradas. Cada geração é independente.

---

## 9. Ideias de evolução (backlog / ClickUp)

- [ ] Autenticação (login para equipe financeira)
- [ ] Histórico de faturas (banco de dados ou planilha)
- [ ] Envio de e-mail direto pela aplicação (SMTP ou serviço)
- [ ] Múltiplos templates (escolher modelo antes de gerar)
- [ ] Geração de PDF via API externa (ex.: Gotenberg) como opção
- [ ] Campos adicionais no formulário e no template Word

---

## 10. Texto curto para “Descrição do projeto” no ClickUp

**Copiar e colar:**

> Sistema web (Next.js 14 + TypeScript) para o financeiro do escritório Bismarchi Pires preencher dados da fatura e gerar o documento em Word (DOCX) a partir do template INFO_FATURA_BP.docx. Inclui validação de CPF/CNPJ, valor por extenso automático, modal de confirmação e tela de sucesso com template de e-mail em HTML para copiar. Deploy na Vercel. Repo: https://github.com/LeoMarquesSilva/fatura-bp

---

*Documento gerado para uso no ClickUp. Atualizar conforme mudanças no projeto.*
