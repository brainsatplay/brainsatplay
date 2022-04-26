import { StateManager } from './StateManager'

// Project Selection
// import { appletManifest } from '././././platform/appletManifest' // MUST REMOVE LINKS TO PLATFORM
// import { getAppletSettings, dynamicImport } from "./utils/general/importUtils"


// Node Interaction
import { Port } from './Port'
import { Graph } from './Graph'

export default class Editor{

    files = {}
    filesidebar = {}
    container = document.createElement('div')

    constructor(graph, parent=document.body) {
        // this.manager = manager

        // let visualizationGraph = new Graph(graph, {app: this.app}, true)

        this.app = {
            projects: {},
            graphs: {},
            ui: {
                container: document.createElement('div')
            },
            editor: this
        }

        this.parentNode = (typeof parent === 'string') ? document.getElementById(parent) : parent 

        this.graph=null
        this.shown = false
        this.context = {
            scale: 1
        }
        this.searchOptions = []
        this.local = window.location.origin.includes('localhost')

        this.toggle = null

        this.selectorToggle = null
        this.search = null
        this.state = new StateManager()

        this.lastMouseEvent = {}
        this.editing = false

        this.props = {
            id: String(Math.floor(Math.random()*1000000)),
            projectContainer: null,
            projectDefaults: null,
            open: false
        }

        this.elementTypesToUpdate = ['INPUT', 'SELECT', 'OUTPUT', 'TEXTAREA']
    
        // if (this.app){

            // // Only One Editor (look three levels up)
            // let existingEditor = this.parentNode.querySelector(`.brainsatplay-node-editor`)
            // if (!existingEditor && this.parentNode.parentNode) existingEditor = this.parentNode.parentNode.querySelector(`.brainsatplay-node-editor`)
            // if (!existingEditor && this.parentNode.parentNode.parentNode) existingEditor = this.parentNode.parentNode.parentNode.querySelector(`.brainsatplay-node-editor`)
            // if (existingEditor) existingEditor.remove()

            this.container.id = `${this.props.id}GraphEditorMask`
            this.container.classList.add('brainsatplay-default-container')
            this.container.classList.add('brainsatplay-node-editor')
            this.container.style.background = 'black'
            this.container.style.display ='none'
            this.container.innerHTML = `
                    <div id="${this.props.id}FileSidebar" class="brainsatplay-node-sidebar" style="min-width: 150px; width: 150px; height: 100%;">
                        <div class='header node-sidebar-section'>
                            <h3>Project Files</h3>
                        </div>

                        <div class="brainsatplay-option-type option-type-collapsible">Graphs</div>
                        <div class="graphs option-type-content">

                        </div>

                        <div class="brainsatplay-option-type option-type-collapsible">Code</div>
                        <div class="code option-type-content">

                        </div>
                    </div>
                    <div id="${this.props.id}MainPage" class="main">
                        <div class="brainsatplay-node-editor-preview-wrapper">
                            <div id="${this.props.id}preview" class="brainsatplay-node-editor-preview">
                                <div style="width: 100%; height: 100%;" id="${this.props.id}defaultpreview"></div>
                            </div>
                        </div>
                        <div id="${this.props.id}ViewTabs" class="brainsatplay-node-editor-tabs">
                        </div>
                        <div id="${this.props.id}Editor" class="brainsatplay-node-viewer">
                        </div>
                    </div>
                    <div id="${this.props.id}GraphEditor" class="brainsatplay-node-sidebar">
                        <div>
                            <div class='node-sidebar-section'>
                                <h3>Projects</h3>
                            </div>
                            <div id="${this.props.id}projects" class='node-sidebar-content'>
                            </div>
                            <div class='node-sidebar-section'>
                                <h3>Project Info</h3>
                            </div>
                            <div id="${this.props.id}settings" class='node-sidebar-content'></div>
                            <div class='node-sidebar-content' style="display: flex; flex-wrap: wrap; padding: 10px;">
                                <button id="${this.props.id}download" class="brainsatplay-default-button">Download Project</button>
                                <button id="${this.props.id}reload" class="brainsatplay-default-button">Reload Project</button>
                                <button id="${this.props.id}save" class="brainsatplay-default-button">Save Project</button>
                                <button id="${this.props.id}publish" class="brainsatplay-default-button">Publish Project</button>
                                <button id="${this.props.id}exit" class="brainsatplay-default-button">Close Editor</button>
                            </div>
                            <div class='node-sidebar-section'>
                                <h3>Node Editor</h3>
                                <button id="${this.props.id}add" class="brainsatplay-default-button addbutton">+</button>
                            </div>
                            <div id="${this.props.id}portEditor" class='node-sidebar-content'>
                            <p></p>
                            </div>
                        </div>
                        <div>
                            <div id="${this.props.id}params" class='node-sidebar-content' style="display: flex; flex-wrap: wrap; padding-top: 10px;">
                                <button id="${this.props.id}edit" class="brainsatplay-default-button">Edit Node</button>
                                <button id="${this.props.id}delete" class="brainsatplay-default-button">Delete Node</button>
                            </div>
                        </div>
                    </div>
                `
        
            // this.element = new DOMFragment(
            //     this.container,
            //     this.parentNode,
            //     undefined,
            //     () => {
                    // Set UI Attributes
                    this.filesidebar.container = this.container.querySelector(`[id="${this.props.id}FileSidebar"]`)
                    this.filesidebar.graph = this.filesidebar.container.querySelector(`.graphs`)
                    this.addDropdownFunctionality(this.filesidebar.graph.previousElementSibling)

                    this.filesidebar.code = this.filesidebar.container.querySelector(`.code`) 
                    this.addDropdownFunctionality(this.filesidebar.code.previousElementSibling)

                    
                    this.filesidebar.header = this.filesidebar.container.querySelector(`.header`) 

                    this.mainPage = this.container.querySelector(`[id="${this.props.id}MainPage"]`)
                    this.editor = this.container.querySelector(`[id="${this.props.id}Editor"]`)
                    this.viewer = this.container.querySelector(`[id="${this.props.id}NodeViewer"]`)
                    this.preview = this.mainPage.querySelector('.brainsatplay-node-editor-preview')
                    this.sidebar = this.container.querySelector(`[id="${this.props.id}GraphEditor"]`)
                    this.download = this.container.querySelector(`[id="${this.props.id}download"]`)
                    this.reload = this.container.querySelector(`[id="${this.props.id}reload"]`)
                    this.exit = this.container.querySelector(`[id="${this.props.id}exit"]`)
                    this.defaultpreview = this.container.querySelector(`[id="${this.props.id}defaultpreview"]`)
                    this.portEditor = this.container.querySelector(`[id="${this.props.id}portEditor"]`)
                    this.edit = this.container.querySelector(`[id="${this.props.id}edit"]`)
                    this.delete = this.container.querySelector(`[id="${this.props.id}delete"]`)
                // } // setup function, moved to init
            // )

        window.addEventListener('resize', this.responsive)


        // Setup UI
        this.insertProjects()

        // Setup User Interactions
        let publishButton = this.container.querySelector(`[id="${this.props.id}publish"]`)
        publishButton.onclick = () => {
            this.app.updateGraph()
            // this.app.session.projects.publish(this.app)
        }
        publishButton.classList.add('disabled')

        this.edit.style.display = 'none'
        this.delete.style.display = 'none'

        this.download.onclick = () => {
            // this.app.session.projects.download(this.app, undefined, () => {this.download.classList.remove('disabled')}, () => {this.download.classList.add('disabled')})
        }

        // this.reload.classList.add('disabled')
        this.reload.onclick = () => {
            this.app.reload()
        }

        this.exit.onclick = () => {
            this.toggleDisplay()
        }

        // Create Tab Container
        this.createViewTabs()

        // Add Settings Editor
        this.createSettingsEditor(this.app.info)

        // Insert Node Selector with Right Click
        this.toggleContextMenuEvent(this.editor)

        // Search for Plugins
        this.createPluginSearch(this.mainPage)

        // Display Top-Level Graph
        this.app.graphs['top'] = new Graph(graph, {app: this.app}, true)


        console.log('INITING GRAPH',this.app.graphs, this.app.graphs.top)
        this.app.graphs['top'].init()

        // Initialize Editor
        this.init()
    // }

    }

