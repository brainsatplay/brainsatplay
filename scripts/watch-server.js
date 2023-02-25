/**
 * This script is used to rename the binary with the platform specific postfix.
 * When `tauri build` is ran, it looks for the binary name appended with the platform specific postfix.
 */

import chokidar from 'chokidar'
import { execSync, exec } from 'child_process';

let subprocess;

async function buildAndRun() {

  try {
    if (subprocess) subprocess.kill('SIGTERM');
    subprocess = execSync('node scripts/build-server.js');

    // await execa('node', ['scripts/build-server.js'], { all: true }).stderr.pipe(process.stdout);
    subprocess = exec('node backend/dist/index.cjs');
    subprocess.stdout.setEncoding('utf8');
    subprocess.stdout.on('data', function(data) {
        console.log('[sidecar] ' + data);
    });

    subprocess.stderr.setEncoding('utf8');
    subprocess.stderr.on('data', function(data) {
        console.log('[sidecar-error] ' + data);
    });
  } catch (e) {
    console.error(e);
  }
}


async function watch() {
  const watcher = chokidar.watch('backend/*', {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
  });
  
  watcher.on('change', buildAndRun);

  buildAndRun();
}

watch().catch((e) => {
  throw e
})