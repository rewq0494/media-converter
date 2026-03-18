---
name: media-converter-dev
description: >
  Media Converter 專案的開發 SOP。當使用者要修 Bug、擴充功能、新增格式、建置發佈、
  或修改 UI 時，請使用此 skill。涵蓋 Electron IPC 合約驗證、ffmpeg 整合、
  i18n 國際化、打包簽名流程。Use this skill whenever working on the media-converter
  project — bug fixes, feature additions, format presets, build/release, or UI changes.
---

# Media Converter — 開發 SOP

> 本機離線影音格式轉換桌面應用，基於 Electron + FFmpeg。

## 何時使用此 Skill

- 修復 Bug（UI 不動、轉換失敗、打包問題）
- 新增或修改輸出格式
- 修改 UI / UX
- 建置與發佈新版本（macOS / Windows）
- 修改 i18n 翻譯
- 新增 IPC API

---

## 專案架構總覽

```
media-converter/
├── main.js              # Electron 主程序：視窗建立、IPC handlers
├── preload.js           # contextBridge API 定義（唯一的 renderer↔main 介面）
├── renderer/
│   ├── index.html       # 單頁 HTML（3 步驟面板）
│   ├── renderer.js      # 前端邏輯（IIFE 包裹，避免與 i18n.js 衝突）
│   ├── styles.css       # 完整樣式（深色主題、格式卡片、tooltip）
│   └── i18n.js          # 雙語翻譯系統（zh-TW / EN）
├── src/
│   ├── ffmpegRunner.js  # FFmpeg spawn 包裝、參數建構、進度解析
│   ├── fileDetector.js  # FFprobe 檔案偵測、格式識別
│   └── formatPresets.js # 15 種格式定義（含 preset + advanced options）
├── tests/
│   ├── *.test.js        # Jest 單元測試（54 tests）
│   └── e2e.spec.js      # Playwright Electron E2E 測試（25 tests）
├── assets/              # 應用圖示（.icns / .ico / .png）
└── package.json         # 依賴、build 設定、scripts
```

---

## 黃金守則

以下規則源自過去踩過的坑，**每次修改前請確認**：

### 1. IPC API 合約是唯一真相來源

`preload.js` 是 renderer 與 main 之間的**唯一介面**。三層必須完全對齊：

```
renderer.js 呼叫  →  preload.js 暴露  →  main.js 處理
window.api.X()       contextBridge.X()     ipcMain.handle('x')
```

**修改任一層時，必須同步修改其他兩層。** 詳見 `references/api-contract.md`。

### 2. renderer.js 必須包在 IIFE 內

```javascript
(function () {
'use strict';
// ... 所有 renderer 程式碼 ...
})();
```

原因：`i18n.js` 在全域宣告了 `function t()`，若 renderer.js 也在全域宣告 `const t = ...`，
會觸發 `SyntaxError: Identifier 't' has already been declared`，導致**整個 UI 失效**。

### 3. 打包後的 asar 路徑修正

`ffmpeg-static` 和 `ffprobe-static` 的二進制檔在打包後會被壓進 `app.asar`。
必須用 `fixAsar()` 將路徑導向 `app.asar.unpacked`：

```javascript
function fixAsar(p) { return p.replace('app.asar', 'app.asar.unpacked'); }
const ffmpegPath = fixAsar(require('ffmpeg-static'));
```

同時 `package.json` 的 `build.asarUnpack` 必須包含這兩個套件。

### 4. 回應格式統一

所有 IPC handler 回傳統一結構：

```javascript
// 成功
{ success: true, data: { ... } }        // detect-file
{ success: true, outputPath: '...' }    // start-conversion

// 失敗
{ success: false, error: '錯誤訊息' }
```

進度推送格式：`{ pct: 0-100 }`（不是 `percent`，不是 `progress`）

### 5. i18n 雙語規範

所有使用者可見文字必須同時提供 `zh-TW` 和 `en` 版本：
- `i18n.js`：新增翻譯 key
- `formatPresets.js`：`description` + `descriptionEn`、`shortDesc` + `shortDescEn`
- `renderer.js`：透過 `t('key')` 取得翻譯，根據 `window.i18n.getLang()` 切換

---

## SOP：修復 Bug