    init = async () => {

            this.settings = Object.assign({parentId: this.app.ui?.parent?.id, show: false, create: true}, this.app.info?.editor ?? {})

            if (!document.getElementById(this.settings.parentId)) this.settings.parentId = this.app.ui?.parent?.id

            this.filesidebar.header.querySelector('h3').innerHTML = this.app.info?.name

            this.download.classList.add('disabled')

            this.createSettingsEditor(this.app.info)

            // Setup Presentation Based On Settings
            if (this.settings.style) this.container.style = this.settings.style 

            if (this.settings.show) this.toggleDisplay(true)
        }

    setToggle = (toggle = this.settings.toggle) => {
        this.toggle = (typeof toggle === 'string') ? this.app.ui.container.querySelector(`[id="${toggle}"]`) : toggle
        if (this.toggle) this.toggle.addEventListener('click', () => {this.toggleDisplay()})
    }


    insertProjects = async () => {

        this.props.projectContainer = this.container.querySelector(`[id="${this.props.id}projects"]`)
        this.props.projectContainer.style.padding = '0px'
        this.props.projectContainer.style.display = 'block'

        let galleries = {}
        galleries['My Projects'] = []
        galleries['Defaults'] = []

        // // Get Project Settings Files
        // let projectSet = await this.app.session.projects.list()
        // for (let key in projectSet) {
        //     projectSet[key] = Array.from(projectSet[key])
        // }

        // let length = projectSet.local.length
        // let projects = Array.from({length}, e => new Promise(()=> {})) 
        // for(let i=0;i<projectSet.local.length;i++) {
        //     let str = projectSet.local[i]
        //     let files = await this.app.session.projects.getFilesFromDB(str)
        //     let settings =  await this.app.session.projects.load(files)
        //     projects[i] = {destination: 'My Projects', settings}
        // }

        // Get Template Files
        let templateSet = []

        try {
            console.log('COMMENTED OUT')
            // for (let key in appletManifest){
            //     let o = appletManifest[key]
            //     let settings = await getAppletSettings(o.folderUrl)
            //     if (settings.graph) {
            //         if (o.folderUrl.includes('/Templates')) templateSet.push({destination: 'Templates', settings})
            //         else templateSet.push({destination: 'Library', settings})
            //     }
            // }
        } catch (e) {}

        Promise.allSettled([
            // ...projects,
            ...templateSet
        ]).then(set => {

            let restrictedTemplates = ['BuckleUp', 'Analyzer', 'Brains@Play Studio', 'One Bit Bonanza', 'Applet Browser']
            set.forEach(o => {
                if (o.status === 'fulfilled' && o.value.settings){
                    if (!restrictedTemplates.includes(o.value.settings.name)) {
                        if (galleries[o.value.destination] == null) galleries[o.value.destination] = []
                        
                        galleries[o.value.destination].push(o.value.settings)
                    }
                }
            })

            // Add Load from File Button
            galleries['Defaults'].unshift({name: 'Load from File'})

            let galleryKeys = ['Defaults', 'My Projects', 'Templates', 'Library'] // Specify ordering

            let lastClickedProjectCategory = ''
            galleryKeys.forEach(k => {

                let projectArr = galleries[k]

                if (projectArr){
                    // Create Top Header
                    if (k !== 'Defaults'){
                        let div = document.createElement('div')
                        div.classList.add(`brainsatplay-option-type`) 
                        div.classList.add(`option-type-collapsible`)
                        div.innerHTML = k
                        this.addDropdownFunctionality(div)
                        this.props.projectContainer.insertAdjacentElement('beforeend', div)
                    }

                    // Create Project List
                    let projects = document.createElement('div')
                    projects.id = `${this.props.id}-projectlist-${k}`
                    projects.classList.add("option-type-content")
                    this.props.projectContainer.insertAdjacentElement(`beforeend`, projects)

                    if (k === 'Defaults') {
                        this.props.projectDefaults = projects
                        this._resizeDefaultProjects()
                    }

                    projectArr.forEach(settings => {

                        // Set Experimental Version on Example Projects
                        if (!['Defaults', 'My Projects'].includes(k)) settings.version = 'experimental'

                        let item = document.createElement('div')
                        item.innerHTML = settings.name
                        item.classList.add('brainsatplay-option-node')
                        item.style.padding = '10px 20px'
                        item.style.display = 'block'

                        item.onclick = async () => {
                            
                            // Rename Template Projects
                            if (k !== 'My Project'){
                                settings = Object.assign({}, settings)
                                if (settings.name === 'Blank Project') settings.name = 'My Project'
                            }

                            // Create Application
                            if (settings.name === 'Load from File') {
                                // settings = await this.app.session.projects.loadFromFile()
                                // this._createApp(settings)
                            } else {
                                if (((this.lastSavedProject === this.app.info?.name) || lastClickedProjectCategory == 'My Projects') && k === 'My Projects' && this.app.info?.name === settings.name) this._createApp(this.app.info)
                                else this._createApp(settings)
                            }
                        // }
                        lastClickedProjectCategory = k

                        }
                        if (settings.name === 'Blank Project' || settings.name === 'Load from File') projects.insertAdjacentElement('afterbegin',item)
                        else projects.insertAdjacentElement('beforeend',item)
                    })
                }
            })
        })
    }

