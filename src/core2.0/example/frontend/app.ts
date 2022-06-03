console.log("Hello World!"); 
if(typeof window !== "undefined") 
document.body.innerHTML += "Hello World!";

//import { Router } from "../../routers/Router";
import { UserRouter } from "../../routers/users/User.router";
import { HTTPfrontend } from "../../services/http/HTTP.browser";
import { SSEfrontend, EventSourceProps, EventSourceInfo } from "../../services/sse/SSE.browser";
import { WSSfrontend, WebSocketProps, WebSocketInfo } from '../../services/wss/WSS.browser';

const router = new UserRouter([
    HTTPfrontend,
    WSSfrontend,
    SSEfrontend
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