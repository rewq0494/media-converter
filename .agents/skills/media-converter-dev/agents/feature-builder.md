# 功能擴充子代理指令

你是 Media Converter 專案的功能擴充專家。按照以下 SOP 新增功能。

## 新增輸出格式

這是最常見的擴充需求。完整流程：

### Step 1：定義格式（formatPresets.js）

在 `FORMATS` 陣列中新增，**所有欄位都是必填**：

```javascript
{
  ext: 'webp',                              // 副檔名（小寫）
  label: 'WebP',                            // 顯示名稱
  type: 'video',                            // 'audio' 或 'video'
  shortDesc: '網頁圖片',                     // 短描述（zh-TW，≤6字）
  shortDescEn: 'Web Image',                 // 短描述（EN，≤12字）
  description: '完整描述...',                // 完整描述（zh-TW）
  descriptionEn: 'Full description...',     // 完整描述（EN）
  preset: {
    // ffmpeg 參數（根據格式）
    codec: '...', audioBitrate: '...', sampleRate: 44100,
    description: 'preset 描述（zh-TW）',
    descriptionEn: 'preset description (EN)',
    advanced: [
      {
        key: 'paramKey',                    // 對應 ffmpegRunner 的 options key
        label: '參數名',                     // zh-TW
        labelEn: 'Param Name',             // EN
        default: '預設值',
        options: ['選項1', '選項2'],
        hint: '提示（zh-TW）',
        hintEn: 'Hint (EN)',
      }
    ]
  }
}
```

### Step 2：支援 ffmpeg 參數（ffmpegRunner.js）

確認 `buildFFmpegArgs()` 能正確處理新格式的參數：

- 音訊格式：已有通用處理（codec / bitrate / sampleRate / quality / compressionLevel）
- 影片格式：已有通用處理（videoCodec / audioCodec / crf / audioBitrate）
- 特殊格式（如 GIF）：需要在 `buildFFmpegArgs()` 中新增專屬分支

### Step 3：新增測試

在 `tests/formatPresets.test.js` 確認格式定義完整性（通常自動覆蓋）。
若有特殊 ffmpeg 參數邏輯，在 `tests/ffmpegRunner.test.js` 新增測試。

### Step 4：驗證

```bash
npm test                          # 確認所有測試通過
npm start                         # 手動測試新格式的轉換
```

---

## 新增 IPC API

當需要新增 renderer 可呼叫的功能時：

### 三層同步修改

```
1. main.js          — 新增 ipcMain.handle('new-channel', handler)
2. preload.js       — 新增 contextBridge 方法
3. renderer.js      — 呼叫 window.api.newMethod()
```

### main.js 範例

```javascript
ipcMain.handle('get-app-version', () => {
  return { success: true, data: app.getVersion() };
});
```

### preload.js 範例

```javascript
getAppVersion: () => ipcRenderer.invoke('get-app-version'),
```

### renderer.js 範例

```javascript
const result = await window.api.getAppVersion();
if (result.success) { /* ... */ }
```

### 合約測試

在 `tests/apiContract.test.js` 新增對應的合約檢查，確認三層對齊。

---

## 修改 UI / UX

### 結構規則

- HTML 結構在 `renderer/index.html`
- 樣式在 `renderer/styles.css`
- 互動邏輯在 `renderer/renderer.js`（IIFE 內）
- 所有使用者可見文字必須走 i18n：`t('keyName')`

### 三步驟面板系統

```
Step 1: 檔案選擇（dropZone / fileInfo）
Step 2: 格式設定（formatTabs / formatGrid / advancedPanel）
Step 3: 轉換結果（progressSection / doneSection / errorSection）
```

面板切換靠 `.step-panel.active` CSS class，由 `goToStep(n)` 控制。

### 新增 i18n 翻譯

在 `renderer/i18n.js` 的 `TRANSLATIONS` 物件中：

```javascript
TRANSLATIONS: {
  'zh-TW': { newKey: '中文文字' },
  'en':    { newKey: 'English text' },
}
```

---

## 擴充檢查清單

完成功能擴充後，逐項確認：

- [ ] `formatPresets.js` 所有欄位齊全（含 En 版本）
- [ ] `ffmpegRunner.js` 能正確建構參數
- [ ] `preload.js` ↔ `main.js` ↔ `renderer.js` API 對齊
- [ ] `i18n.js` 雙語翻譯齊全
- [ ] `npm test` 全部通過
- [ ] `npm start` 手動測試功能正常
- [ ] commit message 使用 `feat:` 前綴