    _createApp(settings){

        settings.editor = {
            parentId: this.app.ui.parent,
            show: true,
            style: `
            position: block;
            z-index: 9;
            `,
        }

        this.app.replace(settings)
    }

    createViewTabs = () => {

        let parentNode = this.container.querySelector(`[id="${this.props.id}ViewTabs"]`)

        // Add Tab Div
        let tabs = document.createElement('div')
        tabs.classList.add('tab')
        parentNode.insertAdjacentElement('afterbegin', tabs)
    }
    
    removeGraph = (graph) => {
        if (this.files[graph.name]){
            for (const key in this.files[graph.name].files){
                let elements = this.files[graph.name].files[key]
                if (elements.tab){
                    elements.tab.querySelector('.closeIcon').click()
                }
            }
            delete this.files[graph.name]
        }
    }

    addGraph = (graph) => {

            // Create Graph File
            let type = graph.constructor?.name
            this.files[graph.id] = {name: graph.name, type, nodes: [], graph}
            this.files[graph.id].elements = {}
            this.files[graph.id].elements.code = (graph.ui.code instanceof Function) ? graph.ui.code() : graph.ui.code 
            this.files[graph.id].elements.graph = (graph.ui.graph instanceof Function) ? graph.ui.graph() : graph.ui.graph 

            // let nodes = graph.info.internal.length // initial nodes
            // let parentnodes = graph.parent?.info?.nodes?.length // initial nodes
            
            let showGraph = true// type === 'Graph' && (nodes > 0 || (graphs === 0 && (parentnodes === 0 || parentnodes == undefined)))
            this.createFileElement(this.files[graph.id], {graph: showGraph})
            let save = this.container.querySelector(`[id="${this.props.id}save"]`)
            save.onclick = this.app.save
    }

    addCloseIcon(parent, callback){
        let closeIcon = document.createElement('div')
        closeIcon.classList.add('closeIcon')

        if (callback){
            closeIcon.innerHTML = 'x'
            closeIcon.onclick = () => {
                callback()
            }
        }

        if (parent.style.position != 'absolute') parent.style.position = 'relative'
        parent.insertAdjacentElement('beforeend', closeIcon)
    }

    addTab(o, type, onOpen=()=>{}, lock=false){
        if (o.files[type].tab == null){
            let tab = document.createElement('button')
            tab.classList.add('tablinks')
            tab.innerHTML = o.name

            // Format Containers
            // if (o.elements[type] instanceof Function) o.elements[type] = o.elements[type]() // construct if required

            o.elements[type].style.position = 'absolute'
            o.elements[type].style.top = '0'
            o.elements[type].style.left = '0'
            this.editor.insertAdjacentElement('beforeend', o.elements[type])

            let isGraph = !!o.graph

            let defaultOnClose = () => {
                o.files[type].tab.remove()
                o.files[type].tab = null
            }

            if (isGraph){
                let onClose = () => {
                    if (tab.previousElementSibling){ // do not remove if last tab
                        tab.style.display = 'none'
                        tab.previousElementSibling.click()
                    }
                    defaultOnClose()
                }
                this.addCloseIcon(tab,onClose)
            } else {
                this.addCloseIcon(tab, defaultOnClose)
            }

            tab.onclick = () => {

                if (tab.style.display !== 'none'){

                    // Close Other Tabs
                    for (const name in this.files){
                        let file = this.files[name]
                        // for (let tab of allTabs){
                            for (let type in file.files){
                                if (file.files[type]?.tab && file.elements[type]){
                                    if(file.files[type]?.tab != tab) {
                                        file.elements[type].style.display = 'none'
                                        file.files[type]?.tab.classList.remove('active')
                                    } else {
                                        file.elements[type].style.display = ''
                                        tab.classList.add('active')
                                        onOpen(file.elements[type])
                                    }
                                }
                            }
                        // }
                    }
                }


                if (isGraph) this.graph = o.graph
                else this.graph = null
                this.currentFile = o.files[type]

                this.responsive()
            }

            this.container.querySelector('.tab').insertAdjacentElement('beforeend', tab)
            this.responsive()
            o.files[type].tab  = tab
        }

        
        let currentTab = this.currentFile?.tab
        o.files[type].tab.click()
        if (currentTab && !lock) currentTab.click()

        return o.files[type].tab 
    }

