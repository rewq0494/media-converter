# 已知問題與除錯指南

## 已解決的問題

### 1. UI 完全無反應（全域作用域衝突）

**症狀**：App 啟動後畫面空白，所有按鈕無反應，console 顯示 `SyntaxError: Identifier 't' has already been declared`

**根因**：`i18n.js` 全域宣告 `function t()`，`renderer.js` 全域宣告 `const t = ...`

**解法**：renderer.js 整體包裹在 IIFE 中：
```javascript
(function () { 'use strict'; /* ... */ })();
```

**預防**：永遠不要移除 IIFE 包裹。新增的 `<script>` 標籤也應考慮作用域隔離。

---

### 2. 打包後轉換失敗 — spawn ENOTDIR

**症狀**：`npm start` 正常，但打包後的 `.app` 轉換失敗，錯誤訊息包含 `spawn ENOTDIR`

**根因**：`require('ffmpeg-static')` 回傳 `app.asar/node_modules/...` 路徑。`app.asar` 是壓縮檔（一個 file），OS 試圖把它當目錄存取 → `ENOTDIR`

**解法**：
1. `package.json` 的 `build.asarUnpack` 加入 ffmpeg-static 和 ffprobe-static
2. 程式碼中用 `fixAsar()` 替換路徑：
```javascript
function fixAsar(p) { return p.replace('app.asar', 'app.asar.unpacked'); }
```

**預防**：任何新增的 native binary 依賴都需要加入 `asarUnpack`。

---

### 3. API 方法名不匹配（7 處）

**症狀**：UI 可見但功能全壞 — 拖拉、選檔、轉換都失敗

**根因**：renderer.js 使用的方法名與 preload.js 暴露的不同：

| renderer 錯誤呼叫 | preload 正確名稱 |
|-------------------|-----------------|
| `getFormats()` | `getOutputFormats(inputType)` |
| `convertFile()` | `startConversion(params)` |
| `quit()` | `quitApp()` |
| `onConvertDone(cb)` | 不存在（用 await） |
| `result.error` | `!result.success` |
| `data.percent` | `data.pct` |

**預防**：修改 API 後跑 `npx jest tests/apiContract.test.js`。

---

### 4. file.path 為 undefined（Electron v32+）

**症狀**：拖拉檔案後 `filePath` 是空字串

**根因**：Electron v32 移除了 renderer 中 `File.path` 屬性

**解法**：preload.js 暴露 `webUtils.getPathForFile(file)`，renderer.js 的 `getFilePath()` 優先使用

---

### 5. Release 下載連結 404

**症狀**：README 中的下載連結點擊後 404

**根因**：GitHub Release 的下載 URL 使用 asset 的 **filename**（不是 label）。若上傳時檔名與連結不符就 404

**解法**：上傳前先重新命名檔案，確保與 README 連結完全一致

---

## 除錯工具

### Renderer Console 轉發

main.js 已內建 console 轉發，啟動 app 後在終端機看：

```
[Renderer LOG] 一般訊息
[Renderer WARN] 警告
[Renderer ERR] 錯誤（重要！）
```

### 手動 FFmpeg 測試

若懷疑是 FFmpeg 參數問題，直接在終端機測試：

```bash
# 取得 ffmpeg 路徑
node -e "console.log(require('ffmpeg-static'))"

# 手動執行轉換
/path/to/ffmpeg -y -i input.mp4 -vn -acodec pcm_s16le -ar 44100 output.wav
```

### 打包後路徑驗證

```bash
# 檢查 asar.unpacked 內容
find "/Applications/Media Converter.app/Contents/Resources/app.asar.unpacked" \
  -type f -name "ffmpeg" -o -name "ffprobe"

# 測試 fixAsar 邏輯
node -e "
const p = '/path/to/app.asar/node_modules/ffmpeg-static/ffmpeg';
console.log(p.replace('app.asar', 'app.asar.unpacked'));
"
```

### E2E 測試除錯模式

```bash
# 有頭模式（可看到 app 畫面）
PWDEBUG=1 npx playwright test tests/e2e.spec.js

# 單一測試
npx playwright test tests/e2e.spec.js -g "should launch"
```

## 潛在風險

| 風險 | 觸發條件 | 緩解措施 |
|------|----------|----------|
| ffmpeg-static 版本更新後路徑變化 | `npm update` | 更新後重跑打包測試 |
| Electron 大版本升級 | 升級 Electron | 檢查 `webUtils`、`contextBridge`、`sandbox` API |
| macOS 簽名政策變更 | Apple 系統更新 | 關注 Gatekeeper 變化，必要時購買 Developer ID |
| 新格式的 ffmpeg 參數不相容 | 新增格式 | 先手動 `ffmpeg` 指令測試再寫入程式碼 |
