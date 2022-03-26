
import { RoomInterface } from './types/Room.types'
import { randomId } from '../../common/id.utils'
import { UserObject } from '../../common/general.types'

export class Room {

    // Core Properties
    id: string = randomId()
    name: string = ''
    initiator: UserObject
    restrictions: any = {}
    peers: {[x:string]:UserObject} = {}
    empty:boolean = false

    constructor(initiator: UserObject, settings:RoomInterface = {name: null, restrictions: {}}){

        // Core Properties
        this.name = settings.name ?? this.id
        this.initiator = initiator
        this.restrictions = settings.restrictions

    }

    export = () => {
        return {
            id: this.id,
            name: this.name,
            initiator: this.initiator?.id,
            restrictions: this.restrictions,
            peers: Object.values(this.peers).map(p => p.id)
        } as RoomInterface
    }

    addPeer = (o: UserObject) => {

        // console.log(o)
        // Check User Existence
        if (this.peers[o.id]) console.error('User already added to room.')

        // Check User Authorization (if required) | Currently just a specified id
        // TODO: Fix
        // else if (this.restrictions?.users && !this.restrictions.users.includes(o.auth)) console.error('User not authorized to join room.')
        
        // Otherwise Let Join
        else {
            
            if (!this.restrictions?.max || this.restrictions.max > Object.keys(this.peers).length) {

            // Request Peer Connections
            Object.values(this.peers).forEach((peer) => {
                if (o.send && peer.send) { // Only start when both can complete the negotiation
                    o.send({route: "webrtc/connect", message: [{id:peer.id, info: peer}]}) // initialize connections
                    peer.send({route: "webrtc/connect", message: [{id:o.id, info: o}]}) // extend connections
                }
            })

            // Set in Room
            this.peers[o.id] = o

        } else console.error('Room is full')
    }
        
    }

    removePeer = (origin: string) => {
        let peer = this.peers[origin]
        delete this.peers[origin]
        Object.values(this.peers).forEach(p => p.send({route: "webrtc/disconnectPeer", message: [peer.id]})) // remove from peers
        if (Object.keys(this.peers).length === 0) this.empty = true
    }
}
