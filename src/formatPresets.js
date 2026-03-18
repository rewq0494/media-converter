const FORMATS = [
  // ── 音訊 ──────────────────────────────────────────────────────────────
  {
    ext: 'mp3', label: 'MP3', type: 'audio',
    shortDesc: '通用音訊', shortDescEn: 'Universal',
    description: '最廣泛相容的音訊格式，適合音樂、播客、一般用途',
    descriptionEn: 'Most widely compatible audio format, great for music, podcasts, and general use',
    preset: {
      codec: 'libmp3lame', audioBitrate: '192k', sampleRate: 44100,
      description: '192kbps，44.1kHz — 音質與檔案大小平衡點',
      descriptionEn: '192kbps, 44.1kHz — Best balance of quality and file size',
      advanced: [
        { key: 'audioBitrate', label: '位元率', labelEn: 'Bitrate', default: '192k', options: ['64k','96k','128k','192k','256k','320k'], hint: '越高越清晰，但檔案也越大', hintEn: 'Higher = better quality, larger file' },
        { key: 'sampleRate', label: '取樣率', labelEn: 'Sample Rate', default: 44100, options: [22050, 44100, 48000], hint: '44100Hz 為 CD 品質標準', hintEn: '44100Hz is the CD quality standard' },
      ]
    }
  },
  {
    ext: 'wav', label: 'WAV', type: 'audio',
    shortDesc: '無損音質', shortDescEn: 'Lossless',
    description: '無壓縮 PCM 音訊，音質最佳，適合語音辨識、音訊剪輯',
    descriptionEn: 'Uncompressed PCM audio, best quality, ideal for speech recognition and audio editing',
    preset: {
      codec: 'pcm_s16le', sampleRate: 44100,
      description: '16-bit PCM，44.1kHz — 無損品質',
      descriptionEn: '16-bit PCM, 44.1kHz — Lossless quality',
      advanced: [
        { key: 'codec', label: '位元深度', labelEn: 'Bit Depth', default: 'pcm_s16le', options: ['pcm_s16le','pcm_s24le','pcm_s32le','pcm_f32le'], hint: 'pcm_s16le=16bit(標準), s24le=24bit(高品質)', hintEn: 's16le=16bit(standard), s24le=24bit(high quality)' },
        { key: 'sampleRate', label: '取樣率', labelEn: 'Sample Rate', default: 44100, options: [8000, 16000, 22050, 44100, 48000, 96000], hint: '語音辨識建議 16000Hz', hintEn: '16000Hz recommended for speech recognition' },
      ]
    }
  },
  {
    ext: 'aac', label: 'AAC', type: 'audio',
    shortDesc: 'Apple 推薦', shortDescEn: 'Apple Rec.',
    description: '現代高效壓縮格式，Apple 裝置原生支援，同 bitrate 比 MP3 音質更好',
    descriptionEn: 'Modern efficient format, native on Apple devices, better quality than MP3 at same bitrate',
    preset: {
      codec: 'aac', audioBitrate: '192k', sampleRate: 44100,
      description: '192kbps，44.1kHz — 推薦 Apple 生態系使用',
      descriptionEn: '192kbps, 44.1kHz — Recommended for Apple ecosystem',
      advanced: [
        { key: 'audioBitrate', label: '位元率', labelEn: 'Bitrate', default: '192k', options: ['96k','128k','192k','256k','320k'], hint: '128k 即可達 CD 品質聆聽', hintEn: '128k achieves CD-quality listening' },
        { key: 'sampleRate', label: '取樣率', labelEn: 'Sample Rate', default: 44100, options: [44100, 48000], hint: '48000Hz 適合與影片搭配', hintEn: '48000Hz recommended when paired with video' },
      ]
    }
  },
  {
    ext: 'flac', label: 'FLAC', type: 'audio',
    shortDesc: '無損壓縮', shortDescEn: 'Lossless Zip',
    description: '無損壓縮格式，音質等同原始，檔案比 WAV 小約 50%',
    descriptionEn: 'Lossless compression, same quality as original, ~50% smaller than WAV',
    preset: {
      codec: 'flac', sampleRate: 44100, compressionLevel: 5,
      description: '壓縮等級 5，44.1kHz — 無損且體積適中',
      descriptionEn: 'Compression level 5, 44.1kHz — Lossless with moderate file size',
      advanced: [
        { key: 'compressionLevel', label: '壓縮等級', labelEn: 'Compression Level', default: 5, options: [0,1,2,3,4,5,6,7,8], hint: '0=最快/最大，8=最慢/最小，音質不變', hintEn: '0=fastest/largest, 8=slowest/smallest, quality unchanged' },
        { key: 'sampleRate', label: '取樣率', labelEn: 'Sample Rate', default: 44100, options: [44100, 48000, 88200, 96000], hint: '高取樣率適合音樂母帶', hintEn: 'Higher sample rates for music mastering' },
      ]
    }
  },
  {
    ext: 'ogg', label: 'OGG', type: 'audio',
    shortDesc: '開源・遊戲', shortDescEn: 'Open / Game',
    description: '開源格式，音質優於 MP3，適合遊戲音效、網頁音訊',
    descriptionEn: 'Open-source format, better quality than MP3, great for game audio and web',
    preset: {
      codec: 'libvorbis', audioQuality: '5', sampleRate: 44100,
      description: '品質 5（~160kbps），44.1kHz',
      descriptionEn: 'Quality 5 (~160kbps), 44.1kHz',
      advanced: [
        { key: 'audioQuality', label: '品質等級', labelEn: 'Quality Level', default: '5', options: ['0','1','2','3','4','5','6','7','8','9','10'], hint: '0=最低(64kbps), 10=最高(500kbps)', hintEn: '0=lowest(64kbps), 10=highest(500kbps)' },
      ]
    }
  },
  {
    ext: 'm4a', label: 'M4A', type: 'audio',
    shortDesc: 'iTunes 標準', shortDescEn: 'iTunes Std.',
    description: 'AAC 封裝於 MPEG-4 容器，iTunes/Apple Music 標準格式',
    descriptionEn: 'AAC in MPEG-4 container, standard for iTunes/Apple Music',
    preset: {
      codec: 'aac', audioBitrate: '192k', sampleRate: 44100,
      description: '192kbps，44.1kHz — Apple 生態最佳相容性',
      descriptionEn: '192kbps, 44.1kHz — Best compatibility with Apple ecosystem',
      advanced: [
        { key: 'audioBitrate', label: '位元率', labelEn: 'Bitrate', default: '192k', options: ['128k','192k','256k','320k'], hint: '', hintEn: '' },
      ]
    }
  },
  {
    ext: 'opus', label: 'Opus', type: 'audio',
    shortDesc: '通話・串流', shortDescEn: 'Voice / Stream',
    description: '最現代的開源音訊格式，低延遲、高效率，適合通話/串流',
    descriptionEn: 'The most modern open-source audio codec, low latency, ideal for calls and streaming',
    preset: {
      codec: 'libopus', audioBitrate: '128k', sampleRate: 48000,
      description: '128kbps，48kHz — 推薦語音/通話使用',
      descriptionEn: '128kbps, 48kHz — Recommended for voice and calls',
      advanced: [
        { key: 'audioBitrate', label: '位元率', labelEn: 'Bitrate', default: '128k', options: ['32k','64k','96k','128k','192k','256k'], hint: '語音 64k 足夠，音樂建議 128k+', hintEn: '64k sufficient for voice, 128k+ for music' },
      ]
    }
  },
  {
    ext: 'wma', label: 'WMA', type: 'audio',
    shortDesc: 'Windows 專用', shortDescEn: 'Windows',
    description: 'Windows Media Audio，Windows 系統相容格式',
    descriptionEn: 'Windows Media Audio, native Windows compatibility',
    preset: {
      codec: 'wmav2', audioBitrate: '192k', sampleRate: 44100,
      description: '192kbps，44.1kHz — Windows 原生支援',
      descriptionEn: '192kbps, 44.1kHz — Native Windows support',
      advanced: [
        { key: 'audioBitrate', label: '位元率', labelEn: 'Bitrate', default: '192k', options: ['64k','128k','192k','256k','320k'], hint: '', hintEn: '' },
      ]
    }
  },

  // ── 影片 ──────────────────────────────────────────────────────────────
  {
    ext: 'mp4', label: 'MP4', type: 'video',
    shortDesc: '通用影片', shortDescEn: 'Universal',
    description: '最廣泛相容的影片格式，適合所有裝置與平台播放',
    descriptionEn: 'Most widely compatible video format, plays on virtually all devices and platforms',
    preset: {
      videoCodec: 'libx264', audioCodec: 'aac', crf: 23, audioBitrate: '192k',
      description: 'H.264 + AAC，CRF 23 — 相容性最佳、品質與大小平衡',
      descriptionEn: 'H.264 + AAC, CRF 23 — Best compatibility, balanced quality and size',
      advanced: [
        { key: 'crf', label: '視訊品質 (CRF)', labelEn: 'Video Quality (CRF)', default: 23, options: [18,20,23,26,28,30], hint: '18=近無損(大), 23=標準, 30=較低品質(小)', hintEn: '18=near lossless(large), 23=standard, 30=lower quality(small)' },
        { key: 'videoCodec', label: '視訊編碼', labelEn: 'Video Codec', default: 'libx264', options: ['libx264','libx265','libsvtav1'], hint: 'x264=相容, x265=更小50%, AV1=最新最小', hintEn: 'x264=compatible, x265=50% smaller, AV1=most efficient' },
        { key: 'audioBitrate', label: '音訊位元率', labelEn: 'Audio Bitrate', default: '192k', options: ['128k','192k','256k'], hint: '', hintEn: '' },
      ]
    }
  },
  {
    ext: 'mov', label: 'MOV', type: 'video',
    shortDesc: 'Apple 原生', shortDescEn: 'Apple Native',
    description: 'Apple QuickTime 格式，macOS 與 iOS 原生支援',
    descriptionEn: 'Apple QuickTime format, native on macOS and iOS',
    preset: {
      videoCodec: 'libx264', audioCodec: 'aac', crf: 22, audioBitrate: '192k',
      description: 'H.264 + AAC，CRF 22 — Apple 裝置最佳相容性',
      descriptionEn: 'H.264 + AAC, CRF 22 — Best compatibility with Apple devices',
      advanced: [
        { key: 'crf', label: '視訊品質 (CRF)', labelEn: 'Video Quality (CRF)', default: 22, options: [18,20,22,25,28], hint: '', hintEn: '' },
        { key: 'audioBitrate', label: '音訊位元率', labelEn: 'Audio Bitrate', default: '192k', options: ['128k','192k','256k'], hint: '', hintEn: '' },
      ]
    }
  },
  {
    ext: 'mkv', label: 'MKV', type: 'video',
    shortDesc: '多軌・電影', shortDescEn: 'Multi-track',
    description: 'Matroska 容器，支援多字幕/多音軌，適合電影備份',
    descriptionEn: 'Matroska container, supports multiple subtitles/audio tracks, great for movie archiving',
    preset: {
      videoCodec: 'libx265', audioCodec: 'aac', crf: 24, audioBitrate: '192k',
      description: 'H.265 + AAC，CRF 24 — 高壓縮比、適合長片',
      descriptionEn: 'H.265 + AAC, CRF 24 — High compression, ideal for long videos',
      advanced: [
        { key: 'crf', label: '視訊品質 (CRF)', labelEn: 'Video Quality (CRF)', default: 24, options: [18,20,22,24,26,28], hint: '', hintEn: '' },
        { key: 'videoCodec', label: '視訊編碼', labelEn: 'Video Codec', default: 'libx265', options: ['libx264','libx265'], hint: '', hintEn: '' },
        { key: 'audioBitrate', label: '音訊位元率', labelEn: 'Audio Bitrate', default: '192k', options: ['128k','192k','256k'], hint: '', hintEn: '' },
      ]
    }
  },
  {
    ext: 'webm', label: 'WebM', type: 'video',
    shortDesc: '網頁最佳', shortDescEn: 'Web Best',
    description: '網頁開源格式，VP9/AV1 編碼，HTML5 video 原生支援',
    descriptionEn: 'Open-source web format, VP9/AV1 encoding, native HTML5 video support',
    preset: {
      videoCodec: 'libvpx-vp9', audioCodec: 'libopus', crf: 31, audioBitrate: '128k',
      description: 'VP9 + Opus，CRF 31 — 網頁使用最佳格式',
      descriptionEn: 'VP9 + Opus, CRF 31 — Best format for web use',
      advanced: [
        { key: 'crf', label: '視訊品質 (CRF)', labelEn: 'Video Quality (CRF)', default: 31, options: [24,27,31,34,37], hint: 'VP9 CRF 範圍 0-63，越低越好', hintEn: 'VP9 CRF range 0-63, lower = better' },
        { key: 'audioBitrate', label: '音訊位元率', labelEn: 'Audio Bitrate', default: '128k', options: ['64k','128k','192k'], hint: '', hintEn: '' },
      ]
    }
  },
  {
    ext: 'avi', label: 'AVI', type: 'video',
    shortDesc: '舊裝置相容', shortDescEn: 'Legacy',
    description: '傳統 Windows 影片格式，相容舊裝置',
    descriptionEn: 'Classic Windows video format, compatible with legacy devices',
    preset: {
      videoCodec: 'libx264', audioCodec: 'mp3', crf: 23, audioBitrate: '192k',
      description: 'H.264 + MP3，舊裝置相容格式',
      descriptionEn: 'H.264 + MP3, compatible with legacy devices',
      advanced: [
        { key: 'crf', label: '視訊品質 (CRF)', labelEn: 'Video Quality (CRF)', default: 23, options: [18,20,23,26,28], hint: '', hintEn: '' },
        { key: 'audioBitrate', label: '音訊位元率', labelEn: 'Audio Bitrate', default: '192k', options: ['128k','192k','256k'], hint: '', hintEn: '' },
      ]
    }
  },
  {
    ext: 'gif', label: 'GIF', type: 'video',
    shortDesc: '動圖・分享', shortDescEn: 'Animated',
    description: '動態圖片格式，適合短片段轉為可分享的動圖',
    descriptionEn: 'Animated image format, perfect for converting short clips into shareable animations',
    preset: {
      fps: 15, scale: 480,
      description: '15fps，寬度縮放至 480px — 適合分享的動圖',
      descriptionEn: '15fps, width scaled to 480px — Optimized for sharing',
      advanced: [
        { key: 'fps', label: '幀率 (FPS)', labelEn: 'Frame Rate (FPS)', default: 15, options: [5,10,15,20,24], hint: '越高越流暢，但檔案急速增大', hintEn: 'Higher = smoother, but file size grows rapidly' },
        { key: 'scale', label: '寬度 (px)', labelEn: 'Width (px)', default: 480, options: [320,480,640,960], hint: '依比例縮放', hintEn: 'Scales proportionally' },
      ]
    }
  },
];

function getAllFormats() { return FORMATS; }

function getPreset(ext) {
  const format = FORMATS.find(f => f.ext === ext);
  return format ? format.preset : null;
}

function getOutputFormats(inputType) {
  if (inputType === 'audio') return FORMATS.filter(f => f.type === 'audio');
  return FORMATS;
}

module.exports = { getAllFormats, getPreset, getOutputFormats };
