import DataChannel from './DataChannel'

/*

Known Bugs
- Adding a DataChannel after an RTCPeerConnection has already been opened will not work reliably (see addDataTracks)

*/

import { SubscriptionService } from '../../core/SubscriptionService'
import { UserObject, MessageObject } from '../../common/general.types';

class WebRTCService extends SubscriptionService {

    name = 'webrtc'
    service = 'webrtc'
    static type = 'client'

    config: RTCConfiguration
    peers: {[x:string]:{
        id: string,
        connection: RTCPeerConnection,
        channel: {
            controller?: DataChannel,
            local?: RTCDataChannel,
            remote?: RTCDataChannel
        }
    }} = {}
    dataChannelQueueLength: number = 0
    dataChannels: Map<string,any> = new Map()
    rooms: Map<string,any> = new Map() // TODO: Remove
    sources: Map<string,any> = new Map()
    toResolve: {[x:string]: any} = {} // for tracking DataChannel callbacks
    hasResolved: {[x:string]: DataChannel} = {} // for tracking DataChannel callbacks

    routes = [

        // // Initialization
        // {
        //     route: 'rooms',
        //     post: (message:any) => {
        //              message.forEach((room) => {this.rooms.set(room.id, room)})
        //             this.dispatchEvent(new CustomEvent('room', {detail: {rooms: message}}))
        //     }
        // },

        // Room Management
        // {
        //     route: 'info',
        //     post: (self, [peers, rooms]) => {
        //             // rooms.forEach((room) => {this.rooms.set(room.id, room)})
        //             // this.dispatchEvent(new CustomEvent('room', {detail: {rooms}}))

        //             // peers.forEach((peer) => {this.peers.set(room.id, room)})
        //             // this.dispatchEvent(new CustomEvent('peer', {detail: {peers}}))
        //     }
        // },
        {
            route: 'room',
            post: (self,graphOrigin,router,origin,...args) => {
                const o = args[0]
                this.rooms.set(o.id, o)
                this.dispatchEvent(new CustomEvent('room', {detail: {room: o, rooms: Array.from(this.rooms, ([_,value]) => value)}}))
            }
        },

        // else if (res.cmd === 'roomclosed') this.dispatchEvent(new CustomEvent('roomclosed'))


        // Default WebRTC Commands
        {
            route: 'answer',
            post: (self,graphOrigin,router,origin,...args) => {
                let peer = this.peers[args[0]]
                if (peer) peer.connection.setRemoteDescription(args[1]);

            }
        },
        {
            route: 'candidate',
            post: (self,graphOrigin,router,origin,peerId,iceCandidate) => {
                let peer = this.peers[peerId]
                let candidate = new RTCIceCandidate(iceCandidate)
                if (peer)  peer.connection.addIceCandidate(candidate).catch(() => {}); // silent, first candidates usually aren't appropriate
            }
        },
        {
            route: 'offer',
            post: (self,graphOrigin,router,origin,...args) => {
                if (args) this.onoffer(args[1], args[0])
            }
        },
 
        // Extra Commands
        {
            route: 'disconnectPeer',
            post: (self,graphOrigin,router,origin,...args) => {
                this.closeConnection(this.peers[args[0]])
            }
        },
        {
            route: 'connect',
            post: async (self,graphOrigin,router,origin,...args) => {
                const o = args[0]
                if (o) {
                    this.createPeerConnection(o) // connect to peer
                    for (let arr of this.sources) {
                        let dataTracks = arr[1].getDataTracks()
                        await this.addDataTracks(o?.id, dataTracks) // add data tracks from all sources
                    }  
                } else console.warn('Peer info not defined!')
            }
        }
    ]

    get [Symbol.toStringTag]() { return 'WebRTCClient' }

