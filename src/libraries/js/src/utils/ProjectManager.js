import JSZip from 'jszip'
import fileSaver from 'file-saver';
import * as brainsatplay from '../../brainsatplay'

let defaultPlugins = []
for (let type in brainsatplay.plugins){
    for (let name in brainsatplay.plugins[type]){
        defaultPlugins.push({name: name, id: brainsatplay.plugins[type][name].id, label: `brainsatplay.plugins.${type}.${name}`})
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


    loadFromFile(){
        return new Promise(async (resolve) => {
            let fileArray = await new Promise(resolve => {
                let input = document.createElement('input')
                input.type = 'file'
                input.accept=".zip"
                input.click()

                input.onchange = (e) => {
                    let fileList = input.files;
                    for (let file of fileList){
                        this.helper.loadAsync(file)
                        .then(async (zip) => {
                            let fileArray = []
                            let i = 0
                            for (let filename in zip.files){
                                let split = filename.split('app/')
                                if (split.length === 2 && split[1] != ''){
                                    zip.file(filename).async("string").then(text => {
                                        fileArray.push({text, filename: filename.split('app/')[1]})
                                        i++
                                        if (i == Object.keys(zip.files).length) resolve(fileArray)
                                    })
                                } else {
                                    i++
                                }
                            }
                        })
                    }
                }
            })
            let settings = await this.load(fileArray)
            resolve(settings)
        })
    }

    appToFile(app){

        let info = JSON.parse(JSON.stringifyFast(app.info))
        let imports = ``
        // Add imports
        let classNames = []
        let classes = []
        app.info.graph.nodes.forEach(n => {
            let found = defaultPlugins.find(o => {if (o.id === n.class.id) return o})
            if (!found && !classNames.includes(n.class.name)) {
                imports += `import {${n.class.name}} from "./${n.class.name}.js"\n`
                classNames.push(n.class.name)
                classes.push(n.class)
            } else if (found){
                classNames.push(found.label)
            } else if (classNames.includes(n.class.name)){
                classNames.push(n.class.name)
            }
        })

        info.graph.nodes.forEach((n,i) => {
            delete n['instance']
            delete n['ui']
            delete n['fragment']
            delete n['controls']
            delete n['analysis']
            n.class = `${classNames[i]}`
        })

        for (let key in info.graph){
            if (key != 'nodes' && key != 'edges'){
                delete info.graph[key]
            }
        }

        info = JSON.stringifyFast(info)
        
        // Replace Stringified Class Names with Actual References (provided by imports)
        var re = /"class":\s*"([^\/"]+)"/g;
        var m;

        do {
            m = re.exec(info);
            if (m) {
                info = info.replaceAll(m[0], '"class":' + m[1])
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

    async getFilesFromDB(name){
        return new Promise(async (resolve, reject) => {
            let projects = await this.database.readFiles(`/projects/`)
            let files = projects.filter(s => s.includes(name))
            let fileArray = []
            files.forEach(async (s,i) => {
                let file = await this.database.readFile(`/projects/${s}`)
                let text = file.toString('utf-8')
                fileArray.push({text, filename: s})
                if (i == files.length-1) resolve(fileArray)
            })
        })
    }

    async load(files){
        return new Promise(async (resolve, reject) => {
            if (files.length > 0){
            let info = await new Promise(async resolve => {
                let info = {
                    settings: null,
                    classes: []
                }

                files.forEach(async (o,i) => {
                    if (o.filename.includes('settings.js')) {
                        info.settings = o.text
                    }
                    else {
                        info.classes.push(o.text)
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
                m = re.exec(info.settings)
                if (m) {
                    let id = String(Math.floor(Math.random()*1000000))
                    classMap[id] = {
                        name: m[1],
                        class: classes[m[1]]
                    }
                    info.settings = info.settings.replaceAll(m[0], ``)
                    info.settings = info.settings.replaceAll(`"class":${m[1]}`,`"class":${id}`)
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
                    info.settings = info.settings.replaceAll(m2[0], id)
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
        } else reject('file array is empty')
        })
    }
}