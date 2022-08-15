---
sidebar_position: 5
title: datastreams-api
---

# datastreams-api
`datastreams-api` is a great way to **standarize real-time data inputs** in your `brainsatplay` application.

```javascript
// ---------- Imports ----------
// brainsatplay Import
import * as brainsatplay from "https://cdn.jsdelivr.net/npm/brainsatplay@latest/dist/index.esm.js"

// datastreams-api Import
import * as datastreams from "https://cdn.jsdelivr.net/npm/datastreams-api@latest/dist/index.esm.js"
import device from "https://cdn.jsdelivr.net/npm/@brainsatplay/device@latest/dist/index.esm.js"


// ---------- Basic Setup ----------
const graphs = []

// ---------- Handle New Data ----------
const ondata = (data) => console.log(data)

// ---------- Handle New Tracks ----------
const ontrack = (track) => {
    const graph = new brainsatplay.Graph({tag: track.contentHint, operator: ondata})
    track.subscribe(data => graph.run(data))
    graphs.push(graph) // add to registry

    // Subscribe Data Callback
    graph.subscribe(ondata)
}

// ---------- Start Acquisition ----------
const devices = new datastreams.DataDevices()
devices.getUserDevice(device).then(o => {
    o.stream.tracks.forEach(ontrack)
    stream.onaddtrack = e => handleTrack(e.track)
})
```

You can find more information about this library [here](https://github.com/brainsatplay/datastreams-api).