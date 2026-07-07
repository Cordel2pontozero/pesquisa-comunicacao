# Pesquisa Cordel 2.0 — verificação de proposta de valor

Pesquisa **interna** para avaliar como o Cordel 2.0 comunica sua proposta de valor:
um vídeo de 1 minuto + duas perguntas de seleção múltipla (uma exclusiva, uma não exclusiva).

Site estático (HTML + CSS + JS puro) + backend Google Apps Script que grava numa planilha do Google Sheets.

- **Repositório:** <https://github.com/Cordel2pontozero/pesquisa-comunicacao>
- **Domínio:** <https://pesquisa.cordel2pontozero.com> (GitHub Pages + CNAME)

## Estrutura

```
pesquisa-cordel2/
├─ index.html      → estrutura das 4 partes (identificação, vídeo, valor, problemas)
├─ style.css       → paleta arara + Fraunces/Inter
├─ app.js          → injeta as 30 problemáticas, valida e envia
├─ Code.gs         → Apps Script: recebe POST, grava em planilha, exporta xlsx
└─ README.md
```

## Deploy do backend (Apps Script)

1. Abra <https://script.google.com> → **Novo projeto**.
2. Cole o conteúdo de `Code.gs` em `Código.gs` e salve.
3. **Implantar → Nova implantação → Aplicativo da Web**
   - Executar como: **Eu**
   - Quem tem acesso: **Qualquer pessoa** *(necessário para o formulário público)*
4. Copie a URL terminada em `/exec`.
5. Cole essa URL na constante `ENDPOINT` em `app.js`.

Ao editar `Code.gs` depois:
**Gerenciar implantações → Editar (ícone de lápis) → Versão: Nova → Implantar.**
A URL `/exec` permanece a mesma; só publica a nova versão.

## Publicação do front

Padrão idêntico ao `orcamento.cordel2pontozero.com`:

```cmd
:: no diretório do projeto
git init
git add .
git commit -m "pesquisa v1"
git branch -M main
git remote add origin https://github.com/Cordel2pontozero/pesquisa-comunicacao.git
git push -u origin main
```

O arquivo `CNAME` (na raiz) já fixa o domínio `pesquisa.cordel2pontozero.com`. No repositório:
**Settings → Pages → Deploy from branch → main / root**. Depois crie o registro no seu DNS:

```
pesquisa   CNAME   cordel2pontozero.github.io.
```

Aguarde o certificado SSL do GitHub Pages liberar (~10 min).

## Vídeo do YouTube

Em `index.html`, troque `VIDEO_ID_AQUI` pelo ID do vídeo (o trecho após `v=` no link do YouTube). Manter `youtube-nocookie.com` protege mais a privacidade do respondente (LGPD).

## Coluna a coluna na planilha

| # | Coluna | O que grava |
|---|---|---|
| 1 | Timestamp (ISO) | Do cliente |
| 2 | Recebido em (BRT) | Do servidor, fuso Bahia |
| 3 | Nome | Parte 1 |
| 4 | Instituição | Parte 1 |
| 5 | E-mail | Parte 1 |
| 6 | Consentimento LGPD | sim/não |
| 7 | Proposta de valor (única) | Parte 3 |
| 8 | Proposta — "Outro" | Texto livre |
| 9 | Nº de problemas marcados | Parte 4 (contagem) |
| 10 | Problemas marcados | Parte 4 (separados por `\|`) |
| 11 | User-Agent | Diagnóstico |

## Snapshot em Excel

No editor do Apps Script, rode manualmente `exportarXlsx()` — gera um `.xlsx` no seu Drive raiz com data no nome do arquivo. Bom para arquivamento e uso offline.

## LGPD

- Campo de consentimento explícito (parte 1) obrigatório.
- `youtube-nocookie.com` no iframe.
- Sem cookies próprios, sem analytics de terceiros.
- Dados ficam num Sheets sob a conta Google do Cordel 2.0 (base de titular).

## Testar local

Basta abrir `index.html` no navegador. Sem build. O envio só funciona após configurar a `ENDPOINT` do Apps Script.
