# Routers

Routers are used to quickly collect services into one unified framework used to quickly define which outputs from which functions you want to pipe through remote or internal services in a unified fashion. You can simply call services by name or access their class methods directly, and run functions on the router the same way they function in the node and graph, just with a higher level way to allow services to have awareness of each other. 

Additionally, it includes ways to select the fastest available endpoints from selected services and automatically stream updates from watched objects through whatever routes or endpoints you desire e.g. for linking game and server state across many clients or simplifying frontend business logic down to a few object and function calls.


Backend:
```ts


let router = new Router([
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
                    hotreload:'ws://localhost:8080/hotreload' //you can add routes that are either template strings or functions accepting arguments (like the above url) to inject into pages. You can even specify which pages are injected with which templates, or build entire pages from a mix of hand coded and prewritten components (IDK it's cool)
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

```

Frontend:
```ts


const router = new Router([
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


console.log("Router:",router);


```


# User Router

This is where the router really shines. You can create users and shared remote data sessions in just a few lines, where every user is automatically associated with their endpoints and then efficient checks are used to only update data as necessary over private or async or sync group sessions (i.e. where only one user or all users share data).


Backend:
```ts

let router = new UserRouter([
    HTTPbackend,
    WSSbackend,
    SSEbackend
]);

router.addUser({ //e.g. we can have an admin user to build controls for ourselves
    _id:'admin'
} as UserProps);

router.run('sessionLoop'); //run the loop to check session updates and pipe to users automatically

let session = router.openSharedSession({
    _id:'webrtcrooms',
    settings:{
        name:'webrtcrooms',
        propnames:{
            rooms:true //if these props are updated on the user object locally then we'll return them to the rest of the users (or to the host if hosted). the user's app needs to track updates independently and stream them, the functions we give will autocorrect based on user updates (incl if they leave the session) and otherwise use minimal bandwidth.
        }  
    }
},'admin');

///console.log('session',session, 'sessions', router.sessions);

router.subscribe('addUser', (res) =>{ //we are going to automatically add every new user to a session to show available webrtc rooms from users and connect them to each other
    //console.log('user joining webrtcrooms', res._id);
    if (typeof res === 'object') {
        let user = res;
        let joined = router.joinSession('webrtcrooms',user);
        
        if(joined) {
            user.send(
                JSON.stringify({route:'joinSession',args:[joined._id,user._id,joined]})
            );
     }
    }
})


```

Then frontend again, this is bugged right now in the example but you get the idea:
```ts


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
                room.rtcTransmit.addEventListener('icecandidate',(ev)=>{
                    if(ev.candidate) {
                        if(!user.rooms) user.rooms = {};
                        if(!user.rooms[room._id]) {
                            if(!room.hostcandidates) room.hostcandidates = {};
                            //console.log(room)
                            user.rooms[room._id] = {
                                _id:room._id,
                                hostdescription:room.hostdescription,
                                hostcandidates:room.hostcandidates
                            }
                        }
                        else {
                            user.rooms[room._id].hostdescription = room.hostdescription;
                            user.rooms[room._id].hostcandidates[`hostcandidate${Math.floor(Math.random()*1000000000000000)}`] = ev.candidate;
                        }
                            //in another client, join this session
                        //need to send this info to the server which should happen automatically via the userupdateloop
                    }
                })
            });

                    
            let us = {};
            router.subscribeToSession('webrtcrooms',user._id,(res)=>{
                if(Object.keys(res.data.shared).length > 0) {
                    //console.log(res.data.shared);
                    for(const key in res.data.shared) {
                        let u = res.data.shared[key];
                        if(u.rooms) {
                            for(const r in u.rooms) {
                                if(us[key]) {
                                    if(!us[key][r]?.peerdescription && u.rooms[r].peerdescription) {
                                        //console.log(u.rooms[r],router.services.webrtc.rtc)
                                        console.log(u.rooms[r],us[key][r]);
                                        (router.services.webrtc as WebRTCfrontend).openRTC(u.rooms[r] as WebRTCProps).then((room:WebRTCInfo) => { //this will confirm the peer connection
                                            console.log('got peer description, connection is live')
                                        })
                                    }  
                                }
                            }
                        }
                        if(u.rooms && !us[key]) {
                            document
                            .getElementById('webrtc')
                            .insertAdjacentHTML(
                                'beforeend',
                                `<div><span>User: ${key}</span><span>Rooms: <table>${Object.keys(u.rooms).map((room:any) => { return `<tr><td>ID: ${u.rooms[room]._id}</td><td>Ice Candidates: ${u.rooms[room].hostcandidates ? Object.keys(u.rooms[room].hostcandidates).length : 0 }</td>${user._id !== key ? `<td><button id='${u.rooms[room]._id}'>Connect</button></td>` : ``}</tr>`; })}</table></span></div>`
                                )
                            us[key] = true;

                            if(user._id !== key) Object.keys(u.rooms).map((roomid:any) => {
                                document.getElementById(u.rooms[roomid]._id).onclick = () => {
                                    (router.services.webrtc as WebRTCfrontend).openRTC(u.rooms[roomid] as WebRTCProps).then((room:WebRTCInfo) => {
                                        room.rtcReceive.addEventListener('icecandidate',(ev)=>{
                                            if(ev.candidate) {
                                                //console.log(room);
                                                if(!user.rooms) user.rooms = {};
                                                if(!user.rooms[room._id]) {
                                                    if(!room.peercandidates) room.peercandidates = {};
                                                    user.rooms[room._id] = {
                                                        _id:room._id,
                                                        peerdescription:room.peerdescription,
                                                        peercandidates:room.peercandidates
                                                    }
                                                }
                                                else {
                                                    user.rooms[room._id].peerdescription = room.peerdescription;
                                                    user.rooms[room._id].peercandidates[`peercandidate${Math.floor(Math.random()*1000000000000000)}`] = ev.candidate;
                                                }
                                                //in another client, join this session
                                                //need to send this info to the server which should happen automatically via the userupdateloop
                                            }
                                        })
                                        //console.log('connected to peer, waiting for handshake')
                                        document.getElementById(u.rooms[roomid]._id).innerHTML = 'Ping!';                                            
                                        // document.getElementById(u.rooms[roomid]._id).innerHTML = 'Disconnect';
                                        document.getElementById(u.rooms[roomid]._id).onclick = () => {
                                            (router.services.webrtc as WebRTCfrontend).request({route:'ping',origin:user._id},room.channels.data as RTCDataChannel,room._id)

                                            // (router.services.webrtc as WebRTCfrontend).terminate(room);
                                            // console.log('terminated', room._id);
                                        }
                                    })
                                }
                            })
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

```






Mmmmagic


