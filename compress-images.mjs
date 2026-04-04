import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sourceDirs = ['brand_assets', 'Outreach Wins'];
const outputDir = path.join(__dirname, 'compressed');

fs.mkdirSync(outputDir, { recursive: true });

for (const dir of sourceDirs) {
  const srcDir = path.join(__dirname, dir);
  const outDir = path.join(outputDir, dir);
  fs.mkdirSync(outDir, { recursive: true });

  const files = fs.readdirSync(srcDir).filter(f => /\.(png|jpg|jpeg)$/i.test(f));

  for (const file of files) {
    const srcPath = path.join(srcDir, file);
    const outPath = path.join(outDir, file);
    const ext = path.extname(file).toLowerCase();

    const originalSize = fs.statSync(srcPath).size;

    if (ext === '.png') {
      await sharp(srcPath).png({ quality: 85, compressionLevel: 9 }).toFile(outPath);
    } else {
      await sharp(srcPath).jpeg({ quality: 85, mozjpeg: true }).toFile(outPath);
    }

    const newSize = fs.statSync(outPath).size;
    const saving = (((originalSize - newSize) / originalSize) * 100).toFixed(1);
    console.log(`${dir}/${file}: ${(originalSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB (${saving}% smaller)`);
  }
}

console.log('\nDone. Compressed images in /compressed/');
