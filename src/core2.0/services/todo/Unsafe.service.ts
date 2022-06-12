import { GraphNode, parseFunctionFromText } from "../../Graph"
import { Service } from "../Service"

//Contains evals and other things you probably don't want wide open on an API
export const unsafeRoutes = {
    
    //add a route and parse it from text
    addRoute:(self:GraphNode,origin:any,fnName:string,fn:string|((...args:[])=>any)) => {
        if(typeof fn === 'string') fn = parseFunctionFromText(fn);
        if(typeof fn === 'function') 
            (self.graph as Service).add({tag:fnName,operator:fn});
    },
    transferClass:(classObj:any)=>{ //send a class over a remote service
        if(typeof classObj === 'object') {
            let str = classObj.toString();//needs to be a class prototype
            let message = {route:'receiveClass',args:str};

            return message;
        }
        return false;
    },
    receiveClass:(self:GraphNode,origin:any,stringified:string)=>{
        if(typeof stringified === 'string') {
            if(stringified.indexOf('class') === 0) {
                let cls = (0,eval)('('+stringified+')');
                let name = cls.name; //get classname
                self.graph[name] = cls;
            }
        }
    }
}