// Objects (with Functions)
export const safeParse = (input:string | {
    [x: string]:any
}) => {

    if (typeof input === 'string' ) input = JSON.parse(input)

    if (typeof input === 'object'){
        // Convert Stringified Functions to String
        for (let key in input){
            let value = input[key]
            let regex = new RegExp('(|[a-zA-Z]\w*|\([a-zA-Z]\w*(,\s*[a-zA-Z]\w*)*\))\s*=>')
            let func = (typeof value === 'string') ? value.substring(0, 8) == 'function' : false
            let arrow = (typeof value === 'string') ? regex.test(value) : false
            
            try {
                input[key] = (func || arrow) ? eval('(' + value + ')') : value;
            } catch (e) {
                console.error(e, value)
                input[key] = value
            }
            
            if (typeof input[key] === 'object') safeParse(input[key])
        }

        return input

    } else return {}
}

export const safeStringify = (input:any, stringify=true):any => {

    if (input instanceof Object) input = (Array.isArray(input)) ? [...input] : Object.assign({}, input)

    // Stringify Functions
    for (let key in input){
        if (input[key] instanceof Function) input[key] = input[key].toString()
        if (input[key] instanceof Object) {
          // console.log(key, input[key])
            input[key] = safeStringify(input[key], false)
        }
    }

    // Actually Stringify
    return (stringify) ? JSON.stringify(input) : input

}


// Functions
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
export function getParamNames(func: Function) {
  if (func instanceof Function){
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if(result === null)
      result = [];
    return result;
  } else return
}


export function parseFunctionFromText(method='') {
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