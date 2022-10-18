import fs from 'fs'
import path from 'path'


import * as filesystem from "../utils/filesystem.js";
import * as log from "../utils/log.js";

import * as html from './html.js'
import * as wasl from './wasl.js'

export {
    html,
    wasl
}

const handlers = {
    html, 
    wasl
}

const getType = (filePath) => {
    if (filePath.includes('.wasl.json')) return 'wasl'
    else return path.extname(filePath).slice(1)
}

export function convert(filename, paths) {
    
    const contents = fs.readFileSync(filename);

    let input = getType(filename);

    paths.forEach(path => {
        if (filename !== path) {
            let output = getType(path);
            
            try {

                const tic = performance.now()
                
                // Convert Base to Linked File Text
                const text = handlers[output][input](contents, 'text')

                // Get Original Linked File Text
                const destination = filesystem.getFileText(path);

                console.log(`Trying ${log.path(filename)} —> ${log.path(path)}`)

                // Only Update if Text is Different
                if (text !== destination) {
                    filesystem.write(path, text)
                    const toc = performance.now()
                    console.log(`${log.path(filename)} —> ${log.path(path)}: ${(toc-tic).toFixed(3)}ms`)
                }
            } catch (e) {
                console.error(`Invalid ${input}...`, filename, e)
            }
        }
    })
}