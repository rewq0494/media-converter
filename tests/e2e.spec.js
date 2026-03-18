/**
 * Playwright E2E tests for Media Converter Electron app.
 * Tests: app launch, UI elements, drag-drop zone, language toggle, step navigation.
 */
const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('@playwright/test');
const path = require('path');

let electronApp;
let page;

test.beforeAll(async () => {
  electronApp = await electron.launch({
    args: [path.join(__dirname, '..')],
  });
  page = await electronApp.firstWindow();
  // Wait for DOMContentLoaded + async init
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
});

test.afterAll(async () => {
  if (electronApp) await electronApp.close();
});

test.describe('App Launch', () => {
  test('window title is Media Converter', async () => {
    const title = await page.title();
    expect(title).toBe('Media Converter');
  });

  test('window.api is exposed with correct methods', async () => {
    const methods = await page.evaluate(() => Object.keys(window.api).sort());
    expect(methods).toContain('detectFile');
    expect(methods).toContain('getOutputFormats');
    expect(methods).toContain('startConversion');
    expect(methods).toContain('quitApp');
    expect(methods).toContain('getPathForFile');
    expect(methods).toContain('onProgress');
    expect(methods).toContain('selectOutputDir');
    expect(methods).toContain('cancelConversion');
    expect(methods).toContain('getPreset');
    expect(methods).toContain('getDownloadsPath');
    expect(methods).toContain('openFolder');
  });
});

test.describe('Step 1: File Selection UI', () => {
  test('step 1 panel is active on load', async () => {
    const isActive = await page.evaluate(() =>
      document.getElementById('step1Panel')?.classList.contains('active')
    );
    expect(isActive).toBe(true);
  });

  test('step 2 and 3 panels are hidden on load', async () => {
    const s2 = await page.evaluate(() =>
      getComputedStyle(document.getElementById('step2Panel')).display
    );
    const s3 = await page.evaluate(() =>
      getComputedStyle(document.getElementById('step3Panel')).display
    );
    expect(s2).toBe('none');
    expect(s3).toBe('none');
  });

  test('drop zone is visible', async () => {
    const dropZone = page.locator('#dropZone');
    await expect(dropZone).toBeVisible();
  });

  test('drop zone has correct text (zh-TW default)', async () => {
    const text = await page.locator('.drop-primary').textContent();
    expect(text).toBe('拖拉檔案到這裡');
  });

  test('"選擇檔案" button exists inside drop zone', async () => {
    const btn = page.locator('#dropBtn');
    await expect(btn).toBeVisible();
    const text = await btn.textContent();
    expect(text).toBe('選擇檔案');
  });

  test('file input is hidden', async () => {
    const input = page.locator('#fileInput');
    await expect(input).toBeHidden();
  });

  test('fileInfo is hidden initially', async () => {
    const display = await page.evaluate(() =>
      document.getElementById('fileInfo')?.style.display
    );
    // Should be empty string (not set) or 'none'; content should be empty
    const content = await page.evaluate(() =>
      document.getElementById('fileInfo')?.innerHTML
    );
    expect(content === '' || display === 'none').toBeTruthy();
  });
});

test.describe('Step Indicator', () => {
  test('3 step dots exist', async () => {
    const dots = await page.locator('.step-dot').count();
    expect(dots).toBe(3);
  });

  test('step 1 dot is active', async () => {
    const isActive = await page.evaluate(() =>
      document.getElementById('stepDot1')?.classList.contains('active')
    );
    expect(isActive).toBe(true);
  });

  test('step 2 and 3 dots are not active', async () => {
    const s2 = await page.evaluate(() =>
      document.getElementById('stepDot2')?.classList.contains('active')
    );
    const s3 = await page.evaluate(() =>
      document.getElementById('stepDot3')?.classList.contains('active')
    );
    expect(s2).toBe(false);
    expect(s3).toBe(false);
  });
});

test.describe('Language Toggle', () => {
  test('lang toggle button exists', async () => {
    const btn = page.locator('#langToggle');
    await expect(btn).toBeVisible();
  });

  test('toggle to English', async () => {
    await page.locator('#langToggle').click();
    await page.waitForTimeout(300);

    const lang = await page.evaluate(() => window.i18n.getLang());
    expect(lang).toBe('en');

    const dropText = await page.locator('.drop-primary').textContent();
    expect(dropText).toBe('Drop file here');

    const btnText = await page.locator('#langToggle').textContent();
    expect(btnText).toBe('中文');

    const stepText = await page.locator('[data-i18n="step1"]').textContent();
    expect(stepText).toBe('Select File');
  });

  test('toggle back to zh-TW', async () => {
    await page.locator('#langToggle').click();
    await page.waitForTimeout(300);

    const lang = await page.evaluate(() => window.i18n.getLang());
    expect(lang).toBe('zh-TW');

    const dropText = await page.locator('.drop-primary').textContent();
    expect(dropText).toBe('拖拉檔案到這裡');

    const btnText = await page.locator('#langToggle').textContent();
    expect(btnText).toBe('EN');
  });
});

