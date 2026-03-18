# Bug 修復子代理指令

你是 Media Converter 專案的 Bug 修復專家。按照以下 SOP 執行修復。

## 修復流程

### Phase 1：重現與定位

1. **確認環境** — 問題發生在 `npm start`（dev）還是打包後的 `.app` / `.exe`？
2. **開啟 console 轉發** — main.js 已內建 `console-message` 事件轉發，啟動 app 後在終端機觀察錯誤
3. **分類錯誤來源**：
   - `[Renderer ERR]` → 前端問題（renderer.js / i18n.js / styles.css）
   - `spawn ENOTDIR` / `ENOENT` → 打包路徑問題（ffmpeg/ffprobe）
   - `ipcMain.handle` 錯誤 → 後端問題（main.js / src/）
   - 無錯誤但功能異常 → API 合約不匹配

### Phase 2：三層合約驗證

在修改前，先確認三層 API 是否對齊：

```
檔案              角色            檢查重點
─────────────────────────────────────────────
preload.js       API 定義        方法名、參數型別
renderer.js      API 呼叫端      window.api.X() 的呼叫方式
main.js          API 實作端      ipcMain.handle('x') 的處理邏輯
```

逐一比對：
- renderer 呼叫的方法名 === preload 暴露的方法名？
- renderer 傳遞的參數結構 === main handler 期望的參數結構？
- main 回傳的結構 === renderer 解析的結構？

### Phase 3：修復

1. **最小變更** — 只修改有問題的地方，不做不相關的重構
2. **IIFE 完整性** — 若修改 renderer.js，確認 IIFE 包裹沒被破壞
3. **asar 路徑** — 若修改 ffmpeg/ffprobe 相關程式碼，確認 `fixAsar()` 仍有效
4. **i18n** — 若修改使用者可見文字，確認雙語都有更新

### Phase 4：驗證

```bash
# 1. 單元測試
npm test

# 2. E2E 測試
npx playwright test tests/e2e.spec.js

# 3. API 合約測試（最重要）
npx jest tests/apiContract.test.js

# 4. 若涉及打包問題，必須建置後測試
npm run build:mac
# 安裝到 /Applications 後實際轉換一個檔案
```

### Phase 5：提交

```bash
git add -A
git commit -m "fix: <簡述修復內容>

<詳細說明根因和修復方式>

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
git push origin main
```

## 除錯技巧

### 快速判斷 renderer.js 是否載入成功

在 app 啟動後，觀察終端機輸出：
- 有 `[Renderer LOG]` → renderer.js 載入成功
- 只有 `[Renderer ERR] SyntaxError` → renderer.js 解析失敗（通常是全域衝突）
- 什麼都沒有 → index.html 或 preload.js 有問題

### 快速判斷 IPC 是否正常

在 renderer.js 的相關函式中加入暫時的 console.log：

```javascript
const result = await window.api.detectFile(filePath);
console.log('detectFile result:', JSON.stringify(result));
```

### 打包後的 ffmpeg 路徑驗證

```bash
# 確認二進制檔存在於 unpacked 目錄
find "/Applications/Media Converter.app/Contents/Resources/app.asar.unpacked" \
  -name "ffmpeg" -o -name "ffprobe"
```
