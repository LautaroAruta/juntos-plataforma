import fs from 'fs';
import path from 'path';

const srcDir = 'c:/Users/user/Downloads/JUNTOS/juntos-plataforma/src';

const textReplacements = [
  { from: /JUNTOS/g, to: 'BANDHA' },
  { from: /Juntos/g, to: 'Bandha' },
  { from: /juntos/g, to: 'bandha' },
  { from: /Porque bandha siempre es mejor/g, to: 'Comprar en banda siempre es mejor' },
  { from: /#00AEEF/g, to: '#009EE3' },
  { from: /#0077CC/g, to: '#00A650' },
  { from: /#E8F7FF/g, to: '#FFF8E7' }
];

function processPath(currentPath) {
  const stats = fs.statSync(currentPath);
  if (stats.isDirectory()) {
    const files = fs.readdirSync(currentPath);
    for (const file of files) {
      processPath(path.join(currentPath, file));
    }
  } else if (stats.isFile()) {
    const ext = path.extname(currentPath);
    if (['.ts', '.tsx', '.js', '.jsx', '.css'].includes(ext)) {
      let content = fs.readFileSync(currentPath, 'utf8');
      let modified = false;

      for (const replace of textReplacements) {
        if (replace.from.test(content)) {
          content = content.replace(replace.from, replace.to);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(currentPath, content, 'utf8');
        console.log(`Modified: ${currentPath}`);
      }
    }
  }
}

processPath(srcDir);
