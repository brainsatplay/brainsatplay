//End to end encryption using cryptojs and keygen stuff, should involve webworkers 

import { GraphNode } from "../../Graph";
import { Service, Routes, ServiceMessage } from "../Service";

//End to end encryption service, this will redirect transmits/receives through an encoder/decoder framework
export class E2EEService extends Service {
    
    name='e2ee'
    
    //should encrypt the key table too with an environment variable key
    keys:{ //match ids to decryption keys then attempt to reroute the data
        [key:string]:{ key:string, method?:'aes'|'sha256' } //if method undefined, default to AES (the one that is considered most secure/general)
    }

    constructor(routes?:Routes, name?:string) {
        super(routes, name);
    }

    addKey = (
        _id:string,
        key:string,
        method:'aes'|'sha256'|undefined
    ) => {
        this.keys[_id] = {key, method};
    }

    //cryptojs calls, should be done
    encrypt(
        message:string,
        key:string,
        method?:string
    ) {

        return message;
    }

    decrypt(
        message:string,
        key:string,
        method?:string
    ) {

        return message;
    }

    encryptRoute = (
        message:ServiceMessage|string,
        keyId:string //decryption key table Id
    ) => {
        if(typeof message === 'object') message = JSON.stringify(message);
        message = this.encrypt(message,keyId);
        message = {route:'decryptRoute', args:message, origin:keyId} //even better to scramble the origin too
        return message;
    }

    decryptRoute = (
        message:ServiceMessage|string,
        keyId?:string //decryption key table Id
    ) => {
        let decryptedMessage = message;
        if(typeof message === 'object') {
            if(!keyId && typeof message.origin === 'string') 
                keyId = message.origin;
            else if(!keyId && typeof message.keyId === 'string') 
                keyId = message.keyId;
            
            decryptedMessage = this.decrypt(message.args,keyId);
        } else {
            decryptedMessage = this.decrypt(message, keyId)
            //this.receive(decryptedMessage);
        }
        return decryptedMessage;
    }

    transmit = (message:ServiceMessage|string,keyId?:string) => {
        if(!keyId) {
            keyId = Object.keys(this.keys)[0];
        }
        message = this.encryptRoute(message,keyId);
        return this.handleServiceMessage(message); //??
    }

    receive = (message:ServiceMessage|string,keyId?:string) => { //decrypt then pass message to typical message handlers
        if(!keyId) {
            keyId = Object.keys(this.keys)[0];
        }
        message = this.decryptRoute(message,keyId);

        if(typeof message === 'string') {
            
            let substr = message.substring(0,8);
            if(substr.includes('{') || substr.includes('[')) {
                if(substr.includes('\\')) message = message.replace(/\\/g,""); 
                if(message[0] === '"') { message = message.substring(1,message.length-1)};
                //console.log(message)
                message = JSON.parse(message); //parse stringified args
            }
        }

        if(typeof message === 'object') {
            if(typeof message.method === 'string') { //run a route method directly, results not linked to graph
                return this.handleMethod(message.route, message.method, message.args);
            } else if(typeof message.route === 'string') {
                return this.handleServiceMessage(message);
            } else if ((typeof message.node === 'string' || message.node instanceof GraphNode)) {
                return this.handleGraphNodeCall(message.node, message.args, message.origin);
            } else if(this.keepState) {    
                if(message.route)
                    this.setState({[message.route]:message.args});
                if(message.node)
                    this.setState({[message.node]:message.args});
            }
        } else return message;
        
    } //
    
    routes:Routes={
        encryptRoute:this.encryptRoute,
        decryptRoute:this.decryptRoute,
        encrypt:this.encrypt,
        decrypt:this.decrypt
    }
}