    toggleContextMenuEvent = (el) => {
        el.addEventListener('contextmenu', (ev) =>{
            ev.preventDefault();
            this.nextNode = {
                position: {
                    x: ev.clientX,
                    y: ev.clientY
                }
            }
            // alert('success!');
            this.selectorToggle.click()
            return false;
        }, false);
    }

    createSettingsEditor(target={}){
            let settingsContainer = this.container.querySelector(`[id="${this.props.id}settings"]`)
            settingsContainer.innerHTML = ''

            // settings = Object.assign({}, settings) // shallow copy

            let toParse ={}

            let dummySettings = {
                name: "",
                devices: [""],
                author: "",
                description: "",
                categories: [],
                instructions: "",
                image: null,
                // version: this.app.session.projects.version,

                display: {
                  production: false,
                  development: false
                },

                intro: {
                    title: false,
                    mode: 'solo', // 'solo', 'multiplayer'
                    login: null,
                    domain: null,
                    session: null,
                    spectating: false,
                },

                // editor: {
                //     create: false,
                //     parentId: null,
                //     show: false,
                //     style: '',
                // },

                connect: {
                    filter:[],
                    toggle: '',
                    onconnect: () => {}
                },
            
                // App Logic
                // graph:
                // {
                //   nodes: [],
                //   edges: []
                // },
            }

            let inputDict = {}
            Object.keys(dummySettings).forEach(key => {
                if (target[key] == null) target[key] = dummySettings[key]
                toParse[key] = {data: target[key], target}
                toParse[key].input =  {type: typeof target[key]}

                switch(key){
                    case 'image':
                        toParse[key].input =  {type: 'file', accept: 'image/*'}
                        break
                    case 'instructions':
                        toParse[key].input =  {type: 'HTML'}
                        break    
                    default:
                        let type = typeof target[key]
                        if (type === 'object') if (Array.isArray(target[key])) type = Array
                        toParse[key].input =  {type}
                }

                let includeButDontShow = ['display', 'version']
                 
                if (!includeButDontShow.includes(key)){
                    let {container, input} = this.createObjectEditor(toParse, key)
                    if (container) {
                        settingsContainer.insertAdjacentElement('beforeend', container)
                        inputDict[key] = input
                    }
                }
            })

            delete this.state.data[`activeSettingsFile`]


        }

        _resizeDefaultProjects = () => {
            setTimeout(() => {if (this.props.projectDefaults) this.props.projectDefaults.style.maxHeight = `${this.props.projectDefaults.scrollHeight}px`}, 50)
        }


    toggleDisplay(on){
        // if (this.element){

            if (on === true || (on != false && this.container.style.display == 'none')){
                this.parentNode.insertAdjacentElement('beforeend', this.container)
                setTimeout(() => {
                    this.container.style.display = ''
                // this.container.style.opacity = 1
                this.container.style.pointerEvents = 'auto'
                this.shown = true

                // Move App Into Preview
                this.preview.appendChild(this.app.ui.container)
                this.defaultpreview.style.display = 'none'
                // setTimeout(() => {
                    this.responsive()
                    // this.app.graphs.forEach(g => {
                    //     g._resizeUI() 
                    //     if (g === this.graph) {
                    //         this.graph.resizeAllNodes()
                    //         this.graph.resizeAllEdges()
                    //         // this.graph._nodesToGrid()
                    //     }
                    // })
                    this._resizeDefaultProjects()
                },50)
            } else if (!on) {
                this.container.style.display = 'none'
                // this.container.style.opacity = 0
                this.container.style.pointerEvents = 'none'
                this.shown = false

                this.app.ui.parent.appendChild(this.app.ui.container)
                this.defaultpreview.style.display = 'block'
                this.responsive()
                // this.app.graphs.forEach(g => {
                //     g._resizeUI() 
                // })
            }
        // }
    }

    removeEdge(e, ignoreManager=false){
        e.parent.removeEdge(e)
        if (!ignoreManager) this.manager.removeEdge(this.app.props.id, e.structure)
    }


    animate(source,target,latencyArr){
        if (this.shown){
            if (latencyArr) {
                latencyArr.forEach(o => {
                    this.animateLatency(o.node,o.port,o.latency)
                })
            }
            this.animateNode(source,'source')
            this.animateNode(target,'target')
            this.animateEdge(source,target)
        }
    }
    
    getColorfromMap = (pct, map) => {
        for (var i = 1; i < map.length - 1; i++) {
            if (pct < map[i].pct) {
                break;
            }
        }
        var lower = map[i - 1];
        var upper = map[i];
        var range = upper.pct - lower.pct;
        var rangePct = (pct - lower.pct) / range;
        var pctLower = 1 - rangePct;
        var pctUpper = rangePct;
        var color = {
            r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
            g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
            b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
        };
        return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
        // or output as hex if preferred
    };

    animateLatency(node, port, latency){
        let instance = node
        let pct = Math.min(1,latency/1)

        let map = [
            { pct: 0.0, color: { r: 0x39, g: 0xff, b: 0x14 } },
            { pct: 0.5, color: { r: 0xfa, g: 0xed, b: 0x27 } },
            { pct: 1.0, color: { r: 0xff, g: 0x14, b: 0x39 } } 
        ];
        
        if (instance){
            let el = instance.portLabels.querySelector(`.latency-display[name="${port}"]`)
            el.style.width = `${pct*100}%`
            el.style.background = this.getColorfromMap(pct, map)
        }
    }

