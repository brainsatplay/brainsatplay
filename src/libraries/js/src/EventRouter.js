
import { StateManager } from './ui/StateManager'
import { DOMFragment } from './ui/DOMFragment';

export class EventRouter{
    constructor(){
        this.device = null
        this.state = new StateManager()
        this.routes = {}

        this.id = String(Math.floor(Math.random()*1000000))
        this.atlasEvents = []
    }

    init(device){
        this.device = device
        this.atlasEvents = Object.keys(this.device.atlas.data.states).filter(k => k != 'generic')
        if (this.device.states){
        Object.keys(this.device.states).forEach(key => {
                let states = this.device.states[key]
                if (states != null){
                    if (!Array.isArray(states)) states = [states]
                    states.forEach((state,i) => {

                        // Add to Event State
                        let splitId = state.meta.id.split('_')

                        // Create display label
                        let labelArr = splitId.map(str => str[0].toUpperCase + str.slice(1))
                        state.meta.label = labelArr.join(' ')
                        
                        this.state.addToState(state.meta.id, state)
                        this.routes[state.meta.id] = [state]

                        // Route Switches in Atlas by Default
                        if (this.atlasEvents.includes(splitId[0])){ // Check base route
                            if (splitId.length > 1) { // Assign to group (if required)
                                let idx = this.device.atlas.data.states[splitId[0]].findIndex(a => a[0].meta.id.split('_')[1] === splitId[1])
                                if (idx > -1) this.device.atlas.data.states[splitId[0]][idx].push(state) // Add to group
                                else this.device.atlas.data.states[splitId[0]].push([state]) // Create array for group
                            } else {
                                this.device.atlas.data.states[splitId[0]].push([state]) // Switches with no group specified are their own group
                            }                       
                        } else {
                            this.device.atlas.data.states['generic'].push(state) // No groups for generic switches (even with same IDs)
                        }

                        // Declare Callback and Subscribe
                        let deviceCallback = (o) => {
                            this.update(o, this.routes[state.meta.id])
                        }

                        this.state.subscribe(state.meta.id, deviceCallback)
                    })
                }
        })
    }
    }

    deinit = () => {
        this.ui.deleteNode()
    }

    // Route Events to Atlas
    update(o,targets=[]) {
        let newState = o.data

        targets.forEach(t => {
            if ('data' in t) {
                t.data = newState
            }
            else if ('data' in t[0]){
                t[0].data = newState
            }
            else if ('data' in t[0].data[0]) {
                t[0].data[0] = newState
            }
        })
    }

    // assign(state,){

    // }


    autoRoute = (stateManagerArray) => {
        let validRoutes = this.getValidRoutes(stateManagerArray)
        for (let id in this.routes){

            // Skip If Not Binary & Group is Zero (i.e. default state)
            if (id.split('_')[1] == 0 && Object.keys(this.routes).find(str => str.split('_')[0] === id.split('_')[0]) != null) continue

            let routes = this.routes[id]
            
            // If No Additional Route is Specified, Add One (for now, limit only one route besides the atlas)
            if (routes.length < 2 && validRoutes.length > 0){
                let newRoute = validRoutes.shift()

                let target = newRoute.manager.data[newRoute.key]
                routes.push(target)

                let routeSelector = document.getElementById(`${this.id}brainsatplay-router-selector-${id}`)
                if (routeSelector != null) {
                    var opts = routeSelector.options;
                    for (var opt, j = 0; opt = opts[j]; j++) {
                        if (opt.value == newRoute.key) {
                            routeSelector.selectedIndex = j;
                        break;
                        }
                    }
                }
            }
        }
    }

    getValidRoutes = (stateManagerArray) => {
        let validRoutes = []

        stateManagerArray.forEach(manager => {
            let keys = Object.keys(manager.data)

            let notArrayOrObject = (input) => {
                try{
                    return (input.constructor != Object && !Array.isArray(input))
                } catch{return false}
            }
            keys = keys.filter(k => {
                let state = manager.data[k]
                // Guess if State is Binary or Continuous
                if (notArrayOrObject(state?.data) || (Array.isArray(state) && notArrayOrObject(state[0]?.data)) || (Array.isArray(state[0]?.data) && notArrayOrObject(state[0]?.data[0]))){
                    return k
                }
            })
            keys.forEach((key) => {
                validRoutes.push({key,manager})
            })
        })
        return validRoutes
    }

    addControls = (stateManagerArray, parentNode=document.body) => {
        let template = () => {
            return `
            <br>
            <div id='${this.id}routerControls' style="padding: 10px;">
                <div style="display: grid; grid-template-columns: repeat(2,1fr); align-items: center;">
                    <h4>Control Panel</h4>
                    <button class="brainsatplay-default-button" style="flex-wrap: wrap;">
                    <p style="margin-bottom: 0;">Update Available Events<p>
                    <p style="font-size: 70%; margin-top: 0;">(e.g. when you switch games)</p>
                    </button>
                </div>
                <hr>
                <div class='brainsatplay-router-options' style="display: flex; flex-wrap: wrap;">
                </div>
            </div>
            `;
        }

        let update = () => {
            let routerOptions = document.getElementById(`${this.id}routerControls`).querySelector('.brainsatplay-router-options')
            routerOptions.innerHTML = ''
            
            let validRoutes = this.getValidRoutes(stateManagerArray)

            let managerMap = {}
            let selector = document.createElement('select')
            selector.insertAdjacentHTML('beforeend',`
            <option value="" disabled selected>Choose an event</option>
            <option value="none">None</option>
            `)
            validRoutes.forEach(dict => {
                managerMap[dict.key] = dict.manager
                let upper = dict.key[0].toUpperCase() + dict.key.slice(1)
                selector.insertAdjacentHTML('beforeend',`<option value="${dict.key}">${upper}</option>`)           
            })

            Object.keys(this.state.data).forEach(id => {
                let thisSelector = selector.cloneNode(true)

                thisSelector.id = `${this.id}brainsatplay-router-selector-${id}`

                thisSelector.onchange = (e) => {
                    try {
                        let target = managerMap[thisSelector.value].data[thisSelector.value]

                        // Switch Route Target
                        if (this.routes[id].length < 2) this.routes[id].push(target)
                        else this.routes[id][1] = target

                    } catch (e) {}
                }

                let div = document.createElement('div')
                div.style.padding = '10px'
                div.insertAdjacentHTML('beforeend', `<p style="font-size: 80%;">${id.replace('_', ' ')}</p>`)
                div.insertAdjacentElement('beforeend', thisSelector)
                routerOptions.insertAdjacentElement('beforeend',div)
            })
            
            this.autoRoute(stateManagerArray)
        }

        let setup = () => {
            let updateButton = document.getElementById(`${this.id}routerControls`).querySelector('button')
            updateButton.style.display = 'none'
           updateButton.onclick = () => {
            update()
           }
            update()
        }

        this.ui = new DOMFragment(
            template,
            parentNode,
            undefined,
            setup
        )
    }
}