讀取 `agents/bug-fixer.md` 取得完整修復流程。概要：

1. **重現** — 在 `npm start`（dev）和打包 app 中分別測試
2. **定位** — 開啟 renderer console 轉發（main.js 已內建），確認錯誤源頭
3. **三層檢查** — 確認 renderer↔preload↔main API 合約一致
4. **修復** — 修改後執行 `npm test` 確認 54 unit + 25 E2E 全過
5. **打包驗證** — 若涉及 native 模組或路徑，必須 `npm run build:mac` 後實測
6. **提交** — commit message 格式：`fix: 描述`

## SOP：新增功能 / 擴充格式

讀取 `agents/feature-builder.md` 取得完整流程。概要：

1. **定義** — 確認新功能影響哪些層（renderer / src / main）
2. **格式擴充** — 修改 `formatPresets.js`，必須包含所有欄位
3. **API 擴充** — 若需新 IPC，三層同步新增
4. **測試** — 新增對應 test case，確保舊測試全過
5. **i18n** — 新增所有文字的雙語翻譯
6. **提交** — commit message 格式：`feat: 描述`

## SOP：建置與發佈

讀取 `agents/release-manager.md` 取得完整流程。概要：

1. **測試通過** — `npm test` 全過
2. **版本號** — 更新 `package.json` version
3. **建置** — `npm run build:mac && npm run build:win`
4. **命名** — 上傳檔名必須與 README 下載連結一致
5. **Tag** — `git tag vX.Y.Z HEAD && git push origin vX.Y.Z`
6. **Release** — `gh release create` 並更新 release notes
7. **README** — 更新下載連結和版本號

---

## 測試策略

```bash
npm test              # Jest 單元測試（54 tests）
npx playwright test   # Electron E2E 測試（25 tests）
npm start             # 手動 dev 測試
```

### 測試覆蓋範圍

| 類型 | 檔案 | 涵蓋內容 |
|------|------|----------|
| Unit | `ffmpegRunner.test.js` | 參數建構、進度解析 |
| Unit | `fileDetector.test.js` | 格式偵測、格式映射 |
| Unit | `formatPresets.test.js` | 格式定義完整性 |
| Contract | `apiContract.test.js` | renderer↔preload↔main 對齊 |
| E2E | `e2e.spec.js` | App 啟動、UI 互動、語言切換 |

**新增功能時必須新增對應測試。**

---

## Git 提交規範

```
<type>: <description>

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

| type | 用途 |
|------|------|
| `fix` | Bug 修復 |
| `feat` | 新功能 |
| `docs` | 文件更新 |
| `test` | 測試新增/修改 |
| `build` | 建置/打包設定 |
| `refactor` | 重構（不改行為） |

---

## 常見陷阱速查

| 症狀 | 根因 | 解法 |
|------|------|------|
| UI 完全空白 / 無反應 | renderer.js 語法錯誤（通常是全域衝突） | 確認 IIFE 包裹完整 |
| `spawn ENOTDIR` | 打包後 ffmpeg 路徑在 app.asar 內 | `fixAsar()` + `asarUnpack` |
| 轉換成功但回傳失敗 | `result.error` vs `!result.success` 判斷錯誤 | 統一用 `result.success` |
| 進度條不動 | `data.percent` vs `data.pct` | 統一用 `data.pct` |
| 語言切換無效 | 新增文字但沒加翻譯 key | 檢查 `i18n.js` 雙語 |
| Apple 無法驗證 | 未簽名的 macOS app | `xattr -cr` 或 System Settings |
| `file.path` 為 undefined | Electron v32+ 移除了 `file.path` | 用 `webUtils.getPathForFile()` |

---

## 資源檔索引

需要更深入的資訊時，讀取以下檔案：

- **`references/api-contract.md`** — 完整 IPC API 合約表（方法名、參數、回傳值）
- **`references/architecture.md`** — 專案架構詳解、資料流圖、技術決策記錄
- **`references/troubleshooting.md`** — 已知問題與解法清單、除錯步驟
- **`agents/bug-fixer.md`** — Bug 修復 SOP 子代理指令
- **`agents/feature-builder.md`** — 功能擴充 SOP 子代理指令
- **`agents/release-manager.md`** — 建置發佈 SOP 子代理指令
