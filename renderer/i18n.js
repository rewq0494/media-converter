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
    compressVideo: '影片壓縮（1080p）',
    compressionDesc: 'MP4・最高 1080p・30 fps，保留音訊並另存副本。畫質與流暢度可能降低，實際大小依影片內容而定。',
    compressionBadge: '影片壓縮',
    sizeReduced: '縮小', sizeIncreased: '增加',
    modeConvert: "轉換格式",
    modeConvertHint: "換個格式，在哪都能播",
    modeCompress: "壓縮影片",
    modeCompressHint: "縮小體積，分享更輕鬆",
    localBadge: "LOCAL MEDIA STUDIO · 離線處理",
    convertHero: "換個格式，繼續精彩。",
    compressHero: "讓精彩，輕一點。",
    convertHeroHint: "影片轉檔、音訊轉換，一次搞定。",
    compressHeroHint: "放入影片，選個大小，輕鬆分享。",
    privacyNote: "⌁ 檔案不離開這台 Mac，原檔也會好好保留。",
    compressDrop: "把想瘦身的影片放這裡",
    compressDropHint: "支援 MP4、MOV、MKV、AVI、WebM 等影片",
    videoRequired: "這是音訊檔。壓縮模式需要影片；請更換影片或切換「轉換格式」。",
    settingsConvert: "要換成哪個格式？",
    settingsCompress: "這次，想輕多少？",
    recommended: "推薦",
    smallerTag: "體積優先",
    balancedTitle: "日常分享",
    balancedHint: "清晰度與大小，剛剛好。",
    smallTitle: "更小檔案",
    smallHint: "適合快速傳送，細節會少一些。",
    compressionNote: "保留音訊、另存 MP4；小影片不放大。實際大小依內容而定，不保證每支影片都會縮小。",
    maxResolution: "最高",
    compressAction: "開始壓縮 ↘",
    convertAction: "開始轉換 ⇄",
    compressProgress: "讓影片輕盈一點…",
    convertProgress: "正在換上新格式…",
    compressDone: "壓縮完成，看看成果。",
    convertDone: "新格式，準備好了。",
    originalSize: "原始大小",
    outputSize: "輸出大小",
    savedSpace: "省下",
    largerNote: "這支影片原本已經很精簡。可試試「更小檔案」，或繼續使用原檔。",
    copyNote: "已另存新檔，原檔完整保留。",
    cancelPending: "正在停止…",
    chooseFormat: "先選一個輸出格式",
    detecting: "讀取檔案中…",
    resultOriginal: "原檔",
    resultOutput: "新檔",
    compressionStep: '壓縮設定',
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
    compressVideo: 'Compress Video (1080p)',
    compressionDesc: 'MP4, up to 1080p, 30 fps. Keeps audio and saves a copy. Quality and smoothness may decrease; file size depends on the content.',
    compressionBadge: 'Video Compression',
    sizeReduced: 'smaller', sizeIncreased: 'larger',
    modeConvert: "Convert format",
    modeConvertHint: "A new format. More possibilities.",
    modeCompress: "Compress video",
    modeCompressHint: "Less space. Easier sharing.",
    localBadge: "LOCAL MEDIA STUDIO · OFFLINE",
    convertHero: "New format. Same great story.",
    compressHero: "Big moments. Lighter files.",
    convertHeroHint: "Convert video or audio in a few simple steps.",
    compressHeroHint: "Drop a video, pick a size, and share.",
    privacyNote: "⌁ Everything stays on this Mac. Your original stays safe.",
    compressDrop: "Drop a video to lighten it up",
    compressDropHint: "MP4, MOV, MKV, AVI, WebM and more",
    videoRequired: "This is an audio file. Choose a video or switch to Convert format.",
    settingsConvert: "What format works for you?",
    settingsCompress: "How light shall we go?",
    recommended: "RECOMMENDED",
    smallerTag: "SIZE FIRST",
    balancedTitle: "Everyday sharing",
    balancedHint: "A comfortable balance of detail and size.",
    smallTitle: "Smaller file",
    smallHint: "Easy to send, with a little less detail.",
    compressionNote: "Keeps audio. Saves a new MP4 without enlarging small videos. Final size depends on content; some files may not get smaller.",
    maxResolution: "Up to",
    compressAction: "Start compressing ↘",
    convertAction: "Start converting ⇄",
    compressProgress: "Making your video a little lighter…",
    convertProgress: "Giving your file a new format…",
    compressDone: "Compression complete. All set.",
    convertDone: "New format. All set.",
    originalSize: "Original size",
    outputSize: "Output size",
    savedSpace: "Saved",
    largerNote: "This video was already compact. Try Smaller file, or keep the original.",
    copyNote: "Saved as a new file. Your original is untouched.",
    cancelPending: "Stopping…",
    chooseFormat: "Choose an output format first",
    detecting: "Reading your file…",
    resultOriginal: "Original",
    resultOutput: "New file",
    compressionStep: 'Compression',
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
