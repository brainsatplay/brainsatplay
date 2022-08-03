import { Service, Routes, ServiceMessage, ServiceOptions } from "../Service";

export type WebRTCProps = {
    _id?:string,
    origin?:string,
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
    rtcTransmit:RTCPeerConnection,
    rtcReceive:RTCPeerConnection
} & WebRTCProps

//webrtc establishes secure P2P contexts between two users directly.
// However, we need a backend as a way to list available connections.
export class WebRTCfrontend extends Service {

    name='webrtc'

    rtc:{
        [key:string]:any
    } = {}

    iceServers:{urls:string[]}[] = [
        { urls: ['stun:stun.l.google.com:19302'] },
        { urls: ['stun:stun1.l.google.com:19302'] },
        { urls: ['stun:stun2.l.google.com:19302'] },
        { urls: ['stun:stun3.l.google.com:19302'] },
        { urls: ['stun:stun4.l.google.com:19302'] }
    ];

    constructor(
        options?:ServiceOptions, 
        iceServers?:{urls:string[]}[] 
    ) {
        super(options);
        this.load(this.routes);

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
        if(!options) options = {};
        if(!options._id) options._id = `rtc${Math.floor(Math.random()*1000000000000000)}`;
        if(!options.config) options.config = {iceServers:this.iceServers};
        
        let rtcTransmit = new RTCPeerConnection(options.config);
        let rtcReceive = new RTCPeerConnection(options.config);

        if(!options.channels) options.channels = { 'data':true }; //need one channel at least for the default service stuff to work
        if(options.channels) {
            for(const channel in options.channels) {
                if(options.channels[channel] instanceof RTCDataChannel) {
                   //OK
                }
                else if( typeof options.channels[channel] === 'object') {
                    options.channels[channel] = this.addDataChannel(rtcTransmit,channel,(options.channels as any)[channel]);
                } else options.channels[channel] = this.addDataChannel(rtcTransmit,channel);
            }
        } 

        if(!this.rtc[options._id]) {
            this.rtc[options._id] = {
                rtcTransmit,
                rtcReceive,
                _id:options._id,
                ...options
            }
        } else {
            Object.assign(this.rtc[options._id],options);
        }

        //console.log('opening webrtc channel',this.rtc)
        if(!options.ondatachannel) options.ondatachannel = (ev:RTCDataChannelEvent) => {
            this.rtc[(options as any)._id].channels[ev.channel.label] = ev.channel;
            if(!(options as any).ondata)
                ev.channel.onmessage = (mev) => {
                    this.receive(mev.data, ev.channel, this.rtc[(options as any)._id]);
                }
            else ev.channel.onmessage = (mev) => { (options as any).ondata(mev.data, ev.channel, this.rtc[(options as any)._id]); }
        }

        rtcTransmit.ontrack = options.ontrack as any;
        rtcTransmit.onicecandidate = options.onicecandidate as any;
        rtcTransmit.onicecandidateerror = options.onicecandidateerror as any; 
        rtcTransmit.ondatachannel = options.ondatachannel as any; 
        rtcTransmit.onnegotiationneeded = options.onnegotiationneeded as any; 
        rtcTransmit.oniceconnectionstatechange = options.oniceconnectionstatechange as any; 
        rtcTransmit.onconnectionstatechange = options.onconnectionstatechange as any; 
        rtcReceive.ontrack = options.ontrack as any; 
        rtcReceive.onicecandidate = options.onicecandidate as any; 
        rtcReceive.onicecandidateerror = options.onicecandidateerror as any;  
        rtcReceive.ondatachannel = options.ondatachannel as any; 
        rtcReceive.onnegotiationneeded = options.onnegotiationneeded as any; 
        rtcReceive.oniceconnectionstatechange = options.oniceconnectionstatechange as any; 
        rtcReceive.onconnectionstatechange = options.onconnectionstatechange as any; 
    
        if(options.hostdescription && !options.peerdescription)   {
            if(!options.onicecandidate) options.onicecandidate = (ev:RTCPeerConnectionIceEvent) => {
                if(ev.candidate) {
                    let icecandidate = ev.candidate; 
    
                    if(!this.rtc[(options as any)._id].peercandidates) this.rtc[(options as any)._id].peercandidates = {};
                    this.rtc[(options as any)._id].peercandidates[`peercandidate${Math.floor(Math.random()*1000000000000000)}`] = icecandidate;
    
                }
            }
    
        // console.log(options.hostdescription)
            return await new Promise((res,rej) => {
                (options as any).hostdescription.sdp = ((options as any).hostdescription.sdp as any).replaceAll('rn',`\r\n`); //fix the jsonified newlines
                //console.log(options.hostdescription);
                rtcReceive.setRemoteDescription((options as any).hostdescription).then((desc)=>{
                    if((options as any).hostcandidates) {
                        for(const prop in (options as any).hostcandidates) {
                            rtcReceive.addIceCandidate((options as any).hostcandidates[prop]);
                        }
                    }
                    rtcReceive.createAnswer((options as any).answer).then((answer)=>{
                        rtcReceive.setLocalDescription(answer).then(()=>{
                            //console.log(answer, desc, answer)
                            this.rtc[(options as any)._id].peerdescription =  {type:(rtcReceive as any).localDescription.type,sdp:(rtcReceive as any).localDescription.sdp};
                            res(this.rtc[(options as any)._id]);

                        });
                    });
                }); //we can now receive data
            });
        }
    
        if(options.peerdescription)  {
            
            return await new Promise((res,rej) => {
                (options as any).peerdescription.sdp = ((options as any).peerdescription.sdp as any).replaceAll('rn',`\r\n`); //fix the jsonified newlines
                rtcReceive.setRemoteDescription((options as any).peerdescription).then(()=>{
                    if((options as any).peercandidates) {
                        for(const prop in (options as any).peercandidates) {
                            rtcReceive.addIceCandidate((options as any).peercandidates[prop]);
                        }
                    }
                    res(this.rtc[(options as any)._id]);
                }); //we can now receive data
            });
        }

        if(!options.onicecandidate && !this.rtc[options._id]?.onicecandidate) options.onicecandidate = (ev:RTCPeerConnectionIceEvent) => {
            if(ev.candidate) {
                let icecandidate = ev.candidate; 

                if(!this.rtc[(options as any)._id].hostcandidates) this.rtc[(options as any)._id].hostcandidates = {};
                this.rtc[(options as any)._id].hostcandidates[`hostcandidate${Math.floor(Math.random()*1000000000000000)}`] = icecandidate;

            }
        }

        return await new Promise((res,rej) => {
            rtcTransmit.createOffer((options as any).offer).then((offer) => {
                rtcTransmit.setLocalDescription(offer).then(()=>{
                    this.rtc[(options as any)._id as string].hostdescription = {type:offer.type,sdp:offer.sdp};
                    res(this.rtc[(options as any)._id as string]); //this is to be transmitted to the user 
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
        let senders:any[] = [];
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
    addTrack = (rtc:RTCPeerConnection, track:MediaStreamTrack, stream:MediaStream) => {
        rtc.addTrack(track,stream);
        return true;
    }

    removeTrack = (rtc:RTCPeerConnection,sender:RTCRtpSender) => {
        rtc.removeTrack(sender); //e.g. remove the senders removed by addUserMedia
        return true;
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
        
        if(!channel && id) { //select first channel
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
    
        return true;
    }

    //close a channel
    terminate = (rtc:RTCPeerConnection|WebRTCInfo|string) => {
        let rx, tx;
        if(typeof rtc === 'string') {
            let room = this.rtc[rtc];
            delete this.rtc[rtc];
            if(room) {
                tx = room.rtcTransmit;
                rx = room.rtcReceive;
            }
        }
        else if (typeof rtc === 'object') {
            tx = (rtc as WebRTCInfo).rtcTransmit;
            rx = (rtc as WebRTCInfo).rtcReceive;
        }
    
        if(rtc instanceof RTCPeerConnection) {
            rtc.close();
        } else if(rx || tx) {
            if(rx) rx.close();
            if(tx) tx.close();
        }

        return true;
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
                if(typeof data === 'object') if(data.callbackId === callbackId) {
                    channel.removeEventListener('message',onmessage);
                    res(data.args);
                }
            }

            channel.addEventListener('message',onmessage);
            channel.send(JSON.stringify(req));
        });
    }

    runRequest = (message:any, channel:RTCDataChannel|string, callbackId:string|number) => { //send result back
        let res = this.receive(message);
        if(channel) {
            if(typeof channel === 'string') {
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