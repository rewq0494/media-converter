const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

const AUDIO_EXTS = new Set(['mp3','wav','aac','flac','ogg','m4a','opus','wma']);

function buildFFmpegArgs({ inputPath, outputPath, outputExt, options = {} }) {
  const args = ['-y', '-i', inputPath, '-progress', 'pipe:1', '-nostats'];
  const isAudio = AUDIO_EXTS.has(outputExt);

  if (isAudio) {
    args.push('-vn');  // 移除影片軌道

    // codec
    const codec = options.codec || options.audioCodec;
    if (codec) args.push('-acodec', codec);

    // bitrate
    if (options.audioBitrate) args.push('-b:a', options.audioBitrate);

    // 音質 (ogg)
    if (options.audioQuality != null) args.push('-q:a', String(options.audioQuality));

    // 取樣率
    if (options.sampleRate) args.push('-ar', String(options.sampleRate));

    // flac 壓縮等級
    if (options.compressionLevel != null) args.push('-compression_level', String(options.compressionLevel));

  } else {
    // 影片處理
    if (outputExt === 'gif') {
      const fps = options.fps || 15;
      const scale = options.scale || 480;
      args.push('-vf', `fps=${fps},scale=${scale}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`);
    } else {
      if (options.videoCodec) args.push('-vcodec', options.videoCodec);
      if (options.audioCodec) args.push('-acodec', options.audioCodec);
      if (options.crf != null) args.push('-crf', String(options.crf));
      if (options.audioBitrate) args.push('-b:a', options.audioBitrate);
    }
  }

  args.push(outputPath);
  return args;
}

function parseProgress(line, totalDuration) {
  if (!line.startsWith('out_time_us=')) return null;
  if (!totalDuration || totalDuration <= 0) return null;

  const us = parseInt(line.split('=')[1]);
  if (isNaN(us)) return null;

  const seconds = us / 1_000_000;
  const pct = (seconds / totalDuration) * 100;
  return Math.min(Math.round(pct), 99);
}

function runFFmpeg({ inputPath, outputPath, outputExt, options, duration, onProgress, onLog }) {
  return new Promise((resolve, reject) => {
    const args = buildFFmpegArgs({ inputPath, outputPath, outputExt, options });
    const proc = spawn(ffmpegPath, args);
    let errorOutput = '';

    proc.stdout.on('data', chunk => {
      const lines = chunk.toString().split('\n');
      lines.forEach(line => {
        const pct = parseProgress(line.trim(), duration);
        if (pct !== null && onProgress) onProgress(pct);
      });
    });

    proc.stderr.on('data', chunk => {
      const text = chunk.toString();
      errorOutput += text;
      if (onLog) onLog(text);
    });

    proc.on('close', code => {
      if (code === 0) {
        if (onProgress) onProgress(100);
        resolve({ success: true, outputPath });
      } else {
        reject(new Error(`ffmpeg 結束碼 ${code}: ${errorOutput.slice(-500)}`));
      }
    });

    proc.on('error', err => {
      reject(new Error(`無法啟動 ffmpeg: ${err.message}`));
    });

    // 回傳 cancel 函式
    proc.cancel = () => proc.kill('SIGTERM');
    return proc;
  });
}

module.exports = { buildFFmpegArgs, parseProgress, runFFmpeg };
