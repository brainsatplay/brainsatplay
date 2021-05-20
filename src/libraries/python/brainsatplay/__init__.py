import sys, signal
import websockets
from urllib.parse import urlparse
import json
import ssl
import asyncio
import time
import pathlib

""" TO DO
    -  Get HTTPS working
    - Get Streams working
""" 

class Brainstorm():
    """A class for interacting with The Brainstorm
    """

    def __init__(self, url='https://server.brainsatplay.com', port=None):
        self.url = url
        self.port = port
        self.username = ''
        self.password = ''
        self.appname = ''
        self.uri = ''
        self.loop = asyncio.get_event_loop()
        self.subscriptionLoop = asyncio.get_event_loop()
        self.websocket = None
        self.stream = False
        self.onStop = None

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
            if (self.port is not None): self.uri = "ws://" + o.netloc + ":" + self.port
            else: self.uri = "ws://" + o.netloc
            ctx = None

        elif (o.scheme == 'https'):
            if (self.port is not None): self.uri = "wss://" + o.netloc + ":" + self.port
            else: self.uri = "wss://" + o.netloc
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
                
        else:
            print('not a valid url scheme')
            return

        try:
            print("\n\nconnecting to {}\n\n".format(self.uri))
            self.websocket = await websockets.connect(self.uri,subprotocols=subprotocols, ssl=ctx)
        except Exception as e: 
                        print(e)
                        print('\n\nconnect call failed\n\n')
                        return
        print("\n\nconnected\n\n")
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

    def leaveSession(self,sessionid=None):
        self.subscriptionLoop.stop()
        if sessionid is not None:
            return self.sendCommand(['leaveSession',sessionid],False)
        else:
            return self.sendCommand(['leaveSession'],False)

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
        if self.websocket is not None:
            try:
                res = await self.websocket.recv()
            except websockets.exceptions.ConnectionClosed:
                print("\n\nClient disconnected.\n\n")
                self.stop()
                return

            # Parse Response
            try: 
                jsonMessage = json.loads(res)
            except:
                print('\n\nError: ' + res + '\n\n')
                return

            self.__defaults__onData(jsonMessage)

            if (subscription is None) or (subscription == jsonMessage['msg']):
                return jsonMessage
        else:
            print("\n\nClient disconnected.\n\n")

    def __defaults__onData(self,json):

        if (json['msg'] == 'resetUsername'):
            self.username = json['username']

    def sendCommand(self,cmd,checkForResponse=True):
        return self.loop.run_until_complete(self.__async__sendCommand(cmd,checkForResponse))

    async def __async__sendCommand(self, cmd, checkForResponse):
        if self.websocket is not None:
            try:
                await self.websocket.send(json.dumps({'username': self.username, 'cmd': cmd}))
            except websockets.exceptions.ConnectionClosed:
                self.stop()
                print("\n\nClient disconnected.\n\n")
                return
            
            if (checkForResponse):
                return await self.__waitForResponse()
            else:
                return 'left'
        else:
            print('\n\nno websocket connection\n\n')


    def streamData(self,data={}):
        return self.loop.run_until_complete(self.__async__streamData(data))

    async def __async__streamData(self, data):
        if self.websocket is not None:
            try:
                await self.websocket.send(json.dumps({'username': self.username, 'userData': data}))
            except websockets.exceptions.ConnectionClosed:
                print("\n\nClient disconnected.\n\n")
                self.stop()
                return   
        else:
            print('\n\nno websocket connection\n\n')

    def startStream(self,streamLoop,onStop):

        if self.websocket is not None:
            starttime = time.time()
            signal.signal(signal.SIGINT, self.stop)

            self.stream = True
            self.onStop = onStop
            while self.stream:
                data = streamLoop()
                self.streamData(data)
                time.sleep(0.1 - ((time.time() - starttime) % 0.1))

        else:
            print('\n\nno websocket connection\n\n')
        #     self.stop(onStop)


    def stop(self,signal=None,frame=None):
            self.leaveSession()
            self.stream = False
            if callable(self.onStop):
                self.onStop()
            sys.exit('\n\nYour data stream to the Brainstorm has been stopped.\n\n')


    
