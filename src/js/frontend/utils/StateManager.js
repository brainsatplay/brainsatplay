import {ObjectListener} from './ObjectListener'

//Simple state manager.
//Set key responses to have functions fire when keyed values change
//add variables to state with addToState(key, value, keyonchange (optional))
export class StateManager {
    constructor(init = {},interval="FRAMERATE") { //Default interval is at the browser framerate
        this.data = init;
        this.data["stateUpdateInterval"] = interval;
        this.pushToState={};
        this.prev = Object.assign({},this.data);;
                
        this.listener = new ObjectListener();

        /*
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
        
        const stateUpdateResponse = () => {
            this.listener.listeners.forEach((obj,i) => {
                obj.interval = this.data["stateUpdateInterval"];
            });
        }

        this.listener.addListener(
            "interval",
            this.data,
            "stateUpdateInterval",
            stateUpdateResponse,
            interval
        );

        const pushToStateResponse = () => {
            if(Object.keys(this.pushToState).length > 0) {
                Object.assign(this.prev,this.data);//Temp fix until the global state listener function works as expected
                Object.assign(this.data,this.pushToState);
                //console.log("new state: ", this.data); console.log("props set: ", this.pushToState);
                for (const prop of Object.getOwnPropertyNames(this.pushToState)) {
                    delete this.pushToState[prop];
                }
            }
        }

        this.listener.addListener(
            "push",
            this.pushToState,
            "__ANY__",
            pushToStateResponse,
            interval
        );

    }

    //Alternatively just add to the state by doing this.state[key] = value with the state manager instance
    addToState(key, value, onchange=null, debug=false) {
        this.data[key] = value;
        if(onchange !== null){
            return this.addSecondaryKeyResponse(key,onchange,debug);
        }
    }

    getState() { //Return a hard copy of the latest state with reduced values
        return JSON.parse(JSON.stringifyFast(this.data));
    }

    setState(updateObj={}){ //Pass object with keys in. Undefined keys in state will be added automatically. State only notifies of change based on update interval
        //console.log("setting state");
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
            }
        }
        else{console.error("provide key")}
    }

    //Remove any extra object listeners for a key. Entering "state" will break the state manager's primary response
    clearAllKeyResponses(key=null) {
        if(this.listener.hasKey(key))
            this.listener.remove(key);
    }

    //Save the return value to provide as the responseIdx in unsubscribe
    subscribe(key, onchange) {
        if(this.data[key] === undefined) {this.addToState(k,null,onchange);}
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
                    } else if(c === "Array" && value.length > 100) { //Cut arrays down to 100 samples for referencing
                        val = value.slice(value.length-100);
                        refs.set(val, path.join('.'));
                    } else if (c !== "Number" && c !== "String" && c !== "Boolean") { //simplify classes, objects, and functions, point to nested objects for the state manager to monitor those properly
                        val = "instanceof_"+c;
                        refs.set(val, path.join('.'));
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