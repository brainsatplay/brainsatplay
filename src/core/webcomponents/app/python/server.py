# create thread
# create server
# stream data from threads (or cocurrent processes) to server


# In python command line:
# python server.py


## 
production = False ### For serving HTTPS, use False for HTTP and hot reloading quart (only if this file changes)
host = 'localhost' ## e.g. mywebsite.com
port = 7000
base_dir = '../' ## Example serves both templates and static files from the base dir
debug = False

config = {
    'keyfile':'node_server/ssl/key.pem',
    'certfile':'node_server/ssl/cert.pem',
    'bind':host+':'+str(port)
}

## app available at http://localhost/7000
 
import sys
import os
import asyncio
import threading
import logging
import random
import signal
from functools import wraps

#import pygame # this can log key_inputs easily

# from mangum import Mangum
from quart import Quart, make_response, render_template, render_template_string, websocket, send_from_directory
#### Also: https://pgjones.gitlab.io/quart/how_to_guides/flask_extensions.html

## For a production serve, Quart recommends hypercorn
from hypercorn.asyncio import serve
from hypercorn.config import Config


app = Quart(__name__, template_folder=base_dir, static_folder=base_dir)

## test queue which will empty when you go to /latest (it empties each time)
test_queue = asyncio.Queue() ## http://pymotw.com/2/Queue/

## Each client gets a message queue
connected_websockets = set()
connected_sse_clients = set()
admin_addr = ''
## For non-client-dependent data it is more efficient to push to a single object that all clients can access

# handler = Mangum(app)  # optionally set debug=True ### for serverless



threads = set()
exit_event = threading.Event()


## Send message to all websocket connections
async def broadcast_ws(message):
    global connected_websockets 
    for queue in connected_websockets: ## add new message to each websocket queue (created in collect_websocket)
        await queue.put(message)

####

## Send message to all event source clients
async def broadcast_sse(message):
    global connected_sse_clients 
    for queue in connected_sse_clients: ## add new message to each websocket queue (created in collect_websocket)
        await queue.put(message)
    
####

## Broadcast on all channels
async def broadcast(message):
    await broadcast_sse(message)
    await broadcast_ws(message)



######################
###### REST API ######
######################

## test route for receiving messages
@app.route('/')
async def index():
    return await render_template('python/index.html')

## Can serv the built app from quart too
@app.route('/build')
async def build():
    return await render_template('src/index.html')

# returns arbitrary files (e.g. the built app files)
@app.route('/<path:path>')
async def get_resource(path):  # pragma: no cover
    return await app.send_static_file(path)

# example to flush the main data queue to the server
@app.route('/latest')
async def dump_queue():
    ## For example: create a list
    templateString = "<ul>"
    while(test_queue.empty() == False):
        data = await test_queue.get()
        templateString += "<li>"+str(data)+"</li>"
    
    templateString += "</ul>"

    return await render_template_string(templateString)

## Error handlers

## page not found
@app.errorhandler(404)
async def pageNotFound(error):
    return await render_template_string("<h3>404: resource not found</h3>")

## resource not found
@app.errorhandler(500)
async def err500(error):
    return await  render_template_string("<div>500</div>", e=error), 500 ## this isn't quite right



################################
## Websocket server functions ## https://pgjones.gitlab.io/quart/tutorials/websocket_tutorial.html
################################

## transmitter loop, runs per-socket whenever a message is queued for that socket
async def ws_transmitter(websocket, queue):
    try: 
        if websocket and queue:
            while True:
                data = await queue.get() ## get next data on queue (created in collect_websocket)
                await websocket.send(data) ## send the queue data added on this socket
                #await websocket.send_json(data)
    except asyncio.CancelledError:
        raise 
    except KeyboardInterrupt:
        raise
##

