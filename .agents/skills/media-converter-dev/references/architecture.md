# 專案架構詳解

## 技術棧

| 層 | 技術 | 版本 |
|----|------|------|
| 框架 | Electron | v36+ |
| 媒體處理 | FFmpeg (ffmpeg-static) | v6.0 |
| 媒體偵測 | FFprobe (ffprobe-static) | v3.1 |
| 打包 | electron-builder | v26+ |
| 單元測試 | Jest | v29+ |
| E2E 測試 | Playwright (Electron mode) | v1.58+ |
| 語言 | JavaScript (Node.js + Browser) | — |

## 架構圖

```
┌─────────────────────────────────────────────────────┐
│                    Electron App                      │
│                                                      │
│  ┌──────────────────┐    IPC     ┌────────────────┐ │
│  │   Renderer Process │◄────────►│  Main Process   │ │
│  │                    │          │                  │ │
│  │  index.html        │ preload  │  main.js         │ │
│  │  renderer.js (IIFE)│◄───────►│    ├ detect-file │ │
│  │  i18n.js           │  bridge  │    ├ start-conv  │ │
│  │  styles.css        │          │    ├ get-formats │ │
│  │                    │          │    └ ...          │ │
│  └──────────────────┘          │                  │ │
│                                  │  ┌──────────┐   │ │
│                                  │  │ src/      │   │ │
│                                  │  │ ffmpeg    │──►│ │  FFmpeg binary
│                                  │  │ detector  │──►│ │  FFprobe binary
│                                  │  │ presets   │   │ │
│                                  │  └──────────┘   │ │
│                                  └────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## 資料流

### 檔案轉換流程

```
User drops file
  → renderer: getPathForFile(file)      [同步, preload webUtils]
  → renderer: window.api.detectFile()   [IPC invoke]
  → main: fileDetector.detectFile()     [spawn ffprobe]
  → main: return { success, data }
  → renderer: 顯示檔案資訊、格式選擇

User clicks 轉換
  → renderer: window.api.startConversion(params)  [IPC invoke]
  → main: ffmpegRunner.runFFmpeg()      [spawn ffmpeg]
  → main: onProgress → webContents.send('conversion-progress', { pct })
  → renderer: onProgress callback 更新進度條
  → main: ffmpeg close code 0 → resolve
  → main: return { success: true, outputPath }
  → renderer: 顯示完成畫面
```

### 語言切換流程

```
User clicks langToggle
  → i18n.js: setLang('en' / 'zh-TW')
  → localStorage 儲存
  → applyTranslations() 更新所有 data-i18n 元素
  → renderer.js: updateLangToggle() 更新按鈕文字
  → if step 2: renderSettingsStep() 重新渲染格式卡片
```

## Electron 安全設定

| 設定 | 值 | 原因 |
|------|-----|------|
| `contextIsolation` | `true` | 隔離 renderer 與 Node.js |
| `nodeIntegration` | `false` | 禁止 renderer 直接用 Node.js |
| `sandbox` | `false` | 讓 preload 能用 `webUtils.getPathForFile()` |
| `titleBarStyle` | `hiddenInset` | macOS 原生視窗外觀 |

## 技術決策記錄

### 為何用 IIFE 包裹 renderer.js？

**問題**：`i18n.js` 和 `renderer.js` 都透過 `<script>` 標籤載入，共享全域作用域。
兩者都宣告了 `t` 變數，導致 `SyntaxError`。

**選擇方案**：
1. ~~ES Modules~~ — Electron CSP 限制，需額外配置
2. ~~重命名變數~~ — 治標不治本，未來仍可能衝突
3. ✅ **IIFE** — 簡單有效，無需改 build 設定

### 為何用 fixAsar() 而非 extraResources？

**問題**：`ffmpeg-static` 透過 `require()` 回傳路徑，打包後路徑在 `app.asar` 內。

**選擇方案**：
1. ~~extraResources~~ — 需要手動管理路徑，跨平台不一致
2. ✅ **asarUnpack + fixAsar()** — 只需一行路徑替換，`require()` 仍然有效

### 為何進度用 stdout 的 `-progress pipe:1` 而非 stderr？

**原因**：FFmpeg 的 `-progress pipe:1` 輸出結構化的 key=value 格式到 stdout，
比解析 stderr 的自由格式文字更可靠。解析 `out_time_us` 除以總時長即可算出百分比。

### 為何 getPathForFile 需要在 preload 層？

**原因**：Electron v32+ 移除了 `File.path` 屬性。必須用 `webUtils.getPathForFile()`，
這個 API 只能在 preload script 中使用（因為它需要 Electron 模組存取權限）。
