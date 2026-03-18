/**
 * API Contract Test
 * Ensures renderer.js only calls methods that exist in preload.js,
 * and that response shapes match between main.js handlers and renderer.js consumers.
 */
const fs = require('fs');
const path = require('path');

const rendererSrc = fs.readFileSync(path.join(__dirname, '..', 'renderer', 'renderer.js'), 'utf8');
const preloadSrc  = fs.readFileSync(path.join(__dirname, '..', 'preload.js'), 'utf8');
const mainSrc     = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');

// Extract all window.api.XXX calls from renderer.js
function extractRendererAPICalls(src) {
  const pattern = /window\.api\.(\w+)/g;
  const methods = new Set();
  let m;
  while ((m = pattern.exec(src))) methods.add(m[1]);
  return methods;
}

// Extract all exposed methods from preload.js contextBridge
function extractPreloadMethods(src) {
  const pattern = /^\s+(\w+)\s*[:]/gm;
  const block = src.match(/exposeInMainWorld\('api',\s*\{([\s\S]*?)\}\);/);
  if (!block) return new Set();
  const methods = new Set();
  let m;
  const inner = block[1];
  const lines = inner.split('\n');
  for (const line of lines) {
    const match = line.match(/^\s+(\w+)\s*:/);
    if (match) methods.add(match[1]);
  }
  return methods;
}

// Extract IPC handler names from main.js
function extractMainHandlers(src) {
  const pattern = /ipcMain\.handle\('([^']+)'/g;
  const handlers = new Set();
  let m;
  while ((m = pattern.exec(src))) handlers.add(m[1]);
  return handlers;
}

describe('API Contract: renderer ↔ preload ↔ main', () => {
  const rendererMethods = extractRendererAPICalls(rendererSrc);
  const preloadMethods  = extractPreloadMethods(preloadSrc);
  const mainHandlers    = extractMainHandlers(mainSrc);

  test('every window.api.X() in renderer exists in preload', () => {
    const missing = [];
    for (const method of rendererMethods) {
      if (!preloadMethods.has(method)) missing.push(method);
    }
    expect(missing).toEqual([]);
  });

  test('preload exposes: detectFile, getOutputFormats, getPreset, startConversion, cancelConversion, quitApp, selectOutputDir, openFolder, getDownloadsPath, getPathForFile, onProgress', () => {
    const required = [
      'detectFile', 'getOutputFormats', 'getPreset',
      'startConversion', 'cancelConversion', 'quitApp',
      'selectOutputDir', 'openFolder', 'getDownloadsPath',
      'getPathForFile', 'onProgress',
    ];
    for (const method of required) {
      expect(preloadMethods.has(method)).toBe(true);
    }
  });

  test('renderer does NOT call deprecated API names', () => {
    const deprecated = ['getFormats', 'convertFile', 'quit', 'onConvertDone'];
    for (const name of deprecated) {
      expect(rendererMethods.has(name)).toBe(false);
    }
  });

  test('renderer handles detect-file response shape { success, data }', () => {
    expect(rendererSrc).toMatch(/result\.success/);
    expect(rendererSrc).toMatch(/result\.data/);
    // Should NOT read result.error without checking success first
    expect(rendererSrc).not.toMatch(/if\s*\(\s*result\.error\s*\)/);
  });

  test('renderer handles progress shape { pct }', () => {
    expect(rendererSrc).toMatch(/data\.pct/);
    expect(rendererSrc).not.toMatch(/data\.percent/);
  });

  test('renderer calls startConversion with correct param names', () => {
    expect(rendererSrc).toMatch(/outputExt:\s*state\.selectedFormat/);
    expect(rendererSrc).toMatch(/duration:/);
    // Should NOT pass outputFormat (old name)
    expect(rendererSrc).not.toMatch(/outputFormat:\s*state/);
  });

  test('renderer handles conversion result via await (not onConvertDone)', () => {
    // startConversion result should be checked inline
    expect(rendererSrc).toMatch(/const result = await window\.api\.startConversion/);
    expect(rendererSrc).toMatch(/result\.success/);
    expect(rendererSrc).toMatch(/result\.outputPath/);
  });

  test('main.js has matching IPC handlers for preload invoke calls', () => {
    const invokePattern = /ipcRenderer\.invoke\('([^']+)'/g;
    const preloadInvokes = new Set();
    let m;
    while ((m = invokePattern.exec(preloadSrc))) preloadInvokes.add(m[1]);

    const missing = [];
    for (const channel of preloadInvokes) {
      if (!mainHandlers.has(channel)) missing.push(channel);
    }
    expect(missing).toEqual([]);
  });
});