## receiver loop, runs per-socket
async def ws_receiver(websocket):
    try:
        if websocket:
            while True:
                data = await websocket.receive() # any websocket-received data will be broadcasted to all connections
                if data == 'nodejs': 
                    admin_addr = str(websocket.remote_addr)
                    logging.info("Pong: Quart server client connected - " + str(data))
                if data == 'kill':
                    if str(websocket.remote_addr) == admin_addr:
                        logging.info('kill command received')
                        raise KeyboardInterrupt
                await broadcast(data) ## relay any received data back to all connections (test)
    except asyncio.CancelledError:
        # Handle disconnection here
        await websocket.close(1000)
    except KeyboardInterrupt:
        raise
##

### Set up an asyncio queue for each new socket connection for broadcasting data


def collect_websocket(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        global connected_websockets
        socket_rx_queue = asyncio.Queue()
        connected_websockets.add(socket_rx_queue)
        try:
            return await func(socket_rx_queue, *args, **kwargs)
        finally:
            connected_websockets.remove(socket_rx_queue)
    return wrapper
##############

## websocket setup. For each websocket created, these coroutines are added
@app.websocket('/')
@collect_websocket ## Wrapper passes the new socket's queue in
async def ws(queue):
    if debug == True: logging.info('Quart:: socket request from IP: ' + str(websocket.remote_addr))
    await websocket.accept()
    transmitter = asyncio.create_task(ws_transmitter(websocket,queue)) ## transmitter task, process outgoing messages
    receiver = asyncio.create_task(ws_receiver(websocket))      ## receiver task, process incoming messages
    await asyncio.gather(transmitter, receiver)

# JavaScript:
# var ws = new WebSocket('ws://' + document.domain + ':' + location.port + '/');
# ws.onmessage = function (event) {
#     console.log(event.data);
# };
# 
# ws.send('bob');



########################
## Server Sent Events ## https://pgjones.gitlab.io/quart/tutorials/broadcast_tutorial.html
########################
from typing import Optional

class ServerSentEvent:

    def __init__(
            self,
            data: str,
            *,
            event: Optional[str]=None,
            id: Optional[int]=None,
            retry: Optional[int]=None,
    ) -> None:
        self.data = data
        self.event = event
        self.id = id
        self.retry = retry

    def encode(self) -> bytes:
        message = f"data: {self.data}"
        if self.event is not None:
            message = f"{message}\nevent: {self.event}"
        if self.id is not None:
            message = f"{message}\nid: {self.id}"
        if self.retry is not None:
            message = f"{message}\nretry: {self.retry}"
        message = message+"\r\n\r\n"
        return message.encode('utf-8')

## Outgoing-only data via event source (more efficient than WS).
@app.route('/sse')
async def sse():
    sse_queue = asyncio.Queue()
    connected_sse_clients.add(sse_queue)
    async def send_events():
        while True:
            try:
                data = await sse_queue.get()
                event = ServerSentEvent(data)
                encoded = event.encode()
                yield encoded
            except asyncio.CancelledError:
                connected_sse_clients.remove(sse_queue)
            except KeyboardInterrupt:
                raise

    headers = {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Transfer-Encoding': 'chunked',
            'Access-Control-Allow-Origin': '*', # cross-port access
        }

    response = await make_response(
        send_events(),
        headers,    
    )
    response.timeout = None
    return response

# Javascript e.g.
# var es = new EventSource('http://localhost/sse');
# es.onmessage = function (event) {
#     console.log(event.data)
# };



#############
## Run sync for whatever reason in quart
# def run_sync(func: Callable[..., Any]) -> Callable[..., Coroutine[Any, None, None]]:
#     @wraps(func)
#     async def wrapper(*args: Any, **kwargs: Any) -> Any:
#         loop = asyncio.get_running_loop()
#         result = await loop.run_in_executor(
#             None, copy_context().run, partial(func, *args, **kwargs)
#         )
#         return result

#     return wrapper
#############

###################
## Test task to emit random numbers to each connection instead of relaying messages. e.g. replace _thread with this in thread_event_loop
async def test_transmitter(num):
    while True:
        result = str(num * random.random())
        try:
            await broadcast(result)
        except (KeyboardInterrupt, asyncio.CancelledError):       
            raise
        await asyncio.sleep(random.random())
    
    
###################


##########################
## Thread process setup ##
##########################

## Use threads to run concurrent operations with the server for better performance


## on each loop run this function
async def _thread_main(queue, ctr=0):
    
    result = "Python thread loops: " + str(ctr) ## e.g. some operation
    
    ### Example: Broadcast thread results to all connected clients
    await broadcast(result)

    ## Example: Pass results to the message queue for pulling results on any thread
    await queue.put(result)
    
    if debug == True: logging.info(result) # log result
    
    return ctr+1 # for example


## thread loop routine
async def _thread(queue, delay=2):
    try:
        ctr = 0
        while True & threading.main_thread().is_alive(): ## This should quit if the main thread quits
            if exit_event.is_set():
                break
            ctr = await _thread_main(queue, ctr)         ## Run the thread operation
            await asyncio.sleep(delay)                   ## Release the task on the thread event loop till next iteration
    except (KeyboardInterrupt, asyncio.CancelledError):
        SystemExit()
        raise


# async def check_keyinput():
#     while True:
#         pressed = pygame.key.get_pressed()
#         if pressed[pygame.K_c] and (pressed[pygame.K_LCTRL] or pressed[pygame.K_RCTRL]):
#             sys.exit(1) 
#         await asyncio.sleep(0.016666667)

## set up the thread asyncio event loop
def thread_event_loop(queue, delay=2):

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(_thread(queue,delay))

    #pygame.init() # can check simultaneous key inputs with pygame
    #loop.run_until_complete(check_keyinput()) 


def threadSetup():   

    ## logging that works on threads
    format = "%(asctime)s: %(message)s" 
    logging.basicConfig(format=format, level=logging.INFO,
                        datefmt="%H:%M:%S")
    logging.info("Thread being created")

    ## Create a thread that runs an arbitrary process concurrently with the server
    thread1 = threading.Thread(target=thread_event_loop, args=(test_queue,2,))
    thread1.daemon = True ## should kill the process
    threads.add(thread1) ## create the thread

    logging.info("Thread starting")
    thread1.start()
    logging.info("Thread running")
    
######

def signal_handler(signum, frame):
    exit_event.set()
    sys.exit(0)
    raise KeyboardInterrupt

signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)

