<div align="center">
  <h1>🎬 Media Converter</h1>
  <p><strong>免費開源的本地影音格式轉換工具，由 ffmpeg 驅動</strong></p>
  <p>拖放即用 · 智慧預設 · 檔案不上雲 · 離線可用</p>

  [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
  [![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows-lightgrey)](https://github.com/rewq0494/media-converter/releases)
  [![Tests](https://img.shields.io/badge/tests-46%20passing-brightgreen)](#testing)
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
| **進階調整** | 位元率、CRF、取樣率、編碼選擇 — 全部可選 |
| **即時進度** | 即時進度條 + 已用時間 |
| **自訂輸出路徑** | 精確選擇轉換結果的儲存位置 |
| **雙語介面** | 可隨時切換繁體中文與英文 |
| **完全關閉** | 關閉按鈕完全結束程式，不佔背景資源 |
| **跨平台** | macOS (.app / .dmg) 與 Windows (.exe) |

### 📋 系統需求

- **macOS** 11+（Apple Silicon 與 Intel）或 **Windows** 10+
- Node.js 18+（僅開發環境需要）
- 無需另外安裝 ffmpeg — 已內建執行檔

### 🚀 快速開始（下載安裝）

從 [Releases](https://github.com/rewq0494/media-converter/releases) 下載最新版本：

| 下載 | 適用 |
|---|---|
| [macOS Apple Silicon (.dmg)](https://github.com/rewq0494/media-converter/releases/download/v1.1.0/Media-Converter-macOS-Apple-Silicon.dmg) | **M1 / M2 / M3 / M4** ← 大多數人選這個 |
| [macOS Intel (.dmg)](https://github.com/rewq0494/media-converter/releases/download/v1.1.0/Media-Converter-macOS-Intel.dmg) | 較舊的 Mac |
| [Windows 64-bit (.exe)](https://github.com/rewq0494/media-converter/releases/download/v1.1.0/Media-Converter-Windows-Setup.exe) | Windows 10 以上 |

**macOS 安裝步驟：**
1. 下載對應你 Mac 的 `.dmg` 檔（不確定就選 Apple Silicon）
2. 雙擊開啟 DMG，將 **Media Converter.app** 拖入「應用程式」資料夾
3. 第一次開啟時若出現 **「Apple 無法驗證」** 提示，請用以下任一方式解決：

   **方法一（推薦）：** 打開終端機，執行一次：
   ```bash
   xattr -cr /Applications/Media\ Converter.app
   ```

   **方法二：** 前往 **系統設定 → 隱私權與安全性** → 往下滾到「安全性」→ 點選 **「仍要打開」**

> ⚠️ 這是因為本 App 沒有 Apple 付費開發者帳號簽名，是所有開源 macOS 桌面應用的常見現象，並非惡意軟體。

**Windows 安裝步驟：**
1. 下載 `.exe` 安裝檔
2. 雙擊執行安裝程式
3. 若出現 SmartScreen 警告，點選「其他資訊」→「仍要執行」

### 🛠 開發環境設定

```bash
# 複製專案
git clone https://github.com/rewq0494/media-converter.git
cd media-converter

# 安裝相依套件
npm install

# 開發模式啟動
npm start

# 執行測試（TDD — 46 個測試）
npm test
```

### 📦 打包建置

```bash
# macOS（arm64 + x64）
npm run build:mac

# Windows（x64）
npm run build:win
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
└── tests/               # 46 個單元 + 邊界測試（Jest）
```

### 🧪 測試

本專案採用 **TDD（測試驅動開發）** 方式建立。測試涵蓋：

- 檔案辨識（MP4、MP3、WAV、MKV、純音訊、純視訊、Unicode 路徑、零時長）
- 格式預設驗證（全部 14 種格式、進階選項、i18n 欄位）
- FFmpeg 參數建置（音訊、視訊、GIF、邊界情況、路徑處理）
- 進度解析（正常情況、邊界值、除以零保護）

```bash
npm test
# Tests: 46 passed, 46 total
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
| **Advanced controls** | Bitrate, CRF, sample rate, codec selection — all optional |
| **Real-time progress** | Live progress bar with elapsed time |
| **Custom output folder** | Choose exactly where converted files are saved |
| **i18n** | Switch between 繁體中文 and English at any time |
| **Clean exit** | Quit button stops the process completely — no background tasks |
| **Cross-platform** | macOS (.app / .dmg) and Windows (.exe) |

### 📋 Requirements

- **macOS** 11+ (Apple Silicon & Intel) or **Windows** 10+
- Node.js 18+ (for development only)
- No ffmpeg installation required — binaries are bundled

### 🚀 Quick Start (Download)

Download the latest release from [Releases](https://github.com/rewq0494/media-converter/releases):

| Download | Platform |
|---|---|
| [macOS Apple Silicon (.dmg)](https://github.com/rewq0494/media-converter/releases/download/v1.1.0/Media-Converter-macOS-Apple-Silicon.dmg) | **M1 / M2 / M3 / M4** ← most users |
| [macOS Intel (.dmg)](https://github.com/rewq0494/media-converter/releases/download/v1.1.0/Media-Converter-macOS-Intel.dmg) | Older Macs |
| [Windows 64-bit (.exe)](https://github.com/rewq0494/media-converter/releases/download/v1.1.0/Media-Converter-Windows-Setup.exe) | Windows 10+ |

**macOS Installation:**
1. Download the `.dmg` for your Mac (if unsure, pick Apple Silicon)
2. Open the DMG, drag **Media Converter.app** to Applications
3. First launch: if you see **"Apple cannot verify"** warning, fix it with either:

   **Option A (recommended):** Open Terminal and run once:
   ```bash
   xattr -cr /Applications/Media\ Converter.app
   ```

   **Option B:** Go to **System Settings → Privacy & Security** → scroll to "Security" → click **"Open Anyway"**

> ⚠️ This happens because the app isn't signed with a paid Apple Developer account — common for all open-source macOS desktop apps. It is NOT malware.

**Windows Installation:**
1. Download the `.exe` installer
2. Double-click to install
3. If SmartScreen warning appears, click "More info" → "Run anyway"

### 🛠 Development Setup

```bash
git clone https://github.com/rewq0494/media-converter.git
cd media-converter
npm install   # install dependencies
npm start     # run in development mode
npm test      # run 46 TDD tests
```

### 📦 Build

```bash
npm run build:mac   # macOS (arm64 + x64)
npm run build:win   # Windows (x64)
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
└── tests/               # 46 unit + boundary tests (Jest)
```

### 🧪 Testing

Developed with **TDD**. Tests cover file detection, format presets, ffmpeg argument building, and progress parsing — including edge cases.

```bash
npm test   # Tests: 46 passed, 46 total
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
