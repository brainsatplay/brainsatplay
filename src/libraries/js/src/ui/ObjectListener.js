
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

//By Joshua Brewster (MIT)

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

    getListener(key) {
        let found = this.listeners.find((item,i) =>{
            if(item.key === key) return true;
        });
        return found;
    }

    hasKey(key) {
        var found = false;
        this.listeners.forEach((item,i) =>{
            if(item.key === key) {found = true; return true;}
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

    //get the array of secondary onchange functions
    getFuncs = (key=undefined) => {
        if(key) {
            var found = this.listeners.find((o,i) => {
                if(o.key === key) {
                    return true;
                }
            });
            return found.onchangeFuncs;
        } else return undefined;
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
                if(o.key === key) {
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
            var found = this.listeners.forEach((o,i) => {
                if(o.key === key) {
                    indices.push(i);
                }
            });
            indices.reverse().forEach((idx) => {
                this.listeners[idx].listener.stop();
                this.listeners.splice(idx,1);
            });
        }
    }
}

//Instance of an object listener. This will subscribe to object properties (or whole objects) and run attached functions when a change is detected.
export class ObjectListenerInstance {
    constructor(object,propName="__ANY__",onchange=this.onchange,interval="FRAMERATE",debug=false) {
        this.debug=debug;

        this.onchange = onchange; //Main onchange function
        this.onchangeFuncs = []; //Execute extra functions pushed to this array

        this.object = object; //Objects are always passed by reference
        this.propName = propName;
        this.propOld = undefined;
        this.setListenerRef(propName);

        this.running = true;


        this.interval;
        if(interval < 10) {
            this.interval = 10; console.log("Min recommended interval set: 10ms");}
        else {
            this.interval = interval;
        }

        if (typeof window === 'undefined') {
            setTimeout(()=>{this.check();}, 60)
        } else {
            this.checker = requestAnimationFrame(this.check);
        }
    }

    //Main onchange execution
    onchange = (newData) => {
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
    onchangeMulti = (newData) => {
        let onChangeCache = [...this.onchangeFuncs]
        onChangeCache.forEach((func,i) => {
            if(this.debug === true) { console.log(func); }
            func(newData);
        });
    }

    //Update listener reference copy.
    setListenerRef = (propName) => {
        if(propName === "__ANY__" || propName === null || propName === undefined) {
            this.propOld = JSON.stringifyFast(this.object);
        }
        else if(Array.isArray(this.object[propName])) {
            this.propOld = JSON.stringifyFast(this.object[propName].slice(this.object[propName].length-20));
        }
        else if(typeof this.object[propName] === "object"){
            this.propOld = JSON.stringifyFast(this.object[propName]);
        }
        else if(typeof this.object[propName] === "function"){
            this.propOld = this.object[propName].toString();
        }
        else{
            this.propOld = this.object[propName]; //usually a number, bool, or string;
        }
        
        if(this.debug === true) { console.log("propname", propName, ", new assignment: ", this.propOld); }
    }

    check = () => {
        if(this.propName === "__ANY__" || this.propName === null || this.propName === undefined){
            if(this.propOld !== JSON.stringifyFast(this.object)){
                if(this.debug === true) { console.log("onchange: ", this.onchange); }
                this.onchange(this.object);
                if(this.onchangeFuncs.length > 0) { this.onchangeMulti(this.object); }
                this.setListenerRef(this.propName);
            }
        }
        else if(Array.isArray(this.object[this.propName])) { //cut arrays down for speed
            if(this.propOld !== JSON.stringifyFast(this.object[this.propName].slice(this.object[this.propName].length-20))){
                if(this.debug === true) { console.log("onchange: ", this.onchange); }
                this.onchange(this.object[this.propName]);
                if(this.onchangeFuncs.length > 0) { this.onchangeMulti(this.object[this.propName]); }
                this.setListenerRef(this.propName);
            }
        }
        else if(typeof this.object[this.propName] === "object") {
            let string = JSON.stringifyFast(this.object[this.propName]);
            if(this.propOld !== string){
                if(this.debug === true) { console.log("onchange: ", this.onchange); }
                this.onchange(this.object[this.propName]);
                if(this.onchangeFuncs.length > 0) { 
                    this.onchangeMulti(this.object[this.propName]); 
                }
                this.setListenerRef(this.propName);
            }
        }
        else if(typeof this.object[this.propName] === "function") {
            if(this.propOld !== this.object[this.propName].toString()){
                if(this.debug === true) { console.log("onchange: ", this.onchange); }
                this.onchange(this.object[this.propName].toString());
                if(this.onchangeFuncs.length > 0) { this.onchangeMulti(this.object[this.propName].toString()); }
                this.setListenerRef(this.propName);
            }
        }
        else if(this.object[this.propName] !== this.propOld) {
            if(this.debug === true) { console.log("onchange: ", this.onchange); }
            this.onchange(this.object[this.propName]);
            if(this.onchangeFuncs.length > 0) { this.onchangeMulti(this.object[this.propName]); }
            this.setListenerRef(this.propName);
        }
        
        if(this.running === true) {
            if(this.debug === true) {console.log("checking", this.object, this.propName);}
            if(this.interval === "FRAMERATE"){
                if (typeof window === 'undefined') {
                    setTimeout(()=>{this.check();}, 16)
                } else {
                    this.checker = requestAnimationFrame(this.check);
                }
            }
            else {
                setTimeout(()=>{this.check();},this.interval);
            }
        };
    }

    start() {
        this.running = true;
        if (typeof window === 'undefined') {
            setTimeout(()=>{this.check();}, 16)
        } else {
            this.checker = requestAnimationFrame(this.check);
        }
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
            prop1[1] = JSON.stringifyFast(prop1[1]);
        }
        if(typeof prop2[1] === "function"){
            prop2[1] = prop2[1].toString();
        }
        else if(typeof prop2[1] === "object"){
            prop2[1] = JSON.stringifyFast(prop2[1]);
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
            let val;
            if (value != null) {
                if (typeof value === "object") {
                    //if (key) { updateParents(key, value); }
                    let other = refs.get(val);
                    let c = value.constructor.name;
                    if (other) {
                        return '[Circular Reference]' + other;
                    } else if(c === "Array") { //Cut arrays down to 100 samples for referencing
                        if(value.length > 20) {
                            val = value.slice(value.length-20);
                        } else val = value;
                       // refs.set(val, path.join('.'));
                    } else if (c !== "Object" && c !== "Number" && c !== "String" && c !== "Boolean") { //simplify classes, objects, and functions, point to nested objects for the state manager to monitor those properly
                        val = "instanceof_"+c;
                        refs.set(val, path.join('.'));
                    } else if (c === 'Object') {
                        let obj = {};
                        for(const prop in value) {
                            if(Array.isArray(value[prop])) { 
                                if(value[prop].length>20)
                                    obj[prop] = value[prop].slice(value[prop].length-20); 
                                else obj[prop] = value[prop];
                            } //deal with arrays in nested objects (e.g. means, slices)
                            else if (typeof value[prop] === 'object') { //additional layer of recursion for 3 object-deep array checks
                                obj[prop] = {};
                                for(const p in value[prop]) {
                                    if(Array.isArray(value[prop][p])) {
                                        if(value[prop][p].length>20)
                                            obj[prop][p] = value[prop][p].slice(value[prop][p].length-20); 
                                        else obj[prop][p] = value[prop][p];
                                    }
                                    else { 
                                        let con = value[prop][p].constructor.name;
                                        if(con !== "Object" && con !== "Number" && con !== "String" && con !== "Boolean") {
                                            obj[prop] = "instanceof_"+con;
                                        } else {
                                            obj[prop] = value[prop]; 
                                        }
                                    }
                                }
                            }
                            else { 
                                let con = value[prop].constructor.name;
                                if(con !== "Object" && con !== "Number" && con !== "String" && con !== "Boolean") {
                                    obj[prop] = "instanceof_"+con;
                                } else {
                                    obj[prop] = value[prop]; 
                                }
                            }
                        }
                        //console.log(obj, value)
                        val = obj;
                        //refs.set(val, path.join('.'));
                    }
                    else {
                        refs.set(val, path.join('.'));
                    }
                }
            }
            //console.log(value, val)
            return val;
        }

        return function stringifyFast(obj, space) {
            try {
                parents.push(obj);
                return JSON.stringify(obj, checkValues, space);
            } catch(er) {
                console.error(obj, er);
            }finally {
                clear();
            } 
        }
    })();
}
