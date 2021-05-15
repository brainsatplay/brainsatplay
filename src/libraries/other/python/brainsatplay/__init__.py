import sys, signal
import websockets
from urllib.parse import urlparse
import json
import ssl

class Brainstorm():
    """A class for interacting with The Brainstorm
    """

    def __init__(self, url='server.brainsatplay.com', port='80'):
        self.url = url
        self.port = port
        self.username = ''
        self.password = ''
        self.appname = ''
        self.uri = ''
        self.websocket = None

    async def connect(self, username='', password='', appname=''):
        # message = {'username': username, 'cmd': []}

        self.username = username
        self.password = password
        self.appname = appname

        o = urlparse(self.url)
        if (o.scheme == 'http'):
            self.uri = "ws://" + o.netloc + ":" + self.port
        elif (o.scheme == 'https'):
            self.uri = "wss://" + o.netloc + ":" + self.port
        else:
            print('not a valid url scheme')

        print(self.uri)

        # async with websockets.connect(uri,subprotocols=['username&' + username,'password&' + password,'appname&' + appname]) as websocket:
        # async with websockets.connect(uri,ssl=ssl.CERT_NONE) as websocket:
        async with websockets.connect(self.uri) as self.websocket:
            
            msg = await self.websocket.recv()

            try: 
                jsonMessage = json.loads(msg)
                print('\n\n' + msg + '\n\n')
            except:
                print('\n\nError: ' + msg + '\n\n')
                return

            if (jsonMessage['msg'] == 'resetUsername'):
                self.username = jsonMessage['username']
                await self.sendCommand('ping')

    async def sendCommand(self,command):

        message = {}
        message['username'] = self.username
        message['cmd'] = command

        jsonMessage = json.dumps(message, separators=(',', ':'))

        if not self.websocket.open:
            try:
                print('Websocket is NOT connected. Reconnecting...')
                self.websocket = await websockets.connect(uri)
            except:
                print('Unable to reconnect, trying again.')

        # Send WS Message
        print(jsonMessage)
        await self.websocket.send(jsonMessage)

        res = await self.websocket.recv()

        try: 
            jsonMessage = json.loads(res)
            print('\n\n' + res + '\n\n')
        except:
            print('\n\nError: ' + res + '\n\n')
            return