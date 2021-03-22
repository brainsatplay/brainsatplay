# brainsatplay.js

Contains the brainsatplay login/streaming class along with its dependencies in the deviceStream class and the dataAtlas class.

Create a brainsatplay session which contains many important macros for ease of use.
* `let bci = new brainsatplay(login,password)`
Log in and set whether to begin streaming data or not to true if your device is already connected and you want to begin streaming data (optional)
* `bci.login(false)`
Sign up for brainsatplay's servers:
* `bci.signup({username:'',password:''}`
For streaming data to web. Use an arrow function for the onconnect callback to subscribe to device parameters and make the UI react.
* `bci.connect("muse",['eegfft'],onconnect,true,[['eegch','FP1,'all']['eegfft','FP1','all']])`
For local only streaming
* `bci.connect("muse,['eegcoherence'],onconnect)`
Disconnect device, you can specify a device index (or just disconnect the last one connected since you are usually only using one locally) and an ondisconnect callback or leave blank.
* `bci.disconnect(0,ondisconnect)`
Send commands to the server, see the dataServer doc for available commands and expected arguments.
* `bci.sendWSCommand(command)`
Subscribe to a user's data from the server (must be logged in)
* `bci.subscribeToUser(username,['eegch','FP1'],onsuccess)`
Subscribe to a game, if you are not a spectator you must have a compatible device connected and stream parameters will be configured for you automatically. Set an onsuccess callback for UI handling, new data will be available in `bci.state.data`
* `bci.subscribeToGame(appname,spectating=false,onsuccess)`
Unsubscribe from the selected user, you can optionally only unsubscribe from selected props. This will unsubscribe any additional event listeners.
* `bci.unsubscribeFromUser(username,props=null,onsuccess)`
Leave and unsubscribe from the selected game. Set an onsuccess callback for UI handling
* `bci.unsubsribeFromGame(appname,onsuccess)`
Set the selected device (by index, leave undefined if just one device connected) to begin streaming and set any new stream parameters if needed (optional)
* `bci.beginStream(deviceIdx,streamParams)`
Subscribe to a data property in the selected device. Leave prop null to subscribe to a full data object specified by tag. Returns an index used to unsubscribe later.
* `let sub = bci.subscribe(deviceName,tag,prop,onData)`
Unsubscribe the device using the correct tag and the sub value
* `bci.unsubscribe(tag,sub)`
Remove all subscriptions for a set tag, this kills the event listener loop to save performance.
* `bci.unsubscribeAll(tag)`
Get data objects based on tag ('FP1','FP2') and device type ('eeg' or 'heg' or leave blank for eeg) 
* `bci.getData(tag,deviceType)`
Add additional callbacks for processing and sorting data as new data comes in on an event loop in the data atlas. Then you can set stream params like [prop,tag,arg1,arg2] depending on how many arguments your function requires, the prop and tag are necessary, use arg1 to specify amount of sample to use per loop (I use 'all' to grab the latest data but you need to set your own configurations)
* `bci.addAnalyzerFunc(prop,callback)`
Configure devices for streaming. You can set multiple parameters for multiple devices as params are to be specified by device 'eeg' or 'heg' etc.
* `bci.configStreamForGame(deviceNames,streamParams)`



# deviceStream class

# dataAtlas class