const fs = require('fs');
const { getMediaTool } = require('../src/mediaTools');
afterEach(() => jest.restoreAllMocks());
test('local build uses existing Homebrew tool without bundled dependencies', () => {
  jest.spyOn(fs, 'accessSync').mockImplementation(() => {});
  expect(getMediaTool('ffmpeg', true)).toBe('/opt/homebrew/bin/ffmpeg');
});
test('Intel Homebrew location is supported', () => {
  jest.spyOn(fs, 'accessSync').mockImplementation(p => { if (p.startsWith('/opt')) throw new Error('missing'); });
  expect(getMediaTool('ffprobe', true)).toBe('/usr/local/bin/ffprobe');
});
test('missing tool gives actionable error without crashing at import', () => {
  jest.spyOn(fs, 'accessSync').mockImplementation(() => { throw new Error('missing'); });
  expect(() => getMediaTool('ffmpeg', true)).toThrow('Homebrew');
});
test('portable build retains bundled binaries', () => {
  expect(getMediaTool('ffmpeg', false)).toContain('ffmpeg-static');
  expect(getMediaTool('ffprobe', false)).toContain('ffprobe-static');
});
