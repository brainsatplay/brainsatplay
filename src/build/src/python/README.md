# In Python 3 command line:

[Python](https://www.python.org/downloads/)

Make sure you have quart (`pip install quart`)



Tweak server settings at the top of `server.py`

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
`python server.py` 

Then find `http://localhost:7000` to see the built app using the same start page the node server uses

or `http://localhost:7000/test` to see a test websocket stream from the python thread (if using our default test server routine)

For client.py `pip install websockets`
