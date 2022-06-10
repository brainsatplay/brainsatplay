import { Service, Routes, ServiceMessage } from "../Service";

export type WebRTCProps = {
    _id?:string,
    origin:string,
    channels?:{
        [key:string]:(true|RTCDataChannelInit|RTCDataChannel)
    },
    config?:RTCConfiguration,
    hostdescription?:RTCSessionDescriptionInit,
    peerdescription?:RTCSessionDescriptionInit,
    offer?:RTCOfferOptions,
    hostcandidates?:{[key:string]:RTCIceCandidate},
    peercandidates?:{[key:string]:RTCIceCandidate},
    answer?:RTCAnswerOptions,
    ontrack?:(ev:RTCTrackEvent)=>void,
    onicecandidate?:(ev:RTCPeerConnectionIceEvent)=>void,
    onicecandidateerror?:(ev:Event)=>void,
    onnegotiationneeded?:(ev:Event)=>void,
    ondatachannel?:(ev:RTCDataChannelEvent)=>void,
    ondata?:(ev:MessageEvent<any>, channel:RTCDataChannel, room)=>void,
    onconnectionstatechange?:(ev:Event)=>void,
    oniceconnectionstatechange?:(ev:Event)=>void
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

    openRTC = async (
        options?:WebRTCProps
    ):Promise<WebRTCInfo> => {
        if(!options._id) options._id = `rtc${Math.floor(Math.random()*1000000000000000)}`
        if(!options.config) options.config = {}
        let rtc = new RTCPeerConnection(options.config);

        if(!options.channels) options.channels = { 'data':true }; //need one channel at least for the default service stuff to work
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

        this.rtc[options._id] = {
            rtc,
            _id:options._id,
            ...options
        };

        //console.log('opening webrtc channel',this.rtc)


        if(!options.ondatachannel) options.ondatachannel = (ev:RTCDataChannelEvent) => {
            this.rtc[options._id].channels[ev.channel.label] = ev.channel;
            if(!options.ondata)
                ev.channel.onmessage = (mev) => {
                    this.receive(mev.data, ev.channel, this.rtc[options._id]);
                }
            else ev.channel.onmessage = (mev) => { options.ondata(mev.data, ev.channel, this.rtc[options._id]); }
        }

        rtc.ontrack = options.ontrack;
        rtc.onicecandidate = options.onicecandidate;
        rtc.onicecandidateerror = options.onicecandidateerror; 
        rtc.ondatachannel = options.ondatachannel;
        rtc.onnegotiationneeded = options.onnegotiationneeded;
        rtc.oniceconnectionstatechange = options.oniceconnectionstatechange
        rtc.onconnectionstatechange = options.onconnectionstatechange;
    
        if(options.hostdescription)   {
            if(!options.onicecandidate) options.onicecandidate = (ev:RTCPeerConnectionIceEvent) => {
                if(ev.candidate) {
                    let icecandidate = ev.candidate; 
    
                    if(!this.rtc[options._id].peercandidates) this.rtc[options._id].peercandidates = {};
                    this.rtc[options._id].peercandidates[`peercandidate${Math.floor(Math.random()*1000000000000000)}`] = icecandidate;
    
                }
            }
    
            return await new Promise((res,rej) => {
                options.hostdescription.sdp = (options.hostdescription.sdp as any).replaceAll('rn',`\r\n`); //fix the jsonified newlines
                rtc.setRemoteDescription(options.hostdescription).then((desc)=>{
                    if(options.hostcandidates) {
                        for(const prop in options.hostcandidates) {
                            rtc.addIceCandidate(options.hostcandidates[prop]);
                        }
                    }
                    rtc.createAnswer(options.answer).then((answer)=>{
                        rtc.setLocalDescription(answer).then(()=>{
                            console.log(answer, desc, answer)
                            this.rtc[options._id].peerdescription = answer;
                            res(this.rtc[options._id]);

                        });
                    });
                }); //we can now receive data
            });
        }
    
        if(options.peerdescription)  {
            return await new Promise((res,rej) => {
                options.peerdescription.sdp = (options.peerdescription.sdp as any).replaceAll('rn',`\r\n`); //fix the jsonified newlines
                rtc.setRemoteDescription(options.peerdescription).then(()=>{
                    if(options.peercandidates) {
                        for(const prop in options.peercandidates) {
                            rtc.addIceCandidate(options.peercandidates[prop]);
                        }
                    }
                    rtc.createAnswer(options.answer).then((answer)=>{
                        rtc.setLocalDescription(answer).then(()=>{
                            this.rtc[options._id].peerdescription = answer;
                            res(this.rtc[options._id]);

                        });
                    });
                }); //we can now receive data
            });
        }

        if(!options.onicecandidate && !this.rtc[options._id]?.onicecandidate) options.onicecandidate = (ev:RTCPeerConnectionIceEvent) => {
            if(ev.candidate) {
                let icecandidate = ev.candidate; 

                if(!this.rtc[options._id].hostcandidates) this.rtc[options._id].hostcandidates = {};
                this.rtc[options._id].hostcandidates[`hostcandidate${Math.floor(Math.random()*1000000000000000)}`] = icecandidate;

            }
        }

        return await new Promise((res,rej) => {
            rtc.createOffer(options.offer).then((offer) => {
                rtc.setLocalDescription(offer).then(()=>{
                    this.rtc[options._id].hostdescription = offer;
                    res(this.rtc[options._id]); //this is to be transmitted to the user 
                });
            });
        });
        
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
        options?:RTCDataChannelInit//{ negotiated: false }
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

    request = (message:ServiceMessage|any, channel:RTCDataChannel, _id:string, origin?:string, method?:string) => { //return a promise which can resolve with a server route result through the socket
        let callbackId = `${Math.random()}`;
        let req:any = {route:'webrtc/runRequest', args:[message,_id,callbackId]};
        if(method) req.method = method;
        if(origin) req.origin = origin;
        return new Promise((res,rej) => {
            let onmessage = (ev:any) => {
                let data = ev.data;
                if(typeof data === 'string') if(data.includes('callbackId')) data = JSON.parse(data);
                if(data instanceof Object) if(data.callbackId === callbackId) {
                    channel.removeEventListener('message',onmessage);
                    res(data.args);
                }
            }

            channel.addEventListener('message',onmessage);
            channel.send(JSON.stringify(req));
        })
    }

    runRequest = (message:any, channel:RTCDataChannel|string, callbackId:string|number) => { //send result back
        let res = this.receive(message);
        if(channel) {
            if(Object.getPrototypeOf(channel) === String.prototype) {
                for(const key in this.rtc) {
                    if(key === channel) {channel = this.rtc[key].channels.data; break;}
                }
            }
            if(res instanceof Promise)
                res.then((v) => {
                    res = {args:v, callbackId};

                    if(channel instanceof RTCDataChannel) channel.send(JSON.stringify(res));
                    
                    return res;
                })
            else {
                res = {args:res, callbackId};
                if(channel instanceof RTCDataChannel) channel.send(JSON.stringify(res));
            }
        }
        return res;
    }
    
    routes:Routes = {
        //just echos webrtc info for server subscriptions to grab onto
        openRTC:this.openRTC,
        request:this.request,
        runRequest:this.runRequest,
        createStream:this.createStream,
        addUserMedia:this.addUserMedia,
        addTrack:this.addTrack,
        removeTrack:this.removeTrack,
        addDataChannel:this.addDataChannel
    }

}