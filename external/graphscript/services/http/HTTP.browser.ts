import { GraphNode } from "../../Graph";
import { Routes, Service, ServiceMessage, ServiceOptions } from "../Service";


export type RequestOptions = { //frontend request options (not http or https)
    method:string,
    url:string|URL,
    data?: Document | string | Blob | BufferSource | FormData | URLSearchParams,
    responseType?:XMLHttpRequestResponseType,
    mimeType?:string|undefined,
    onload?:(ev)=>void,
    onprogress?:(ev)=>void,
    onabort?:(ev)=>void,
    onerror?:(er)=>void,
    onloadend?:(ev)=>void,
    user?:string,
    pass?:string
}

//browser http request service
export class HTTPfrontend extends Service {
    
    name='http';

    fetchProxied = false;
    listening = {}

    constructor(options?:ServiceOptions) {
        super(options)
        this.load(this.routes);
    }

    request = (
        options:RequestOptions
    ) => {
        const xhr = new XMLHttpRequest(); //only in browsers
        if(options.responseType) xhr.responseType = options.responseType;
        else options.responseType = 'json';

        if(options.mimeType) {
            xhr.overrideMimeType(options.mimeType);
        }

        if(options.onload) xhr.addEventListener('load',options.onload,false);
        if(options.onprogress) xhr.addEventListener('progress',options.onprogress,false);
        if(options.onabort) xhr.addEventListener('abort',options.onabort,false);
        if(options.onloadend) xhr.addEventListener('loadend',options.onloadend,false);
        if(options.onerror) xhr.addEventListener('error',options.onerror,false);

        xhr.open(options.method, options.url, true, options.user, options.pass);
        
        if(!options.onerror) xhr.onerror = function() { xhr.abort(); };
        xhr.send(options.data); //Accepts: string | Document | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream<Uint8Array>

        return xhr;
    }

    get = (
        url:string|URL='http://localhost:8080/ping', 
        type:XMLHttpRequestResponseType='', 
        mimeType?:string|undefined
    ) => {
        if(type === 'json') mimeType = 'application/json';
        return new Promise((resolve,reject) => {
            let xhr = this.request({
                method:'GET',
                url,
                responseType:type,
                mimeType,
                onload:(ev)=>{ 
                    let data;
                    if(xhr.responseType === '' || xhr.responseType === 'text') data = xhr.responseText;
                    else data = xhr.response;
                    if(url instanceof URL) url = url.toString();
                    this.setState({[url]:data});
                    resolve(data);
                },
                onabort:(er)=>{ reject(er); }
            });
        }).catch(console.error);
    }

    post = (
        message:any|ServiceMessage, 
        url:string|URL='http://localhost:8080/echo', 
        type:XMLHttpRequestResponseType='', 
        mimeType?:string|undefined
    ) => {
        if(typeof message === 'object') {
            message = JSON.stringify(message);
        }

        if(type === 'json') mimeType = 'application/json';
        return new Promise((resolve,reject) => {
            let xhr = this.request({
                method:'POST',
                url,
                data:message,
                responseType:type,
                mimeType,
                onload:(ev)=>{ 
                    let data;
                    if(xhr.responseType === '' || xhr.responseType === 'text') data = xhr.responseText;
                    else data = xhr.response;
                    if(url instanceof URL) url = url.toString();
                    this.setState({[url]:data});
                    resolve(data);
                },
                onabort:(er)=>{ reject(er); }
            });
        }).catch(console.error);

    }

    transmit = (
        message:any|ServiceMessage, 
        url:string|URL
    ) => {
        let obj = message;
        if(typeof obj === 'object') {
            message = JSON.stringify(obj);
        }
        if(obj?.method?.toLowerCase() == 'get' || message?.toLowerCase() === 'get') return this.get(url);
        return this.post(message,url);
     
    }

    //perform get or post (if a message is passed) request and set the response 
    // as the data to run routes locally when the onload event fires on the xhr
    transponder = (
        url:string|URL,
        message:any|ServiceMessage|undefined, 
        type:XMLHttpRequestResponseType='',
        mimeType?:string
    ) => {
        
        if(typeof message === 'object') message = JSON.stringify(message); //in this case if we pass a message it will be used as data to perform a POST request 

        let method = 'GET';

        if(message) {
            method = 'POST';
        }

        if(type === 'json') mimeType = 'application/json';
        else return new Promise((resolve,reject) => {
            let xhr = this.request({
                method,
                url,
                data:message,
                responseType:type,
                onload:(ev)=>{ 
                    let body = xhr.response;
                    
                    if(typeof body === 'string') {
                        let substr = body.substring(0,8);
                        if(substr.includes('{') || substr.includes('[')) {
                            if(substr.includes('\\')) body = body.replace(/\\/g,"");
                            if(body[0] === '"') { body = body.substring(1,body.length-1)};
                            body = JSON.parse(body); //parse stringified args
                        }
                    }
            
                    if(typeof body?.method === 'string') { //run a route method directly, results not linked to graph
                        return resolve(this.handleMethod(body.route,body.method,body.args,body.origin));
                    } else if(typeof body?.route === 'string') {
                        return resolve(this.handleServiceMessage(body));
                    } else if ((typeof body?.node === 'string' || body.node instanceof GraphNode)) {
                        return resolve(this.handleGraphNodeCall(body.node,body.args,body.origin));
                    } else return resolve(body);
                },
                onabort:(er)=>{ reject(er); }
            })
        }).catch(console.error);
    }

    //clone and monitor page fetch responses //https://stackoverflow.com/questions/44440532/fetch-and-addeventlistener
    listen = (
        path:string|undefined|0=0, //can listen for specific partial or whole url paths to trigger the response
        fetched = async (
            clone:Response, //cloned response data
            args:any[], //fetch args
            response:Response //original response if we want to cause problems for the site
        )=>{    
            const result = await clone.text();
            console.log('http listener:', result, clone);
            const returned = this.receive(result);
            this.setState({[response.url]:returned});
        }
    ) => {

        this.listening[path] = true;

        if(!this.fetchProxied) {
            window.fetch = new Proxy(window.fetch, {
                apply(fetch, that, args) {
                    // Forward function call to the original fetch
                    const result = fetch.apply(that, args);
            
                    // Do whatever you want with the resulting Promise
                    result.then((response:Response) => {
                        if(!response.ok) return;
                        if(this.listening[0]) { //clone all
                            const clone = response.clone();
                            fetched(clone, args, response);
                        } else {
                            for(const key in this.listening) {
                                if(response.url.includes(key)) {
                                    const clone = response.clone();
                                    fetched(clone, args, response);
                                    break;
                                }
                            }
                        }
                    }).catch((er) => {
                        console.error(er);
                    });
            
                    return result;
                }
            });
        }
    }

    stopListening = (path:string|0|undefined) => { //stop proxying an url path
        if(!path && path !== 0) {
            for(const key in this.listening) delete this.listening[key];
        } else delete this.listening[path];
    }

    routes:Routes={
        request:this.request,
        GET:this.get,
        POST:this.post,
        transponder:this.transponder,
        listen:this.listen,
        stopListening:this.stopListening
    }

}