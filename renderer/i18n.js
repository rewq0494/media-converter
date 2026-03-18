const TRANSLATIONS = {
  'zh-TW': {
    appTitle: 'Media Converter',
    step1: '選擇檔案', step2: '轉換設定', step3: '完成',
    dropPrimary: '拖拉檔案到這裡', dropOr: '或', dropBtn: '選擇檔案',
    dropHint: '支援 MP4、MOV、MKV、AVI、MP3、WAV、FLAC、AAC 等',
    fileInfoChange: '更換檔案', fileInfoNext: '下一步 →',
    formatTitle: '輸出格式', tabAll: '全部', tabVideo: '影片', tabAudio: '音訊',
    presetBadge: '✨ 智慧預設', advancedToggle: '⚙ 進階選項',
    outputDirTitle: '儲存到', outputDirChange: '更改',
    btnBack: '← 返回', btnConvert: '開始轉換',
    progressTitle: '轉換中…', btnCancel: '取消',
    doneTitle: '轉換完成！', btnOpenFolder: '📁 開啟資料夾',
    btnConvertAnother: '再轉一個', btnQuit: '關閉應用程式',
    errorTitle: '轉換失敗', btnRetry: '← 重試',
    metaDuration: '時長', metaVideo: '視訊', metaAudio: '音訊', metaFileSize: '大小',
    detectFailed: '無法辨識檔案', detectCancelled: '已取消',
    noFormatSelected: '請先選擇輸出格式',
    converting: '轉換中',
    unknownType: '未知',
    audioOnly: '僅音訊', videoOnly: '僅視訊',
    settingsTitle: '轉換設定',
    langToggle: 'EN',
  },
  en: {
    appTitle: 'Media Converter',
    step1: 'Select File', step2: 'Settings', step3: 'Done',
    dropPrimary: 'Drop file here', dropOr: 'or', dropBtn: 'Choose File',
    dropHint: 'Supports MP4, MOV, MKV, AVI, MP3, WAV, FLAC, AAC, etc.',
    fileInfoChange: 'Change File', fileInfoNext: 'Next →',
    formatTitle: 'Output Format', tabAll: 'All', tabVideo: 'Video', tabAudio: 'Audio',
    presetBadge: '✨ Smart Preset', advancedToggle: '⚙ Advanced',
    outputDirTitle: 'Save to', outputDirChange: 'Change',
    btnBack: '← Back', btnConvert: 'Start Converting',
    progressTitle: 'Converting…', btnCancel: 'Cancel',
    doneTitle: 'Conversion Complete!', btnOpenFolder: '📁 Open Folder',
    btnConvertAnother: 'Convert Another', btnQuit: 'Quit App',
    errorTitle: 'Conversion Failed', btnRetry: '← Retry',
    metaDuration: 'Duration', metaVideo: 'Video', metaAudio: 'Audio', metaFileSize: 'Size',
    detectFailed: 'Unable to identify file', detectCancelled: 'Cancelled',
    noFormatSelected: 'Please select an output format first',
    converting: 'Converting',
    unknownType: 'Unknown',
    audioOnly: 'Audio only', videoOnly: 'Video only',
    settingsTitle: 'Conversion Settings',
    langToggle: '中文',
  },
};

let _lang = localStorage.getItem('mc_lang') || 'zh-TW';

function getLang() { return _lang; }

function t(key) {
  const dict = TRANSLATIONS[_lang] || TRANSLATIONS['zh-TW'];
  return dict[key] !== undefined ? dict[key] : (TRANSLATIONS['zh-TW'][key] || key);
}

function setLang(lang) {
  _lang = lang;
  localStorage.setItem('mc_lang', lang);
  applyTranslations();
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
  document.documentElement.lang = _lang === 'zh-TW' ? 'zh-Hant-TW' : 'en';
}

window.i18n = { t, getLang, setLang, applyTranslations, TRANSLATIONS };
