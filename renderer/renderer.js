/* ── IIFE wrapper to avoid global scope collision with i18n.js ──────────── */
(function () {
'use strict';

/* ── State ────────────────────────────────────────────────────────────────── */
const state = {
  step: 1,
  filePath: null,
  fileInfo: null,
  selectedFormat: null,
  advancedOptions: {},
  outputDir: null,
};

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const t = key => window.i18n.t(key);

/* ── Init ─────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  window.i18n.applyTranslations();
  updateLangToggle();

  const dir = await window.api.getDownloadsPath();
  state.outputDir = dir;

  setupDragDrop();
  setupLangToggle();
  setupStepListeners();
  setupStep3Listeners();
  setupConvertDoneListener();

  goToStep(1);
});

/* ── Language ─────────────────────────────────────────────────────────────── */
function updateLangToggle() {
  const btn = $('langToggle');
  if (btn) btn.textContent = t('langToggle');
}

function setupLangToggle() {
  const btn = $('langToggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const next = window.i18n.getLang() === 'zh-TW' ? 'en' : 'zh-TW';
    window.i18n.setLang(next);
    updateLangToggle();
    if (state.step === 2) renderSettingsStep();
  });
}

/* ── Steps ────────────────────────────────────────────────────────────────── */
function goToStep(n) {
  state.step = n;
  [1, 2, 3].forEach(i => {
    $(`step${i}Panel`)?.classList.toggle('active', i === n);
    const dot = $(`stepDot${i}`);
    if (dot) {
      dot.classList.toggle('active', i === n);
      dot.classList.toggle('done', i < n);
    }
  });
}

/* ── Drag & Drop ──────────────────────────────────────────────────────────── */
function setupDragDrop() {
  const zone   = $('dropZone');
  const input  = $('fileInput');
  const dropBtn = $('dropBtn');

  zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', async e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const filePath = getFilePath(file);
    await handleFileDetect(filePath);
  });

  zone.addEventListener('click', e => {
    if (e.target !== dropBtn) input.click();
  });
  dropBtn.addEventListener('click', e => { e.stopPropagation(); input.click(); });

  input.addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    await handleFileDetect(getFilePath(file));
    input.value = '';
  });
}

function getFilePath(file) {
  if (window.api?.getPathForFile) return window.api.getPathForFile(file);
  return file.path || '';
}

/* ── File Detection ───────────────────────────────────────────────────────── */
async function handleFileDetect(filePath) {
  if (!filePath) { alert(t('detectFailed')); return; }

  $('dropZone').style.display = 'none';
  $('fileInfo').style.display = '';
  $('fileInfo').innerHTML = `<p style="color:var(--text-3);font-size:13px">…</p>`;

  const result = await window.api.detectFile(filePath);
  if (!result.success) {
    $('dropZone').style.display = '';
    $('fileInfo').style.display = 'none';
    alert(`${t('detectFailed')}：${result.error}`);
    return;
  }

  state.filePath  = filePath;
  state.fileInfo  = result.data;
  renderFileInfo(result.data);
}

function renderFileInfo(info) {
  const duration = info.duration ? fmtDuration(info.duration) : '--';
  const lang = window.i18n.getLang();
  const none = lang === 'zh-TW' ? '無' : 'None';

  const videoDesc = info.video
    ? `${(info.video.codec || '').toUpperCase()} ${info.video.width ? `${info.video.width}×${info.video.height}` : ''}`.trim()
    : none;
  const audioDesc = info.audio
    ? `${(info.audio.codec || '').toUpperCase()} ${info.audio.sampleRate ? `${(info.audio.sampleRate/1000).toFixed(1)}kHz` : ''}`.trim()
    : none;

  $('fileInfo').innerHTML = `
    <div class="file-name">${esc(info.filename || filePart(state.filePath))}</div>
    <div class="meta-chips">
      <span class="meta-chip">${t('metaDuration')}: ${duration}</span>
      <span class="meta-chip">${t('metaVideo')}: ${videoDesc}</span>
      <span class="meta-chip">${t('metaAudio')}: ${audioDesc}</span>
      <span class="meta-chip">${t('metaFileSize')}: ${fmtSize(info.size)}</span>
    </div>
    <div class="file-actions">
      <button class="btn-secondary btn-sm" id="changeFileBtn">${t('fileInfoChange')}</button>
      <button class="btn-primary" id="nextBtn">${t('fileInfoNext')}</button>
    </div>`;

  $('changeFileBtn').addEventListener('click', resetToStep1);
  $('nextBtn').addEventListener('click', () => { renderSettingsStep(); goToStep(2); });
}

