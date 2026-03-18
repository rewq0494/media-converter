/* ── State ───────────────────────────────────────────────────────────────── */
const state = {
  step: 1,
  filePath: null,
  fileInfo: null,
  selectedFormat: null,
  advancedOptions: {},
  outputDir: null,
  converting: false,
};

/* ── DOM Helpers ─────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const t = key => window.i18n.t(key);

/* ── Init ────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  window.i18n.applyTranslations();
  updateLangToggle();
  goToStep(1);
  const dir = await window.api.getDownloadsPath();
  state.outputDir = dir;
  renderOutputDir();
  setupDragDrop();
  setupListeners();
});

/* ── Language Toggle ─────────────────────────────────────────────────────── */
function updateLangToggle() {
  const btn = $('langToggle');
  if (btn) btn.textContent = t('langToggle');
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = $('langToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const next = window.i18n.getLang() === 'zh-TW' ? 'en' : 'zh-TW';
      window.i18n.setLang(next);
      updateLangToggle();
      // Re-render dynamic sections
      if (state.fileInfo) renderFormatGrid(state.fileInfo.type === 'audio' ? 'audio' : 'all');
      if (state.selectedFormat) renderAdvancedPanel();
      renderOutputDir();
    });
  }
});

/* ── Steps ───────────────────────────────────────────────────────────────── */
function goToStep(n) {
  state.step = n;
  [1, 2, 3].forEach(i => {
    const panel = $(`step${i}Panel`);
    if (panel) panel.classList.toggle('active', i === n);
    const dot = $(`stepDot${i}`);
    if (dot) {
      dot.classList.toggle('active', i === n);
      dot.classList.toggle('done', i < n);
    }
  });
}

/* ── Drag & Drop ─────────────────────────────────────────────────────────── */
function setupDragDrop() {
  const zone = $('dropZone');
  if (!zone) return;

  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', async e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    let filePath = '';
    if (window.api && window.api.getPathForFile) {
      filePath = window.api.getPathForFile(file);
    }
    if (!filePath) { filePath = file.path || ''; }
    if (!filePath) {
      await handleFileDetect(null);
      return;
    }
    await handleFileDetect(filePath);
  });

  $('fileInput').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    let filePath = '';
    if (window.api && window.api.getPathForFile) {
      filePath = window.api.getPathForFile(file);
    }
    if (!filePath) filePath = file.path || '';
    await handleFileDetect(filePath);
  });

  $('dropBtn').addEventListener('click', () => $('fileInput').click());
  $('changeFileBtn').addEventListener('click', () => { state.filePath = null; state.fileInfo = null; resetToStep1(); });
}

function resetToStep1() {
  $('fileInfo').style.display = 'none';
  $('dropZoneInner').style.display = '';
  goToStep(1);
}

/* ── File Detection ──────────────────────────────────────────────────────── */
async function handleFileDetect(filePath) {
  if (!filePath) {
    showError('detect-file', t('detectFailed'));
    return;
  }
  $('dropZoneInner').style.display = 'none';
  $('fileInfo').style.display = '';
  $('fileInfo').innerHTML = `<span style="opacity:.5">${t('detecting') || '…'}</span>`;

  const result = await window.api.detectFile(filePath);
  if (result.error) {
    $('fileInfo').style.display = 'none';
    $('dropZoneInner').style.display = '';
    alert(`${t('detectFailed')}：${result.error}`);
    return;
  }

  state.filePath = filePath;
  state.fileInfo = result;
  renderFileInfo(result);
}

function renderFileInfo(info) {
  const lang = window.i18n.getLang();
  const duration = info.duration ? formatDuration(info.duration) : '--';
  const videoDesc = info.videoStreams && info.videoStreams.length > 0
    ? info.videoStreams[0].codec_name?.toUpperCase() + (info.videoStreams[0].width ? ` ${info.videoStreams[0].width}×${info.videoStreams[0].height}` : '')
    : (lang === 'zh-TW' ? '無' : 'None');
  const audioDesc = info.audioStreams && info.audioStreams.length > 0
    ? info.audioStreams[0].codec_name?.toUpperCase() + (info.audioStreams[0].sample_rate ? ` ${(info.audioStreams[0].sample_rate/1000).toFixed(1)}kHz` : '')
    : (lang === 'zh-TW' ? '無' : 'None');
  const sizeText = info.size ? formatSize(info.size) : '--';

  $('fileInfo').innerHTML = `
    <div class="file-meta">
      <div class="file-name">${escapeHtml(info.filename || '')}</div>
      <div class="meta-chips">
        <span class="meta-chip">${t('metaDuration')}: ${duration}</span>
        <span class="meta-chip">${t('metaVideo')}: ${videoDesc}</span>
        <span class="meta-chip">${t('metaAudio')}: ${audioDesc}</span>
        <span class="meta-chip">${t('metaFileSize')}: ${sizeText}</span>
      </div>
    </div>
    <div class="file-actions">
      <button class="btn-secondary" id="changeFileBtn">${t('fileInfoChange')}</button>
      <button class="btn-primary" id="nextBtn">${t('fileInfoNext')}</button>
    </div>
  `;
  $('changeFileBtn').addEventListener('click', () => { state.filePath = null; state.fileInfo = null; resetToStep1(); });
  $('nextBtn').addEventListener('click', () => {
    renderSettingsStep();
    goToStep(2);
  });
}

