//End to end encryption using cryptojs and keygen stuff, should involve webworkers 

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
        id:string,
        key:string,
        method:'aes'|'sha256'|undefined
    ) => {
        this.keys[id] = {key, method};
    }

    //cryptojs calls, should be done
    encrypt(message:string,key:string,method?:string) {

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
    
    routes:Routes={
        encryptRoute:this.encryptRoute,
        decryptRoute:this.decryptRoute,
        encrypt:this.encrypt,
        decrypt:this.decrypt
    }
}