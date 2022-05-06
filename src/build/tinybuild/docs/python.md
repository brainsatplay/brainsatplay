## [Python](https://www.python.org/) server with [Quart](https://pgjones.gitlab.io/quart/) asyncio + Threading, serving the webapp, and websockets, sse demos.

We've provided some boilerplate to spin up a Python server that can communicate with the node server or directly to the browser. It can also serve the built files and website, serve a custom REST api with direct python integration, and otherwise demonstrates a high performance python server skeleton.

We included presets to use Quart's https production server (via [hypercorn](https://pgjones.gitlab.io/hypercorn/)) as long as an ssl certificate is provided. See the top of the [`server.py`](../python/server.py) file for server settings which are configured manually.

Our python tooling documents a high performance multi-user python scenario with an order of operations shown to run simultaneous thread processes for a dedicated server thread. It's is scalable and production-ready, with enough documentation for you to find where to insert your code (hint: start with the _thread_main function and follow the queues to how the sockets get updated) and how to update SSE and Websocket queues to any connected users.

Code: [`tinybuild/python`](../python)

### Settings 
```py
## 
production = False ### For serving HTTPS, use False for HTTP and hot reloading quart (only if this file changes)
host = 'localhost' ## e.g. mywebsite.com
port = 7000
startpage = 'index.html'
base_dir = '../../' ## Example serves both templates and static files from the base dir
debug = False

config = {
    'keyfile':'node_server/ssl/key.pem',
    'certfile':'node_server/ssl/cert.pem',
    'bind':host+':'+str(port)
}


```

Then run: 
`python tinybuild/python/server.py` 

Then find `http://localhost:7000` to see the built app using the same start page the node server uses

or `http://localhost:7000/test` to see a test websocket stream from the python thread (if using our default test server routine)

For client.py `pip install websockets`


## More Information
Quart is natively asyncio but otherwise mimics flask. This means much faster concurrent (non-blocking) python server processing, and we included an example of implementing threads in python for more advanced processing needs. You can see this in action at our dedicated repo: [esbuild_base_python](https://github.com/joshbrew/esbuild_base_python). 

This is one of the highest performance Python backends you could use, and we saved you a lot of testing! See the code for line-by-line documentation.

Also, find `client.py` to test the websocket from python! The server by default streams a counter to any open websocket and SSE connections. 