    constructor(router, source, iceServers=[{
        urls: ["stun:stun.l.google.com:19302"]
    }]){
        super(router)

        this.addSource(source) // Add MediaStream / DataStream

        this.config = {
            iceServers
          };

          /**
           * e.g. https://developer.mozilla.org/en-US/docs/Web/API/RTCIceServer/urls
            let myPeerConnection = new RTCPeerConnection({
                iceServers: [
                    {
                    urls: ["turns:turnserver.example.org", "turn:turnserver.example.org"],
                    username: "webrtc",
                    credential: "turnpassword"
                    },
                    {
                    urls: "stun: stunserver.example.org"
                    }
                ]
            });
           */

        // ---------------------------- Event Listeners ----------------------------

        this.addEventListener('peerdisconnect', ((ev:CustomEvent) => { delete this.peers[ev.detail.id]}) as EventListener )
        this.addEventListener('peerdisconnect', ((ev:CustomEvent) => { this.onpeerdisconnect(ev)}) as EventListener )
        this.addEventListener('peerconnect', ((ev:CustomEvent) => { this.peers[ev.detail.id] = {
            id: ev.detail.id,
            connection: ev.detail.webrtc,
            channel: null
        }}) as EventListener )
        this.addEventListener('peerconnect', ((ev:CustomEvent) => { this.onpeerconnect(ev)}) as EventListener )
        this.addEventListener('datachannel', ((ev:CustomEvent) => { this.ondatachannel(ev) }) as EventListener )
        this.addEventListener('room', ((ev:CustomEvent) => { this.onroom(ev)}) as EventListener )
        this.addEventListener('track', ((ev:CustomEvent) => { this.ontrack(ev) }) as EventListener )
        // this.addEventListener('trackremoved', ((ev:CustomEvent) => { this.ontrackremoved(ev)}) as EventListener )
        this.addEventListener('roomclosed', ((ev:CustomEvent) => { this.onroomclosed(ev)}) as EventListener )
    }

    onpeerdisconnect = (_:CustomEvent) => {}
    onpeerconnect = (_:CustomEvent) => {}
    ondatachannel = (_:CustomEvent) => {}
    onroom = (_:CustomEvent) => {}
    ontrack = (_:CustomEvent) => {}
    // ontrackremoved = (ev:CustomEvent) => {}
    onroomclosed = (_:CustomEvent) => {}

    // Add DataStreamTracks from DataStream (in series)
    addDataTracks = async (id:string, tracks:any[]) => {
        for (let track of tracks) {
            await this.openDataChannel({name: `DataStreamTrack${this.dataChannelQueueLength}`, peer:id, reciprocated: false}).then((o: DataChannel) => track.subscribe((message) => {
                o.send({message})
            })) // stream over data channel
        }
    }

    addSource = async (source?:any) => {
        if (source){
            this.sources.set(source.id, source)
            source.addEventListener('track', ((ev:CustomEvent) => {
                let kind = ev.detail.kind
                if (!kind || (kind !== 'video' && kind !== 'audio')){
                    for (let key in this.peers) {
                        this.addDataTracks(key, [ev.detail])
                    }
                }
            }) as EventListener)
        }
    }


    // Note: Will run on initial offer and subsequent renegotiations
    onoffer = async (sdp:RTCSessionDescriptionInit, peerId:string) => {
        let myPeerConnection = await this.createPeerConnection({id:peerId}, peerId)

        const description = new RTCSessionDescription(sdp);
        myPeerConnection.setRemoteDescription(description).then(() => myPeerConnection.createAnswer()).then(sdp => myPeerConnection.setLocalDescription(sdp))
        .then(() => {
            this.notify({route: 'answer', message: [peerId, JSON.stringify(myPeerConnection.localDescription)]}) // Pre-stringify
        });
    }

    handleNegotiationNeededEvent = (localConnection:RTCPeerConnection, id:string) => {
        localConnection.createOffer()
        .then(sdp => localConnection.setLocalDescription(sdp))
        .then(() => {
            this.notify({route: 'offer', message: [id, JSON.stringify(localConnection.localDescription)]}) // Pre-stringify
        });
    }

    handleICECandidateEvent = (event: RTCPeerConnectionIceEvent, id: string) => {
        if (event.candidate) this.notify({route: 'candidate', message: [id, JSON.stringify(event.candidate)]}) // Pre-stringify
    }

