(function () {
'use strict';
const state = {
  step: 1, mode: 'convert', profile: 'balanced', tab: 'all',
  filePath: null, fileInfo: null, selectedFormat: null, advancedOptions: {},
  outputDir: null, outputPath: null, busy: false, detecting: false, cancelRequested: false,
};
const $ = id => document.getElementById(id);
const t = key => window.i18n.t(key);
let formatRequest = 0;
let presetRequest = 0;
let startedAt = 0;
let timer;

document.addEventListener('DOMContentLoaded', async () => {
  state.outputDir = await window.api.getDownloadsPath();
  setupDragDrop();
  document.querySelectorAll('[data-mode]').forEach(btn => btn.addEventListener('click', () => selectMode(btn.dataset.mode)));
  document.querySelectorAll('[data-profile]').forEach(btn => btn.addEventListener('click', () => {
    state.profile = btn.dataset.profile;
    renderCompression();
  }));
  $('langToggle').addEventListener('click', () => {
    window.i18n.setLang(window.i18n.getLang() === 'zh-TW' ? 'en' : 'zh-TW');
    renderLabels();
    if (state.fileInfo) renderFileInfo();
    if (state.step === 2) renderSettingsStep();
  });
  $('backBtn').addEventListener('click', () => goToStep(1));
  $('replaceFile').addEventListener('click', resetToStep1);
  $('changeDirBtn').addEventListener('click', async () => {
    const dir = await window.api.selectOutputDir(state.outputDir);
    if (dir) { state.outputDir = dir; renderOutputDir(); }
  });
  $('convertBtn').addEventListener('click', startConversion);
  $('cancelBtn').addEventListener('click', async () => {
    if (!state.busy || state.cancelRequested) return;
    state.cancelRequested = true;
    $('cancelBtn').disabled = true;
    $('cancelBtn').textContent = t('cancelPending');
    await window.api.cancelConversion();
  });
  $('openFolderBtn').addEventListener('click', () => { if (state.outputPath) window.api.openFolder(state.outputPath); });
  $('anotherBtn').addEventListener('click', resetToStep1);
  $('quitBtn').addEventListener('click', () => window.api.quitApp());
  $('quitErrBtn').addEventListener('click', () => window.api.quitApp());
  $('retryBtn').addEventListener('click', () => { renderSettingsStep(); goToStep(2); });
  window.api.onProgress(data => {
    if (!state.busy) return;
    $('progressBar').style.width = `${data.pct}%`;
    $('progressPct').textContent = `${data.pct}%`;
  });
  renderLabels();
  goToStep(1);
});

function renderLabels() {
  window.i18n.applyTranslations();
  $('langToggle').textContent = t('langToggle');
  const compress = state.mode === 'compress';
  document.body.dataset.mode = state.mode;
  document.querySelectorAll('[data-mode]').forEach(btn => {
    const selected = btn.dataset.mode === state.mode;
    btn.classList.toggle('selected', selected);
    btn.setAttribute('aria-pressed', String(selected));
    btn.disabled = state.busy || state.detecting;
  });
  document.querySelector('[data-i18n="step2"]').textContent = t(compress ? 'compressionStep' : 'step2');
  $('heroTitle').textContent = t(compress ? 'compressHero' : 'convertHero');
  $('heroHint').textContent = t(compress ? 'compressHeroHint' : 'convertHeroHint');
  document.querySelector('.drop-primary').textContent = t(compress ? 'compressDrop' : 'dropPrimary');
  document.querySelector('.drop-hint').textContent = t(compress ? 'compressDropHint' : 'dropHint');
  $('fileInput').accept = compress ? 'video/*,.mkv,.webm,.avi' : 'video/*,audio/*,.mkv,.flac,.ogg,.opus,.wma,.m4a,.webm';
  $('progressTitle').textContent = t(compress ? 'compressProgress' : 'convertProgress');
  $('doneTitle').textContent = t(compress ? 'compressDone' : 'convertDone');
  $('langToggle').disabled = state.busy;
}

function selectMode(mode) {
  if (state.busy || state.detecting || state.mode === mode) return;
  state.mode = mode;
  state.selectedFormat = null;
  state.advancedOptions = {};
  state.outputPath = null;
  const incompatible = mode === 'compress' && state.fileInfo && !state.fileInfo.video;
  if (state.step === 3 || incompatible) resetToStep1();
  renderLabels();
  if (incompatible) showFileError(t('videoRequired'));
  if (state.step === 2) renderSettingsStep();
}

function goToStep(n) {
  state.step = n;
  [1, 2, 3].forEach(i => {
    $(`step${i}Panel`).classList.toggle('active', i === n);
    $(`stepDot${i}`).classList.toggle('active', i === n);
    $(`stepDot${i}`).classList.toggle('done', i < n);
  });
  $(`step${n}Panel`).scrollTop = 0;
}

function setupDragDrop() {
  const zone = $('dropZone');
  const input = $('fileInput');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', async e => {
    e.preventDefault(); zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) await handleFileDetect(window.api.getPathForFile(file));
  });
  zone.addEventListener('click', () => { if (!state.detecting) input.click(); });
  zone.addEventListener('keydown', e => {
    if (e.target === zone && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); input.click(); }
  });
  input.addEventListener('change', async e => {
    const file = e.target.files[0];
    if (file) await handleFileDetect(window.api.getPathForFile(file));
    input.value = '';
  });
}

