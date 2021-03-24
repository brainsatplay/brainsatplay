# brainsatplay.js

Contains the brainsatplay login/streaming class along with its dependencies in the deviceStream class and the dataAtlas class.

* `let bci = new brainsatplay(login,password)`
Create a brainsatplay session which contains many important macros for ease of use.
* `bci.login(false)`
Log in and set whether to begin streaming data or not to true if your device is already connected and you want to begin streaming data (optional)
* `bci.signup({username:'',password:''}`
Sign up for brainsatplay's servers
* `bci.connect("muse",['eegfft'],onconnect,true,[['eegch','FP1,'all']['eegfft','FP1','all']])`
For streaming data to web. Use an arrow function for the onconnect callback to subscribe to device parameters and make the UI react.
* `bci.connect("muse,['eegcoherence'],onconnect)` 
For local only streaming
* `bci.disconnect(0,ondisconnect)` 
Disconnect device, you can specify a device index (or just disconnect the last one connected since you are usually only using one locally) and an ondisconnect callback or leave blank.
* `bci.getDeviceData('eeg','all')`
Returns the specified data object can return the full dataset for the device or just specified properties. If an object is returned you can save it to reference it in animations while it gets automatically updated in the atlas.
* `bci.getStreamData('userOrAppname',propname)`
Returns data from user or game subscriptions by name. Leave propname blank to return all data from that subscription.
* `bci.sendWSCommand(command)` 
Send commands to the server, see the dataServer doc for available commands and expected arguments.
* `bci.subscribeToUser(username,['eegch','FP1'],onsuccess)` 
Subscribe to a user's data from the server (must be logged in)
* `bci.subscribeToGame(appname,spectating=false,onsuccess)` Subscribe to a game, if you are not a spectator you must have a compatible device connected and stream parameters will be configured for you automatically. Set an onsuccess callback for UI handling, new data will be available in `bci.state.data`
* `bci.unsubscribeFromUser(username,props=null,onsuccess)`
Unsubscribe from the selected user, you can optionally only unsubscribe from selected props. This will unsubscribe any additional event listeners.
* `bci.unsubsribeFromGame(appname,onsuccess)` 
Leave and unsubscribe from the selected game. Set an onsuccess callback for UI handling
* `bci.beginStream(deviceIdx,streamParams)` 
Set the selected device (by index, leave undefined if just one device connected) to begin streaming and set any new stream parameters if needed (optional)
* `bci.addStreamFunc(name,callback,idx=0)`
Add a looping function to the stream so you can add custom parameters.
Parameters are given to the stream like ['callbackname','arg1','arg2'] where arguments are given to the callback function named in the first index.
* `let sub = bci.subscribe(deviceName,tag,prop,onData)`
Subscribe to a data property in the selected device. Leave prop null to subscribe to a full data object specified by tag. Returns an index used to unsubscribe later.
* `bci.unsubscribe(tag,sub)`
Unsubscribe the device using the correct tag and the sub value
* `bci.unsubscribeAll(tag)`
Remove all subscriptions for a set tag, this kills the event listener loop to save performance.
* `bci.getData(tag,deviceType)`
Get data objects based on tag ('FP1','FP2') and device type ('eeg' or 'heg' or leave blank for eeg) 
* `bci.addAnalyzerFunc(prop,callback)`
Add additional callbacks for processing and sorting data as new data comes in on an event loop in the data atlas. Then you can set stream params like [prop,tag,arg1,arg2] depending on how many arguments your function requires, the prop and tag are necessary, use arg1 to specify amount of sample to use per loop (I use 'all' to grab the latest data but you need to set your own configurations)
* `bci.configStreamForGame(deviceNames,streamParams)`
Configure devices for streaming. You can set multiple parameters for multiple devices as params are to be specified by device 'eeg' or 'heg' etc.



# deviceStream class

These can be used standalone to get data from desired devices. Devices like the FreeEEG32 come with multiple popular configurations so they have multiple presets (freeeeg32,freeeg32_2,freeeeg32_19).

* `let device = new deviceStream('freeeg32_2',analysis=['eegcoherence'],useFilters=true,pipeToAtlas=true,streaming=false,socket=null,streamParams=[], auth={username:username})` Only specify the device name and analysis for local streaming and data processing. You can set if you want to use biquad filters automatically on input data, whether to use a data atlas (which can be set to another data atlas to keep all data in one object), and whether to stream (specify the socket and stream parameters and username)

* `device.connect()` Run the connect function for the configured device, which can create a USB or Bluetooth or other connection. Callbacks are set to automatically parse data into the atlas if specified.

* `device.addDeviceCompatibility = (props={deviceName:'', deviceType:'eeg', sps:0}, init = () => {}, connect = () => {}, disconnect = () => {})` You can add unofficial support for any types of devices we've built features for (currently eeg, next heg and acclerometers, ecg, temp, etc). Set the initialization and connect functions, you need to look at how the other devices are implemented in the deviceStream class to replicate those features for the automated data processing and streaming functions.

There are more functions for configuring streaming, and a streamloop function to run on repeat to send data out in an setTimeout loop.


# dataAtlas class

This is our endpoint for data organization to unify the frontend. It creates a coordinate system (we're using MNI) to parse data into based on device type and tags. This sorts data into objects used for on-demand access, optionally runs customizable analysis functions in a loop, and can be subscribed to from the main bci object for ease of access based on device type and a tagging system. This is mostly an internally used class for th deviceStream and will evolve.

```
let atlas = new dataAtlas(
		name="atlas",
		initialData={eegshared:{eegChannelTags:[{ch: 0, tag: null},{ch: 1, tag: null}],sps:512}},
		eegConfig='10_20', //'muse','big'
		useCoherence=true,
		useAnalyzer=false,
		analysis=['eegfft'] //'eegfft','eegcoherence','bcijs_bandpowers','heg_pulse',etc
	)
```