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
            delete n['controls']
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
        return new Promise(async (resolve, reject) => {
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

            // Replace Class Imports with Random Ids (to avoid stringifying)
            let classMap = {}
            var re = /import\s+{([^{}]+)}[^\n]+/g;
            let m;
            do {
                m = re.exec(info.settings) ?? re.exec(info.settings)
                if (m) {
                    let id = String(Math.floor(Math.random()*1000000))
                    classMap[id] = {
                        name: m[1],
                        class: classes[m[1]]
                    }
                    info.settings = info.settings.replace(m[0], ``)
                    info.settings = info.settings.replace(`"class":${m[1]}`,`"class":${id}`)
                }
            } while (m);

            m = re.exec(info.settings);

            var re = /brainsatplay\.([^\.\,}]+)\.([^\.\,}]+)\.([^\.\,}]+)/g;
            let m2;
            do {
                m2 = re.exec(info.settings);
                if (m2) {
                    let defaultClass = brainsatplay[m2[1]]
                    for (let i = 2; i < m2.length; i ++){
                        defaultClass = defaultClass[m2[i]]
                    }

                    let id = String(Math.floor(Math.random()*1000000))
                    classMap[id] = {
                        name: m2[m2.length - 1],
                        class: defaultClass
                    }
                    info.settings = info.settings.replace(m2[0], id)
                }
            } while (m2);

            let settings
            try {
                let moduleText = "data:text/javascript;base64," + btoa(info.settings);
                let module = await import(moduleText);
                settings = module.settings

                // Replace Random IDs with Classes
                settings.graph.nodes.forEach(n => {
                    n.class = classMap[n.class].class
                })
                resolve(settings)
            } catch(e) {console.log(e); reject()}
        })
    }
}