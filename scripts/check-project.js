const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const files = walk(root).filter((file) => /\.(html|css|js)$/i.test(file));
let failures = 0;

for (const file of files.filter((item) => item.endsWith('.js'))) {
  try {
    new vm.Script(fs.readFileSync(file, 'utf8'), { filename: file });
  } catch (error) {
    failures += 1;
    console.error(`JS syntax error: ${path.relative(root, file)}`);
    console.error(error.message);
  }
}

const knownFiles = new Set(walk(root).map((file) => path.relative(root, file).replace(/\\/g, '/')));
for (const file of files.filter((item) => /\.(html|css)$/i.test(item))) {
  const text = fs.readFileSync(file, 'utf8');
  const matches = [
    ...text.matchAll(/(?:href|src)\s*=\s*["']([^"']+)["']/gi),
    ...text.matchAll(/url\(\s*["']?([^)'"#?]+)[^)]*\)/gi),
  ];
  for (const match of matches) {
    const ref = match[1].split(/[?#]/)[0];
    if (!ref || /^(https?:|mailto:|tel:|javascript:|data:|#)/i.test(ref)) continue;
    const resolved = ref.startsWith('/')
      ? ref.slice(1)
      : path.relative(root, path.resolve(path.dirname(file), ref)).replace(/\\/g, '/');
    if (!knownFiles.has(resolved)) {
      failures += 1;
      console.error(`Missing reference in ${path.relative(root, file)}: ${ref} -> ${resolved}`);
    }
  }
}

if (failures) {
  console.error(`${failures} project check failure(s).`);
  process.exit(1);
}
console.log(`Project check passed for ${files.length} source files.`);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'data' || entry.name === '.dist') return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