function showFileError(message) { $('fileError').textContent = message; $('fileError').hidden = false; }
async function handleFileDetect(filePath) {
  if (state.detecting || state.busy) return;
  if (!filePath) { showFileError(t('detectFailed')); return; }
  state.detecting = true;
  $('fileError').hidden = true;
  $('dropZone').style.display = 'none';
  $('fileInfo').style.display = '';
  $('fileInfo').textContent = t('detecting');
  renderLabels();
  try {
    const result = await window.api.detectFile(filePath);
    if (!result.success) throw new Error(result.error);
    if (state.mode === 'compress' && !result.data.video) throw new Error(t('videoRequired'));
    state.filePath = filePath;
    state.fileInfo = result.data;
    state.selectedFormat = null;
    state.advancedOptions = {};
    renderFileInfo();
  } catch (err) {
    $('dropZone').style.display = '';
    $('fileInfo').style.display = 'none';
    showFileError(err.message);
  } finally {
    state.detecting = false;
    renderLabels();
  }
}

function renderFileInfo() {
  const info = state.fileInfo;
  $('fileInfo').innerHTML = `<div class="file-ready"><span class="ready-icon" aria-hidden="true">✓</span><div><div class="file-name">${esc(filePart(state.filePath))}</div><div class="meta-chips"><span class="meta-chip">${fmtSize(info.size)}</span><span class="meta-chip">${fmtDuration(info.duration)}</span>${info.video ? `<span class="meta-chip">${info.video.width} × ${info.video.height}</span>` : ''}</div></div></div><div class="file-actions"><button class="btn-secondary btn-sm" id="changeFileBtn">${t('fileInfoChange')}</button><button class="btn-primary" id="nextBtn">${t('fileInfoNext')}</button></div>`;
  $('changeFileBtn').addEventListener('click', resetToStep1);
  $('nextBtn').addEventListener('click', () => { renderSettingsStep(); goToStep(2); });
}

function resetToStep1() {
  state.filePath = null; state.fileInfo = null; state.selectedFormat = null;
  state.advancedOptions = {}; state.outputPath = null;
  $('dropZone').style.display = '';
  $('fileInfo').style.display = 'none'; $('fileInfo').innerHTML = '';
  $('fileError').hidden = true;
  goToStep(1);
  renderLabels();
}

function renderSettingsStep() {
  renderLabels();
  const compress = state.mode === 'compress';
  $('conversionSettings').hidden = compress;
  $('compressionSettings').hidden = !compress;
  $('settingsEyebrow').textContent = t(compress ? 'modeCompress' : 'modeConvert');
  $('settingsTitle').textContent = t(compress ? 'settingsCompress' : 'settingsConvert');
  $('taskBadge').textContent = compress ? 'MP4' : '⇄';
  $('sourceName').textContent = filePart(state.filePath);
  $('sourceMeta').textContent = `${fmtSize(state.fileInfo.size)} · ${fmtDuration(state.fileInfo.duration)}`;
  $('convertBtn').textContent = t(compress ? 'compressAction' : 'convertAction');
  if (compress) {
    state.selectedFormat = 'mp4';
    renderCompression();
  } else {
    if (!state.fileInfo.video) state.tab = 'audio';
    renderFormatTabs();
    renderFormatGrid();
    renderAdvancedPanel();
  }
  $('convertBtn').disabled = !state.selectedFormat;
  renderOutputDir();
}

function renderCompression() {
  document.querySelectorAll('[data-profile]').forEach(btn => {
    const selected = btn.dataset.profile === state.profile;
    btn.classList.toggle('selected', selected);
    btn.setAttribute('aria-pressed', String(selected));
  });
  $('compressionSummary').textContent = `MP4 · ${t('maxResolution')} ${state.profile === 'small' ? '720p' : '1080p'} · 30 fps`;
}

function renderFormatTabs() {
  const tabs = state.fileInfo.video ? [['all', 'tabAll'], ['video', 'tabVideo'], ['audio', 'tabAudio']] : [['audio', 'tabAudio']];
  $('formatTabs').innerHTML = tabs.map(([id, key]) => `<button class="tab-btn${state.tab === id ? ' active' : ''}" data-tab="${id}" aria-pressed="${state.tab === id}">${t(key)}</button>`).join('');
  $('formatTabs').querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
    state.tab = btn.dataset.tab;
    renderFormatTabs(); renderFormatGrid();
  }));
}

