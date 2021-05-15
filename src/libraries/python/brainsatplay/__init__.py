import sys, signal
import websockets
from urllib.parse import urlparse
import json
import ssl

""" TO DO
    -  Get HTTPS working
    - Get Streams working
""" 

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

    """
    Connect to the Brainstorm
    """    
    async def connect(self, username='', password=''):
        # message = {'username': username, 'cmd': []}

        self.username = username
        self.password = password

        def encodeForSubprotocol(field, value):
            return field + '&' + value.replace(' ', '')

        subprotocols = [encodeForSubprotocol('username', self.username),encodeForSubprotocol('password', self.password)]

        o = urlparse(self.url)
        if (o.scheme == 'http'):
            self.uri = "ws://" + o.netloc + ":" + self.port
            async with websockets.connect(self.uri,subprotocols=subprotocols) as self.websocket:
                return await self.__waitForResponse()
                return await self.sendCommand('ping')
        elif (o.scheme == 'https'):
            self.uri = "wss://" + o.netloc + ":" + self.port
            async with websockets.connect(self.uri,subprotocols=subprotocols, ssl=True) as self.websocket:
                return await self.__waitForResponse()
                await self.websocket.send(json.dumps({'username': self.username, 'cmd': command}))
                return await self.__waitForResponse()
                
        else:
            print('not a valid url scheme')
    
    """
    Brainstorm Commands
    """    
    async def getUserData(self,username):
       return await self.sendCommand(['getUserData',username])


    async def subscribeToUser(self,username,userProps):
        return await self.sendCommand(['subscribeToUser',username,userProps])

    async def unsubscribeFromUser(self,username,userProps):
        return await self.sendCommand(['unsubscribeFromUser',username,userProps])

    async def getSessions(self,appname):
        return await self.sendCommand(['getSessions',appname])

    async def createSession(self,appname,devices,streams):
        return await self.sendCommand(['createSession',appname,devices,props])

    async def getSessionInfo(self,sessionid):
        return await self.sendCommand(['getSessionInfo',sessionid])

    async def subscribeToSession(self,sessionid):
        return await self.sendCommand(['subscribeToSession',sessionid])

    async def leaveSession(self,sessionid):
        return await self.sendCommand(['leaveSession',sessionid])

    async def configureStreamProps(self,params=[['prop','tag']]):
        propsToSend = []
        for param in params:
	        propsToSend.append(param.join('_'))
    
        return await self.sendCommand(['addProps',propsToSend])


    """
    Low-Level Communication Methods
    """    
    async def __waitForResponse(self):
        res = await self.websocket.recv()

        # Parse Response
        try: 
            jsonMessage = json.loads(res)
        except:
            print('\n\nError: ' + res + '\n\n')
            return

        if (jsonMessage['msg'] == 'resetUsername'):
            self.username = jsonMessage['username']

        elif (jsonMessage['msg'] == 'userData'):
            for prop in jsonMessage['userData']:
                print(jsonMessage['userData'][prop])

        elif (jsonMessage['msg'] == 'sessionData'):
            for user in jsonMessage['sessionData']:
                name = user.username
                print('Data for ' + user)
                for prop in user:
                    print(user[prop])

        return jsonMessage

    async def sendCommand(self,command):
        await self.websocket.send(json.dumps({'username': self.username, 'cmd': command}))
        return await self.__waitForResponse()

    async def streamData(self,data={}):
        await self.websocket.send(json.dumps({'username': self.username, 'userData': data}))
        return await self.__waitForResponse()

    