    handleTrackEvent = (event:RTCTrackEvent, id:string) => {
        if (event.track){
            let track = event.track
            this.dispatchEvent(new CustomEvent('track', {detail: {track, id}}))
            return true
        } else return null
    }


    // NOTE: This data channel will always be the one that can send/receive information
    handleDataChannelEvent = async (ev:RTCDataChannelEvent, peerId:string) => {

            // Receive Channel from Remote
            let o = await this.openDataChannel({channel: ev.channel, peer: peerId}) as DataChannel

            // TODO: Ensure o is always returnd
            if (o){
                const correctedLabel = o.label.replace(/:(.+)/, `:${peerId}`)
                const toResolve = this.toResolve[correctedLabel]
                if (toResolve) {
                    delete this.toResolve[correctedLabel]
                    toResolve(o)
                }
            // this.peers[peerId].channel = o // keep track of channels already resolved
            this.dispatchEvent(new CustomEvent('datachannel', {detail: o}))

        }

    }

    // handleRemoveTrackEvent = (ev,id) => {
    //     if (ev.track){
    //         let track = ev.track
    //         this.dispatchEvent(new CustomEvent('trackremoved', {detail: {track, id}}))
    //         return true
    //     }
    // }


    handleICEConnectionStateChangeEvent = (_:Event, info:UserObject) => {
        const peer = this.peers[info.id]
        switch(peer?.connection?.iceConnectionState) {
            case "closed":
            case "failed":
            this.closeConnection(peer);
              break;
          }
    }

    handleICEGatheringStateChangeEvent = (_:Event) => {}

    handleSignalingStateChangeEvent = (_:Event, info:UserObject) => {
        const peer = this.peers[info.id]
        switch(peer?.connection?.signalingState) {
            case "closed":
            this.closeConnection(peer);
            break;
        }
    }

    closeConnection = (peer:any) => {
        if (peer) this.dispatchEvent(new CustomEvent('peerdisconnect', {detail: peer}))
    }

    createPeerConnection = async (peerInfo:any, peerId?:string) => {

        const localConnection = new RTCPeerConnection(this.config);  

        // Add Local MediaStreamTracks to Peer Connection (on first offer)
        this.sources.forEach(s => {
            s.getTracks().forEach( async (track: MediaStreamTrack | any) => {
                if (track instanceof MediaStreamTrack) localConnection.addTrack(track, s) // ensure connection has track
            });
        })

        localConnection.onicecandidate = (e) => this.handleICECandidateEvent(e,peerInfo.id) // send candidates to remote
        localConnection.onnegotiationneeded = () => this.handleNegotiationNeededEvent(localConnection,peerInfo.id) // offer to remote
        localConnection.ondatachannel = (e) => this.handleDataChannelEvent(e,peerInfo.id)

        peerInfo.webrtc = localConnection

        if (!peerId) this.dispatchEvent(new CustomEvent('peerconnect', {detail: peerInfo}))
        else {

            // Only respond to tracks from remote peers
            localConnection.ontrack = (e) => {
                this.handleTrackEvent(e, peerId); 
            }
            // localConnection.onremovetrack = (e) => this.handleRemoveTrackEvent(e, peerId);
            localConnection.oniceconnectionstatechange = (e) => this.handleICEConnectionStateChangeEvent(e,peerInfo);
            localConnection.onicegatheringstatechange = (e) => this.handleICEGatheringStateChangeEvent(e);
            localConnection.onsignalingstatechange = (e) => this. handleSignalingStateChangeEvent(e,peerInfo);
            
        }

        return localConnection
    }

    remove = (id:string) => {
        let source = this.sources.get(id)
        this.sources.delete(id)
        source.removeEventListener('track', source)
    }

    getRooms = async (auth:string) => {
        let res = await this.notify({route: 'rooms', message: [auth]})
        return res.message
    }
    
    joinRoom = async (room:any, info:{[x:string]: any}, auth:string) => {
        return await this.notify({route: "connect", message:[auth, info, room]});
    }

    createRoom = async (room: any) => this.notify({route: 'createroom', message: [room]})

    leaveRoom = async (room: any) => {
        this.peers = {}
        return this.notify({route: 'disconnect', message: [room]}) 
    }

