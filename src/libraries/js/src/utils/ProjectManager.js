import JSZip from 'jszip'
import fileSaver from 'file-saver';
import * as brainsatplay from '../../brainsatplay'

let defaultPlugins = []
for (let type in brainsatplay.plugins){
    for (let name in brainsatplay.plugins[type]){
        brainsatplay.plugins[type][name]
        defaultPlugins.push({name: name, label: `brainsatplay.plugins.${type}.${name}`})
    }
}

export class ProjectManager{
    constructor(database){
        this.helper = new JSZip();
        this.database = database
        this.folders = {
            app: this.helper.folder("app")
        }
    }

    addDefaultFiles(){
        this.helper.file("index.html",`
        <!DOCTYPE html> 
        <html lang="en"> 
            <head>
                <title>Brains@Play Starter Project</title>
                <link rel='stylesheet' href='./style.css'>
                <script src="https://cdn.jsdelivr.net/npm/brainsatplay@0.0.13"></script>
                <script src="./index.js" type="module"></script>
            </head>
            <body>
            </body>
        </html>
        `)


        this.helper.file("style.css",`body {
    font-family: Montserrat, sans-serif;
    color: white;
    background: black;
    width: 100vw; 
    height: 100vh;
}
        
#application {
    width: 100%; 
    height: 100%;
    display: flex;
    align-items: center; 
    justify-content: center; 
}`)

        this.helper.file("index.js",`import {settings} from './app/settings.js'
let app =  new brainsatplay.Application(settings)
app.init()`)

    }

    download(app, filename='brainsatplay'){
        this.addDefaultFiles()
        let o = this.appToFile(app)
        o.classes.forEach(c => {
            this.addClass(c)
        })
        this.folders.app.file(o.filename, o.data)
        this.helper.generateAsync({type:"blob"})
        .then(function(content) {
            fileSaver.saveAs(content, `${filename}.zip`);
        });
    }

    appToFile(app){

        let info = JSON.parse(JSON.stringifyFast(app.info))
        let imports = ``

        // Add imports
        let classNames = []
        let classes = []
        app.info.graph.nodes.forEach(n => {
            let found = defaultPlugins.find(o => {if (o.name === n.class.name) return o})
            if (!found) {
                imports += `import {${n.class.name}} from "./${n.class.name}.js"\n`
                classNames.push(n.class.name)
                classes.push(n.class)
            } else {
                classNames.push(found.label)
            }
        })

        info.graph.nodes.forEach((n,i) => {
            delete n['activePorts']
            delete n['instance']
            delete n['ui']
            delete n['fragment']
            n.class = `${classNames[i]}`
        })
        
        info = JSON.stringifyFast(info)
        
        // Replace Stringified Class Names with Actual References (provided by imports)
        var re = /"class":\s*"([^\/"]+)"/g;
        var m;

        do {
            m = re.exec(info);
            if (m) {
                info = info.replace(m[0], '"class":' + m[1])
            }
        } while (m);

        return{name: app.info.name, filename: 'settings.js', data: `${imports}
        
        export const settings = ${info}`, classes}
    }

    classToFile(cls){
        return {filename: `${cls.name}.js`, data: cls.toString() + `\nexport {${cls.name}}`}
    }

    addClass(cls){
        let info = this.classToFile(cls) 
        return this.folders.app.file(info.filename,info.data)
    }

    async save(app){
        let settings = this.appToFile(app)
        await this.database.saveFileText(settings.data, `/projects/${settings.name}_${settings.filename}`)
        settings.classes.forEach(async c => {
            let info = this.classToFile(c)
            await this.database.saveFileText(info.data, `/projects/${settings.name}_${info.filename}`)
        })
    }

    async list(){
        let projects = await this.database.readFiles(`/projects/`)
        return new Set(projects.map(str => {
            let split = str.split('_')
            return split.slice(0, split.length - 1).join('_')
        }))
    }

    async load(name){
        return new Promise(async resolve => {
            let info = await new Promise(async resolve => {
                let projects = await this.database.readFiles(`/projects/`)
                let files = projects.filter(s => s.includes(name))
                let info = {
                    settings: null,
                    classes: []
                }
                files.forEach(async (s,i) => {
                    let file = await this.database.readFile(`/projects/${s}`)
                    let text = file.toString('utf-8')
                    if (s.includes('settings.js')) {
                        info.settings = text
                    }
                    else {
                        info.classes.push(text)
                    }
                    if (i == files.length-1) resolve(info)
                })
            })
            let classes = {}
            info.classes.forEach(c => {
                c = eval(`(${c.split('export')[0]})`)
                classes[c.name] = c
            })

            // Replace Class Imports
            var re = /import\s+{([^{}]+)}[^\n]+/g;
            var m;
            do {
                m = re.exec(info.settings);
                if (m) {
                    info.settings = info.settings.replace(m[0], `const ${m[1]} = ${classes[m[1]]}`)
                }
            } while (m);

            // Replace Brains@Play Imports
            let prevDeclarations = []
            var re = /brainsatplay.([^.,}]+).([^.,}]+).([^.,}]+)/g;
            var m;
            do {
                m = re.exec(info.settings);
                if (m) {
                    let defaultClass = brainsatplay[m[1]]
                    for (let i = 2; i < m.length; i ++){
                        defaultClass = defaultClass[m[i]]
                    }
                    defaultClass = eval(`(${defaultClass})`)
                    let variableName = m[m.length - 1]
                    if (!prevDeclarations.includes(variableName)){
                        info.settings = `const ${m[m.length - 1]} = ${defaultClass}\n${info.settings}`
                        prevDeclarations.push(variableName)
                    }
                    info.settings = info.settings.replace(m[0], variableName)
                }
            } while (m);

            let moduleText = "data:text/javascript;base64," + btoa(info.settings);
            let module = await import(moduleText);
            let settings = module.settings
            resolve(settings)
        })
    }
}