function resetToStep1() {
  state.filePath = null;
  state.fileInfo = null;
  state.selectedFormat = null;
  state.advancedOptions = {};
  $('dropZone').style.display = '';
  $('fileInfo').style.display  = 'none';
  $('fileInfo').innerHTML = '';
  goToStep(1);
}

/* ── Settings Step ────────────────────────────────────────────────────────── */
function renderSettingsStep() {
  const isAudio = state.fileInfo?.video === null && state.fileInfo?.audio !== null;
  const defaultTab = isAudio ? 'audio' : 'all';
  renderFormatTabs(defaultTab);
  renderFormatGrid(defaultTab);
  renderOutputDir();
  window.i18n.applyTranslations();
}

function renderFormatTabs(activeTab) {
  const tabs = [
    { id: 'all',   key: 'tabAll' },
    { id: 'video', key: 'tabVideo' },
    { id: 'audio', key: 'tabAudio' },
  ];
  $('formatTabs').innerHTML = tabs.map(tab =>
    `<button class="tab-btn${tab.id === activeTab ? ' active' : ''}" data-tab="${tab.id}">${t(tab.key)}</button>`
  ).join('');
  $('formatTabs').querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $('formatTabs').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderFormatGrid(btn.dataset.tab);
    });
  });
}

async function renderFormatGrid(tab) {
  const lang = window.i18n.getLang();
  let formats = await window.api.getOutputFormats() || [];
  if (tab === 'audio') formats = formats.filter(f => f.type === 'audio');
  if (tab === 'video') formats = formats.filter(f => f.type === 'video');

  $('formatGrid').innerHTML = formats.map(f => {
    const short = (lang === 'en' && f.shortDescEn) ? f.shortDescEn : (f.shortDesc || '');
    const full  = (lang === 'en' && f.descriptionEn) ? f.descriptionEn : f.description;
    return `<div class="format-card${state.selectedFormat === f.ext ? ' selected' : ''}" data-ext="${f.ext}">
      <span class="format-ext">.${f.ext}</span>
      <span class="format-label">${f.label}</span>
      <span class="format-tag">${esc(short)}</span>
      <div class="format-tooltip">${esc(full)}</div>
    </div>`;
  }).join('');

  $('formatGrid').querySelectorAll('.format-card').forEach(card => {
    card.addEventListener('click', () => {
      $('formatGrid').querySelectorAll('.format-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.selectedFormat = card.dataset.ext;
      state.advancedOptions = {};
      renderAdvancedPanel();
    });
  });
}

async function renderAdvancedPanel() {
  const panel = $('advancedPanel');
  if (!state.selectedFormat) { panel.innerHTML = ''; return; }
  const preset = await window.api.getPreset(state.selectedFormat);
  if (!preset) { panel.innerHTML = ''; return; }

  const lang = window.i18n.getLang();
  const presetDesc = (lang === 'en' && preset.descriptionEn) ? preset.descriptionEn : preset.description;

  let html = `
    <span class="preset-badge">${t('presetBadge')}</span>
    <p class="preset-desc">${esc(presetDesc || '')}</p>`;

  if (preset.advanced?.length) {
    html += `<details class="advanced-details"><summary>${t('advancedToggle')}</summary><div class="advanced-opts">`;
    preset.advanced.forEach(opt => {
      const label = (lang === 'en' && opt.labelEn) ? opt.labelEn : opt.label;
      const hint  = (lang === 'en' && opt.hintEn)  ? opt.hintEn  : opt.hint;
      const val   = state.advancedOptions[opt.key] ?? opt.default;
      html += `<div class="opt-row">
        <label class="opt-label">${esc(label)}</label>
        <select class="opt-select" data-key="${opt.key}">
          ${(opt.options || []).map(o => `<option value="${o}"${o == val ? ' selected' : ''}>${o}</option>`).join('')}
        </select>
        ${hint ? `<span class="opt-hint">${esc(hint)}</span>` : ''}
      </div>`;
    });
    html += `</div></details>`;
  }

  panel.innerHTML = html;
  panel.querySelectorAll('.opt-select').forEach(sel => {
    sel.addEventListener('change', () => { state.advancedOptions[sel.dataset.key] = sel.value; });
  });
}

function renderOutputDir() {
  const el = $('outputDirDisplay');
  if (el && state.outputDir) el.textContent = state.outputDir;
}

/* ── Step 2 / 3 Listeners ─────────────────────────────────────────────────── */
function setupStepListeners() {
  $('backBtn').addEventListener('click', () => goToStep(1));

  $('changeDirBtn').addEventListener('click', async () => {
    const dir = await window.api.selectOutputDir();
    if (dir) { state.outputDir = dir; renderOutputDir(); }
  });

  $('convertBtn').addEventListener('click', startConversion);
}

function setupStep3Listeners() {
  $('cancelBtn').addEventListener('click', () => {
    window.api.cancelConversion();
    resetToStep1();
  });

  $('openFolderBtn').addEventListener('click', () => {
    if (state.outputDir) window.api.openFolder(state.outputDir);
  });

  $('anotherBtn').addEventListener('click', resetToStep1);
  $('quitBtn').addEventListener('click', () => window.api.quitApp());

  $('retryBtn').addEventListener('click', () => { renderSettingsStep(); goToStep(2); });
  $('quitErrBtn').addEventListener('click', () => window.api.quitApp());
}

/* ── Progress / Done events ───────────────────────────────────────────────── */
function setupConvertDoneListener() {
  window.api.onProgress(data => {
    const bar = $('progressBar');
    const pct = $('progressPct');
    const tim = $('progressTime');
    if (bar) bar.style.width = `${data.pct}%`;
    if (pct) pct.textContent = `${data.pct}%`;
    if (tim && data.elapsed) tim.textContent = fmtDuration(data.elapsed);
  });

  // Conversion done is handled via await in startConversion()
}

function showStep3(mode) {
  $('progressSection').style.display = mode === 'progress' ? '' : 'none';
  $('doneSection').style.display      = mode === 'done'     ? '' : 'none';
  $('errorSection').style.display     = mode === 'error'    ? '' : 'none';
}

/* ── Conversion ───────────────────────────────────────────────────────────── */
async function startConversion() {
  if (!state.selectedFormat) { alert(t('noFormatSelected')); return; }
  if (!state.filePath || !state.outputDir) return;

  $('progressBar').style.width = '0%';
  $('progressPct').textContent = '0%';
  $('progressTime').textContent = '';
  goToStep(3);
  showStep3('progress');

  try {
    const result = await window.api.startConversion({
      inputPath: state.filePath,
      outputDir: state.outputDir,
      outputExt: state.selectedFormat,
      options: state.advancedOptions,
      duration: state.fileInfo?.duration || 0,
    });
    if (result.success) {
      const el = $('outFilePath');
      if (el) el.textContent = result.outputPath || '';
      showStep3('done');
    } else {
      const el = $('errorMsg');
      if (el) el.textContent = result.error || '';
      showStep3('error');
    }
  } catch (err) {
    const el = $('errorMsg');
    if (el) el.textContent = err.message || String(err);
    showStep3('error');
  }
}

/* ── Util ─────────────────────────────────────────────────────────────────── */
function fmtDuration(sec) {
  if (!sec || isNaN(sec)) return '--';
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    : `${m}:${String(s).padStart(2,'0')}`;
}
function fmtSize(bytes) {
  if (!bytes) return '--';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes/1048576).toFixed(1)} MB`;
  return `${(bytes/1073741824).toFixed(2)} GB`;
}
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function filePart(p) {
  return p ? p.split(/[/\\]/).pop() : '';
}

})(); // end IIFE
