const { test, expect, _electron: electron } = require('@playwright/test');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const root = path.join(__dirname, '..');
let app, page, dir, video, audio, longVideo;
test.beforeAll(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'media-modes-'));
  video = path.join(dir, 'sample.mp4'); audio = path.join(dir, 'sample.wav');
  const ffmpeg = require('ffmpeg-static');
  execFileSync(ffmpeg, ['-v','error','-n','-f','lavfi','-i','testsrc2=size=1280x720:rate=30','-f','lavfi','-i','sine=frequency=440','-t','2','-c:a','aac','-c:v','libx264','-preset','ultrafast',video]);
  execFileSync(ffmpeg, ['-v','error','-n','-f','lavfi','-i','sine=frequency=440','-t','1',audio]);
  longVideo = path.join(dir, 'long.mp4');
  execFileSync(ffmpeg, ['-v','error','-n','-stream_loop','9','-i',video,'-c','copy',longVideo]);
});
test.beforeEach(async () => {
  app = await electron.launch(process.env.MEDIA_CONVERTER_APP ? {executablePath: process.env.MEDIA_CONVERTER_APP, args: []} : {args:[root]});
  page = await app.firstWindow();
  await page.waitForFunction(() => document.getElementById('heroTitle').textContent.length > 0);
  await page.evaluate(() => window.i18n.setLang('zh-TW'));
  await page.emulateMedia({reducedMotion:'reduce'});
  await app.evaluate(({ipcMain}, dir) => { ipcMain.removeHandler('select-output-dir'); ipcMain.handle('select-output-dir', () => dir); }, dir);
});
test.afterEach(async () => { await app.close(); });
async function loadVideo() {
  await page.locator('#fileInput').setInputFiles(video);
  await page.locator('#nextBtn').click();
  await page.locator('#changeDirBtn').click();
}
test('home exposes both tasks and compression has no format picker', async () => {
  await expect(page.locator('#modeConvert')).toBeVisible();
  await expect(page.locator('#modeCompress')).toBeVisible();
  await page.locator('#modeCompress').click();
  await loadVideo();
  await expect(page.locator('#compressionSettings')).toBeVisible();
  await expect(page.locator('#conversionSettings')).toBeHidden();
  await expect(page.locator('#convertBtn')).toHaveText('開始壓縮 ↘');
  await page.locator('[data-profile="small"]').click();
  await page.locator('#langToggle').click();
  await expect(page.locator('[data-profile="small"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#compressionSummary')).toContainText('720p');
  await page.locator('#langToggle').click();
  await page.locator('#convertBtn').click();
  await expect(page.locator('#doneSection')).toBeVisible({timeout:30000});
  const output = await page.locator('#outFilePath').innerText();
  expect(output).toContain('_compressed');
  expect(fs.existsSync(video)).toBe(true);
  execFileSync(require('ffmpeg-static'), ['-v','error','-i',output,'-f','null','-']);
});
test('switching tasks clears compression options and audio conversion works', async () => {
  await page.locator('#modeCompress').click();
  await loadVideo();
  await page.locator('#modeConvert').click();
  await expect(page.locator('#compressionSettings')).toBeHidden();
  await expect(page.locator('#convertBtn')).toBeDisabled();
  await page.locator('[data-ext="mp3"]').click();
  await page.locator('#convertBtn').click();
  await expect(page.locator('#doneSection')).toBeVisible({timeout:30000});
  expect(await page.locator('#outFilePath').innerText()).toMatch(/\.mp3$/);
});
test('audio cannot enter compression and only shows audio formats', async () => {
  await page.locator('#modeCompress').click();
  await page.locator('#fileInput').setInputFiles(audio);
  await expect(page.locator('#fileError')).toContainText('這是音訊檔');
  await expect(page.locator('#nextBtn')).toHaveCount(0);
  await page.locator('#modeConvert').click();
  await page.locator('#fileInput').setInputFiles(audio);
  await page.locator('#nextBtn').click();
  await expect(page.locator('[data-ext="mp3"]')).toBeVisible();
  await expect(page.locator('[data-ext="mp4"]')).toHaveCount(0);
});
test('cancel stops a job and lets the user start again', async () => {
  await page.locator('#modeCompress').click();
  await page.locator('#fileInput').setInputFiles(longVideo);
  await page.locator('#nextBtn').click();
  await page.locator('#changeDirBtn').click();
  await page.locator('#convertBtn').click();
  await expect(page.locator('#modeConvert')).toBeDisabled();
  await page.locator('#cancelBtn').click();
  await expect(page.locator('#step2Panel')).toBeVisible({timeout:30000});
  await expect(page.locator('#modeConvert')).toBeEnabled();
  await page.locator('#convertBtn').click();
  await expect(page.locator('#doneSection')).toBeVisible({timeout:30000});
});
test('compact dark layout keeps modes and actions accessible', async () => {
  await page.setViewportSize({width:640,height:520});
  await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});
  await page.locator('#modeCompress').click();
  await loadVideo();
  await expect(page.locator('#convertBtn')).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('batch compression keeps same-name sources separate and shows both results', async () => {
  const sub = path.join(dir, 'same-name'); fs.mkdirSync(sub, {recursive:true});
  const second = path.join(sub, path.basename(video)); fs.copyFileSync(video, second);
  await page.locator('#modeCompress').click();
  await page.locator('#fileInput').setInputFiles([video, second]);
  await expect(page.locator('.selection-row')).toHaveCount(2);
  // Adding an already selected path must not duplicate a job.
  await page.locator('#fileInput').setInputFiles(video);
  await expect(page.locator('.selection-row')).toHaveCount(2);
  await page.locator('#nextBtn').click();
  await page.locator('#changeDirBtn').click();
  await page.locator('#convertBtn').click();
  await expect(page.locator('#doneSection')).toBeVisible({timeout:30000});
  await expect(page.locator('.batch-row.done')).toHaveCount(2);
  await expect(page.locator('[data-reveal]')).toHaveCount(2);
  expect(fs.existsSync(video) && fs.existsSync(second)).toBe(true);
});
test('batch conversion supports mixed inputs, removal and continues after a failed item', async () => {
  const missing = path.join(dir,'missing.mp4'); fs.copyFileSync(video,missing);
  await page.locator('#fileInput').setInputFiles([missing, audio, video]);
  await expect(page.locator('.selection-row')).toHaveCount(3);
  await page.locator('[data-remove="2"]').click();
  await expect(page.locator('.selection-row')).toHaveCount(2);
  await page.locator('#nextBtn').click();
  await expect(page.locator('[data-ext="mp4"]')).toHaveCount(0);
  await page.locator('[data-ext="mp3"]').click();
  await page.locator('#changeDirBtn').click();
  fs.renameSync(missing, missing+'.moved');
  await page.locator('#convertBtn').click();
  await expect(page.locator('#doneSection')).toBeVisible({timeout:30000});
  await expect(page.locator('.batch-row.failed')).toHaveCount(1);
  await expect(page.locator('.batch-row.done')).toHaveCount(1);
  await expect(page.locator('#batchSummary')).toContainText('失敗 1');
});
test('stopping a batch stops the current item and leaves the next one pending', async () => {
  await page.locator('#modeCompress').click();
  await page.locator('#fileInput').setInputFiles([longVideo, video]);
  await page.locator('#nextBtn').click();
  await page.locator('#changeDirBtn').click();
  await page.locator('#convertBtn').click();
  await expect(page.locator('.batch-row.running')).toHaveCount(1);
  await page.locator('#cancelBtn').click();
  await expect(page.locator('#doneSection')).toBeVisible({timeout:30000});
  await expect(page.locator('.batch-row.pending')).toHaveCount(1);
  await expect(page.locator('#doneTitle')).toHaveText('已停止整批');
  await expect(page.locator('#modeConvert')).toBeEnabled();
});
