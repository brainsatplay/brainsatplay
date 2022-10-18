import path from 'path'
import chokidar from 'chokidar'
import * as filesystem from '../../utils/filesystem.js'
import * as log from '../../utils/log.js'
import { convert } from '../../views/index.js'

const exampleJSON = 'demos/watch/example.wasl.json'
const exampleHTML = 'demos/watch/example.html'

const defaultJSONContent = {
    components: {
        outside: {
            tagName: 'div',
            components: {
                inside: {
                    tagName: 'h1',
                    attributes: {
                        innerHTML: 'Hello World'
                    }
                }
            }
        }
    }
}

const defaultPaths = [exampleJSON, exampleHTML]

export default function watch(paths, options, command) {
    if (paths.length === 0) paths = defaultPaths // TO REMOVE: Provide default paths
    
    const __dirname = process.cwd()
    paths = paths.map((dir) => path.join(__dirname, dir)) // convert to absolute paths

    var watcher = chokidar.watch(paths, {
        ignored: /(node_modules)|(.git)/
    });

    watcher.on('change', (path) => convert(path, paths))

    // Initialize Base File (if WASL...)
    const base = paths[0]
    if (base.includes('.wasl.json')) {
        const text = filesystem.getFileText(base);
        if (!text) {
            console.log(`Initializing ${log.path(base)} with default WASL contents`)
            const contents = JSON.stringify(defaultJSONContent, null, 2) // Initialize the file
            filesystem.write(base, contents) // Initialize the file
        }
    }

    convert(base, paths) // Always reinitialize from base
}