/* ── Settings Step ───────────────────────────────────────────────────────── */
function renderSettingsStep() {
  const inputType = state.fileInfo && state.fileInfo.audioStreams && state.fileInfo.audioStreams.length > 0
    && (!state.fileInfo.videoStreams || state.fileInfo.videoStreams.length === 0)
    ? 'audio' : 'all';
  renderFormatTabs(inputType);
  renderFormatGrid(inputType);
  renderOutputDir();
  window.i18n.applyTranslations();
}

function renderFormatTabs(defaultTab) {
  const container = $('formatTabs');
  if (!container) return;
  const tabs = [
    { id: 'all', label: t('tabAll') },
    { id: 'video', label: t('tabVideo') },
    { id: 'audio', label: t('tabAudio') },
  ];
  container.innerHTML = tabs.map(tab =>
    `<button class="tab-btn${tab.id === defaultTab ? ' active' : ''}" data-tab="${tab.id}">${tab.label}</button>`
  ).join('');
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderFormatGrid(btn.dataset.tab);
    });
  });
}

async function renderFormatGrid(tab) {
  const result = await window.api.getFormats();
  let formats = result || [];
  if (tab === 'audio') formats = formats.filter(f => f.type === 'audio');
  else if (tab === 'video') formats = formats.filter(f => f.type === 'video');

  const lang = window.i18n.getLang();
  const grid = $('formatGrid');
  if (!grid) return;
  grid.innerHTML = formats.map(f => {
    const desc = lang === 'en' && f.descriptionEn ? f.descriptionEn : f.description;
    return `
      <div class="format-card${state.selectedFormat === f.ext ? ' selected' : ''}" data-ext="${f.ext}">
        <div class="format-ext">.${f.ext}</div>
        <div class="format-label">${f.label}</div>
        <div class="format-desc">${escapeHtml(desc || '')}</div>
      </div>`;
  }).join('');
  grid.querySelectorAll('.format-card').forEach(card => {
    card.addEventListener('click', () => {
      grid.querySelectorAll('.format-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.selectedFormat = card.dataset.ext;
      state.advancedOptions = {};
      renderAdvancedPanel();
    });
  });
}

async function renderAdvancedPanel() {
  const panel = $('advancedPanel');
  if (!panel || !state.selectedFormat) return;
  const preset = await window.api.getPreset(state.selectedFormat);
  if (!preset) return;

  const lang = window.i18n.getLang();
  const presetDesc = lang === 'en' && preset.descriptionEn ? preset.descriptionEn : preset.description;

  let html = `
    <div class="preset-badge">${t('presetBadge')}</div>
    <div class="preset-desc">${escapeHtml(presetDesc || '')}</div>
    <details class="advanced-details">
      <summary>${t('advancedToggle')}</summary>
      <div class="advanced-opts">`;

  (preset.advanced || []).forEach(opt => {
    const label = lang === 'en' && opt.labelEn ? opt.labelEn : opt.label;
    const hint  = lang === 'en' && opt.hintEn  ? opt.hintEn  : opt.hint;
    const val = state.advancedOptions[opt.key] !== undefined ? state.advancedOptions[opt.key] : opt.default;
    html += `
      <div class="opt-row">
        <label class="opt-label">${escapeHtml(label)}</label>
        <select class="opt-select" data-key="${opt.key}">
          ${(opt.options || []).map(o => `<option value="${o}"${o == val ? ' selected' : ''}>${o}</option>`).join('')}
        </select>
        ${hint ? `<span class="opt-hint">${escapeHtml(hint)}</span>` : ''}
      </div>`;
  });

  html += `</div></details>`;
  panel.innerHTML = html;
  panel.querySelectorAll('.opt-select').forEach(sel => {
    sel.addEventListener('change', () => { state.advancedOptions[sel.dataset.key] = sel.value; });
  });
}

/* ── Output Directory ────────────────────────────────────────────────────── */
function renderOutputDir() {
  const el = $('outputDirDisplay');
  if (el && state.outputDir) el.textContent = state.outputDir;
  window.i18n.applyTranslations();
}

/* ── Listeners ───────────────────────────────────────────────────────────── */
function setupListeners() {
  const backBtn = $('backBtn');
  if (backBtn) backBtn.addEventListener('click', () => goToStep(1));

  const changeDirBtn = $('changeDirBtn');
  if (changeDirBtn) changeDirBtn.addEventListener('click', async () => {
    const dir = await window.api.selectOutputDir();
    if (dir) { state.outputDir = dir; renderOutputDir(); }
  });

  const convertBtn = $('convertBtn');
  if (convertBtn) convertBtn.addEventListener('click', () => startConversion());

  const cancelBtn = $('cancelBtn');
  if (cancelBtn) cancelBtn.addEventListener('click', () => {
    window.api.cancelConversion();
    goToStep(1);
    resetToStep1();
  });

  const openFolderBtn = $('openFolderBtn');
  if (openFolderBtn) openFolderBtn.addEventListener('click', () => {
    if (state.outputDir) window.api.openFolder(state.outputDir);
  });

  const anotherBtn = $('anotherBtn');
  if (anotherBtn) anotherBtn.addEventListener('click', () => { state.filePath = null; state.fileInfo = null; state.selectedFormat = null; resetToStep1(); });

  const quitBtn = $('quitBtn');
  if (quitBtn) quitBtn.addEventListener('click', () => window.api.quit());

  const quitErrBtn = $('quitErrBtn');
  if (quitErrBtn) quitErrBtn.addEventListener('click', () => window.api.quit());

  const retryBtn = $('retryBtn');
  if (retryBtn) retryBtn.addEventListener('click', () => { renderSettingsStep(); goToStep(2); });

  window.api.onProgress(data => {
    const bar = $('progressBar');
    const pct = $('progressPct');
    const timeEl = $('progressTime');
    if (bar) bar.style.width = `${data.percent}%`;
    if (pct) pct.textContent = `${data.percent}%`;
    if (timeEl && data.elapsed) timeEl.textContent = formatDuration(data.elapsed);
  });

  window.api.onConvertDone(data => {
    state.converting = false;
    if (data.success) {
      const outPath = $('outFilePath');
      if (outPath) outPath.textContent = data.outputPath || '';
      showStep3('done');
      goToStep(3);
    } else {
      const errMsg = $('errorMsg');
      if (errMsg) errMsg.textContent = data.error || '';
      showStep3('error');
      goToStep(3);
    }
  });
}

/* ── Step 3 Sub-section Helpers ──────────────────────────────────────────── */
function showStep3(mode) {
  // mode: 'progress' | 'done' | 'error'
  const sections = { progress: 'progressSection', done: 'doneSection', error: 'errorSection' };
  Object.entries(sections).forEach(([key, id]) => {
    const el = $(id);
    if (el) el.style.display = key === mode ? '' : 'none';
  });
}

/* ── Conversion ──────────────────────────────────────────────────────────── */
async function startConversion() {
  if (!state.selectedFormat) { alert(t('noFormatSelected')); return; }
  if (!state.filePath || !state.outputDir) return;

  state.converting = true;
  $('progressBar').style.width = '0%';
  $('progressPct').textContent = '0%';
  goToStep(3);
  showStep3('progress');

  await window.api.convertFile({
    inputPath: state.filePath,
    outputFormat: state.selectedFormat,
    outputDir: state.outputDir,
    options: state.advancedOptions,
  });
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function formatDuration(sec) {
  if (!sec || isNaN(sec)) return '--';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
               : `${m}:${String(s).padStart(2,'0')}`;
}

function formatSize(bytes) {
  if (!bytes) return '--';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024*1024) return `${(bytes/1024).toFixed(1)} KB`;
  if (bytes < 1024*1024*1024) return `${(bytes/1024/1024).toFixed(1)} MB`;
  return `${(bytes/1024/1024/1024).toFixed(2)} GB`;
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showError(source, msg) {
  console.error(`[${source}]`, msg);
}
