import chalk from 'chalk'
import conf from 'conf'
import { cliConfig } from '../../index.js';


export const info = async (project, options, command) => {

    if (project) {
        let o = cliConfig.get(`projects.${project}`)
        console.log(chalk.white.bold(`Info (${project})\n`), JSON.stringify(o, null, 2))
        const projectConfig = new conf({projectName: o.name});
        console.log(chalk.white.bold(`Configuration (${project})\n`), JSON.stringify(projectConfig.store, null, 2))

        if (options.clear) cliConfig.delete(`projects.${project}`)

    }
    else {
        console.log(chalk.white.bold(`Configuration (brainsatplay-cli)\n`), JSON.stringify(cliConfig.store, null, 2))
        if (options.clear) cliConfig.clear()
    }

}

export default info