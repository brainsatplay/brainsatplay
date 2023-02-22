import chalk from 'chalk';
import { spawn } from 'child_process';

export const spawnChild = (command, args=[], opts={}, {color='cyan', name='brainsatplay'} = {}) => {

    const child = spawn(command, args, Object.assign({
        env: {
            NODE_ENV: 'production',
            PATH: process.env.PATH
        }
    }, opts));

    let prefix = chalk[color].bold(`[${name}]`)
    
    return new Promise((resolve, reject) => {

      if (child.stdout){
        child.stdout.on('data', (data) => {
          console.log(`${prefix} ${data}`);
        });
      }
      
      if (child.stderr){
        child.stderr.on('data', (data) => {
          console.error(`${prefix} ${chalk.red(`Error: ${data}`)}`)
        });
      }
      
      child.on('error', (error) => {
        console.error(chalk.red(`Error: ${error}`))
        reject(error)
      });
      
      child.on('close', (code) => {
        switch(code){
          case 0:
            console.log(`${prefix} ${chalk.green.bold(`Process finished.`)}`)
            break;

          case 1:
            console.log(`${prefix} ${chalk.red.bold(`Process failed.`)}`)
            break;

          default:
            console.log(`${prefix} ${chalk.red.bold(`Process exited with code ${code}`)}`)

        }
        resolve(code)
      });
  })

}