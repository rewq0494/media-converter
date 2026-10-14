<div align="center">
  <h1>🎬 Media Converter</h1>
  <p><strong>免費開源的本地影音格式轉換工具，由 ffmpeg 驅動</strong></p>
  <p>拖放即用 · 智慧預設 · 檔案不上雲 · 離線可用</p>

  [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
  [![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows-lightgrey)](https://github.com/rewq0494/media-converter/releases)
  [![Tests](https://img.shields.io/badge/tests-99%20passing-brightgreen)](#testing)
  [![Electron](https://img.shields.io/badge/Electron-36-47848F?logo=electron)](https://electronjs.org)
  [![ffmpeg](https://img.shields.io/badge/ffmpeg-bundled-green)](https://ffmpeg.org)

  [繁體中文](#繁體中文) · [English](#english)
</div>

---

## 繁體中文

### 這是什麼？

Media Converter 是一個**桌面應用程式**，完全在本機運行。上傳任何影音檔案、選擇輸出格式、調整選用參數、選擇儲存資料夾，然後轉換 — 檔案不會傳送到任何伺服器。

無需訂閱。無浮水印。無需網路。

### ✨ 功能特色

| 功能 | 說明 |
|---|---|
| **14 種輸出格式** | MP3、WAV、AAC、FLAC、OGG、M4A、Opus、WMA、MP4、MOV、MKV、WebM、AVI、GIF |
| **自動辨識檔案** | ffprobe 自動偵測編碼、解析度、取樣率、時長 |
| **智慧預設參數** | 每種格式都附帶推薦設定與清楚說明 |
| **進階調整** | 位元率、CRF、取樣率、編碼、解析度與 FPS 選擇 |
| **掉幀修復** | 支援固定幀率、混合補幀與動態補幀 |
| **即時進度** | 即時進度條 + 已用時間 |
| **自訂輸出路徑** | 精確選擇轉換結果的儲存位置 |
| **雙語介面** | 可隨時切換繁體中文與英文 |
| **完全關閉** | 關閉按鈕完全結束程式，不佔背景資源 |
| **跨平台** | macOS (.app / .dmg) 與 Windows (.exe) |

### 📋 系統需求

- **macOS** 11+（Apple Silicon）或 **Windows** 10+
- Node.js 18+（僅開發環境需要）
- 可攜版內附 ffmpeg；本機精簡版共用 Homebrew FFmpeg

### 🚀 快速開始（下載安裝）

目前原始碼版本為 **1.2.0**（[更新說明](CHANGELOG.md)）。本版本以本機精簡版驗證，請使用 `npm ci`、`npm run build:local` 建置；需要本機已安裝的 Homebrew FFmpeg。尚未提供 1.2.0 的 DMG／Windows 安裝檔。

**本機版安裝：**建置後將 `dist/local/mac-arm64/Media Converter.app` 移至「應用程式」。本機版使用 ad-hoc 簽署，未經 Apple 公證。

### 🛠 開發環境設定

```bash
# 複製專案
git clone https://github.com/rewq0494/media-converter.git
cd media-converter

# 安裝相依套件
npm install

# 開發模式啟動
npm start

# 執行測試（TDD — 66 個單元測試）
npm test
```

### 📦 打包建置

```bash
# macOS（Apple Silicon / arm64）
npm run build:mac

# Windows（x64）
npm run build:win

# 整理 dist/：保留發佈檔名，移除重複與非必要產物
npm run dist:prune
```

建置結果輸出至 `dist/` 資料夾。

### 🗂 專案結構

```
media-converter/
├── main.js              # Electron 主程序 + IPC 處理器
├── preload.js           # 安全 contextBridge API
├── src/
│   ├── fileDetector.js  # ffprobe 檔案辨識
│   ├── formatPresets.js # 14 種格式定義與智慧預設
│   └── ffmpegRunner.js  # ffmpeg 執行 + 進度解析
├── renderer/
│   ├── index.html       # 三步驟 UI
│   ├── styles.css       # 深色/淺色主題（跟隨系統）
│   ├── renderer.js      # UI 邏輯
│   └── i18n.js          # zh-TW / EN 翻譯
└── tests/               # 66 個單元 + 邊界測試（Jest）
```

### 🧪 測試

本專案採用 **TDD（測試驅動開發）** 方式建立。測試涵蓋：

- 檔案辨識（MP4、MP3、WAV、MKV、純音訊、純視訊、Unicode 路徑、零時長）
- 格式預設驗證（全部 14 種格式、進階選項、i18n 欄位）
- FFmpeg 參數建置（音訊、視訊、GIF、邊界情況、路徑處理）
- 進度解析（正常情況、邊界值、除以零保護）

```bash
npm test
# Tests: 66 passed, 66 total
```

### ⚖️ 授權與法律說明

本專案採用 **GNU General Public License v3.0** 授權。

內建的 `ffmpeg` 與 `ffprobe` 執行檔（透過 [ffmpeg-static](https://github.com/eugeneware/ffmpeg-static) 與 [ffprobe-static](https://github.com/joshwnj/ffprobe-static)）包含 GPL 授權的元件（libx264、libx265 等），因此本專案必須採用相容 GPL 的授權。

> **ffmpeg 是 Fabrice Bellard 的商標。**  
> 原始碼：https://ffmpeg.org/download.html

**可以開源嗎？** ✅ 可以。在 GitHub 以 GPL-3.0 發布是完全合法的標準做法。  
**需要 ffmpeg 的授權許可嗎？** ✅ 不需要。GPL 是公共授權，無需明確批准。

### 🤝 貢獻指南

歡迎貢獻！請遵循以下流程：

1. Fork 此專案
2. 建立功能分支：`git checkout -b feature/amazing-feature`
3. 先撰寫或更新測試（TDD）
4. Commit：`git commit -m 'feat: add amazing feature'`
5. Push 並開啟 Pull Request

### 📄 授權條款

GNU General Public License v3.0 — 詳見 [LICENSE](LICENSE)

---

## English

### What is it?

Media Converter is a **desktop application** that runs entirely on your local machine. Upload any video or audio file, choose your output format, tweak optional parameters, pick a save folder, and convert — all without sending your files to any server.

No subscriptions. No watermarks. No internet required.

### ✨ Features

| Feature | Details |
|---|---|
| **14 output formats** | MP3, WAV, AAC, FLAC, OGG, M4A, Opus, WMA, MP4, MOV, MKV, WebM, AVI, GIF |
| **Auto file detection** | ffprobe identifies codec, resolution, sample rate, duration automatically |
| **Smart presets** | Every format ships with recommended settings and a clear description |
| **Advanced controls** | Bitrate, CRF, sample rate, codec, resolution, and FPS |
| **Dropped-frame repair** | Constant FPS, blend interpolation, and motion interpolation modes |
| **Real-time progress** | Live progress bar with elapsed time |
| **Custom output folder** | Choose exactly where converted files are saved |
| **i18n** | Switch between 繁體中文 and English at any time |
| **Clean exit** | Quit button stops the process completely — no background tasks |
| **Cross-platform** | macOS (.app / .dmg) and Windows (.exe) |

### 📋 Requirements

- **macOS** 11+ (Apple Silicon) or **Windows** 10+
- Node.js 18+ (for development only)
- No ffmpeg installation required — binaries are bundled

### 🚀 Quick Start (Download)

Current source version: **1.2.0** ([changelog](CHANGELOG.md)). Build the local Mac edition with `npm ci` and `npm run build:local`; Homebrew FFmpeg is required. Version 1.2.0 DMG/Windows installers are not provided.

**Local installation:** Move `dist/local/mac-arm64/Media Converter.app` to Applications after building. This local edition uses ad-hoc signing and is not notarized.

### 🛠 Development Setup

```bash
git clone https://github.com/rewq0494/media-converter.git
cd media-converter
npm install   # install dependencies
npm start     # run in development mode
npm test      # run 66 unit tests
```

### 📦 Build

```bash
npm run build:mac   # macOS (Apple Silicon / arm64)
npm run build:win   # Windows (x64)
npm run dist:prune  # keep only release-ready artifacts
```

Output goes to `dist/`.

### 🗂 Project Structure

```
media-converter/
├── main.js              # Electron main process + IPC handlers
├── preload.js           # Secure contextBridge API
├── src/
│   ├── fileDetector.js  # ffprobe-based file detection
│   ├── formatPresets.js # 14 format definitions with smart presets
│   └── ffmpegRunner.js  # ffmpeg execution + progress parsing
├── renderer/
│   ├── index.html       # 3-step UI
│   ├── styles.css       # Dark/light theme (follows system)
│   ├── renderer.js      # UI logic
│   └── i18n.js          # zh-TW / EN translations
└── tests/               # 66 unit + boundary tests (Jest)
```

### 🧪 Testing

Developed with **TDD**. Tests cover file detection, format presets, ffmpeg argument building, and progress parsing — including edge cases.

```bash
npm test   # Tests: 66 passed, 66 total
```

### ⚖ Legal & Licensing

Licensed under **GPL-3.0**. Bundled ffmpeg/ffprobe binaries contain GPL-licensed components (libx264, libx265), which requires a GPL-compatible license.

> **ffmpeg is a trademark of Fabrice Bellard.** Source: https://ffmpeg.org/download.html

### 🤝 Contributing

1. Fork the repo
2. `git checkout -b feature/amazing-feature`
3. Write tests first (TDD)
4. `git commit -m 'feat: add amazing feature'`
5. Open a Pull Request

### 📄 License

GNU General Public License v3.0 — see [LICENSE](LICENSE)

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/rewq0494">WayneWen</a>
</div>

## 影片壓縮

首頁選 **壓縮影片** → 放入影片 → 下一步 → 選「日常分享（1080p）」或「更小檔案（720p）」→ 開始壓縮。換格式請使用另一個獨立入口 **轉換格式**。日常分享模式使用 H.264 / AAC、CRF 25、medium、yuv420p、96 kbps 音訊與 faststart，限制為最高 1080p、30 fps；直式影片維持直式，不放大小影片。輸出為 `_compressed.mp4`，同名檔自動加流水號，保留原檔。完成後顯示前後大小與增減比例。壓縮屬有損處理，不保證每支影片都會變小。

## 本機精簡版（Apple Silicon）

執行 `npm run build:local`，輸出 `dist/local/mac-arm64/Media Converter.app`。Electron 僅保留英文內建語系，應用介面仍支援繁體中文與英文，不製作 DMG、不內附 FFmpeg/FFprobe，也不需要開發者憑證。共用 `/opt/homebrew/bin` 或 `/usr/local/bin` 已安裝的 Homebrew FFmpeg；Finder 啟動不依賴 shell PATH。請保留本機 FFmpeg 安裝，缺少工具時會顯示錯誤。既有 `build:mac` / `build:win` 仍製作可攜版。建置不自動清理其他舊版產物。

「更小檔案」採用 CRF 28、最高 720p，其餘相同。兩種模式皆保留原檔，完成後顯示實際大小差異。取消會停止 FFmpeg，可能留下未完成的輸出副本。

## 批次處理

轉換格式、壓縮影片都可一次拖入多檔，或在選擇檔案時多選。可繼續加入、移出清單；同批使用相同設定，依序執行以控制資源使用。混合音訊與影片轉檔時僅提供音訊輸出格式。壓縮模式會略過音訊或無法辨識的檔案並顯示原因。單筆失敗會繼續後續工作；「停止整批」會中止目前與後續工作，保留已完成結果。

批次與介面回歸測試：`node node_modules/@playwright/test/cli.js test tests/e2e.spec.js tests/modes.spec.js --workers=1`（33 個測試）；另有 66 個 Jest 測試。
