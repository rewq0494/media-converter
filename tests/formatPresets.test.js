const { getPreset, getAllFormats, getOutputFormats } = require('../src/formatPresets');

describe('formatPresets', () => {
  test('getAllFormats 回傳非空陣列', () => {
    const formats = getAllFormats();
    expect(Array.isArray(formats)).toBe(true);
    expect(formats.length).toBeGreaterThan(5);
  });

  test('每個 format 有必要欄位', () => {
    const formats = getAllFormats();
    formats.forEach(f => {
      expect(f).toHaveProperty('ext');
      expect(f).toHaveProperty('label');
      expect(f).toHaveProperty('type');   // 'audio' | 'video'
      expect(f).toHaveProperty('description');
      expect(['audio', 'video']).toContain(f.type);
    });
  });

  test('getPreset 回傳 mp3 預設值', () => {
    const preset = getPreset('mp3');
    expect(preset).toBeDefined();
    expect(preset.audioBitrate).toBeDefined();
    expect(preset.sampleRate).toBeDefined();
    expect(preset.description).toBeTruthy();
  });

  test('getPreset 回傳 wav 預設值', () => {
    const preset = getPreset('wav');
    expect(preset.codec).toBe('pcm_s16le');
    expect(preset.sampleRate).toBeDefined();
  });

  test('getPreset 回傳 mp4 預設值（影片）', () => {
    const preset = getPreset('mp4');
    expect(preset.videoCodec).toBeDefined();
    expect(preset.audioCodec).toBeDefined();
    expect(preset.crf).toBeDefined();
  });

  test('getPreset 未知格式回傳 null', () => {
    const preset = getPreset('unknownxyz');
    expect(preset).toBeNull();
  });

  test('getOutputFormats(audio) 只回傳音訊格式', () => {
    const formats = getOutputFormats('audio');
    formats.forEach(f => expect(f.type).toBe('audio'));
  });

  test('getOutputFormats(video) 包含影片格式', () => {
    const formats = getOutputFormats('video');
    const hasVideo = formats.some(f => f.type === 'video');
    expect(hasVideo).toBe(true);
  });

  test('getOutputFormats(video) 也包含音訊格式（影片可抽取音訊）', () => {
    const formats = getOutputFormats('video');
    const hasAudio = formats.some(f => f.type === 'audio');
    expect(hasAudio).toBe(true);
  });

  test('常見格式都存在', () => {
    const formats = getAllFormats();
    const exts = formats.map(f => f.ext);
    ['mp3', 'wav', 'aac', 'flac', 'mp4', 'mov', 'mkv', 'avi', 'webm'].forEach(ext => {
      expect(exts).toContain(ext);
    });
  });

  test('每個 preset 的進階選項都有 label 和 default', () => {
    const formats = getAllFormats();
    formats.forEach(f => {
      const preset = getPreset(f.ext);
      if (preset && preset.advanced) {
        preset.advanced.forEach(opt => {
          expect(opt).toHaveProperty('key');
          expect(opt).toHaveProperty('label');
          expect(opt).toHaveProperty('default');
          expect(opt).toHaveProperty('hint');
        });
      }
    });
  });
});

// ── Boundary tests ────────────────────────────────────────────────────────

describe('formatPresets boundary cases', () => {
  test('getOutputFormats with unknown type returns all formats', () => {
    const result = getOutputFormats('unknown');
    expect(result.length).toBe(getAllFormats().length);
  });

  test('all formats have descriptionEn for i18n', () => {
    getAllFormats().forEach(f => {
      expect(f.descriptionEn).toBeDefined();
      expect(typeof f.descriptionEn).toBe('string');
    });
  });

  test('all advanced options have labelEn', () => {
    getAllFormats().forEach(f => {
      (f.preset.advanced || []).forEach(opt => {
        expect(opt.labelEn).toBeDefined();
      });
    });
  });

  test('getPreset returns null for non-existent format', () => {
    const result = getPreset('xyz');
    expect(result).toBeNull();
  });

  test('audio format group contains only audio types', () => {
    const audio = getOutputFormats('audio');
    audio.forEach(f => expect(f.type).toBe('audio'));
  });

  test('GIF preset has fps and scale instead of codec', () => {
    const preset = getPreset('gif');
    expect(preset.fps).toBeDefined();
    expect(preset.scale).toBeDefined();
    expect(preset.codec).toBeUndefined();
  });
});