    openDataChannel = async ({peer, channel, name, callback, reciprocated}:any) => {

        let local = false
        this.dataChannelQueueLength++ // increment name

        if (!(channel instanceof RTCDataChannel) && peer) {
            local = true
            let peerConnection = this.peers[peer].connection

            if (peerConnection) channel = peerConnection.createDataChannel(`${name ?? 'datachannel'}${(peer) ? `:${peer}` : ''}`); // Append peer id or no id
        }

        return await this._useDataChannel(channel as RTCDataChannel, callback, local, reciprocated, peer)
    }

    closeDataChannel = async (peer:string) => {

        const peerObj = this.peers[peer]
        if (peerObj){
            let dC = peerObj?.channel
            if (dC) {
                dC.local.close()
                dC.remote.close()
            }
            delete this.peers[peer]?.channel
        }
    }

    // ASSUME RECIPROCATION
    _useDataChannel = (dataChannel:RTCDataChannel, onMessage:any=()=>{}, local:boolean=false, reciprocated:boolean=true, peer?:string):Promise<DataChannel> => {

        return new Promise((resolve) => {

            // Assign Event Listeners on Open
            if (dataChannel){
            dataChannel.onopen = () => {

                // Track DataChannel Instances
                if (!this.peers[peer].channel) this.peers[peer].channel = {}
                let dC = (local) ? (new DataChannel(dataChannel, peer)) as any : this.peers[peer].channel.controller
                if (dC) this.peers[peer].channel.controller = dC
                if (!local) {
                    this.peers[peer].channel.remote = dataChannel
                    if (dC) dC.setInput(dataChannel)

                    // Set OnMessage Callback
                    dataChannel.addEventListener("message", async (event) => {
                        const o = JSON.parse(event.data)
                        if (!o.id) o.id = peer // Set Peer ID
                        this.responses.forEach((foo) => foo(o)) // Bubble up to Socket subscriptions
                        let res = await this.notify(o, 'local') // Notify Router
                        const controller =this.peers[peer].channel.controller as any
                        if (controller.addData) controller.addData(o) // Add data to Channel = DataTrack

                        // Send Response Back to Peer
                        if (res) controller.send({message: res}) // TODO: Associate route
                    })

                } else this.peers[peer].channel.local = dataChannel

                // If you know this won't be reciprocated, then resolve immediately
                if (!local || !reciprocated) resolve(dC)
                
                // Otherwise mark to resolve OR resolve if this channel already has been
                else {
                    let existingResolve = this.peers[peer].channel.controller
                    if (existingResolve) resolve(existingResolve)
                    else this.toResolve[dC.label] = resolve
                }
            }

            dataChannel.onclose = () => this.closeDataChannel(peer)
        
        } else console.log('DATA CHANNEL DOES NOT EXIST')
        });
    };


    // Custom Send Function (check for options)
    send = (o:MessageObject, options: any) => {

        // Ensure Message Sends to Both Channel Instances
        let check = () => {
            let channels =  (options.peer) ? [this.peers[options.peer].channel.controller] : Object.values(this.peers).map(p => p?.channel?.controller)

            channels.forEach(dC => {
                if (dC) {
                    if (dC.output.readyState === 'open') dC.send(o); // send on open instead
                    else dC.output.addEventListener('open', () => {dC.send(o);}) // send on open instead
                } 
                // else if (options.reciprocated) setTimeout(check, 500)
            })

        }
        check()
        return undefined
    }

    add = async (_:Partial<UserObject>, __:string):Promise<any> => {}

     //copy data from another host into the local services and toggle necessary flags to be the lead sender/receiver of data
     becomeHost() {
        //copy data from other host (which could be the main server offloading a portion of data to the webrtc host)

        //set flags so that other peers in the room will stream their data to you instead of the previous host
    }

    //migrate to another user by passing all of the hosted data over to your service instances
    //OR if need be, migrate back to the dedicated server by updating the data the normal way (decentralize <---> recentralize on the fly?)
    migrateHost() {

    }
}

export default WebRTCService