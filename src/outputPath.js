const path = require('path');
const fs = require('fs');

/** 保留來源與既有輸出，以流水號建立新副本。 */
function getOutputPath(inputPath, outputDir, outputExt, compression = false) {
  const base = path.basename(inputPath, path.extname(inputPath));
  const suffix = compression ? '_compressed' : '';
  let candidate = path.join(outputDir, `${base}${suffix}.${outputExt}`);
  let index = 1;
  while (path.resolve(candidate) === path.resolve(inputPath) || fs.existsSync(candidate)) {
    candidate = path.join(outputDir, `${base}${suffix}_${index++}.${outputExt}`);
  }
  return candidate;
}
module.exports = { getOutputPath };
