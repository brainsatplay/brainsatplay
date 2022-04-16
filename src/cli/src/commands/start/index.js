import spawn from 'cross-spawn';
import { __dirname } from '../../utils/filesystem.js';
import { spawnChild } from '../../utils/childprocess.js';
import { npm } from '../../utils/terminal.js';

export const start = async (mode, options, command) => {

    
    switch(mode) {
        case 'frontend':
            await spawnChild('node', ['./src/backend/main.js'])
            break;

        case 'backend':
            await spawnChild('node', ['./src/backend/main.js'])
            break;

        case 'docs':
            process.chdir('./docs');
            await npm('install')
            await npm('start')
            break;

        default:
            await spawnChild('node', ['./src/backend/main.js'])
    }

    // execFile(exe, (error, stdout, stderr) => {
    //     if (error) {
    //       console.error(`error: ${error.message}`);
    //       return;
    //     }
      
    //     if (stderr) {
    //       console.error(`stderr: ${stderr}`);
    //       return;
    //     }
      
    //     console.log(`stdout:\n${stdout}`);
    //   });

    // // cmd.stdout.on('data', (data) => {
    // //     console.log(`Brains@Play: ${data}`);
    // //   });
      
    // //   cmd.stderr.on('data', (data) => {
    // //     console.error(chalk.red(`Error: ${data}`))
    // //   });
      
    // //   cmd.on('close', (code) => {
    // //     console.log(chalk.red.bold(`Brains@Play exited with code ${code}`))
    // //   });

}

export default start