    animateNode(node,type){
        let instance = node
        if (instance){
            let portEl = instance.element.querySelector(`.${type}-ports`).querySelector(`.port-${node.port}`)
            if (portEl) {
                portEl.classList.add('updated')
                portEl.setAttribute('data-update', Date.now())
                setTimeout(()=>{
                    if (portEl.getAttribute('data-update') < Date.now() - 450){
                        portEl.classList.remove('updated')
                    }
                }, 500)
            }
        }
    }

    animateEdge(source,target){
        let instance = source
        instance.edges.forEach(e=>{
            if(e.structure.source.port === source.port){
                if (e.structure.target){
                    if (e.structure.target.node === target.name && e.structure.target.port == target.port){
                        e.node.curve.classList.add('updated')
                        e.node.curve.setAttribute('data-update', Date.now())
                        setTimeout(()=>{
                            if (e.node.curve.getAttribute('data-update') < Date.now() - 450){
                                e.node.curve.classList.remove('updated')
                            }
                        }, 500)
                    }
                }
            }
        })
    }


    createObjectEditor(toParse, key){

        // Properly Nest Divs
        let container = document.createElement('div')
        let innerContainer = document.createElement('div')
        let label = document.createElement('p')
        label.innerHTML = key

        innerContainer.insertAdjacentElement('beforeend', label)
        container.insertAdjacentElement('beforeend', innerContainer)

        if (toParse[key] instanceof Port) {
            label.style.cursor = 'pointer'

            label.onclick = () => {
                toParse[key].edit('self')
            }
        }

        let inputContainer = document.createElement('div')
        inputContainer.style.position = 'relative'

        if (!!toParse[key] && toParse[key].edit != false){ // only parse ports that exist on initialization

            // Port Type
            let defaultType
            if (toParse[key].output?.type === null) defaultType = toParse[key].input?.type // Input if output is null
            else if (toParse[key].output?.type === undefined) defaultType = typeof toParse[key].data // Data type if output is undefined
            else defaultType = toParse[key].output?.type // Otherwise specified output type

            if (typeof defaultType !== 'string' && defaultType?.name) defaultType = defaultType.name
            // Catch Functions
            if (defaultType === 'function') defaultType = 'Function'

            // Filter out elements
            defaultType = (defaultType === "object" ? toParse[key].data instanceof HTMLElement : toParse[key].data && typeof toParse[key].data === "object" && toParse[key].data !== null && toParse[key].data.nodeType === 1 && typeof toParse[key].data.nodeName==="string") ? 'Element' : defaultType
            

            let specifiedOptions = toParse[key].options
            let optionsType = typeof specifiedOptions

            let input


        // Cannot Handle Objects or Elements
        if (defaultType && defaultType != 'undefined' && defaultType != 'Element'){
            if (optionsType == 'object' && specifiedOptions != null){
                    let options = ``
                    toParse[key].options.forEach(option => {
                        let attr = ''
                        if (option === toParse[key].data) attr = 'selected'
                        options += `<option value="${option}" ${attr}>${option}</option>`
                    })
                    input = document.createElement('select')
                    input.innerHTML = options
            } else if (defaultType === 'Array'){

                if (!Array.isArray(toParse[key].data)) toParse[key].data = []

                let container = document.createElement('div')
                container.style.width = '100%'
                container.style.fontSize = `75%`
                
                let insertOption = (v) => {
                    let option = document.createElement('div')
                    option.style.padding = '6px 0px'
                    option.innerHTML = v
                    this.addCloseIcon(option, () => {
                        option.remove()
                        toParse[key].data.find((val,i) => {
                            if (val === v){
                                toParse[key].data.splice(i,1)
                            }
                        })
                    })
                    container.insertAdjacentElement('beforeend',option)
                }

                input = document.createElement('div')
                input.style.width = '100%'

                toParse[key].data.forEach(v => {
                    insertOption(v)
                })

                let div = document.createElement('div')
                div.style= `
                    display: flex;
                    align-items: center;
                    width: 100%;
                    flex-grow: 0;
                `

                let textInput = document.createElement('input')
                textInput.type = 'text'
                textInput.placeholder = 'Add tag'

                let button = document.createElement('button')
                button.classList.add('brainsatplay-default-button')
                button.classList.add('addbutton')
                button.innerHTML = `+`
                button.onclick = () => {
                    let set = new Set(toParse[key].data)
                    if (!set.has(textInput.value)){
                        insertOption(textInput.value)
                        toParse[key].data.push(textInput.value)
                    }
                    textInput.value = ''
                }

                div.insertAdjacentElement('beforeend',textInput)
                div.insertAdjacentElement('beforeend',button)
                input.insertAdjacentElement('beforeend',container)
                input.insertAdjacentElement('beforeend',div)


            } else if (defaultType === 'object'){
                input = document.createElement('textarea')
                input.value = JSON.stringify(toParse[key].data, null, '\t')
            } else if (defaultType === 'boolean'){
                input = document.createElement('input')
                input.type = 'checkbox'
                input.checked = toParse[key].data
            } else if (defaultType === 'number'){
                if ('min' in toParse[key] && 'max' in toParse[key]){
                    input = document.createElement('input')
                    input.type = 'range'
                    input.min = toParse[key].min
                    input.max = toParse[key].max
                    if (toParse[key].step) input.step = toParse[key].step
                    let output = document.createElement('output')
                    inputContainer.insertAdjacentElement('afterbegin',output)
                    input.value = toParse[key].data
                    output.innerHTML = input.value
                } else {
                    input = document.createElement('input')
                    input.type = 'number'
                    input.value = toParse[key].data
                }
            } else if (['Function', 'HTML', 'CSS', 'GLSL'].includes(defaultType)){
                input = document.createElement('button')
                input.classList.add('brainsatplay-default-button')
                input.style.width = 'auto'
                input.innerHTML = `Edit ${defaultType}`

                input.onclick = () => {
                    toParse[key].edit()
                }
            } else if (defaultType === 'file'){
                
                let text = 'Choose File'
                input = document.createElement('input')
                input.type = 'file'
                input.accept = toParse[key].input?.accept // Only in new format

                if (toParse[key].input?.multiple){
                    input.multiple = true // Only in new format
                }
                input.style.display = 'none'

                // Add image display
                let button = document.createElement('button')
                let img = document.createElement('img')
                button.classList.add('brainsatplay-default-button')
                button.innerHTML = text
                button.style.width = 'auto'

                if (input.accept.includes('image')){
                    img.style = `
                        max-width: 50%;
                        cursor: pointer;
                    `

                    input.addEventListener('input', () => {
                        let file = input.files[0]
                        if (file){
                            var reader = new FileReader();
                            reader.onloadend = () => {
                                toParse[key].data = reader.result
                                if (toParse[key].data) {
                                    img.src = toParse[key].data
                                    img.style.display = ''
                                    button.style.display = 'none'
                                } else {
                                    img.style.display = 'none'
                                    button.style.display = ''
                                }
                            }
                            reader.readAsDataURL(file);
                        }
                    })
                
                if (toParse[key].data != null){
                    img.src = toParse[key].data
                    img.style.display = ''
                    button.style.display = 'none'
                } else {
                    img.style.display = 'none'
                    button.style.display = ''
                }
                inputContainer.insertAdjacentElement('beforeend',img)
            } 
                inputContainer.insertAdjacentElement('beforeend',button)

                img.onclick = button.onclick = () => {
                    input.click()
                    button.blur()
                }
            }
            else {
                    input = document.createElement('input')

                    // Check if Color String
                    if (defaultType == 'color' || /^#[0-9A-F]{6}$/i.test(toParse[key].value)){
                        input.type = 'color'
                    } else {
                        input.type = 'text'
                    }
                    input.value = toParse[key].data
            }

            // Add to Document
                inputContainer.insertAdjacentElement('beforeend',input)
                container.insertAdjacentElement('beforeend',inputContainer)
                container.classList.add(`content-div`)                

                // Update Object Data from Gui
                input.oninput = (e) => {
                    
        let value
        if (this.elementTypesToUpdate.includes(input.tagName)){
            if (input.tagName === 'TEXTAREA') {
                try{
                    value = JSON.parse(input.value)
                } catch (e) {console.warn('JSON not parseable', e)}
            }
            else if (input.type === 'checkbox') value = input.checked
            else if (input.type === 'file') value = input.files;
            else if (['number','range'].includes(input.type)) {
                let possibleUpdate = Number.parseFloat(input.value)

                if (!isNaN(possibleUpdate)) value = possibleUpdate
                else return

                if (input.type === 'range') {
                    input.parentNode.querySelector('output').innerHTML = input.value
                }
            }
            else value = input.value
            
            if (toParse[key] instanceof Port) toParse[key].set({value, forceUpdate: true}) // port
            else toParse[key].target[key] = value // settings or other objects

            if (!['number','range', 'text', 'color'].includes(input.type) && input.tagName !== 'TEXTAREA') input.blur()
        }
                }
                return {container, input}
            } else return {}
        } else return {}
    }

