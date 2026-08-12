const fs = require('fs');
const cp = require('child_process');

const files = [
  'src/components/layout/Header.tsx',
  'src/app/buscar/page.tsx',
  'src/app/productos/page.tsx',
  'src/app/productos/[id]/page.tsx',
  'src/app/perfil/compras/page.tsx',
  'src/app/perfil/billetera/page.tsx',
  'src/app/configuracion/perfil/page.tsx',
  'src/components/home/ProductCard.tsx',
  'src/components/providers/FormStepper.tsx',
  'src/app/auth/registro/proveedor/page.tsx',
  'src/app/globals.css',
  'src/components/layout/AnimatedLogo.tsx'
];

for(let f of files) {
  try {
    const data = cp.execSync(`git show HEAD:"${f}"`, {encoding: 'utf8', maxBuffer: 1024*1024*10});
    fs.writeFileSync(f, data);
    console.log('Restored: ' + f);
  } catch(e) {
    console.error('Error restoring ' + f + ': ' + e.message);
  }
}
