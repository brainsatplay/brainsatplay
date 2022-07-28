import chalk from 'chalk'
import { createDirectory } from '../../utils/filesystem.js'

export const build = async (methods, options, command) => {

    await createDirectory('dist', options)

    if (methods.length === 0) methods = ['pwa']
    methods.forEach((method) => {
        switch(method){

            case 'pwa':
                console.log(chalk.red.bold(`PWA build not implemented`, JSON.stringify(options)))
                break;

            case 'electron':
                console.log(chalk.red.bold(`Electron build not implemented`, JSON.stringify(options)))
                break;

            case 'mobile':
                console.log(chalk.red.bold(`Mobile build not implemented`, JSON.stringify(options)))
                break;
                                              
        }
    })
}

export default build