import chalk from 'chalk'
import * as handlers from './handlers.js'
import * as createBy from './createByType.js'
import { createDirectory, updateFile } from '../../utils/filesystem.js'
import { cliConfig } from '../../index.js'


export const create = async (options, command) => {

    const cliOptions = command.parent.opts()

    if (cliOptions.debug) {
        options.debug = true
        Object.keys(options).forEach(key => {
            console.log(chalk.green.bold(`Selected ${key}:`, options[key]))
        })
    }


    options = await handlers.type(options)
    createProject(options)

}

async function createProject(options) {

    await createDirectory(options.name, options, undefined, true) // move into new directory after creation
    await updateFile('README.md', `# ${options.name}\n${options.description ?? ''}`, options)
    // await createDirectory('.brainsatplay', options)
    // await updateFile('/.brainsatplay/settings.js', `export const config = ${JSON.stringify(options, null, 2)}\n\nexport default config`, options)

    const projectGenerator = createBy[options.type]
    if (projectGenerator instanceof Function) {

        projectGenerator(options).then((err) => {
            console.log(chalk.green.bold(`${options.name} was successfully created!`))
            options.directory = process.cwd()
            cliConfig.set(`projects.${options.name}`, options)
        }).catch(err => {
            console.error(chalk.red.bold(err))
        })

    }

}

export default create