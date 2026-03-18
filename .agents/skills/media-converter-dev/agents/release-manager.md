# 建置發佈子代理指令

你是 Media Converter 專案的建置與發佈管理員。按照以下 SOP 執行。

## 發佈前檢查

```bash
# 1. 確認所有測試通過
npm test

# 2. 確認 dev 模式正常
npm start
# 手動測試：拖拉檔案 → 選格式 → 轉換 → 完成

# 3. 確認 git 乾淨
git status  # 應為 nothing to commit
```

## 版本號更新

遵循 [Semantic Versioning](https://semver.org/)：

| 變更類型 | 版本位 | 範例 |
|----------|--------|------|
| Bug 修復 | patch | 1.1.0 → 1.1.1 |
| 新功能（向下相容） | minor | 1.1.0 → 1.2.0 |
| 破壞性變更 | major | 1.1.0 → 2.0.0 |

```bash
# 更新 package.json 中的 version
npm version <patch|minor|major> --no-git-tag-version
```

## 建置流程

### macOS 建置

```bash
npm run build:mac
```

產出（在 `dist/` 目錄）：
- `Media Converter-{version}-arm64.dmg` — Apple Silicon
- `Media Converter-{version}.dmg` — Intel x64
- 對應的 `.zip` 和 `.blockmap` 檔案

### Windows 建置（從 macOS 交叉編譯）

```bash
npm run build:win
```

產出：
- `Media Converter Setup {version}.exe` — NSIS 安裝程式

### 建置後驗證（重要！）

```bash
# 安裝到 /Applications
cp -R "dist/mac-arm64/Media Converter.app" "/Applications/"
xattr -cr "/Applications/Media Converter.app"

# 驗證 ffmpeg/ffprobe 已正確解壓
find "/Applications/Media Converter.app/Contents/Resources/app.asar.unpacked" \
  -name "ffmpeg" -o -name "ffprobe"
# 應該要有檔案列出

# 啟動並測試一次完整轉換
open "/Applications/Media Converter.app"
```

## 上傳 GitHub Release

### 檔案命名規範

上傳到 GitHub Release 的檔名**必須**與 README.md 中的下載連結一致：

| 平台 | 檔名 |
|------|------|
| macOS Apple Silicon | `Media-Converter-macOS-Apple-Silicon.dmg` |
| macOS Intel | `Media-Converter-macOS-Intel.dmg` |
| Windows | `Media-Converter-Windows-Setup.exe` |

### 完整發佈指令

```bash
VERSION="1.2.0"  # 替換為實際版本號

# 1. 複製並重新命名檔案
cp "dist/Media Converter-${VERSION}-arm64.dmg" "dist/Media-Converter-macOS-Apple-Silicon.dmg"
cp "dist/Media Converter-${VERSION}.dmg" "dist/Media-Converter-macOS-Intel.dmg"
cp "dist/Media Converter Setup ${VERSION}.exe" "dist/Media-Converter-Windows-Setup.exe"

# 2. 建立 git tag
git tag "v${VERSION}" HEAD
git push origin "v${VERSION}"

# 3. 建立 GitHub Release
gh release create "v${VERSION}" \
  "dist/Media-Converter-macOS-Apple-Silicon.dmg" \
  "dist/Media-Converter-macOS-Intel.dmg" \
  "dist/Media-Converter-Windows-Setup.exe" \
  --title "v${VERSION} — 標題" \
  --notes-file release-notes.md

# 4. 確認上傳成功
gh release view "v${VERSION}" --json assets -q '.assets[].name'
```

### Release Notes 範本

```markdown
## 🎉 v${VERSION}

### ⬇️ 下載 / Download

| 平台 | 檔案 |
|------|------|
| 🍎 macOS (Apple Silicon M1/M2/M3/M4) | `Media-Converter-macOS-Apple-Silicon.dmg` |
| 🍎 macOS (Intel) | `Media-Converter-macOS-Intel.dmg` |
| 🪟 Windows (64-bit) | `Media-Converter-Windows-Setup.exe` |

### 修復內容 / Fixes
- ✅ 項目一
- ✅ 項目二

### 新功能 / New Features
- 🆕 項目一
```

## 更新 README

發佈後必須更新 `README.md` 中的：

1. **下載連結** — 6 個連結（中文段落 3 個 + 英文段落 3 個），版本號替換
2. **測試數量** — 若測試數量有變更

搜尋替換指令：
```bash
# 替換所有版本號引用
sed -i '' "s/v1.1.0/v${VERSION}/g" README.md
```

## 發佈後檢查清單

- [ ] `npm test` 全部通過
- [ ] macOS 建置成功 + 手動轉換測試通過
- [ ] Windows 建置成功
- [ ] git tag 指向正確的 commit（最新的）
- [ ] GitHub Release 三個檔案都上傳成功
- [ ] 下載連結實際可點擊下載（檔名完全一致）
- [ ] README.md 版本號已更新
- [ ] Release notes 包含所有變更
- [ ] 所有變更已 commit + push
