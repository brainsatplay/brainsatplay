// import datastreams from "datastreams-api"
import *  as datastreams from 'datastreams-api'
console.log(datastreams)

import { randomId } from '../../common/id.utils'
import { MessageObject } from 'src/common/general.types'

// Data Channels Behave Just Like Tracks
export default class DataChannel extends datastreams.DataStreamTrack {

    id: string = ''
    label: string = ''
    output: RTCDataChannel
    input?: RTCDataChannel
    peer?: string

    constructor(output: RTCDataChannel, peer?:string){
        super()
        this.id = output.id?.toString() ?? randomId()
        this.label = output.label
        this.output = output 
        this.input = null 

        this.peer = peer 

    }
    
    send = (o:MessageObject, options?: any) => {
        let data = JSON.stringify(o)

        // Ensure Message Sends to Both Channel Instances
        // let check = () => {
            // let dC =  this.dataChannels.get(options.id)
            // if (dC) {
                if (this.output.readyState === 'open') this.output.send(data); // send on open instead
                else this.output.addEventListener('open', () => {this.output.send(data);}) // send on open instead
            // } else if (options.reciprocated) setTimeout(check, 500)
        // }
        // check()
    }

    setInput = (input: RTCDataChannel) => {
        this.input = input 
    }
}