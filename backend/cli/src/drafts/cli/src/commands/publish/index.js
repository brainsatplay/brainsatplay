import chalk from 'chalk'
import simpleGit from 'simple-git'
import {boolean, text} from '../create/inquiries.js'
import { cliConfig } from '../../index.js'


export const publish = async (project, options, command) => {

    if (!project) project = await text('Project Name:')
    let projectInfo = cliConfig.get(`projects.${project}`)

    if (projectInfo){

        const git = simpleGit({
            baseDir: projectInfo?.directory ?? process.cwd(),
            binary: 'git',
            maxConcurrentProcesses: 6,
        })
        
        console.log(chalk.red.bold('Warning: Defaults to current working directory for now.', JSON.stringify(git.checkIsRepo())))
        let repo = cliConfig.get(`projects.${project}.repository`) //?? git.checkIsRepo()

        // Create Repo
        if (!repo){
            let user = await text('Username:')
            const remote = `https://github.com/${user}/${project}.git`
            let decision = await boolean(`Are you sure you want to create a repository at ${chalk.white.bold(remote)}?`)
            if (decision){
                let msg = await text('Commit Message:')
                let branch = await text('Branch:')
                git 
                .init()
                .add('./*')
                .commit(msg)
                .addRemote('origin', remote)
                .push('origin', branch);  

                cliConfig.set(`projects.${project}.repository`, {
                    "type": "git",
                    "url": `git+${remote}`
                })
            } else console.log(chalk.red.bold(`Failed to publish`))
        } else console.log(chalk.yellow.bold(`Already published!`))
    } else console.log(chalk.red.bold(`Project doesn't exist`))
}

export default publish