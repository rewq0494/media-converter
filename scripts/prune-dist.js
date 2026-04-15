'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const distDir = path.join(repoRoot, 'dist');
const { version } = require(path.join(repoRoot, 'package.json'));

const renamePairs = [
  {
    source: `Media Converter-${version}-arm64.dmg`,
    target: 'Media-Converter-macOS-Apple-Silicon.dmg'
  },
  {
    source: `Media Converter-${version}.dmg`,
    target: 'Media-Converter-macOS-Intel.dmg'
  },
  {
    source: `Media Converter Setup ${version}.exe`,
    target: 'Media-Converter-Windows-Setup.exe'
  }
];

const pruneMatchers = [
  /^\.DS_Store$/,
  /^builder-debug\.yml$/,
  /^latest(?:-mac)?\.yml$/,
  /\.blockmap$/,
  /\.zip$/,
  /^mac-arm64$/,
  /^win-unpacked$/
];

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = -1;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function ensureWithinDist(targetPath) {
  const relativePath = path.relative(distDir, targetPath);

  if (
    relativePath.startsWith('..') ||
    path.isAbsolute(relativePath) ||
    relativePath === ''
  ) {
    throw new Error(`Refusing to modify unexpected path: ${targetPath}`);
  }
}

async function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

async function areFilesIdentical(leftPath, rightPath) {
  const leftStat = fs.statSync(leftPath);
  const rightStat = fs.statSync(rightPath);

  if (leftStat.size !== rightStat.size) {
    return false;
  }

  const [leftHash, rightHash] = await Promise.all([
    hashFile(leftPath),
    hashFile(rightPath)
  ]);

  return leftHash === rightHash;
}

function getEntrySize(targetPath) {
  const stats = fs.statSync(targetPath);

  if (stats.isFile()) {
    return stats.size;
  }

  return fs.readdirSync(targetPath, { recursive: true }).reduce((total, entry) => {
    const entryPath = path.join(targetPath, entry);
    return fs.existsSync(entryPath) && fs.statSync(entryPath).isFile()
      ? total + fs.statSync(entryPath).size
      : total;
  }, 0);
}

function removeEntry(targetPath) {
  ensureWithinDist(targetPath);

  if (!fs.existsSync(targetPath)) {
    return 0;
  }

  const bytes = getEntrySize(targetPath);
  fs.rmSync(targetPath, { recursive: true, force: false });
  return bytes;
}

async function renameArtifacts() {
  let reclaimedBytes = 0;

  for (const pair of renamePairs) {
    const sourcePath = path.join(distDir, pair.source);
    const targetPath = path.join(distDir, pair.target);

    if (!fs.existsSync(sourcePath)) {
      continue;
    }

    ensureWithinDist(sourcePath);
    ensureWithinDist(targetPath);

    if (fs.existsSync(targetPath)) {
      const identical = await areFilesIdentical(sourcePath, targetPath);

      if (!identical) {
        throw new Error(
          `Cannot reconcile ${pair.source} and ${pair.target}: files differ`
        );
      }

      reclaimedBytes += removeEntry(sourcePath);
      continue;
    }

    fs.renameSync(sourcePath, targetPath);
  }

  return reclaimedBytes;
}

function pruneExtraArtifacts() {
  let reclaimedBytes = 0;

  if (!fs.existsSync(distDir)) {
    return reclaimedBytes;
  }

  for (const entry of fs.readdirSync(distDir)) {
    if (!pruneMatchers.some((matcher) => matcher.test(entry))) {
      continue;
    }

    reclaimedBytes += removeEntry(path.join(distDir, entry));
  }

  return reclaimedBytes;
}

async function main() {
  if (!fs.existsSync(distDir)) {
    console.log('dist/ does not exist, nothing to prune.');
    return;
  }

  const reclaimedFromDuplicates = await renameArtifacts();
  const reclaimedFromPrune = pruneExtraArtifacts();
  const reclaimedTotal = reclaimedFromDuplicates + reclaimedFromPrune;

  const remainingEntries = fs
    .readdirSync(distDir)
    .sort((left, right) => left.localeCompare(right));

  console.log(`Reclaimed ${formatBytes(reclaimedTotal)} from dist/.`);
  console.log('Remaining release artifacts:');

  if (remainingEntries.length === 0) {
    console.log('- (empty)');
    return;
  }

  for (const entry of remainingEntries) {
    console.log(`- ${entry}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
