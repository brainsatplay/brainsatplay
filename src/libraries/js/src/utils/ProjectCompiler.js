import JSZip from 'jszip'
import fileSaver from 'file-saver';
import  {plugins} from '../../brainsatplay'

let defaultPlugins = []
for (let type in plugins){
    for (let name in plugins[type]){
        plugins[type][name]
        defaultPlugins.push({name: name, label: `brainsatplay.plugins.${type}.${name}`})
    }
}

export class ProjectCompiler{
    constructor(){
        this.helper = new JSZip();
        this.folders = {
            app: this.helper.folder("app")
        }
        this.customPlugins = []
        this.addDefaultFiles()
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

    download(filename='brainsatplay'){
        this.helper.generateAsync({type:"blob"})
        .then(function(content) {
            fileSaver.saveAs(content, `${filename}.zip`);
        });
    }



    add(applet){

        let info = JSON.parse(JSON.stringifyFast(applet.info))
        let imports = ``

        // Add imports
        let classNames = []
        applet.info.graph.nodes.forEach(n => {
            let found = defaultPlugins.find(o => {if (o.name === n.class.name) return o})
            if (!found) {
                this.addClass(n.class)
                imports += `import {${n.class.name}} from "./${n.class.name}.js"\n`
                classNames.push(n.class.name)
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
        
        return this.folders.app.file('settings.js', `${imports}
        
        export const settings = ${info}`)
    }

    addClass(cls){
        this.customPlugins.push(cls)
        return this.folders.app.file(`${cls.name}.js`,cls.toString() + `\nexport {${cls.name}}`)
    }
}