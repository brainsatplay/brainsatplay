
/*
//Example:
let events = new ObjectListener();
let x = { y: 1, z: { w: 2 }}


events.addListener("y",x,"y");
events.addListener("z",x,"z");

x.z.w = 3;
x.y = 2;
//See console

*/


//Create instance and then call instance.addListener(listenerName,objectToListenTo,propToListenTo,onchange,interval).
//name, propToListenTo, onchange, and interval are optional (leave or set as undefined). Onchange is a custom callback just like for other event listeners. Set a name to make it easier to start and stop or edit each listener.
export class ObjectListener {
    constructor(debug=false) {
        this.debug = debug;
        this.listeners = [];
    }

    //add a new object listener with specified props (or none to watch the whole object), and onchange functions, with optional interval
    addListener(listenerKey=null,objectToListenTo,propToListenTo=undefined,onchange=undefined,interval=undefined,debug=this.debug) {
        if(objectToListenTo === undefined) {
            console.error("You must assign an object");
            return;
        }

        var key = listenerKey;
        if(key === null) {
            key = Math.floor(Math.random()*100000);
        }
        var listener = {key:key, listener: new ObjectListenerInstance(objectToListenTo,propToListenTo,onchange,interval,debug)};
        this.listeners.push(listener);
    }

    hasKey(key) {
        var found = false;
        this.listeners.forEach((item,i) =>{
            if(item.key === key) {found = true;}
        });
        return found;
    }

    getKeyIndices(key) {
        var indices = [];
        this.listeners.find((o,i) => {
            if(o.key === key) {
                indices.push(i);
            }
        });
        return indices;
    }

    onchange(key=null,newCallback=null){
        if(key === null) {
            this.listeners.forEach((obj,i) => {
                obj.listener.onchange = newCallback;
            });
        }
        else {
            var found = this.listeners.find((o,i) => {
                if(o.name === key) {
                    o.listener.onchange = newCallback;
                }
            });
        }
    }

    //Add extra onchange functions
    addFunc = (key=null,newCallback=null) => {
        var callbackIdx = null;
        if(newCallback !== null){
            if(key === null) {
                this.listeners.forEach((obj,i) => {
                    callbackIdx = obj.listener.addFunc(newCallback);
                });
            }
            else {
                var found = this.listeners.find((o,i) => {
                    if(o.key === key) {
                        callbackIdx = o.listener.addFunc(newCallback);
                    }
                });
            }
        }
        return callbackIdx;
    }

    //Remove extra onchange functions
    removeFuncs = (key = null, idx = null) => {
        if(key === null) {
            this.listeners.forEach((obj,i) => {
                obj.listener.removeFuncs(idx);
            });
        }
        else {
            var found = this.listeners.find((o,i) => {
                if(o.name === key) {
                    o.listener.removeFuncs(idx);
                }
            });
        }
    }

    //Stop all or named listeners
    stop(key=null) {
        if(key === null) {
            this.listeners.forEach((obj,i) => {
                obj.listener.stop();
            });
        }
        else {
            var found = this.listeners.find((o,i) => {
                if(o.name === key) {
                    o.listener.stop();
                }
            });
        }
    }

    //Restart all or named listeners
    start(key=null) {
        if(key === null) {
            this.listeners.forEach((obj,i) => {
                obj.listener.start();
            });
        }
        else {
            var found = this.listeners.find((o,i) => {
                if(o.name === key) {
                    o.listener.start();
                }
            });
        }
    }

    remove(key=null){
        if(key === null) {
            this.listeners.splice(0,this.listeners.length);
        }
        else {
            var indices = [];
            var found = this.listeners.find((o,i) => {
                if(o.name === key) {
                    indices.push(i);
                }
            });
            indices.reverse().forEach((idx) => {
                this.listeners.splice(idx,1);
            });
        }
    }
}

//Instance of an object listener. This will subscribe to object properties (or whole objects) and run attached functions when a change is detected.
export class ObjectListenerInstance {
    constructor(object,propName="__ANY__",onchange=this.onchange,interval="FRAMERATE",debug="false") {
        this.debug=debug;

        this.onchange = onchange; //Main onchange function
        this.onchangeFuncs = []; //Execute extra functions pushed to this array

        this.object = object; //Objects are always passed by reference
        this.propName = propName;
        this.propOld = undefined;
        this.setListenerRef(propName);

        this.running = true;


        this.interval;
        if(interval <= 0) {
            this.interval = 10; console.log("Min recommended interval set: 10ms");}
        else {
            this.interval = interval;
        }
        this.checker = requestAnimationFrame(this.check);

    }

    //Main onchange execution
    onchange = () => {
        console.log(this.propName," changed from: ", this.propOld," to: ", this.object[this.propName]);
    }

    //Add extra onchange functions for execution
    addFunc = (onchange=null) => {
        if(onchange !== null){
            this.onchangeFuncs.push(onchange);
        }
        return this.onchangeFuncs.length-1;
    }

