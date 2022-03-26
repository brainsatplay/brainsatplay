  export let dynamicImport = async (url) => {
    let module = await import(url);
    return module;
  }
  
  //Get the text inside of a function (regular or arrow);
  export function getFunctionBody(methodString) {
    return methodString.toString().replace(/^\W*(function[^{]+\{([\s\S]*)\}|[^=]+=>[^{]*\{([\s\S]*)\}|[^=]+=>(.+))/i, '$2$3$4');
  }
  
  export function getFunctionHead(methodString) {
    let fnstring = methodString.toString();
    return fnstring.slice(0, fnstring.indexOf('{') + 1);
  }
  
  export function buildNewFunction(head, body) {
    let newFunc = eval(head + body + '}');
    return newFunc;
  }
  
  export function isFunction(string) {
    let regex = new RegExp('(|[a-zA-Z]\w*|\([a-zA-Z]\w*(,\s*[a-zA-Z]\w*)*\))\s*=>')
    let func = (typeof string === 'string') ? string.substring(0,10).includes('function') : false;
    let arrow = (typeof string === 'string') ? regex.test(string) : false;
    if(func || arrow) return true;
    else return false;
  }
  
  export function parseFunctionFromText(method) {
    //Get the text inside of a function (regular or arrow);
    let getFunctionBody = (methodString) => {
      return methodString.replace(/^\W*(function[^{]+\{([\s\S]*)\}|[^=]+=>[^{]*\{([\s\S]*)\}|[^=]+=>(.+))/i, '$2$3$4');
    }
  
    let getFunctionHead = (methodString) => {
      let startindex = methodString.indexOf(')');
      return methodString.slice(0, methodString.indexOf('{',startindex) + 1);
    }
  
    let newFuncHead = getFunctionHead(method);
    let newFuncBody = getFunctionBody(method);
  
    let newFunc;
    if (newFuncHead.includes('function ')) {
      let varName = newFuncHead.split('(')[1].split(')')[0]
      newFunc = new Function(varName, newFuncBody);
    } else {
      if(newFuncHead.substring(0,6) === newFuncBody.substring(0,6)) {
        //newFuncBody = newFuncBody.substring(newFuncHead.length);
        let varName = newFuncHead.split('(')[1].split(')')[0]
        //console.log(varName, newFuncHead ,newFuncBody);
        newFunc = new Function(varName, newFuncBody.substring(newFuncBody.indexOf('{')+1,newFuncBody.length-1));
      }
      else newFunc = eval(newFuncHead + newFuncBody + "}");
    }
  
    return newFunc;
  
  }
  
  