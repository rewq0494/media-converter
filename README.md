<div align="center">
  <h1>🎬 Media Converter</h1>
  <p><strong>A free, open-source local media format converter powered by ffmpeg</strong></p>
  <p>Drag-and-drop simplicity · Smart presets · Zero cloud upload · Works offline</p>

  [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
  [![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows-lightgrey)](https://github.com/rewq0494/media-converter/releases)
  [![Tests](https://img.shields.io/badge/tests-46%20passing-brightgreen)](#testing)
  [![Electron](https://img.shields.io/badge/Electron-36-47848F?logo=electron)](https://electronjs.org)
  [![ffmpeg](https://img.shields.io/badge/ffmpeg-bundled-green)](https://ffmpeg.org)

  [English](#english) · [繁體中文](#繁體中文)
</div>

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

### 🚀 Quick Start (Pre-built)

Download the latest release from [Releases](https://github.com/rewq0494/media-converter/releases):

- **macOS**: Download `.dmg`, drag `Media Converter.app` to Applications
- **Windows**: Run the `.exe` installer

### 🛠 Development Setup

```bash
# Clone
git clone https://github.com/rewq0494/media-converter.git
cd media-converter

# Install dependencies
npm install

# Run in development mode
npm start

# Run tests (TDD — 46 tests)
npm test
```

### 📦 Build

```bash
# macOS (arm64 + x64)
npm run build:mac

# Windows (x64)
npm run build:win
```

Builds are output to the `dist/` folder.

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

This project is developed with **TDD** (Test-Driven Development). Tests cover:

- File detection (MP4, MP3, WAV, MKV, audio-only, video-only, unicode paths, zero-duration)
- Format presets validation (all 14 formats, advanced options, i18n fields)
- FFmpeg argument building (audio, video, GIF, edge cases, path handling)
- Progress parsing (normal, boundary, division-by-zero protection)

```bash
npm test
# Tests: 46 passed, 46 total
```

### ⚖ Legal & Licensing

This project is licensed under the **GNU General Public License v3.0**.

The bundled `ffmpeg` and `ffprobe` binaries (via [ffmpeg-static](https://github.com/eugeneware/ffmpeg-static) and [ffprobe-static](https://github.com/joshwnj/ffprobe-static)) are compiled with GPL-licensed components (libx264, libx265, etc.). Distributing this application therefore requires a GPL-compatible license — hence **GPL-3.0**.

> **ffmpeg is a trademark of Fabrice Bellard.**
> Source code: https://ffmpeg.org/download.html

**Can I open-source this?** ✅ Yes. Publishing on GitHub under GPL-3.0 is fully legal and is the standard practice for open-source projects that bundle ffmpeg.

**Do I need ffmpeg's permission?** ✅ No. GPL is a public license — no explicit approval is needed.

### 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Write or update tests first (TDD)
4. Commit: `git commit -m 'feat: add amazing feature'`
5. Push and open a Pull Request

### 📄 License

GNU General Public License v3.0 — see [LICENSE](LICENSE) for details.

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

### 🚀 快速開始（下載預建版本）

從 [Releases](https://github.com/rewq0494/media-converter/releases) 下載最新版本：

- **macOS**: 下載 `.dmg`，將 `Media Converter.app` 拖入「應用程式」資料夾
- **Windows**: 執行 `.exe` 安裝程式

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

### ⚖ 授權與法律說明

本專案採用 **GNU General Public License v3.0** 授權。

內建的 `ffmpeg` 與 `ffprobe` 執行檔（透過 ffmpeg-static 與 ffprobe-static）包含 GPL 授權的元件（libx264、libx265 等），因此本專案必須採用相容 GPL 的授權。

> **ffmpeg 是 Fabrice Bellard 的商標。**

**可以開源嗎？** ✅ 可以。在 GitHub 上以 GPL-3.0 發布是完全合法的做法。

**需要 ffmpeg 的授權許可嗎？** ✅ 不需要。GPL 是公共授權，不需要明確的批准。

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/rewq0494">WayneWen</a>
</div>