## Customizing the app sequencing
## https://pgjones.gitlab.io/quart/how_to_guides/event_loop.html

### APP STARTUP
@app.before_serving
async def startup():
    loop = asyncio.get_event_loop() ##
    ## loop.create_task(test_transmitter(10)) ## e.g. create a concurrent process on the main thread

    threadSetup()  # set up background tasks (using threading, quart also has a background_task interface)

    ## app.smtp_server = loop.create_server(aiosmtpd.smtp.SMTP, port=1025) ### e.g. server objects can run on the event loop
   
    logging.info("Quart server starting up!")

@app.after_serving
async def shutdown():
    logging.info("Quart server shutting down!")
    exit_event.set()
    raise KeyboardInterrupt




if production == True:

    if __name__ == "__main__":
        try:
            asyncio.run(serve(app, Config.from_mapping(config)))
            #asyncio.run(serve(app, Config.from_mapping(config)))
        except (KeyboardInterrupt, asyncio.CancelledError):
            logging.info("Ended")

        sys.exit(0)
    
else: 
    if __name__ == "__main__":       
        ## FOR DEBUGGING WITH HTTP AND LIVE RELOAD
        ## MAIN, THIS IS WHAT RUNS
        try:
            app.run(host=host, port=port) # run the quart server
        except asyncio.CancelledError:
            logging.info("Ended")
    
        sys.exit(0)
    ####


