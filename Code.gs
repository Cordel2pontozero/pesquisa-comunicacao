/**
 * Cordel 2.0 — Pesquisa de valor
 * Backend Google Apps Script
 *
 * Recebe POST (text/plain com JSON no corpo) do formulário e grava na planilha.
 *
 * DEPLOY:
 *  1. Abra script.google.com → Novo projeto → cole este código.
 *  2. Recursos → Serviços → nenhum extra necessário.
 *  3. Ajuste SHEET_ID (opcional): se vazio, cria/anexa na planilha vinculada
 *     ao próprio projeto (script.google.com armazena vinculada quando criado
 *     a partir de uma planilha).
 *  4. Deploy → Nova implantação → tipo: Aplicativo da Web
 *       - Executar como: eu (seu@email)
 *       - Quem tem acesso: qualquer pessoa (necessário para o form público)
 *  5. Copie a URL /exec e cole em app.js na constante ENDPOINT.
 *  6. Ao mudar o código, use "Gerenciar implantações → Editar → Nova versão"
 *     para publicar a alteração (a URL /exec continua a mesma).
 */

const SHEET_ID = ''; // ← opcional. Vazio = usa a planilha atual (bound script).
const SHEET_NAME = 'Respostas';

// Cabeçalhos das colunas (a ordem manda)
const HEADERS = [
  'Timestamp (ISO)',
  'Recebido em (BRT)',
  'Nome',
  'Instituição',
  'Cidade/UF',
  'E-mail',
  'Consentimento LGPD',
  'Proposta de valor (única)',
  'Proposta de valor — "Outro"',
  'Nº de problemas marcados',
  'Problemas marcados',
  'User-Agent'
];

/**
 * Endpoint principal — recebe o POST do formulário.
 */
function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents;
    if (!raw) return _json({ status: 'erro', message: 'Corpo vazio.' });

    const p = JSON.parse(raw);
    const sheet = _getSheet();

    // Garante cabeçalhos na primeira execução
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length)
        .setFontWeight('bold')
        .setBackground('#B4231C')
        .setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }

    const brt = Utilities.formatDate(new Date(), 'America/Bahia', 'yyyy-MM-dd HH:mm:ss');

    sheet.appendRow([
      p.timestamp || new Date().toISOString(),
      brt,
      p.nome || '',
      p.instituicao || '',
      p.cidade_uf || '',
      p.email || '',
      p.consentimento || '',
      p.valor || '',
      p.valor_outro || '',
      p.problemas_total || 0,
      p.problemas || '',
      p.user_agent || ''
    ]);

    return _json({ status: 'ok' });
  } catch (err) {
    return _json({ status: 'erro', message: String(err) });
  }
}

/**
 * GET opcional — resposta simples para checar se o Web App está no ar.
 */
function doGet() {
  return _json({ status: 'ok', service: 'Cordel 2.0 · Pesquisa de valor' });
}

// ---------- helpers ----------
function _getSheet() {
  const ss = SHEET_ID
    ? SpreadsheetApp.openById(SHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  return sh;
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Utilitário: gera arquivo Excel (.xlsx) com todas as respostas.
 * Rode manualmente no editor do Apps Script quando quiser um snapshot.
 */
function exportarXlsx() {
  const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  const url = 'https://docs.google.com/spreadsheets/d/' + ss.getId() +
              '/export?format=xlsx';
  const blob = UrlFetchApp.fetch(url, {
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }
  }).getBlob().setName('pesquisa-cordel2-' + new Date().toISOString().slice(0, 10) + '.xlsx');
  const folder = DriveApp.getRootFolder();
  const file = folder.createFile(blob);
  Logger.log('Arquivo salvo: ' + file.getUrl());
  return file.getUrl();
}
