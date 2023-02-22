#! /usr/bin/env node

import { Command, Option } from 'commander'
import conf from 'conf'
export const cliConfig = new conf({
    projectName: 'brainsatplay-cli'
});
import create from './commands/create/index.js'
import add from './commands/add/index.js';
import start from './commands/start/index.js';
import build from './commands/build/index.js';
import publish from './commands/publish/index.js';
import info from './commands/info/index.js';

const cli = new Command();
cli.version('0.0.1');

cli.description("The Universal Web Development CLI");
cli.name("brainsatplay");
cli.usage("<command>");
cli.addHelpCommand(true);
cli.helpOption(true);

//  ---------------- Base CLI Options ----------------
cli.option('-d,--debug', 'output extra debugging')

//  ---------------- CLI Commands ----------------

// Create Project Repository
cli
.command('create')
.description('create a new project')
.addOption(new Option('-p, --path [path]', 'base directory for project files').default('./', 'current'))
.addOption(new Option('-n, --name [name]', 'name of your project'))
.addOption(new Option('-t, --type [type]', 'project type'))
.action(create)

// Add Project Features
cli
.command('add [features...]')
.description('add features to your project (e.g. docs, frontend, backend)')
.addOption(new Option('-p, --path [path]', 'base directory for new files').default('./', 'current'))
.action(add)

// Build Project
cli
.command('build [methods...]')
.description('build your project (e.g. pwa, electron, mobile)')
.action(build)

// Start Project
cli
.command('start [method]')
.description('run your project')
.action(start)

// Publish Project
cli
.command('publish [project]')
.description('publish your project')
.action(publish)

// Get Info
cli
.command('info [project]')
.description('display information about the project')
.addOption(new Option('-c, --clear', 'remove the current configuration object').default(true))
.action(info)

cli.parse(process.argv)