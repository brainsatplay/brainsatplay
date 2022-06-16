function exitHandler(options, exitCode) {
        
    if (exitCode || exitCode === 0) console.log('SERVER EXITED WITH CODE: ',exitCode);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//run backends
//import { Router } from "../../routers/Router";
import { UserProps, UserRouter } from "../../routers/users/User.router";
import { HTTPbackend, ServerProps, ServerInfo } from '../../services/http/HTTP.node';
import { SSEbackend, SSEProps } from '../../services/sse/SSE.node';
import { WSSbackend, SocketServerProps } from '../../services/wss/WSS.node';

import fs from 'fs'

fs.readdirSync('./')

//create http server
//create wss
//create sse
//create webrtc

//send messages to each endpoint from each other endpoint on frontend and backend

//send same message from each endpoint and get same result out of each endpoint

let router = new UserRouter([
    HTTPbackend,
    WSSbackend,
    SSEbackend
]);

//when ping is run it should pong through wss and sse now

//console.log(router);

router.run(
    'http/setupServer',
    {
        protocol:'http',
        host:'localhost',
        port:8080,
        startpage:'index.html',
        // certpath:'cert.pem', 
        // keypath:'key.pem',
        // passphrase:'encryption',
        //errpage:undefined,
        pageOptions:{
            all:{
                inject:{
                    hotreload:'ws://localhost:8080/hotreload'
                }
            }
        }
    } as ServerProps
).then((served:ServerInfo) => { //this function returns a promise so we can use .then, only explicitly async or promise-returning functions can be awaited or .then'd for good performance!
    
    const socketserver = router.run(
        'wss/setupWSS',
        {
            server:served.server,
            host:served.host,
            port:8081,
            path:'wss',
            onconnection:(ws,req,serverinfo,id)=>{
                ws.send('Hello from WSS!');
            }
        } as SocketServerProps
    );
    
    const hotreload = router.run(
        'wss/setupWSS',
        {
            server:served.server,
            host:served.host,
            port:7000,
            path:'hotreload',
            onconnection:(ws)=>{
                ws.send('Hot reload port opened!');
            }
        } as SocketServerProps
    );

    const sseinfo = router.run(
        'sse/setupSSE',
        {
            server:served.server,
            path:'sse',
            channels:['test'],
            onconnection:(session,sseinfo,id,req,res)=>{
                console.log('pushing sse!')
                session.push('Hello from SSE!');
                sseinfo.channels.forEach(
                    (c:string) => sseinfo.channel.broadcast(
                        'SSE connection at '+req.headers.host+'/'+req.url, c 
                    )
                );
            },
        } as SSEProps
    )

    //console.log(socketserver);
    //console.log(sseinfo)
}); //make a default server
//router.services.http.run('setupServer');
//router.services.http.setupServer();
//router.services.http.routes.setupServer();
//router.routes.['http/setupServer'](); //this the original function/property object, it won't set state.

console.log('main service routes',router.service.routes);
console.log('http service routes',router.services.http.routes);

const sub1 = router.pipe('ping','log','wss');
const sub2 = router.pipe('ping','log','sse');

router.addUser({
    _id:'admin'
} as UserProps);

router.run('sessionLoop');

let session = router.openSharedSession({
    _id:'webrtcrooms',
    settings:{
        name:'webrtcrooms',
        propnames:{
            rooms:true //if these props are updated on the user object we'll return them
        }  
    }
},'admin');

///console.log('session',session, 'sessions', router.sessions);

router.subscribe('addUser', (res) =>{
    //console.log('user joining webrtcrooms', res._id);
    if (res instanceof Object) {
        let user = res;
        let joined = router.joinSession('webrtcrooms',user);
        
        if(joined) {
            user.send(
                JSON.stringify({route:'joinSession',args:[joined._id,user._id,joined]})
            );
     }
    }
})

//elegantly represent users connecting and adding themselves to the backend incl settings their sockets etc. that they're reporting from