    async createFile(nodeInfo, name, graph){

        let activeNode = (nodeInfo.class) ? nodeInfo : null
        let cls = (nodeInfo.class) ? nodeInfo.class : nodeInfo

        if (name == null || name === '') name = `${cls.name}`
        let filename = `${name}.js`

        if (this.files[filename] == null){
            this.files[filename] = {}


            if (activeNode == null){
                // this.clickTab(this.files[graph.name].tab)
                let nodeInfo = await graph.addNode({class:cls})
                activeNode = nodeInfo.instance
            } 


            this.files[filename].name = filename
            this.files[filename].type = 'Plugin'
            // this.files[filename].container = activeNode.ui.code
            this.files[filename].elements = {
                code: activeNode.ui.code,
                graph: activeNode.ui.graph
            }

            this.createFileElement(this.files[filename])


            // Add Option to Selector
            this.addNodeOption({id:cls.id, label: cls.name, class:cls})

        } else {
            let files = this.files[filename].files
            let toClick = files.code?.tab ?? files.code?.toggle
            toClick.click()
        }
    }

    createFileElement = (fileDict, initialize={}) => {

        fileDict.files = {}
        for (let type in fileDict.elements){

            if (fileDict.elements[type]){
            fileDict.files[type] = {}

            fileDict.files[type].toggle = document.createElement('div')
            fileDict.files[type].toggle.innerHTML = fileDict.name
                
            fileDict.files[type].toggle.classList.add('brainsatplay-option-node')
            fileDict.files[type].toggle.style.padding = '10px 20px'
            fileDict.files[type].toggle.style.display = 'block'
            fileDict.files[type].container = fileDict.elements[type]

            fileDict.files[type].toggle.onclick = () => {
                if (fileDict.files[type].tab == null){
                    fileDict.files[type].tab = this.addTab(fileDict, type, (el) => {
                        el.style.pointerEvents = 'all'
                        el.style.opacity = '1'
                    }, false)
                }
                fileDict.files[type].tab.click()
            }

            console.log(this.filesidebar[type], type, this.filesidebar)
            this.filesidebar[type].insertAdjacentElement('beforeend', fileDict.files[type].toggle)
            
            if (initialize[type]) fileDict.files[type].toggle.click()
        }
        }
    }
 
