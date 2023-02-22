import { spawnChild } from './childprocess.js';
const isWindows = process.platform === 'win32';

export const npm = async (arg) => {
    const cmd = isWindows ? 'cmd' : 'npm';
    const args = isWindows ? ['/c', `npm ${arg}`] : [arg];
    return await spawnChild(cmd, args, {
        shell: true,
        stdio: 'inherit'
    }, {
        name: 'npm',
        color: 'yellow'
    });
}