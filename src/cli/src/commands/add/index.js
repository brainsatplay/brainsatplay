import chalk from 'chalk'
import { createDirectory, updateFile } from '../../utils/filesystem.js'
import * as handlers from '../create/handlers.js'
import { updatePackage } from '../../utils/package.js'

export const addChoices = ['docs', 'frontend', 'backend']


export const add = async (choices, options, command) => {

    const cliOptions = command.parent.opts()

    if (cliOptions.debug) {
        options.debug = true
        console.log('Choices', chioces)
        Object.keys(options).forEach(key => {
            console.log(chalk.green.bold(`Selected ${key}:`, options[key]))
        })
    }

    if (choices.length === 0) {
        options = await handlers.add(options)
        choices = options.add
    }

        choices.forEach(str => {

            switch(str){
                case 'frontend':
                    addFrontend(options)
                    break;
    
                case 'backend':
                    addBackend(options)
                    break;
    
                case 'docs':
                    addDocs(options)
                    break;

                default: 
                    console.log(chalk.red(`${str} is not a valid feature.`))
    
            }
        })
}

export async function addDocs(options) {

    // add Directories
    await createDirectory('docs', options)
    await updatePackage('./docs', options)
}

export async function addFrontend (options) {

    // add Directories
    await createDirectory('common', options, '/src')
    await updatePackage('/src/common', options)
    await updateFile('/src/common/index.js', ``, options)

    await createDirectory('frontend', options, '/src')
    await updatePackage('/src/frontend', options)
    await updateFile('/src/frontend/index.js', ``, options)
}

export async function addBackend(options) {

    // add Directories
    await createDirectory('common', options, '/src')
    await updatePackage('/src/common', options)
    await updateFile('/src/common/index.js', ``, options)

    await createDirectory('backend', options, '/src')
    await updatePackage('/src/backend', options)
    await updateFile('/src/backend/index.js', ``, options)
    await updateFile('/src/backend/main.js', `console.log('Hello world!')`, options)

}

export default add