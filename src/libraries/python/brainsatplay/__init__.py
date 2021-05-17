import sys, signal
import websockets
from urllib.parse import urlparse
import json
import ssl
import asyncio

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
        self.loop = asyncio.get_event_loop()
        self.subscriptionLoop = asyncio.get_event_loop()
        self.websocket = None

    """
    Connect to the Brainstorm
    """    
    def connect(self, username='', password=''):
        # message = {'username': username, 'cmd': []}
       return self.loop.run_until_complete(self.__async__connect(username,password))

    async def __async__connect(self,username,password):
        self.username = username
        self.password = password

        def encodeForSubprotocol(field, value):
            return field + '&' + value.replace(' ', '')

        subprotocols = [encodeForSubprotocol('username', self.username),encodeForSubprotocol('password', self.password), encodeForSubprotocol('origin', 'brainsatplay.py')]

        o = urlparse(self.url)
        if (o.scheme == 'http'):
            self.uri = "ws://" + o.netloc + ":" + self.port
            self.websocket = await websockets.connect(self.uri,subprotocols=subprotocols)

        elif (o.scheme == 'https'):
            self.uri = "wss://" + o.netloc + ":" + self.port
            self.websocket = await websockets.connect(self.uri,subprotocols=subprotocols, ssl=True)
                
        else:
            print('not a valid url scheme')
            return

        print("connected to {}".format(self.uri))
        return await self.__waitForResponse()
    
    """
    Brainstorm Commands
    """    
    def getUserData(self,username):
       return self.sendCommand(['getUserData',username])


    def subscribeToUser(self,username,userProps):
        res = self.sendCommand(['subscribeToUser',username,userProps])
        self.subscriptionLoop.create_task(self.checkSubscription('userData',ondata))
        self.subscriptionLoop.run_forever()
        return res

    def unsubscribeFromUser(self,username,userProps):
        return self.sendCommand(['unsubscribeFromUser',username,userProps])

    def getSessions(self,appname):
        return self.sendCommand(['getSessions',appname])

    def createSession(self,appname,devices,props):
        return self.sendCommand(['createSession',appname,devices,props])

    def getSessionInfo(self,sessionid):
        return self.sendCommand(['getSessionInfo',sessionid])

    def subscribeToSession(self, sessionid, spectating, ondata=None):
        res = self.sendCommand(['subscribeToSession',sessionid,spectating])

        if ondata is None:
            def echo(data):
                print(data)
            ondata = echo

        self.subscriptionLoop.create_task(self.checkSubscription('sessionData',ondata))
        return res
        self.subscriptionLoop.run_forever()

    def leaveSession(self,sessionid):
        self.subscriptionLoop.stop()
        return self.sendCommand(['leaveSession',sessionid],False)

    def configureStreamProps(self,params=[['prop','tag']]):
        propsToSend = []
        for param in params:
	        propsToSend.append(param.join('_'))
    
        return self.sendCommand(['addProps',propsToSend])

    async def checkSubscription(self,subscription,ondata):
        while True:
            ondata(await self.__waitForResponse(subscription))

    """
    Low-Level Communication Methods
    """    
    async def __waitForResponse(self,subscription=None):
        res = await self.websocket.recv()

        # Parse Response
        try: 
            jsonMessage = json.loads(res)
        except:
            print('\n\nError: ' + res + '\n\n')
            return

        self.__defaults__onData(jsonMessage)

        if (subscription is None) or (subscription == jsonMessage['msg']):
            return jsonMessage

    def __defaults__onData(self,json):

        if (json['msg'] == 'resetUsername'):
            self.username = json['username']

    def sendCommand(self,cmd,checkForResponse=True):
        return self.loop.run_until_complete(self.__async__sendCommand(cmd,checkForResponse))

    async def __async__sendCommand(self, cmd, checkForResponse):
        await self.websocket.send(json.dumps({'username': self.username, 'cmd': cmd}))
        if (checkForResponse):
            return await self.__waitForResponse()
        else:
            return 'left'

    def streamData(self,data={}):
        return self.loop.run_until_complete(self.__async__streamData(data))

    async def __async__streamData(self, data):
        await self.websocket.send(json.dumps({'username': self.username, 'userData': data}))
    
