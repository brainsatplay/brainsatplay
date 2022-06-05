import { Service, Routes, ServiceMessage } from "../Service";

export type WebRTCProps = {
    id:string,
    origin?:string,
    channels?:{
        [key:string]:(true|RTCDataChannelInit|RTCDataChannel)
    },
    config?:RTCConfiguration,
    description?:RTCSessionDescriptionInit,
    offer?:RTCOfferOptions,
    icecandidate?:RTCIceCandidate,
    answer?:RTCAnswerOptions,
    ontrack?:(ev:RTCTrackEvent)=>void,
    onicecandidate?:(ev:RTCPeerConnectionIceEvent)=>void,
    onicecandidateerror?:(ev:Event)=>void,
    onnegotiationneeded:(ev:Event)=>void,
    ondatachannel:(ev:RTCDataChannelEvent)=>void,
    ondata:(ev:MessageEvent<any>, channel:RTCDataChannel, room)=>void,
    onconnectionstatechange:(ev:Event)=>void,
    oniceconnectionstatechange:(ev:Event)=>void
}

export type WebRTCInfo = {
    rtc:RTCPeerConnection
} & WebRTCProps

//webrtc establishes secure P2P contexts between two users directly.
// However, we need a backend as a way to list available connections.
export class WebRTCfrontend extends Service {

    name='webrtc'

    rtc:{
        [key:string]:any
    } = {}

