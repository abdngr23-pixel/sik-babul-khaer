/* eslint-disable @typescript-eslint/no-require-imports */
const { spawnSync } = require('child_process');

process.env.DOCKER_BUILD = '1';
const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(cmd, ['next', 'build'], { stdio: 'inherit' });

process.exit(result.status || 0);
