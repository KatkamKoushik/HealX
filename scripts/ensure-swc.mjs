import fs from 'node:fs';
import path from 'node:path';

const targetDir = '/tmp/swc';
const sourceFile = path.resolve('node_modules/@next/swc-linux-arm64-gnu/next-swc.linux-arm64-gnu.node');
const targetFile = path.join(targetDir, 'next-swc.linux-arm64-gnu.node');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

if (fs.existsSync(sourceFile) && !fs.existsSync(targetFile)) {
  fs.copyFileSync(sourceFile, targetFile);
}