    //Remove extra onchange functions
    removeFuncs(idx = null) {
        if(idx === null) {
            this.onchangeFuncs = [];
        }
        else if(this.onchangeFuncs[idx] !== undefined) {
            this.onchangeFuncs.splice(idx,1);
        }
    }

    //Execute extra onchange functions
    onchangeMulti = () => {
        this.onchangeFuncs.forEach((func,i) => {
            if(this.debug === true) { console.log(func); }
            func();
        });
    }

    //Update listener reference copy.
    setListenerRef = (propName) => {
        if(propName === "__ANY__" || propName === null || propName === undefined) {
            this.propOld = JSON.stringifyWithCircularRefs(this.object);
        }
        else if(typeof this.object[propName] === "object"){
            this.propOld = JSON.stringifyWithCircularRefs(this.object[propName]);
        }
        else if(typeof this.object[propName] === "function"){
            this.propOld = this.object[propName].toString();
        }
        else{
            this.propOld = this.object[propName] //usually a number;
        }
        if(this.debug === true) { console.log("propname", propName, ", new assignment: ", this.propOld); }
    }

    check = () => {
        if(this.propName === "__ANY__" || this.propName === null || this.propName === undefined){
            if(this.propOld !== JSON.stringifyWithCircularRefs(this.object)){
                if(this.debug === true) { console.log("onchange: ", this.onchange); }
                this.onchange();
                if(this.onchangeFuncs.length > 0) { this.onchangeMulti(); }
                this.setListenerRef(this.propName);
            }
        }
        else if(typeof this.object[this.propName] === "object") {
            if(this.propOld !== JSON.stringifyWithCircularRefs(this.object[this.propName])){
                if(this.debug === true) { console.log("onchange: ", this.onchange); }
                this.onchange();
                if(this.onchangeFuncs.length > 0) { this.onchangeMulti(); }
                this.setListenerRef(this.propName);
            }
        }
        else if(typeof this.object[this.propName] === "function") {
            if(this.propOld !== this.object[this.propName].toString()){
                if(this.debug === true) { console.log("onchange: ", this.onchange); }
                this.onchange()
                if(this.onchangeFuncs.length > 0) { this.onchangeMulti(); }
                this.setListenerRef(this.propName);
            }
        }
        else if(this.object[this.propName] !== this.propOld) {
            if(this.debug === true) { console.log("onchange: ", this.onchange); }
            this.onchange();
            if(this.onchangeFuncs.length > 0) { this.onchangeMulti(); }
            this.setListenerRef(this.propName);
        }
        
        if(this.running === true) {
            if(this.debug === true) {console.log("checking", this.object, this.propName);}
            if(this.interval === "FRAMERATE"){
                this.checker = requestAnimationFrame(this.check);
            }
            else {
                setTimeout(()=>{this.check},this.interval);
            }
        };
    }

    start() {
        this.running = true;
        this.checker = requestAnimationFrame(this.check);
    }

    stop() {
        this.running = false;
        cancelAnimationFrame(this.checker);
    }

}


//This only really matters in Chrome and one other browser
export function sortObjectByValue(object) { //Sorts number and string objects by numeric value. Strings have charcodes summed for comparison. Objects and functions are stringified.
    var sortable = [];
    for(var prop in object) {
        sortable.push([prop, object[prop]]);
    }

    sortable.sort(function(a,b) {
        var prop1 = a;
        var prop2 = b;
        if(typeof prop1[1] === "function"){
            prop1[1] = prop1[1].toString();
        }
        else if(typeof prop1[1] === "object"){
            prop1[1] = JSON.stringifyWithCircularRefs(prop1[1]);
        }
        if(typeof prop2[1] === "function"){
            prop2[1] = prop2[1].toString();
        }
        else if(typeof prop2[1] === "object"){
            prop2[1] = JSON.stringifyWithCircularRefs(prop2[1]);
        }
        
        if(typeof prop1[1] === "string") {
            var temp = 0;
            prop1.forEach((char,i) => {
                temp += prop1.charCodeAt(i);
            });
            prop1 = temp;
        }
        if(typeof prop2[1] === "string") {
            var temp = 0;
            prop2.forEach((char,i) => {
                temp += prop2.charCodeAt(i);
            });
            prop2 = temp;
        }
        return prop1[1]-prop2[1];
    });

    var sorted = {};

    sortable.forEach((item) => {
       sorted[item[0]]=item[1];
    });

    return sorted;

}

export function sortObjectByPropName(object) {

    var sortable = [];

    for(var prop in object) {
        sortable.push([prop, object[prop]]);
    }

    sortable.sort(function(a,b) {
        return a[0] > b[0];
    });

    var sorted = {};

    sortable.forEach((item) => {
        sorted[item[0]]=item[1];
    });

    return sorted;

}


if(JSON.stringifyWithCircularRefs === undefined) {
    //Workaround for objects containing DOM nodes, which can't be stringified with JSON. From: https://stackoverflow.com/questions/4816099/chrome-sendrequest-error-typeerror-converting-circular-structure-to-json
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
