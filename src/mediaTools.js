const fs = require('fs');
const path = require('path');
const metadata = require('../package.json');

/** 本機精簡版共用 Homebrew 工具；一般版仍使用內附工具。 */
function getMediaTool(name, local = metadata.localMediaTools === true) {
  if (!['ffmpeg', 'ffprobe'].includes(name)) throw new Error('Unknown media tool');
  if (!local) {
    const binary = name === 'ffmpeg' ? require('ffmpeg-static') : require('ffprobe-static').path;
    return binary.replace('app.asar', 'app.asar.unpacked');
  }
  // Finder 啟動時 PATH 不一定含 Homebrew，使用固定安裝位置。
  for (const dir of ['/opt/homebrew/bin', '/usr/local/bin']) {
    const binary = path.join(dir, name);
    try {
      fs.accessSync(binary, fs.constants.X_OK);
      return binary;
    } catch (_) { /* 嘗試另一個 Homebrew 安裝位置 */ }
  }
  throw new Error(`本機精簡版找不到 ${name}，請確認 Homebrew FFmpeg 仍已安裝。 / Local build requires Homebrew FFmpeg.`);
}
module.exports = { getMediaTool };