    createView(id=String(Math.floor(Math.random()*1000000)), className, content){
        let view = document.createElement('div')
        view.id = id
        view.className = className
        view.innerHTML = content
        this.mainPage.insertAdjacentElement('beforeend',view)
        return view
    }

    createPluginSearch = async (container) => {
        let selector = document.createElement('div')
        selector.id = `${this.props.id}nodeSelector`
        selector.style.opacity = '0'
        selector.style.pointerEvents = 'none'
        selector.classList.add(`brainsatplay-node-selector`)

        this.selectorMenu = document.createElement('div')
        this.selectorMenu.classList.add(`brainsatplay-node-selector-menu`)

        this.selectorToggle = this.container.querySelector(`[id="${this.props.id}add"]`)

        let toggleVisibleSelector = (e) => {
            if(!e.target.closest('.brainsatplay-node-selector-menu') && !e.target.closest(`[id="${this.props.id}add"]`)) this.selectorToggle.click()
        }

        this.selectorToggle.addEventListener('click', () => {
            if (selector.style.opacity == '1'){
                selector.style.opacity='0'
                selector.style.pointerEvents='none'
                this.search.value = ''
                this.matchOptions()
                document.removeEventListener('click', toggleVisibleSelector)
            } else {
                selector.style.opacity='1'
                selector.style.pointerEvents='all'
                document.addEventListener('click', toggleVisibleSelector)
            }
        })
        this.selectorMenu.insertAdjacentHTML('beforeend',`<input type="text" placeholder="Search"></input><div class="node-options"></div>`)
        selector.insertAdjacentElement('beforeend',this.selectorMenu)
        container.insertAdjacentElement('afterbegin',selector)

        // Populate Available Nodes
        let nodeDiv = document.createElement('div')
        this.search = this.selectorMenu.getElementsByTagName(`input`)[0]


        // Allow Search of Plugins
        this.search.oninput = (e) => {
            this.matchOptions()
        }

    //     this.library = await this.app.session.projects.getLibraryVersion(this.app.info?.version)

    //     let usedClasses = []
    //     this.classRegistry = this.app.session.projects.classRegistries[this.app.info?.version]

    //     this.addNodeOption(undefined)


    //     for (let className in this.classRegistry) this.addNodeOption(this.classRegistry[className])

    //     // TODO: Traverse all graphs
    //     // this.graphs.forEach(g => {        
    //     if (this.graph){
    //     this.graph.nodes.forEach(async n => {
    //         if (n.class != null){
    //         let clsInfo = this.classRegistry[n.class.name]

    //         let checkWhere = async (n, info) => {
    //             if (info && n.class === info.class){
    //                 // clsInfo.class = n.class
    //                 let baseClass = this.library.plugins[info.category][clsInfo.name]

    //                 if (info.class != baseClass){
    //                     info.category = null // 'custom'
    //                     this.addNodeOption(clsInfo)
    //                 }
    //             } else {
    //                 if (info != null && info.class == null){
    //                     // let module = await dynamicImport(info.folderUrl)
    //                     // clsInfo.class = module[info.name]
    //                     // await checkWhere(n, info)
    //                     console.log('COMMENTED OUT')
    //                 } else {
    //                     this.addNodeOption({category: null, class: n.class})
    //                 }
    //             }
    //         }

    //         await checkWhere(n, clsInfo)
    //     }
    //     })
    // }
    // })

        this.selectorMenu.insertAdjacentElement('beforeend',nodeDiv)
        this.responsive()
    }

    matchOptions = () => {
        let regex;
        try {
            regex = new RegExp(`^${this.search.value}`, 'i')
        } catch (e) {
            console.error('Invalid search value')
        }

        let matchedHeaderTypes = []

        // Show Matching Headers
        let headers = this.selectorMenu.querySelectorAll('.brainsatplay-option-type')
        for (let header of headers){
            for (let cls of header.classList){
                if (cls.includes('nodetype-')){
                    let type = cls.replace('nodetype-','')
                    let labelMatch = (regex != null) ? regex.test(type) : false
                    if (labelMatch) {
                        matchedHeaderTypes.push(type)
                    }
                }
            }
        }

        this.searchOptions.forEach(o => {

            let change = 0
            let show = false
            let parent = o.element.parentNode
            let nodetype = Array.from(o.element.parentNode.classList).find(cls => cls.includes('nodetype-'))
            nodetype = nodetype.replace('nodetype-','')

            if (this.search.value !== ''){

                if (matchedHeaderTypes.includes(nodetype)) show = true // Show header if matched
                else {
                    // Check Label
                    let labelMatch = (regex != null) ? regex.test(o.name) : false

                    if (labelMatch || o.lock == true) show = true

                    // Check Types
                    o.types.forEach(type => {
                        let typeMatch = (regex != null) ? regex.test(type) : false
                        if (typeMatch) show = true
                    })
                }

                if (show && o.element.style.display === 'none') {
                    o.element.style.display = ''
                    change = 1
                } else if (!show && o.element.style.display !== 'none') {
                    o.element.style.display = 'none'
                    change = -1
                }
            } else if (o.element.style.display === 'none'){
                o.element.style.display = ''
                change = 1
            }

            let count = this.container.querySelector(`.${o.category}-count`)
            if (count) {
                let numMatching = Number.parseFloat(count.innerHTML) + change
                count.innerHTML = numMatching

                // Open/Close Dropdown
                if (parent.previousElementSibling){
                    if (show) {
                        parent.previousElementSibling.classList.add("active");
                        parent.style.maxHeight = parent.scrollHeight + "px";
                    } else if (numMatching === 0 || this.search.value === '') {
                        parent.previousElementSibling.classList.remove('active') // Close dropdown
                        parent.style.maxHeight = null
                    }

                    // Also Show/Hide Toggle
                    if (!show && numMatching === 0) parent.previousElementSibling.style.display = 'none'
                    else parent.previousElementSibling.style.display = ''
                }
            }
        })
    }

