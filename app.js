/* =========================================================
   Cordel 2.0 · Pesquisa de valor · app.js
   - Injeta a lista de 30 problemáticas (parte 4)
   - Habilita/desabilita o campo "Outro" da parte 3
   - Envia respostas ao backend Apps Script como text/plain
     (evita preflight CORS — padrão consagrado com Google Apps Script)
   ========================================================= */

// >>> AJUSTE AQUI depois de publicar o Web App do Apps Script <<<
const ENDPOINT = 'https://script.google.com/macros/s/AKfycbyOK3LBs_IlU3R5Lqrtf03yNorSf-v0_PhYWWVivixML5y8af4p8z0uiIZJ1-mPSbyN/exec';

// -----------------------------------------------------------
// Habilitar/desabilitar campo "Outro" da parte 3
// -----------------------------------------------------------
function bindValorOutro() {
  const outroRadio = document.getElementById('valor-outro');
  const outroInput = document.getElementById('valor-outro-texto');
  document.querySelectorAll('input[name="valor"]').forEach(r => {
    r.addEventListener('change', () => {
      const active = outroRadio.checked;
      outroInput.disabled = !active;
      if (active) outroInput.focus();
      else outroInput.value = '';
    });
  });
}

// -----------------------------------------------------------
// Barra de progresso — 6 marcos obrigatórios (= pronto para enviar)
// -----------------------------------------------------------
function setProgress(pct) {
  const fill = document.getElementById('progress-fill');
  const bar = document.getElementById('progress');
  fill.style.width = pct + '%';
  bar.setAttribute('aria-valuenow', String(pct));
}

function updateProgress() {
  const form = document.getElementById('survey');
  if (!form || form.hidden) return;
  const val = n => (form.elements[n] ? String(form.elements[n].value || '') : '').trim();
  const marcos = [
    val('nome').length > 0,
    val('instituicao').length > 0,
    val('cidade_uf').length > 0,
    /\S+@\S+\.\S+/.test(val('email')),
    !!(form.elements['consentimento'] && form.elements['consentimento'].checked),
    !!form.querySelector('input[name="valor"]:checked')
  ];
  const feitos = marcos.filter(Boolean).length;
  setProgress(Math.round((feitos / marcos.length) * 100));
}

// -----------------------------------------------------------
// Coletar formulário → objeto
// -----------------------------------------------------------
function coletar(form) {
  const fd = new FormData(form);
  return {
    timestamp: new Date().toISOString(),
    nome: (fd.get('nome') || '').toString().trim(),
    instituicao: (fd.get('instituicao') || '').toString().trim(),
    cidade_uf: (fd.get('cidade_uf') || '').toString().trim(),
    email: (fd.get('email') || '').toString().trim(),
    consentimento: fd.get('consentimento') ? 'sim' : 'não',
    valor: (fd.get('valor') || '').toString(),
    valor_outro: (fd.get('valor_outro') || '').toString().trim(),
    user_agent: navigator.userAgent
  };
}

// -----------------------------------------------------------
// Envio
// -----------------------------------------------------------
async function enviar(payload) {
  // text/plain evita preflight OPTIONS — Apps Script trata JSON no lado do servidor
  const resp = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
    redirect: 'follow'
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data = await resp.json().catch(() => ({}));
  if (data && data.status && data.status !== 'ok') {
    throw new Error(data.message || 'Erro no servidor');
  }
  return data;
}

// -----------------------------------------------------------
// Boot
// -----------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  bindValorOutro();

  const form = document.getElementById('survey');
  const status = document.getElementById('status');
  const btn = document.getElementById('btn-submit');

  // Barra de progresso: recalcula a cada digitação/seleção
  form.addEventListener('input', updateProgress);
  form.addEventListener('change', updateProgress);
  updateProgress();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'status';
    status.textContent = '';

    // validação nativa + regra do "Outro"
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const outroRadio = document.getElementById('valor-outro');
    const outroInput = document.getElementById('valor-outro-texto');
    if (outroRadio.checked && outroInput.value.trim().length < 3) {
      status.className = 'status err';
      status.textContent = 'Ao marcar "Outro" na parte 03, descreva em uma frase.';
      outroInput.focus();
      return;
    }

    const payload = coletar(form);
    btn.disabled = true;
    btn.textContent = 'Enviando…';

    try {
      await enviar(payload);
      setProgress(100);
      // Agradecimento cordial e personalizado pelo primeiro nome
      const primeiro = (payload.nome || '').split(/\s+/)[0];
      const titulo = document.querySelector('.thanks-title');
      if (titulo) titulo.textContent = primeiro ? `Muito obrigado, ${primeiro}! 🌵` : 'Muito obrigado! 🌵';
      form.reset();
      outroInput.disabled = true;
      // Troca o formulário pelo agradecimento cordial
      form.hidden = true;
      const obrigado = document.getElementById('obrigado');
      obrigado.hidden = false;
      obrigado.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      console.error(err);
      status.className = 'status err';
      status.textContent = 'Não conseguimos registrar agora. Tenta de novo em instantes, por favor.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Enviar respostas';
    }
  });
});
