import { inquire } from "../../utils/inquire.js"
import * as types from './createByType.js'
import { addChoices } from "../add/index.js"

//  ------------------- Prompts ------------------
let prompts = {
    name: {
        // type: 'list',
        name: 'name',
        message: 'What is the name of your project?'
    },
    type: {
        type: 'list',
        name: 'type',
        choices: Object.keys(types),
        message: 'What would you like to build?'
    },


    // Add Features
    add: {
        type: 'checkbox',
        name: 'add',
        choices: addChoices,
        message: 'What features would you like to add to your project?'
    }
}

//  ------------------- Inquiries ------------------
const baseInquiry = async (name, options, tryAgain) => {

    let res = await inquire([prompts[name]], async (answers) => {
        Object.assign(options, answers)
        return options
    })

return res
}

export const name = async (options, tryAgain=true) => await baseInquiry('name', options, tryAgain)
export const type = async (options, tryAgain=true) => await baseInquiry('type', options, tryAgain)
export const add = async (options, tryAgain=true) => await baseInquiry('add', options, tryAgain)

export const boolean = async (message) => await inquire([{
    type: 'confirm',
    name: 'value',
    message
}], async (answers) => answers.value)

export const text = async (message) => await inquire([{
    name: 'value',
    message
}], async (answers) => answers.value)