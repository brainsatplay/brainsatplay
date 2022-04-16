import chalk from 'chalk'
import inquirer from 'inquirer'

export const inquire = (prompts, handleAnswers) => {
    return new Promise((resolve, reject) => {
        inquirer
        .prompt(prompts)
        .then(async (res) => resolve(await handleAnswers(res)))
        .catch((error) => {
            if (error.isTtyError) chalk.red.bold("Prompt couldn't be rendered in the current environment.")
            else chalk.red.bold("Something went wrong.")
        });
    })
}