    addNodeOption(classInfo={name:'newplugin', label: 'Add New Plugin', class: this.library.plugins.Blank, category: null, types: []}){
        
        if (!('types' in classInfo)) classInfo.types = []


        let type = classInfo.category
        let id = classInfo.id // TODO Fix this
        let name = classInfo?.class?.name ?? classInfo.name
        let label = classInfo.label

        
        let options = this.selectorMenu.querySelector(`.node-options`)
        let contentOfType = options.querySelector(`.option-type-content.nodetype-${type}`)
        if (contentOfType == null) {

            contentOfType = document.createElement('div')
            contentOfType.classList.add('option-type-content')
            contentOfType.classList.add(`nodetype-${type}`)

            if (type != null){
                let selectedType = document.createElement('div')
                selectedType.innerHTML = type[0].toUpperCase() + type.slice(1)
                selectedType.classList.add(`brainsatplay-option-type`)
                selectedType.classList.add(`option-type-collapsible`)
                selectedType.classList.add(`nodetype-${type}`)

                let count = document.createElement('div')
                count.classList.add('count')
                count.classList.add(`${type}-count`)
                count.innerHTML = 0
                selectedType.style.display = 'none' // Initialily hide the header

                selectedType.insertAdjacentElement('beforeend',count)
                options.insertAdjacentElement('beforeend',selectedType)
                this.addDropdownFunctionality(selectedType)
            }

            options.insertAdjacentElement('beforeend',contentOfType)
        }

        let element = contentOfType.querySelector(`.${name}`)
        if (element == null){
            element = document.createElement('div')
            element.classList.add("brainsatplay-option-node")
            element.classList.add(`${id}`)
            element.innerHTML = `<p>${label ?? name}</p>`
            

            if (classInfo.label === 'Add New Plugin') classInfo.lock = true
            element.onclick = async () => {

                if (classInfo.label === 'Add New Plugin') {
                    Object.assign(classInfo, {
                        class:this.library.plugins.Blank,
                        name: this.search.value,
                    })
                }


                if (!('class' in classInfo)) {
                    console.log('COMMENTED OUT')
                    // let module = await dynamicImport(classInfo.folderUrl)
                    // classInfo.class = module[classInfo.name]
                }
    
                await this.graph.addNode(classInfo)
                this.responsive()
                // onClick()
                this.container.querySelector(`[id="${this.props.id}add"]`).click() // Close menu
            }

            // element.insertAdjacentElement('beforeend',labelDiv)
            contentOfType.insertAdjacentElement('beforeend',element)

            if (classInfo == null){}
            else if (classInfo.hidden && !this.local) element.remove()
            else {
                if (classInfo.hidden) element.classList.add("experimental")

                // Add Instance Details to Plugin Registry

                let types = classInfo.types.map(t => {
                    if (typeof t === 'string' && t.includes('Element')) return eval(t)
                    else return t
                    // if (type instanceof Object) types.add(type.name)
                })

                this.searchOptions.push({name, element, types, category: type, lock: classInfo.lock})
                if (type == null) contentOfType.style.maxHeight = 'none'; // Resize options without a type (i.e. not hidden)

                let count = options.querySelector(`.${type}-count`)
                let header = options.querySelector(`.nodetype-${type}`)
                if (count) {
                    count.innerHTML = Number.parseFloat(count.innerHTML) + 1
                    if (Number.parseFloat(count.innerHTML) === 0) header.style.display = 'none'
                    else header.style.display = ''
                }
            } 
        }
    }

    addDropdownFunctionality = (node) => {
        node.onclick = () => {
            node.classList.toggle("active");
            var content = node.nextElementSibling;
            if (content.style.maxHeight) content.style.maxHeight = null; 
            else content.style.maxHeight = content.scrollHeight + "px";
        }
    }



    responsive = () => {
        let tabContainer = this.container.querySelector(`[id="${this.props.id}ViewTabs"]`)
        if (tabContainer){
            let mainWidth =  this.container.offsetWidth - this.sidebar.offsetWidth - this.filesidebar.container.offsetWidth
            this.mainPage.style.width = `${mainWidth}px`
            if (this.preview.innerHTML != '') {
                this.preview.style.height = `${window.innerHeight * this.mainPage.style.width/window.innerWidth}px`
                this.preview.parentNode.style.height = '100%'
            }
            else this.preview.parentNode.style.height = 'auto'
        }

        let selector = this.container.querySelector(`[id="${this.props.id}nodeSelector"]`)

        if (selector){
            selector.style.height = `${selector.parentNode.offsetHeight}px`
            selector.style.width = `${selector.parentNode.offsetWidth}px`
        }


        if(this.currentFile){

            let currentEditor = this.currentFile.container

            if (currentEditor.parentNode){
                // Set Grid Width and Height (only get bigger...)
                let newWidth = this.editor.clientWidth
                let oldWidth = Number.parseFloat(currentEditor.style.width.replace('px',''))
                if (oldWidth < newWidth || isNaN(oldWidth)) currentEditor.style.width = `${newWidth}px`
                let newHeight = currentEditor.parentNode.clientHeight
                let oldHeight = Number.parseFloat(currentEditor.style.height.replace('px',''))
                if (oldHeight < newHeight || isNaN(oldHeight)) currentEditor.style.height = `${newHeight}px`
                
                if (this.graph){

                    this.graph.nodes.forEach(n => {
                        n.resizeElement()
                        n.resizeAllEdges()
                    })
                }
            }
        }
    }

    deinit(){
        if (this.container){
            this.container.style.opacity = '0'
            // console.log(this.container)
            setTimeout(() => {this.container.remove()}, 500)
        }
        window.removeEventListener('resize', this.responsive)
    }
}