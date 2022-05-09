# python socket client test, will attempt to connect to the socket and receive values

import asyncio
import websockets

host = "localhost"
port = 7000

async def ws_test():
    socketURL = "ws://"+host+":"+str(port)+"/"
    print("Attempting websocket connection: ", socketURL)
    async with websockets.connect(socketURL) as websocket:
        data = await websocket.recv()
        print(data)


if __name__ == "__main__":
    asyncio.run(ws_test())