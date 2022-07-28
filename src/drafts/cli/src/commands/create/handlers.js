import * as inquiries from './inquiries.js'
import * as types from './createByType.js'
import { cliConfig } from '../../index.js'
import chalk from 'chalk'

export const name = async (options, tryAgain=true) => {
    if (!options.name && tryAgain) options = await inquiries.name(options, false) // select name
    if (!options.name) {
        options.name = `my-${options.type}` // choose default based on type
    }

    // Check if Name Already Exists
    let existingProject= cliConfig.get(`projects.${options.name}`)
    if (existingProject) {
        let res = await inquiries.boolean(`${chalk.red.bold(`A project called '${options.name}' already exists!`)}\nWould you like to overwrite the existing project?`)
        if (!res){
            delete options.name
            options = await name(options, true) // recursion
        }
    }

    return options 
}

export const type = async (options, tryAgain=true) => {
    if (types[options.type]) return await name(options)
    else if (tryAgain) {
        await inquiries.type(options, false)
        return type(options, false)
    }
    return options
}

export const add = async (options, tryAgain=true) => {

    if (!options.add && tryAgain) options = await inquiries.add(options, false) // select name
    if (options.add) {
        options.add.forEach(o => {
            console.log('Adding', o)
        })
    }
    return options 
}