console.log("Hello World!"); 
if(typeof window !== "undefined") 
document.body.innerHTML += "Hello World!";

document.body.insertAdjacentHTML('beforeend',`<div id='webrtc'></div>`)

//import { Router } from "../../routers/Router";
import { UserProps, UserRouter } from "../../routers/users/User.router";
import { HTTPfrontend } from "../../services/http/HTTP.browser";
import { SSEfrontend, EventSourceProps, EventSourceInfo } from "../../services/sse/SSE.browser";
import { WSSfrontend, WebSocketProps, WebSocketInfo } from '../../services/wss/WSS.browser';
import { WebRTCfrontend, WebRTCInfo, WebRTCProps } from '../../services/webrtc/WebRTC.browser';

const router = new UserRouter([
    HTTPfrontend,
    WSSfrontend,
    SSEfrontend,
    WebRTCfrontend
]);

router.run( 
    'http/listen'
);

// const hotreloadinfo = router.run('wss/openWS',{
//     host:'localhost',
//     port:8080,
//     path:'hotreload'
// } as WebSocketProps) as WebSocketInfo;

const socketinfo = router.run('wss/openWS',{
    host:'localhost',
    port:8080,
    path:'wss'
} as WebSocketProps) as WebSocketInfo;

const sseinfo = router.run('sse/openSSE',{
    url:'http://localhost:8080/sse',
    events:{
        'test':(ev)=>{console.log('test',ev.data)}
    }
} as EventSourceProps) as EventSourceInfo;

router.run(
    'http/GET',
    'http://localhost:8080/ping'
).then((res:string) => console.log("http GET", res));

let button = document.createElement('button');
button.innerHTML = 'ping!';
button.onclick = () => {
    router.run(
        'http/GET',
        'http://localhost:8080/ping'
    ).then((res:string) => console.log("http GET", res));
}

document.body.appendChild(button);


console.log("Router:",router);

//console.log(router,socketinfo,sseinfo);

//send ping via xhr to http server,
//receive pong through SSE and WS
console.log('adding user')
let p = router.addUser(
    {
        sockets:{
            [socketinfo.address]:socketinfo
            // 'ws':{ //declare props too
            //     host:'localhost',
            //     port:8080,
            //     path:'wss'
            // } as WebSocketProps
        },
        eventsources:{
            [sseinfo.url]:sseinfo
            // 'sse':{
            //     url:'http://localhost:8080/sse',
            //     events:{
            //         'test':(ev)=>{console.log('test',ev.data)}
            //     }
            // } as EventSourceProps
        }
    } as UserProps
).then((user:UserProps) => {
    //connected user, trigger backend to add the same user id
    console.log("Added user:", user);
    let info = router.getConnectionInfo(user);

    router.subscribe('joinSession',(res) => {
        console.log('joinSessions fired', res);
        if(res?.settings.name === 'webrtcrooms') {
            (router.services.webrtc as WebRTCfrontend).openRTC({origin:user._id} as WebRTCProps).then((room:WebRTCInfo) => {
                room.rtc.addEventListener('icecandidate',(ev)=>{
                    if(ev.candidate) {
                        if(!user.rooms) user.rooms = {};
                        if(!user.rooms[room._id]) {
                            if(!room.icecandidates) room.icecandidates = {};
                            user.rooms[room._id] = {
                                _id:room._id,
                                icecandidates:room.icecandidates
                            }
                        }
                        else user.rooms[room._id].icecandidates[`candidate${Math.floor(Math.random()*1000000000000000)}`] = ev.candidate;
                        //in another client, join this session
                        //need to send this info to the server which should happen automatically via the userupdateloop
                    }
                })
            });

                    
            let us = {};
            router.subscribeToSession('webrtcrooms',user._id,(res)=>{
                console.log(res)
                if(Object.keys(res.data.shared).length > 0) {
                    //console.log(res.data.shared);
                    let k = 0;
                    for(const key in res.data.shared) {
                        let u = res.data.shared[key];
                        if(u.rooms && !us[key]) {
                            document
                            .getElementById('webrtc')
                            .insertAdjacentHTML(
                                'beforeend',
                                `<div><span>User: ${key}</span><span>Rooms: <table>${Object.keys(u.rooms).map((room:any) => { return `<tr><td>ID: ${u.rooms[room]._id}</td><td>Ice Candidates: ${u.rooms[room].icecandidates ? Object.keys(u.rooms[room].icecandidates).length : 0 }</td>${user._id !== key ? `<td><button id='${u.rooms[room]._id}'>Connect</button></td>` : ``}</tr>`; })}</table></span></div>`
                                )
                            us[key] = true;
                        }
                    }
                }

            })

        }
    })


    user.send(JSON.stringify({route:'addUser',args:info}));
    
    router.run('userUpdateLoop',user); //initialize the user updates 

    // user.request({route:'getSessionInfo'}).then((res) => {
    //     console.log('getSessionInfo',res);
    // });

    user.request({route:'openSharedSession',args:{settings:{name:'testsession',propnames:{x:true, test:true}}}})
        .then(session => {
            let res;
            if(session?._id) res = router.run('joinSession',session._id,user,session); //this will call the state
            //console.log(res);
            //send session data over webrtc data channel

        });
    // router.run(
    //     'http/POST',
    //     info,
    //     'http://localhost:8080/addUser'
    // );
});

console.log(p);

