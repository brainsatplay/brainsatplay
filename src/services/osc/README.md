### WebsocketOSCStreaming

Simple handles for OSC data, which are just streams of arbitrary data in a sound data format

```
let oscstream = new WebsocketOSCStreaming(WebsocketClient, socketId); //supply a socket and optional preopened ports

//opens a UDP port connection for OSC streaming
oscstream.startOSC(
    localAddress,
    localPort,
    remoteAddress,
    remotePort,
    callback = (result) => {}, //one-off callback
    onupdate = (result) => {}, //per-update callback
    onframe = (result) => {}   //per-frame callback (e.g. for UI updates)
);

//send data to the other endpoint
oscstream.sendOSC(
    message='test',
    localAddress,
    localPort,
    remoteAddress,
    remotePort
)

//remove the stream
oscstream.stopOSC(
    localAddress,
    localPort,
    remoteAddress,
    remotePort
);

oscstream.subscribeToUpdates(
    remoteAddress,
    remotePort,
    onupdate = (result) => {},
    onframe = (result) => {}
); //add scripts to the data stream via statemanager

oscstream.unsubscribeAll(
    remoteAddress,
    remotePort
); //remove any state subscriptions

```

