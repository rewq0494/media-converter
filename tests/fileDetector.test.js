const { detectFile } = require('../src/fileDetector');
const { execFile } = require('child_process');

jest.mock('child_process');

describe('fileDetector', () => {
  const mockFFprobeOutput = (streams, format) => {
    execFile.mockImplementation((bin, args, opts, cb) => {
      cb(null, JSON.stringify({ streams, format }), '');
    });
  };

  test('偵測 MP4 影片檔', async () => {
    mockFFprobeOutput(
      [
        { codec_type: 'video', codec_name: 'h264', width: 1920, height: 1080, r_frame_rate: '30/1' },
        { codec_type: 'audio', codec_name: 'aac', sample_rate: '44100', channels: 2 }
      ],
      { format_name: 'mov,mp4,m4a,3gp,3g2,mj2', duration: '120.5', size: '10485760', bit_rate: '696320' }
    );

    const result = await detectFile('/test/video.mp4');
    expect(result.type).toBe('video');
    expect(result.format).toBe('mp4');
    expect(result.video.codec).toBe('h264');
    expect(result.video.width).toBe(1920);
    expect(result.video.height).toBe(1080);
    expect(result.audio.codec).toBe('aac');
    expect(result.audio.sampleRate).toBe(44100);
    expect(result.duration).toBeCloseTo(120.5, 1);
  });

  test('偵測純音訊 MP3', async () => {
    mockFFprobeOutput(
      [{ codec_type: 'audio', codec_name: 'mp3', sample_rate: '44100', channels: 2 }],
      { format_name: 'mp3', duration: '240.0', size: '3840000', bit_rate: '128000' }
    );

    const result = await detectFile('/test/audio.mp3');
    expect(result.type).toBe('audio');
    expect(result.format).toBe('mp3');
    expect(result.video).toBeNull();
    expect(result.audio.sampleRate).toBe(44100);
  });

  test('偵測 WAV 音訊', async () => {
    mockFFprobeOutput(
      [{ codec_type: 'audio', codec_name: 'pcm_s16le', sample_rate: '16000', channels: 1 }],
      { format_name: 'wav', duration: '60.0', size: '1920000', bit_rate: '256000' }
    );

    const result = await detectFile('/test/audio.wav');
    expect(result.type).toBe('audio');
    expect(result.format).toBe('wav');
    expect(result.audio.channels).toBe(1);
  });

  test('偵測 MKV 影片', async () => {
    mockFFprobeOutput(
      [
        { codec_type: 'video', codec_name: 'hevc', width: 3840, height: 2160, r_frame_rate: '60/1' },
        { codec_type: 'audio', codec_name: 'opus', sample_rate: '48000', channels: 6 }
      ],
      { format_name: 'matroska,webm', duration: '3600.0', size: '5368709120', bit_rate: '11931904' }
    );

    const result = await detectFile('/test/video.mkv');
    expect(result.type).toBe('video');
    expect(result.format).toBe('mkv');
    expect(result.video.codec).toBe('hevc');
    expect(result.audio.channels).toBe(6);
  });

  test('檔案不存在時拋出錯誤', async () => {
    execFile.mockImplementation((bin, args, opts, cb) => {
      cb(new Error('No such file'), '', 'No such file');
    });

    await expect(detectFile('/not/exist.mp4')).rejects.toThrow();
  });

  test('空路徑時拋出錯誤', async () => {
    await expect(detectFile('')).rejects.toThrow('檔案路徑不能為空');
    await expect(detectFile(undefined)).rejects.toThrow('檔案路徑不能為空');
  });

  test('解析 frame rate（分數格式）', async () => {
    mockFFprobeOutput(
      [{ codec_type: 'video', codec_name: 'h264', width: 1280, height: 720, r_frame_rate: '24000/1001' }],
      { format_name: 'mov,mp4,m4a,3gp,3g2,mj2', duration: '90.0', size: '1000000', bit_rate: '88888' }
    );

    const result = await detectFile('/test/video.mp4');
    expect(result.video.fps).toBeCloseTo(23.976, 2);
  });
});

// ── Boundary tests ────────────────────────────────────────────────────────

describe('detectFile boundary cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    execFile.mockImplementation((bin, args, opts, cb) => {
      cb(null, JSON.stringify({
        format: { filename: '/path/to/file', duration: '0', size: '1024', format_name: 'wav' },
        streams: [{ codec_type: 'audio', codec_name: 'pcm_s16le', sample_rate: '44100' }],
      }), '');
    });
  });

  test('handles zero-duration file gracefully', async () => {
    const result = await detectFile('/path/to/silent.wav');
    expect(result.duration).toBe(0);
    expect(result.audio).not.toBeNull();
  });

  test('detects audio-only file (no video streams)', async () => {
    const result = await detectFile('/path/to/audio.mp3');
    expect(result.video).toBeNull();
    expect(result.audio).not.toBeNull();
  });

  test('detects video-only file (no audio streams)', async () => {
    execFile.mockImplementationOnce((bin, args, opts, cb) => {
      cb(null, JSON.stringify({
        format: { filename: '/path/video.mp4', duration: '10', size: '500000', format_name: 'mp4' },
        streams: [{ codec_type: 'video', codec_name: 'h264', width: 1280, height: 720 }],
      }), '');
    });
    const result = await detectFile('/path/video.mp4');
    expect(result.audio).toBeNull();
    expect(result.video).not.toBeNull();
    expect(result.type).toBe('video');
  });

  test('handles file path with unicode characters', async () => {
    const result = await detectFile('/Users/用戶/下載/會議錄製 影片.mp4');
    expect(result).toBeDefined();
    expect(result.format).toBeDefined();
  });

  test('handles file path with spaces', async () => {
    const result = await detectFile('/Users/John Doe/Downloads/my video file.mp4');
    expect(result).toBeDefined();
    expect(result.type).toBeDefined();
  });
});
