export class EventSourceHelper {
    constructor(hostUrl='http://192.168.4.1/events', onOpen=this.onOpen, onError=this.onError, onMsg=this.onMsg, customCallbacks=[]) { //Add custom callbacks like [{tag:'heg',callback:(e) => {console.log(e.data);}}]
        this.hostUrl = hostUrl;

        this.onOpen = onOpen;
        this.onError = onError;
        this.onMsg = onMsg;

        this.source = null;

        this.customCallbacks = customCallbacks;

        this.createEventListeners(hostUrl, custom);
        
    }

    onOpen = (e) => {
        console.log("Events Connected!", e.data);
    }

    onError = (e) => {
        console.log("event source error:", e.data);
        if (e.target.readyState !== EventSource.OPEN) {
            console.log("Events Disconnected");
        }
    }

    onMsg = (e) => {
        console.log("event source:", e.data);
    }

    open = () => {
        this.createEventListeners();
    }

    close = () => {
        this.removeEventListeners();
    }

    createEventListeners(hostUrl=this.hostUrl, customCallbacks=this.customCallbacks, source=this.source){
        if(source !== null) {
            this.removeEventListeners(customCallbacks, source);
        }
        if(window.EventSource) {
            source = new EventSource(hostUrl);
            source.addEventListener('open', this.onOpen, false);
            source.addEventListener('error', this.onError, false);
            source.addEventListener('message', this.onMsg, false);
            if(customCallbacks.length > 0){
                customCallbacks.forEach((item,i) => {
                    source.addEventListener(item.tag, item.callback, false);
                })
            }
        }
    }

    removeEventListeners(customCallbacks=this.custom, source=this.source) {
        if (window.EventSource) {
            source.close();
            source.removeEventListener('open', this.openEvent, false);
            source.removeEventListener('error', this.errorEvent, false);
            source.removeEventListener('message', this.messageEvent, false);
            if(customCallbacks.length > 0){
                customCallbacks.forEach((item,i) => {
                    source.removeEventListener(item.tag, item.callback, false);
                });
            }
            source = null;
        }
    }

    //create a function to post to URLS with optional data, usernames, and passwords
    newPostFunction(name="post",url=this.hostUrl,data=undefined,user=undefined,pass=undefined) {
        const newPostFunction = () => {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', url, true, user, pass);
            xhr.send(data); //Accepts: string | Document | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream<Uint8Array>
            xhr.onerror = function() { xhr.abort(); };
        }
        this[name] = newPostFunction;

        return newPostFunction;
    }
}