    iceServers:{urls:string}[] = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
    ];

    constructor(routes?:Routes, name?:string, iceServers?:{urls:string}[] ) {
        super(routes, name);

        if(iceServers) this.iceServers = iceServers;
    }
    
    createStream = ( //use navigator.mediaDevices.getUserMedia({audio:true,video:true}) for audio/video streams
        options:{
            [key:string]:{
                track:MediaStreamTrack|MediaTrackConstraints,
                onended:(ev)=>void,
                onmute:(ev)=>void,
                onunmute:(ev)=>void
            }
        }
    ) => {
        let stream = new MediaStream();
        for(const key in options) {
            let track = options[key].track;
            if(!(track instanceof MediaStreamTrack) && typeof track === 'object') {
                track = new MediaStreamTrack();
                track.applyConstraints(options[key].track as MediaTrackConstraints)
                stream.addTrack(track);
            }

            if(track instanceof MediaStreamTrack) {
                stream.addTrack(track as MediaStreamTrack);
                track.onmute = options[key].onmute;
                track.onunmute = options[key].onunmute;
                track.onended = options[key].onended;

            }
        }
        return stream;
    }

    openRTC = (
        options:{
            id:string,
            origin?:string,
            channels?:{
                [key:string]:(true|RTCDataChannelInit|RTCDataChannel)
            },
            config?:RTCConfiguration,
            description?:RTCSessionDescriptionInit,
            offer?:RTCOfferOptions,
            icecandidate?:RTCIceCandidate,
            answer?:RTCAnswerOptions,
            ontrack?:(ev:RTCTrackEvent)=>void,
            onicecandidate?:(ev:RTCPeerConnectionIceEvent)=>void,
            onicecandidateerror?:(ev:Event)=>void,
            onnegotiationneeded:(ev:Event)=>void,
            ondatachannel:(ev:RTCDataChannelEvent)=>void,
            ondata:(ev:MessageEvent<any>, channel:RTCDataChannel, room)=>void,
            onconnectionstatechange:(ev:Event)=>void,
            oniceconnectionstatechange:(ev:Event)=>void
        }, 
        host=true
    ) => {
        if(!options.id) options.id = `rtc${Math.floor(Math.random()*1000000000000000)}`
        if(!options.config) options.config = {}
        let rtc = new RTCPeerConnection(options.config);

        if(options.channels) {
            for(const channel in options.channels) {
                if(options.channels[channel] instanceof RTCDataChannel) {
                   //OK
                }
                else if( typeof options.channels[channel] === 'object') {
                    options.channels[channel] = this.addDataChannel(rtc,channel,(options.channels as any)[channel]);
                } else options.channels[channel] = this.addDataChannel(rtc,channel);
            }
        }

        this.rtc[options.id] = {
            rtc,
            ...options
        };

        if(!options.onicecandidate) options.onicecandidate = (ev:RTCPeerConnectionIceEvent) => {
            let sdpMLineIndex = ev.candidate.sdpMLineIndex;
            let candidate = ev.candidate;

            this.run('webrtcemit',{
                origin:options.origin,
                id:options.id,
                sdpMLineIndex,
                icecandidate:candidate
            });
        }

        if(!options.ondatachannel) options.ondatachannel = (ev:RTCDataChannelEvent) => {
            this.rtc[options.id].channels[ev.channel.label] = ev.channel;
            ev.channel.onmessage = (mev) => {
                this.receive(mev.data, ev.channel, this.rtc[options.id]);
            }
        }

        rtc.ontrack = options.ontrack;
        rtc.onicecandidate = options.onicecandidate;
        rtc.onicecandidateerror = options.onicecandidateerror; 
        rtc.ondatachannel = options.ondatachannel;
        rtc.onnegotiationneeded = options.onnegotiationneeded;
        rtc.oniceconnectionstatechange = options.oniceconnectionstatechange
        rtc.onconnectionstatechange = options.onconnectionstatechange;

        if(host) {
            return new Promise((res,rej) => {
                rtc.createOffer(options.offer).then((desc) => {
                    rtc.setLocalDescription(desc).then(()=>{
                        this.rtc[options.id].description = desc;
                        res(this.rtc[options.id]); //this is to be transmitted to the user 
                    });
                });
            });
        } else {
            if(options.icecandidate) rtc.addIceCandidate(options.icecandidate);
            if(options.description) return new Promise((res,rej) => {
                rtc.setRemoteDescription(options.description).then((desc)=>{
                    rtc.createAnswer(options.answer).then(()=>{
                        this.rtc[options.id].description = desc;
                        res(this.rtc[options.id]);
                    });
                }); //we can now receive data
            });
            else return this.rtc[options.id];
        }
    }

    addUserMedia = (
        rtc:RTCPeerConnection,
        options:MediaStreamConstraints={
            audio:false,
            video:{
                optional:[
                    {minWidth: 320},
                    {minWidth: 640},
                    {minWidth: 1024},
                    {minWidth: 1280},
                    {minWidth: 1920},
                    {minWidth: 2560},
                  ]
            } as MediaTrackConstraints
        }
    ) => {
        let senders = [];
        navigator.mediaDevices.getUserMedia(options)
            .then((stream) => {
                let tracks = stream.getTracks()
                tracks.forEach((track) => {
                    senders.push(rtc.addTrack(track,stream));
                });
            }
        )

        return senders;
    }

    //add media streams to the dat channel
    addTrack = (rtc:RTCPeerConnection, track:MediaStreamTrack, stream?:MediaStream) => {
        rtc.addTrack(track,stream);
        return true;
    }

    removeTrack = (rtc:RTCPeerConnection,sender:RTCRtpSender) => {
        rtc.removeTrack(sender); //e.g. remove the senders removed by addUserMedia
    }

    addDataChannel = ( //send arbitrary strings
        rtc:RTCPeerConnection, 
        name:string,
        options:RTCDataChannelInit = { negotiated: true }
    ) => {
        return rtc.createDataChannel(name,options);
    }

    //send data on a data channel
    transmit = (data:ServiceMessage|any, channel?:string|RTCDataChannel, id?:string ) => {
        if(typeof data === 'object' || typeof data === 'number') 
            data = JSON.stringify(data); //we need strings
        
        if(!channel) { //select first channel
            let keys = Object.keys(this.rtc[id].channels)[0];
            if(keys[0])
                channel = this.rtc[id].channels[keys[0]];
        }

        if(typeof channel === 'string')  {
            if(id) {
                channel = this.rtc[id].channels[channel] as RTCDataChannel;
            } else { //send on all channels on all rooms
                for(const id in this.rtc) {
                    if(this.rtc[id].channels[channel] instanceof RTCDataChannel)
                        this.rtc[id].channels[channel].send(data);
                }
            }
        }

        if(channel instanceof RTCDataChannel)
            channel.send(data);
    }

    //close a channel
    terminate = (rtc:RTCPeerConnection|WebRTCInfo|string) => {
        if(typeof rtc === 'string') {
            let room = this.rtc[rtc];
            delete this.rtc[rtc];
            if(room) rtc = room.rtc;
        }
        else if (typeof rtc === 'object') rtc = (rtc as WebRTCInfo).rtc;
    
        if(rtc instanceof RTCPeerConnection)
            rtc.close();
    }

    routes:Routes = {
        //just echos webrtc info for server subscriptions to grab onto
        webrtcemit:(info:{id:string,label:number,candidate:string,origin:string}) => {
            return info;
        },
        openRTC:this.openRTC,
        createStream:this.createStream,
        addUserMedia:this.addUserMedia,
        addTrack:this.addTrack,
        removeTrack:this.removeTrack,
        addDataChannel:this.addDataChannel
    }

}