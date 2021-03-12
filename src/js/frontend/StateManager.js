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
            this.prev = Object.assign(this.prev,this.data);;
            //this.prev=JSON.parse(JSON.stringifyWithCircularRefs(this.data)); //Not sure why this is problematic
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
    addToState(key, value, setPrimaryKeyResponse=null, debug=false) {
        this.data[key] = value;
        if(setPrimaryKeyResponse !== null){
            this.setPrimaryKeyResponse(key,setPrimaryKeyResponse,debug);
        }
    }

    getState() { //Return a copy of the latest state
        return JSON.parse(JSON.stringifyWithCircularRefs(this.data));
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
        this.listener.remove(key);
    }

    //Save the return value to provide as the responseIdx in unsubscribe
    subscribe(key, onchange) {
        return this.addSecondaryKeyResponse(key,onchange);
    }

    //Unsubscribe from the given key using the index of the response saved from the subscribe() function
    unsubscribe(key, responseIdx=null) {
        this.removeSecondaryKeyResponse(key, responseIdx);
    }

    unsubscribeAll(key) {
        this.clearAllKeyResponses(key);
    }

}



if(JSON.stringifyWithCircularRefs === undefined) {
    JSON.stringifyWithCircularRefs = (function() {
        const refs = new Map();
        const parents = [];
        const path = ["this"];

        function clear() {
        refs.clear();
        parents.length = 0;
        path.length = 1;
        }

        function updateParents(key, value) {
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

        function checkCircular(key, value) {
        if (value != null) {
            if (typeof value === "object") {
            if (key) { updateParents(key, value); }

            let other = refs.get(value);
            if (other) {
                return '[Circular Reference]' + other;
            } else {
                refs.set(value, path.join('.'));
            }
            }
        }
        return value;
        }

        return function stringifyWithCircularRefs(obj, space) {
        try {
            parents.push(obj);
            return JSON.stringify(obj, checkCircular, space);
        } finally {
            clear();
        }
        }
    })();
}