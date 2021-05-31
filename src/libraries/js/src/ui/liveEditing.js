

export class jsEditor {

    /*
        parentClassInstance - the name of the object/class instance you are targeting - for session atlas's you need to retarget the parentClassInstance every time it's replaced onconnect, which will need to be set from the very top level in BCIAppManager
        functionName - the name of the function in the target class instance
        parentNode - where to put the editor
    */
    constructor(parentClassInstance,functionName, parentNode) {

        this.parentClassInstance = parentClassInstance; //e.g. this.session.atlas
        this.functionName = functionName;

        this.functionHead = this.getFunctionHead(this.parentClassInstance[this.functionName]);
        this.functionBody = this.getFunctionBody(this.parentClassInstance[this.functionName]);
        this.functionCopy = this.parentClassInstance[this.functionName].toString();

        this.randomId = Math.floor(Math.random()*10000000);
        this.parentNode = parentNode;

        this.makeEditor();
    }

    //Edit javascript function bodies
    makeEditor = (parentNode=this.parentNode) => {
        let template = `
            <div id='${this.randomId}editorContainer'>
                <span id='${this.randomId}head'>Function Head</span>
                <textarea id='${this.randomId}editor' placeholder='Javascript function body'></textarea>
                <button id='${this.randomId}submit'>Submit</button>
                <button id='${this.randomId}reset'>Reset</button>
            </div>
        `;

        parentNode.insertAdjacentHTML('beforeend',template);

        document.getElementById(this.randomId+'head').innerHTML = this.functionHead;

        document.getElementById(this.randomId+'editor').value = this.functionBody;

        document.getElementById(this.randomId+'submit').onclick = () => {
            newFunc = undefined;
            try{ 
                let text = document.getElementById(this.randomid+'editor').value;
                newFunc = eval(this.functionHead+text.replace(/window/g,'err').replace(/gapi/g,'err')+'}');
            } 
            catch (er) {}
            if(newFunc)
                this.parentClassInstance[this.functionName] = newFunc;
        }

        document.getElementById(this.randomId+'reset').onclick = () => {
            this.parentClassinstance[this.functionName] = eval(this.functionCopy);
            this.functionBody = this.getFunctionBody(this.parentClassInstance[this.functionName]);
            this.functionHead = this.getFunctionHead(this.parentClassInstance[this.functionName]);
            document.getElementById(this.randomId+'editor').value = this.functionBody;
        }

    }

    removeEditor = () => {
        let editor = document.getElementById(this.props.id+'editorContainer');
        editor.parentNode.removeChild(editor);   
    }

    //Get the text inside of a function (regular or arrow);
    getFunctionBody = (method) => {
        return method.toString().replace(/^\W*(function[^{]+\{([\s\S]*)\}|[^=]+=>[^{]*\{([\s\S]*)\}|[^=]+=>(.+))/i, '$2$3$4');
    }

    getFunctionHead = (method) => {
        let fnstring = method.toString();
        return fnstring.slice(0,fnstring.indexOf('{') + 1);
    }

    //Replaces the input function's body.
    replaceFunctionBody = (fnToReplace,newBody) => {
        let head = this.getFunctionHead(fnToReplace);
        let newFunc = eval(head+newBody+'}');
        return newFunc;
    }

}

//edit html divs on the fly, can add scoped CSS
export class htmlEditor {
    /*
      targetDiv (string or element), 
      defaultScripts (string of javascript to evaluate to set up the default targetDiv), 
      parentNode (where to put the editor (beforeend))
    */
    constructor(targetDiv='', defaultScripts='', parentNode) {
        this.targetDiv = targetDiv;
        if(typeof this.targetDiv === 'string') {
            this.targetDiv = document.getElementById(this.targetDiv);
        }
        
        this.targetParent = this.targetDiv.parentNode;
        this.htmlCopy = this.targetDiv.innerHTML;
        this.defaultScripts = defaultScripts;

        this.parentNode = parentNode;

        this.makeEditor();
    }

    makeEditor = (parentNode = this.parentNode) => {
        let template = `
            <div id='${this.randomId}editorContainer'>
                <span id='${this.randomId}head'>ElementId</span>
                HTML:
                <textarea id='${this.randomId}editor' placeholder='<div id='newdiv></div>'></textarea>
                Scripts:
                <textarea id='${this.randomId}htmlscripts' placeholder='document.getElementById('newdiv').onclick = () => {alert('hello world');}'></textarea>
                <button id='${this.randomId}submit'>Submit</button>
                <button id='${this.randomId}reset'>Reset</button>
            </div>
        `;

        parentNode.insertAdjacentHTML('beforeend',template);

        document.getElementById(this.randomId+'head').innerHTML = this.targetDiv.id;

        document.getElementById(this.randomId+'editor').value = this.targetDiv.innerHTML;

        document.getElementById(this.randomId+'submit').onclick = () => {
            this.targetDiv.innerHTML = document.getElementById(this.randomId+'editor').value;
            try{ eval(document.getElementById(this.randomId+'htmlscripts').value.replace(/window/g,'err').replace(/gapi/g,'err')); } catch (er) {alert('Script error: ', er);}
        }

        document.getElementById(this.randomId+'reset').onclick = () => {
            this.targetDiv.innerHTML = this.htmlCopy;   
            try{ eval(this.defaultScripts); } catch(er) {alert('Script error: ', er);}
        }

    }

    removeEditor = () => {
        let editor = document.getElementById(this.props.id+'editorContainer');
        editor.parentNode.removeChild(editor);  
    }

}