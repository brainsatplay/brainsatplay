import { GraphNode, parseFunctionFromText } from "../../Graph"
import { Graph } from "../../Graph"

//Contains evals and other things you probably don't want wide open on an API
export const unsafeRoutes = {
    
    //add a route and parse it from text
    setRoute:(self:GraphNode,origin:any,fn:string|((...args:[])=>any),fnName?:string) => {
        //console.log(origin, fn, fnName)
        //if(fnName === 'setupChart') console.log(fn);
        if(typeof fn === 'string') fn = parseFunctionFromText(fn);
        //if(fnName === 'setupChart') console.log(fn);
        if(typeof fn === 'function') {
            if(!fnName) fnName = fn.name;
            if(self.graph.get(fnName)) {
                self.graph.get(fnName).setOperator(fn); //overwrite operator
            }
            else (self.graph as Graph).load({[fnName]:{operator:fn}});
            return true;
        }
        return false;
    },
    setNode:(self:GraphNode,origin:any,fn:string|((...args:[])=>any),fnName?:string) => {
        //console.log(origin, fn, fnName)
        if(typeof fn === 'string') fn = parseFunctionFromText(fn);
        //console.log(fn);
        if(typeof fn === 'function') {
            if(!fnName) fnName = fn.name;
            if(self.graph.get(fnName)) {
                self.graph.get(fnName).setOperator(fn); //overwrite operator
            }
            else (self.graph as Graph).add({tag:fnName,operator:fn});
            //console.log(self)
            return true;
        }
        return false;
    },
    setMethod:(self:GraphNode,origin:any,route:string,fn:string|((...args:[])=>any),fnName?:string) => { //set a method on a route
        //console.log(origin, fn, fnName)
        if(typeof fn === 'string') fn = parseFunctionFromText(fn);
        //console.log(fn);
        if(typeof fn === 'function') {
            if(!fnName) fnName = fn.name;
            if(self.graph.get(route)) {
                self.graph.get(route)[fnName] = fn; //overwrite method
            }
            else (self.graph as Graph).add({tag:fnName,[fnName]:fn});
            //console.log(self)
            return true;
        }
        return false;
    },
    assignRoute:(self:GraphNode,origin:any,route:string,source:{[key:string]:any}) => { //set values on a route
        //console.log(origin, fn, fnName)
        if(self.graph.get(route) && typeof source === 'object') {
            Object.assign(self.graph.get(route),source);
        }
    },
    transferClass:(classObj:any, className?:string)=>{ //send a class over a remote service
        if(typeof classObj === 'object') {
            let str = classObj.toString();//needs to be a class prototype
            let message = {route:'receiveClass',args:[str,className]};

            return message;
        }
        return false;
    },
    receiveClass:(self:GraphNode,origin:any,stringified:string, className?:string)=>{ //eval a class string and set it as a key on the local graph by class name, so self.graph.method exists
        if(typeof stringified === 'string') {
            //console.log(stringified)
            if(stringified.indexOf('class') === 0) {
                let cls = (0,eval)('('+stringified+')');
                let name = className;
                
                if(!name)
                    name = cls.name; //get classname
                self.graph[name] = cls;
                
                return true;
            }
        }
        return false;
    },
    setValue:(self:GraphNode,origin:any, key:string, value:any) => { //set a value on the globalThis scope
        globalThis[key] = value;
        return true;
    },
    assignObject:(self:GraphNode,origin:any, target:string, source:{[key:string]:any}) => { //assign a value on an object on the globalThis scope
        if(!globalThis[target]) return false;
        if(typeof source === 'object') Object.assign(globalThis[target],source);
        return true;
    },
    setFunction:(self:GraphNode,origin:any, fn:any, fnName?:string) => { //set a value on the globalThis scope
        if(typeof fn === 'string') fn = parseFunctionFromText(fn);
        //console.log(fn);
        if(typeof fn === 'function') {
            if(!fnName) fnName = fn.name;
            globalThis[fnName] = fn;
            //console.log(self)
            return true;
        }
        return false;
    },
    assignFunctionToObject:(self:GraphNode,origin:any, globalObjectName:string, fn:any, fnName:any) => { //assign a value on an object on the globalThis scope
        if(!globalThis[globalObjectName]) return false;
        if(typeof fn === 'string') fn = parseFunctionFromText(fn);
        //console.log(fn);
        if(typeof fn === 'function') {
            if(!fnName) fnName = fn.name;
            globalThis[globalObjectName][fnName] = fn;
            //console.log(self)
            return true;
        }
        return false;
    }
}