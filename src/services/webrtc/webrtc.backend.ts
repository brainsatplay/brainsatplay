import {Room} from './Room'
import { RoomInterface } from './types/Room.types'
import { MessageObject, UserObject } from '../../common/general.types'
import { Service } from '../../core/Service'

class WebRTCService extends Service {

    name = 'webrtc'
    static type = 'backend'

    peers: {[x:string]:UserObject} = {}
    rooms: {[x:string]:any} = {}
    pairs: {[x:string]:any} = {}

    routes = [

        {
            route: 'subscribe',
            post: (self,router,origin,...args) => {

                let u = router.USERS[origin] // NOTE: Requires being registered in the global server
                if (u && !this.peers[origin]) this.peers[origin] = u

                // Subscribe or Create Room
                const rooms = this.getRooms()
                args[0]?.forEach(route => {
                    const split = route.split('/')
                    route = split[1]

                    // Slice out Room and Peer subscriptions
                    if (split[0] === 'rooms'){

                        // First Check Room ID. Then fallback to name.
                        let room = this.rooms[route] || Object.values(this.rooms).find(r => r.name === route)
                        if (room) {
                            this.connect(room, origin)
                        } else {
                            room = this.createRoom({name: route})
                            this.connect(room,origin)
                        }

                    } else {
                        if (split[0] !== 'users') route = split[0] // base user
                        const user = this.peers[route]
                        if (user) {
                            this.connect(user, origin)
                        } else console.log('User not found.')
                    }
                })

                return {route:'info', message: [this.getPeers(), rooms]} // TODO: Limit viewable rooms and users
            }
        },
        {
            route: 'unsubscribe',
            post: (self,router,origin,...args) => {
                console.log('MUST IMPLEMENT UNSUBSCRIBE')
                return;
            }
        },

        // TODO: Support Subscriptions at any Level
        {
            route: 'users',
            get: {
                object: this.peers,
                transform: () => this.getPeers()
            },
            delete: (self,router,origin,...args) => {

                // Expects User ID String
                return this.disconnect(args?.[0] ?? origin)
            }
        },

        // TODO: Support Subscriptions at any Level
        {
            route: 'rooms',
            get: {
                object: this.rooms,
                transform: () => this.getRooms()
            },
            // post: (self,router,origin,...args) => {
            //     return;
            // }
        },

        // WebRTC Basic Commands
        {
            route: 'offer',
            post: (self,router,origin,...args) => {
                return this.pass('webrtc/offer', origin, args[0], JSON.parse(args[1]))
            }
        },
        {
            route: 'answer',
            post: (self,router,origin,...args) => {
                return this.pass('webrtc/answer', origin, args[0], JSON.parse(args[1]))
            }
        },
        {
            route: 'candidate',
            post: (self,router,origin,...args) => {
                return this.pass('webrtc/candidate', origin, args[0], JSON.parse(args[1]))
            }
        },

        // // Room Management
        // {
        //     route: 'rooms',
        //     post: (self, args, id) => {
        //         let res = this.getRoomsByAuth(args[0])
        //         return {message: [res], route: 'rooms'}
        //     }
        // },

        // {
        //     route: 'newroom',
        //     post: async (self, args, id) => {
        //         const message = await this.createRoom(args[0], id)
        //         console.log('message', message)
        //         return {route: 'newroom', message}
        //     }
        // },
    ]

    constructor(router) {
        super(router)
    }

    getRoomsByAuth = (auth:string) => this.getRooms((r) => r.restrictions?.users == null || r.restrictions.users.includes(auth))

    getRooms = (filter:(arg:Room) => boolean = () => true) => {
        return Object.values(this.rooms).filter(filter).map(value => value.export())
    }

    getPeers = (filter:(arg:UserObject) => boolean = () => true) => {
        return Object.values(this.peers).filter(filter).map(v => {return {id:v.id, username:v.username}})
    }

    // Connect with RoomInfo or UserInfo
    connect = (info:RoomInterface|UserObject, origin: string) => {

        let u = this.peers[origin]
        let room = this.rooms[info?.id]
        let peer = this.peers[info?.id]

        // Connect Peer
        if (u?.send){
            if (peer?.send) {
                u.send({route: "webrtc/connect", message: [{id:peer.id, info: peer}]}) // initialize connections
                peer.send({route: "webrtc/connect", message: [{id: u.id, info: u}]}) // extend connections
                
                // Register Pair
                if (!this.pairs[u.id]) this.pairs[u.id] ={}
                if (!this.pairs[peer.id]) this.pairs[peer.id] ={}
                this.pairs[u.id][peer.id] = true
                this.pairs[peer.id][u.id] = true
                
                return peer
            } 
            
            // Default to Room
            else {
                if (!room) room = Object.values(this.rooms)[0] // Default to first room
                if (room) room.addPeer(u) // Adding peer to room
                return room.export()
            }
        } else {
            console.log('User credentials not registered in the server.')
            return false
        }
    }

    createRoom = async (settings:RoomInterface,origin='server') => {

        // Get Room Initiator
        let initiator = this.peers[origin]

        let room = new Room(initiator, settings)

        this.rooms[room.id] = room 

        let data = room.export()

        return data
    }

    disconnect = (id: string) => {

        for (let room in this.rooms){
            const r = this.rooms[room]
            if (r.peers[id]){
                this.removePeerFromRoom(r,id)
            }

            if (this.pairs[id]){
                Object.keys(this.pairs[id]).forEach(name => {
                    this.peers[id].send({route: "webrtc/disconnectPeer", message: [id]}) // remove from peers
                })
            }
        }

        delete this.peers[id]
    }

    removePeerFromRoom = (room: Room, origin: string) => {
        room.removePeer(origin) // remove peer from room

        if (room.empty === true){
            setTimeout(() => {

                // Remove if still empty
                if (room.empty) delete this.rooms[room.id]

            }, 5 * 60 * 1000) // check again after 5 minutes
        }
    }

    // Macro for Passing Offers, Answers, and Candidates between Peers
    pass = (route:string, origin: string, destination:string, msg:any) => {
        let recipient = this.peers[destination]
        if (recipient?.send) recipient.send({route, message: [origin, msg], id: origin})
    }
}

export default WebRTCService;