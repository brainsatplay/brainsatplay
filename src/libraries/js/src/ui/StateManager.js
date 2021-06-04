import {ObjectListener} from './ObjectListener'

//By Joshua Brewster (MIT)
//Simple state manager.
//Set key responses to have functions fire when keyed values change
//add variables to state with addToState(key, value, keyonchange (optional))
export class StateManager {
    constructor(init = {}, interval="FRAMERATE") { //Default interval is at the browser framerate
        this.data = init;
        this.interval = interval;
        this.pushToState={};
       
        // Allow Updates to State to Be Subscribed To
        this.update = {added:'', removed: '', buffer: new Set()}
        this.updateCallbacks = {
                added: [],
                removed: []
        }


        this.listener = new ObjectListener();

        /*
        this.prev = Object.assign({},this.data);
         
        const onStateChanged = () => {
            this.prev = Object.assign({},this.data);
            //this.prev=JSON.parse(JSON.stringifyFast(this.data));
        }

        //Causes app to be stuck on startup
        this.listener.addListener(
            "state",
            this.data,
            "__ANY__",
            onStateChanged,
            interval,
        );
        */



    }

    setInterval(interval="FRAMERATE") {
        this.interval = interval;
        this.listener.listeners.forEach((obj,i) => {
            obj.interval = this.interval;
        });
    }


    // Managed State Updates. Must Still Clean Event Listeners
    updateState(key, value){
        if (this.data[key] == null){
            this.addToState(key,value)
        } else {
            this.data[key] = value
        }    
    }

    removeState(key){
            this.unsubscribeAll(key);
            delete this.data[key]

            // Log Update
            this.update.removed = key
            this.update.buffer.add( key )
    }

    setupSynchronousUpdates() {
        if(!this.listener.hasKey('pushToState')) {


            //we won't add this listener unless we use this function
            const pushToStateResponse = () => {
                if(Object.keys(this.pushToState).length > 0) {
                    //Object.assign(this.prev,this.data);//Temp fix until the global state listener function works as expected
                    Object.assign(this.data,this.pushToState);

                    //console.log("new state: ", this.data); console.log("props set: ", this.pushToState);
                    for (const prop of Object.getOwnPropertyNames(this.pushToState)) {
                        delete this.pushToState[prop];
                    }
                }
            }
    
            this.listener.addListener(
                "pushToState",
                this.pushToState,
                "__ANY__",
                pushToStateResponse,
                this.interval
            );

            this.addToState('update',this.update, this.onUpdate);

        }
    }

    //Alternatively just add to the state by doing this.state[key] = value with the state manager instance
    addToState(key, value, onchange=null, debug=false) {
        if(!this.listener.hasKey('pushToState')) {
            this.setupSynchronousUpdates();
        }

        this.data[key] = value;

        // Log Update
        this.update.added = key
        this.update.buffer.add( key )

        if(onchange !== null){
            return this.addSecondaryKeyResponse(key,onchange,debug);
        }
    }

    getState() { //Return a hard copy of the latest state with reduced values
        return JSON.parse(JSON.stringifyFast(this.data));
    }

