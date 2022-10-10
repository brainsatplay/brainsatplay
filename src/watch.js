import fs from 'fs'
import path from 'path'
import chokidar from 'chokidar'
import * as html from './views/html.js'
import * as wasl from './views/wasl.js'

const exampleJSON = path.join(process.cwd(), 'example.json')
const exampleHTML = path.join(process.cwd(), 'example.html')

const toWatch = {
    [exampleJSON]: {
        callback: () => {

            const text = getFileText(exampleJSON);

            if (!text) {

                console.log(`Initializing the ${exampleJSON} file...`)

                const json = {
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

                setTimeout(() => fs.writeFileSync(exampleJSON, JSON.stringify(json, null, 2)), 1000) // Initialize the file
            } 
        },
    },
    [exampleHTML] : true
}

const paths = [exampleJSON, exampleHTML] // '.'
var watcher = chokidar.watch(paths, {
    ignored: /(node_modules)|(.git)/
});


watcher.on('add', function(path) {
    const entry = toWatch[path]
    if (entry) {
        if (typeof entry === 'object') {
            if (entry?.callback) entry.callback() // Create or trigger file
            entry.initialized = true
        } 
        
        convert(path)
    }
});

watcher.on('change', convert)

const baseEntry = toWatch[exampleJSON]
if (!baseEntry.initialized) baseEntry.callback()

function getFileText(filePath) {
    return (fs.existsSync(filePath)) ? fs.readFileSync(filePath).toString() : ''
}

function convert(filename) {
     // We can look for different types of changes on a file
    // using the event type like: rename, change, etc.
    const isJSON = path.extname(filename) === '.json'

    console.log('Converting', filename, 'to', isJSON ? 'HTML' : 'JSON')

    const contents = fs.readFileSync(filename);

    if (isJSON){
        try {
            const text = html.wasl(contents)
            const destination = getFileText(exampleHTML);
            if (text !== destination) fs.writeFileSync(exampleHTML, text)
        } catch (e) {
            console.error('Invalid JSON...', filename, e)
        }
    } else {
        const obj = wasl.html(contents)
        const text = JSON.stringify(obj, null, 2);
        const destination = getFileText(exampleJSON);
        if (text !== destination) fs.writeFileSync(exampleJSON, text)
    }
}