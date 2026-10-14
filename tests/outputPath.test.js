const fs = require('fs');
const { getOutputPath } = require('../src/outputPath');
afterEach(() => jest.restoreAllMocks());
test('same format conversion never targets the source', () => {
  jest.spyOn(fs, 'existsSync').mockReturnValue(false);
  expect(getOutputPath('/in/影片.mp4', '/in', 'mp4')).toBe('/in/影片_1.mp4');
});
test('compression preserves previous output using a numbered copy', () => {
  jest.spyOn(fs, 'existsSync').mockImplementation(p => p === '/in/影片_compressed.mp4');
  expect(getOutputPath('/in/影片.mp4', '/in', 'mp4', true)).toBe('/in/影片_compressed_1.mp4');
});
