
import fs from 'fs'
import path, { dirname } from 'path'
import chalk from 'chalk'
import { fileURLToPath } from 'url';

export const __dirname = path.join(dirname(fileURLToPath(import.meta.url)), '../..'); // CLI Base Directory
export let agplText = fs.readFileSync(path.join(__dirname, 'LICENSE'))

export const readFile = (dir) => fs.readFileSync(path.join(__dirname, dir))


export function getFileText(filePath) {
    return (fs.existsSync(filePath)) ? fs.readFileSync(filePath).toString() : ''
}

const check = (filePath) => {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) return true;
    check(dirname);
    fs.mkdirSync(dirname);
}

export const write = (filePath, contents) => {
    check(filePath)
    fs.writeFileSync(filePath, contents);
}


export async function createDirectory(name, options, parent='', move=false){

    const __dirname = process.cwd()

    var basePath = (parent) 
    ?  ((__dirname.includes(parent)) 
        ? path.join(__dirname, options.path ?? '') 
        : path.join(__dirname, options.path ?? '', parent)
    ) : path.join(__dirname, options.path ?? '')

    const projectDir = path.join(basePath, name)
    if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true });
        if (options.debug) console.log(chalk.yellow(`Creating directory at ${projectDir}`))
    } else if (options.debug) console.log(chalk.green(`Directory exists at ${projectDir}`))

    if (move) process.chdir(projectDir);

}

export  function updateFile(dir, contents, options={}) {
    return new Promise((resolve, reject) => {
        const fullPath = path.join(process.cwd(), dir)
        fs.writeFile(fullPath, contents, function writeJSON(err) {
            if (err) return console.log(err);
            if (options.debug) console.log(chalk.green(`File updated at ${fullPath}!`))
            resolve(true)
            
          });
    })
}