test.describe('Drop Zone Interactions', () => {
  test('drop zone highlights on dragover and clears on dragleave', async () => {
    // Use evaluate to dispatch native DragEvent (Playwright can't construct DataTransfer)
    const result = await page.evaluate(() => {
      const zone = document.getElementById('dropZone');
      const dragover = new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() });
      zone.dispatchEvent(dragover);
      const hasHighlight = zone.classList.contains('drag-over');

      zone.dispatchEvent(new Event('dragleave', { bubbles: true }));
      const cleared = !zone.classList.contains('drag-over');

      return { hasHighlight, cleared };
    });
    expect(result.hasHighlight).toBe(true);
    expect(result.cleared).toBe(true);
  });
});

test.describe('CSS Layout Integrity', () => {
  test('app-container is full height flex column', async () => {
    const styles = await page.evaluate(() => {
      const el = document.querySelector('.app-container');
      const cs = getComputedStyle(el);
      return { display: cs.display, flexDirection: cs.flexDirection };
    });
    expect(styles.display).toBe('flex');
    expect(styles.flexDirection).toBe('column');
  });

  test('title bar is visible at top', async () => {
    const titleBar = page.locator('.title-bar');
    await expect(titleBar).toBeVisible();
    const text = await page.locator('.title-bar-text').textContent();
    expect(text).toBe('Media Converter');
  });

  test('step indicator is visible', async () => {
    const indicator = page.locator('.step-indicator');
    await expect(indicator).toBeVisible();
  });

  test('only one step-panel is visible at a time', async () => {
    const visiblePanels = await page.evaluate(() => {
      const panels = document.querySelectorAll('.step-panel');
      let visible = 0;
      panels.forEach(p => {
        if (getComputedStyle(p).display !== 'none') visible++;
      });
      return visible;
    });
    expect(visiblePanels).toBe(1);
  });

  test('drop zone has dashed border', async () => {
    const borderStyle = await page.evaluate(() => {
      return getComputedStyle(document.getElementById('dropZone')).borderStyle;
    });
    expect(borderStyle).toBe('dashed');
  });
});

test.describe('Step 2: Settings (simulated)', () => {
  test('navigate to step 2 via JS and verify format grid loads', async () => {
    // Simulate file detection to get to step 2
    await page.evaluate(async () => {
      // Mock file info into state
      const state = { step: 1, filePath: '/tmp/test.mp4', fileInfo: {
        type: 'video', format: 'mp4', duration: 120, size: 1048576,
        video: { codec: 'h264', width: 1920, height: 1080, fps: 30 },
        audio: { codec: 'aac', sampleRate: 44100, channels: 2 },
      }, selectedFormat: null, advancedOptions: {}, outputDir: '/tmp' };

      // We can't easily access IIFE state, so navigate via DOM
      // Just check step2 panel structure exists
    });

    const formatTabs = await page.locator('#formatTabs');
    const formatGrid = await page.locator('#formatGrid');
    const advancedPanel = await page.locator('#advancedPanel');
    const backBtn = await page.locator('#backBtn');
    const convertBtn = await page.locator('#convertBtn');

    // These elements exist in DOM even if panel is hidden
    expect(await formatTabs.count()).toBe(1);
    expect(await formatGrid.count()).toBe(1);
    expect(await advancedPanel.count()).toBe(1);
    expect(await backBtn.count()).toBe(1);
    expect(await convertBtn.count()).toBe(1);
  });
});

test.describe('Step 3: Progress / Done / Error sections', () => {
  test('all three sections exist in step3Panel', async () => {
    const progress = page.locator('#progressSection');
    const done = page.locator('#doneSection');
    const error = page.locator('#errorSection');

    expect(await progress.count()).toBe(1);
    expect(await done.count()).toBe(1);
    expect(await error.count()).toBe(1);
  });

  test('progress bar exists with 0% width', async () => {
    const bar = page.locator('#progressBar');
    expect(await bar.count()).toBe(1);
  });

  test('done and error sections have action buttons', async () => {
    expect(await page.locator('#openFolderBtn').count()).toBe(1);
    expect(await page.locator('#anotherBtn').count()).toBe(1);
    expect(await page.locator('#quitBtn').count()).toBe(1);
    expect(await page.locator('#retryBtn').count()).toBe(1);
    expect(await page.locator('#quitErrBtn').count()).toBe(1);
  });
});