async function renderFormatGrid() {
  const request = ++formatRequest;
  let formats = await window.api.getOutputFormats(state.fileInfo?.video ? 'video' : 'audio') || [];
  if (request !== formatRequest || state.mode !== 'convert') return;
  if (state.tab !== 'all') formats = formats.filter(f => f.type === state.tab);
  const en = window.i18n.getLang() === 'en';
  $('formatGrid').innerHTML = formats.map(f => `<button class="format-card${state.selectedFormat === f.ext ? ' selected' : ''}" data-ext="${f.ext}" aria-pressed="${state.selectedFormat === f.ext}" title="${esc(en ? f.descriptionEn : f.description)}"><span class="format-ext">.${f.ext}</span><span class="format-label">${f.label}</span><span class="format-tag">${esc(en ? f.shortDescEn : f.shortDesc)}</span></button>`).join('');
  $('formatGrid').querySelectorAll('button').forEach(card => card.addEventListener('click', () => {
    state.selectedFormat = card.dataset.ext; state.advancedOptions = {};
    $('convertBtn').disabled = false;
    renderFormatGrid(); renderAdvancedPanel();
  }));
}

async function renderAdvancedPanel() {
  const request = ++presetRequest;
  const panel = $('advancedPanel');
  if (!state.selectedFormat) { panel.innerHTML = ''; return; }
  const preset = await window.api.getPreset(state.selectedFormat);
  if (request !== presetRequest || state.mode !== 'convert' || !preset) return;
  const en = window.i18n.getLang() === 'en';
  let html = `<p class="preset-desc">${esc(en ? preset.descriptionEn : preset.description)}</p>`;
  if (preset.advanced?.length) {
    html += `<details class="advanced-details"><summary>${t('advancedToggle')}</summary><div class="advanced-opts">`;
    preset.advanced.forEach(opt => {
      if (!(opt.key in state.advancedOptions)) state.advancedOptions[opt.key] = opt.default;
      const label = en ? opt.labelEn : opt.label;
      const hint = en ? opt.hintEn : opt.hint;
      html += `<div class="opt-row"><label class="opt-label" for="opt-${opt.key}">${esc(label)}</label><select class="opt-select" id="opt-${opt.key}" data-key="${opt.key}">`;
      html += (opt.options || []).map(o => {
        const value = typeof o === 'object' ? o.value : o;
        const text = typeof o === 'object' ? (en ? o.labelEn : o.label) : o;
        return `<option value="${esc(value)}"${value == state.advancedOptions[opt.key] ? ' selected' : ''}>${esc(text)}</option>`;
      }).join('');
      html += `</select>${hint ? `<span class="opt-hint">${esc(hint)}</span>` : ''}</div>`;
    });
    html += '</div></details>';
  }
  panel.innerHTML = html;
  panel.querySelectorAll('select').forEach(sel => sel.addEventListener('change', () => { state.advancedOptions[sel.dataset.key] = sel.value; }));
}

function renderOutputDir() { $('outputDirDisplay').textContent = state.outputDir || ''; }
function showStep3(mode) {
  ['progress', 'done', 'error'].forEach(name => { $(`${name}Section`).style.display = name === mode ? '' : 'none'; });
}

async function startConversion() {
  if (state.busy || !state.selectedFormat || !state.filePath || !state.outputDir) return;
  state.busy = true; state.cancelRequested = false;
  $('cancelBtn').disabled = false;
  $('progressBar').style.width = '0%'; $('progressPct').textContent = '0%';
  $('progressTime').textContent = '0:00';
  startedAt = Date.now();
  timer = setInterval(() => { $('progressTime').textContent = fmtDuration((Date.now() - startedAt) / 1000); }, 1000);
  renderLabels(); goToStep(3); showStep3('progress');
  try {
    const result = await window.api.startConversion({ inputPath: state.filePath, outputDir: state.outputDir, outputExt: state.selectedFormat,
      options: state.mode === 'compress' ? { compression: true, compressionProfile: state.profile } : state.advancedOptions,
      duration: state.fileInfo.duration || 0 });
    if (state.cancelRequested) { renderSettingsStep(); goToStep(2); return; }
    if (!result.success) throw new Error(result.error);
    state.outputPath = result.outputPath;
    $('outFilePath').textContent = result.outputPath;
    const delta = result.inputSize > 0 ? (1 - result.outputSize / result.inputSize) * 100 : 0;
    $('sizeResult').innerHTML = `<div><small>${t('resultOriginal')}</small><strong>${fmtSize(result.inputSize)}</strong></div><span aria-hidden="true">→</span><div><small>${t('resultOutput')}</small><strong>${fmtSize(result.outputSize)}</strong></div><span class="size-badge${delta < 0 ? ' larger' : ''}">${t(delta >= 0 ? 'sizeReduced' : 'sizeIncreased')} ${Math.abs(delta).toFixed(1)}%</span>`;
    $('resultHint').textContent = t(state.mode === 'compress' && delta <= 0 ? 'largerNote' : 'copyNote');
    showStep3('done');
  } catch (err) {
    if (state.cancelRequested) { renderSettingsStep(); goToStep(2); }
    else { $('errorMsg').textContent = err.message; showStep3('error'); }
  } finally {
    clearInterval(timer); state.busy = false; renderLabels();
  }
}
function fmtDuration(sec) {
  if (!Number.isFinite(sec)) return '--';
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60);
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}
function fmtSize(bytes) {
  if (bytes == null) return '--';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
}
function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function filePart(p) { return p ? p.split(/[/\\]/).pop() : ''; }
})();
