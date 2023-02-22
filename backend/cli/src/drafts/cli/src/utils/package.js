import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { updateFile, agplText } from './filesystem.js'


const defaultPackage = {
    name: 'my-project',
    version: '0.0.0',
    type: 'module',
    license: "AGPL-3.0-or-later",
    engines: {
        "node": ">=16"
    },
    scripts: {}
}

export function updatePackage(dir, options) {

    return new Promise(async (resolve, reject) => {
        const baseDir = path.join(process.cwd(), dir)
        const packageDir = path.join(baseDir, 'package.json')
        var type =  path.dirname(packageDir).split(path.sep).pop()
        let root = (options.name == type)

        defaultPackage.name = root ? options.name : `${options.name}-${type}`

        let file = await import(packageDir).then((res) => {
            Object.assign(defaultPackage, res)
        }).catch((err) => {
            if (options.debug) console.log(chalk.yellow('Creating file at ' + packageDir))
            return defaultPackage
        })

        if (root){
            if (options.workspaces) {
                file.workspaces = options.workspaces
                file.private = true
            }

        }
        
        await updateFile(path.join(dir, 'package.json'), JSON.stringify(file, null, 2), options)

        // Create Licenses
        // if (root) {    
            const licenseDir = path.join(dir, 'LICENSE')
            await updateFile(licenseDir, agplText, options).then(res => {
                if (options.debug) console.log(chalk.green('License updated at ' + licenseDir))
            }).catch(err => {
                console.log(chalk.red('Failed to create license.'))
            })
        // }
        resolve(true)
    })

}