const { execFile } = require('child_process');
const ffprobePath = require('ffprobe-static').path;

const FORMAT_MAP = {
  'mov,mp4,m4a,3gp,3g2,mj2': 'mp4',
  'matroska,webm': 'mkv',
  'mp3': 'mp3',
  'wav': 'wav',
  'flac': 'flac',
  'aac': 'aac',
  'ogg': 'ogg',
  'avi': 'avi',
  'wmv': 'wmv',
  'asf': 'wmv',
  'mpeg': 'mpeg',
  'mov': 'mov',
  'webm': 'webm',
  'm4a': 'm4a',
  'opus': 'opus',
  'wma': 'wma',
};

function normalizeFormat(formatName, filePath) {
  for (const [key, val] of Object.entries(FORMAT_MAP)) {
    if (formatName.includes(key)) return val;
  }
  const ext = filePath.split('.').pop().toLowerCase();
  return ext || 'unknown';
}

function parseFps(r_frame_rate) {
  if (!r_frame_rate) return null;
  const parts = r_frame_rate.split('/');
  if (parts.length === 2) {
    const fps = parseFloat(parts[0]) / parseFloat(parts[1]);
    return Math.round(fps * 1000) / 1000;
  }
  return parseFloat(r_frame_rate);
}

function detectFile(filePath) {
  return new Promise((resolve, reject) => {
    if (!filePath) return reject(new Error('檔案路徑不能為空'));

    const args = [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      filePath
    ];

    execFile(ffprobePath, args, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(`ffprobe 錯誤: ${err.message}`));

      let data;
      try {
        data = JSON.parse(stdout);
      } catch (e) {
        return reject(new Error('無法解析 ffprobe 輸出'));
      }

      const { streams = [], format = {} } = data;
      const videoStream = streams.find(s => s.codec_type === 'video');
      const audioStream = streams.find(s => s.codec_type === 'audio');

      const result = {
        type: videoStream ? 'video' : 'audio',
        format: normalizeFormat(format.format_name || '', filePath),
        duration: parseFloat(format.duration) || 0,
        size: parseInt(format.size) || 0,
        bitrate: parseInt(format.bit_rate) || 0,
        video: videoStream ? {
          codec: videoStream.codec_name,
          width: videoStream.width,
          height: videoStream.height,
          fps: parseFps(videoStream.r_frame_rate),
        } : null,
        audio: audioStream ? {
          codec: audioStream.codec_name,
          sampleRate: parseInt(audioStream.sample_rate) || 0,
          channels: audioStream.channels || 1,
        } : null,
      };

      resolve(result);
    });
  });
}

module.exports = { detectFile };
