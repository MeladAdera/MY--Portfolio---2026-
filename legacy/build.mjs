// Builds the two 3D scenes into js/builder.bundle.js and js/story.bundle.js.
// Each scene is a few source files joined in order, then bundled with three.js.
// Run once: npm install   Then after any change in src/: npm run build
import { build } from 'esbuild';
import { readFileSync } from 'node:fs';

const scenes = [
  { dir: 'src/home-3d', parts: ['a-base', 'b-char', 'c-seq', 'd-shader', 'e-mount'], out: 'js/builder.bundle.js' },
  { dir: 'src/story-3d', parts: ['a-base', 'b-char', 'c-stairs', 'e-mount'], out: 'js/story.bundle.js' }
];

for (const scene of scenes) {
  const code = scene.parts.map((p) => readFileSync(`${scene.dir}/${p}.js`, 'utf8')).join('');
  await build({
    stdin: { contents: code, resolveDir: process.cwd(), loader: 'js', sourcefile: `${scene.dir}/scene.js` },
    bundle: true,
    format: 'iife',
    minify: true,
    outfile: scene.out
  });
  console.log('built', scene.out);
}
