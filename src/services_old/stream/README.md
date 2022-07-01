### DataStreaming class

This tool lets you create *outgoing* streams for arbitrary objects with arbitrary functions for pulling data.

```
let datastream = new DataStreaming(WebsocketClient, socketId ,userinfo={id:'jonny48613'})


datastream.setStream(
    object={key:[1,2,3],key2:0,key3:'abc'}, 		// Object we are buffering data from	settings={
	  	callback:0, 	// Default data streaming mode for all keys
		keys:['key','key2'], 	// Keys of the object we want to buffer into the stream
		key:{
			callback:0 //specific modes for specific keys, or can be custom functions
 			lastRead:0,	
		} //just dont name an object key 'keys' :P
    },
    streamName='stream1'
)
//there are default functions in place to let you stream all of the latest buffered data or 
// just single values, it will pull only the latest values off of arrays etc either as small 
// buffers or single values. 0 = stream all latest values (all values plus the latest chunks 
// of buffers, it keeps track of itself), 1 = stream single latest values (e.g. the ends of 
// arrays only plus numbers, strings, etc);

datastream.removeStream(
    'stream1',  //remove a stream by name
    'key'       //optionally just remove a single property from a stream
)

//That's all you really need to know!

datastream.addSteamFunc(name,callback=(data)=>{}); //can add named stream functions beyond the two defaults

```
