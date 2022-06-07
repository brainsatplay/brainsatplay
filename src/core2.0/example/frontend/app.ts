console.log("Hello World!"); 
if(typeof window !== "undefined") 
document.body.innerHTML += "Hello World!";

//import { Router } from "../../routers/Router";
import { UserProps, UserRouter } from "../../routers/users/User.router";
import { HTTPfrontend } from "../../services/http/HTTP.browser";
import { SSEfrontend, EventSourceProps, EventSourceInfo } from "../../services/sse/SSE.browser";
import { WSSfrontend, WebSocketProps, WebSocketInfo } from '../../services/wss/WSS.browser';
import { WebRTCfrontend, WebRTCInfo } from '../../services/webrtc/WebRTC.browser';

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

//console.log(router,socketinfo,sseinfo);

//send ping via xhr to http server,
//receive pong through SSE and WS

router.addUser(
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
        if(res?.name === 'webrtcrooms') {
            (router.webrtc as WebRTCfrontend).openRTC({origin:user._id}).then((room:WebRTCInfo) => {
                if(room.icecandidate) {
                    let obj = {
                        _id:room._id,
                        origin:room.origin,
                        icecandidate:room.icecandidate
                    }
                    if(!user.rooms) user.rooms = {};
                    else user.rooms = { [obj._id]:obj };
                }
            })
        }
    })

    user.send(JSON.stringify({route:'addUser',args:info}));
    
    router.run('userUpdateLoop',user); //initialize the user updates 

    user.request({route:'getSessionInfo'}).then((res) => {
        console.log(res);
    });

    user.request({route:'openSharedSession',args:[{settings:{name:'testsession',propnames:{x:true, test:true}}}]})
        .then(session => {
            let res = router.joinSession(session._id,user,session);
            console.log(res);
        });
    // router.run(
    //     'http/POST',
    //     info,
    //     'http://localhost:8080/addUser'
    // );
});