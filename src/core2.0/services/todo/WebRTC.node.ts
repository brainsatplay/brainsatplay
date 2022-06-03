import { Service, Routes, ServiceMessage } from "../Service";

export type WebRTCPeer = {

}

export type WebRTCHost = {

}

//webrtc establishes secure P2P contexts between two users directly.
// However, we need a backend as a way to list available connections.
export class WebRTCbackend extends Service {

    name='webrtc'

    rooms:{
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

    open = (options:{
        id:string,
        origin?:string,
        config:RTCConfiguration,
        description?:RTCSessionDescriptionInit,
        offer?:RTCOfferOptions,
        ontrack?:(ev:RTCTrackEvent)=>void,
        onicecandidate?:(ev:RTCPeerConnectionIceEvent)=>void,
        onicecandidateerror?:(ev:Event)=>void,
        onnegotiationneeded:(ev:Event)=>void,
        ondatachannel:(ev:RTCDataChannelEvent)=>void,
        onconnectionstatechange:(ev:Event)=>void,
        oniceconnectionstatechange:(ev:Event)=>void
    }) => {
        if(!options.config) options.config = {}
        let rtcPeerConnection = new RTCPeerConnection(options.config);
        rtcPeerConnection.setRemoteDescription(options.description);

        if(!options.onicecandidate) options.onicecandidate = (ev:RTCPeerConnectionIceEvent) => {
            let label = ev.candidate.sdpMLineIndex;
            let candidate = ev.candidate.candidate;

            this.run('webrtcemit',{
                origin:options.origin,
                id:options.id,
                label,
                candidate
            });
        }

        rtcPeerConnection.ontrack = options.ontrack;
        rtcPeerConnection.onicecandidate = options.onicecandidate;
        rtcPeerConnection.onicecandidateerror = options.onicecandidateerror; 
        rtcPeerConnection.ondatachannel = options.ondatachannel;
        rtcPeerConnection.onnegotiationneeded = options.onnegotiationneeded;
        rtcPeerConnection.oniceconnectionstatechange = options.oniceconnectionstatechange
        rtcPeerConnection.onconnectionstatechange = options.onconnectionstatechange;

        return new Promise((res,rej) => {
            rtcPeerConnection.createOffer(options.offer).then((desc) => {
                rtcPeerConnection.setLocalDescription(desc);
                this.rooms[options.id] = {
                    rtc:rtcPeerConnection,
                    ...options
                };
                res(desc); //this is to be transmitted 
            });

        })
    }

    addTrack = (rtcPeerConnection:RTCPeerConnection, track:MediaStreamTrack, stream?:MediaStream) => {
        rtcPeerConnection.addTrack(track,stream);
        return true;
    }

    close = () => {}

    join = (options:{
        id:string,
        stream:MediaStream
    }) => {

    }

    leave = () => {} //kick/leave

    terminate = () => {}

    transmit = (message:any|ServiceMessage) => {

    }

    receive = () => {

    }

    routes:Routes = {
        //just echos webrtc info for server subscriptions to grab onto
        webrtcemit:(info:{id:string,label:number,candidate:string,origin:string}) => {
            return info;
        }
    }

}