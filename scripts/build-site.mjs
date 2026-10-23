import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'node_modules/@docusaurus/core/bin/docusaurus.mjs');

// Build and dev must not overwrite each other's generated routes and templates.
const result = spawnSync(process.execPath, [cli, 'build', ...process.argv.slice(2)], {
  cwd: root,
  stdio: 'inherit',
  env: {...process.env, DOCUSAURUS_GENERATED_FILES_DIR_NAME: '.docusaurus-build'},
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
