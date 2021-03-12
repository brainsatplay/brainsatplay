import asyncio
from quart import Quart, make_response, render_template, request, jsonify, abort
import serial
import threading
from typing import Optional
from serial.tools import list_ports

from sys import platform as _platform
from sys import exit, exc_info
import time

# Asyncio server sent events for streaming COM data. This is crashy
# Based on examples from the Quart gitlab. 


#NEed to fix: 
# place the serial stream in a separate thread and make the event stream simply wait for messages. The serial stream blocks the server right now

max_speed = 0.05 #  Max speed(in sec) of the event loop
byte_count = 2688 # The number of bytes to try to read before timeout
baud = 115200

app = Quart(__name__)
app.clients = set()
ser = serial.Serial()

class ServerSentEvent:

    def __init__(
            self,
            data: str,
            *,
            event: Optional[str] = None,
            id:  Optional[int] = None,
            retry:  Optional[int] = None,
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
        message = f"{message}\r\n\r\n"
        print(message)
        return message.encode('utf-8')


#FreeEEG32: 105 bytes/line. 512sps * 105 = 53760bytes/sec
#20fps updates = 2688bytes per SSE
data = ""
@app.route('/sse')
async def sse():
    async def send_events():
        while True:
            try:
                if(len(data) > 0):
                    print(data)
                    event = ServerSentEvent(data)
                    yield event.encode()    
            except:
                print(exc_info())
                #exit()
                abort(409)


    response = await make_response(
        send_events(),
        {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Transfer-Encoding': 'chunked',
        },
    )
    response.timeout = None
    return response


@app.route('/', methods=['GET'])
async def index():
    return await render_template('index.html')



@app.route('/', methods=['POST'])
async def broadcast():
    data = await request.get_json()
    print("Received: ", data["message"])
    if len(data["message"]) == 1:
        ser.write(data["message"].encode('utf-8'))
    return jsonify(True)



no_input = True
def signal_user_input():
    global no_input
    i = input("\n Press any key to stop streaming \n\n") 
    no_input = False
    if ser.is_open == True:
        ser.close()
        print("Serial port closed...")
        exit()
    # thread exits here


def serial_stream():
    while(ser.connected):
        start = time.time()
        data = ser.read(2688).decode('utf-8')     
        end = time.time()
        if (end - start) < max_speed:
            time.sleep(max_speed - (end-start))


if __name__ == "__main__":

    ports = list_ports.comports()
    if len(ports) == 0:
        print("\n No COM ports detected \n")
    else:
        print("\n Serial port options: \n")
        for i in range(len(ports)):
            print(i,": ",ports[i],"\n")

        keypress = input("\n Select a port to stream by associated number keys: \n")
        try:
            val = int(keypress)
            if val >= 0 & val < len(ports):
                ser.port = ports[val].device
                ser.baudrate = baud
                ser.timeout = 0.1
                ser.open()
                if ser.is_open == True:
                    print("Connected, running SSE...")          
                    # We're just going to wait for user input while running...
                    threading.Thread(target = signal_user_input).start() # await user input in separate thread

                    app.run()
     
        except ValueError:
            print("Invalid index! Exiting...")
            exit()
    

    
        
