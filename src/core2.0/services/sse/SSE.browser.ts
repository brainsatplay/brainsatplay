import { Service, Routes } from "../Service";

export type EventSourceProps = {
    url:string,
    events:{
        message?:(ev:any,sseinfo?:EventSourceInfo)=>void,  //will use this.receive as default
        open?:(ev:any,sseinfo?:EventSourceInfo)=>void,
        close?:(ev:any,sseinfo?:EventSourceInfo)=>void,
        error?:(ev:any,sseinfo?:EventSourceInfo)=>void,
        [key:string]:(ev:any,sseinfo?:EventSourceInfo)=>void
    }
    evoptions?:boolean|AddEventListenerOptions,
    type?:'eventsource'|string,
    _id?:string,
    keepState?:boolean
}

export type EventSourceInfo = {
    source:EventSource
} & EventSourceProps

export class SSEfrontend extends Service {

    name='sse'
    
    eventsources:{
        [key:string]:EventSourceInfo
    }={}

    constructor(routes?:Routes, name?:string) {
        super(routes, name);
    }

    openSSE = (
        options:EventSourceProps
    ) => {
        let source = new EventSource(options.url);

        let sse = {
            source,
            type:'eventsource',
            ...options
        }

        if(!('keepState' in options)) options.keepState = true; //default true
        if(!options.events) options.events = {};
        if(!options.events.message) {
            options.events.message = (ev, sse) => {

                let data = ev.data;

                if(data) if(Object.getPrototypeOf(data) === String.prototype) {
                    let substr = data.substring(0,8);
                    if(substr.includes('{') || substr.includes('[')) {    
                        if(substr.includes('\\')) data = data.replace(/\\/g,"");
                        if(data[0] === '"') { data = data.substring(1,data.length-1)};
                        //console.log(message)
                        data = JSON.parse(data); //parse stringified objects

                        if(data.route === 'setId') {
                            sse._id = data.args;
                            options.events.message = (ev, sse) => { //clear extra logic after id is set
                                const result = this.receive(ev.data,sse);
                                if(options.keepState) this.setState({[options.url]:result}); 
                            }
                        }
                    }
                } 

                const result = this.receive(ev.data,sse);
                if(options.keepState) this.setState({[options.url]:result}); 
            }
        }
        if(!options.events.error) options.events.error = (ev, sse) => {
            this.terminate(sse);
            delete this.eventsources[options.url];
        }

        if(options.events) {
            if(!options.evoptions) options.evoptions = false;
            for(const key in options.events) {
                if(typeof options.events[key] !== 'function') {
                    options.events[key] = (ev:MessageEvent) => { //default callback 
                        const result = this.receive(ev.data, sse);
                        if(options.keepState) this.setState({[options.url]:result}); 
                    }
                } else {
                    let l = options.events[key];
                    options.events[key] = (ev:MessageEvent) => {l(ev,sse);};
                }
                source.addEventListener(key,options.events[key],options.evoptions);
            }
        }
        
        this.eventsources[options.url] = sse;
        //console.log(source);

        return sse;
    }

    terminate = (sse:EventSourceInfo|EventSource|string) => {
        if(typeof sse === 'string') {
            let str = sse;
            sse = this.eventsources[sse];
            delete this.eventsources[str];
        }
        if(!sse) return;
        if(typeof sse === 'object') {
            if((sse as EventSourceInfo).source) {
                sse = (sse as EventSourceInfo).source;
            }
           
            if (sse instanceof EventSource) 
                if(sse.readyState !== 2)
                    (sse as EventSource).close();
        }
    } 

    routes:Routes = {
        openSSE:this.openSSE,
        terminate:this.terminate
    }
}