    //Synchronous set-state, only updates main state on interval.
    setState(updateObj={},appendArrs=true){ //Pass object with keys in. Undefined keys in state will be added automatically. State only notifies of change based on update interval
        //console.log("setting state");
        if(!this.listener.hasKey('pushToState')) {
            this.setupSynchronousUpdates();
        }
        
        if(appendArrs) {
            for(const prop in updateObj) { //3 object-deep array checks to buffer values instead of overwriting
                if(this.pushToState[prop]) {
                    if(Array.isArray(this.pushToState[prop]) && Array.isArray(updateObj[prop])) {
                        updateObj[prop] = this.pushToState[prop].push(...updateObj[prop]);
                    } else if (typeof this.pushToState[prop] === 'object' && typeof updateObj[prop] === 'object') {
                        for(const p in updateObj[prop]) {
                            if(this.pushToState[prop][p]) {
                                if(Array.isArray(this.pushToState[prop][p]) && Array.isArray(updateObj[prop][p])) {
                                    updateObj[prop][p] = this.pushToState[prop][p].push(...updateObj[prop][p]);
                                }
                                else if (typeof this.pushToState[prop][p] === 'object' && typeof updateObj[prop][p] === 'object') {
                                    for(const p2 in updateObj[prop][p]) {
                                        if(this.pushToState[prop][p][p2]) {
                                            if(Array.isArray(this.pushToState[prop][p][p2]) && Array.isArray(updateObj[prop][p][p2])) {
                                                updateObj[prop][p][p2] = this.pushToState[prop][p][p2].push(...updateObj[prop][p][p2]);
                                            }
                                        }
                                        else if (typeof this.pushToState[prop][p][p2] === 'object' && typeof updateObj[prop][p][p2] === 'object') {
                                            for(const p3 in updateObj[prop][p][p2]) {
                                                if(this.pushToState[prop][p][p2][p3]) {
                                                    if(Array.isArray(this.pushToState[prop][p][p2][p3]) && Array.isArray(updateObj[prop][p][p2][p3])) {
                                                        updateObj[prop][p][p2][p3] = this.pushToState[prop][p][p2][p3].push(...updateObj[prop][p][p2][p3]);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        Object.assign(this.pushToState,updateObj);
        return this.pushToState;
    }

    //Set main onchange response for the property-specific object listener. Don't touch the state
    setPrimaryKeyResponse(key=null, onchange=null, debug=false) {
        if(onchange !== null){
            if(this.listener.hasKey(key)){
                this.listener.onchange(key, onchange);
            }
            else if(key !== null){
                this.listener.addListener(key,this.data,key,onchange,this.data["stateUpdateInterval"],debug);
            }
        }
    }

    //Add extra onchange responses to the object listener for a set property. Use state key for state-wide change responses
    addSecondaryKeyResponse(key=null, onchange=null, debug=false) {
        if(onchange !== null){
            if(this.listener.hasKey(key)){
                return this.listener.addFunc(key, onchange);
            }
            else if(key !== null){
                this.listener.addListener(key,this.data,key,()=>{},this.data["stateUpdateInterval"],debug);
                return this.listener.addFunc(key, onchange);
            }
            else { return this.listener.addFunc("state", onchange);}
        }
    }

    //removes all secondary responses if idx left null. use "state" key for state-wide change responses
    removeSecondaryKeyResponse(key=null,responseIdx=null) {
        if(key !== null) {
            if(this.listener.hasKey(key)){
                this.listener.removeFuncs(key, responseIdx);
            } else {
                console.error("key does not exist")
            }
        }
        else{console.error("provide key")}
    }

    //Remove any extra object listeners for a key. Entering "state" will break the state manager's primary response
    clearAllKeyResponses(key=null) {
        if(this.listener.hasKey(key)) this.listener.remove(key);
    }

    //Save the return value to provide as the responseIdx in unsubscribe
    subscribe(key, onchange) {
        if(this.data[key] === undefined) {this.addToState(key,null,onchange);}
        else {return this.addSecondaryKeyResponse(key,onchange);}
    }

    //Unsubscribe from the given key using the index of the response saved from the subscribe() function
    unsubscribe(key, responseIdx=null) {
        if(responseIdx !== null) this.removeSecondaryKeyResponse(key, responseIdx);
        else console.error("Specify a subcription function index");
    }

    unsubscribeAll(key) { // Removes the listener for the key (including the animation loop)
        this.clearAllKeyResponses(key);
    }

    addUpdateFunction = (added,removed) => {
        if (added) this.updateCallbacks.added.push(added)
        if (removed) this.updateCallbacks.removed.push(removed)
    }

    onUpdate = (update) => {

        update.buffer.delete('update')

        if (update.added){
            this.updateCallbacks.added.forEach(f => {
                if (f instanceof Function) f(update.buffer)
            })
        }

        if (update.removed){
            this.updateCallbacks.removed.forEach(f => {
                if (f instanceof Function) f(update.buffer)
            })
        }

        update.added = ''
        update.removed = ''
        update.buffer.clear()
    }

}


//modified to also cut down the size arrays for faster looping
if(JSON.stringifyFast === undefined) {
    //Workaround for objects containing DOM nodes, which can't be stringified with JSON. From: https://stackoverflow.com/questions/4816099/chrome-sendrequest-error-typeerror-converting-circular-structure-to-json
    JSON.stringifyFast = (function() {
        const refs = new Map();
        const parents = [];
        const path = ["this"];

        function clear() {
            refs.clear();
            parents.length = 0;
            path.length = 1;
        }

        function updateParents(key, value) { //for json.parse
            var idx = parents.length - 1;
            var prev = parents[idx];
            if (prev[key] === value || idx === 0) {
                path.push(key);
                parents.push(value);
            } else {
                while (idx-- >= 0) {
                    prev = parents[idx];
                    if (prev[key] === value) {
                        idx += 2;
                        parents.length = idx;
                        path.length = idx;
                        --idx;
                        parents[idx] = value;
                        path[idx] = key;
                        break;
                    }
                }
            }
        }

        function checkValues(key, value) {
            let val = value;
            if (val !== null) {
                if (typeof value === "object") {
                    //if (key) { updateParents(key, value); }
                    let other = refs.get(val);
                    let c = value.constructor.name;
                    if (other) {
                        return '[Circular Reference]' + other;
                    } else if(c === "Array" && value.length > 20) { //Cut arrays down to 100 samples for referencing
                        val = value.slice(value.length-20);
                        refs.set(val, path.join('.'));
                    } else if (c !== "Object" && c !== "Number" && c !== "String" && c !== "Boolean") { //simplify classes, objects, and functions, point to nested objects for the state manager to monitor those properly
                        val = "instanceof_"+c;
                        refs.set(val, path.join('.'));
                    } else if (typeof val === 'object') {
                        let obj = {};
                        for(const prop in val) {
                            if(Array.isArray(val[prop])) { obj[prop] = val[prop].slice(val[prop].length-20); } //deal with arrays in nested objects (e.g. means, slices)
                            else if (typeof val[prop] === 'object') { //additional layer of recursion for 3 object-deep array checks
                                obj[prop] = {};
                                for(const p in val[prop]) {
                                    if(Array.isArray(val[prop][p])) { obj[prop][p] = val[prop][p].slice(val[prop][p].length-20); }
                                    else { obj[prop][p] = val[prop][p]; }
                                }
                            }
                            else { obj[prop] = val[prop]; }
                        }
                    }
                    else {
                        refs.set(val, path.join('.'));
                    }
                }
            }
            return val;
        }

        return function stringifyFast(obj, space) {
            try {
                parents.push(obj);
                return JSON.stringify(obj, checkValues, space);
            } finally {
                clear();
            }
        }
    })();
}