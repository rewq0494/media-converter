const { buildFFmpegArgs, parseProgress } = require('../src/ffmpegRunner');

describe('ffmpegRunner - buildFFmpegArgs', () => {
  test('音訊轉 mp3', () => {
    const args = buildFFmpegArgs({
      inputPath: '/in/audio.wav',
      outputPath: '/out/audio.mp3',
      outputExt: 'mp3',
      options: { audioBitrate: '192k', sampleRate: 44100 }
    });
    expect(args).toContain('-i');
    expect(args).toContain('/in/audio.wav');
    expect(args).toContain('-b:a');
    expect(args).toContain('192k');
    expect(args).toContain('-ar');
    expect(args).toContain('44100');
    expect(args[args.length - 1]).toBe('/out/audio.mp3');
  });

  test('影片轉 mp4（保留影音）', () => {
    const args = buildFFmpegArgs({
      inputPath: '/in/video.mkv',
      outputPath: '/out/video.mp4',
      outputExt: 'mp4',
      options: { videoCodec: 'libx264', audioCodec: 'aac', crf: 23 }
    });
    expect(args).toContain('-vcodec');
    expect(args).toContain('libx264');
    expect(args).toContain('-acodec');
    expect(args).toContain('aac');
    expect(args).toContain('-crf');
    expect(args).toContain('23');
  });

  test('影片抽取音訊為 wav', () => {
    const args = buildFFmpegArgs({
      inputPath: '/in/video.mp4',
      outputPath: '/out/audio.wav',
      outputExt: 'wav',
      options: { codec: 'pcm_s16le', sampleRate: 44100 }
    });
    expect(args).toContain('-vn');  // 移除影片軌
    expect(args).toContain('-acodec');
    expect(args).toContain('pcm_s16le');
  });

  test('一定包含 -y（覆蓋）和 -progress pipe:1', () => {
    const args = buildFFmpegArgs({
      inputPath: '/in/a.mp3',
      outputPath: '/out/a.wav',
      outputExt: 'wav',
      options: {}
    });
    expect(args).toContain('-y');
    expect(args).toContain('-progress');
    expect(args).toContain('pipe:1');
  });
});

describe('ffmpegRunner - parseProgress', () => {
  const totalDuration = 120; // 秒

  test('解析 out_time_us 計算百分比', () => {
    const line = 'out_time_us=60000000';
    const pct = parseProgress(line, totalDuration);
    expect(pct).toBeCloseTo(50, 0);
  });

  test('out_time_us=0 回傳 0', () => {
    expect(parseProgress('out_time_us=0', totalDuration)).toBe(0);
  });

  test('超過 duration 時夾在 99', () => {
    const line = 'out_time_us=150000000'; // 150秒 > 120秒
    const pct = parseProgress(line, totalDuration);
    expect(pct).toBeLessThanOrEqual(99);
  });

  test('非進度行回傳 null', () => {
    expect(parseProgress('frame=1234', totalDuration)).toBeNull();
    expect(parseProgress('bitrate=512kbits/s', totalDuration)).toBeNull();
  });

  test('duration 為 0 時不崩潰', () => {
    const pct = parseProgress('out_time_us=10000000', 0);
    expect(pct).toBeNull();
  });
});

// ── Boundary tests ────────────────────────────────────────────────────────

describe('buildFFmpegArgs boundary cases', () => {
  test('GIF format generates palette filter pipeline', () => {
    const args = buildFFmpegArgs({ inputPath: '/in/video.mp4', outputPath: '/out/anim.gif', outputExt: 'gif', options: { fps: 15, scale: 480 } });
    const argsStr = args.join(' ');
    expect(argsStr).toContain('palettegen');
    expect(argsStr).toContain('paletteuse');
  });

  test('handles empty options object', () => {
    const args = buildFFmpegArgs({ inputPath: '/in/a.mp4', outputPath: '/out/a.mp3', outputExt: 'mp3', options: {} });
    expect(args).toContain('-y');
    expect(args).toContain('/in/a.mp4');
  });

  test('handles paths with spaces', () => {
    const args = buildFFmpegArgs({ inputPath: '/in/my file.mp4', outputPath: '/out/my result.wav', outputExt: 'wav', options: {} });
    expect(args[args.indexOf('-i') + 1]).toBe('/in/my file.mp4');
    expect(args[args.length - 1]).toBe('/out/my result.wav');
  });

  test('handles paths with unicode characters', () => {
    const args = buildFFmpegArgs({ inputPath: '/下載/影片.mp4', outputPath: '/下載/音訊.mp3', outputExt: 'mp3', options: {} });
    expect(args[args.indexOf('-i') + 1]).toBe('/下載/影片.mp4');
  });

  test('progress pipe flag is included', () => {
    const args = buildFFmpegArgs({ inputPath: '/in/a.mp4', outputPath: '/out/a.mp3', outputExt: 'mp3', options: {} });
    expect(args.join(' ')).toContain('-progress pipe:1');
  });
});

describe('parseProgress boundary cases', () => {
  test('returns null for non-progress lines', () => {
    const result = parseProgress('some random output', 60);
    expect(result).toBeNull();
  });

  test('handles duration=0 without division by zero', () => {
    const result = parseProgress('out_time_us=5000000', 0);
    expect(result).toBeNull();
  });

  test('caps progress at 99 before completion', () => {
    const result = parseProgress('out_time_us=999999999999', 10);
    expect(result).not.toBeNull();
    if (result !== null) expect(result).toBeLessThanOrEqual(99);
  });
});
